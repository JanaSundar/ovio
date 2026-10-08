import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Visual and interaction checks against a production build. Screenshots are the safety net for
 * refactors: a change that should not alter the site must leave every one of them identical.
 * Run `pnpm build` first; `pnpm test:e2e --update-snapshots` records new baselines.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 0, animations: "disabled", caret: "hide" } },
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    baseURL: `http://localhost:${PORT}`,
    contextOptions: { reducedMotion: "reduce" },
  },
  webServer: {
    command: `pnpm start --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
