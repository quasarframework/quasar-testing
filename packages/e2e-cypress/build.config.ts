import { defineBuildConfig } from 'obuild/config';

// cypress, quasar and vue reach consumers through the host project, so they are not
// listed dependencies and obuild does not auto-externalize them.
const external = [
  /^cypress(\/|$)/,
  /^@quasar\/app-vite(\/|$)/,
  'quasar',
  'vue',
  // vite reaches consumers transitively, its types feed getTestingConfig's return type
  'vite',
];

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/helpers/main.ts', './src/helpers/cct-dev-server/index.ts'],
      // the exports map points the types condition at the TS source, which carries the
      // declare-global command augmentations that generated declarations drop
      dts: false,
      rolldown: { external },
    },
  ],
});
