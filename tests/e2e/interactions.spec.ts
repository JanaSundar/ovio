import { expect, test } from "@playwright/test";
import { open, settle } from "./helpers";

test("number keys switch the world", async ({ page }) => {
  await open(page, "/");
  const caption = page.locator(".specimen-caption strong");
  await expect(caption).toHaveText("minimal");
  for (const [key, world] of [
    ["2", "craft"],
    ["3", "retro"],
    ["4", "toy"],
    ["1", "minimal"],
  ]) {
    await page.keyboard.press(key);
    await expect(caption).toHaveText(world);
  }
});

test("knob answers the keyboard", async ({ page }) => {
  await open(page, "/docs/physical-knob");
  const knob = page.getByRole("slider", { name: "Level" });
  const before = Number(await knob.getAttribute("aria-valuenow"));
  await knob.focus();
  await page.keyboard.press("ArrowRight");
  await settle(page);
  await expect(knob).not.toHaveAttribute("aria-valuenow", String(before));
});

test("star history scrubs with the keyboard", async ({ page }) => {
  await open(page, "/docs/star-history");
  const chart = page.getByRole("slider").first();
  await chart.focus();
  const latest = await chart.getAttribute("aria-valuetext");
  await page.keyboard.press("Home");
  await expect(chart).not.toHaveAttribute("aria-valuetext", latest ?? "");
});

test("repository card star toggles in Toy", async ({ page }) => {
  await open(page, "/docs/repository-card", "toy");
  const star = page.getByRole("button", { name: "Star", exact: true });
  await star.click();
  await expect(page.getByRole("button", { name: "Unstar" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("git visualizer merges, branches and resets", async ({ page }) => {
  await open(page, "/docs/git-branch-visualizer");
  const stage = page.locator(".stage-frame");
  const merge = stage.getByRole("button", { name: /^Merge / });
  if (await merge.count()) {
    await merge.click();
    await settle(page);
  }
  await stage.getByRole("button", { name: /^Branch from/ }).click();
  await settle(page);
  const reset = stage.getByRole("button", { name: "Reset" });
  await expect(reset).toBeEnabled();
  await reset.click();
  await settle(page);
  await expect(reset).toBeDisabled();
});

test("event ticket books an attendee", async ({ page }) => {
  await open(page, "/docs/event-ticket");
  const stage = page.locator(".stage-frame");
  await stage.getByLabel("Full name").fill("Ada Park");
  await stage.getByLabel("Email").fill("ada@example.com");
  await stage.getByRole("button", { name: "Book your spot" }).click();
  await settle(page);
  await expect(stage.getByLabel("Full name")).toHaveCount(0);
});

test("docs search filters the component list", async ({ page }) => {
  await open(page, "/docs/contribution-graph");
  await page.keyboard.press("/");
  await page.keyboard.type("knob");
  const links = page.locator(".side-links a");
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveText(/Physical Knob/);
});

test("docs pages load without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page, "/");
  await open(page, "/docs/repository-card");
  await open(page, "/docs/contribution-graph");
  expect(errors).toEqual([]);
});

test("repository card hydrates cleanly long after the build", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  // A visit weeks after the page was prerendered: "updated … ago" must not mismatch.
  await open(page, "/docs/repository-card", "minimal", new Date("2027-01-15T12:00:00Z"));
  await expect(page.locator(".stage-frame")).toContainText("3mo ago");
  expect(errors).toEqual([]);
});
