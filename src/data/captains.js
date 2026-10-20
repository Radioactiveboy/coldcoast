/* -------------------------------- CAPTAINS ---------------------------------
   Every warband you raise is led by somebody. They are not a stat block with
   a name on it: a captain is two habits, a number for how much they still
   believe in you, and a memory of what has happened to them. The habits
   change what the warband does — a little, never enough to be the whole
   answer — and the number decides whether they are still yours next winter.

   Loyalty is earned, not paid. It rises with victories and seasons fed, and
   falls with defeats, hunger and slights. At nothing they walk, and they take
   the warband with them.
   ------------------------------------------------------------------------ */

/* Name pools by realm. First names and the by-names people actually call
   them by; a captain is "Marra Sixfathom" on the roll and "Sixfathom" at the
   fire. `any` is for a realm without its own list. */
export const CAPTAIN_NAMES = {
  dogger: {
    first: ["Marra", "Tobin", "Wick", "Hesper", "Coll", "Ede", "Ashby", "Drusa", "Kettle", "Orme", "Sabb", "Lune"],
    by: ["Sixfathom", "Weirhand", "Slackwater", "Blackpool", "Halfmast", "Cablelength", "Lowtide", "Oarsman", "Mudlark", "Saltlung", "Keelhaul", "Foghorn"],
  },
  lyon: {
    first: ["Aurelie", "Bastien", "Colombe", "Denis", "Élodie", "Fabien", "Ghislaine", "Honoré", "Iseult", "Jourdain"],
    by: ["of the Rolls", "Register", "Ledger", "Terraces", "Toll-Gate", "Sixth-Ward", "of the Lists", "Carrefour", "Milestone", "Count-Again"],
  },
  alpine: {
    first: ["Ilse", "Konrad", "Brigid", "Anselm", "Greta", "Lukas", "Mathilde", "Otto", "Rikke", "Sigrun"],
    by: ["Innerdoor", "Manual", "Coldstore", "Keyring", "Vault-Read", "Turnscrew", "Deadbolt", "Tolerance", "Blueprint", "Airlock"],
  },
  karst: {
    first: ["Nikola", "Vesna", "Damir", "Jelena", "Goran", "Mira", "Petar", "Ruža", "Stipe", "Zora"],
    by: ["Tollhouse", "Fourth-Pass", "Bridgewright", "Half-Ducat", "Ledgerhand", "Stonecut", "the Hire", "Salt-Road", "Broker", "Karst-Foot"],
  },
  boreal: {
    first: ["Hjalmar", "Sigrid", "Eirik", "Torunn", "Bjorn", "Asa", "Leif", "Ingrid", "Ulf", "Ragna"],
    by: ["Ice-Tongue", "Frostbite", "Longwinter", "Snowblind", "Six-Clan", "Firekeeper", "Whitewater", "Bearhide", "Hoarfrost", "Last-Standing"],
  },
  horde: {
    first: ["Tamar", "Arslan", "Sevinç", "Batu", "Ilkay", "Kutlu", "Nergui", "Oyun", "Temur", "Zerin"],
    by: ["Dry-Sea", "Saltrider", "Longsaddle", "Nine-Days", "Seabed", "Windbreak", "Horse-Lore", "No-Roof", "Salt-Crust", "Far-Water"],
  },
  solar: {
    first: ["Sol", "Ximena", "Alonso", "Beatriz", "Cristóbal", "Dolores", "Esteban", "Fátima", "Gaspar", "Inés"],
    by: ["Heliostat", "of the Arc", "Mirrorwatch", "Cloudless", "Degrees", "Noonmark", "of the Court", "Bright-Field", "Sunward", "Meseta"],
  },
  any: {
    first: ["Ash", "Brann", "Cade", "Dru", "Esk", "Fen", "Gale", "Hollis", "Ivo", "Jory"],
    by: ["the Quiet", "Longshanks", "Grey", "the Younger", "Roadworn", "Half-Hand", "the Steady", "Late-Come", "Two-Winters", "Nobody's"],
  },
};

/* What a habit does. Multipliers sit on the warband in the field and on the
   road; `scout` and `relief` add. Nothing here is more than about a sixth
   either way, because the point is that who leads matters, not that the
   right captain wins the war on their own. */
export const TRAITS = {
  cautious:    { name: "Cautious", born: true,
    desc: "Keeps the companies together and is slow to press. Loses fewer men, wins fewer fields.",
    taken: 0.92, dealt: 0.96 },
  hungry:      { name: "Hungry for a wall", born: true,
    desc: "Wants a storm the way other people want a warm bed. Goes at stonework hard.",
    storm: 1.12 },
  hunter:      { name: "Loved by the hunters", born: true,
    desc: "Grew up on the moor. The bows shoot better for them and the scouts go further.",
    scout: 1, ranged: 1.06 },
  drover:      { name: "Knows the carts", born: true,
    desc: "Can keep a column fed one hex further out than anyone else could.",
    relief: 1 },
  hard:        { name: "Hard as the frost", born: true,
    desc: "Nobody under them runs early. Nobody under them is very fond of them either.",
    morale: 0.9, loyalGain: 0.85 },
  proud:       { name: "Proud", born: true,
    desc: "Takes a slight the way stone takes water — slowly, and then all at once.",
    slight: 2 },
  beloved:     { name: "Beloved", born: true,
    desc: "The companies would follow them anywhere, and forgive most things.",
    loyalGain: 1.5 },
  reckless:    { name: "Reckless", born: true,
    desc: "Goes in first and thinks about it afterwards. Wins ugly and loses uglier.",
    dealt: 1.08, taken: 1.08 },
  steady:      { name: "Steady", born: true,
    desc: "Not fast, not brilliant, and still standing at the end of most things.",
    morale: 0.94 },
  forager:     { name: "Forager", born: true,
    desc: "Knows what is edible and where it is. A long march wastes fewer of theirs.",
    waste: 0.7 },
  // Earned in the field, and written on them for good.
  wallbreaker: { name: "Wallbreaker", earned: true,
    desc: "Has gone up a breach and come down the other side. Storms harder for it.",
    storm: 1.15 },
  careful:     { name: "Careful with rations", earned: true,
    desc: "Lost men to hunger once and has counted every sack since.",
    waste: 0.5, draw: 0.9 },
  veteran:     { name: "Veteran of five fields", earned: true,
    desc: "Has stood in a line five times and knows what comes next before it does.",
    taken: 0.94, morale: 0.94 },
  cunning:     { name: "Turns flanks", earned: true,
    desc: "Saw a line come apart once and has been looking for the seam ever since.",
    flank: 1.2 },
  shaken:      { name: "Shaken", earned: true,
    desc: "Lost a field and has not stopped thinking about it. A win takes this away.",
    morale: 1.08 },
  /* What a captain hardens into. These are chosen at the marks below — one of
     two, by you, permanent — which is the difference between a captain and
     the warlord, who used to be the only person in this game with a life.
     They are larger than a warlord's habits because they reach one warband
     rather than every warband. */
  quickeye:    { name: "Quick eye", mark: true,
    desc: "Reads a line the moment it is drawn and knows which end of it is lying.",
    flank: 1.25, scout: 1 },
  stubborn:    { name: "Stubborn", mark: true,
    desc: "Has been told the position was lost on five separate occasions and has not yet agreed.",
    morale: 0.88, dealt: 0.96 },
  firstup:     { name: "First up the ladder", mark: true,
    desc: "Goes up a breach ahead of the company, which is either leadership or a death wish.",
    storm: 1.22, taken: 1.05 },
  minesapper:  { name: "Sapper", mark: true,
    desc: "Would rather spend three seasons under a wall than one afternoon on top of it.",
    siege: 0.7, storm: 0.95 },
  bitter:      { name: "Bitter", mark: true,
    desc: "Lost a field and decided whose fault it was. Fights harder and is harder to keep.",
    dealt: 1.1, loyalGain: 0.7 },
  tempered:    { name: "Tempered", mark: true,
    desc: "Lost a field, buried the companies, and came back a steadier thing than went out.",
    morale: 0.9, taken: 0.95 },
  oldhand:     { name: "Old hand", mark: true,
    desc: "Has been under this banner long enough to know where everything is kept.",
    waste: 0.6, relief: 1, loyalGain: 1.2 },
  hardbitten:  { name: "Hard-bitten", mark: true,
    desc: "Ten winters of this. Nothing surprises them and nothing much pleases them either.",
    taken: 0.9, loyalGain: 0.8 },
  namesake:    { name: "A name of their own", mark: true,
    desc: "Twenty fields. People who have never served under them have opinions about them.",
    morale: 0.88, dealt: 1.06 },
  grimmer:     { name: "Grim", mark: true,
    desc: "Twenty fields and a way of looking at a map that empties a room.",
    dealt: 1.12, taken: 0.96, loyalGain: 0.75 },

  // What a warlord brings to the whole realm, by where they came from. These
  // reach every warband, which is why they are smaller than a captain's.
  tracker:     { name: "Tracker", origin: true,
    desc: "Raised on the moor with a bow in hand. Every warband scouts a little further and shoots a little straighter.",
    scout: 1, ranged: 1.04 },
  forgewise:   { name: "Forgewise", origin: true,
    desc: "Grew up at the bloomery. The realm gets more out of every heap of scrap.",
    mul: { scrap: 1.1 } },
  oldsoldier:  { name: "Old soldier", origin: true,
    desc: "Stood in a line before they held a seat. Nobody under their banner breaks early.",
    morale: 0.95, loyalStart: 15 },
  /* What a warlord hardens into. These are earned at the milestones in
     court.js — one of two, chosen, permanent — and they reach the whole realm
     the way an origin does, which is why none of them is large. */
  ofline:      { name: "Of the line", lord: true,
    desc: "Has stood in it five times. Every company under the banner holds its nerve longer.",
    morale: 0.92 },
  ofchase:     { name: "Of the chase", lord: true,
    desc: "Knows exactly what a beaten army is worth if somebody goes after it. The broken are run down harder.",
    chase: 1.3 },
  wallwise:    { name: "Wall-wise", lord: true,
    desc: "Has taken stonework and the companies know it. Storms come easier under this banner.",
    storm: 1.1, morale: 0.97 },
  patient:     { name: "Patient", lord: true,
    desc: "Would rather sit in front of a wall for two years than lose a company going up it.",
    siege: 0.75, garrison: 1.3 },
  openhand:    { name: "Open-handed", lord: true,
    desc: "Whatever an envoy of theirs carries is worth more than it weighs. Regard comes faster.",
    regardGain: 1.5 },
  ironname:    { name: "A name with iron in it", lord: true,
    desc: "The holdouts think twice about this realm's ground, and its companies stand better on it.",
    taken: 0.96, raidOff: 0.7 },
  oldchair:    { name: "Old in the chair", lord: true,
    desc: "Has held the seat long enough that leaving looks stranger than staying.",
    loyalGain: 1.3 },
  setways:     { name: "Set in their ways", lord: true,
    desc: "Nothing new will be attempted. What there is runs better than it has any right to.",
    mul: { food: 1.05, scrap: 1.05 } },
};
// The habits only a warlord can hold, earned at a milestone.
export const LORD_TRAITS = Object.keys(TRAITS).filter((id) => TRAITS[id].lord);
// ...and the ones only a captain can, chosen at a mark.
export const MARK_TRAITS = Object.keys(TRAITS).filter((id) => TRAITS[id].mark);
export const BORN_TRAITS = Object.keys(TRAITS).filter((id) => TRAITS[id].born);
// Pairs that cannot both be true of one person.
export const TRAIT_CLASH = [["cautious", "reckless"], ["hard", "beloved"]];

/* --------------------------------- THE HALL --------------------------------
   Nobody leads a warband because it was raised. Somebody leads it because
   you gave them the command, and you gave it to somebody who was standing in
   your hall waiting to be given one.

   Fighting men drift to a seat that looks like it is going somewhere — one
   every few seasons, more if you hold more ground — and you can send word
   out and pay for one to ride in. Appointing costs: a captain with fields
   behind them expects more than a man with none. */
export const HALL = {
  cap: 4,               // how many will wait around at once
  driftBase: 0.16,      // chance a season that somebody turns up
  driftPerHold: 0.012,  // ...better if the realm is visibly growing
  driftMax: 0.45,
  sendScrap: 35,        // send word out; one rides in next season
  appointBase: 25,      // what a man with no record expects
  appointPerField: 8,   // ...and what every field behind him adds
};
export const appointCost = (c) => HALL.appointBase + (c?.fields || 0) * HALL.appointPerField;

export const LOYALTY = {
  start: [45, 70],   // where a new captain begins
  win: 6, loss: -8,  // a field won or lost
  fed: 1, starve: -4, // a season in supply, a season past the end of the line
  slight: -10,       // passed over for the seat
  broken: -15,       // the warband annihilated under them (if they live)
  honour: 4,         // a company under them takes a name
  lostHonour: -5,    // a named company under them is destroyed
  mutter: 25,        // below this they are muttering, and the panel says so
};

/* Company honours: a company that survives this many fields takes a name
   from where it earned the last one. */
export const HONOUR_AT = 5;
export const HONOUR_WORDS = {
  spearmen: "Spears", pikemen: "Pikes", axemen: "Axes", hunters: "Bows", bowmen: "Bows",
  riders: "Riders", ironclad: "Shields", line: "Line", musketeers: "Guns", guncrew: "Guns",
  technicals: "Engines", vaultguard: "Guard", riflemen: "Rifles", baggage: "Carts",
};

/* ------------------------------ A CAPTAIN'S LIFE ----------------------------
   A captain used to be two traits rolled at birth, a loyalty number and three
   counters. The warlord got a scene at every milestone asking which of two
   habits it had made of them; the people you actually look at every season got
   a trait handed to them silently, or nothing at all.

   These are the same thing for the people who do the fighting. A mark comes
   true because of something that happened to THIS captain — five fields, a
   breach gone up, a field lost and lived through, ten winters under your
   banner, twenty fields — and you choose which of two ways it marked them.
   Once, and it is on them for good.

   `need` reads the captain's own record, not the realm's. That is the whole
   point: two captains in the same war have different lives.
   ------------------------------------------------------------------------ */
export const MARKS = {
  blooded: {
    need: (c) => (c.fields || 0) >= 5,
    kicker: "Something has settled in them",
    title: "Five fields",
    scene: "Five times now they have drawn a line up and watched somebody come at it. The company that joined last spring has started asking them what happens next instead of asking each other, and they have started having an answer ready before the question.",
    options: [
      { trait: "quickeye", name: "A quick eye", note: "They have learned to read a line the moment it is drawn, and which end of it is lying." },
      { trait: "stubborn", name: "Stubborn", note: "They have been told the position was lost five times now, and have not once agreed." },
    ],
  },
  breach: {
    need: (c) => (c.storms || 0) >= 1,
    kicker: "Something has settled in them",
    title: "Up the breach",
    scene: "They have gone up broken stonework with people above them trying to stop it happening, and come down the other side. Nobody who has done that talks about walls the way they did before, and there are two quite different ways of not talking about them.",
    options: [
      { trait: "firstup", name: "First up the ladder", note: "They go up ahead of the company now. It is either leadership or a death wish and nobody is sure which." },
      { trait: "minesapper", name: "A sapper", note: "They would rather spend three seasons under a wall than one more afternoon on top of one." },
    ],
  },
  rout: {
    need: (c) => (c.routs || 0) >= 1,
    kicker: "Something has settled in them",
    title: "A field lost, and lived through",
    scene: "The line went, and they came off the field with what was left of it, which is a thing that happens to most captains once and changes all of them. They have spent the winter deciding what it was.",
    options: [
      { trait: "bitter", name: "Bitter", note: "They have decided whose fault it was. They fight harder now and they are harder to keep." },
      { trait: "tempered", name: "Tempered", note: "They buried the companies, said nothing, and came back a steadier thing than went out." },
    ],
  },
  tenwinters: {
    need: (c) => (c.seasons || 0) >= 10,
    kicker: "Something has settled in them",
    title: "Ten winters under your banner",
    scene: "Ten winters is long enough that the people who were new when they took the command have commands of their own, and long enough that nobody remembers them being anything else. It is also long enough to have opinions about how you run things.",
    options: [
      { trait: "oldhand", name: "An old hand", note: "They know where everything is kept and who to ask for it. Very little is wasted under them." },
      { trait: "hardbitten", name: "Hard-bitten", note: "Ten winters of this. Nothing surprises them and nothing much pleases them either." },
    ],
  },
  twentyfields: {
    need: (c) => (c.fields || 0) >= 20,
    kicker: "Something has settled in them",
    title: "Twenty fields",
    scene: "Twenty. People who have never served under them have firm opinions about them, and some of those people are on the other side of the mud. Whatever they are now, they have been it for a long time.",
    options: [
      { trait: "namesake", name: "A name of their own", note: "The companies believe in them, which is worth more in a long line than anything they actually do." },
      { trait: "grimmer", name: "Grim", note: "Twenty fields and a way of looking at a map that empties a room." },
    ],
  },
};
export const MARK_IDS = Object.keys(MARKS);

/* Which mark is due for this captain, if any. One at a time and in the order
   they are written, so a captain who has done everything at once still gets
   asked about it one thing at a time. */
export function markDue(c) {
  if (!c) return null;
  const answered = c.marks || [];
  return MARK_IDS.find((id) => !answered.includes(id) && MARKS[id].need(c)) || null;
}

/* --------------------------------- WOUNDS -----------------------------------
   What a field takes off somebody who does not die of it. A wound is not a
   habit: nobody chooses it, it does not come with a scene, and it never goes
   away. They are deliberately small — a captain with two of them is worse at
   their job and still worth keeping, which is the only interesting version. */
export const WOUNDS = {
  hand:  { name: "A hand that does not close", desc: "Took it on the shield side going up a breach.", dealt: 0.94 },
  leg:   { name: "A leg that set badly", desc: "Set by somebody in a hurry, in the dark, in a ditch.", storm: 0.82 },
  eye:   { name: "Lost an eye", desc: "They do not say to what and nobody asks twice.", ranged: 0.9, scout: -1 },
  lung:  { name: "Took a lung", desc: "Breathes like a man going uphill, on flat ground, in summer.", waste: 1.25 },
  face:  { name: "A face people look away from", desc: "Half of it is somebody else's work and all of it is permanent.", morale: 0.93, loyalGain: 0.85 },
};
export const WOUND_IDS = Object.keys(WOUNDS);
// How likely a captain is to come out of a bad day with something lasting.
export const WOUND_CHANCE = { rout: 0.3, storm: 0.22 };

/* --------------------------------- BONDS -----------------------------------
   Two captains who have been in the same war for long enough stop being
   strangers to each other, and which way that goes is mostly a matter of who
   they already were. A proud man and a hard one find a rival in each other;
   a beloved one and a steady one find somebody to stand next to.

   A bond is the only thing in this file that makes a field somebody ELSE
   fought matter to a captain who was not there. That is the whole of its
   job: your best man winning in Gallia should mean something in the hall at
   home, and whether it means gladness or gall depends on who is standing in
   it. One bond per person, mutual, and it does not quietly expire — it ends
   when one of them does, which is also when it is felt most.
   ------------------------------------------------------------------------ */
export const BONDS = {
  friend: {
    word: "Stands next to",
    gone: "Stood next to",
    note: "Glad of anything that goes right for them, and takes it badly when it does not.",
    lines: [
      "{a} and {b} have taken to sitting at the same end of the hall.",
      "{a} will not hear a word said against {b}, which is new.",
      "{a} and {b} came up out of the same war and have decided it makes them something.",
    ],
    fell: "{a} has not said anything since word came about {b}.",
  },
  rival: {
    word: "Will not stand next to",
    gone: "Would not stand next to",
    note: "Counts everything that goes right for them as something taken off their own total.",
    lines: [
      "{a} has started counting what {b} is given, out loud.",
      "{a} and {b} have had words. Nobody will say what about.",
      "{a} does not think much of {b}, and has stopped troubling to hide it.",
    ],
    fell: "{a} heard about {b} and said it was always going to end that way.",
  },
};
export const BOND = {
  needSeasons: 4,   // both of them long enough under the banner to have an opinion
  chance: 0.09,     // ...and then a winter at a time
  win: 2,           // what a field of theirs does to the other one
  fell: 12,         // ...and what losing them does to a friend
  fellRival: 5,     // ...or gives a rival
};
/* Sharp people find rivals and warm people find friends, and when a pair is
   neither the hall decides it for them. */
export function bondKind(a, b) {
  const count = (c, list) => list.filter((t) => (c.traits || []).includes(t)).length;
  const sharp = ["proud", "hard", "reckless", "bitter", "grimmer", "hardbitten", "firstup"];
  const warm = ["beloved", "steady", "tempered", "oldhand", "namesake", "cautious"];
  const s = count(a, sharp) + count(b, sharp);
  const w = count(a, warm) + count(b, warm);
  if (s !== w) return s > w ? "rival" : "friend";
  return Math.random() < 0.5 ? "rival" : "friend";
}
