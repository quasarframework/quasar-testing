import type {
  GraphqlFixture,
  MockOptions
} from "@quasar/quasar-app-extension-testing-playwright";
import { expect, test } from "../fixtures";
import { CreateItemDocument, ListItemsDocument } from "../graphql/documents";

const DEFAULT_STORY = "components/graphql/GraphqlList/Default";
const FILTERED_STORY = "components/graphql/GraphqlList/Filtered";
const BATCHED_STORY = "components/graphql/GraphqlList/Batched";
const GET_STORY = "components/graphql/GraphqlList/Get";

// Longer than a mount takes, so the loading state is still on screen after it.
const ANSWER_DELAY = 800;
const MOCKED_ITEM_COUNT = 7;
const OK_STATUS = 200;

// The dev server starts with Alpha, Beta and Gamma, and keeps every item a
// test creates. Only this lower bound holds.
const SEEDED_ITEM_COUNT = 3;

/**
 * Registers a list mock answering "Always", a later one answering "Once", and
 * a create mock. Returns the handle of the "Once" mock.
 */
async function mockTwoLists(graphql: GraphqlFixture, options?: MockOptions) {
  await graphql.mock(ListItemsDocument, {
    data: { items: [{ id: "1", name: "Always" }] }
  });
  const once = await graphql.mock(
    ListItemsDocument,
    { data: { items: [{ id: "2", name: "Once" }] } },
    options
  );
  await graphql.mock(CreateItemDocument, {
    data: { createItem: { id: "3", name: "New" } }
  });

  return once;
}

test.describe("graphql fixture", () => {
  test("renders mocked data", async ({ mount, graphql }) => {
    await graphql.mock(ListItemsDocument, {
      data: { items: [{ id: "1", name: "Mocked" }] }
    });

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("item")).toHaveText(["Mocked"]);
  });

  test("renders the empty state", async ({ mount, graphql }) => {
    await graphql.mock(ListItemsDocument, { data: { items: [] } });

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("empty")).toBeVisible();
  });

  test("renders GraphQL errors", async ({ mount, graphql }) => {
    await graphql.mock(ListItemsDocument, { errors: [{ message: "Boom" }] });

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("error")).toHaveText("Boom");
  });

  test("shows the loading state while a delayed mock answers", async ({
    mount,
    graphql
  }) => {
    await graphql.mock(
      ListItemsDocument,
      { data: { items: [{ id: "1", name: "Late" }] } },
      { delay: ANSWER_DELAY }
    );

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("loading")).toBeVisible();
    await expect(component.getByTestId("item")).toHaveCount(1);
  });

  test("records the variables of every call", async ({ mount, graphql }) => {
    const handle = await graphql.mock(ListItemsDocument, () => ({
      data: { items: [] }
    }));

    const component = await mount(FILTERED_STORY);

    await expect(component.getByTestId("empty")).toBeVisible();
    expect(handle.calls).toEqual([{ filter: "al" }]);
  });

  test("waitForCall gives the variables of a mutation", async ({
    mount,
    graphql
  }) => {
    await graphql.mock(ListItemsDocument, { data: { items: [] } });
    // variables.name is a string here, read from the document.
    const handle = await graphql.mock(CreateItemDocument, ({ variables }) => ({
      data: { createItem: { id: "9", name: variables.name } }
    }));

    const component = await mount(DEFAULT_STORY);

    await component.getByTestId("name-input").fill("Delta");
    await component.getByTestId("create-button").click();

    await expect(handle.waitForCall()).resolves.toEqual({ name: "Delta" });
  });

  test("the last mock answers and times expires it", async ({
    mount,
    graphql
  }) => {
    await mockTwoLists(graphql, { times: 1 });

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("item")).toHaveText(["Once"]);

    // The create reloads the list. The mock with times: 1 is gone by then.
    await component.getByTestId("name-input").fill("New");
    await component.getByTestId("create-button").click();

    await expect(component.getByTestId("item")).toHaveText(["Always"]);
  });

  test("remove() gives the earlier mock back", async ({ mount, graphql }) => {
    const once = await mockTwoLists(graphql);

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("item")).toHaveText(["Once"]);

    once.remove();

    await component.getByTestId("name-input").fill("New");
    await component.getByTestId("create-button").click();

    await expect(component.getByTestId("item")).toHaveText(["Always"]);
  });

  test("answers a batched request item by item", async ({ mount, graphql }) => {
    await graphql.mock(ListItemsDocument, {
      data: { items: [{ id: "1", name: "Batched" }] }
    });
    // The string form reads its data type from the GraphqlOperations registry.
    await graphql.mock("ItemCount", { data: { itemCount: MOCKED_ITEM_COUNT } });

    const component = await mount(BATCHED_STORY);

    await expect(component.getByTestId("count")).toHaveText(
      String(MOCKED_ITEM_COUNT)
    );
    await expect(component.getByTestId("item")).toHaveText(["Batched"]);
  });

  test("answers a GET request", async ({ mount, graphql }) => {
    const handle = await graphql.mock(ListItemsDocument, {
      data: { items: [{ id: "1", name: "From GET" }] }
    });

    const component = await mount(GET_STORY);

    await expect(component.getByTestId("item")).toHaveText(["From GET"]);
    expect(handle.calls).toEqual([{}]);
  });

  test("an operation without a mock fails the test", async ({
    mount,
    graphql
  }) => {
    // The fixture teardown throws for the unmocked ListItems. That is the
    // failure this test expects.
    test.fail();

    await graphql.mock("ItemCount", { data: { itemCount: MOCKED_ITEM_COUNT } });

    const component = await mount(DEFAULT_STORY);

    await expect(component.getByTestId("error")).toContainText(
      'No mock for GraphQL operation "ListItems"'
    );
  });

  test.describe("with passthrough", () => {
    test.use({ graphqlUnmocked: "passthrough" });

    test("lets an unmocked operation reach the server", async ({
      mount,
      graphql
    }) => {
      await graphql.mock(CreateItemDocument, {
        data: { createItem: { id: "9", name: "Mocked" } }
      });

      const component = await mount(DEFAULT_STORY);

      // Another test may have created items on the shared dev server, so only
      // the first three names are stable.
      await expect(component.getByTestId("item")).toContainText([
        "Alpha",
        "Beta",
        "Gamma"
      ]);
    });
  });

  test("waitForOperation reads a POST response", async ({ mount, graphql }) => {
    const waiting = graphql.waitForOperation(ListItemsDocument);

    await mount(DEFAULT_STORY);

    const { data, errors, response } = await waiting;
    // The annotation is a compile-time check of what the document gives.
    const firstName: string | undefined = data?.items[0]?.name;

    expect(errors).toBeUndefined();
    expect(response.status()).toBe(OK_STATUS);
    expect(data?.items.length).toBeGreaterThanOrEqual(SEEDED_ITEM_COUNT);
    expect(firstName).toBe("Alpha");
  });

  test("waitForOperation reads one item of a batched response", async ({
    mount,
    graphql
  }) => {
    const waiting = graphql.waitForOperation("ItemCount");

    await mount(BATCHED_STORY);

    const { data } = await waiting;

    expect(typeof data?.itemCount).toBe("number");
  });

  test("waitForOperation returns GraphQL errors instead of throwing", async ({
    mount,
    graphql
  }) => {
    await graphql.mock(ListItemsDocument, { errors: [{ message: "Boom" }] });

    const waiting = graphql.waitForOperation(ListItemsDocument);

    await mount(DEFAULT_STORY);

    const { errors } = await waiting;

    expect(errors?.[0]?.message).toBe("Boom");
  });
});
