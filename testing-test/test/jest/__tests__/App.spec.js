/**
 * @jest-environment jsdom
 */

import { mount, createLocalVue } from '@vue/test-utils'
import { mountQuasar } from '~/test/jest/utils'
import QButton from './demo/QBtn-demo.vue'
import Quasar from 'quasar'

describe('Mount Quasar', () => {
  const wrapper = mountQuasar(QButton, {
    utils: {
      appError: () => (fn) => fn,
      appSuccess: () => (fn) => fn
    }
  })
  const vm = wrapper.vm

  it('passes the sanity check and creates a wrapper', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })

  it('has a created hook', () => {
    expect(typeof vm.increment).toBe('function')
  })

  it('accesses the shallowMount', () => {
    expect(vm.$el.textContent).toContain('rocket muffin')
    expect(wrapper.text()).toContain('rocket muffin') // easier
    expect(wrapper.find('p').text()).toContain('rocket muffin')
  })

  it('sets the correct default data', () => {
    expect(typeof vm.counter).toBe('number')
    const defaultData2 = QButton.data()
    expect(defaultData2.counter).toBe(0)
  })

  it('correctly updates data when button is pressed', () => {
    const localVue = createLocalVue()
    localVue.use(Quasar, { components: ['QBtn']})
    const wrapper2 = mount(QButton, {
      localVue
    })
    const vm2 = wrapper2.vm
    const button = wrapper2.find('button')
    button.trigger('click')
    expect(vm2.counter).toBe(1)
  })
})
