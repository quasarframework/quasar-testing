import type { ItemCountData } from "./graphql/documents";

// The string form of the fixture reads its types from here.
declare module "@quasar/quasar-app-extension-testing-playwright" {
  interface GraphqlOperations {
    ItemCount: { data: ItemCountData; variables: Record<string, never> };
  }
}
