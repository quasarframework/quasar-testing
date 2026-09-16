import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import { expect, expectTypeOf, test } from 'vitest';
import {
  resolveOperation,
  type DataOf,
  type OperationDocument,
  type VariablesOf,
} from './document';

// The registry is global. This augmentation is visible to the whole package
// typecheck, so the name is one no real operation would use.
declare module './document' {
  interface GraphqlOperations {
    DocumentTestOperation: {
      data: { ok: boolean };
      variables: { id: string };
    };
  }
}

test('a name resolves to itself', () => {
  expect(resolveOperation('ListItems')).toStrictEqual({ name: 'ListItems' });
});

test('a document resolves to its operation name and first root field', () => {
  const document = parse(
    'query ListItems($filter: String) { items(filter: $filter) { id } }',
  );

  const resolved = resolveOperation(document);

  expect(resolved.name).toBe('ListItems');
  expect(resolved.rootField).toBe('items');
  expect(resolved.document).toBe(document);
});

test('an aliased root field resolves to the alias', () => {
  const document = parse('mutation CreateItem { newItem: createItem { id } }');

  expect(resolveOperation(document).rootField).toBe('newItem');
});

test('the root field skips a leading fragment spread', () => {
  const document = parse(
    'query ListItems { ...Meta items { id } } fragment Meta on Query { version }',
  );

  expect(resolveOperation(document).rootField).toBe('items');
});

test('an operation with only fragment spreads has no root field', () => {
  const document = parse(
    'query ListItems { ...Meta } fragment Meta on Query { version }',
  );

  expect(resolveOperation(document).rootField).toBeUndefined();
});

test('an anonymous operation throws', () => {
  expect(() => resolveOperation(parse('{ items { id } }'))).toThrow(
    'The GraphQL operation has no name. The helpers match operations by name, so name it: query ListItems { ... }.',
  );
});

test('a document without an operation throws', () => {
  expect(() =>
    resolveOperation(parse('fragment Meta on Query { version }')),
  ).toThrow('The GraphQL document holds no operation definition.');
});

test('a codegen TypedDocumentNode carries its types into OperationDocument', () => {
  type Typed = TypedDocumentNode<{ items: string[] }, { filter: string }>;

  expectTypeOf<Typed>().toExtend<
    OperationDocument<{ items: string[] }, { filter: string }>
  >();
  expectTypeOf<Typed>().not.toExtend<
    OperationDocument<{ other: number }, { filter: string }>
  >();
});

test('a registered name resolves its types, any other name resolves to unknown', () => {
  expectTypeOf<DataOf<'DocumentTestOperation'>>().toEqualTypeOf<{
    ok: boolean;
  }>();
  expectTypeOf<VariablesOf<'DocumentTestOperation'>>().toEqualTypeOf<{
    id: string;
  }>();
  expectTypeOf<DataOf<'Unregistered'>>().toEqualTypeOf<unknown>();
  expectTypeOf<VariablesOf<'Unregistered'>>().toEqualTypeOf<
    Record<string, unknown>
  >();
});
