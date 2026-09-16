import { isRecord } from './is-record';

export interface GraphqlError {
  message: string;
  path?: readonly (string | number)[];
  extensions?: Record<string, unknown>;
}

export interface GraphqlResult<TData> {
  data: TData | null | undefined;
  errors: readonly GraphqlError[] | undefined;
}

/** Reads data and errors out of a response body. An empty errors array counts as no errors. */
export function readGraphqlResult(body: unknown): GraphqlResult<unknown> {
  if (!isRecord(body)) {
    return { data: undefined, errors: undefined };
  }

  const errors =
    Array.isArray(body.errors) && body.errors.length > 0
      ? (body.errors as GraphqlError[])
      : undefined;

  return { data: body.data, errors };
}
