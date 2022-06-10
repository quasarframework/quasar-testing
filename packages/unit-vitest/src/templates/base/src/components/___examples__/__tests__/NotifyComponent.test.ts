import NotifyComponent from '../NotifyComponent.vue';
import { Notify } from 'quasar';
import { mount } from '@vue/test-utils';
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasar({ plugins: { Notify } });

describe('notify example', () => {
  it('should call notify on click', async () => {
    expect(NotifyComponent).toBeTruthy();

    const wrapper = mount(NotifyComponent, {});
    const spy = vi.spyOn(wrapper.vm.$q, 'notify');
    expect(spy).not.toHaveBeenCalled();
    wrapper.trigger('click');
    expect(spy).toHaveBeenCalled();
  });
});
