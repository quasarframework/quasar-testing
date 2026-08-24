import { defineBuildConfig } from 'obuild/config';

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/config.ts'],
      // vite reaches consumers transitively through vitest, so it is not a
      // listed dependency and obuild does not auto-externalize it.
      rolldown: { external: ['vite'] },
    },
  ],
});
