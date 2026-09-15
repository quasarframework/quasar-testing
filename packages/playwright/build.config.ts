import { defineBuildConfig } from 'obuild/config';

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/helpers/main.ts'],
      // the exports map points the types condition at the TS source
      dts: false,
    },
    {
      type: 'bundle',
      input: ['./src/gallery/index.ts'],
      dts: false,
    },
  ],
});
