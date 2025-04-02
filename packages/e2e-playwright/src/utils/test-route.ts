import { expect, type Page } from "@playwright/test";
import { minimatch } from "minimatch";

export async function testRoute(page: Page, route: string) {
  await expect.poll(async () => {
    const url = page.url();
    const parsedUrl = new URL(url);
    const usesHashModeRouter = parsedUrl.hash.length > 0;

    const target = usesHashModeRouter ? parsedUrl.hash : parsedUrl.pathname;
    const pattern = usesHashModeRouter ? `#/${route}` : `/${route}`;

    return minimatch(target, pattern, { nocomment: true });
  }).toBe(true);
}