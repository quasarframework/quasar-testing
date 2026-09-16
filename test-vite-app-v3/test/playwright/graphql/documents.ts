// Stand-ins for codegen output. A project generates these with
// typescript-operations and typed-document-node.

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { parse } from "graphql";

export interface Item {
  id: string;
  name: string;
}
export interface ListItemsData {
  items: Item[];
}
export interface ListItemsVariables {
  filter?: string;
}
export interface ItemCountData {
  itemCount: number;
}
export interface CreateItemData {
  createItem: Item;
}
export interface CreateItemVariables {
  name: string;
}

export const ListItemsDocument = parse(
  "query ListItems($filter: String) { items(filter: $filter) { id name } }"
) as TypedDocumentNode<ListItemsData, ListItemsVariables>;
export const CreateItemDocument = parse(
  "mutation CreateItem($name: String!) { createItem(name: $name) { id name } }"
) as TypedDocumentNode<CreateItemData, CreateItemVariables>;
export const ViewerDocument = parse(
  "query Viewer { viewer }"
) as TypedDocumentNode<{ viewer: string | null }, Record<string, never>>;
export const FailingOperationDocument = parse(
  "mutation FailingOperation { fail }"
) as TypedDocumentNode<{ fail: boolean }, Record<string, never>>;
