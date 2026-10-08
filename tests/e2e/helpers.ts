import type { Page } from "@playwright/test";
import { COMPONENTS } from "@/content/components";
import { WORLDS } from "@/lib/world";

export { COMPONENTS, WORLDS };

/** A fixed "now", so relative times ("2d ago") and anything else clock-driven render the same. */
const NOW = new Date("2026-10-08T12:00:00Z");

/** Opens a page with a frozen clock and fonts loaded, in the given world (keys 1–4 pick it). */
export async function open(
  page: Page,
  path: string,
  world: (typeof WORLDS)[number] = "minimal",
  now = NOW,
) {
  await page.clock.install({ time: now });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  const key = WORLDS.indexOf(world) + 1;
  if (key > 1) await page.keyboard.press(String(key));
  await settle(page);
}

/** Lets springs, timers and staggered entrances finish on the frozen clock. */
export async function settle(page: Page) {
  await page.clock.runFor(4000);
  await page.evaluate(() => document.fonts.ready);
}
