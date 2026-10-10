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

| Component                                                                     | Status    | Description                                                                           |
| ----------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| [Contribution Graph](https://ovioui.vercel.app/docs/contribution-graph)       | Available | A year of activity, one cell per day.                                                 |
| [Gooey Tabs](https://ovioui.vercel.app/docs/gooey-tabs)                       | Available | A tab bar with a moving indicator and a deploy status.                                |
| [Star History](https://ovioui.vercel.app/docs/star-history)                   | Available | Stargazers over time, with annotated spikes.                                          |
| [Repository Card](https://ovioui.vercel.app/docs/repository-card)             | Available | A repo at a glance: name, description, stars, forks and language.                     |
| [Top Contributors](https://ovioui.vercel.app/docs/top-contributors)           | Available | The people behind a project, ranked by commits.                                       |
| [npm Downloads](https://ovioui.vercel.app/docs/npm-downloads)                 | Available | Weekly installs with trend and goal.                                                  |
| [Physical Knob](https://ovioui.vercel.app/docs/physical-knob)                 | Available | A rotary control you can drag, flick, scroll or turn with the keyboard.               |
| [Bundle Size](https://ovioui.vercel.app/docs/bundle-size)                     | Available | Package size with gzip, brotli and the change from the previous version.              |
| [Changelog](https://ovioui.vercel.app/docs/changelog)                         | Available | Releases with dates and notes.                                                        |
| [Event Ticket](https://ovioui.vercel.app/docs/event-ticket)                   | Available | A pass for launches and conferences: book it, tear the stub, flip it for the QR code. |
| [Sponsor Wall](https://ovioui.vercel.app/docs/sponsor-wall)                   | Available | Sponsors by tier, from a logo wall to blocks on a pegboard.                           |
| [Developer ID Card](https://ovioui.vercel.app/docs/developer-id-card)         | Available | An identity card for a developer: name, role, stack, availability and a QR code.      |
| [Git Branch Visualizer](https://ovioui.vercel.app/docs/git-branch-visualizer) | Available | Branches and commits as a graph you can select, merge and branch off.                 |
| [Now Playing](https://ovioui.vercel.app/docs/now-playing)                     | Available | What you're listening to, with play, seek and volume.                                 |
| [Toast](https://ovioui.vercel.app/docs/toast)                                 | Available | Notifications in every world, from a taped note to a terminal line.                   |

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
`@number-flow/react`, `uqr` for QR codes) and the shared Ovio items it needs, including the theme at `styles/ovio.css`.
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

Three optional registry items fetch real data on the server, already shaped for the components:

```bash
npx shadcn add JanaSundar/ovio/github   # lib/github.ts
npx shadcn add JanaSundar/ovio/npm      # lib/npm.ts
npx shadcn add JanaSundar/ovio/music    # lib/music.ts
```

- `lib/github.ts`: `getRepository`, `getStarHistory`, `getContributors`, `getReleases`,
  `getContributions`, `getCommitGraph` and `getDeveloper` (a profile as Developer ID Card props).
- `lib/npm.ts`: `getWeeklyDownloads` (npm registry) and `getBundleSizes` (bundlephobia).
- `lib/music.ts`: `getNowPlaying(services)` asks whichever music service is attached. `spotify()`
  and `lastfm()` read their credentials from the environment (see `.env.example`), and
  `musicService({ name, url, map })` adapts any other JSON API.

All are `server-only` and use native `fetch` through `lib/ovio-fetch.ts`. The GitHub helpers read
`GITHUB_TOKEN` from the environment, or take `{ token }`. The npm helpers need no key.

```bash
# .env.local
GITHUB_TOKEN=github_pat_...
```

```tsx
import { RepositoryCard } from "@/components/ovio/repository-card/repository-card";
import { getRepository } from "@/lib/github";

export default async function Page() {
  return <RepositoryCard repository={await getRepository("honojs/hono")} />;
}
```

### Rate limits on a static site

- **Responses are cached for an hour by default.** Pass `{ revalidate }` to change it. A static or
  ISR page calls each API at most once per window, however much traffic it gets. If a refresh
  fails, Next keeps serving the last good page.
- **A spent limit throws `RateLimitError`,** with `resetAt` and a message like "github.com rate
  limit reached, resets in 12 min". Every request times out after 10 seconds.
- **GitHub:** 60 requests an hour without a token, 5,000 with one. `getContributions` uses GraphQL,
  which needs a token. `getStarHistory` makes up to 16 requests, and GitHub lists stargazers only
  to the repository's owner, so it charts your own repos, not someone else's.
- **npm:** the downloads API is keyless and serves up to 18 months.
- **bundlephobia:** unofficial, and it answers 429 after a few quick requests. Call
  `getBundleSizes` without `versions` to read its history in one request.

Each component's docs page has a Data section with its source, auth and limits.

### Client-side data

To fetch from your own API route in the browser, `useLiveData` shares one request per page and
shows a fallback until the response arrives, or if it fails. Pair it with the Toast to report
errors:

```bash
npx shadcn add JanaSundar/ovio/live-data JanaSundar/ovio/toast
```

```tsx
const { data } = useLiveData("/api/stars", sampleStars, {
  onError: (error, retry) =>
    ovioToast.error(error.message, { action: { label: "Retry", onClick: retry } }),
});
```

Mount `<OvioToaster />` once, for example in your root layout.

## README embeds

Three components also come as images for a GitHub README, in any world. There's nothing to
install: paste the Markdown, and the image refreshes every hour.

```md
[![honojs/hono](https://ovioui.vercel.app/embed/repository-card?repo=honojs/hono&world=toy)](https://github.com/honojs/hono)
[![hono](https://ovioui.vercel.app/embed/npm-downloads?package=hono&world=retro)](https://www.npmjs.com/package/hono)
[![JanaSundar](https://ovioui.vercel.app/embed/developer-id-card?user=JanaSundar&world=craft)](https://github.com/JanaSundar)
```

| Embed             | Subject                          | Data                                                                     |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Repository Card   | `?repo=owner/name`               | GitHub's REST API: the repository                                        |
| npm Downloads     | `?package=name` or `@scope/name` | npm's downloads API: the last 12 weeks                                   |
| Developer ID Card | `?user=login`                    | GitHub's REST API: the profile and the languages of the user's own repos |

- `&world=` is `minimal` (default), `craft`, `retro` or `toy`; `&format=png` returns a PNG at 2×
  instead of an SVG.
- Only public data anyone can read makes an embed. A user's contributions need GitHub's GraphQL
  API and their own token, so the Contribution Graph has no embed: render the component instead.
- Each docs page with an embed has a field to try a name and copy its Markdown.
- A name that doesn't exist, an organisation given as a developer, or an outage shows a small card
  saying so rather than a broken image.

## Development

This repo is the docs site at [ovioui.vercel.app](https://ovioui.vercel.app) and the registry source.

```bash
pnpm install            # also installs the git hooks (Lefthook)
pnpm dev                # docs site at http://localhost:3000
pnpm build              # builds the site
pnpm registry:validate  # checks registry.json and that every file it lists exists
pnpm registry:check     # checks every registry item installs with all the files it imports
pnpm lint               # oxlint
pnpm format             # oxfmt
pnpm typecheck          # next typegen && tsc --noEmit
pnpm test               # unit tests (Vitest)
```

Git hooks run through [Lefthook](https://lefthook.dev) (`lefthook.yml`): before a commit, the
staged files are formatted and linted; before a push, the project is type-checked, unit-tested and
registry-checked. Skip them once with `LEFTHOOK=0`, e.g. `LEFTHOOK=0 git commit -m "wip"`.

- `components/ovio/<name>/`: each component, its shared state, and one file per world in `worlds/`.
- `components/shared/`, `lib/`, `styles/ovio.css`: the shared registry items (world, motion
  tokens, theme, formatting, keyboard handling, rolling numbers, Toy primitives).
- `registry.json`: the registry. The shadcn CLI reads it and the source files straight from this
  repository.
- `app/`, `components/site/`, `content/`: the docs site.
- `app/embed/`, `lib/embed/`: the README embeds, drawn for each world and rendered with Takumi.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) and [React 19](https://react.dev)
- [Motion for React](https://motion.dev) and [NumberFlow](https://number-flow.barvian.me)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn](https://ui.shadcn.com) registry
- [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- [Vitest](https://vitest.dev) and [Lefthook](https://lefthook.dev)
- TypeScript, pnpm

## License

[MIT](LICENSE) © Jana Sundar
