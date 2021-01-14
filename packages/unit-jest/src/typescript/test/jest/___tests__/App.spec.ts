import { createLocalVue, mount } from '@vue/test-utils';
import * as All from 'quasar';
import { VueConstructor } from 'vue';

import QBtnDemo from './demo/QBtn-demo';

// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(

const { Quasar } = All;

function isComponent(value: unknown): value is VueConstructor {
  return (
    !!value &&
    (value as VueConstructor).component &&
    (value as VueConstructor).component.name != null
  );
}

const components = Object.keys(All).reduce<{ [index: string]: VueConstructor }>(
  (object, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const val = (All as any)[key];
    if (isComponent(val)) {
      object[key] = val;
    }
    return object;
  },
  {},
);

describe('Mount Quasar', () => {
  const localVue = createLocalVue();
  localVue.use(Quasar, { components }); // , lang: langEn

  const wrapper = mount(QBtnDemo, { localVue });
  const vm = wrapper.vm;

  it('has a created hook', () => {
    expect(typeof vm.increment).toBe('function');
  });

  it('accesses the shallowMount', () => {
    expect(vm.$el.textContent).toContain('rocket muffin');
    expect(wrapper.text()).toContain('rocket muffin'); // easier
    expect(wrapper.find('p').text()).toContain('rocket muffin');
  });

  it('sets the correct default data', () => {
    expect(typeof vm.counter).toBe('number');
    const defaultData = vm.$data;
    expect(defaultData.counter).toBe(0);
  });

  it('correctly updates data when button is pressed', async () => {
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(vm.counter).toBe(1);
  });
});
