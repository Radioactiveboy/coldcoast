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
  /* Fifty has to fall inside "civil", because fifty is where everybody starts
     and a shrug should not read as suspicion. It was 52, so every realm you
     had never done anything to regarded you as wary. */
  { at: 50, word: "civil", tone: "mid" },
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
  runeTithe: {
    name: "The Rune tithe",
    note: "Grain and iron to the bells every season. In exchange the preaching companies go the long way round your ground, and they have never once failed to.",
    give: {},
    take: { scrap: 5, food: 3 },
    // Their bands take your ground off the list.
    spare: true,
  },
  runeCreed: {
    name: "The creed of the bells",
    note: "You take their word as the word. Converts muster at your seat by the hundred and their powder comes with them — and every other people on this coast now knows exactly what you knelt to.",
    give: { men: 5, powder: 2 },
    take: { food: 4 },
    spare: true,
  },
  bretonHedge: {
    name: "The hedge road",
    note: "Gates in the thorn, opened to your banner, and a share of what the fields give. They ask for iron and for the gates to be shut behind you.",
    give: { food: 4 },
    take: { scrap: 2 },
    pass: true,
  },
};

export const FIRST_MEET = {

  /* ------------------------- THE SIX GREAT REALMS -------------------------
     The peoples on the road got a scene from the start and the realms did not,
     which meant the most consequential thing on the map — another power with a
     warlord, a levy and an opinion — arrived as a line in the log while a
     charcoal burner got a painting. These are the same shape as a holdout's
     scene and answer differently: a realm has no toll to sell you, so what an
     option buys is a standing with them, a signed truce, or a war on the spot.
     ---------------------------------------------------------------------- */
  lyon: {
    who: "lyon",
    kicker: "A rider on a graded road",
    title: "The Concordat of Lyon",
    where: "the Rhone corridor, where the roads still run",
    scene: [
      "Your outriders do not find Lyon. Lyon finds them, on a road that is cambered, ditched and swept, by a man with a satchel who has been waiting at that milestone since the spring on the assumption that somebody would eventually come up it.",
      "He asks their names. He asks how many they are, who feeds them, and under whose word they ride. He writes the answers down in a hand you could read across a room, gives them a copper tag each with a number stamped on it, and tells them the Concordat will send somebody to your seat before the year is out. Then he goes back to waiting.",
    ],
    lore: [
      "Everything else on this coast lost its paperwork. Lyon did not. There are census rolls in the Rhone valley that run unbroken from before the water went out, and a levy that can be called by name, parish by parish, in a fortnight.",
      "That is the whole of their power and they know it. A Lyonnais company is not better than yours. There are simply always more of them, they are always where the roll said they would be, and they arrive fed.",
    ],
    voice: {
      name: "Prefect Ansel Vaury",
      title: "of the Roads and the Roll",
      said: "\"You are not on any list I hold, which is an untidy state of affairs for both of us. I would rather write you down as a signatory than as a frontier. Either can be arranged. One of them takes longer to undo.\"",
    },
    options: [
      {
        id: "sign",
        label: "Put your name on their roll",
        note: "A signed truce with a term on it, and the road open while it runs.",
        regard: 18,
        accord: "truce",
        outcome:
          "Vaury produces the document from the satchel already drafted, which suggests he had a fair idea how this would go. It is signed in three places, copied twice, and one copy rides south the same afternoon. You are a line in a ledger in Lyon now, which is a great deal safer than not being one.",
      },
      {
        id: "gift",
        label: "Send the Prefect back with something for the archive",
        note: "Scrap, and a written account of your own ground. They value the second more.",
        need: { scrap: 30 },
        res: { scrap: -30 },
        regard: 24,
        outcome:
          "The scrap is received politely. The account of your holdings — hexes, hands, what grows where — is received the way another people would receive a chest of silver. It goes into the archive at Lyon under your name, and so, from that day, does everything else they learn about you.",
      },
      {
        id: "refuse",
        label: "Tell him you are not to be counted",
        note: "Send the tags back. They will make their own estimate.",
        regard: -14,
        outcome:
          "He takes it without any visible feeling, notes something, and leaves. The estimate the Concordat makes of you in his absence is not a kind one, and you have no way of correcting it, because the only man who was going to ask you has gone home.",
      },
      {
        id: "seize",
        label: "Take the satchel",
        note: "Roads, depots, muster points, numbers. Worth having. They will want it back.",
        regard: -40,
        res: { scrap: 45 },
        war: true,
        anger: 2,
        outcome:
          "The satchel is worth every bit of what you thought it was: grades, fords, depot sites and the standing strength of four parishes. It also had a number stamped in the cover, and the Concordat keeps a list of which numbers are out. By the time your riders are home, the roll has been called.",
      },
    ],
  },
  alpine: {
    who: "alpine",
    kicker: "A door in the mountain",
    title: "The Alpine Compact",
    where: "under the Alpine Wall, where the doors are",
    scene: [
      "There is a valley with nothing in it: no fields, no smoke, no stock. At the head of it is a concrete face with a door in it the size of a barn, and the door is clean. Everything else in the world is three hundred years dirty. That door has been washed.",
      "It opens far enough for one person, and a woman in a grey coat comes out to a line painted on the ground and stops at it. She does not invite anybody in. She asks, in a flat and careful voice, whether you have any documents.",
    ],
    lore: [
      "What went under the Alps before the water came was not food and not gold. It was the manuals — tolerances, alloys, the powder tables, the machines that make machines — and the people who could read them, sealed in with enough rock over their heads to matter.",
      "They came out eventually, and they came out able to make a rifle that works. They have never once been interested in holding ground. They are interested in what is written down, where it is, and whether the people who have it know what they have.",
    ],
    voice: {
      name: "Archivist Halde",
      title: "second of the reading rooms",
      said: "\"We are not merchants and we are not a threat to you. We hold a library. You may find that a smaller thing than an army. In eighty years you will not.\"",
    },
    options: [
      {
        id: "trade",
        label: "Offer them everything your scholars have written",
        note: "Your own notes, copied out. They pay in kind, and in goodwill.",
        need: { scrap: 25 },
        res: { scrap: -25, metal: 12, powder: 6 },
        regard: 26,
        outcome:
          "Halde reads the whole of it standing at the line, which takes until dark. Two of the pages are things the Compact did not have. She says so plainly, which your man understands is the highest thing she has ever said to anyone, and sends out a crate: good steel, dry powder, and a sealed tube nobody will open until it is back at the seat.",
      },
      {
        id: "truce",
        label: "Propose that neither of you ever come up this valley in arms",
        note: "A term on it, written down, because that is the only kind they keep.",
        regard: 14,
        accord: "truce",
        outcome:
          "It is drafted at the line, on a board she carries out for the purpose, in a hand so small your man has to be told what it says. Both copies are dated. The Compact has never broken a dated thing and says so as a matter of record rather than as a boast.",
      },
      {
        id: "look",
        label: "Say nothing and look at the door",
        note: "How thick, how hung, how it is powered. She will notice you looking.",
        regard: -6,
        outcome:
          "It is forty centimetres of steel on a screw drive and it is powered, which answers a question nobody had thought to ask. Halde watches your man measuring it with his eyes for a full minute, says \"yes\", and goes back inside. The door shuts on the screw drive, which is a slow and very final noise.",
      },
      {
        id: "storm",
        label: "Tell her the library has a new owner",
        note: "There is one door and you are standing at it.",
        regard: -38,
        war: true,
        outcome:
          "She does not argue and she does not hurry. She steps back over the line, the door begins to close, and somewhere above the valley something that has been silent for three hundred years starts turning. Your riders are off the scree before the first shot and it still takes two of them.",
      },
    ],
  },
  karst: {
    who: "karst",
    kicker: "A caravan that wanted paying",
    title: "The Karst League",
    where: "the drained Adriatic, and the free cities along it",
    scene: [
      "The first thing of Karst's that anyone meets is a caravan: sixty carts, outriders in four different liveries, and a factor riding in the middle of it under an awning, doing accounts. It is crossing ground nobody holds as if the ground had been bought.",
      "The factor is delighted to see you. He is delighted in a way that does not stop being unsettling. He would like to know what you have, what you want, what you are short of this winter, and whether you have considered that the League has been financing wars on this coast since before your grandfather was weaned.",
    ],
    lore: [
      "Karst is not one thing. It is eleven free cities strung along the dry Adriatic that agree about tolls and about almost nothing else, and it has grown rich for three centuries on the simple observation that somebody has to sell both sides their powder.",
      "They will fight, and they are good at it, because a League company is paid, fed and replaced on a schedule. But they would much rather you fought somebody else, on credit, with their carts behind you.",
    ],
    voice: {
      name: "Factor Ludo Mesic",
      title: "of the Eleven, on the road",
      said: "\"Everybody I meet begins by telling me they are not for sale. I am never buying. I am extending terms. It is a completely different thing and it is how I have four cities' worth of debtors calling me a friend.\"",
    },
    options: [
      {
        id: "buy",
        label: "Buy off the cart while it is in front of you",
        note: "Metal, powder and rations at a road price, which is a bad price.",
        need: { scrap: 70 },
        res: { scrap: -70, metal: 14, powder: 8, food: 40 },
        regard: 20,
        outcome:
          "Mesic sells you the awning's worth on the spot, at terms he describes as generous and everyone present understands are not. What you actually buy is his interest: the League now has a figure for what you are worth, and the figure is high enough to be worth coming back to.",
      },
      {
        id: "terms",
        label: "Take his terms and sign the truce he has in his bag",
        note: "He has one drafted. He has one drafted for everybody.",
        regard: 12,
        accord: "truce",
        outcome:
          "He does have one drafted. He also has one drafted naming you as the party to be fought, and he shows you both, because the League's whole method is to make it perfectly clear which of the two is cheaper. You take the cheaper one.",
      },
      {
        id: "pass",
        label: "Let the caravan through and take nothing",
        note: "No toll, no purchase, no questions. Word of it travels with the carts.",
        regard: 16,
        outcome:
          "Sixty carts go over your ground without paying anybody, which has not happened to Mesic in his professional life and visibly unsettles him more than a demand would have. The story reaches four cities before the carts do. It is not gratitude exactly. It is a note in a ledger, and in Karst that is better.",
      },
      {
        id: "rob",
        label: "Take the carts",
        note: "Sixty of them, loaded, and the outriders are hirelings.",
        regard: -42,
        res: { scrap: 120, metal: 20, food: 60 },
        war: true,
        anger: 2,
        outcome:
          "The hirelings do the arithmetic and ride off, which is the most Karst thing about the whole affair. Mesic walks. The carts are worth every bit of what they looked like — and the League has never in three hundred years failed to collect on a loss, because a League that failed once would be a League nobody paid.",
      },
    ],
  },
  boreal: {
    who: "boreal",
    kicker: "Tracks in from the ice",
    title: "The Boreal Clans",
    where: "the glacier's edge, and everything south of it",
    scene: [
      "There are sled tracks across ground that has not had snow on it in four months, which means somebody dragged the sleds the whole way for want of any intention of stopping. They come from the north. They do not go back.",
      "You find the clans at the end of them, camped on a ridge with the fires banked, everything packed, and a hundred and forty people watching your riders come up the slope without one of them standing to greet it. A woman with a white braid eventually gets up, looks past your man at the country behind him, and asks him what it grows.",
    ],
    lore: [
      "When the cold came down they did not build against it, which is why they are still here. They moved. Three hundred years of moving has left them with no walls, no stores, no seat, and no reason at all to fear a winter that has already been worse.",
      "The south is not a rival to them. It is a larder with the door propped open, and they have been working their way down it a valley at a time for longer than anyone south of the Keel has been counting.",
    ],
    voice: {
      name: "Sigrun Ninefires",
      title: "who speaks for the sleds",
      said: "\"You have good ground. I am not going to pretend I have not noticed. What I will do is tell you plainly that we go where the winter pushes us, and the only question in front of you is whether, when it pushes, you are a friend or a valley.\"",
    },
    options: [
      {
        id: "feed",
        label: "Send the winter's rations up the slope",
        note: "It is a great deal of food and it buys exactly one winter. They will say so.",
        need: { food: 60 },
        res: { food: -60 },
        regard: 30,
        outcome:
          "Sigrun has the carts unloaded before she thanks anybody, and thanks them properly afterwards, which your man reports in that order because that is the order it happened. She tells him the debt is for one winter and no more. She also tells him the clans have never once forgotten a winter somebody fed them, and both of those are true at the same time.",
      },
      {
        id: "point",
        label: "Tell her where the fat valleys are, and they are not yours",
        note: "Somebody else's granary, described in detail. Somebody else finds out.",
        regard: 22,
        also: { lyon: -12, karst: -12 },
        outcome:
          "She listens to the description of the Rhone corn and the Karst road-towns with the flat attention of someone checking it against what she already knows. The sleds go south-east in the spring rather than south-west. Two courts work out roughly whose idea that was, and neither of them is wrong.",
      },
      {
        id: "truce",
        label: "Ask for a season's word and give one back",
        note: "Not a friendship. A term, with a date on the end of it.",
        regard: 10,
        accord: "truce",
        outcome:
          "There is nothing to sign, so it is said out loud in front of the fires with everyone listening, which Sigrun explains is harder to get out of than paper. The date is fixed by the moon rather than the calendar and her people are very clear about which moon.",
      },
      {
        id: "warn",
        label: "Tell her the ridge is as far south as she comes",
        note: "Say it in front of the fires. Everybody hears it.",
        regard: -32,
        anger: 1,
        outcome:
          "Nobody argues. Nobody stands up. Sigrun looks at your man for slightly too long and says she will remember where the line was, in a tone that makes clear she means the place rather than the principle. The camp is gone in the morning and the tracks go south.",
      },
    ],
  },
  horde: {
    who: "horde",
    kicker: "Dust on the salt",
    title: "The Dry Sea Horde",
    where: "the salt basin where the Black Sea was",
    scene: [
      "A column of dust that turns out to be eighty riders, moving at a walk across a floor of cracked salt, each with two spare horses on a line. They have been aware of your outriders for a day and a half and have not altered course by a degree.",
      "They stop at a well that was a harbour mouth, water the horses, water your riders' horses without being asked, and only then ask who your men are. The whole of it is done in an order somebody decided a long time ago and nobody has seen a reason to change.",
    ],
    lore: [
      "When the Black Sea went down it left a basin of salt four hundred miles across with fresh water under it in the old river mouths. The people who worked that out first own it, and they own it by being the only ones who can cross it.",
      "They do not hold ground in any way a Lyonnais clerk would recognise. They hold wells. Everything between the wells is theirs by default because nobody else can be out there long enough to argue.",
    ],
    voice: {
      name: "Temur of the Second Well",
      title: "who carries the water-word",
      said: "\"We watered your animals before we asked your names. That is not kindness, it is law, and it runs one day. After the day you are whatever you have shown us you are. Most people show us inside the day.\"",
    },
    options: [
      {
        id: "guest",
        label: "Keep the guest-law to the letter and water theirs in turn",
        note: "Your riders know how it is done. Doing it properly is the whole of it.",
        regard: 26,
        outcome:
          "Your man does it right: their horses first, the deep bucket, nothing said while the animals drink. Temur watches every step of it and at the end of it uses your warlord's name for the first time. Eighty riders who did not know you existed at dawn know your banner by dusk, and the Horde is one long conversation.",
      },
      {
        id: "horses",
        label: "Give them horses, which is the only gift that means anything",
        note: "Good stock out of your own lines. It costs you a company's worth of mounts.",
        need: { men: 40, food: 30 },
        res: { men: -40, food: -30 },
        regard: 34,
        outcome:
          "They go through the animals one at a time, in silence, for an hour. Two are sent back with no explanation and the rest are accepted, and Temur ties his own rein-charm into the mane of the best of them before he leads it away. Your riders are told, at some length, that this was noticed.",
      },
      {
        id: "truce",
        label: "Ask for the water-word on both your ranges",
        note: "Their wells, your wards, and nobody's columns on the other's ground.",
        regard: 12,
        accord: "truce",
        outcome:
          "It is agreed in about four sentences, which after Lyon is disorienting. The Horde's view is that an agreement that takes longer than that is an agreement one party is planning to get out of, and they may be right about that.",
      },
      {
        id: "well",
        label: "Put men on the well and tell them it is yours now",
        note: "It is the only water for two days in any direction.",
        regard: -46,
        war: true,
        anger: 2,
        outcome:
          "They mount up and go without a word said, which your man mistakes for a result. A well taken from the Horde is not a well. It is a place they will come back to with everyone they have ever watered, for as long as it takes, and they have nothing else to do.",
      },
    ],
  },
  solar: {
    who: "solar",
    kicker: "A light on the southern horizon",
    title: "The Solar Throne",
    where: "Iberia, under the mirror fields",
    scene: [
      "For three nights your southern pickets report a light on the horizon that is not a fire, does not move, and goes out at a fixed hour. On the fourth day a party comes north out of it: twelve people in white, walking, with a cart of instruments and no visible guard at all.",
      "They set up on your ground without asking. They take the angle of the sun, the length of a shadow, and the temperature of a bucket of water at three separate hours, and they write all of it down. Only then does one of them turn round and greet your riders as though they had just that moment arrived.",
    ],
    lore: [
      "Iberia is under glass. Square miles of steered mirrors on the meseta throwing sunlight into towers that have not gone out since they were lit, and a court that keeps its calendar, its rank and its scripture off the movement of that light.",
      "They burn nothing. They have more power at their disposal than everyone else on this coast put together and almost no interest in using it on anybody, which everyone else finds far more alarming than an army.",
    ],
    voice: {
      name: "Reader of Hours Calisto Vela",
      title: "of the Fourth Tower",
      said: "\"Your latitude is poor and your sky is worse, and I mean neither as an insult — it is simply what the instruments say. You cannot do here what we do there. What you can do is be south-facing about it, and there is more in that than you think.\"",
    },
    options: [
      {
        id: "measured",
        label: "Let them measure everything they want",
        note: "Your sky, your water, your ground. Nothing they take is worth anything to you.",
        regard: 28,
        res: { fuel: 25 },
        outcome:
          "They stay eleven days, measure things nobody has thought about since the Collapse, and leave behind a bound sheaf of figures and a crate of burning-oil as what Vela calls the customary courtesy. The figures turn out, two winters later, to say exactly where your fields will fail.",
      },
      {
        id: "trade",
        label: "Ask what the towers will sell",
        note: "Not mirrors. They do not sell mirrors. But they sell what mirrors make.",
        need: { scrap: 60 },
        res: { scrap: -60, fuel: 40, metal: 10 },
        regard: 14,
        outcome:
          "Not mirrors, no. What comes north is refined oil, drawn metal and a bag of glass beads that are apparently a unit of account in the south, and Vela is faintly amused at having to explain that last part twice.",
      },
      {
        id: "truce",
        label: "Fix a term with them while the instruments are out",
        note: "They like a thing with a date on it. The date is the point.",
        regard: 12,
        accord: "truce",
        outcome:
          "Vela sets the term by the sun rather than the season, which means it expires at an hour rather than in a spring, and has the hour written down in three places. Nobody in your hall entirely understands the notation. Everybody understands that it will be kept exactly.",
      },
      {
        id: "smash",
        label: "Break the instruments and send them home",
        note: "Twelve people in white and no guard at all.",
        regard: -44,
        res: { metal: 18 },
        anger: 1,
        outcome:
          "It takes four minutes. Vela does not raise her voice once, asks only that the sheaf of readings be returned, is refused, and walks south with eleven others and nothing. The Throne does not declare anything. Eleven seasons later a court that measures time in sunlight is still quite clear about which season this was.",
      },
    ],
  },
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

  domesayers: {
    who: "domesayers",
    kicker: "Bells, from a long way off",
    title: "The Domesayers of Rune",
    where: "Rune, the old city on the river",
    scene: [
      "Your riders hear it before they see anything: a bell, then eleven of them, ringing an hour that does not exist on any clock anyone has kept for three hundred years. It goes on for a quarter of an hour. Then it stops, and the quiet afterwards is worse.",
      "Rune is a city with the roof off. The cathedral tower is a stump and the bells are hung in the stump on new timber, and everything for a mile around it has been pulled down to sightlines and burned flat. There are people on every approach and every one of them is facing outward.",
    ],
    lore: [
      "They hold that the water did not simply leave. They hold that it was taken back, that a thing taken back is a judgement, and that a judgement half-finished is the worst condition a world can be left in. Three hundred years of thinking about that has not made them calmer.",
      "So they finish it. Preaching companies go out of Rune every spring to burn whatever they have decided is unclean, and the ground behind them belongs to the bells afterwards. The Bretons on the peninsula have buried a great many of their own people over this, and are going to bury more.",
    ],
    voice: {
      name: "The Reader",
      title: "speaks the hours at Rune",
      said: "\"You have come a long way to stand in front of us with nothing in your hands. That is not a criticism. Everyone arrives empty. The question is only what you are carrying when you leave, and which way you are facing.\"",
    },
    options: [
      {
        id: "tithe",
        label: "Pay the tithe and be passed over",
        note: "Grain and iron to the bells, every season, and their companies take the long way round your ground.",
        regard: 16,
        pact: "runeTithe",
        outcome:
          "The Reader writes nothing down, which your man finds more alarming than a ledger would have been. But the next spring the smoke is a long way south of anything of yours, and the spring after that, and the one after that.",
      },
      {
        id: "creed",
        label: "Take the creed and turn them outward",
        note: "Their word as your word. Converts and powder muster at your seat — and everyone finds out what you knelt to.",
        regard: 30,
        pact: "runeCreed",
        also: { bretons: -22, holk: -10, bridgers: -8 },
        outcome:
          "They come up the road to Lunden in their hundreds with their own powder on their backs and a hymn nobody there has ever heard, and they are worth every recruit of it. Colley at Holk sends no more bread. The hedge in Brittany gets another foot of thorn on it, and they are not building it against the Domesayers any more.",
      },
      {
        id: "refuse",
        label: "Tell the Reader the judgement is finished",
        note: "Say it to his face. He has heard worse, and he has an answer for worse.",
        regard: -30,
        harden: 20,
        addGarrison: "axemen",
        anger: 1,
        outcome:
          "He asks, quite mildly, who told you that. Your man does not have an answer. By the season's end there are more companies going out of Rune than went out last year, the flattened ground around the tower has been widened by half a mile, and one of the eleven bells is now rung only for you.",
      },
      {
        id: "listen",
        label: "Stand under the bells and say nothing",
        note: "An hour of it. Nothing agreed, nothing refused.",
        regard: 4,
        outcome:
          "Your riders stand in the cold and listen to the whole hour out, because leaving in the middle of it seemed unwise. Nobody stops them going. The Reader watches them onto the road and says, to nobody in particular, that they will be back.",
      },
    ],
  },

  bretons: {
    who: "bretons",
    kicker: "Eight feet of thorn, and a ditch under it",
    title: "The Bretons of Kernev",
    where: "Kernev, on the neck of the peninsula",
    scene: [
      "The road west runs out at a hedge. Not a field hedge — eight feet of blackthorn grown into a bank with a ditch cut under it on the near side, running north and south further than anyone can see in either direction, with a gate in it and four people standing on the bank above the gate.",
      "Behind it the country is fields. Not scrub that used to be fields: worked, hedged, drained fields with stock in them, going away west over the granite as far as the light holds.",
    ],
    lore: [
      "Their great-grandfathers planted the thorn to keep cattle in. Their fathers put the ditch under it when the burnings started coming west out of Rune, and their sons have been lengthening it every year since, one field at a time, because a field you cannot see over the hedge is a field you cannot hold.",
      "They want nothing that is not already behind the hedge. They have also buried a great many people who wanted something that was, and they will tell you the number if you ask, which suggests they have been asked before.",
    ],
    voice: {
      name: "Aouregan Plou",
      title: "who speaks for the gate this season",
      said: "\"You will have seen the burnt ground east of here. That is what comes at us, every spring, and we are still here. So you will understand that we are polite to strangers but we are not soft, and the gate opens outward.\"",
    },
    options: [
      {
        id: "gate",
        label: "Ask for the gates to be opened to your banner",
        note: "40 scrap towards the thorn. Your warbands cross their ground, and their fields feed you.",
        need: { scrap: 40 },
        res: { scrap: -40 },
        regard: 18,
        pact: "bretonHedge",
        outcome:
          "They take the iron and put it into the hedge before your man is off the ground, which tells you what they think about first. The gates are opened to your colours by the end of the season and the first carts of Breton butter reach the seat before the winter.",
      },
      {
        id: "warn",
        label: "Tell them what you know about Rune",
        note: "Where the companies muster, and when. It costs you nothing and they cannot buy it.",
        regard: 28,
        outcome:
          "Aouregan listens the whole way through without saying anything, asks two questions, and then sends for three other people so your man can say it again. Whatever else happens on this coast, there is now a stretch of hedge in Brittany that thinks well of you for nothing.",
      },
      {
        id: "harvest",
        label: "Name a share of the harvest and stand there",
        note: "They have no walls, only thorn. Take what is stacked.",
        regard: -34,
        res: { food: 70, men: 20 },
        harden: 18,
        addGarrison: "pikemen",
        outcome:
          "They give it up without a fight, because the alternative is losing the hedge crew in spring. Your carts go east heavy. Behind you the ditch gets deeper, the gate gets a second gate, and every Breton alive learns the shape of your banner in one afternoon.",
      },
      {
        id: "road",
        label: "Turn round at the gate",
        note: "Nothing owed. The hedge stays shut.",
        regard: 0,
        outcome:
          "Your column turns and goes back east, which the four on the bank watch all the way out of sight. Somebody up there says something in a language your riders do not have, and somebody else laughs, and the gate does not open.",
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
    // Not everything an arrangement is worth arrives as a resource. A road
    // through somebody's ground, or their bands leaving yours alone, is the
    // whole of what some of them buy.
    pass: !!p.pass,
    spare: !!p.spare,
  };
}
