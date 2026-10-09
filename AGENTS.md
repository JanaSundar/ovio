<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Every new component ships with its OG image

Each component gets a share image at `/og/<slug>`, built by `app/og/[slug]/route.tsx` from `COMPONENTS` in `content/components.ts`. The docs page uses it for Open Graph and Twitter. The left side (name, description, count) comes from `COMPONENTS`; the right-hand card is yours to draw.

When you add a component:

- Add an entry keyed by its slug to `ARTS` in `lib/og/art.tsx`: `label` (its name), `metric` (a short uppercase readout, like `"3 QUEUED"`; identifiers such as `v2.4.0` keep their case), `footer` (two or three uppercase words) and `draw`, a small function that sketches the component.
- Draw with the helpers in `lib/og/art.tsx` and `lib/og/card.tsx` (`row`, `col`, `RAMP`, `lime`, `line`, `Label`, `ink`, `muted`, `mono`, `sans`). Takumi renders it: inline styles and flexbox only, no images, no Tailwind classes.
- Open `/og/<slug>` on the dev server and check the 1200×630 card: nothing clipped, and it reads as the component at a glance.

Without an entry the image silently borrows the Contribution Graph drawing; `tests/unit/components.test.ts` fails when that happens.
