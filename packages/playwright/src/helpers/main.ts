import { expect as baseExpect, mergeTests } from '@playwright/test';
import { graphqlTest } from './fixtures/graphql';
import { test as quasarTest } from './fixtures/quasar';
import { colorMatchers } from './matchers/color';
import { routeMatchers } from './matchers/route';

export { createGraphqlFixture } from './fixtures/graphql';
export { createQuasarFixture } from './fixtures/quasar';
export { GraphqlExecutionError } from './graphql/execute';
export type { QuasarFixture, QuasarWorkerOptions } from './fixtures/quasar';
export type { GraphqlFixture, GraphqlOptions } from './fixtures/graphql';
export type { DateInput, DateParts } from './quasar/date';
export type {
  CloseDialogVia,
  DialogOptions,
  WithinDialogOptions,
} from './quasar/dialog';
export type { MenuOptions, OpenMenuOptions } from './quasar/menu';
export type { PickOptions, PickValue, SelectHandle } from './quasar/select';
export type {
  DataOf,
  DefinitionLike,
  GraphqlOperations,
  OperationDescriptor,
  OperationDocument,
  OperationName,
  ResolvedOperation,
  SelectionLike,
  VariablesOf,
} from './graphql/document';
export type { GraphqlEndpoint } from './graphql/endpoint';
export type { ExecuteOptions } from './graphql/execute';
export type {
  MockHandle,
  MockOptions,
  MockResolver,
  MockResponse,
  UnmockedPolicy,
} from './graphql/mock';
export type { GraphqlError, GraphqlResult } from './graphql/response';
export type {
  OperationResponse,
  WaitForOperationOptions,
} from './graphql/wait';
export type { ColorMatcherOptions } from './matchers/color';
export type { RouteMatcherOptions } from './matchers/route';

/** The Quasar helpers, the coverage collector and the GraphQL fixture on one test object. */
export const test = mergeTests(quasarTest, graphqlTest);

/**
 * Playwright's expect with the Quasar matchers. The scaffolded fixtures file
 * re-exports it. It types each matcher on its receiver: toHaveRoute on a Page,
 * toHaveColor and toHaveBackgroundColor on a Locator.
 */
export const expect = baseExpect.extend({
  ...colorMatchers,
  ...routeMatchers,
});
