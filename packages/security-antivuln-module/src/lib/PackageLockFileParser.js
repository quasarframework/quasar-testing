const path = require('path')
const fs = require('fs-extra')
const lockfile = require('@yarnpkg/lockfile')

module.exports = class PackageLockFileParser {

  /**
   * Sets up default parsers
   * @param {String} lockFileDir - Scope the default parsers file location.
   */
  constructor (lockFileDir) {
    this._parsers = []
    if (lockFileDir !== void 0) {
      this.registerParser(path.join(lockFileDir, 'yarn.lock'), this.parseYarnLock.bind(this))
      this.registerParser(path.join(lockFileDir, 'package-lock.json'), this.parseNpmLock.bind(this))
    }
  }

  /**
   * Get the package from the key provided
   * @example
   * // returns "babel-plugin-throws-helper"
   * getPackageFromKey('@ava/babel-plugin-throws-helper@^3.0.0')
   * @param {String} packageMunge
   * @returns {*|string}
   */
  getPackageFromKey (packageMunge) {
    let result = packageMunge
    if (result[0] === '@') result = packageMunge.substring(1)
    if (result.includes('/')) result = result.split('/')[1]
    if (result.includes('@')) result = result.split('@')[0]
    return result
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
    this._parsers.push({
      filePath,
      fn
    })
  }

  /**
   * Removes a registered parser
   * @param {string} filePath - Must be the full path to the lock / package file.
   */
  unregisterParser (filePath) {
    const parser = this._parsers.find(f => {
      return f.filePath === filePath
    })

    if (parser !== void 0) {
      this._parsers.splice(this._parsers.indexOf(parser), 1)
    }
  }

  getParsers () {
    return this._parsers
  }

  /**
   * @typedef {Object} ParserResult
   * @property {string} lockFile - The full path to the package file used
   * @property {Array.<PackageDefinition>} packages -
   */
  /**
   *
   * @returns {Array.<ParserResult>]}
   */
  parse () {
    let result = []

    for (let parser of this._parsers) {
      result.push({
        lockFile: parser.filePath,
        packages: parser.fn(parser.filePath)
      })
    }

    return result
  }

  /**
   * Function to parse a yarn.lock file.
   * @param {String} filePath - Path to the lock file.
   * @returns {Array.<PackageDefinition>}
   */
  parseYarnLock (filePath) {
    let result = []

    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf8')
      const json = lockfile.parse(file)
      for (let key in json.object) {
        result.push({
          name: this.getPackageFromKey(key),
          version: json.object[key].version
        })
      }

      return result
    }
  }

  /**
   * Function to parse a package-lock.json file.
   * @param {String} filePath - Path to the lock file.
   * @returns {Array.<PackageDefinition>}
   */
  parseNpmLock (filePath) {
    let result = []

    if (fs.existsSync(filePath)) { // Else build a list of npm packages.
      const json = require(filePath)
      for (let key in json.dependencies) {
        result.push({
          name: this.getPackageFromKey(key),
          version: json.dependencies[key].version
        })
      }
    }

    return result
  }

}
