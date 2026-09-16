/*
  A small GraphQL endpoint for the Playwright specs. quasar.config.ts adds this
  plugin to the dev server when QUASAR_TESTING_PLAYWRIGHT is "true". It keeps
  its items in memory for the lifetime of the dev server.
*/

import type { getTestingConfig } from "#q-app/testing";
import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";

// vite is not a dependency of the app, it arrives with @quasar/app-vite.
// Deriving the plugin type from getTestingConfig binds it to the app's own vite.
type ViteUserConfig = Awaited<ReturnType<typeof getTestingConfig>>;
type VitePlugin = Extract<
  NonNullable<ViteUserConfig["plugins"]>[number],
  { name: string }
>;

const REQUIRED_NAME_MESSAGE = "name is required";
const FAILING_OPERATION_MESSAGE = "FailingOperation always fails";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
  { id: "3", name: "Gamma" }
];

let nextId = items.length + 1;

const typeDefs = /* GraphQL */ `
  type Item {
    id: ID!
    name: String!
  }

  type Query {
    items(filter: String): [Item!]!
    itemCount: Int!
    # The authorization header of the request, so a spec can read what it sent.
    viewer: String
  }

  type Mutation {
    createItem(name: String!): Item!
    # Non-null, so the error the resolver throws sets data to null.
    fail: Boolean!
  }
`;

const resolvers = {
  Query: {
    items(_parent: unknown, { filter }: { filter?: string | null }): Item[] {
      if (typeof filter !== "string" || filter === "") {
        return items;
      }

      const needle = filter.toLowerCase();

      return items.filter(item => item.name.toLowerCase().includes(needle));
    },
    itemCount(): number {
      return items.length;
    },
    viewer(
      _parent: unknown,
      _args: unknown,
      context: { request: Request }
    ): string | null {
      return context.request.headers.get("authorization");
    }
  },
  Mutation: {
    createItem(_parent: unknown, { name }: { name: string }): Item {
      if (name === "") {
        throw new GraphQLError(REQUIRED_NAME_MESSAGE);
      }

      const item: Item = { id: String(nextId), name };
      nextId += 1;
      items.push(item);

      return item;
    },
    fail(): never {
      throw new GraphQLError(FAILING_OPERATION_MESSAGE);
    }
  }
};

// Yoga reads the response status off the request's Accept header. Browser
// fetch and Playwright's request context send "*/*", which answers 200 with
// the errors in the body. execute() needs that 200. A client sending
// "application/graphql-response+json" gets a 4xx.
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  batching: true,
  graphiql: false,
  landingPage: false,
  // Keep Yoga out of the test output.
  logging: false
});

export function graphqlServer(): VitePlugin {
  return {
    name: "test-app-graphql-server",

    configureServer(server) {
      // Registered here, so it answers before Vite's own middlewares turn
      // "GET /graphql" into the index page. Connect strips the mount path off
      // req.url and keeps req.originalUrl, which is the one Yoga reads.
      server.middlewares.use(yoga.graphqlEndpoint, yoga);
    }
  };
}
