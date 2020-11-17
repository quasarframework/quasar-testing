import { mountFactory } from '@quasar/quasar-app-extension-testing-unit-jest';
import { QBtn } from 'quasar'; // <= cherry pick only the components you actually use
import QBtnDemo from './demo/QBtn-demo';

const factory = mountFactory(QBtnDemo, {
  // mount: { type: 'full' } <= uncomment this line to use `mount`; `shallowMount` is used by default as it will stub all **registered** components found into the template
  quasar: { components: { QBtn } },
});

describe('QBtnDemo', () => {
  // DUMMY test, you should remove this and add your own tests
  test('mounts without errors', () => {
    const wrapper = factory(); // <= when no props are needed
    // const wrapper = factory({ propName: propValue }); <= when props are needed
    expect(wrapper).toBeTruthy();
  });
});
