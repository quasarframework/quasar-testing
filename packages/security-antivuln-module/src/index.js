const AntiVulnLib = require('./lib/AntiVuln')
const PackageLockFileParser = require('./lib/PackageLockFileParser')

module.exports.packageLockFileParser = function packageLockFileParser (lockFileDir) {
  return new PackageLockFileParser(lockFileDir)
}

module.exports.antiVulnLib = function antiVulnLib (lockFileDir) {
  return new AntiVulnLib(lockFileDir)
}
