import { mountQuasar } from '../utils'
import App from 'src/App.vue'
import test from 'ava'

test('Inits component', t => {
  const component = mountQuasar(App, {
    utils: {
      appError: () => fn => fn,
      appSuccess: () => fn => fn
    }
  })
  t.true(component.wrapper.exists())
})
