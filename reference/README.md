# Ovio — site mockup

Open `index.html` in a browser (double-click works, no server needed). It links to `docs.html`.

- `index.html` — homepage
- `docs.html` — documentation with live demos of 14 components in 4 styles (Minimal, Craft, Retro, Toy)
- `source/` — editable source: component files (`*.dc.html`), `toy.js` (Toy spring physics), `numberflow.js` (rolling numbers), `support.js` (runtime), logo.
  Serve `source/` over HTTP (e.g. `npx serve source`) and open `Developer Components.dc.html` or `Docs.dc.html`.
  Opening them straight from disk may block the component imports; use `index.html` / `docs.html` for that.

Production notes: Toy physics here is a mockup; use Motion for React. The Toy Contribution Graph's 3D should use React Three Fiber + drei. Numbers: `@number-flow/react`.
