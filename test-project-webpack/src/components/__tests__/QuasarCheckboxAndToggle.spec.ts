import { mount } from '@cypress/vue';
import QuasarCheckboxAndToggle from '../QuasarCheckboxAndToggle.vue';

function dataCyCheckbox(dataCyId: string) {
  return cy.dataCy(dataCyId).then(($quasarCheckbox) => {
    return cy.get('input:checkbox', {
      withinSubject: $quasarCheckbox,
    });
  });
}

// QToggle structure is the same as a QCheckbox in terms of testing its model
export function dataCyToggle(dataCyId: string) {
  return dataCyCheckbox(dataCyId);
}

describe('QuasarCheckbox', () => {
  it('updates aria-checked value when not inside a form', () => {
    mount(QuasarCheckboxAndToggle);

    cy.dataCy('checkbox-outside-form').click();
    cy.dataCy('checkbox-outside-form').should(
      'have.attr',
      'aria-checked',
      'true'
    );
    cy.dataCy('checkbox-outside-form').click();
    cy.dataCy('checkbox-outside-form').should(
      'have.attr',
      'aria-checked',
      'false'
    );
  });

  it('updates native checkbox when inside a form and with a name', () => {
    mount(QuasarCheckboxAndToggle);

    cy.dataCy('checkbox-inside-form').click();
    dataCyCheckbox('checkbox-inside-form').should('be.checked');
    cy.dataCy('checkbox-inside-form').click();
    dataCyCheckbox('checkbox-inside-form').should('not.be.checked');
  });
});

describe('QuasarToggle', () => {
  it('updates aria-checked value when not inside a form', () => {
    mount(QuasarCheckboxAndToggle);

    cy.dataCy('toggle-outside-form').click();
    cy.dataCy('toggle-outside-form').should(
      'have.attr',
      'aria-checked',
      'true'
    );
    cy.dataCy('toggle-outside-form').click();
    cy.dataCy('toggle-outside-form').should(
      'have.attr',
      'aria-checked',
      'false'
    );
  });

  it('updates native checkbox when inside a form and with a name', () => {
    mount(QuasarCheckboxAndToggle);

    cy.dataCy('toggle-inside-form').click();
    dataCyCheckbox('toggle-inside-form').should('be.checked');
    cy.dataCy('toggle-inside-form').click();
    dataCyCheckbox('toggle-inside-form').should('not.be.checked');
  });
});
