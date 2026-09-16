import type { Page, Response } from '@playwright/test';
import { readOperations } from './request-body';
import { readGraphqlResult, type GraphqlResult } from './response';

export interface WaitForOperationOptions {
  timeout?: number;
}

export type OperationResponse<TData> = GraphqlResult<TData> & {
  response: Response;
};

const NOT_FOUND = -1;

function timeoutMessage(operationName: string, timeout: number | undefined) {
  if (timeout === undefined) {
    return `No response for GraphQL operation "${operationName}" within the timeout.`;
  }

  return `No response for GraphQL operation "${operationName}" within ${timeout}ms.`;
}

/** Resolves with the browser's response to the next request that carries the operation. */
export async function waitForOperation(
  page: Page,
  matchesEndpoint: (url: URL) => boolean,
  operationName: string,
  options: WaitForOperationOptions = {},
): Promise<OperationResponse<unknown>> {
  // The predicate keeps what it matched, so the request body is read once.
  let matched: { index: number; isBatched: boolean } | undefined;
  const matchesOperation = (candidate: Response) => {
    const request = candidate.request();
    if (!matchesEndpoint(new URL(request.url()))) {
      return false;
    }

    const parsed = readOperations(request);
    if (parsed === undefined) {
      return false;
    }

    const index = parsed.operations.findIndex(
      (operation) => operation.operationName === operationName,
    );
    if (index === NOT_FOUND) {
      return false;
    }

    matched = { index, isBatched: parsed.isBatched };
    return true;
  };

  // Playwright's own timeout error names neither the operation nor the endpoint.
  let response: Response;
  try {
    response = await page.waitForResponse(matchesOperation, options);
  } catch (error) {
    throw new Error(timeoutMessage(operationName, options.timeout), {
      cause: error,
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(
      `GraphQL operation "${operationName}" answered with a body that is not JSON (status ${response.status()}).`,
      { cause: error },
    );
  }

  if (matched?.isBatched) {
    const batch: unknown[] = Array.isArray(body) ? body : [];
    return { ...readGraphqlResult(batch[matched.index]), response };
  }

  return { ...readGraphqlResult(body), response };
}
