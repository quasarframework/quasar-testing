import GraphqlList from "./GraphqlList.vue";

export const Default = () => <GraphqlList />;
export const Filtered = () => <GraphqlList filter="al" />;
export const Batched = () => <GraphqlList transport="batched" />;
export const Get = () => <GraphqlList transport="get" />;
