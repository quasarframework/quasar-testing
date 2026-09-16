<template>
  <div>
    <q-input v-model="name" data-testid="name-input" label="Name" />
    <q-btn data-testid="create-button" label="Create" @click="create" />

    <p v-if="loading" data-testid="loading">Loading</p>
    <p v-if="error !== undefined" data-testid="error">{{ error }}</p>
    <p v-if="itemCount !== undefined" data-testid="count">{{ itemCount }}</p>

    <!-- An empty list is only worth reporting once the load finished without an error. -->
    <p
      v-if="!loading && error === undefined && items.length === 0"
      data-testid="empty"
    >
      No items
    </p>

    <ul>
      <li v-for="item in items" :key="item.id" data-testid="item">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const ENDPOINT = "/graphql";
const LIST_ITEMS_QUERY =
  "query ListItems($filter: String) { items(filter: $filter) { id name } }";
const ITEM_COUNT_QUERY = "query ItemCount { itemCount }";
const CREATE_ITEM_MUTATION =
  "mutation CreateItem($name: String!) { createItem(name: $name) { id name } }";

interface Item {
  id: string;
  name: string;
}

interface GraphqlError {
  message: string;
}

interface GraphqlResult<TData> {
  data?: TData | null;
  errors?: GraphqlError[];
}

const { filter, transport = "post" } = defineProps<{
  filter?: string;
  transport?: "post" | "get" | "batched";
}>();

const items = ref<Item[]>([]);
const itemCount = ref<number>();
const loading = ref(false);
const error = ref<string>();
const name = ref("");

function listVariables() {
  return filter === undefined ? {} : { filter };
}

function firstErrorMessage(...results: GraphqlResult<unknown>[]) {
  for (const result of results) {
    const message = result.errors?.[0]?.message;
    if (message !== undefined) {
      return message;
    }
  }

  return undefined;
}

function toMessage(caught: unknown) {
  return caught instanceof Error ? caught.message : String(caught);
}

async function postJson(body: unknown): Promise<unknown> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  return response.json();
}

function applyListResult(result: GraphqlResult<{ items: Item[] }>) {
  const message = firstErrorMessage(result);
  if (message !== undefined) {
    error.value = message;
    return;
  }

  items.value = result.data?.items ?? [];
}

async function loadWithPost() {
  const result = (await postJson({
    operationName: "ListItems",
    query: LIST_ITEMS_QUERY,
    variables: listVariables()
  })) as GraphqlResult<{ items: Item[] }>;

  applyListResult(result);
}

async function loadWithGet() {
  const parameters = new URLSearchParams({
    operationName: "ListItems",
    query: LIST_ITEMS_QUERY,
    variables: JSON.stringify(listVariables())
  });
  const response = await fetch(`${ENDPOINT}?${parameters.toString()}`);
  const result = (await response.json()) as GraphqlResult<{ items: Item[] }>;

  applyListResult(result);
}

async function loadBatched() {
  // The server answers an array in the order of the batch.
  const [listResult, countResult] = (await postJson([
    {
      operationName: "ListItems",
      query: LIST_ITEMS_QUERY,
      variables: listVariables()
    },
    { operationName: "ItemCount", query: ITEM_COUNT_QUERY, variables: {} }
  ])) as [
    GraphqlResult<{ items: Item[] }>,
    GraphqlResult<{ itemCount: number }>
  ];

  const message = firstErrorMessage(listResult, countResult);
  if (message !== undefined) {
    error.value = message;
    // The count of the previous load would contradict the error.
    itemCount.value = undefined;
    return;
  }

  items.value = listResult.data?.items ?? [];
  itemCount.value = countResult.data?.itemCount;
}

async function load() {
  loading.value = true;
  error.value = undefined;

  try {
    if (transport === "batched") {
      await loadBatched();
      return;
    }

    if (transport === "get") {
      await loadWithGet();
      return;
    }

    await loadWithPost();
  } catch (caught) {
    error.value = toMessage(caught);
  } finally {
    loading.value = false;
  }
}

/** Posts the mutation. Returns the error message, or undefined on success. */
async function submitCreate(): Promise<string | undefined> {
  try {
    const result = (await postJson({
      operationName: "CreateItem",
      query: CREATE_ITEM_MUTATION,
      variables: { name: name.value }
    })) as GraphqlResult<{ createItem: Item }>;

    return firstErrorMessage(result);
  } catch (caught) {
    return toMessage(caught);
  }
}

async function create() {
  loading.value = true;
  error.value = undefined;

  const message = await submitCreate();
  if (message !== undefined) {
    error.value = message;
    loading.value = false;
    return;
  }

  name.value = "";

  // load() keeps loading true until the fresh list arrives.
  await load();
}

onMounted(load);
</script>
