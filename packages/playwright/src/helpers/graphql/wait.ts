import type { Response } from '@playwright/test';
import { readOperations } from './request-body';
import { readGraphqlResult, type GraphqlResult } from './response';

export interface WaitForOperationOptions {
  timeout?: number;
}

export type OperationResponse<TData> = GraphqlResult<TData> & {
  response: Response;
};

/** The part of a Playwright Page the waiter uses. A test passes a literal. */
interface WaitablePage {
  waitForResponse(
    predicate: (response: Response) => boolean,
    options?: WaitForOperationOptions,
  ): Promise<Response>;
}

const NOT_FOUND = -1;

/** The name Playwright gives the error of an expired wait. */
const TIMEOUT_ERROR_NAME = 'TimeoutError';

function timeoutMessage(operationName: string, timeout: number | undefined) {
  if (timeout === undefined) {
    return `No response for GraphQL operation "${operationName}" within the timeout.`;
  }

  return `No response for GraphQL operation "${operationName}" within ${timeout}ms.`;
}

/** Resolves with the browser's response to the next request that carries the operation. */
export async function waitForOperation(
  page: WaitablePage,
  matchesEndpoint: (url: URL) => boolean,
  operationName: string,
  options: WaitForOperationOptions = {},
): Promise<OperationResponse<unknown>> {
  // The predicate stores what it matched. The matched request is not parsed
  // again after the wait.
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

  let response: Response;
  try {
    response = await page.waitForResponse(matchesOperation, options);
  } catch (error) {
    // Playwright's own timeout error names neither the operation nor the
    // endpoint. A rejection that is not a timeout keeps its message. It comes
    // from a closed page or from the endpoint predicate.
    if (error instanceof Error && error.name === TIMEOUT_ERROR_NAME) {
      throw new Error(timeoutMessage(operationName, options.timeout), {
        cause: error,
      });
    }

    throw error;
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
    const answer: unknown = Array.isArray(body)
      ? body[matched.index]
      : undefined;
    return { ...readGraphqlResult(answer), response };
  }

  return { ...readGraphqlResult(body), response };
}
