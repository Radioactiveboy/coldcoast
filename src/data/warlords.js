/* -------------------------------- WARLORDS --------------------------------
   One leader per realm. Their two habits are not flavour — each one multiplies
   something the realm actually does, and rivals carry theirs into the field
   against you.
   ------------------------------------------------------------------------ */
export const WARLORDS = {
  dogger: {
    name: "Headsman Arthus Grimhand", title: "Warden of the Wrack",
    blurb: "Wears an admiral's coat off a hull nobody has ever named, and the authority that came with it. He took Lunden by walking up the dry Thames with four hundred wreck-divers behind him, and he has kept it the same way since. They call him Headsman for what happens on the flats to men who broach a cargo before it is counted.",
    traits: [
      { n: "Wreck-sense", d: "He can tell a hull's tonnage from the sound the torch makes, and he has never once been talked out of a dive.", mul: { scrap: 1.15 } },
      { n: "Hard discipline", d: "His columns are rationed to the ounce and nobody argues twice.", upkeep: 0.88 },
    ],
  },
  lyon: {
    name: "Prefect Aurel Sancerre", title: "Keeper of the Rolls",
    blurb: "Inherited a filing system and treats it as a birthright. Every household in the Concordat is written down somewhere, and he knows which drawer.",
    traits: [
      { n: "Rolls and registers", d: "Nobody escapes the levy.", mul: { men: 1.2 } },
      { n: "Graded roads", d: "The old routes are kept clear and metalled.", move: 1 },
    ],
  },
  alpine: {
    name: "Warden Ilsa Grauber", title: "of the Inner Door",
    blurb: "Third of her line to hold the keys. She has read every manual behind the door and believes, correctly, that patience is a weapon.",
    traits: [
      { n: "Vault-read", d: "She can follow a diagram nobody else can.", research: 0.85 },
      { n: "Cold patience", d: "Her people do not break early.", taken: 0.9 },
    ],
  },
  karst: {
    name: "Doge Nikolo Brac", title: "the Ledger-Hand",
    blurb: "Holds the tolls on four passes and a bridge that only exists because he says it does. He has never fought a battle he could buy instead.",
    traits: [
      { n: "Ledger-hand", d: "Tolls, tariffs and creative accounting.", mul: { scrap: 1.18 } },
      { n: "Hired blades", d: "Somebody else's sons, at a price.", recruitCost: 0.8 },
    ],
  },
  boreal: {
    name: "Hjalmar Ice-Tongue", title: "Speaker of the Clans",
    blurb: "Talked six clans into one war band and has kept them there for nineteen winters, mostly by being the last man still standing at the fire.",
    traits: [
      { n: "Ice-born", d: "His people fight hardest in the worst of it.", dealt: 1.14 },
      { n: "Lean winters", d: "They were hungry before you got here.", upkeep: 0.85 },
    ],
  },
  horde: {
    name: "Tamar of the Dry Sea", title: "Rider of the Salt",
    blurb: "Born on the old seabed, has never slept under a roof she did not intend to leave by morning. She measures countries in days of riding.",
    traits: [
      { n: "Long saddle", d: "Her columns cover ground nobody expects.", move: 1 },
      { n: "Horse-lore", d: "Her charges land where they are least wanted.", dealt: 1.1 },
    ],
  },
  solar: {
    name: "Infanta Sol de Meseta", title: "of the Mirror Court",
    blurb: "Crowned at nine under a field of heliostats. Her court measures the day in degrees of arc and considers cloud a personal insult.",
    traits: [
      { n: "Mirror-work", d: "The fields are kept aligned to the minute.", mul: { fuel: 1.25 } },
      { n: "Sun-court", d: "Scholars are fed before soldiers.", research: 0.9 },
    ],
  },
  quarrymen: {
    name: "Gorran Black", title: "Pit-King of Red-Ruth",
    blurb: "Wears a crown beaten from shaft-lining and a pick he has never put down. The shifts elected his grandfather and have never seen cause to hold another vote. He has not left Kernow in forty years and regards everyone who arrives at the pit rim as weather.",
    traits: [
      { n: "Deep shifts", d: "The workings run day and dark and have never once been let go cold.", mul: { scrap: 1.2 } },
      { n: "Cut faces", d: "Every approach to the rim is ranged, and he set the ranges himself.", taken: 0.85 },
    ],
  },
};

export function lordOf(natId) { return WARLORDS[natId]; }

// Applies only to the warband the warlord is actually with.
export const LORD_COMMAND = {
  dogger:    { n: "Cuts from the front", d: "He goes in with the first company and everyone knows it.", dealt: 1.12 },
  lyon:      { n: "Dressed ranks", d: "His companies keep their intervals under fire.", taken: 0.9 },
  alpine:    { n: "Cold patience", d: "She will stand there all day and so will they.", taken: 0.85 },
  karst:     { n: "Paid in advance", d: "Men who have already been paid do not run as early.", morale: 0.78 },
  boreal:    { n: "Ice-born", d: "He fights hardest in the worst of it and shames the rest into it.", dealt: 1.16 },
  horde:     { n: "Horse-lore", d: "Her charges land where they are least wanted.", dealt: 1.12 },
  solar:     { n: "Mirror signals", d: "Orders reach the flanks before the enemy reaches them.", dealt: 1.08, taken: 0.94 },
  quarrymen: { n: "Cut faces", d: "He set the ranges himself and has not forgotten one.", taken: 0.85 },
};
// A realm that has lost its warlord and not replaced them.
export const LEADERLESS = { mul: { food: 0.85, scrap: 0.85, men: 0.8 }, upkeep: 1.12,
                     research: 1.35, move: 0, recruitCost: 1.2 };
