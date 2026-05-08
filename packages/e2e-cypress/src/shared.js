module.exports.enforcedDevServerPort = 8080;

// app-vite 2.5.0 switches to Vite 8, which requires Cypress 15.14+ for component testing support
// See https://github.com/quasarframework/quasar-testing/issues/412
const quasarAppViteUsingVite8 = '^2.5.0';

module.exports.enforcedCypress15Vite8Compatibility = (api) => {
    // app-vite v2.4.x uses Vite 7, which is not supported by Cypress AE v6.3+
    // due to Sass/tsx incompatibilities and the lack of Vite 8 support in Cypress <15.14.
    // Users must upgrade to app-vite 2.5.0+ (Vite 8) + Cypress 15.14+.
    // See https://github.com/quasarframework/quasar-testing/issues/401
    // See https://github.com/quasarframework/quasar-testing/issues/412
    if (api.hasPackage('@quasar/app-vite', '>=2.4.0 <2.5.0')) {
        api.compatibleWith('@quasar/app-vite', '^2.5.0');
    }

    // app-vite v2.5.0 switches to Vite 8, which requires Cypress v15.14+
    if (api.hasPackage('@quasar/app-vite', quasarAppViteUsingVite8)) {
        api.compatibleWith('cypress', '^15.14.0');
    }

    // Cypress v15.14+ requires Vite 8 for component testing,
    // so if the user has Cypress v15.14+, we need to ensure they are also using app-vite 2.5+.
    if (api.hasPackage('cypress', '^15.14.0')) {
        api.compatibleWith('@quasar/app-vite', quasarAppViteUsingVite8);
    }
};