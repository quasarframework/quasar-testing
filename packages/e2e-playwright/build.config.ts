import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    outDir: 'dist',

    entries: [
        './src/main',
        './src/ct/main',
    ],

    // Generate TypeScript declaration files (.d.ts) for all entries.
    declaration: true,

    // Will remove the output directory before building.
    clean: true,

    // This ensures that unbuild will not try to compile these packages. We have to also ensure to set them
    // as peerDependencies in package.json. 
    externals: ['@playwright/experimental-ct-vue', '@playwright/test'],

    // There is some strange warning about missing package.json. It doesn't affect the build however.
    // It is most likely a false positive. So for now, let's not fail the build on this warning.
    // See: https://github.com/unjs/unbuild/issues/268
    failOnWarn: false
});
