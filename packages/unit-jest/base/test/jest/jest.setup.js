// No console.log() / setTimeout
console.log = jest.fn(() => { throw new Error('Do not use console.log() in production') })
jest.setTimeout(1000)

// jest speedup when errors are part of the game
Error.stackTraceLimit = 0

global.Promise = require('promise')

import chai from 'chai'
// Make sure chai and jasmine ".not" play nice together
// https://medium.com/@RubenOostinga/combining-chai-and-jest-matchers-d12d1ffd0303
const originalNot = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, 'not').get
Object.defineProperty(chai.Assertion.prototype, 'not', {
  get() {
    Object.assign(this, this.assignedNot)
    return originalNot.apply(this)
  },
  set(newNot) {
    this.assignedNot = newNot
    return newNot
  }
})

// Combine both jest and chai matchers on expect
const originalExpect = global.expect

global.expect = (actual) => {
  const originalMatchers = originalExpect(actual)
  const chaiMatchers = chai.expect(actual)
  return Object.assign(chaiMatchers, originalMatchers)
}

// do this to make sure we don't get multiple hits from both webpacks when running SSR
setTimeout(()=>{
  // do nothing
}, 1)
