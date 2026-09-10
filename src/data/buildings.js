/* ------------------------------- BUILDINGS ---------------------------------
   A building is a chain, not a thing. Level one is what you can put up with a
   cart of scrap and a season; level two is the same work done properly; and at
   the top the chain forks once, into two ways of being good at it. One fork
   rather than a tree of them, because a decision you make once and live with
   is worth more than five you click past.

   The base entry is level one, `up` holds the levels above it, and `fork` is
   the pair you choose between at the end. Everything that reads a building
   goes through buildStep() so it never has to know which of the three it is.
   ------------------------------------------------------------------------ */
export const BUILDINGS = {
  siltfarm: {
    name: "Silt farm", scrap: 30, turns: 2, yield: { food: 3 },
    on: ["d", "p", "c", "s", "l"], desc: "Dyked plots on the old seabed.",
    up: [{ name: "Dyked fields", scrap: 60, turns: 3, yield: { food: 6 },
           desc: "Sluices, a proper bank, and the water where you want it." }],
    fork: [
      { id: "granary", name: "Granary", scrap: 105, turns: 4, yield: { food: 10 },
        desc: "Stone bins against a bad winter. The harvest keeps." },
      { id: "herds", name: "Herd pens", scrap: 105, turns: 4, yield: { food: 7, men: 2 },
        desc: "Beasts on the stubble, and drovers who can ride." },
    ],
  },
  yard: {
    name: "Salvage yard", scrap: 25, turns: 2, yield: { scrap: 3 },
    on: ["r", "h", "m", "d"], desc: "Cranes and cutting torches.",
    up: [{ name: "Cutting floor", scrap: 50, turns: 3, yield: { scrap: 6 },
           desc: "Gantries, a sorting line, and torches that stay lit." }],
    fork: [
      { id: "breakers", name: "Breaker's yard", scrap: 95, turns: 4, yield: { scrap: 10 },
        desc: "Whole structures come apart here, not just what fell off them." },
      { id: "reclaim", name: "Reclamation shop", scrap: 95, turns: 4, yield: { scrap: 6, metal: 3 },
        desc: "Sorted, graded and melted back into something worth having." },
    ],
  },
  mill: {
    name: "Powder mill", scrap: 45, turns: 3, yield: { powder: 3 },
    on: ["f", "h", "r", "p"], desc: "Saltpetre beds and a charcoal kiln.",
    up: [{ name: "Corning house", scrap: 80, turns: 3, yield: { powder: 6 },
           desc: "Milled, corned and graded, so it burns the same twice." }],
    fork: [
      { id: "magazine", name: "Magazine", scrap: 130, turns: 4, yield: { powder: 10 },
        desc: "Beds, mills and a bank of earth between them and everyone else." },
      { id: "shellworks", name: "Shell works", scrap: 130, turns: 4, yield: { powder: 6, metal: 3 },
        desc: "Cases as well as charges. The guns eat both." },
    ],
  },
  refinery: {
    name: "Refinery", scrap: 55, turns: 3, yield: { fuel: 3 },
    on: ["b", "f", "h", "c", "r"], desc: "Cracks anything that burns.",
    up: [{ name: "Cracking tower", scrap: 95, turns: 3, yield: { fuel: 6 },
           desc: "Fractions off properly instead of boiling the lot." }],
    fork: [
      { id: "tankfarm", name: "Tank farm", scrap: 150, turns: 4, yield: { fuel: 10 },
        desc: "Storage enough that a bad season is an inconvenience." },
      { id: "cokeworks", name: "Coke works", scrap: 150, turns: 4, yield: { fuel: 6, metal: 3 },
        desc: "The heavy ends baked down to coke for the furnaces." },
    ],
  },
  muster: {
    name: "Muster hall", scrap: 35, turns: 2, yield: { men: 3 }, on: null,
    desc: "Lets you raise warbands here.",
    up: [{ name: "Drill yard", scrap: 65, turns: 3, yield: { men: 6 },
           desc: "Standing ground, a rack and someone shouting at them." }],
    fork: [
      { id: "barracks", name: "Barracks", scrap: 110, turns: 4, yield: { men: 10 },
        desc: "Billets, kitchens and rolls. The muster never really disbands." },
      { id: "warhall", name: "War hall", scrap: 110, turns: 4, yield: { men: 6 }, def: 10,
        desc: "The oaths are sworn here, and it is built to be held." },
    ],
  },
  workshop: {
    name: "Craftsmen's hut", scrap: 45, turns: 2, yield: {}, on: null,
    desc: "Turns out arms every season. What kind is up to you.",
    up: [{ name: "Workshops", scrap: 85, turns: 3, yield: {}, hands: 4,
           desc: "A row of them, sharing a forge and a stock of stems." }],
    fork: [
      { id: "manufactory", name: "Manufactory", scrap: 140, turns: 4, yield: {}, hands: 9,
        desc: "Piecework, patterns and hands enough to keep every line moving." },
      { id: "proofhouse", name: "Proof house", scrap: 140, turns: 4, yield: {}, hands: 5, quality: 1,
        desc: "Everything tested before it leaves. Fewer arms, better ones." },
    ],
  },
  mine: {
    name: "Mine", scrap: 70, turns: 3, yield: { metal: 5 }, on: ["m", "h"],
    desc: "A cut face and a windlass. Ore in quantity.",
    up: [{ name: "Deep workings", scrap: 120, turns: 4, yield: { metal: 9 },
           desc: "Shafts, pumps and men who do not see daylight." }],
    fork: [
      { id: "greatlode", name: "Great lode", scrap: 190, turns: 5, yield: { metal: 15 },
        desc: "They found the seam. It goes down further than anyone has been." },
      { id: "foundry", name: "Pit foundry", scrap: 190, turns: 5, yield: { metal: 9, scrap: 5 },
        desc: "Smelted at the pithead instead of carted off as rock." },
    ],
  },
  fishery: {
    name: "Fishery", scrap: 35, turns: 2, yield: { food: 5 }, on: null, coast: true,
    desc: "Weirs, lines and a smoke-house on the shore.",
    up: [{ name: "Boat strand", scrap: 65, turns: 3, yield: { food: 9 },
           desc: "A second boat, and hands enough to work both tides." }],
    fork: [
      { id: "fleet", name: "Fishing fleet", scrap: 115, turns: 4, yield: { food: 14 },
        desc: "Four keels working the banks in rotation." },
      { id: "curing", name: "Curing sheds", scrap: 115, turns: 4, yield: { food: 9, scrap: 3 },
        desc: "Salted and barrelled. It travels, and so do the barrels." },
    ],
  },
  pier: {
    name: "Pier", scrap: 48, turns: 3, yield: { scrap: 3, food: 1 }, on: null, coast: true,
    desc: "A landing stage. Wrecks come in whole instead of in pieces.",
    up: [{ name: "Quays", scrap: 85, turns: 3, yield: { scrap: 6, food: 2 },
           desc: "Stone facing and a crane that lifts more than a man can." }],
    fork: [
      { id: "harbour", name: "Harbour works", scrap: 145, turns: 4, yield: { scrap: 10, food: 4 },
        desc: "A mole, a basin, and water calm enough to work in winter." },
      { id: "drydock", name: "Dry dock", scrap: 145, turns: 4, yield: { scrap: 6, metal: 4 },
        desc: "Hulls come out of the water whole and are taken to pieces dry." },
    ],
  },
  redoubt: {
    name: "Redoubt", scrap: 40, turns: 2, yield: {}, on: null, def: 18,
    desc: "Earthworks and a firing step.",
    up: [{ name: "Bastion", scrap: 75, turns: 3, yield: {}, def: 30,
           desc: "Faced, flanked and sited so the ditch is covered." }],
    fork: [
      { id: "citadel", name: "Citadel", scrap: 130, turns: 4, yield: {}, def: 48,
        desc: "A work that has to be starved out rather than stormed." },
      { id: "gunworks", name: "Gun works", scrap: 130, turns: 4, yield: { powder: 3 }, def: 34,
        desc: "Embrasures, a magazine under the rampart, and guns that stay laid." },
    ],
  },
};

/* The three steps of a chain, flattened. Level 1 is the entry itself, level 2
   is up[0], and level 3 is whichever fork was taken. */
export function buildStep(b) {
  const def = BUILDINGS[b?.id];
  if (!def) return null;
  const lvl = b.lvl || 1;
  if (lvl <= 1) return def;
  if (lvl === 2) return def.up?.[0] || def;
  return def.fork?.find((f) => f.id === b.fork) || def.up?.[0] || def;
}

export const buildTop = (b) => (b?.lvl || 1) >= 3;

/* What this building could become next: one step, or the pair at the fork.
   Empty once it is finished growing. */
export function buildNext(b) {
  const def = BUILDINGS[b?.id];
  if (!def) return [];
  const lvl = b.lvl || 1;
  if (lvl === 1) return def.up?.length ? [{ ...def.up[0], lvl: 2 }] : [];
  if (lvl === 2) return (def.fork || []).map((f) => ({ ...f, lvl: 3 }));
  return [];
}

export const buildName = (b) => buildStep(b)?.name || "";
