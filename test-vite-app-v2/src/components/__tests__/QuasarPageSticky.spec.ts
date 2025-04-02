import { test, expect } from '@playwright/experimental-ct-vue';
import LayoutContainer from 'app/test/cypress/wrappers/LayoutContainer.vue';
import QuasarPageSticky from '../QuasarPageSticky.vue';

test.describe('QuasarPageSticky', () => {
  test('should show a sticky at the bottom-right of the page', async ({
    mount,
    page,
  }) => {
    const component = await mount(LayoutContainer, {
      props: {
        component: QuasarPageSticky,
      },
    });

    const button = component.getByTestId('button');
    await expect(button).toBeVisible();

    const buttonBox = await button.boundingBox();
    const viewport = page.viewportSize();

    if (!buttonBox || !viewport) {
      throw new Error('Could not read bounding box or viewport size');
    }

    const buttonBottom: number = buttonBox.y + buttonBox.height;
    const buttonRight: number = buttonBox.x + buttonBox.width;

    expect(buttonBottom).toBeCloseTo(viewport.height - 18, 1);
    expect(buttonRight).toBeCloseTo(viewport.width - 18, 1);
  });
});
