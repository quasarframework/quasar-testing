const axios = require('axios')
const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')
const chalk = require('chalk')
const PackageLockFileParser = require('./PackageLockFileParser')

module.exports = class AntiVuln {

  /**
   * @param {String} lockFileDir - Scope the default parsers file location.
   */
  constructor (lockFileDir) {
    this._lockFileDir = lockFileDir
    this._outputPath = path.join(lockFileDir, 'test', 'audits', 'security', 'antivuln')
    this._badPackagesFileName = 'bad.packages.result.json'
    this._advisoriesUrl = 'https://www.npmjs.com/advisories/?page=0&perPage=100000'
    this._packageLockParser = new PackageLockFileParser(lockFileDir)
  }

  /**
   * @typedef {Object} AdvisoryPackage
   * @property {string} name - The package name
   * @property {string} version - The advisory version
   * @property {string} severity - The severity of the issue
   * @property {string} title - The type of advisory
   * @property {string} currentVersion - The version that is currently installed
   * @property {string} recommendation - The recommended action to resolve this issue
   * @property {string} url - The NPM package advisory url
   * @property {string} overview - An overview of the issue.
   */
  /**
   * @param {AdvisoryPackage} advisoryPackage - The package used to build the message
   */
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

  /**
   * Save a file with some JSON content
   * @param {string} fileName - The name of the file to be saved.
   * @param {Object} content - The data you want saved to the file (will be run through JSON.stringify())
   */
  logFile (fileName, content) {
    const filePath = path.join(this._outputPath, fileName)

    fs.mkdirSync(this._outputPath, {recursive: true})
    fs.writeFileSync(filePath, JSON.stringify(content))

    if (content.length) {
      console.log(`Saved results to ${filePath}.`)
    }
  }

  /**
   * @typedef {Object} PackageDefinition
   * @property {string} name - The package name
   * @property {string} version - The package version
   */
  /**
   * @callback parserFunction
   * @returns {Array.<PackageDefinition>
   */
  /**
   * Registers a new parser
   * @param {string} filePath - Must be the full path to the lock / package file.
   * @param {parserFunction} fn - The function that processes the lock file
   */
  registerParser (filePath, fn) {
    this._packageLockParser.registerParser(filePath, fn)
  }

  /**
   * Unregisters a previously registered parser.
   * @param {string} filePath - Must be the full path to the lock / package file.
   */
  unregisterParser (filePath) {
    this._packageLockParser.unregisterParser(filePath)
  }

  /**
   * Return a list of advisory packages from NPM
   * @returns {Array.<AdvisoryPackage>}
   */
  getAdvisories () {
    return axios({
      method: 'get',
      url: this._advisoriesUrl,
      responseType: 'json',
      headers: {'X-Spiferack': '1'}, // This causes the data to come back in JSON
      timeout: 5000
    }).then(response => {
      let result = []

      for (let advisory of response.data.advisoriesData.objects) {
        result.push({
          name: advisory.module_name,
          version: advisory.vulnerable_versions,
          title: advisory.title,
          recommendation: advisory.recommendation,
          severity: advisory.severity,
          overview: advisory.overview,
          url: advisory.url
        })
      }

      return result
    })
  }

  /**
   * Gets the bad dependency list from NPM and compares them with locally installed ones.
   * @returns {Promise.<Array.<AdvisoryPackage>>}
   */
  getAdvisoryPackages () {
    return new Promise((resolve, reject) => {
      // Get a list of our advisories.
      this.getAdvisories().then(advisoryPackages => {
        let badPackages = []

        let lockResults = this._packageLockParser.parse()
        for (let result of lockResults) {
          console.log(chalk` {green Checking ${result.lockFile.replace(this._lockFileDir, '')} dependencies.}`)

          for (let currentPackage of result.packages) {
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
        }

        resolve(badPackages)
      }).catch(err => {
        reject(err)
      })
    })
  }

  /**
   * @typedef {Object} AdvisoryPackageResult
   * @property {string} status - fail or success
   * @property {string} runAt - A unix timestamp of when the routine was run
   * @property {Number} totalAdvisories - Total advisories returned
   * @property {Array.<AdvisoryPackage>} advisories - The actual advisories
   */
  /**
   * The main routine to report on advisory packages installed.
   * @returns {Promise.<AdvisoryPackageResult>}
   */
  run () {
    return new Promise(resolve => {
      return this.getAdvisoryPackages().then(advisoryPackages => {
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
