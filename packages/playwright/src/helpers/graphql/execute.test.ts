import { parse } from 'graphql';
import { expect, test } from 'vitest';
import { execute, GraphqlExecutionError, printWithGraphql } from './execute';

type Context = Parameters<typeof execute>[0];
type Posted = Parameters<Context['post']>;

function createContext(
  reply: {
    ok?: boolean;
    status?: number;
    body?: unknown;
    text?: string;
  },
  defaultHeaders: Record<string, string> = {},
) {
  const posted: Posted[] = [];
  const response = {
    ok: () => reply.ok ?? true,
    status: () => reply.status ?? 200,
    json: () =>
      reply.text === undefined
        ? Promise.resolve(reply.body)
        : Promise.reject(new SyntaxError(reply.text)),
  };
  const context: Context = {
    post: (...args) => {
      posted.push(args);
      return Promise.resolve(response as never);
    },
    resolveUrl: () => 'http://localhost:8080/graphql',
    defaultHeaders,
    printDocument: () => Promise.resolve('printed query'),
  };

  return { context, posted, response };
}

const CreateItem = parse(
  'mutation CreateItem($name: String!) { createItem(name: $name) { id } }',
);

const CREATE_ITEM_DATA = { createItem: { id: '1' } };
const DEFAULT_HEADERS = { authorization: 'Bearer default', 'x-tenant': 'one' };

test('posts the operation and returns its data', async () => {
  const { context, posted } = createContext({
    body: { data: CREATE_ITEM_DATA },
  });

  const data = await execute(
    context,
    CreateItem,
    { name: 'Zeta' },
    { headers: { authorization: 'Bearer t' } },
  );

  expect(data).toEqual(CREATE_ITEM_DATA);
  expect(posted).toEqual([
    [
      'http://localhost:8080/graphql',
      {
        operationName: 'CreateItem',
        query: 'printed query',
        variables: { name: 'Zeta' },
      },
      { authorization: 'Bearer t' },
    ],
  ]);
});

test('the default headers are sent', async () => {
  const { context, posted } = createContext(
    { body: { data: CREATE_ITEM_DATA } },
    DEFAULT_HEADERS,
  );

  await execute(context, CreateItem);

  expect(posted[0]?.[2]).toEqual(DEFAULT_HEADERS);
});

test('a per-call header overrides one default and keeps the others', async () => {
  const { context, posted } = createContext(
    { body: { data: CREATE_ITEM_DATA } },
    DEFAULT_HEADERS,
  );

  await execute(
    context,
    CreateItem,
    {},
    { headers: { authorization: 'Bearer call' } },
  );

  expect(posted[0]?.[2]).toEqual({
    authorization: 'Bearer call',
    'x-tenant': 'one',
  });
});

test('defaultHeaders false sends none of the defaults', async () => {
  const { context, posted } = createContext(
    { body: { data: CREATE_ITEM_DATA } },
    DEFAULT_HEADERS,
  );

  await execute(
    context,
    CreateItem,
    {},
    { defaultHeaders: false, headers: { 'x-request-id': '7' } },
  );

  expect(posted[0]?.[2]).toEqual({ 'x-request-id': '7' });
});

test('a name alone is refused', async () => {
  const { context } = createContext({});

  await expect(execute(context, 'CreateItem')).rejects.toThrow(
    'graphql.execute() needs a document, "CreateItem" is only a name.',
  );
});

test('a failing status throws with the status', async () => {
  const { context } = createContext({ ok: false, status: 503 });

  await expect(execute(context, CreateItem)).rejects.toThrow(
    'GraphQL operation "CreateItem" failed with status 503.',
  );
});

test('a body that is not JSON throws with the status', async () => {
  const { context } = createContext({ text: 'Unexpected token <' });

  await expect(execute(context, CreateItem)).rejects.toThrow(
    'GraphQL operation "CreateItem" answered with a body that is not JSON (status 200).',
  );
});

test('GraphQL errors throw a GraphqlExecutionError', async () => {
  const errors = [{ message: 'Name taken', path: ['createItem'] }];
  const { context, response } = createContext({ body: { data: null, errors } });

  const failure = await execute(context, CreateItem).catch(
    (error: unknown) => error,
  );

  expect(failure).toBeInstanceOf(GraphqlExecutionError);
  const executionError = failure as GraphqlExecutionError;
  expect(executionError.operationName).toBe('CreateItem');
  expect(executionError.errors).toEqual(errors);
  expect(executionError.response).toBe(response);
  expect(executionError.message).toContain(
    'GraphQL operation "CreateItem" returned errors:',
  );
  expect(executionError.message).toContain('Name taken');
});

test('missing data throws', async () => {
  const { context } = createContext({ body: { data: null } });

  await expect(execute(context, CreateItem)).rejects.toThrow(
    'GraphQL operation "CreateItem" returned no data (status 200).',
  );
});

test('a missing root field throws', async () => {
  const { context } = createContext({ body: { data: { somethingElse: 1 } } });

  await expect(execute(context, CreateItem)).rejects.toThrow(
    'GraphQL operation "CreateItem" returned no "createItem" field: {"somethingElse":1}',
  );
});

test('printWithGraphql prints the document', async () => {
  await expect(printWithGraphql(parse('query A { a }'))).resolves.toBe(
    'query A {\n  a\n}',
  );
});
