declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to work in the context of a portal-based component.
       * @example cy.withinPortal('.cy-greeting-dialog', () => { doSomething() })
       * @example cy.withinPortal({ dataCy: 'reprocess-dialog }, () => { doSomething() })
       */
      withinPortal<E extends Node = HTMLElement>(
        selectorOrOptions: string | WithinPortalOptions,
        fn: WithinPortalCallback<E>,
      ): Chainable<JQuery<E>>;

      /**
       * Custom command to work in the context of a QSelect options menu
       * It assumes there's a single select menu open at any time,
       * but allows you to provide a custom selector or dataCy id
       * if you need more specificity
       *
       * It assumes the QSelect options menu closes after performing all actions inside the provided callback.
       * If this is not the case, use `{ persistent: true }` option
       *
       * @example cy.withinSelectMenu(() => { doSomething() })
       * @example cy.withinSelectMenu({ dataCy: 'select-menu', fn: () => { doSomething() } })
       * @example cy.withinSelectMenu({ selector: '.cy-books-menu', fn: () => { doSomething() } })
       * @example cy.withinSelectMenu({ persistent: true, fn: () => { doSomething() } })
       */
      withinSelectMenu<E extends Node = HTMLElement>(
        fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>,
      ): Chainable<JQuery<E>>;

      /**
       * Custom command to work in the context of a QMenu
       * It assumes there's a single menu open at any time,
       * but allows you to provide a custom selector or dataCy id
       * if you need more specificity
       *
       * It assumes the QMenu closes after performing all actions inside the provided callback.
       * If this is not the case, use `{ persistent: true }` option
       *
       * @example cy.withinMenu(() => { doSomething() })
       * @example cy.withinMenu({ dataCy: 'select-menu', fn: () => { doSomething() } })
       * @example cy.withinMenu({ selector: '.cy-books-menu', fn: () => { doSomething() } })
       * @example cy.withinMenu({ persistent: true, fn: () => { doSomething() } })
       */
      withinMenu<E extends Node = HTMLElement>(
        fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>,
      ): Chainable<JQuery<E>>;

      /**
       * Custom command to work in the context of a QDialog
       * It assumes there's a single dialog open at any time,
       * but allows you to provide a custom selector or dataCy id
       * if you need more specificity
       *
       * It assumes the QDialog closes after performing all actions inside the provided callback.
       * If this is not the case, use `{ persistent: true }` option
       *
       * @example cy.withinDialog(() => { doSomething() })
       * @example cy.withinDialog({ dataCy: 'reprocess-dialog', fn: () => { doSomething() } })
       * @example cy.withinDialog({ selector: '.cy-delete-dialog', fn: () => { doSomething() } })
       * @example cy.withinDialog({ persistent: true, fn: () => { doSomething() } })
       */
      withinDialog<E extends Node = HTMLElement>(
        fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>,
      ): Chainable<JQuery<E>>;
    }
  }
}

type WithinPortalCallback<E extends Node = HTMLElement> = (
  currentSubject: JQuery<E>,
) => void;

interface WithinPortalOptions {
  dataCy: string;
}

interface WithinPortalDerivateOptions<E extends Node = HTMLElement> {
  /** Callback to execute within the scope of the Portal-based component */
  fn: WithinPortalCallback<E>;
  /**
   * Custom selector in case more specificity is needed,
   * eg. you need to differentiate between multiple open dialogs
   * For cases where using data-cy attributes is too troublesome
   * @example
   * .cy-books-menu
   * .cy-reprocess-plugin
   */
  selector?: string;
  /**
   * dataCy id in case more specificity is needed,
   * eg. you need to differentiate between multiple open dialogs
   */
  dataCy?: string;
  /**
   * If set to true, instruct the command to avoid the check for the Portal-based component
   * to be closed after the callback finished executing
   */
  persistent?: boolean;
}

// TODO: make cy.dataCy Withinable as cy.get
function getDataCySelector(dataCy: string) {
  return `[data-cy=${dataCy}]`;
}

function portalDerivateCommand<E extends Node = HTMLElement>(
  selectorDefault: string,
  selectorSuffix: string,
  fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>,
) {
  const {
    dataCy = undefined,
    persistent = false,
    selector = selectorDefault,
  } = typeof fnOrOptions === 'function' ? {} : fnOrOptions;

  const fn = typeof fnOrOptions === 'function' ? fnOrOptions : fnOrOptions.fn;

  const portalSelector = `${
    dataCy ? getDataCySelector(dataCy) : selector
  }${selectorSuffix}`;

  return cy.withinPortal(portalSelector, fn).should(($el) => {
    if (!persistent) {
      cy.wrap($el).should('not.exist');
    }
  });
}

export function registerPortalHelpers() {
  Cypress.Commands.add('withinPortal', { prevSubject: false }, function <
    E extends Node = HTMLElement,
  >(selectorOrOptions: string | WithinPortalOptions, fn: WithinPortalCallback<E>) {
    const selector =
      typeof selectorOrOptions === 'string'
        ? selectorOrOptions
        : getDataCySelector(selectorOrOptions.dataCy);

    return (
      cy
        .get<E>(selector, {
          withinSubject: Cypress.$('body'),
        })
        // Assert there's only one portal-based element that match the selection before continuing,
        // avoids delay due to transitions
        .should('have.length', 1)
        .within(fn)
    );
  });

  Cypress.Commands.add('withinSelectMenu', { prevSubject: false }, function <
    E extends Node = HTMLElement,
  >(fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>) {
    return portalDerivateCommand('.q-menu', '[role=listbox]', fnOrOptions);
  });

  Cypress.Commands.add('withinMenu', { prevSubject: false }, function <
    E extends Node = HTMLElement,
  >(fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>) {
    // Without `:not([role])` this would match select options menus too
    return portalDerivateCommand('.q-menu', ':not([role])', fnOrOptions);
  });

  Cypress.Commands.add('withinDialog', { prevSubject: false }, function <
    E extends Node = HTMLElement,
  >(fnOrOptions: WithinPortalCallback<E> | WithinPortalDerivateOptions<E>) {
    return portalDerivateCommand('.q-dialog', '', fnOrOptions);
  });
}
