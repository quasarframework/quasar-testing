import { test as baseTest, Locator } from '@playwright/test';
import { addCoverageToContext } from './coverage.js';
import {
    WithinPortalCallback,
    WithinPortalDerivateOptions,
} from './portal-helper.js';
import { withinSelectMenu, withinDialog, withinMenu } from './portals.js';
import { selectDate } from './select-date.js';
import { selectQSelectOption, uncheckQuasarComponent, checkQuasarComponent, expectQuasarChecked } from './select.js';
import { expectColor, expectBackgroundColor } from './color-assertions.js';
export { expect } from '@playwright/test';

type PortalFnOrOptions = WithinPortalCallback | WithinPortalDerivateOptions;

interface BaseTest {
    withinDialog: (fnOrOptions: PortalFnOrOptions) => Promise<Locator>;
    withinMenu: (fnOrOptions: PortalFnOrOptions) => Promise<Locator>;
    withinSelectMenu: (fnOrOptions: PortalFnOrOptions) => Promise<Locator>;
    selectDate: typeof selectDate;
    selectQSelectOption: typeof selectQSelectOption;
    checkQuasarComponent: typeof checkQuasarComponent;
    uncheckQuasarComponent: typeof uncheckQuasarComponent;
    expectQuasarChecked: typeof expectQuasarChecked;
    expectColor: typeof expectColor;
    expectBackgroundColor: typeof expectBackgroundColor;
}

export const test = baseTest.extend<BaseTest>({
    context: async ({ context }, use) => addCoverageToContext(context, use),
    withinDialog: async ({ page }, use) => {
        const withinDialogWrapper = (
            fnOrOptions: PortalFnOrOptions,
        ): Promise<Locator> => withinDialog(page, fnOrOptions);

        await use(withinDialogWrapper);
    },
    withinMenu: async ({ page }, use) => {
        const withinMenuWrapper = (
            fnOrOptions: PortalFnOrOptions,
        ): Promise<Locator> => withinMenu(page, fnOrOptions);

        await use(withinMenuWrapper);
    },
    withinSelectMenu: async ({ page }, use) => {
        const withinSelectMenuWrapper = (
            fnOrOptions: PortalFnOrOptions,
        ): Promise<Locator> => withinSelectMenu(page, fnOrOptions);

        await use(withinSelectMenuWrapper);
    },
    selectDate: async ({ }, use) => await use(selectDate),
    selectQSelectOption: async ({ }, use) => await use(selectQSelectOption),
    checkQuasarComponent: async ({ }, use) => await use(checkQuasarComponent),
    uncheckQuasarComponent: async ({ }, use) => await use(uncheckQuasarComponent),
    expectQuasarChecked: async ({ }, use) => await use(expectQuasarChecked),
    expectColor: async ({ }, use) => await use(expectColor),
    expectBackgroundColor: async ({ }, use) => await use(expectBackgroundColor),
});
