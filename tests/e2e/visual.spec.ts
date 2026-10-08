import { expect, test } from "@playwright/test";
import { COMPONENTS, open, WORLDS } from "./helpers";

for (const world of WORLDS) {
  test(`home specimen · ${world}`, async ({ page }) => {
    await open(page, "/", world);
    await expect(page.locator(".sample-wrap")).toHaveScreenshot(`home-${world}.png`);
  });

  for (const c of COMPONENTS) {
    test(`${c.slug} · ${world}`, async ({ page }) => {
      await open(page, `/docs/${c.slug}`, world);
      await expect(page.locator(".stage-frame")).toHaveScreenshot(`${c.slug}-${world}.png`);
    });
  }
}

test("home page layout", async ({ page }) => {
  await open(page, "/");
  await expect(page).toHaveScreenshot("home-full.png", { fullPage: true });
});
