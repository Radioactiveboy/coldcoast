/* ------------------------------- SAVED GAMES -------------------------------
   One slot, in localStorage. The whole game object is plain JSON — provinces,
   nations, armies, war, log — so a save is just the state written out and read
   back, with no migration layer to keep in step with the rules.

   That last part is the reason for the version stamp. As the rules change, an
   old save loaded into new code is not a save, it is a subtly wrong game: a
   field that moved, a table key that no longer exists, and a crash ten turns
   later that looks like a rules bug. A save from a different version is
   refused outright and the player is told, which is annoying exactly once and
   never lies to them. Bump SAVE_VERSION whenever the shape of the state
   changes.
   ------------------------------------------------------------------------ */

export const SAVE_KEY = "coldcoast.save";
/* 2: nat.crafts went from a share of the workshops' output (a weight, 0-9,
   normalised across the lines) to a count of craftsmen on each line. The same
   numbers mean something different now, so a version 1 save would load into a
   realm quietly working at a fraction of its strength. */
export const SAVE_VERSION = 2;

/* Screen furniture, not the position. An open tech tree or a half-written
   recruit order is not worth carrying across a reload, and restoring straight
   into a modal is disorienting. Everything here is reset on load; note that
   `battle` and `pending` are deliberately NOT in this list, because a fight
   the AI has already started is part of the position — dropping it would hand
   the player a free escape. */
const TRANSIENT = {
  sel: null, tree: false, seat: null, lords: false, showCodex: false,
  recruit: null, survey: null, lair: null, focus: null, notices: [],
  screen: null,
};

/* localStorage throws rather than returning null in a few real situations —
   Safari private browsing, storage disabled by policy, quota exhausted — so
   every call here is wrapped. Saving is a convenience; it must never be the
   thing that takes the game down. */
function safe(fn, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    return fn();
  } catch {
    return fallback;
  }
}

export function writeSave(game) {
  return safe(() => {
    const keep = { ...game };
    Object.keys(TRANSIENT).forEach((k) => delete keep[k]);
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: SAVE_VERSION, at: Date.now(), turn: game.turn, player: game.player, game: keep,
    }));
    return true;
  }, false);
}

/* Returns { at, turn, player } for a loadable save, or null. Used to decide
   whether to offer Continue without paying to parse the whole position. */
export function saveInfo() {
  return safe(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== SAVE_VERSION || !d.game) return null;
    return { at: d.at, turn: d.turn, player: d.player };
  }, null);
}

export function readSave() {
  return safe(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== SAVE_VERSION || !d.game) return null;
    // begun/player are what route the player past the title and picker; a save
    // is always of a game in progress, so both are forced on the way in.
    return { ...TRANSIENT, ...d.game, begun: true };
  }, null);
}

export function clearSave() {
  return safe(() => { localStorage.removeItem(SAVE_KEY); return true; }, false);
}
