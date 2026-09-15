import { defineBoot } from "#q-app";

// See src/components/gallery-check/ and test/playwright/components/GalleryCheck.spec.ts
export default defineBoot(context => {
  const { app, urlPath, publicPath } = context;

  app.provide("galleryBootUrlPath", urlPath);
  app.provide("galleryBootPublicPath", publicPath);
  app.provide("galleryBootParamKeys", Object.keys(context).sort().join(","));
  app.provide(
    "galleryBootFlag",
    String(globalThis.__QUASAR_PLAYWRIGHT_GALLERY__)
  );
});
