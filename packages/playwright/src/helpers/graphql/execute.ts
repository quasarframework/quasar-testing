import type { APIResponse } from '@playwright/test';
import {
  resolveOperation,
  type OperationDescriptor,
  type OperationDocument,
} from './document';
import { isRecord } from './is-record';
import { readGraphqlResult, type GraphqlError } from './response';

export interface ExecuteOptions {
  /** Merged on top of the graphqlHeaders option, name by name. A name matches whatever its case. */
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
    headers: Record<string, string>,
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

/** HTTP header names are case-insensitive, so the merge lowercases them. The last source wins. */
function mergeHeaders(
  ...sources: (Record<string, string> | undefined)[]
): Record<string, string> {
  const merged: Record<string, string> = {};

  for (const source of sources) {
    for (const [name, value] of Object.entries(source ?? {})) {
      merged[name.toLowerCase()] = value;
    }
  }

  return merged;
}

/** The body of a failing response, for its error message. Empty when there is none. */
async function bodyNote(response: APIResponse) {
  // The status is the error. A body that cannot be read adds nothing to it.
  const text = await response.text().catch(() => '');
  if (text === '') {
    return '';
  }

  return ` The response body was: ${text}`;
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
  const headers = mergeHeaders(
    options.defaultHeaders === false ? undefined : context.defaultHeaders,
    options.headers,
  );
  const response = await context.post(
    context.resolveUrl(),
    { operationName: name, query, variables },
    headers,
  );

  let body: unknown;
  let jsonError: unknown;
  try {
    body = await response.json();
  } catch (error) {
    jsonError = error;
  }

  // The GraphQL over HTTP spec allows a complete error response on a 4xx status,
  // and Apollo Server answers 400 that way for a validation error. The errors of
  // the body name the problem, the status alone does not.
  const { data, errors } = readGraphqlResult(body);
  if (errors !== undefined) {
    throw new GraphqlExecutionError(name, errors, response);
  }

  if (!response.ok()) {
    throw new Error(
      `GraphQL operation "${name}" failed with status ${response.status()}.${await bodyNote(response)}`,
    );
  }

  if (jsonError !== undefined) {
    throw new Error(
      `GraphQL operation "${name}" answered with a body that is not JSON (status ${response.status()}).`,
      { cause: jsonError },
    );
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
