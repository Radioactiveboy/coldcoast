# Working on Cold Coast

## The one rule that matters

Run the smoke test after anything that touches the map, the turn loop or a
shared data table. Most regressions in this project have not been logic errors
— they have been an edit landing in the wrong place in a very large file, or a
symbol being removed along with the thing next to it. The test catches both in
about thirty seconds.

## Adding things

**A new company type** — add an entry to `UNITS` with a `tier` and a `needs`
(the advance that opens it). Nothing else is required: the muster roll, the
production tab and the AI all read from that table. If it should have artwork,
drop a file in `src/assets/`, import it, and add it to `UNIT_ART` keyed by the
unit id.

**A new advance** — add an entry to `TECHS`. The tech tree computes its own
layout from the `needs` graph, so the node places itself.

**A new terrain image** — a file in `src/assets/`, an import, and a line in
`TERRAIN_ART` keyed by the terrain letter.

**A new faction** — this is the one that has bitten before. A faction needs
entries in several tables that are easy to miss individually: `NATIONS` or
`MINORS`, `AI_STYLE`, `WARLORDS` (or explicit handling if it has no warlord),
`LORD_COMMAND`, and a case in `SigilMarks`. Anything that reads
`WARLORDS[id].name` without a guard will throw. Add the faction, then open every
screen for every playable realm before committing.

## House style

Comments explain *why*, not what. If a line looks odd, say what would go wrong
without it — several of the comments in the codebase document real bugs and are
the reason they have not come back.
