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

function isErrorPath(value: unknown): value is (string | number)[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) => typeof item === 'string' || typeof item === 'number',
    )
  );
}

/** Every item of an errors array becomes an error with a string message. */
function toGraphqlError(item: unknown): GraphqlError {
  if (!isRecord(item)) {
    return { message: String(item) };
  }

  const { message, path, extensions } = item;

  return {
    message: typeof message === 'string' ? message : JSON.stringify(item),
    ...(isErrorPath(path) ? { path } : {}),
    ...(isRecord(extensions) ? { extensions } : {}),
  };
}

/** Reads data and errors out of a response body. An empty errors array counts as no errors. */
export function readGraphqlResult(body: unknown): GraphqlResult<unknown> {
  if (!isRecord(body)) {
    return { data: undefined, errors: undefined };
  }

  const { data, errors } = body;
  if (!Array.isArray(errors) || errors.length === 0) {
    return { data, errors: undefined };
  }

  return { data, errors: (errors as unknown[]).map(toGraphqlError) };
}
