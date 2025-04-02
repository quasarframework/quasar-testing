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
      type: 'text',
      required: true,
      default: 'y/N',
      message: 'Do you want to add a GitHub workflow for your CI?',
    },
    {
      name: 'installBrowsers',
      type: 'text',
      required: true,
      default: 'y/N',
      message:
        "Install Playwright browsers (can be done manually via 'npx exec playwright install')?",
    },
    {
      name: 'enableCodeCoverage',
      type: 'text',
      required: true,
      default: 'y/N',
      message: 'Do you want to enable code coverage?',
    },
  ];
}
