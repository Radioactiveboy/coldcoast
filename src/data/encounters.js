/* ------------------------------ FIRST CONTACT ------------------------------
   The first time your riders come back having laid eyes on somebody, you get
   the scene rather than a line in the log: where they are, what they are, why
   they are still here after three hundred years, and what you propose to do
   about it before either of you has committed to anything.

   Every answer moves how that people regard you, and regard is not decoration
   — it is read by the panel, it decides what they will sell you, and at the
   bottom of the scale it decides whether they come for you.

   An encounter is data. Add a `who` and the scene writes itself; the only
   thing the code needs from it is the list of options and what each one does.
   ------------------------------------------------------------------------ */

/* How a people regard you, 0 to 100, said in a word. Fifty is the shrug you
   start from: they know you exist and have no opinion worth having. */
export const REGARD_WORDS = [
  { at: 84, word: "sworn to you", tone: "good" },
  { at: 68, word: "warm", tone: "good" },
  { at: 52, word: "civil", tone: "mid" },
  { at: 38, word: "wary", tone: "mid" },
  { at: 22, word: "cold", tone: "warn" },
  { at: 10, word: "hostile", tone: "bad" },
  { at: 0, word: "murderous", tone: "bad" },
];
export const REGARD_START = 50;
export const regardBand = (n) =>
  REGARD_WORDS.find((w) => (n ?? REGARD_START) >= w.at) || REGARD_WORDS[REGARD_WORDS.length - 1];

/* What a standing arrangement is worth each season, and what it costs. These
   are read straight into the ledger, so a pact shows up in the header the
   season after it is struck and disappears the season a war starts. */
export const PACTS = {
  quarryTrade: {
    name: "The Red-Ruth carts",
    note: "Cut stone and nitre come east on their carts. Their shifts eat on the way.",
    give: { scrap: 4, powder: 1 },
    take: { food: 2 },
  },
  bridgeToll: {
    name: "The Dover toll",
    note: "The gate stands open to your banner and your carts come back loaded. They weigh every one on the way out and take their cut of it, season after season, for as long as you keep crossing.",
    give: { food: 5, metal: 1 },
    take: { scrap: 4 },
    // What the toll is actually for: their ground is open to your warbands.
    pass: true,
  },
  holkGrain: {
    name: "The Holk grain",
    note: "Silt wheat off the flats, threshed on the decks and carted to Lunden. They want iron for it, and they always will.",
    give: { food: 6 },
    take: { scrap: 3 },
  },
  skinlessCut: {
    name: "The Wight cut",
    note: "A share of what comes off the silt. You do not ask where it came from, and everyone who has lost a cart on the mud knows exactly where it went.",
    give: { scrap: 4 },
    take: { food: 2 },
  },
};

export const FIRST_MEET = {
  quarrymen: {
    who: "quarrymen",
    kicker: "A meeting on the road",
    title: "The Quarrymen of Red-Ruth",
    where: "Red-Ruth, on the western moor",
    /* What your riders actually saw. Present tense, no summary. */
    scene: [
      "Your outriders come back off the moor with the horses lathered and a story they tell twice, because nobody believes it the first time. There is smoke on the western skyline, and it is not a burn-off. It is chimneys.",
      "Red-Ruth is a hole in the world, eight hundred feet down and a mile across, cut in steps all the way round. There are men working on every one of them. Pumps turn. A smelter is lit. Somebody has been keeping the lights on down there for three hundred years and has never once thought to send word about it to anyone.",
    ],
    /* Why they are the way they are. */
    lore: [
      "When the sea went out, the china clay pits and the deep tin workings did not flood and did not stop. The shifts that worked them simply stayed, because a pump you let stand is a shaft you lose, and a shaft you lose you do not get back. Three hundred years later they are still cutting, still pumping, and still ahead of the water.",
      "They have no interest in the coast, in Lunden, or in you. What they have is the only standing industry left on the island: cut stone, wrought iron, and powder-grade nitre by the cartload. Every approach to the rim is ranged, and the man who set the ranges is still alive.",
    ],
    /* The one who came to the rim to look at you. */
    voice: {
      name: "Gorran Black",
      title: "Pit-King of Red-Ruth",
      said: "\"We have been here longer than your family has had a name. We are not for taking. Say what you came to say and let us get back to it.\"",
    },
    options: [
      {
        id: "openhand",
        label: "Send a man down with an open hand",
        note: "No demand, no terms. Just a name and where to find you.",
        regard: 14,
        res: { scrap: 25 },
        outcome:
          "Your man is down there a full day and comes back up with a cart behind him — offcut stone and a barrel of nitre, which is the closest thing to a welcome the pit has. Gorran Black sends no message. That he sent the cart is the message.",
      },
      {
        id: "trade",
        label: "Ask the Pit-King what the workings will sell",
        note: "60 scrap now to open the road and stand the first shift.",
        need: { scrap: 60 },
        res: { scrap: -60 },
        regard: 8,
        pact: "quarryTrade",
        outcome:
          "They will not swear to you and they will not take your colours, but they will take your scrap, and carts start east before the season turns. The road costs you what a road costs. What comes down it is worth more.",
      },
      {
        id: "tithe",
        label: "Range your guns on the cut face and name a tithe",
        note: "Take what is on the rim now. They will remember it.",
        regard: -26,
        res: { scrap: 40, powder: 8 },
        harden: 20,
        addGarrison: "pikemen",
        outcome:
          "You get the tithe. You get it once. By the time your column is off the moor the rim has been cut back, the powder moved, and a shift that was working the face is standing on it with pikes. Whatever Red-Ruth is going to cost to take, it costs more now.",
      },
      {
        id: "mark",
        label: "Mark it on the map and say nothing",
        note: "Nothing is owed, nothing is spent, nothing is decided.",
        regard: 0,
        outcome:
          "Your riders draw the rim, the roads onto the moor, and where the guns are ranged from. Nobody down there gives any sign of having noticed you at all, which is either good manners or contempt, and there is no way to tell which from up here.",
      },
    ],
  },

  bridgers: {
    who: "bridgers",
    kicker: "A light on the water that is not water",
    title: "The Bridgers of Bridgerton",
    where: "Bridgerton, at the Dover end of the crossing",
    scene: [
      "Your riders come to the end of Albion where the land drops away onto the mud, and stop, because the road does not. It goes on: out over the flats on sixteen piers of ship plate and scaffolding, lit the whole way, with lamps at every stanchion and smoke going up off a hundred cooking fires strung along the deck.",
      "There is a market on it. There are children on it. Halfway out a crane is still lifting, and at the near end there is a gate of welded plate with a sign on it, hand-painted and recently: DOCKS · CUSTOMS · TOLL.",
    ],
    lore: [
      "The bridge was a third built when the water went out from under it, and the people who had been building it did the only thing that made any sense: they finished it. Not to a drawing — to whatever came to hand, one span a decade, out of hulls and gantry steel and the cranes that were already standing there.",
      "It is now the only dry-shod road from Albion to the continent, and they own every yard of it. They do not raid, they do not expand, and they have never once left the deck. They fortify. Every season the gate is a little heavier than it was, and there is no cart on this coast whose owner has not paid them at least once.",
    ],
    voice: {
      name: "The Gatemaster",
      title: "Bridgerton customs, sixth of that title",
      said: "\"Everyone crosses. That is the whole of it. What everyone does not do is cross free — not you, not the Lyon, not the man who built the first pier. Read the board, pay the board, and go on over.\"",
    },
    options: [
      {
        id: "toll",
        label: "Pay the board like anybody else",
        note: "30 scrap once, to write your banner into the ledger. After that the toll runs every season you keep the road — and your warbands cross the bridge instead of the mud.",
        need: { scrap: 30 },
        res: { scrap: -30 },
        regard: 12,
        pact: "bridgeToll",
        outcome:
          "The Gatemaster writes your banner into a ledger a hand thick, turns it round so you can see it written, and has the gate opened without another word. Carts go over that same week and come back with the continent in them — and your companies go over with them, which is worth more than the carts are.",
      },
      {
        id: "guard",
        label: "Ask what the gate pays for a road guard",
        note: "Men of yours, standing their watch. They are always short.",
        regard: 20,
        res: { scrap: 35 },
        outcome:
          "It turns out they are short of exactly one thing, and it is not iron. Two of your companies stand the night watch on the seaward piers for a season and come back paid in scrap and very well fed. The Gatemaster now knows your captains by name, which on that bridge is a kind of currency.",
      },
      {
        id: "claim",
        label: "Tell him Albion's tolls are Albion's to set",
        note: "The bridge starts on your side of the mud. Say so.",
        regard: -28,
        harden: 25,
        addGarrison: "ironclad",
        outcome:
          "He hears you out, which is worse than being interrupted. Then he says that the bridge starts where the bridge starts, and closes the gate. By the next season the near arch has a second wall across it and men in plate standing on that, and the board has your banner on it under a heading you would rather not read aloud.",
      },
      {
        id: "count",
        label: "Count the piers and the guns and go home",
        note: "Nothing said, nothing owed.",
        regard: 0,
        outcome:
          "Sixteen piers, four gun positions that you can see and at least two you cannot, and a deck wide enough for three carts abreast. Your riders draw all of it. Nobody on the bridge does anything to stop them, which tells you something on its own.",
      },
    ],
  },

  holk: {
    who: "holk",
    kicker: "A town that was a fleet",
    title: "The Silt Farmers of Holk",
    where: "Holk, out on the Dogger flats",
    scene: [
      "Four hexes north-east of the seat, where the flats run out flat to the horizon, there is a shape on the mud that your riders take for a hill until they are close enough to see the rigging.",
      "It is ships. A hundred of them, dragged into a ring bow-to-stern, hulls turned into halls and masts cut down into a stockade, with the whole of it sitting in a mile-wide apron of ploughed silt. There are people out in the furrows to the knee, and they wave.",
    ],
    lore: [
      "When the water went it took a season, not a day, and the trawler fleet that was working the Dogger simply settled where it floated. The crews did not walk. They put lines on the hulls, dragged them into a ring with what was left of the winches, and started turning over the seabed — which turns out, after three hundred years of everything dying into it, to be the best soil on the island.",
      "They are farmers now with a ship's discipline: watches, rations, a reeve elected off the deck every spring. They are friendly to everybody, on principle and on arithmetic, because a town with no walls that grows more food than it can eat has to be. And they are spreading — every year another few furlongs of the flats goes under the plough.",
    ],
    voice: {
      name: "Reeve Marsh Colley",
      title: "elected off the deck of the Holkfast",
      said: "\"You are the third lot this year and the first with manners. We grow more than we eat and we have not got a smith worth the name. You can see where this is going, and so can I. Sit down.\"",
    },
    options: [
      {
        id: "grain",
        label: "Buy their grain and keep buying it",
        note: "40 scrap to fit out their threshing floor. Carts every season after.",
        need: { scrap: 40 },
        res: { scrap: -40 },
        regard: 16,
        pact: "holkGrain",
        outcome:
          "Their threshing floor is the afterdeck of a stern trawler and it has been turned by hand since before anyone alive was born. Fitted with your iron it does in a morning what took them a week. The first grain carts reach the seat before the season is out.",
      },
      {
        id: "gift",
        label: "Send them iron and ask for nothing",
        note: "25 scrap, no terms, no ledger.",
        res: { scrap: -25 },
        regard: 26,
        outcome:
          "Colley looks at the cart, then at your man, then asks him three times what the catch is. There is no catch. A town of farmers with no walls does not forget the first neighbour who turned up with iron and no conditions, and they will not forget you.",
      },
      {
        id: "take",
        label: "Take the granary while it is only farmers holding it",
        note: "They have no walls and one watch. It would take a season.",
        regard: -40,
        res: { food: 60, men: 40 },
        harden: 15,
        addGarrison: "spearmen",
        outcome:
          "It is as easy as it looked and it costs more than it paid. You come away with their stores and forty of their young men, and leave behind a ring of hulls with the gaps filled in, a watch on every masthead, and a reeve who has stopped believing in neighbours. Word goes up and down the flats within the season.",
      },
      {
        id: "later",
        label: "Say you will be back when you have iron to spare",
        note: "Nothing promised, nothing spent.",
        regard: 0,
        outcome:
          "Colley says that is what the last two said, and goes back to the furrow. Your riders are given bread on the way out anyway, which tells you what kind of town it is.",
      },
    ],
  },

  skinless: {
    who: "skinless",
    kicker: "They find you first",
    title: "The Skinless of Wight Mountain",
    where: "Wight Mountain, standing out of the drained Channel",
    scene: [
      "Your column is two days out onto the silt when it comes on the poles. Nine of them, driven into the mud in a line across the only firm ground for a mile, and on each one something that the crows have mostly finished with. None of it is wearing anything. That is the point of the poles.",
      "Behind them, a long way off and a long way up, is the mountain. It was an island once. Now it stands out of the dry Channel like a tooth, green on its shoulders and black at the top, and there are fires on it, and men on it, and they have been watching you since before you saw the poles.",
    ],
    lore: [
      "The Isle of Wight did not drown when the water came, and it did not drain when the water went — it simply stood up out of the mud, eight hundred feet of it, with the whole of the old Channel laid out flat and open all around. It is the best ground on this coast for seeing somebody coming, and the worst for being one of the people coming.",
      "They do not farm, they do not build and they do not trade. They live on what crosses the silt. And nothing crosses the silt, because everything crosses the bridge instead — which is exactly how Bridgerton likes it, and exactly why the Skinless have never once touched the piers. The arrangement is old, it is never spoken about, and both halves of it are making money.",
    ],
    voice: {
      name: "Cull",
      title: "speaks for Wight Mountain, does not dismount",
      said: "\"Nine on the poles and room on the mud for nine hundred. You are on our floor. You can be on it paying, or you can be on it for a while and then not be on it at all. Either is fine with us.\"",
    },
    options: [
      {
        id: "pay",
        label: "Pay, and keep paying",
        note: "45 scrap now. Your columns cross the silt unmolested.",
        need: { scrap: 45 },
        res: { scrap: -45 },
        regard: 20,
        outcome:
          "Cull counts it on the pommel without dismounting, turns, and is a hundred yards off before anyone thinks to answer. The poles are gone from that stretch of silt by the next season. New ones go up a day's ride west, which is presumably somebody else's problem now.",
      },
      {
        id: "cut",
        label: "Offer them a share of what they take",
        note: "Fence it through Lunden. It pays, and everybody will know.",
        regard: 14,
        pact: "skinlessCut",
        also: { holk: -12, bridgers: -8 },
        outcome:
          "Carts start arriving at the seat with no papers and other people's marks burned off the axles. It pays very well. Colley at Holk stops sending bread with your riders, and the Gatemaster starts weighing your carts twice.",
      },
      {
        id: "threat",
        label: "Tell them the next thing on a pole will be one of theirs",
        note: "They will take that as an offer, and they will accept it.",
        regard: -30,
        harden: 20,
        addGarrison: "axemen",
        anger: 1,
        outcome:
          "Cull laughs — actually laughs, the first sound any of them has made — and rides off without another word. Within the season the mountain has a second ring of stakes on its shoulder and there are more bands out on the silt than there were, and they are not going west.",
      },
      {
        id: "leave",
        label: "Get your column off the silt and say nothing",
        note: "Nothing owed. Nothing settled either.",
        regard: 0,
        outcome:
          "You come off the mud onto hard ground at dusk with everyone you started with, which your captains are honest enough to call the good outcome. Nobody follows. Nobody needs to — they know where you live now, and they did not before.",
      },
    ],
  },
};

export const encounterFor = (id) => FIRST_MEET[id] || null;

/* A standing arrangement said the way a ledger would say it: what comes in and
   what goes out, every season, with the word "season" in it — a toll that only
   ever showed its joining fee read as a one-off, which is not what it is. */
const RES_WORD = { food: "rations", scrap: "scrap", metal: "metal", fuel: "fuel", powder: "powder", men: "recruits" };
export function pactTerms(id) {
  const p = PACTS[id];
  if (!p) return null;
  const list = (o, sign) => Object.entries(o || {}).map(([k, v]) => `${sign}${v} ${RES_WORD[k] || k}`);
  const gives = list(p.give, "+"), takes = list(p.take, "\u2212");
  return {
    name: p.name,
    gives: gives.join(", "),
    takes: takes.join(", "),
    line: [gives.join(", "), takes.join(", ")].filter(Boolean).join(" against ") + " a season",
    pass: !!p.pass,
  };
}
