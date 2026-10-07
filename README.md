# Ovio

The motion layer for developer websites. Ovio is a [shadcn](https://ui.shadcn.com) registry of
animated components for showing off a project: contribution graphs, star history, release notes,
download charts and more. The CLI copies the TypeScript source into your repo, so you own and can
edit every line.

Every component comes in four design worlds, picked with the `variant` prop or a site-wide
`OvioProvider`:

- **Minimal**: clean digital objects. Whitespace, thin rules, quick motion with no overshoot.
- **Craft**: physical artefacts. Paper, tape and printed labels that settle with a soft overshoot.
- **Retro**: nostalgic hardware. Phosphor terminals and pixels that move in hard steps.
- **Toy**: playful plastic. Raised keys, knobs and pieces driven by springs and physics.

All motion respects `prefers-reduced-motion`.

## Components

| Component                                                      | Status       | Description                                                              |
| -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| [Contribution Graph](https://ovio.dev/docs/contribution-graph) | Available    | A year of activity, one cell per day.                                    |
| [Gooey Tabs](https://ovio.dev/docs/gooey-tabs)                 | Available    | A tab bar with a moving indicator and a deploy status.                   |
| [Star History](https://ovio.dev/docs/star-history)             | Available    | Stargazers over time, with annotated spikes.                             |
| [Repository Card](https://ovio.dev/docs/repository-card)       | Available    | A repo at a glance: name, description, stars, forks and language.        |
| [Top Contributors](https://ovio.dev/docs/top-contributors)     | Available    | The people behind a project, ranked by commits.                          |
| [npm Downloads](https://ovio.dev/docs/npm-downloads)           | Available    | Weekly installs with trend and goal.                                     |
| [Physical Knob](https://ovio.dev/docs/physical-knob)           | Available    | A rotary control you can drag, flick, scroll or turn with the keyboard.  |
| [Bundle Size](https://ovio.dev/docs/bundle-size)               | Available    | Package size with gzip, brotli and the change from the previous version. |
| [Changelog](https://ovio.dev/docs/changelog)                   | Available    | Releases with dates and notes.                                           |
| Event Ticket                                                   | Coming later | A pass for launches and conferences.                                     |
| Sponsor Wall                                                   | Coming later | Sponsors by tier, from a logo wall to blocks on a pegboard.              |
| Developer ID Card                                              | Coming later | An identity card for a developer.                                        |
| Git Branch Visualizer                                          | Coming later | Branches and commits as a graph.                                         |
| Now Playing                                                    | Coming later | What you're listening to, live.                                          |

The catalogue lives in [`content/components.ts`](content/components.ts).

## Installation

Ovio needs a project set up for shadcn (React 19, Tailwind CSS v4). This GitHub repository is the
registry, so there is nothing to configure. Add a component by name:

```bash
npx shadcn add JanaSundar/ovio/star-history
```

Append `#<tag>` or a commit SHA to pin a version, for example
`npx shadcn add JanaSundar/ovio/star-history#v0.1.0`.

The CLI installs the component under `components/ovio/<name>/`, its npm dependencies (`motion`,
`@number-flow/react`) and the shared Ovio items it needs, including the theme at `styles/ovio.css`.
Import the theme from your global stylesheet (the path is relative to that file):

```css
@import "tailwindcss";
@import "../styles/ovio.css";
```

The worlds use Geist, Geist Mono, Bricolage Grotesque, IBM Plex Mono, Caveat, VT323 and Archivo.
The theme reads them from `next/font` variables (`--font-geist`, `--font-vt323` and so on) and
falls back to the family names, so load them with `next/font/google` or Google Fonts.

`npx shadcn add JanaSundar/ovio/all` adds every available component at once.

## Usage

```tsx
import { StarHistory } from "@/components/ovio/star-history/star-history";

<StarHistory variant="craft" data={stars} repo="ada-dev/lumen" />;
```

To set the world for a whole site, wrap it in `OvioProvider`. A component's own `variant` still
wins.

```tsx
import { OvioProvider } from "@/components/shared/world-provider";

<OvioProvider world="retro">{children}</OvioProvider>;
```

## Data helpers

Two optional registry items fetch real data on the server, already shaped for the components:

```bash
npx shadcn add JanaSundar/ovio/github   # lib/github.ts
npx shadcn add JanaSundar/ovio/npm      # lib/npm.ts
```

- `lib/github.ts`: `getRepository`, `getStarHistory`, `getContributors`, `getReleases` and
  `getContributions`.
- `lib/npm.ts`: `getWeeklyDownloads` (npm registry) and `getBundleSizes` (bundlephobia).

Both are `server-only` and cache responses for an hour by default (pass `{ revalidate }` to
change it). The GitHub helpers read `GITHUB_TOKEN` from the environment, or take `{ token }`.
Without a token GitHub allows 60 requests an hour, and `getContributions` needs one because it
uses the GraphQL API. The npm helpers need no key.

```bash
# .env.local
GITHUB_TOKEN=ghp_...
```

```tsx
import { StarHistory } from "@/components/ovio/star-history/star-history";
import { getStarHistory } from "@/lib/github";

export default async function Page() {
  const stars = await getStarHistory("vercel/next.js");
  return <StarHistory data={stars} repo="vercel/next.js" />;
}
```

## Development

This repo is the docs site at [ovio.dev](https://ovio.dev) and the registry source.

```bash
pnpm install
pnpm dev                # docs site at http://localhost:3000
pnpm build              # builds the site
pnpm registry:validate  # checks registry.json and that every file it lists exists
pnpm lint               # oxlint
pnpm format             # oxfmt
pnpm typecheck          # next typegen && tsc --noEmit
```

- `components/ovio/<name>/`: each component, its shared state, and one file per world in `worlds/`.
- `components/shared/`, `lib/`, `styles/ovio.css`: the shared registry items (world, motion
  tokens, theme, formatting, keyboard handling, rolling numbers, Toy primitives).
- `registry.json`: the registry. The shadcn CLI reads it and the source files straight from this
  repository.
- `app/`, `components/site/`, `content/`: the docs site.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and [React 19](https://react.dev)
- [Motion for React](https://motion.dev) and [NumberFlow](https://number-flow.barvian.me)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn](https://ui.shadcn.com) registry
- [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- TypeScript, pnpm

## License

MIT
