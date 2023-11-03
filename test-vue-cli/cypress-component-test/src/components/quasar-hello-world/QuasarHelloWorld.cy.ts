import QuasarHelloWorld from './QuasarHelloWorld.vue';

describe('<QuasarHelloWorld />', () => {
  it('renders', () => {
    cy.mount(QuasarHelloWorld);
  });

  it('should reflect the text typed into the input', () => {
    cy.mount(QuasarHelloWorld);
    cy.get('[data-test="txt-name"]').clear().type('It worked');
    cy.get('[data-test="result"]').contains('It worked').should('exist');
  });
});
