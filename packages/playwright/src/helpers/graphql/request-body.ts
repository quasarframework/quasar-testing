import { isRecord } from './is-record';

/** The part of a Playwright Request the parser reads. A test passes a literal. */
export interface RequestLike {
  method(): string;
  url(): string;
  headers(): Record<string, string>;
  postData(): string | null;
}

export interface OperationCall {
  operationName: string;
  variables: Record<string, unknown>;
}

export interface ParsedOperations {
  operations: OperationCall[];
  /** The body was an array. The response has to be one too. */
  isBatched: boolean;
}

const MULTIPART_CONTENT_TYPE_PREFIX = 'multipart/';
const OPERATION_NAME_PARAMETER = 'operationName';
const VARIABLES_PARAMETER = 'variables';

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** One operation of a body, or undefined when the item has no operationName. */
function toOperationCall(item: unknown): OperationCall | undefined {
  if (!isRecord(item) || typeof item.operationName !== 'string') {
    return undefined;
  }

  return {
    operationName: item.operationName,
    variables: isRecord(item.variables) ? item.variables : {},
  };
}

function readGetOperations(url: URL): ParsedOperations | undefined {
  const operationName = url.searchParams.get(OPERATION_NAME_PARAMETER);
  if (operationName === null) {
    return undefined;
  }

  const rawVariables = url.searchParams.get(VARIABLES_PARAMETER);
  const variables = rawVariables === null ? {} : parseJson(rawVariables);
  if (!isRecord(variables)) {
    return undefined;
  }

  return { operations: [{ operationName, variables }], isBatched: false };
}

function readPostOperations(
  request: RequestLike,
): ParsedOperations | undefined {
  const contentType = request.headers()['content-type'] ?? '';
  if (contentType.startsWith(MULTIPART_CONTENT_TYPE_PREFIX)) {
    return undefined;
  }

  const body = request.postData();
  if (body === null) {
    return undefined;
  }

  const parsed = parseJson(body);
  const items = Array.isArray(parsed) ? parsed : [parsed];
  const operations: OperationCall[] = [];

  for (const item of items) {
    const call = toOperationCall(item);
    if (call === undefined) {
      return undefined;
    }

    operations.push(call);
  }

  if (operations.length === 0) {
    return undefined;
  }

  return { operations, isBatched: Array.isArray(parsed) };
}

/**
 * A POST body holds one JSON operation or an array of them. A GET request
 * holds one in its search parameters. Anything else gives undefined.
 */
export function readOperations(
  request: RequestLike,
): ParsedOperations | undefined {
  const method = request.method();

  if (method === 'GET') {
    return readGetOperations(new URL(request.url()));
  }

  if (method === 'POST') {
    return readPostOperations(request);
  }

  return undefined;
}
