import { posthog } from "posthog-js";

/**
 * PostHog, started once in the browser before the app hydrates, on the production deployment
 * only: local dev, local builds and Vercel previews send nothing. The token and host come from
 * the environment (.env.local, or Vercel's project settings).
 */
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

if (token && isProduction) {
  posthog.init(token, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Never show survey popups, even if one is created in PostHog; the script isn't loaded either.
    disable_surveys: true,
  });
}
