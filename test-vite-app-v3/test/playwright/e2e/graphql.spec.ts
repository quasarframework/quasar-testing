import {
  createGraphqlFixture,
  GraphqlExecutionError
} from "@quasar/quasar-app-extension-testing-playwright";
import { expect, test } from "../fixtures";
import {
  CreateItemDocument,
  FailingOperationDocument,
  ListItemsDocument,
  ViewerDocument
} from "../graphql/documents";

const FAILING_OPERATION_MESSAGE = "FailingOperation always fails";

/**
 * The dev server keeps every item for its lifetime, and the config reuses a
 * running one outside CI. The test id keeps parallel tests apart, the
 * timestamp keeps one run apart from the next against the same server.
 */
function uniqueName(prefix: string) {
  return `${prefix} ${test.info().testId} ${Date.now()}`;
}

test.describe("graphql fixture", () => {
  test("execute() creates an item and returns it", async ({ graphql }) => {
    const name = uniqueName("Zeta");

    const { createItem } = await graphql.execute(CreateItemDocument, { name });

    expect(createItem.name).toBe(name);
    expect(createItem.id).not.toBe("");
  });

  test("execute() throws a GraphqlExecutionError on GraphQL errors", async ({
    graphql
  }) => {
    await expect(
      graphql.execute(FailingOperationDocument)
    ).rejects.toBeInstanceOf(GraphqlExecutionError);

    const caught = await graphql
      .execute(FailingOperationDocument)
      .catch((error: unknown) => error);

    if (!(caught instanceof GraphqlExecutionError)) {
      throw new Error(
        `Expected a GraphqlExecutionError, got ${String(caught)}`
      );
    }

    expect(caught.errors[0]?.message).toBe(FAILING_OPERATION_MESSAGE);
  });

  test("execute() refuses a name alone", async ({ graphql }) => {
    await expect(graphql.execute("ListItems")).rejects.toThrow(
      'graphql.execute() needs a document, "ListItems" is only a name.'
    );
  });

  test("arranges state through the API, then asserts through the UI", async ({
    graphql,
    page
  }) => {
    const name = uniqueName("Omega");
    await graphql.execute(CreateItemDocument, { name });

    const waiting = graphql.waitForOperation(ListItemsDocument);
    await page.goto("/#/graphql");
    const { data } = await waiting;

    expect(data?.items.some(item => item.name === name)).toBe(true);
    await expect(
      page.getByTestId("item").filter({ hasText: name })
    ).toBeVisible();
  });

  test.describe("with default headers", () => {
    test.use({
      graphqlHeaders: { authorization: "Bearer bed", "x-tenant": "one" }
    });

    test("execute() sends them", async ({ graphql }) => {
      const { viewer } = await graphql.execute(ViewerDocument);

      expect(viewer).toBe("Bearer bed");
    });

    test("a per-call header overrides one of them", async ({ graphql }) => {
      const { viewer } = await graphql.execute(
        ViewerDocument,
        {},
        { headers: { authorization: "Bearer other" } }
      );

      expect(viewer).toBe("Bearer other");
    });

    test("defaultHeaders false sends none of them", async ({ graphql }) => {
      const { viewer } = await graphql.execute(
        ViewerDocument,
        {},
        { defaultHeaders: false }
      );

      expect(viewer).toBeNull();
    });
  });

  test("createGraphqlFixture() serves a second page", async ({
    context,
    baseURL
  }) => {
    const second = await context.newPage();
    const other = createGraphqlFixture(second, { baseURL });

    await other.mock(ListItemsDocument, {
      data: { items: [{ id: "x", name: "Second page" }] }
    });
    await second.goto("/#/graphql");

    await expect(second.getByTestId("item")).toHaveText(["Second page"]);
    // page.route() does not intercept page.request, so this reaches the server.
    await expect(other.execute(ViewerDocument)).resolves.toEqual({
      viewer: null
    });

    await second.close();
  });
});
