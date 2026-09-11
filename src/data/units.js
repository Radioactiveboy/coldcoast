/* --------------------------------- COMPANIES -------------------------------
   Companies are whole things now, not a weapon bolted to a chassis. Each tier
   is opened by an advance, and a company you cannot yet raise is not shown at
   all — the muster roll grows as your people learn.
   ------------------------------------------------------------------------ */
export const UNIT_TIERS = [
  { id: "tribal",  name: "Tribal",  desc: "What anyone can put in the field: a spear, an axe, a bow." },
  { id: "forged",  name: "Forged",  desc: "Iron, horn and horse. The first things worth a smith." },
  { id: "drilled", name: "Drilled", desc: "Ranks that hold their intervals under fire." },
  { id: "powder",  name: "Powder",  desc: "Corned powder, cast barrels, and the crews to serve them." },
  { id: "vault",   name: "Vault",   desc: "Pre-Collapse tolerances, copied by hand at enormous cost." },
];

export const UNITS = {
  spearmen: {
    name: "Spearmen", tier: "tribal", role: "A wall to stand behind",
    size: 150, melee: 5, ranged: 0, def: 5, antiCav: 1.7, food: 3, powder: 0,
    scrap: 5, moraleBase: 55, hold: 1.25,
    desc: "Ash, a knife and a fire. They do not win a field, they refuse to give one up.",
  },
  axemen: {
    name: "Axe Men", tier: "tribal", role: "The first ones in",
    size: 120, melee: 10, ranged: 0, def: 3, food: 3, powder: 0,
    scrap: 11, moraleBase: 60, press: 1.25,
    desc: "Short handles, heavy heads, and no interest whatever in the second rank.",
  },
  hunters: {
    name: "Hunters", tier: "tribal", role: "Reach without powder",
    size: 90, melee: 3, ranged: 7, def: 2, food: 2, powder: 0,
    scrap: 13, moraleBase: 50,
    scout: 1, desc: "They fed the ward through nineteen winters. A man is a larger target than a hare.",
  },
  pikemen: {
    name: "Pikemen", tier: "forged", needs: "smelting", role: "A hedge no horse will take",
    size: 150, melee: 8, ranged: 0, def: 8, antiCav: 2.1, food: 3, powder: 0,
    scrap: 17, moraleBase: 62, hold: 1.35,
    desc: "Rebar, boiled leather, and eighteen feet of very bad news for a rider.",
  },
  bowmen: {
    name: "Bowmen", tier: "forged", needs: "bowyery", role: "Massed shot",
    size: 110, melee: 3, ranged: 11, def: 4, food: 2, powder: 0,
    scrap: 21, moraleBase: 54,
    scout: 1, desc: "Horn and sinew, drawn to the ear. Slower than powder and never out of it.",
  },
  riders: {
    name: "Riders", tier: "forged", needs: "horsemanship", role: "Shock and pursuit",
    size: 80, melee: 13, ranged: 0, def: 6, food: 5, powder: 0, cav: true, speed: 1,
    scrap: 28, moraleBase: 64, press: 1.2,
    scout: 2, desc: "They arrive where they are least wanted and leave before anyone agrees what happened.",
  },
  ironclad: {
    name: "Ironclad", tier: "forged", needs: "toolcraft", role: "An anvil",
    size: 120, melee: 9, ranged: 0, def: 14, food: 4, powder: 0,
    scrap: 42, moraleBase: 70, hold: 1.3,
    desc: "Road signs and bootlids, riveted over leather. Slow, hot, and very hard to move.",
  },
  line: {
    name: "Line Company", tier: "drilled", needs: "drill", role: "Steady in the open",
    size: 140, melee: 8, ranged: 4, def: 10, food: 3, powder: 0,
    scrap: 36, moraleBase: 74,
    desc: "Ranks, a pace and a flag to dress on. It is the drill that holds, not the armour.",
  },
  musketeers: {
    name: "Musketeers", tier: "powder", needs: "blackpowder", role: "Volley fire",
    size: 120, melee: 4, ranged: 15, def: 9, food: 3, powder: 2,
    scrap: 48, moraleBase: 66,
    desc: "Hand-cast barrels and corned powder. Hungry, loud, and worth every ounce.",
  },
  guncrew: {
    name: "Gun Crew", tier: "powder", needs: "casting", role: "Breaks a shieldwall",
    size: 55, melee: 1, ranged: 32, def: 6, food: 2, powder: 5, siege: true,
    scrap: 95, moraleBase: 58,
    desc: "Bored true from heavy pipe. Useless up close and decisive at any other range.",
  },
  technicals: {
    name: "Technicals", tier: "powder", needs: "enginework", role: "Speed and reach",
    size: 70, melee: 9, ranged: 12, def: 9, food: 1, fuel: 4, powder: 1, cav: true, speed: 2,
    scrap: 88, moraleBase: 62,
    scout: 2, desc: "Two dead engines make one that turns over. It runs on fuel, not forage.",
  },
  vaultguard: {
    name: "Vault Guard", tier: "vault", needs: "vaultcraft", role: "Few, and very hard to break",
    size: 70, melee: 16, ranged: 6, def: 20, food: 3, powder: 1,
    scrap: 130, moraleBase: 86, hold: 1.4,
    desc: "Riot composite over drilled men. There are never many and they are never cheap.",
  },
  /* Nobody raises these. They belong to the changed, who are not a realm and
     do not muster — the `only` field keeps them off every muster roll in the
     game. No armour worth the word and no shot at all, but a great many of
     them and they do not break: morale of 130 against a vault guard's 86,
     which is the steadiest thing a realm can field. They come on until there
     are none left. */
  fleshhorde: {
    name: "Flesh Horde", tier: "tribal", only: "changed", role: "It does not stop",
    size: 280, melee: 13, ranged: 0, def: 0, food: 0, powder: 0,
    scrap: 0, moraleBase: 130, press: 1.3,
    desc: "Three centuries in the wet dark under the ruins did something, and it kept doing it. What comes up the stairwell is the wrong shape and there is a great deal of it.",
  },
  /* Not a company at all. Dogs that went back to being wolves, and the things
     that live off what a dead continent left lying about. They are quick and
     they will take a lone scouting party apart, but they have no armour, no
     shot and no reason to die for anything: put arrows into them from thirty
     yards and they remember they are animals. `beast` is what the combat code
     reads for that — a side that is mostly beasts is far more vulnerable to
     whatever you can shoot at it. */
  feralherd: {
    name: "Feral Herd", tier: "tribal", only: "beasts", role: "Teeth in the treeline",
    size: 150, melee: 8, ranged: 0, def: 2, food: 0, powder: 0,
    scrap: 0, moraleBase: 48, press: 1.15, beast: true,
    desc: "Boar gone huge on three centuries of nobody hunting them, dogs that forgot which side they were on, and whatever has been eating both. They hold a wood the way weather holds a hill.",
  },
  riflemen: {
    name: "Riflemen", tier: "vault", needs: "vaultcraft", role: "Killing at distance",
    size: 90, melee: 5, ranged: 22, def: 13, food: 3, powder: 3,
    scrap: 120, moraleBase: 72,
    desc: "Preserved rifles, still zeroed after three centuries. Irreplaceable, one at a time.",
  },
};
export const UNIT_IDS = Object.keys(UNITS);
