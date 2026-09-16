import type { APIResponse } from '@playwright/test';
import {
  resolveOperation,
  type OperationDescriptor,
  type OperationDocument,
} from './document';
import { isRecord } from './is-record';
import { readGraphqlResult, type GraphqlError } from './response';

export interface ExecuteOptions {
  /** Merged on top of the graphqlHeaders option, key by key. */
  headers?: Record<string, string>;
  /** false sends none of the graphqlHeaders option, for an anonymous call. */
  defaultHeaders?: boolean;
}

export class GraphqlExecutionError extends Error {
  readonly operationName: string;
  readonly errors: readonly GraphqlError[];
  readonly response: APIResponse;

  constructor(
    operationName: string,
    errors: readonly GraphqlError[],
    response: APIResponse,
  ) {
    super(
      `GraphQL operation "${operationName}" returned errors: ${JSON.stringify(errors, undefined, 2)}`,
    );
    this.name = 'GraphqlExecutionError';
    this.operationName = operationName;
    this.errors = errors;
    this.response = response;
  }
}

/** The part of the fixture execute() drives. A test passes a literal. */
interface ExecuteContext {
  post(
    url: string,
    body: {
      operationName: string;
      query: string;
      variables: Record<string, unknown>;
    },
    headers: Record<string, string> | undefined,
  ): Promise<APIResponse>;
  /** Resolves the URL on every call, so a config error surfaces in the test that calls execute(). */
  resolveUrl(): string;
  /** The headers of every call. The fixture passes the graphqlHeaders option. */
  defaultHeaders: Record<string, string>;
  printDocument(document: OperationDocument): Promise<string>;
}

async function importGraphql() {
  try {
    return await import('graphql');
  } catch (error) {
    throw new Error(
      'graphql.execute() prints the document with the "graphql" package, which is not installed. Add it to the devDependencies of the project.',
      { cause: error },
    );
  }
}

/** Prints with the graphql package, loaded on demand. */
export async function printWithGraphql(
  document: OperationDocument,
): Promise<string> {
  const { print } = await importGraphql();

  return print(document as Parameters<typeof print>[0]);
}

export async function execute(
  context: ExecuteContext,
  descriptor: OperationDescriptor,
  variables: Record<string, unknown> = {},
  options: ExecuteOptions = {},
): Promise<unknown> {
  const { name, rootField, document } = resolveOperation(descriptor);
  if (document === undefined) {
    throw new Error(
      `graphql.execute() needs a document, "${name}" is only a name.`,
    );
  }

  const query = await context.printDocument(document);
  const headers = {
    ...(options.defaultHeaders === false ? {} : context.defaultHeaders),
    ...options.headers,
  };
  const response = await context.post(
    context.resolveUrl(),
    { operationName: name, query, variables },
    Object.keys(headers).length === 0 ? undefined : headers,
  );

  if (!response.ok()) {
    throw new Error(
      `GraphQL operation "${name}" failed with status ${response.status()}.`,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(
      `GraphQL operation "${name}" answered with a body that is not JSON (status ${response.status()}).`,
      { cause: error },
    );
  }

  const { data, errors } = readGraphqlResult(body);
  if (errors !== undefined) {
    throw new GraphqlExecutionError(name, errors, response);
  }

  if (data === null || data === undefined) {
    throw new Error(
      `GraphQL operation "${name}" returned no data (status ${response.status()}).`,
    );
  }

  if (rootField !== undefined && isRecord(data) && !(rootField in data)) {
    throw new Error(
      `GraphQL operation "${name}" returned no "${rootField}" field: ${JSON.stringify(data)}`,
    );
  }

  return data;
}
