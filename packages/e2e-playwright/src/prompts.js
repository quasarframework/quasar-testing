import { enforcedDevServerPort } from './shared.js';

export default function () {
  return [
    {
      name: 'port',
      type: 'text',
      required: true,
      default: enforcedDevServerPort,
      message: 'Set the port from which to serve the app:',
    },
    {
      name: 'githubWorkflow',
      type: 'confirm',
      required: true,
      default: true,
      message: 'Do you want to add a GitHub workflow for your CI?',
    },
    {
      name: 'installBrowsers',
      type: 'confirm',
      required: true,
      default: false,
      message:
        "Install Playwright browsers (can be done manually via 'npx exec playwright install')?",
    },
    {
      name: 'enableCodeCoverage',
      type: 'confirm',
      required: true,
      default: false,
      message: 'Do you want to enable code coverage?',
    },
  ];
}
