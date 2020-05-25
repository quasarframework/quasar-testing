import { createLocalVue, shallowMount } from '@vue/test-utils';
import { Quasar, QBtn } from 'quasar'; // <= cherry pick only the components you actually use

import QBtnDemo from './demo/QBtn-demo';

const localVue = createLocalVue();
localVue.use(Quasar, { components: { QBtn } }); // <= you should register every component you use. If not declared here, `shallowMount` won't be able to stub them

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const factory = (propsData: any = {}) => {
  return shallowMount(QBtnDemo, { // <= used `shallowMount` instead of `mount`, will stub all **registered** components into the template
    localVue,
    propsData,
  });
};

describe('QBtnDemo', () => {
  // DUMMY test, you should remove this and add your own tests
  test('mounts without errors', () => {
    const wrapper = factory(); // <= when no props are needed
    // const wrapper = factory({ propName: propValue }); <= when props are needed
    expect(wrapper).toBeTruthy();
  });
});
