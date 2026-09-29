/* --------------------------------- ENVOYS -----------------------------------
   The six realms you are actually competing with used to have one button
   between them: declare war, or pay forty scrap and hope. The peoples you meet
   on the road had scenes, regard, standing arrangements with terms in them —
   and the rivals, who decide whether you win, had a coin flip.

   This is the ladder they will climb with you. Every rung asks more regard
   than the one below it, and regard is earned the slow way: gifts, letting
   their broken companies walk off a field you won, sending a captain home
   instead of squeezing him. Every accord runs for a stated number of seasons
   and holds the peace while it does — which is the point of all of them. What
   separates them is what else they carry.

   Breaking one early is not a move, it is an oath broken, and the whole coast
   hears about it.

   An accord is data. `give` and `take` go into the ledger every season exactly
   like a pact; `pass` opens their ground to your warbands and yours to theirs;
   `against` is filled in when the accord names a third realm.
   ------------------------------------------------------------------------ */

/* The rungs, weakest first. `need` is the regard below which they will not
   hear it at all; `ratio` is how your holdings must compare to theirs before
   the thing makes any sense from their side. */
export const ACCORDS = {
  truce: {
    name: "A truce",
    ask: "Ask for a truce",
    note: "Neither of us takes ground from the other while it runs. Nothing else changes.",
    why: "The cheapest thing an envoy can carry, and the only one a cold realm will hear.",
    term: 12,
    cost: { scrap: 25 },
    need: 30,
    regard: 4,
    /* Can be asked for with a war already on — it is the negotiated way out of
       one, as against simply paying them to stop. Cheaper than suing for peace
       and binding on you as well, which is the trade. */
    inWar: true,
  },
  road: {
    name: "The road open both ways",
    ask: "Ask for the road",
    note: "Your columns cross their ground and theirs cross yours. The hexes stay whose they are.",
    why: "Worth more than it costs if their ground is between you and anywhere.",
    term: 16,
    cost: { scrap: 45 },
    need: 46,
    regard: 6,
    take: { scrap: 2 },
    pass: true,
  },
  trade: {
    name: "A standing trade",
    ask: "Propose a trade",
    note: "Their carts come east every season and yours go back loaded. Neither of us wants the road cut.",
    why: "The rung where a rival starts being worth more alive than dead.",
    term: 20,
    cost: { scrap: 60 },
    need: 58,
    regard: 8,
    give: { food: 5, metal: 2 },
    take: { scrap: 4 },
  },
  tributeTo: {
    name: "Tribute owed to them",
    ask: "Offer tribute",
    note: "Scrap and grain to their court every season, and their hosts look somewhere else.",
    why: "What you buy peace with when you are not in a position to ask for it.",
    term: 12,
    cost: {},
    need: 12,
    regard: 14,
    take: { scrap: 5, food: 3 },
    // They will hear this one from somebody weaker than them. That is the point.
    ratio: 0,
    // And it is the other way out of a war you are losing.
    inWar: true,
  },
  tributeFrom: {
    name: "Tribute owed to you",
    ask: "Demand tribute",
    note: "Their carts come to your seat every season because the alternative was explained to them.",
    why: "Only heard by a realm that can count, and never forgiven by one that can.",
    term: 12,
    cost: {},
    need: 20,
    regard: -20,
    // A demand is remembered by everybody who might be asked next.
    resented: true,
    give: { scrap: 6, food: 3 },
    // You have to be visibly the stronger before this is anything but an insult.
    ratio: 1.45,
  },
  league: {
    name: "A league",
    ask: "Ask them into your war",
    note: "They come in against whoever you name, and while it runs neither of us looks the other's way.",
    why: "The top of the ladder. They have to think well of you and badly of somebody else.",
    term: 14,
    cost: { scrap: 80 },
    need: 68,
    regard: 6,
    // Names a third realm; the screen fills it in.
    needsTarget: true,
  },
};
export const ACCORD_IDS = Object.keys(ACCORDS);

/* What a gift costs and what it buys. Deliberately poor value in scrap — it is
   the only move always open to you, not a shortcut. */
export const GIFT = { cost: { scrap: 30 }, regard: 7 };

/* How long the coast remembers that you tore up an accord, and what it costs
   with everybody while it does. */
export const ACCORD_OATH = 18;
export const ACCORD_BREAK_REGARD = 16;

/* Suing for peace, priced instead of flipped. What it costs scales with how
   badly it is going, and whether they take it depends on regard and on how the
   war is actually running — not on a coin. */
export const PEACE = { base: 30, perHolding: 4, max: 140 };

/* ---------------------------- HOW YOU STAND -------------------------------
   Said in a word, because "twelve holdings against nine" is a number and
   "barely stronger" is a position. */
export const STANDING = [
  { at: 2.0, word: "far stronger than them" },
  { at: 1.35, word: "stronger than them" },
  { at: 1.1, word: "a little ahead of them" },
  { at: 0.9, word: "an even match" },
  { at: 0.72, word: "a little behind them" },
  { at: 0.5, word: "weaker than them" },
  { at: 0, word: "far weaker than them" },
];
export const standing = (mine, theirs) => {
  const ratio = (mine || 0) / Math.max(1, theirs || 0);
  return { ratio, word: (STANDING.find((s) => ratio >= s.at) || STANDING[STANDING.length - 1]).word };
};

/* --------------------------- THE COALITION -------------------------------
   Nothing in the game used to correct a realm that got ahead, which is why a
   long game went quiet in the middle: whoever was winning kept winning at the
   same rate, unopposed. Once somebody is this far clear of second place, the
   rest of the coast starts making common cause — keener to declare war on
   them, readier to come into a league against them, and slower to agree
   anything at all with them.

   It applies to the player exactly as it applies to a rival. Running away with
   it is supposed to be dangerous.
   ------------------------------------------------------------------------ */
export const COALITION = {
  ahead: 1.4,        // of second place, before the rest take notice
  minHold: 6,        // and not while everybody is still small
  war: 2.4,          // times as likely to be declared on
  accord: -14,       // regard, when they come asking for anything
  league: 26,        // and how much likelier a league against them is heard
};

const RES_WORD = { food: "rations", scrap: "scrap", metal: "metal", fuel: "fuel", powder: "powder", men: "recruits" };

/* An accord said the way a ledger would say it, so what it is worth every
   season is on the card and not in the player's head. */
export function accordTerms(id) {
  const a = ACCORDS[id];
  if (!a) return null;
  const list = (o, sign) => Object.entries(o || {}).map(([k, v]) => `${sign}${v} ${RES_WORD[k] || k}`);
  const gives = list(a.give, "+"), takes = list(a.take, "−");
  const asked = list(a.cost, "").join(", ");
  return {
    name: a.name,
    gives: gives.join(", "),
    takes: takes.join(", "),
    line: [gives.join(", "), takes.join(", ")].filter(Boolean).join(" against ")
      + (gives.length || takes.length ? " a season" : ""),
    asked,
    pass: !!a.pass,
    term: a.term,
  };
}
