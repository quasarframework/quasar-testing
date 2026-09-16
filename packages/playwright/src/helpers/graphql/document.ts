/*
  Structural views of a GraphQL document. Any codegen TypedDocumentNode is
  assignable, and no type of the graphql package is imported.
*/

export interface SelectionLike {
  readonly kind: string;
  readonly name?: { readonly value: string };
  /** The key the response uses for the field when the operation aliases it. */
  readonly alias?: { readonly value: string };
}

export interface DefinitionLike {
  readonly kind: string;
  readonly name?: { readonly value: string };
  readonly selectionSet?: { readonly selections: readonly SelectionLike[] };
}

export interface OperationDocument<
  TData = unknown,
  TVariables = Record<string, unknown>,
> {
  readonly kind: 'Document';
  readonly definitions: readonly DefinitionLike[];
  /** Phantom member of TypedDocumentNode. It carries the result and variables types. */
  readonly __apiType?: (variables: TVariables) => TData;
}

/**
 * The operations an app names as strings, keyed by operation name. The app
 * augments it from a d.ts file:
 *
 * declare module '@quasar/quasar-app-extension-testing-playwright' {
 *   interface GraphqlOperations {
 *     ListItems: { data: ListItemsQuery; variables: ListItemsQueryVariables };
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the app fills it through augmentation
export interface GraphqlOperations {}

/** A registered name autocompletes. Any other string is accepted. */
export type OperationName = keyof GraphqlOperations | (string & {});

export type OperationDescriptor = OperationDocument | OperationName;

/** The data type of a registered name, unknown for any other name. */
export type DataOf<TName> = TName extends keyof GraphqlOperations
  ? GraphqlOperations[TName] extends { data: infer TData }
    ? TData
    : unknown
  : unknown;

/** The variables type of a registered name, a plain record for any other name. */
export type VariablesOf<TName> = TName extends keyof GraphqlOperations
  ? GraphqlOperations[TName] extends { variables: infer TVariables }
    ? TVariables
    : Record<string, unknown>
  : Record<string, unknown>;

export interface ResolvedOperation {
  name: string;
  /**
   * The key the response uses for the first field the operation selects. It is
   * the alias when the field has one. A document gives it, a name does not.
   */
  rootField?: string;
  document?: OperationDocument;
}

const OPERATION_DEFINITION_KIND = 'OperationDefinition';
const FIELD_KIND = 'Field';

export function resolveOperation(
  descriptor: OperationDescriptor,
): ResolvedOperation {
  if (typeof descriptor === 'string') {
    return { name: descriptor };
  }

  const operation = descriptor.definitions.find(
    (definition) => definition.kind === OPERATION_DEFINITION_KIND,
  );
  if (operation === undefined) {
    throw new Error('The GraphQL document holds no operation definition.');
  }

  const name = operation.name?.value;
  if (name === undefined) {
    throw new Error(
      'The GraphQL operation has no name. The helpers match operations by name, so name it: query ListItems { ... }.',
    );
  }

  const rootSelection = operation.selectionSet?.selections.find(
    (selection) => selection.kind === FIELD_KIND,
  );
  const rootField = rootSelection?.alias?.value ?? rootSelection?.name?.value;

  return {
    name,
    document: descriptor,
    ...(rootField === undefined ? {} : { rootField }),
  };
}
