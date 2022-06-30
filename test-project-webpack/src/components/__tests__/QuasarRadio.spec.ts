import { mount } from '@cypress/vue';
import QuasarRadio from '../QuasarRadio.vue';

function dataCyRadio(dataCyId: string) {
  return cy.dataCy(dataCyId).then(($quasarRadio) => {
    return cy.get('input:radio', {
      withinSubject: $quasarRadio,
    });
  });
}

describe('QuasarRadio', () => {
  it('updates aria-checked value when not inside a form', () => {
    mount(QuasarRadio);

    cy.dataCy('radio-outside-form-1').click();
    cy.dataCy('radio-outside-form-1').should(
      'have.attr',
      'aria-checked',
      'true'
    );
    cy.dataCy('radio-outside-form-2').click();
    cy.dataCy('radio-outside-form-2').should(
      'have.attr',
      'aria-checked',
      'true'
    );
    cy.dataCy('radio-outside-form-1').should(
      'have.attr',
      'aria-checked',
      'false'
    );
  });

  it('updates native radio when inside a form and with a name', () => {
    mount(QuasarRadio);

    cy.dataCy('radio-inside-form-1').click();
    dataCyRadio('radio-inside-form-1').should('be.checked');
    cy.dataCy('radio-inside-form-2').click();
    dataCyRadio('radio-inside-form-2').should('be.checked');
    dataCyRadio('radio-inside-form-1').should('not.be.checked');
  });
});
