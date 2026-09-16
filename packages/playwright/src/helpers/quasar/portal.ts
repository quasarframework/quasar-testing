import { expect, type Locator, type Page } from '@playwright/test';

/*
  Quasar renders overlays into "#q-portal--<kind>--<n>" containers. The counter
  only grows. A container id pins one specific overlay for its whole life.
  Quasar removes the container on a timer after the leave transition. The
  helpers below treat a detached container as closed.
*/

export type PortalKind = 'dialog' | 'menu' | 'tooltip';

// The dialog inner container ignores pointer events and a minimized dialog
// keeps 24px of padding around its content, so this corner of the backdrop is
// free. A maximized or edge-positioned dialog has no free corner.
export const BACKDROP_CLICK_POSITION = { x: 4, y: 4 };

function portalIdPrefix(kind: PortalKind) {
  return `q-portal--${kind}--`;
}

/** Indexes of the portal containers in the DOM. [3, 5] for --3 and --5. */
export async function portalIndexes(
  page: Page,
  kind: PortalKind,
): Promise<number[]> {
  const prefix = portalIdPrefix(kind);

  return page
    .locator(`[id^="${prefix}"]`)
    .evaluateAll(
      (elements, idPrefix) =>
        elements.map((element) => Number(element.id.slice(idPrefix.length))),
      prefix,
    );
}

export interface PortalContainer {
  container: Locator;
  containerId: string;
}

/** The container of the portal that holds the element, with its id. */
export async function portalContainerOf(
  elementInPortal: Locator,
): Promise<PortalContainer> {
  // Quasar's Dialog plugin mounts a wrapper app into the portal element. For a
  // single-root wrapper component the container is a grandparent of the
  // element. closest() walks up however many levels that takes.
  const { containerId, className } = await elementInPortal.evaluate(
    (element) => ({
      containerId: element.closest('[id^="q-portal--"]')?.id ?? '',
      className: element.getAttribute('class') ?? '',
    }),
  );

  if (!containerId) {
    throw new Error(
      `The element is not inside a Quasar portal (class="${className}")`,
    );
  }

  return {
    container: elementInPortal.page().locator(`#${containerId}`),
    containerId,
  };
}

/** Runs the trigger and returns the portal container that appeared because of it. */
export async function waitForNewPortal(
  page: Page,
  kind: PortalKind,
  trigger: () => Promise<void>,
): Promise<Locator> {
  const indexesBefore = await portalIndexes(page, kind);
  const highestBefore =
    indexesBefore.length === 0 ? -1 : Math.max(...indexesBefore);

  await trigger();

  // evaluateAll() returns elements in document order. Quasar re-appends and
  // moves portal nodes at runtime. Document order does not track index order.
  // The newest portal is the one with the highest index.
  let newIndex: number | undefined;
  await expect
    .poll(
      async () => {
        const indexes = await portalIndexes(page, kind);
        const newIndexes = indexes.filter((index) => index > highestBefore);
        newIndex =
          newIndexes.length === 0 ? undefined : Math.max(...newIndexes);
        return newIndex;
      },
      { message: `Waiting for a new Quasar ${kind} portal to open` },
    )
    .toBeDefined();

  if (newIndex === undefined) {
    throw new Error(`No new Quasar ${kind} portal appeared`);
  }

  return page.locator(`#${portalIdPrefix(kind)}${newIndex}`);
}

export async function waitForPortalClosed(container: Locator) {
  await container.waitFor({ state: 'detached' });
}
