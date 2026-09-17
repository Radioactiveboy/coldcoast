# Art

Painted plates. Everything here is loaded by Vite at build time, so a file
dropped in with the right name appears in the game without a code change.

## Naming

| Prefix          | Keyed by                        | Where it shows            |
| --------------- | ------------------------------- | ------------------------- |
| `ward-<id>`     | a district id from `data/districts.js` | the quarter's card in the district screen |
| `seat-<id>`     | the `art` on a people's `MINORS` entry | the meeting scene, and their seat on the map |
| `unit-<type>`   | a unit id from `data/units.js`   | the muster roll and company chips |
| `terrain-<name>`| wired by hand in `TERRAIN_ART`   | the province panel and survey scenes |
| `lord-<name>-bust` / `-head` | wired by hand in `LORD_ART` | the warlord screen |

`ward-*` and `seat-*` are picked up automatically by `import.meta.glob`. The others are
imported by name at the top of `ColdCoast.jsx` — add the import when you add
the file.

## Size

Keep plates **1280px wide at most, webp, quality ~72**. A quarter's card is
about 1000 CSS px wide and 212 tall and crops with `object-fit: cover`, so
anything larger is bytes nobody sees. Forty settlements at five quarters each
is two hundred plates: at 100KB that is 20MB of game, and at 370KB it is 74MB.

To re-encode a source image:

```sh
npm install --no-save sharp
node -e 'require("sharp")("in.png").resize({width:1280}).webp({quality:72,effort:6}).toFile("src/assets/ward-something.webp")'
```

## Where it came from

`ward-lundentrench`, the three `seat-*` plates and the unit, terrain and
warlord plates are the project's own art. The line icons in `data/gameicons.js` are a different thing — they are
CC BY 3.0 from game-icons.net and are credited in the Codex, which reads the
author off each icon rather than keeping a list by hand.
