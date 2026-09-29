/* -------------------------------- THE ARMOURY -------------------------------
   What the warlord carries. Five slots, and almost everything that goes in one
   is taken rather than bought: off a seat you stormed, out of a lair you
   cleared, at the end of a place's story, or off a rival warlord you beat in
   the field. The yards will sell you a serviceable version of each, which is
   there so a new realm is never empty-handed — not so you can buy your way to
   a good one.

   A piece is worth the same whoever wears it, and it stays in the armoury when
   a warlord falls: the next one to take the seat finds it on the rack with the
   story of who carried it before.

   `mods` are the field-and-road keys the rest of the game already multiplies
   (dealt, taken, morale, storm, ranged, flank, waste, draw, and scout/relief
   which add). `mul` moves what the land brings in. Nothing here is more than
   about a tenth, because a warlord in good armour should be a better warlord,
   not a different game.

   The yards' own pieces are priced in scrap alone. Metal is something a realm
   has none of in its first years, and these are the pieces that exist so those
   first years are not spent bare-headed.
   ------------------------------------------------------------------------ */

export const SLOTS = [
  { k: "head", name: "Head", note: "A helm, a hood, or whatever passes for one." },
  { k: "body", name: "Body", note: "Plate, mail, cured hide, or a coat with things sewn into it." },
  { k: "hand", name: "Hand", note: "What they actually fight with." },
  { k: "mount", name: "Mount", note: "What carries them, if anything does." },
  { k: "standard", name: "Standard", note: "What the companies look for when the line bends." },
];
export const SLOT_KEYS = SLOTS.map((s) => s.k);

/* How a piece came to be on the rack. `buy` is the yards; everything else is
   earned somewhere on the map and says where when you look at it. */
export const REGALIA = {
  /* ---- what the yards will sell, one to a slot ---- */
  yardhelm: {
    slot: "head", name: "A cutting-yard helm", tier: "plain",
    note: "Hammered out of hull plate by somebody who has made nine hundred of them.",
    buy: { scrap: 45 },
    mods: { taken: 0.97 },
  },
  yardcoat: {
    slot: "body", name: "A dredger's coat", tier: "plain",
    note: "Canvas, tar and a great many small iron plates. Heavy, warm, and it turns a knife.",
    buy: { scrap: 70 },
    mods: { taken: 0.96 },
  },
  boardaxe: {
    slot: "hand", name: "A boarding axe", tier: "plain",
    note: "Made for getting through a bulkhead. It is not fussy about what else it gets through.",
    buy: { scrap: 50 },
    mods: { dealt: 1.04 },
  },
  siltpony: {
    slot: "mount", name: "A silt pony", tier: "plain",
    note: "Short, bad-tempered, and the only horse on the coast that will walk out onto the flats.",
    buy: { scrap: 55, food: 25 },
    mods: {}, scoutAdd: 1,
  },
  bundflag: {
    slot: "standard", name: "The bund colours", tier: "plain",
    note: "Cable and tide on green. Every company on the flats knows it.",
    buy: { scrap: 35 },
    mods: { morale: 0.97 },
  },

  /* ---- taken off a seat you stormed. One to a realm, and it is theirs, so
          carrying it says something ---- */
  lyonchain: {
    slot: "body", name: "The Prefect's chain", tier: "seat", fromSeat: "lyon",
    note: "Graded links, each stamped with the ward it was taxed from. It is a census you can wear.",
    mods: { taken: 0.94 }, mul: { men: 1.06 },
  },
  alpinehelm: {
    slot: "head", name: "A vault-warden's helm", tier: "seat", fromSeat: "alpine",
    note: "Machined, not hammered, and the visor still closes without a sound after three hundred years.",
    mods: { taken: 0.93, ranged: 1.05 },
  },
  karstseal: {
    slot: "hand", name: "The Karst seal-mace", tier: "seat", fromSeat: "karst",
    note: "A tollhouse seal on a shaft. It was for stamping writs and it has been used for other things.",
    mods: { dealt: 1.06 }, mul: { scrap: 1.06 },
  },
  borealhide: {
    slot: "body", name: "The bear of the ice edge", tier: "seat", fromSeat: "boreal",
    note: "A hide from something that should not still exist at that latitude, and did not after they met it.",
    mods: { taken: 0.95, morale: 0.94, waste: 0.9 },
  },
  hordesaddle: {
    slot: "mount", name: "The long saddle", tier: "seat", fromSeat: "horde",
    note: "Nine days in it without dismounting, they say. Whoever says it is never asked to prove it.",
    mods: {}, scoutAdd: 1, reliefAdd: 1,
  },
  solarmirror: {
    slot: "standard", name: "The mirror standard", tier: "seat", fromSeat: "solar",
    note: "A polished disc on a pole. On a bright day the far end of the line can see it, and so can the enemy.",
    mods: { morale: 0.93 }, mul: { fuel: 1.1 },
  },

  /* ---- out of the holdouts' ground ---- */
  pitmaul: {
    slot: "hand", name: "The Red-Ruth maul", tier: "seat", fromSeat: "quarrymen",
    note: "A stone-splitting hammer off the eighth step down. It was not made for a man to swing on a field.",
    mods: { dealt: 1.07, storm: 1.12 },
  },
  tollkeys: {
    slot: "standard", name: "The Tollmaster's keys", tier: "seat", fromSeat: "bridgers",
    note: "Every gate on the crossing, on one ring, carried openly where the companies can see them.",
    mods: { morale: 0.96 }, mul: { scrap: 1.05 },
  },
  skinlessmask: {
    slot: "head", name: "A Wight mask", tier: "seat", fromSeat: "skinless",
    note: "What they wear on the silt. Nobody has explained what it is made of and nobody has asked twice.",
    mods: { dealt: 1.05, morale: 0.95 },
  },
  runebell: {
    slot: "standard", name: "A bell off Rune", tier: "seat", fromSeat: "domesayers",
    note: "Small, cracked, and it was rung over a great many people who did not want to hear it.",
    mods: { morale: 0.92, storm: 1.08 },
  },
  hedgeblade: {
    slot: "hand", name: "A hedge-bill", tier: "seat", fromSeat: "bretons",
    note: "A farm tool with four hundred years of sharpening on it. The hedge crews fight with these.",
    mods: { dealt: 1.05, taken: 0.97 },
  },
  holkkeel: {
    slot: "body", name: "Keel-plate mail", tier: "seat", fromSeat: "holk",
    note: "Cut from a hull that had been a house for two centuries, and shaped by people who farm silt.",
    mods: { taken: 0.94 }, mul: { food: 1.06 },
  },

  /* ---- cut out of the wild. A pool, because a wood is a wood ---- */
  herdhorn: {
    slot: "head", name: "A crown of horn", tier: "wild", wild: true,
    note: "Off whatever was holding the wood. It is wired together with salvage and it is not subtle.",
    mods: { morale: 0.96, dealt: 1.03 },
  },
  wasterbanner: {
    slot: "standard", name: "A Waster rag", tier: "wild", wild: true,
    note: "Taken off a mob and flown upside down, which is a thing the mobs understand perfectly.",
    mods: { morale: 0.97 }, mul: { men: 1.04 },
  },
  boneknife: {
    slot: "hand", name: "The long knife", tier: "wild", wild: true,
    note: "Ground from something that used to walk. It holds an edge better than the yards can manage.",
    mods: { dealt: 1.05 },
  },

  /* ---- the end of a story. Keyed to the place, so they are one to a game ---- */
  weirhood: {
    slot: "head", name: "The Weirmaster's hood", tier: "story", fromStory: "Bristol Weir",
    note: "Oiled, hooded, and it has stood in that spray for longer than anyone can account for.",
    mods: { taken: 0.95 }, mul: { food: 1.05 },
  },
  lightlens: {
    slot: "standard", name: "The lighthouse lens", tier: "story", fromStory: "lighthouse",
    note: "A cut-glass lens the size of a shield, mounted on a frame. It throws a light nobody argues with.",
    mods: { morale: 0.9 }, scoutAdd: 1,
  },
  drownedcrown: {
    slot: "head", name: "The drowned crown", tier: "story", fromStory: "any",
    note: "Somebody was king of something, once, and the water took the rest of it.",
    mods: { morale: 0.94 }, mul: { scrap: 1.05 },
  },
};
export const REGALIA_IDS = Object.keys(REGALIA);

/* What is on the rack, added up. Called for the worn set, so it has to be
   cheap and it has to be pure. */
const BASE = { dealt: 1, taken: 1, morale: 1, storm: 1, ranged: 1, flank: 1, waste: 1, draw: 1 };
export function regaliaMods(worn) {
  const out = { ...BASE, scout: 0, relief: 0, mul: {} };
  (worn || []).forEach((id) => {
    const p = REGALIA[id];
    if (!p) return;
    Object.entries(p.mods || {}).forEach(([k, v]) => { if (out[k] != null) out[k] *= v; });
    if (p.scoutAdd) out.scout += p.scoutAdd;
    if (p.reliefAdd) out.relief += p.reliefAdd;
    Object.entries(p.mul || {}).forEach(([k, v]) => { out.mul[k] = (out.mul[k] || 1) * v; });
  });
  return out;
}

/* Said in the words the rest of the game uses for the same numbers. */
const MOD_WORD = {
  dealt: ["damage dealt", 1], taken: ["damage taken", -1], morale: ["nerve holds", -1],
  storm: ["storming a wall", 1], ranged: ["shooting", 1], flank: ["turning a flank", 1],
  waste: ["losses out of supply", -1], draw: ["rations drawn", -1],
};
const RES_WORD = { food: "rations", scrap: "scrap", metal: "metal", fuel: "fuel", powder: "powder", men: "recruits" };
export function regaliaChips(id) {
  const p = REGALIA[id];
  if (!p) return [];
  const out = [];
  Object.entries(p.mods || {}).forEach(([k, v]) => {
    const w = MOD_WORD[k];
    if (!w) return;
    const pc = Math.round(Math.abs(v - 1) * 100);
    if (!pc) return;
    const better = w[1] > 0 ? v > 1 : v < 1;
    out.push({ t: `${w[0]} ${v > 1 ? "+" : "−"}${pc}%`, good: better });
  });
  if (p.scoutAdd) out.push({ t: `scouting +${p.scoutAdd}`, good: true });
  if (p.reliefAdd) out.push({ t: `supply reach +${p.reliefAdd}`, good: true });
  Object.entries(p.mul || {}).forEach(([k, v]) => {
    out.push({ t: `${RES_WORD[k] || k} ${v > 1 ? "+" : "−"}${Math.round(Math.abs(v - 1) * 100)}%`, good: v > 1 });
  });
  return out;
}

/* Where a piece is found. Each of these is asked by the one place in the game
   that hands the thing over, and each of them refuses to hand over a piece
   already on the rack. */
export const seatPiece = (who) => REGALIA_IDS.find((id) => REGALIA[id].fromSeat === who) || null;
export const wildPieces = () => REGALIA_IDS.filter((id) => REGALIA[id].wild);
export const storyPiece = (name) =>
  REGALIA_IDS.find((id) => REGALIA[id].fromStory && name && name.includes(REGALIA[id].fromStory))
  || REGALIA_IDS.find((id) => REGALIA[id].fromStory === "any")
  || null;
export const buyable = () => REGALIA_IDS.filter((id) => REGALIA[id].buy);
