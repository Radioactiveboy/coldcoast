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
| `lord-<faction>-bust` / `-head` | the faction the person speaks for | the warlord screen, and the face in their meeting scene |
| `title-<anything>` | nothing — the first one found wins | the key art behind the title |

`ward-*`, `seat-*`, `lord-*` and `title-*` are picked up automatically by `import.meta.glob`.
The unit and terrain plates are still imported by name at the top of
`ColdCoast.jsx` — add the import when you add the file.

## The one sound that is a file

Everything you hear in this game is built out of oscillators at run time —
there are no audio files and that is on purpose. The title screen is the one
exception, because a menu is the one moment a game is simply playing you
something rather than scoring what you are doing.

Drop a track in as **`theme-menu.mp3`** (`.ogg`, `.m4a`, `.webm` and `.wav`
also work) and the menu plays it, looped, routed through the same music bus
as everything else — so the music toggle, the fades and the master volume all
go on meaning what they meant. With no file the menu plays the same cold
drone the rest of the game runs on, and nothing else changes.

Two things to know. A browser will not let any page make a sound before the
player has touched it, so the theme starts on the first click or keypress on
the title screen rather than the moment it loads. And whatever you drop in
ships inside the bundle, so keep it to a couple of minutes at a modest
bitrate — a 5MB track is five times the whole rest of the game.

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

`ward-lundentrench`, the `seat-*` plates and the unit, terrain and warlord
plates are the project's own art. The line icons in `data/gameicons.js` are a different thing — they are
CC BY 3.0 from game-icons.net and are credited in the Codex, which reads the
author off each icon rather than keeping a list by hand.
