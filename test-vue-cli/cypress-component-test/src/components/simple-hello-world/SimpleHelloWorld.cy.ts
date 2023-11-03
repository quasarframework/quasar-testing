import SimpleHelloWorld from './SimpleHelloWorld.vue';

describe('<SimpleHelloWorld />', () => {
  it('renders', () => {
    cy.mount(SimpleHelloWorld);
  });

  it('should reflect the text typed into the input', () => {
    cy.mount(SimpleHelloWorld);
    cy.get('[data-test="txt-name"]').clear().type('It worked');
    cy.get('[data-test="result"]').contains('It worked').should('exist');
  });
});
