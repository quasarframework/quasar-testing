import { test, expect } from '@quasar/quasar-app-extension-testing-e2e-playwright/ct';
import AppButton from 'src/components/AppButton.vue';

test('renders a message', async ({ mount }) => {
  const label = 'Hello there';
  const component = await mount(AppButton, { props: { label } });

  await expect(component).toContainText(label);
});

test('renders another message', async ({ mount }) => {
  const label = 'Will this work?';
  const component = await mount(AppButton, { props: { label } });
  await expect(component).toContainText(label);
});

test('should have a `positive` color', async ({ mount }) => {
  const button = await mount(AppButton);

  const bgColor = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const textColor = await button.evaluate((el) => window.getComputedStyle(el).color);

  const quasarPositiveVar = 'rgb(33, 186, 69)';
  expect(bgColor).toBe(quasarPositiveVar);
  expect(textColor).toBe('rgb(255, 255, 255)');
});

test('should emit `test` upon click', async ({ mount }) => {
  let eventCount = 0;

  const component = await mount(AppButton, {
    on: {
      test: () => {
        eventCount++;
      },
    },
  });

  await component.click();
  expect(eventCount).toBe(1);
  await component.click();
  expect(eventCount).toBe(2);
});
