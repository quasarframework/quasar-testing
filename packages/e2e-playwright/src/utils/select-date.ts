import { Locator } from '@playwright/test';

export async function selectDate(subject: Locator, value: Date | string) {
  const hasQDateClass = await subject.evaluate((el) =>
    el.classList.contains('q-date'),
  );

  if (!hasQDateClass) {
    throw new Error('Subject is not a QDate');
  }

  const targetDate = typeof value === 'string' ? new Date(value) : value;

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

  await monthSelector.click();
  await subject.locator('.q-date__months-item').nth(targetMonth).click();

  await subject
    .locator('.q-date__calendar-item--in:has-text("' + targetDay + '")')
    .click();
}
