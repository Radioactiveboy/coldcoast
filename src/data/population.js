/* ------------------------------- POPULATION --------------------------------
   Who actually lives on a tile. Before this, recruits came straight off the
   terrain — a plains hex simply produced two a season forever, whoever held
   it and whatever had happened there. Population puts a number between the
   ground and the muster roll: it can be grown, it can be raided, and raising
   a company takes people off it for good.

   The numbers below are chosen so that an ordinary tile yields exactly what
   it used to. POP_TERRAIN divided by POP_PER_HEAD reproduces the old
   TERRAIN[t].men for every terrain in the game — plains 120/60 = 2, steppe
   180/60 = 3, ruinfield 60/60 = 1, mountains 0. Nothing about the economy of
   the ~8,500 unnamed tiles moves. What changes is that the named places are
   no longer ordinary.
   ------------------------------------------------------------------------ */

/* One in sixty will follow a banner, up to a point. Past POP_CLOSE a place is
   a town rather than a hamlet: it feeds and employs its own, and only one in
   three hundred is spare. Without the second rate a capital of two thousand
   would out-recruit a dozen provinces on its own. */
export const POP_PER_HEAD = 60;
export const POP_CLOSE = 300;
export const POP_PER_TOWN = 300;

/* What raising a company takes off the ground it was mustered from — half the
   company, permanently. The other half is reckoned to be drifters, younger
   sons and people who were passing through. */
export const POP_PER_COMPANY = 0.5;

/* How much a tile can support being built on. A hamlet has the hands for one
   worksite; a town can run three. */
export const POP_SLOTS = [
  { at: 1200, slots: 3, name: "a town" },
  { at: 300, slots: 2, name: "a village" },
  { at: 0, slots: 1, name: "a hamlet" },
];

export const POP_TERRAIN = {
  p: 120,   // Plains — the old men: 2
  f: 60,    // Cold forest — 1
  h: 60,    // Hills — 1
  m: 0,     // Mountains — nobody lives up there
  s: 180,   // Steppe — 3, the horse country
  t: 60,    // Tundra — 1
  g: 0,     // Glacier — 0
  d: 70,    // Silt flats — 1, thin but the ground is generous
  c: 30,    // Saltmarsh — 0, too wet to hold many
  r: 60,    // Ruinfield — 1, whoever is still picking it over
  b: 20,    // Saltpan — 0
  l: 30,    // Freshwater — 0
};

/* Wasters and the changed are people too. A ruin somebody is holding has more
   in it than an empty one, and taking it takes them with it. */
export const POP_LAIR = { wasters: 180, changed: 60, barricade: 140 };

/* The named places, by hand. These are the only tiles that are not simply
   their terrain, and the reason Lunden feels like somewhere. A capital is
   listed here too — the seat bonus is on top. */
export const POP_LANDMARK = {
  "25,77": 2000,  // Lunden — the Doggerbund seat, the biggest thing left standing
  "35,99": 1500,  // Lyon Terraces — the Concordat's seat
  "45,97": 1350,  // The Innsbruck Door — the Alpine Compact's seat
  "59,106": 1300, // Ragusa-on-the-Flats — the Karst League's seat
  "58,28": 1200,  // Skjoldhall — the Boreal seat, and thin ground for it
  "87,91": 1400,  // Karkhan Wells — the Horde's seat
  "17,120": 1350, // Meseta Prime — the Solar Throne's seat
  "14,81": 900,   // Red-Ruth — the Quarrymen, three hundred years down the shafts

  "23,67": 620,   // York Minster — the stone kept people around it
  "20,68": 560,   // Manchester Pit
  "22,72": 540,   // Birmingham Heap
  "22,67": 480,   // Leeds Cut
  "19,59": 460,   // Edinburgh Crag
  "16,59": 430,   // Glasgow Rust
  "22,61": 380,   // Newcastle Slag
  "12,70": 420,   // Dublin Bar
  "13,64": 360,   // Belfast Ram
  "19,77": 400,   // Cardiff Tide
  "20,77": 380,   // Bristol Weir
  "17,81": 340,   // Plymouth Hulk
  "28,72": 300,   // Norwich Fen

  "46,68": 640,   // Hamburg Yards — the yards still work
  "35,72": 580,   // Amsterdam Bed
  "54,72": 700,   // Berlin Vault
  "39,78": 520,   // Koln Ash
  "30,87": 760,   // Paris Ash — enormous once, and it shows
  "52,59": 420,   // Kobenhavn Sill
  "48,44": 340,   // Oslo Cleft
  "62,46": 380,   // Stockholm Reef
  "64,65": 400,   // Gdansk Keel
  "70,74": 560,   // Warszawa Stack
  "55,83": 600,   // Praha Vault
  "59,90": 640,   // Wien Door
  "65,93": 520,   // Budapest Span
  "83,67": 380,   // Minsk Hollow
  "75,55": 320,   // Riga Deep
  "103,59": 720,  // Muskova Drift
  "57,68": 340,   // Rostov Gate
  "64,70": 400,   // Volgograd Line
  "88,81": 620,   // Kyiv Shelf
  "80,104": 480,  // Bucuresti Flats

  "45,100": 580,  // Milan Foundry
  "41,102": 460,  // Torino Works
  "51,98": 440,   // Venezia Silt
  "51,115": 820,  // Roma Cinders — the biggest ruin in the south
  "55,117": 560,  // Napoli Slag
  "36,107": 420,  // Marseille Pan
  "28,116": 500,  // Barcelona Salt
  "13,132": 420,  // Sevilla Kiln
  "6,126": 400,   // Lisboa Mouth
  "86,116": 780,  // Stanbul Gate — the crossing, and everyone uses it
  "94,122": 380,  // Ankara Rise
  "74,129": 360,  // Athina Stone
};

/* People arrive, and are born, and mostly they do neither quickly. Growth is
   a percentage of what is already there, so an empty moor fills very slowly
   and a town fills fast — which is the wrong way round for fairness and the
   right way round for how places actually work. The season decides whether
   anyone is having children at all: nothing grows in a Cold Coast winter. */
export const POP_GROWTH = 0.02;
export const POP_GROWTH_SEASON = { spring: 1.4, summer: 1.0, autumn: 0.6, winter: 0 };

/* No tile grows forever. The ceiling is what the ground can carry — a
   multiple of what was there when the world was made, so good land and the
   old cities stay ahead of a moor no matter how long you feed them. */
export const POP_CEILING_MULT = 2.5;
export const POP_CEILING_FLOOR = 150;

/* Feeding a ward through the winters. Rations up front, and people arrive
   over several seasons rather than the moment you pay — the whole point is
   that it is a long bet against a short one. */
export const POP_INVEST = { food: 100, seasons: 6, per: 30 };

export function popCeiling(k, terrain) {
  const base = POP_LANDMARK[k] ?? POP_TERRAIN[terrain] ?? 0;
  if (base <= 0) return 0;                 // nobody is ever going to live on a glacier
  return Math.max(POP_CEILING_FLOOR, Math.round(base * POP_CEILING_MULT));
}

/* One season of natural change for one tile. Returns the new head count. */
export function popGrow(pop, ceiling, season) {
  const n = Math.max(0, Math.floor(pop || 0));
  if (n <= 0 || ceiling <= 0 || n >= ceiling) return n;
  const rate = POP_GROWTH * (POP_GROWTH_SEASON[season] ?? 1);
  if (rate <= 0) return n;
  // Always at least one when anything is growing at all, or a hamlet of 20
  // rounds to nothing every season and never moves.
  const add = Math.max(1, Math.round(n * rate));
  return Math.min(ceiling, n + add);
}

/* Recruits a season from a given head count. See the note on POP_CLOSE for
   why there are two rates. */
export function popRecruits(pop) {
  const n = Math.max(0, Math.floor(pop || 0));
  if (n <= 0) return 0;
  const near = Math.min(n, POP_CLOSE);
  const far = Math.max(0, n - POP_CLOSE);
  return Math.floor(near / POP_PER_HEAD) + Math.floor(far / POP_PER_TOWN);
}

/* How many things can stand on this ground at once. */
export function popSlots(pop) {
  const n = Math.max(0, Math.floor(pop || 0));
  return (POP_SLOTS.find((s) => n >= s.at) || POP_SLOTS[POP_SLOTS.length - 1]).slots;
}

export function popRank(pop) {
  const n = Math.max(0, Math.floor(pop || 0));
  return (POP_SLOTS.find((s) => n >= s.at) || POP_SLOTS[POP_SLOTS.length - 1]).name;
}

/* What a company takes off the ground that raised it. */
export const popCostOf = (size) => Math.round((size || 0) * POP_PER_COMPANY);

/* Starting head count for one tile. Named places win over terrain; a lair adds
   whoever is holding it on top. */
export function startingPop(k, terrain, lair) {
  const base = POP_LANDMARK[k] ?? POP_TERRAIN[terrain] ?? 0;
  return base + (lair ? (POP_LAIR[lair] || 0) : 0);
}
