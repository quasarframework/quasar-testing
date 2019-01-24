import { mountQuasar } from '~/test/jest/utils'
import UApp from 'src/App.vue'

// todo: properly mock the store

describe('Mount Quasar', () => {
  it('Inits component', () => {
    mountQuasar(UApp, {
      utils: {
        appError: () =>  (fn) => fn,
        appSuccess: () => (fn) => fn
      }
    })
  })
})
