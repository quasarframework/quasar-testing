import { mountQuasar } from '~/test/jest/utils'
import App from 'src/App.vue'


describe('Mount Quasar', () => {
  it('Inits component', () => {
    mountQuasar(App, {
      utils: {
        appError: () =>  (fn) => fn,
        appSuccess: () => (fn) => fn
      }
    })
  })
})
