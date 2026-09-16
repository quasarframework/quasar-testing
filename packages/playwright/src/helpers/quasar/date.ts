import { expect, type Locator } from '@playwright/test';
import { toDateParts, type DateInput } from './date-parts';
import { closestWithClass } from './root';

export type { DateInput, DateParts } from './date-parts';

/*
  The QDate facts this file relies on, from the Quasar source. Last verified
  against Quasar 2.32.3. The QuasarDate demo spec covers them.
  - .q-date__view is the active view; two exist during the fade between views
  - the calendar navigation has 6 direct children: arrow, month label, arrow,
    arrow, year label, arrow. Each label wrapper holds a .q-btn inside a jump
    transition, so two buttons exist for about 300 ms after a change
  - the years view shows 21 years from a multiple of 20, with a previous and a
    next button as the first and last .q-btn of the view
  - the months view has 12 .q-date__months-item in calendar order
  - day cells are .q-date__calendar-item. --fill cells pad the grid. --out cells
    are the ones the options prop rejects. Only --in cells hold a .q-btn
*/

const YEARS_PER_PAGE = 20;
// Enough for the year view, the months view, the calendar and the transitions between them.
const MAX_NAVIGATION_STEPS = 12;
// 50 pages of 20 years covers 1000 years each way from the current page
const MAX_YEARS_PAGES = 50;

async function singleButton(wrapper: Locator) {
  const button = wrapper.locator('.q-btn');
  await expect(button).toHaveCount(1);
  return button;
}

async function clickEnabled(button: Locator, description: string) {
  if (await button.isDisabled()) {
    throw new Error(`${description} is disabled in this QDate`);
  }

  await button.click();
}

// QDate formats every displayed number through its locale. Persian digits are
// one example. Number() returns NaN for those. The error below says so,
// instead of letting NaN break the navigation math.
async function readDisplayedNumber(locator: Locator): Promise<number> {
  const text = (await locator.innerText()).trim();
  const value = Number(text);
  if (Number.isNaN(value)) {
    throw new Error(
      `The QDate shows a non-numeric label "${text}"; localized digits are not supported yet`,
    );
  }

  return value;
}

async function pickYear(root: Locator, year: number) {
  const yearsView = root.locator('.q-date__years');
  const items = yearsView.locator('.q-date__years-item .q-btn');
  const previousPage = yearsView.locator('.q-btn').first();
  const nextPage = yearsView.locator('.q-btn').last();

  for (let step = 0; step < MAX_YEARS_PAGES; step++) {
    const startYear = await readDisplayedNumber(items.first());
    const pageDelta = Math.floor((year - startYear) / YEARS_PER_PAGE);

    if (pageDelta === 0) {
      await clickEnabled(items.nth(year - startYear), `Year ${year}`);
      return;
    }

    await clickEnabled(
      pageDelta > 0 ? nextPage : previousPage,
      'The years pager',
    );
  }

  throw new Error(
    `Could not reach year ${year} in the QDate years view within ${MAX_YEARS_PAGES} pages`,
  );
}

export async function selectDate(
  target: Locator,
  value: DateInput,
): Promise<Locator> {
  const root = closestWithClass(target, 'q-date');
  const { year, month, day } = toDateParts(value);
  const view = root.locator('.q-date__view');
  let monthPicked = false;

  for (let step = 0; step < MAX_NAVIGATION_STEPS; step++) {
    await expect(view).toHaveCount(1);
    const viewClass = (await view.getAttribute('class')) ?? '';

    if (viewClass.includes('q-date__years')) {
      await pickYear(root, year);
      // navigation-min-year-month and navigation-max-year-month can clamp the
      // year change to another month. The month step runs again.
      monthPicked = false;
      continue;
    }

    if (viewClass.includes('q-date__months')) {
      await clickEnabled(
        root.locator('.q-date__months-item .q-btn').nth(month - 1),
        `Month ${month}`,
      );
      monthPicked = true;
      continue;
    }

    const labels = root.locator(
      '.q-date__navigation > div:not(.q-date__arrow)',
    );
    const yearLabel = await singleButton(labels.last());
    if ((await readDisplayedNumber(yearLabel)) !== year) {
      await yearLabel.click();
      continue;
    }

    // The month label is localized. The months view avoids parsing it.
    if (!monthPicked) {
      await (await singleButton(labels.first())).click();
      continue;
    }

    const days = root.locator('.q-date__calendar-days');
    await expect(days).toHaveCount(1);
    const inMonthCells = days.locator(
      '.q-date__calendar-item:not(.q-date__calendar-item--fill)',
    );
    const dayCount = await inMonthCells.count();
    if (day > dayCount) {
      throw new Error(
        `Day ${day} does not exist in this month (${dayCount} days)`,
      );
    }

    const cell = inMonthCells.nth(day - 1);
    const cellClass = (await cell.getAttribute('class')) ?? '';
    if (!cellClass.includes('q-date__calendar-item--in')) {
      throw new Error(`Day ${day} is not selectable in this QDate`);
    }

    const dayButton = cell.locator('.q-btn');
    await dayButton.click();
    return dayButton;
  }

  throw new Error(`Could not navigate the QDate to ${year}-${month}-${day}`);
}
