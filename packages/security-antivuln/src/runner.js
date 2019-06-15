const AntiVuln = require('@quasar/security-antivuln').antiVulnLib

module.exports = (api, resolve) => {
  const antiVuln = AntiVuln(api.appDir)
  antiVuln.run().then(() => {
    resolve()
  }).catch(() => {
    process.exit(0)
  })
}
