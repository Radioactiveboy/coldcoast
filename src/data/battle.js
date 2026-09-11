/* ------------------------------- THE FIELD ---------------------------------
   A battle used to be two numbers hitting each other. It is a line now: left,
   centre and right, each fought separately, plus a reserve you hold back and
   commit when you decide the moment has come.

   Everything in this file is the shape of that line — what the sectors are,
   what the ground under each one does, what a posture costs and what the
   ready-made formations put where. The arithmetic lives with the rest of the
   combat code; this is the part you tune.
   ------------------------------------------------------------------------ */

export const SECTORS = ["left", "centre", "right"];
export const SECTOR_NAME = { left: "Left", centre: "Centre", right: "Right", res: "Reserve" };
// Who stands next to whom. Breaking a sector lets you roll onto these.
export const ADJACENT = { left: ["centre"], centre: ["left", "right"], right: ["centre"] };

/* A posture is given per sector rather than per army, which is the whole point
   of a line: you can hold a wing with everything you have while the centre
   pushes. The trades are the same ones as before, at sector scale. */
export const POSTURES = {
  press: { name: "Press", deal: 1.3, take: 1.15, morale: 1.0, ranged: 1.0,
           desc: "Close hard. Wins open ground, bleeds you on bad ground." },
  hold:  { name: "Hold", deal: 0.85, take: 0.78, morale: 0.85, ranged: 1.0,
           desc: "Give up tempo to keep the companies together." },
  volley: { name: "Volley", deal: 1.0, take: 1.0, morale: 1.0, ranged: 1.45, melee: 0.5,
            powder: 2, ignoresGround: 0.5,
            desc: "Shoot rather than storm. Halves their ground and burns double powder." },
};
export const POSTURE_IDS = Object.keys(POSTURES);

/* The ground, sector by sector. Broken ground is worth holding and murder for
   horse; an anchored flank — a river, a shore, a cliff — cannot be turned, and
   that is the difference between a line that folds and one that only bends. */
export const GROUND = {
  open:     { name: "Open ground", desc: "Nothing to hold and nothing in the way.", def: 0, horse: 1 },
  rough:    { name: "Broken ground", desc: "Worth holding. No use at all to horse.", def: 22, horse: 0.4 },
  anchored: { name: "Anchored flank", desc: "Water on that side. It cannot be turned.", def: 8, horse: 0.8, safe: true },
  walls:    { name: "The wall", desc: "It has to come down before anything behind it can be reached.", def: 60, horse: 0.2, wall: true },
};

/* What the hex under the fight does to each sector. Terrain that is broken
   everywhere is broken in every sector; hills and mountains give one flank to
   whoever gets there first; water on the map anchors a flank. The side the
   rough ground falls on is drawn from the hex itself, so the same field is the
   same field every time it is fought over. */
export function groundFor(t, coast, seed = 0) {
  const flank = seed % 2 === 0 ? "left" : "right";
  const other = flank === "left" ? "right" : "left";
  const g = { left: "open", centre: "open", right: "open" };
  if (t === "m") return { left: "rough", centre: "rough", right: "rough" };
  if (t === "c") return { left: "rough", centre: "rough", right: "rough" };
  if (t === "h") { g[flank] = "rough"; g.centre = "rough"; }
  else if (t === "f") { g.centre = "rough"; g[flank] = "rough"; }
  else if (t === "r") { g.centre = "rough"; }
  if (coast) g[other] = "anchored";
  return g;
}

/* Ready-made lines, for when you do not want to place eight companies by hand.
   Each returns a list of sector keys, one per company, in the order the
   companies are given — heaviest first, because that is how they are sorted
   before this is called. */
export const FORMATIONS = {
  even: {
    name: "Line abreast", desc: "Spread evenly. No weakness and no strength.",
    lay: (n) => Array.from({ length: n }, (_, i) => SECTORS[i % 3]),
  },
  wall: {
    name: "Shield wall", desc: "Weight in the centre, thin on the wings. Hard to break through, easy to go round.",
    lay: (n) => Array.from({ length: n }, (_, i) =>
      (i % 4 === 1 ? "left" : i % 4 === 3 ? "right" : "centre")),
  },
  horns: {
    name: "The horns", desc: "Strong wings, a thin centre that is meant to give. Wins by turning both flanks.",
    lay: (n) => Array.from({ length: n }, (_, i) =>
      (i % 5 === 2 ? "centre" : i % 2 === 0 ? "left" : "right")),
  },
  refused: {
    name: "Refused flank", desc: "Everything on one wing and the centre; the other is given away on purpose.",
    lay: (n) => Array.from({ length: n }, (_, i) => (i % 3 === 2 ? "centre" : "right")),
  },
  reserve: {
    name: "Deep reserve", desc: "A thin line and a third of the host held back for the moment it matters.",
    lay: (n) => Array.from({ length: n }, (_, i) =>
      (i % 3 === 2 ? "res" : i % 4 === 1 ? "left" : i % 4 === 3 ? "right" : "centre")),
  },
};
export const FORMATION_IDS = Object.keys(FORMATIONS);

/* How much being taken in the flank is worth, and what it does to the nerve of
   the companies it happens to. Two broken neighbours is a line rolled up. */
export const FLANK_DEAL = 0.45;
export const FLANK_MORALE = 11;
// When a company breaks, the ones beside it feel it; when a whole sector goes,
// the whole army does.
export const SHAKEN_NEAR = 8;
export const SHAKEN_SECTOR = 14;
