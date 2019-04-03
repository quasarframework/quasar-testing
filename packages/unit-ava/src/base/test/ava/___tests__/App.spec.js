import { mount, createLocalVue } from '@vue/test-utils'
import QButton from './demo/QBtn-demo.vue'
import * as All from 'quasar'
import test from 'ava'
const { Quasar, date } = All

const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})

const localVue = createLocalVue()
localVue.use(Quasar, { components })
const wrapper = mount(QButton, {
  localVue
})
const vm = wrapper.vm

test('passes the sanity check and creates a wrapper', t => {
  t.true(wrapper.isVueInstance())
})

test('has a created hook', t => {
  t.is(typeof vm.increment, 'function')
})

test('accesses the shallowMount', t => {
  t.regex(vm.$el.textContent, /rocket muffin/)
  t.regex(wrapper.text(), /rocket muffin/) // easier
  t.regex(wrapper.find('p').text(), /rocket muffin/)
})

test('sets the correct default data', t => {
  t.is(typeof vm.counter, 'number')
  const defaultData2 = QButton.data()
  t.is(defaultData2.counter, 0)
})

test('correctly updates data when button is pressed', t => {
  const button = wrapper.find('button')
  button.trigger('click')
  t.is(vm.counter, 1)
})
