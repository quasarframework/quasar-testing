module.exports.enforcedDevServerPort = 8080;

// TODO: app-vite doesn't yet force Vite 7.2+, we should release a new version that does and add update it here and above
const quasarAppViteUsingVite7 = "^2.4.0";

module.exports.enforcedCypress15Vite7Compatibility = (api) => {
    // app-vite v2.4.0 switches to Vite 7, which requires Cypress v15
    if (api.hasPackage('@quasar/app-vite', quasarAppViteUsingVite7)) {
        api.compatibleWith('cypress', '^15.0.0');
    }

    // Cypress v15 drops support for Vite versions below v5, but it actually requires Vite 7.2+
    // So if the user has Cypress v15, we need to ensure they are also using a proper @quasar/app-vite version
    // See https://github.com/quasarframework/quasar-testing/issues/401
    if (api.hasPackage('cypress', '^15.0.0')) {
        api.compatibleWith('@quasar/app-vite', quasarAppViteUsingVite7);
    }
};