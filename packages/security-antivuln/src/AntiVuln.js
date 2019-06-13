const axios = require('axios')
const path = require('path')
const fs = require('fs-extra')
const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver')
const chalk = require('chalk')

module.exports = class AntiVuln {
  constructor (api) {
    this._api = api
    this._outputPath = path.join(this._api.appDir, 'test', 'audits', 'security', 'antivuln')
    this._badPackagesFileName = 'bad.packages.result.json'
    this._advisoriesUrl = 'https://www.npmjs.com/advisories/?page=0&perPage=100000'
  }

  logWarning (advisoryPackage) {
    console.log(
      chalk`
 {bold
 {bgRed Security Alert:} [{red ${advisoryPackage.severity}}] [{red ${advisoryPackage.name}}]
  Type: {green ${advisoryPackage.title}}
  Advisory Version: {green ${advisoryPackage.version}}
  Current version: {green ${advisoryPackage.currentVersion}}
  Recommendation: {green ${advisoryPackage.recommendation}}
  Url: {bgGreen ${advisoryPackage.url}}
  Detail: {green ${advisoryPackage.overview}}
 }
`
    )
  }

  // This will return just the package name from the package string i.e
  // @ava/babel-plugin-throws-helper@^3.0.0 will return "babel-plugin-throws-helper"
  // @ava/babel-plugin-throws-helper will return "babel-plugin-throws-helper"

	/**
	 * Get the package from the key provided
	 * @example
	 * // returns "babel-plugin-throws-helper"
	 * getPackageFromKey('@ava/babel-plugin-throws-helper@^3.0.0')
	 * @param {String} key
	 * @returns {*|string}
	 */
  getPackageFromKey (key) {
    let result = key
    if (result[0] === '@') result = key.substring(1)
    if (result.includes('/')) result = result.split('/')[1]
    if (result.includes('@')) result = result.split('@')[0]
    return result
  }

  logFile (fileName, content) {
    const filePath = path.join(this._outputPath, fileName)

    fs.mkdirSync(this._outputPath, {recursive: true})
    fs.writeFileSync(filePath, JSON.stringify(content))

    if (content.length) {
      console.log(`Saved results to ${filePath}.`)
    }
  }

  getAdvisories () {
    return new Promise((resolve, reject) => {
      // Get a list of our advisories.
      axios({
        method: 'get',
        url: this._advisoriesUrl,
        responseType: 'json',
        headers: {'X-Spiferack': '1'}, // This causes the data to come back in JSON
        timeout: 5000
      }).then(response => {
        const yarnLockPath = path.join(this._api.appDir, 'yarn.lock')
        const npmLockPath = path.join(this._api.appDir, 'package-lock.json')
        let advisoryPackages = []
        let currentPackages = []
        let badPackages = []

        // Build a list of dependencies that have advisories
        for (let advisory of response.data.advisoriesData.objects) {
          advisoryPackages.push({
            name: advisory.module_name,
            version: advisory.vulnerable_versions,
            title: advisory.title,
            recommendation: advisory.recommendation,
            severity: advisory.severity,
            overview: advisory.overview,
            url: advisory.url
          })
        }

        // If a yarn lock file is being used, build a list of installed packages.
        if (fs.existsSync(yarnLockPath)) {
          console.log(chalk` {green Checking yarn.lock dependencies.}`)
          let file = fs.readFileSync(yarnLockPath, 'utf8')
          let json = lockfile.parse(file)
          for (let key in json.object) {
            currentPackages.push({
              name: this.getPackageFromKey(key),
              version: json.object[key].version
            })
          }
        } else if (fs.existsSync(npmLockPath)) { // Else build a list of npm packages.
          console.log(chalk` {green Checking package-lock.json dependencies.}`)
          let json = require(npmLockPath)
          for (let key in json.dependencies) {
            currentPackages.push({
              name: this.getPackageFromKey(key),
              version: json.dependencies[key].version
            })
          }
        }

        // Compare advisories vs installed packages and see if the version is a bad one.
        for (let currentPackage of currentPackages) {
          for (let advisoryPackage of advisoryPackages) {
            const badPackage =
              currentPackage.name === advisoryPackage.name &&
              semver.satisfies(currentPackage.version, advisoryPackage.version)

            if (badPackage) {
              // Make sure we're only adding one to the bad packages.
              const existingPackage = badPackages.find(f => {
                return f.name === advisoryPackage.name && f.version === advisoryPackage.version
              })

              if (existingPackage === void 0) {
                badPackages.push({
                  ...advisoryPackage,
                  currentVersion: currentPackage.version
                })
              }
            }
          }
        }

        resolve(badPackages)
      }).catch(err => {
        reject(err)
      })
    })
  }

  run () {
    return new Promise(resolve => {
      return this.getAdvisories().then(advisoryPackages => {
        // Write out our result even if it's empty - this shows it's been run.
        let logResult = {
          status: advisoryPackages.length > 0 ? 'fail' : 'success',
          runAt: Math.floor(Date.now() / 1000),
          totalAdvisories: advisoryPackages.length,
          advisories: advisoryPackages
        }

        for (let advisoryPackage of advisoryPackages) {
          this.logWarning(advisoryPackage)
        }

        this.logFile(this._badPackagesFileName, logResult)

        if (advisoryPackages.length > 0) {
          resolve(logResult)
        } else {
          console.log(
            chalk`
          {bold \n{bgBlue  Success: } No advisories for any dependencies.\n}
        `
          )

          resolve()
        }
      })
    })
  }
}
