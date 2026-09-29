/* --------------------------------- THE COURT --------------------------------
   Three things live here, and all three are about the people around the seat
   rather than the companies in the field.

   OFFICES are posts a captain can hold instead of a warband. The hall has
   always had people sitting in it doing nothing until you gave them companies;
   now the ones you are not going to use have somewhere to be useful. What a
   post is worth depends on who holds it — their habits, and whether they still
   believe in you.

   DECISIONS are the things a realm does once. Not an edict you can change next
   winter: a dyke, a muster, a burning of the old rolls. Each has a condition
   on the position, a price, and an effect that does not go away.

   MILESTONES are where the warlord stops being who they were. Five fields won
   is not an experience bar, it is a fact about a person, and when one of these
   comes true you choose which of two habits it hardened into. Once, and it does
   not come round again.
   ------------------------------------------------------------------------ */

/* ------------------------------- THE OFFICES ------------------------------ */
/* `base` is what the post is worth held by somebody competent and loyal.
   `wants` are the habits that suit it, each worth another `perWant` of the
   same. A holder who has stopped believing in you gives less, and one who is
   muttering gives almost nothing — a post is not a slot, it is a person. */
export const OFFICES = {
  quartermaster: {
    name: "Quartermaster", of: "the stores",
    note: "Counts what is in the granaries and argues with everybody about it. A good one is the difference between a campaign and a long walk home.",
    wants: ["drover", "careful", "forager"],
    base: { mul: { food: 1.06 }, draw: 0.96 },
    perWant: { mul: { food: 1.04 }, draw: 0.97, reliefAdd: 1 },
  },
  works: {
    name: "Master of the works", of: "the yards",
    note: "Keeps the cutting floors and the powder mills running and tells you which of them is lying about its output.",
    wants: ["forgewise", "steady"],
    base: { mul: { scrap: 1.06, metal: 1.04 } },
    perWant: { mul: { scrap: 1.05, powder: 1.06 } },
  },
  marshal: {
    name: "Marshal", of: "the muster",
    note: "Drills the companies that are not in the field and decides which of them is ready to be. Nobody enjoys this and everybody is better for it.",
    wants: ["hard", "oldsoldier", "veteran"],
    base: { mods: { morale: 0.96 }, xp: 1 },
    perWant: { mods: { morale: 0.97, taken: 0.98 }, xp: 1 },
  },
  envoy: {
    name: "Envoy", of: "the road",
    note: "Spends their life on somebody else's floor being polite. Every court on the coast forms an opinion of you from whoever you send.",
    wants: ["beloved", "cunning"],
    base: { regardDrift: 1, accordEase: 4 },
    perWant: { regardDrift: 1, accordEase: 5 },
  },
};
export const OFFICE_IDS = Object.keys(OFFICES);

/* How much of a post's worth actually arrives, by whether the holder is still
   yours. A muttering officer is worse than an empty chair in every way except
   that the chair is not plotting. */
export const OFFICE_LOYALTY = [
  { at: 75, share: 1.15, word: "devoted" },
  { at: 50, share: 1, word: "loyal" },
  { at: 30, share: 0.6, word: "uneasy" },
  { at: 0, share: 0.25, word: "muttering" },
];
export const officeShare = (loyalty) =>
  (OFFICE_LOYALTY.find((b) => (loyalty ?? 50) >= b.at) || OFFICE_LOYALTY[OFFICE_LOYALTY.length - 1]);

const BASE = { dealt: 1, taken: 1, morale: 1, storm: 1, ranged: 1, flank: 1, waste: 1, draw: 1 };
/* Every filled post added up. `held` is { officeId: captain }, captains as the
   rest of the game carries them. */
export function officeMods(held) {
  const out = { ...BASE, scout: 0, relief: 0, mul: {}, xp: 0, regardDrift: 0, accordEase: 0 };
  Object.entries(held || {}).forEach(([oid, c]) => {
    const o = OFFICES[oid];
    if (!o || !c) return;
    const share = officeShare(c.loyalty).share;
    const wants = (c.traits || []).filter((t) => o.wants.includes(t)).length;
    const add = (block, times) => {
      if (!block || times <= 0) return;
      for (let i = 0; i < times; i++) {
        Object.entries(block.mul || {}).forEach(([k, v]) => {
          out.mul[k] = (out.mul[k] || 1) * (1 + (v - 1) * share);
        });
        Object.entries(block.mods || {}).forEach(([k, v]) => {
          if (out[k] != null) out[k] *= 1 + (v - 1) * share;
        });
        if (block.draw) out.draw *= 1 + (block.draw - 1) * share;
        if (block.reliefAdd) out.relief += block.reliefAdd * share;
        if (block.xp) out.xp += block.xp * share;
        if (block.regardDrift) out.regardDrift += block.regardDrift * share;
        if (block.accordEase) out.accordEase += block.accordEase * share;
      }
    };
    add(o.base, 1);
    add(o.perWant, wants);
  });
  return out;
}

/* ------------------------------ THE DECISIONS ----------------------------- */
/* `need` reads the same context the petitions do, so a decision can ask about
   the position without knowing how the position is stored. Everything here
   happens once and stays happened. */
export const DECISIONS = {
  dyke: {
    name: "Raise the Lunden dyke",
    line: "Wall the river out of the lower wards for good.",
    note: "Four years of every spare hand and every spare tonne of rubble on the coast, and at the end of it the tide stops taking the Southwark yards twice a decade. The people who live there have been asking for three generations.",
    need: (c) => c.seat,
    cost: { scrap: 220, men: 60 },
    gives: { mul: { food: 1.08, scrap: 1.05 }, pop: 120 },
    done: "The last course goes in on a grey afternoon with nobody watching. The lower wards are dry for the first time in living memory and within a year nobody can remember them otherwise.",
  },
  muster: {
    name: "Proclaim the general muster",
    line: "Every ward owes companies, in perpetuity.",
    note: "Not a levy for this war — a standing obligation, read out at every gate and written into how the wards govern themselves. It will fill your musters for the rest of the game and the wards will never quite forgive it.",
    need: (c) => c.holdings >= 3,
    cost: { scrap: 90 },
    gives: { mul: { men: 1.18 }, growth: 0.88 },
    done: "It is read out at every gate on the same morning. Nobody refuses and nobody cheers.",
  },
  chroniclers: {
    name: "Send out the chroniclers",
    line: "Somebody should be writing this down.",
    note: "Four literate people, a cart and an instruction to go and look at things. They will come back with the shape of the coast, and with stories that are worth more than the cart.",
    need: (c) => c.scrap >= 60,
    cost: { scrap: 60 },
    gives: { scoutAdd: 1, reveal: 3 },
    done: "They go out in spring and are gone a year. What comes back is four notebooks, a great deal of hearsay, and a map that is better than the one you had.",
  },
  burnrolls: {
    name: "Burn the old rolls",
    line: "Every debt, tithe and tenancy written before the water came.",
    note: "There are ledgers in the seat that still record what a family owed to a bank that has been underwater for three hundred years. Burning them is either an act of mercy or the end of property, depending on who you ask.",
    need: (c) => c.seat,
    cost: { scrap: 40 },
    gives: { growth: 1.12, pop: 90, mul: { scrap: 0.97 } },
    done: "It takes two days to burn and the smoke is visible from the flats. What follows is the quietest winter anybody can remember.",
  },
  grandhall: {
    name: "Raise a hall worth the name",
    line: "Somewhere for the coast to come and be impressed.",
    note: "A roof, a long fire, and room for two hundred people to be given dinner and told what you have decided. It is not a fortification and it is not meant to be.",
    need: (c) => c.seat && c.scrap >= 150,
    cost: { scrap: 150, metal: 20 },
    gives: { hall: 2, loyalGain: 1.2, regardAll: 5 },
    done: "The first feast runs three days. Two rival envoys attend, one of whom was not invited.",
  },
  wardschools: {
    name: "Put a reader in every ward",
    line: "One person in each who can read the manuals.",
    note: "Cheap, slow, and it will do nothing for ten years. After that every advance your workshops attempt has somebody in the room who can follow the instructions.",
    need: (c) => c.holdings >= 5,
    cost: { scrap: 130, food: 60 },
    gives: { research: 0.85 },
    done: "It is done ward by ward over four years and nobody notices until the year the powder mills stop blowing up.",
  },
};
export const DECISION_IDS = Object.keys(DECISIONS);

/* Everything the decisions taken come to. */
export function decisionMods(taken) {
  const out = { ...BASE, scout: 0, relief: 0, mul: {}, research: 1, loyalGain: 1, growth: 1, hall: 0 };
  (taken || []).forEach((id) => {
    const d = DECISIONS[id];
    if (!d) return;
    const g = d.gives || {};
    Object.entries(g.mul || {}).forEach(([k, v]) => { out.mul[k] = (out.mul[k] || 1) * v; });
    Object.entries(g.mods || {}).forEach(([k, v]) => { if (out[k] != null) out[k] *= v; });
    if (g.scoutAdd) out.scout += g.scoutAdd;
    if (g.reliefAdd) out.relief += g.reliefAdd;
    if (g.research) out.research *= g.research;
    if (g.loyalGain) out.loyalGain *= g.loyalGain;
    if (g.growth) out.growth *= g.growth;
    if (g.hall) out.hall += g.hall;
  });
  return out;
}

/* ----------------------------- THE MILESTONES ----------------------------- */
/* A warlord is what has happened to them. `need` is handed one object with
   everything the realm has actually done in it — fields won, walls taken,
   woods cleared, hosts broken, peoples sworn to you, and seasons this warlord
   has held the seat — most of which the game was already tallying for the
   chapters. The two options are habits, and the one you pick is added to the
   warlord for good.

   The trait ids here are defined in captains.js alongside the rest, so a habit
   earned at a milestone is the same kind of thing as a habit a captain was
   born with, and reads the same everywhere. */
export const MILESTONES = {
  fivefields: {
    need: (t) => (t.fields || 0) >= 5,
    kicker: "A habit hardens",
    title: "Five fields",
    scene: "Five times now the companies have drawn up and looked across at somebody, and five times they have come off that ground still yours. The ones who were there the first time talk about you differently to the ones who joined last spring.",
    options: [
      { trait: "ofline", name: "Of the line", note: "They have stood in it. Every company you lead holds its nerve longer." },
      { trait: "ofchase", name: "Of the chase", note: "They have learned what a beaten army is worth if you go after it. The broken are run down harder." },
    ],
  },
  firstwall: {
    need: (t) => (t.walls || 0) >= 1,
    kicker: "A habit hardens",
    title: "The first wall",
    scene: "Stonework is a different argument to a field, and you have now won one. Somebody in the companies has started saying that walls are not the problem people think they are, and they are quoting you.",
    options: [
      { trait: "wallwise", name: "Wall-wise", note: "Storming comes easier, and the companies believe it will." },
      { trait: "patient", name: "Patient", note: "A siege costs you less to sit through, and the garrison inside wears down faster." },
    ],
  },
  sworn: {
    need: (t) => (t.sworn || 0) >= 1,
    kicker: "A habit hardens",
    title: "Sworn to you",
    scene: "A people who owed you nothing have decided they would rather be on your side of whatever comes next. That is not something a warband does for you.",
    options: [
      { trait: "openhand", name: "Open-handed", note: "Everything an envoy of yours carries is worth more. Regard comes faster." },
      { trait: "ironname", name: "A name with iron in it", note: "The holdouts think twice about your ground, and your companies stand a little better on it." },
    ],
  },
  longreign: {
    need: (t) => (t.seasons || 0) >= 30,
    kicker: "A habit hardens",
    title: "Thirty seasons in the chair",
    scene: "Seven and a half years. Long enough that there are people in the wards who cannot remember anybody else holding the seat, and long enough that you have stopped being surprised by most of it.",
    options: [
      { trait: "oldchair", name: "Old in the chair", note: "Captains are slower to lose faith in somebody who has been there that long." },
      { trait: "setways", name: "Set in their ways", note: "Nothing new, but the ledger runs better than it has any right to." },
    ],
  },
};
export const MILESTONE_IDS = Object.keys(MILESTONES);
