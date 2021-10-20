/* eslint-env node */
// ***********************************************************
// This example plugins/index.ts can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// cypress/plugins/index.ts
import generateWebpackConfig from 'app/test/cypress/helpers/generateWebpackConfig';
import { startDevServer } from '@cypress/webpack-dev-server';

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('dev-server:start', async (options) => {
    const webpackConfig = await generateWebpackConfig();
    return startDevServer({
      options,
      webpackConfig: webpackConfig.renderer,
    });
  });

  return config;
};

export default pluginConfig;