const AntiVuln = require('./AntiVuln')

module.exports = (api, resolve) => {
  const antiVuln = new AntiVuln(api)
  antiVuln.run().then(() => {
    resolve()
  }).catch(() => {
    process.exit(0)
  })
}
