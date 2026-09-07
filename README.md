# Cold Coast

A turn-based grand strategy game set on a geographically real Europe, three
hundred and eighty winters after the Collapse. The seas fell roughly 110 metres
and gave back a continent: the North Sea is a silt prairie, the Baltic and the
Black Sea are freshwater lakes, and seven realms are counting what is left.

8,544 land provinces on a 104 × 145 hex grid, drawn from real coastlines.

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # production build into dist/
npm run preview      # serve that build locally
```

## Testing

There is one smoke test, and it drives the real interface with a real mouse
rather than poking at internals. Start the game, then in a second terminal:

```bash
CHROME_PATH="/usr/bin/google-chrome" npm test
```

On macOS:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test
```

It takes a banner, checks the map renders, selects a province, runs forty
seasons and watches for errors or `NaN` on screen. Nearly every bug in this
project has been caught by exactly this kind of test — driving the UI the way a
player would, rather than asserting on functions in isolation. Two lessons
learned the hard way are baked in:

- **Dispatching an event at an element is not a click.** A test that fires
  `element.dispatchEvent(new MouseEvent("click"))` proves the handler works but
  not that a click can reach it. When the map's click target ended up beneath
  another layer, that distinction was the whole bug.
- **A passing test against a stale bundle is worse than no test.** Always check
  the build actually succeeded before trusting the result.

## Layout

```
index.html            page shell, fonts, favicon
src/main.jsx          React entry point
src/base.css          the layout utilities the game uses (see note below)
src/ColdCoast.jsx     the game
src/data/             the pure tables: techs, units, buildings, seat, seasons,
                      warlords. No React in any of them.
src/assets/           artwork, as real files
tests/smoke.mjs       headless browser smoke test
```

`ColdCoast.jsx` is still one large file. That is deliberate for now — splitting
it is worth doing, but it should be done a piece at a time with the smoke test
run after each move, not in one go. Good first extractions, in order of how
cleanly they separate:

1. ~~`src/data/` — `TECHS`, `UNITS`, `BUILDINGS`, `WORKS`, `SETTLEMENT`,
   `WARLORDS`, `SEASONS`.~~ **Done.** Each moved verbatim in its own commit,
   with the smoke test run against the built bundle after every one. The art
   tables (`UNIT_ART`, `TERRAIN_ART`, `LORD_ART`) stayed behind, since they
   hold the imported image files.
2. `src/world/` — the map generation, `MAP_ROWS`, terrain and geometry helpers.
3. `src/ui/` — one file per screen: the tech tree, the seat, the muster roll,
   the warlord screen, the battle screen.
4. `src/game/` — turn resolution, combat, the AI.

### About `base.css`

The game was written against Tailwind's core utilities but uses only a few
dozen of them, so rather than pull in the whole framework `base.css` contains
exactly that set. Everything else the game needs it generates itself into a
`<style>` block at runtime — see `UI_CSS` in `ColdCoast.jsx`. If you would
rather have real Tailwind, install it and delete `base.css`; every class name
in the game is standard.

## Deploying to GitHub Pages

Set `base` in `vite.config.js` to `"/<repo-name>/"`, then add
`.github/workflows/pages.yml` (included). Push to `main` and enable Pages in
the repository settings with **Source: GitHub Actions**.

## Artwork

Everything in `src/assets/` is artwork supplied by the project owner. The
terrain and unit images are keyed by name in `TERRAIN_ART` and `UNIT_ART`
inside `ColdCoast.jsx`; adding a new one is a file plus an import plus a line
in the relevant table.
