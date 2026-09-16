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
};

export const encounterFor = (id) => FIRST_MEET[id] || null;
