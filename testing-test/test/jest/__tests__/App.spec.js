/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import QBUTTON from './demo/QBtn-demo.vue'
// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(

import {
  Quasar,
  QLayout,
  QPage,
  QPageContainer,
  QBtn,
  date
} from 'quasar'

describe('Mount Quasar', () => {
  let localVue
  let wrapper
  let vm
  let shallowWrapper
  let vmShallow

  beforeEach(() => {
    // const { Quasar, date } = All

    localVue = createLocalVue()

    localVue.use(Quasar, { components: { QLayout, QPage, QPageContainer, QBtn } }) // , lang: langEn

    wrapper = mount(QBUTTON, {
      localVue
    })
    shallowWrapper = shallowMount(QBUTTON, {
      localVue
    })
    vm = wrapper.vm
    vmShallow = shallowWrapper.vm
  })

  afterEach(() => {
    localVue = null
    wrapper = null
    vm = null
  })
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
    const defaultData2 = QBUTTON.data()
    expect(defaultData2.counter).toBe(0)
  })

  it('correctly updates data when button is pressed', () => {
    const button = shallowWrapper.find('q-btn')
    button.trigger('click')
    expect(vmShallow.counter).toBe(1)
  })

  it('formats a date without throwing exception', () => {
    // test will automatically fail if an exception is thrown
    // MMMM and MMM require that a language is 'installed' in Quasar
    let formattedString = date.formatDate(Date.now(), 'YYYY MMMM MMM DD')
    console.log('formattedString', formattedString)
  })
})
