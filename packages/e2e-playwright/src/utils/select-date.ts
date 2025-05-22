import { Locator, expect } from '@playwright/test';

/**
 * Selects a date in a Quasar date picker component
 * @param subject - Locator for the QDate component
 * @param value - Date to select (can be Date object or string)
 * @param options - Optional configuration options
 */
export async function selectDate(
  subject: Locator,
  value: Date | string,
  options: { timeout?: number } = {}
) {
  const timeout = options.timeout || 5000;

  // Verify we're working with a QDate component
  const hasQDateClass = await subject.evaluate((el) =>
    el.classList.contains('q-date'),
  );

  if (!hasQDateClass) {
    throw new Error('Subject is not a QDate component. Make sure you are targeting a Quasar date picker.');
  }

  const targetDate = typeof value === 'string' ? new Date(value) : value;

  // Wait for date picker to be fully rendered
  await subject
    .locator('.q-date__navigation div:not(.q-date__arrow)')
    .last()
    .waitFor();
  const yearSelector = subject
    .locator('.q-date__navigation div:not(.q-date__arrow)')
    .last();
  const monthSelector = subject
    .locator('.q-date__navigation div:not(.q-date__arrow)')
    .first();

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  const currentYear = await yearSelector.textContent();
  if (currentYear !== targetYear.toString()) {
    await yearSelector.click();
    await subject.locator(`text=${targetYear}`).click();
  }

  // Select month
  await monthSelector.click();
  const monthOption = subject.locator('.q-date__months-item').nth(targetMonth);
  await expect(monthOption).toBeVisible();
  await monthOption.click();

  // Select day
  const daySelector = subject
    .locator(`.q-date__calendar-item--in:has-text("${targetDay}")`)
    .first();
  await expect(daySelector).toBeVisible({ timeout });
  await daySelector.click();
}
