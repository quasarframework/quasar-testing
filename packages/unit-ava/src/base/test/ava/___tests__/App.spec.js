import { mount, createLocalVue } from '@vue/test-utils'
import QButton from './demo/QBtn-demo.vue'
import Quasar, { QBtn } from 'quasar'
import test from 'ava'

const localVue = createLocalVue()
localVue.use(Quasar, { components: { QBtn } })
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
  const localVue = createLocalVue()
  localVue.use(Quasar, { components: ['QBtn'] })
  const wrapper2 = mount(QButton, {
    localVue
  })
  const vm2 = wrapper2.vm
  const button = wrapper2.find('button')
  button.trigger('click')
  t.is(vm2.counter, 1)
})

test('formats a date without throwing exception', t => {
  // MMMM and MMM require that a language is 'installed' in Quasar
  t.notThrows(() => date.formatDate(Date.now(), 'YYYY MMMM MMM DD'))
})
