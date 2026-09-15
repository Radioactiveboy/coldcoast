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
};
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
