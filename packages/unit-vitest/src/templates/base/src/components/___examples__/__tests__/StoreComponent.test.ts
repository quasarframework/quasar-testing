import StoreComponent from '../StoreComponent.vue';
import { useCounterStore } from '../example-store';
import {
  installQuasar,
  installPinia,
} from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';

// Documentation: https://pinia.vuejs.org/cookbook/testing.html#unit-testing-a-store

installQuasar();
installPinia({ stubActions: false });

describe('store examples', () => {
  it('should increment the counter', async () => {
    const wrapper = mount(StoreComponent);
    const store = useCounterStore();
    expect(wrapper.text()).toContain(0);
    const btn = wrapper.get('button');
    expect(store.increment).not.toHaveBeenCalled();
    await btn.trigger('click');
    expect(store.increment).toHaveBeenCalled();
    expect(wrapper.text()).toContain(1);
    expect(store.counter).toBe(1);
  });
});
