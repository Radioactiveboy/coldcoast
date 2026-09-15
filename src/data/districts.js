/* -------------------------------- DISTRICTS --------------------------------
   A settlement is not an empty lot with room for five buildings. It is a
   place with parts, and somebody is already in most of them.

   You get one slot when you take the ground — the bit you are standing on.
   Every other slot is a district: a named quarter with people in it who were
   there before you, and three ways of dealing with them. Pay what they ask.
   Fight them for it. Or meet whatever it is they actually want, which is
   usually not money.

   Most settlements draw their districts from the archetypes below, chosen by
   what the ground is and fixed per hex so a place always has the same
   quarters. The seven seats have theirs written by hand.
   ------------------------------------------------------------------------ */

/* `on` is terrain letters the quarter suits, null for anywhere. `coast` true
   wants open water, false refuses it. `ways` are the three answers; a slot
   needs exactly one of them. */
export const DISTRICT_POOL = [
  {
    id: "trench", name: "The Trench", on: "rdpc",
    intro: "The old riverbed, cut forty feet down and running through the middle of everything. Rival crews work the silt for whatever the water left, and under the derelict bridges the tollmasters sit and count what goes past.",
    holder: "wasters", garrison: ["spearmen", "axemen"],
    ground: { left: "rough", centre: "rough", right: "rough" },
    ways: [
      { kind: "pay", res: { scrap: 55 }, label: "Pay the toll", text: "The tollmasters take it, count it twice, and wave you under the bridge. The crews go back to the silt and the quarter is yours to build in." },
      { kind: "fight", label: "Clear the bridges", text: "It is fought in the cut, over broken concrete, with nobody's flank anchored on anything." },
      { kind: "need", need: { unit: "riders" }, label: "Ride the length of it", text: "Horse down the riverbed end to end, past every bridge, at a pace nobody on foot can answer. The tollmasters are gone by the second morning." },
    ],
  },
  {
    id: "burnt", name: "The Burnt Quarter", on: null,
    intro: "Eight streets that went up in a fire nobody remembers starting and nobody put out. What is left standing is standing because it was brick. People live in it anyway.",
    holder: "wasters", garrison: ["axemen", "hunters"],
    ground: { left: "rough", centre: "open", right: "rough" },
    ways: [
      { kind: "pay", res: { food: 60 }, label: "Feed them through a winter", text: "Sixty sacks buys a winter, and a winter buys goodwill. By spring the quarter answers to your seat." },
      { kind: "fight", label: "Put them out of it", text: "House to house through burnt brick, which is the worst ground there is." },
      { kind: "need", need: { tech: "scavenging" }, label: "Work it properly", text: "Your people go in with a plan, in shifts, floor by floor. The ones living there watch for a week and then start turning up to help." },
    ],
  },
  {
    id: "docks", name: "The Drowned Docks", on: null, coast: true,
    intro: "Wharves built for a water level that has not existed for three hundred years, standing forty feet over dry mud. The dockers' families never left. They still call it the harbour.",
    holder: "wasters", garrison: ["spearmen", "hunters"],
    ground: { left: "anchored", centre: "open", right: "rough" },
    ways: [
      { kind: "pay", res: { scrap: 45 }, label: "Buy into the company", text: "They have a company, articles and everything, and they will sell a share. Expensive, legal, and over in an afternoon." },
      { kind: "fight", label: "Take the wharves", text: "Fought along the quay with the drop on one side, which decides a great deal about where anyone can go." },
      { kind: "need", need: { tech: "coastworks" }, label: "Show them the works", text: "You put weirs and a stage in below the old wharves. The dockers come down to look, and stay to work." },
    ],
  },
  {
    id: "spoil", name: "The Spoil Heap", on: "hrm",
    intro: "A shanty on a hill that is not a hill. Three centuries of tailings, grassed over, with a thousand people living in the cuttings and pulling metal out of it by hand.",
    holder: "wasters", garrison: ["axemen", "axemen"],
    ground: { left: "rough", centre: "rough", right: "open" },
    ways: [
      { kind: "pay", res: { scrap: 40 }, label: "Buy the heap", text: "They sell it gladly. It is a hill of rubbish; it is also everything they have, and they have decided they would rather have the scrap." },
      { kind: "fight", label: "Clear the cuttings", text: "Uphill, through cuttings, against people who know every one of them." },
      { kind: "need", need: { tech: "smelting" }, label: "Build them a stack", text: "A clay stack and a bellows at the foot of the heap. Within a season they are bringing you ore instead of selling it." },
    ],
  },
  {
    id: "field", name: "The Long Field", on: "pdsl",
    intro: "Good ground under the plough, worked by people who have worked it since before anyone thought to call this a settlement. They pay nobody and they have never needed to.",
    holder: "wasters", garrison: ["spearmen", "spearmen"],
    ground: { left: "open", centre: "open", right: "open" },
    ways: [
      { kind: "pay", res: { scrap: 35 }, label: "Buy the tithe", text: "They will take a payment and give you a share of the harvest, which is what a tithe is, and they are unbothered by the word." },
      { kind: "fight", label: "Take the field", text: "In the open, in daylight, with nowhere for anyone to be clever." },
      { kind: "need", need: { tech: "foraging" }, label: "Show them the rolls", text: "Somebody writes down where the good ground is and who is on it. The field-folk read it, argue for a fortnight, and sign." },
    ],
  },
  {
    id: "vaultdoor", name: "The Sealed Door", on: "rmh",
    intro: "A blast door in the side of the quarter, seated, cold, with a keypad that has been dead for three hundred years. Somebody has built a shrine in front of it and lives off what pilgrims leave.",
    holder: "changed", garrison: ["fleshhorde", "fleshhorde"],
    ground: { left: "walls", centre: "rough", right: "walls" },
    ways: [
      { kind: "pay", res: { scrap: 70 }, label: "Pay the shrine", text: "The keepers take the offering and move the shrine two streets over. They do not explain and you do not ask." },
      { kind: "fight", label: "Go in anyway", text: "Whatever the door was holding in has been out for a while, and it is between you and the quarter." },
      { kind: "need", need: { tech: "toolcraft" }, label: "Cut it", text: "Tongs, dies and a great deal of patience. The door comes out of its frame and what is behind it is a stairwell, and the shrine-keepers are suddenly very interested in you." },
    ],
  },
  {
    id: "yards", name: "The Breaking Yards", on: "rd",
    intro: "Where the machines were dragged to die. Acres of them, in rows, and a crew who have been taking them apart in order for four generations and are nearly finished.",
    holder: "wasters", garrison: ["axemen", "hunters", "spearmen"],
    ground: { left: "rough", centre: "rough", right: "rough" },
    ways: [
      { kind: "pay", res: { scrap: 60 }, label: "Buy the last rows", text: "They name a price for what is left and go somewhere else to start again. There is always another field of dead machines." },
      { kind: "fight", label: "Take the yards", text: "Fought in the rows, where you cannot see twenty feet in any direction." },
      { kind: "need", need: { seasons: 4 }, label: "Wait them out", text: "Four seasons and they finish the last row, take what they have and go. The yards are yours because nobody wanted them any more." },
    ],
  },
  {
    id: "wall", name: "The Old Wall", on: null,
    intro: "A curtain wall around a third of the place, built long before the water went, kept in repair by people who consider that their entire purpose.",
    holder: "wasters", garrison: ["spearmen", "spearmen", "hunters"],
    ground: { left: "walls", centre: "walls", right: "rough" },
    ways: [
      { kind: "pay", res: { scrap: 50, food: 30 }, label: "Take them into service", text: "Wages and rations, and the wall-keepers become your wall-keepers. They are visibly relieved that somebody finally asked." },
      { kind: "fight", label: "Go up it", text: "Up a wall that has been kept in repair for three hundred years by people whose whole purpose is keeping it." },
      { kind: "need", need: { pop: 900 }, label: "Outgrow them", text: "The place spills past the wall and round it until keeping a gate shut stops meaning anything. They open it themselves." },
    ],
  },
  {
    id: "wood", name: "The Standing Wood", on: "fht",
    intro: "Trees inside the settlement, grown up through what used to be streets, and something living in them that the people here have an arrangement with.",
    holder: "beasts", garrison: ["feralherd", "feralherd"],
    ground: { left: "rough", centre: "rough", right: "rough" },
    ways: [
      { kind: "pay", res: { food: 50 }, label: "Feed the arrangement", text: "Fifty sacks left at the treeline, as the locals do. Whatever takes them leaves the streets alone, and the quarter can be built in." },
      { kind: "fight", label: "Break the arrangement", text: "Among the trees, against animals, which is a matter of what you can shoot before it reaches you." },
      { kind: "need", need: { unit: "hunters" }, label: "Hunt it out", text: "Your hunters go in at dawn for six days running. On the seventh nothing comes to the treeline for the sacks." },
    ],
  },
  {
    id: "stair", name: "The Stair", on: "hm",
    intro: "The upper quarter, reached by one cut stair of four hundred steps, held by people who have only ever had to defend four hundred steps.",
    holder: "wasters", garrison: ["spearmen", "hunters"],
    ground: { left: "walls", centre: "rough", right: "walls" },
    ways: [
      { kind: "pay", res: { scrap: 45 }, label: "Pay for the step-right", text: "There is a word for it and a price for it and both are older than anyone alive. You pay it and walk up." },
      { kind: "fight", label: "Take the stair", text: "Four hundred steps, uphill, with everything they have coming down them." },
      { kind: "need", need: { tech: "horsemanship" }, label: "Cut the road", text: "A horse cannot climb a stair, so you have a road cut round the shoulder instead. The stair stops being the only way up and the upper quarter stops being a fortress." },
    ],
  },
  {
    id: "market", name: "The Market", on: null,
    intro: "A crossroads with a fair on it, four days out of seven, run by a guild that has been running it for longer than there has been anyone to run it for.",
    holder: "wasters", garrison: ["spearmen", "axemen"],
    ground: { left: "open", centre: "rough", right: "open" },
    ways: [
      { kind: "pay", res: { scrap: 65 }, label: "Buy the charter", text: "The guild sells you the charter, keeps the fair, and pays you a share. Everyone considers themselves to have won." },
      { kind: "fight", label: "Close the market", text: "In the square, among the stalls, with the whole quarter watching from the upper windows." },
      { kind: "need", need: { pop: 600 }, label: "Bring them custom", text: "Enough people arrive that the fair runs seven days out of seven, and the guild needs a seat behind it more than it needs its independence." },
    ],
  },
  {
    id: "wells", name: "The Wells", on: "bts",
    intro: "Nine deep wells and the families who own them. In a place this dry, owning a well is owning the place, and they know it to the inch.",
    holder: "wasters", garrison: ["spearmen", "spearmen"],
    ground: { left: "open", centre: "rough", right: "open" },
    ways: [
      { kind: "pay", res: { scrap: 55 }, label: "Buy a well", text: "One well, bought outright, at a price that makes your quartermaster sit down. It is enough. The others follow within a season." },
      { kind: "fight", label: "Take the wells", text: "Around the wellheads, which everyone has spent three generations thinking about how to hold." },
      { kind: "need", need: { tech: "dyking" }, label: "Sink your own", text: "Sluices, banked earth and a crew who know what they are doing. A tenth well, and suddenly nine is not a monopoly." },
    ],
  },
  {
    id: "ice", name: "The Ice Quarter", on: "gt",
    intro: "Streets that never thaw, kept that way on purpose, with everything anybody has worth keeping stored under them.",
    holder: "wasters", garrison: ["axemen", "spearmen"],
    ground: { left: "open", centre: "open", right: "rough" },
    ways: [
      { kind: "pay", res: { food: 55 }, label: "Rent the cold", text: "You pay in food, which is the only thing worth paying in here, and they give you the run of the cellars." },
      { kind: "fight", label: "Take the cellars", text: "On ice, in the open, where nobody can hold anything for long." },
      { kind: "need", need: { seasons: 3 }, label: "Winter with them", text: "Three seasons of your people living alongside theirs and the question of who the quarter belongs to stops being interesting to anyone." },
    ],
  },
  {
    id: "shanty", name: "The Shanty", on: null,
    intro: "Everyone who came here with nothing and stayed. It has no streets, six thousand people and a reputation, and it is where half your recruits would come from.",
    holder: "wasters", garrison: ["axemen", "axemen", "hunters"],
    ground: { left: "rough", centre: "rough", right: "rough" },
    ways: [
      { kind: "pay", res: { food: 45, scrap: 20 }, label: "Buy the headmen", text: "There are eleven headmen and they all want something. It is cheaper than it should be and it takes a week of talking." },
      { kind: "fight", label: "Go in", text: "There are no streets. There is no ground anyone can call theirs. It is the worst kind of fighting there is." },
      { kind: "need", need: { pop: 500 }, label: "Let it grow into you", text: "The settlement grows out and the shanty grows in until there is no line between them, and the headmen start coming to your hall of their own accord." },
    ],
  },
  {
    id: "works", name: "The Works", on: "rh",
    intro: "A manufactory with the roof half on, and people in it making things — badly, slowly, and without stopping, for four generations.",
    holder: "wasters", garrison: ["spearmen", "hunters"],
    ground: { left: "walls", centre: "rough", right: "open" },
    ways: [
      { kind: "pay", res: { scrap: 50 }, label: "Buy the works", text: "They have never been offered money before and it takes them some time to work out what to do about it. Then they take it." },
      { kind: "fight", label: "Take the floor", text: "Inside, among standing machinery, where a line of battle is four men wide." },
      { kind: "need", need: { tech: "toolcraft" }, label: "Show them how", text: "Hammers, tongs and dies, and somebody who knows what a die is for. Within a season they are making things well, and working for you." },
    ],
  },
  {
    id: "necropolis", name: "The Necropolis", on: "rp",
    intro: "Where the dead were put, in numbers, in stone. People live in the mausolea now and are not sentimental about it. Something else lives further in and is.",
    holder: "changed", garrison: ["fleshhorde", "fleshhorde"],
    ground: { left: "rough", centre: "walls", right: "rough" },
    ways: [
      { kind: "pay", res: { scrap: 40, food: 25 }, label: "Pay the sextons", text: "The sextons take the payment and mark you a road through that the deeper things do not use. They are quite clear about staying on it." },
      { kind: "fight", label: "Go in among the stones", text: "Between mausolea, in the dark, against whatever the sextons have been paying off." },
      { kind: "need", need: { unit: "bowmen" }, label: "Line the avenues", text: "Bowmen at every junction, shooting down the avenues for a week. Whatever is in there stops coming up them." },
    ],
  },
  {
    id: "rail", name: "The Cutting", on: "prh",
    intro: "A railway cutting, dead straight, running through the quarter twenty feet down with bridges over it every four hundred yards. Somebody has made a town of the bottom of it.",
    holder: "wasters", garrison: ["hunters", "spearmen"],
    ground: { left: "walls", centre: "rough", right: "walls" },
    ways: [
      { kind: "pay", res: { scrap: 45 }, label: "Pay for the right of way", text: "They sell you the right to use the bridges, which is the only thing you actually wanted, and go on living at the bottom." },
      { kind: "fight", label: "Take the cutting", text: "Down in the cut with the bridges above you, which is where they will be." },
      { kind: "need", need: { seasons: 4 }, label: "Bridge it", text: "Four seasons of work and there are ten bridges instead of four. The cutting stops being a wall and starts being a street." },
    ],
  },
  {
    id: "camp", name: "The Winter Camp", on: "stg",
    intro: "Riders who stop here when the grass goes, every year, and have done for longer than the settlement has had a name. They are here now.",
    holder: "wasters", garrison: ["riders", "hunters"],
    ground: { left: "open", centre: "open", right: "open" },
    ways: [
      { kind: "pay", res: { food: 65 }, label: "Winter them", text: "Feed the camp and the camp moves its pickets out to your border for the season, and the ground inside it is yours." },
      { kind: "fight", label: "Break the camp", text: "In the open against horse, which is a question of whether anything you have can make them stand still." },
      { kind: "need", need: { tech: "horsemanship" }, label: "Ride with them", text: "You send your own out to winter alongside them. By spring nobody is quite sure whose camp it is, which suits both of you." },
    ],
  },
];

/* The seven seats, written by hand. A realm's own city should not be a
   shuffle of the same quarters everyone else has. */
export const SEAT_DISTRICTS = {
  "25,77": [   // Lunden
    {
      id: "lundentrench", name: "The Trench",
      intro: "The old Thames riverbed. Now, a warzone between rivalling tribal groups, scavenging the dregs of what remains. Under the derelict bridges, tollmasters collect coins from wandering groups. Now, they demand a toll from you.",
      holder: "wasters", garrison: ["spearmen", "axemen", "hunters"],
      ground: { left: "rough", centre: "rough", right: "rough" },
      ways: [
        { kind: "pay", res: { scrap: 60 }, label: "Pay what they ask", text: "The tollmasters count it under the bridge, twice, in front of you. Then the crews are told whose the cut is now, and the crews stop fighting over it, mostly." },
        { kind: "fight", label: "Take the bridges", text: "Down in the riverbed among the pilings, with four crews who hate each other agreeing for one afternoon to hate you instead." },
        { kind: "need", need: { unit: "riders" }, label: "Ride the riverbed", text: "Horse down the Thames end to end, under every bridge, faster than word of you can travel on foot. The tollmasters are gone before the second morning and the crews follow them." },
      ],
    },
    {
      id: "lundenwall", name: "The Wall Ward",
      intro: "The square mile the Romans walled and nobody since has managed to un-wall. What is inside it has not needed anyone's permission in three hundred years, and says so from the gate.",
      holder: "wasters", garrison: ["spearmen", "spearmen", "hunters"],
      ground: { left: "walls", centre: "walls", right: "rough" },
      ways: [
        { kind: "pay", res: { scrap: 55, food: 30 }, label: "Take the ward into service", text: "Wages, rations and the wall stays theirs to keep. They were tired of keeping it for nothing." },
        { kind: "fight", label: "Go up the wall", text: "Up a wall that has been in repair since before there was anyone to repair it for." },
        { kind: "need", need: { tech: "smelting" }, label: "Re-gate it in iron", text: "You hang them new gates in wrought iron. They open them for you the day they are hung." },
      ],
    },
    {
      id: "lundenyards", name: "The Southwark Yards",
      intro: "Across the riverbed, where the barges were broken up and the tanneries were. It smells, it has always smelled, and everything worth having in Lunden came out of it at some point.",
      holder: "wasters", garrison: ["axemen", "axemen"],
      ground: { left: "rough", centre: "rough", right: "open" },
      ways: [
        { kind: "pay", res: { scrap: 45 }, label: "Buy the yards", text: "The yardmasters sell, on condition the tanneries keep running. You agree, downwind." },
        { kind: "fight", label: "Take the yards", text: "Among the slips and the drying racks, where nobody can see anybody until they are on them." },
        { kind: "need", need: { tech: "scavenging" }, label: "Work them in shifts", text: "Floor by floor, in shifts, properly. The yardmasters watch for a fortnight and then ask to be put on the roll." },
      ],
    },
    {
      id: "lundendeep", name: "The Deep Lines",
      intro: "The tube, below the water table that no longer exists, dry for three centuries. People went down there when the water came and some of their grandchildren have still not come up.",
      holder: "changed", garrison: ["fleshhorde", "fleshhorde", "fleshhorde"],
      ground: { left: "walls", centre: "rough", right: "walls" },
      ways: [
        { kind: "pay", res: { food: 70 }, label: "Feed what is down there", text: "The people who still live at the top of the stairs know what to leave and where. You leave it. The lines stay quiet and the quarter above them can be built on." },
        { kind: "fight", label: "Go down", text: "In tunnels, in the dark, against a great deal of something that has never had to learn about daylight." },
        { kind: "need", need: { unit: "bowmen" }, label: "Hold the stairheads", text: "Bowmen at the top of every stair for a month, shooting anything that comes up. Eventually nothing does." },
      ],
    },
    {
      id: "lundenmarsh", name: "The Lea Marsh",
      intro: "Where the river came in from the north and never quite stopped. Reed, silt and eel-traps, worked by families who have not paid anyone anything since the water went out.",
      holder: "wasters", garrison: ["hunters", "spearmen"],
      ground: { left: "rough", centre: "open", right: "anchored" },
      ways: [
        { kind: "pay", res: { scrap: 35, food: 25 }, label: "Buy the traps", text: "They sell the traps and keep the working of them, which is what they wanted, and you get the marsh, which is what you wanted." },
        { kind: "fight", label: "Take the marsh", text: "In reed and silt, where a line of battle sinks to the knee and stays there." },
        { kind: "need", need: { tech: "coastworks" }, label: "Put in fixed weirs", text: "Proper weirs, a smoke-house and a stage. The trap-families come to look at it and do not go home." },
      ],
    },
  ],
  "35,99": [   // Lyon Terraces
    {
      id: "lyonrolls", name: "The Rolls Quarter",
      intro: "Where the registers are kept — every household on the terraces, written down, in order, by clerks who have never been told to stop. They will not hand them over to a warlord who cannot read them.",
      holder: "wasters", garrison: ["spearmen", "hunters"],
      ground: { left: "walls", centre: "rough", right: "open" },
      ways: [
        { kind: "pay", res: { scrap: 50 }, label: "Fund the clerks", text: "Ink, vellum and wages. It is the first money the Rolls have seen in living memory and they hand over a copy of everything." },
        { kind: "fight", label: "Take the archive", text: "Among the stacks, which burn, which everyone involved is extremely aware of." },
        { kind: "need", need: { tech: "foraging" }, label: "Give them something to count", text: "Somebody writes down where the good ground is. The clerks read it, find three errors, correct them, and consider you one of theirs." },
      ],
    },
    {
      id: "lyonvine", name: "The Cut Terraces",
      intro: "Vines on the south face, cut into the hill in steps, worked by people who will tell you at length that the wine was better before.",
      holder: "wasters", garrison: ["spearmen", "axemen"],
      ground: { left: "rough", centre: "rough", right: "open" },
      ways: [
        { kind: "pay", res: { scrap: 40 }, label: "Buy the south face", text: "They sell the face and keep the cellars, and they are quietly delighted with the arrangement." },
        { kind: "fight", label: "Take the terraces", text: "Uphill, over cut steps, which is as bad as it sounds." },
        { kind: "need", need: { seasons: 3 }, label: "Drink with them", text: "Three seasons of turning up. On the last of them somebody offers you the cellar key without being asked." },
      ],
    },
  ],
  "45,97": [   // The Innsbruck Door
    {
      id: "innsdoor", name: "The Outer Door",
      intro: "The first of the three doors, standing open since the Collapse because somebody wedged it and died. Pilgrims camp in the airlock and will not be moved.",
      holder: "wasters", garrison: ["vaultguard", "spearmen"],
      ground: { left: "walls", centre: "walls", right: "walls" },
      ways: [
        { kind: "pay", res: { scrap: 65 }, label: "Endow the camp", text: "Somewhere warmer to be, paid for. They go, gratefully, and take the wedge with them." },
        { kind: "fight", label: "Clear the airlock", text: "In an airlock. There is no flank, there is no ground, there is only the corridor." },
        { kind: "need", need: { tech: "toolcraft" }, label: "Hang a new door", text: "A door of your own, hung properly, that opens and closes. The pilgrims move to the outside of it, which is where you wanted them." },
      ],
    },
    {
      id: "innscold", name: "The Cold Store",
      intro: "Cut into the mountain and holding at four degrees without anyone doing anything about it. The families who moved in generations ago regard it as theirs and are not wrong.",
      holder: "wasters", garrison: ["spearmen", "spearmen"],
      ground: { left: "walls", centre: "rough", right: "walls" },
      ways: [
        { kind: "pay", res: { food: 60 }, label: "Rent the cold", text: "Paid in food, because in a cold store food is the currency. They give you two of the six chambers and then, quite soon, four." },
        { kind: "fight", label: "Take the chambers", text: "In corridors cut for machines, at four degrees, against people who grew up in them." },
        { kind: "need", need: { seasons: 4 }, label: "Store with them", text: "Four seasons of your grain alongside theirs and the chambers stop having an owner worth arguing about." },
      ],
    },
  ],
  "59,106": [  // Venezia Silt
    {
      id: "venpiles", name: "The Piles",
      intro: "The city stands on a forest of wooden piles that have been in mud for a millennium and in dry air for three centuries. The pile-keepers go down and pack them, every year, and everybody leaves the pile-keepers alone.",
      holder: "wasters", garrison: ["spearmen", "hunters"],
      ground: { left: "rough", centre: "rough", right: "anchored" },
      ways: [
        { kind: "pay", res: { scrap: 50 }, label: "Fund the packing", text: "Iron bands, timber and wages. The pile-keepers have wanted iron bands for a hundred years and would have asked if they thought anyone would listen." },
        { kind: "fight", label: "Take the underside", text: "Under the city, among the piles, in the dark, where nobody should fight anybody." },
        { kind: "need", need: { tech: "coastworks" }, label: "Stage it properly", text: "You build a working stage under the quarter so the packing can be done from a platform instead of on one's back. They give you the quarter for it." },
      ],
    },
    {
      id: "venglass", name: "The Glass Quarter",
      intro: "Furnaces that have not gone out since before the water went, kept lit in relay by a guild that will not say how. Everything they make is beautiful and none of it is for sale.",
      holder: "wasters", garrison: ["spearmen", "axemen"],
      ground: { left: "walls", centre: "rough", right: "rough" },
      ways: [
        { kind: "pay", res: { scrap: 60, food: 20 }, label: "Buy a season's making", text: "You buy the whole season's work sight unseen. It is an enormous sum and it makes you, in their eyes, a patron rather than a warlord." },
        { kind: "fight", label: "Take the furnaces", text: "Among furnaces that have been lit for three hundred years, which nobody on either side wants to put out." },
        { kind: "need", need: { tech: "refining" }, label: "Bring them fuel", text: "Proper fuel, refined, in quantity. The guild has been burning driftwood for a century. They open the gate themselves." },
      ],
    },
  ],
  "58,28": [   // Skjoldhall
    {
      id: "skjoldfire", name: "The Long Fire",
      intro: "One hall, one fire, and six clans who have each held the seat at it and each expect to again. The fire has not gone out and the argument has not stopped.",
      holder: "wasters", garrison: ["axemen", "axemen", "spearmen"],
      ground: { left: "walls", centre: "rough", right: "walls" },
      ways: [
        { kind: "pay", res: { food: 70 }, label: "Feast them all", text: "Every clan, at once, at your expense, for a week. Three fights break out and all three are settled at the fire, which is the point." },
        { kind: "fight", label: "Take the hall", text: "Indoors, at a fire, against six clans who dislike each other slightly less than they dislike you." },
        { kind: "need", need: { tech: "hosting" }, label: "Write the rolls", text: "Who owes what, who sleeps where, who feeds whom. It is a clerical answer to a six-generation argument and it works immediately." },
      ],
    },
    {
      id: "skjoldice", name: "The Ice Road",
      intro: "The way in and out, frozen nine months of twelve, held by the family who keep it cut. Nothing reaches the hall that they have not let past.",
      holder: "wasters", garrison: ["hunters", "spearmen"],
      ground: { left: "open", centre: "open", right: "rough" },
      ways: [
        { kind: "pay", res: { scrap: 45 }, label: "Pay the road-keepers", text: "A price per cart, agreed for twenty years, and they cut the road wider while they are at it." },
        { kind: "fight", label: "Take the road", text: "On ice, in the open, where the only advantage is knowing where it is thin." },
        { kind: "need", need: { unit: "baggage" }, label: "Bring carts they cannot turn away", text: "Enough carts, often enough, that the road has to be kept open for them. The keepers end up working for the traffic, which is to say for you." },
      ],
    },
  ],
  "87,91": [   // Karkhan Wells
    {
      id: "karkwells", name: "The Nine Wells",
      intro: "The wells the place is named for. Nine families, nine wells, and an arrangement between them older than any warlord who has ever ridden up to look at it.",
      holder: "wasters", garrison: ["spearmen", "spearmen", "hunters"],
      ground: { left: "open", centre: "rough", right: "open" },
      ways: [
        { kind: "pay", res: { scrap: 65 }, label: "Buy a well outright", text: "One well, at a price that makes your quartermaster sit down on the step. The other eight families spend a fortnight deciding they would also like to be bought." },
        { kind: "fight", label: "Take the wellheads", text: "Around nine wellheads that nine families have spent nine generations working out how to hold." },
        { kind: "need", need: { tech: "dyking" }, label: "Sink a tenth", text: "Sluices and banked earth and people who know what they are doing. Nine stops being a monopoly the day the tenth comes in." },
      ],
    },
    {
      id: "karkcaravan", name: "The Caravan Ground",
      intro: "Where the salt road stops. Thirty acres of trodden dust, a thousand animals on it in season, and a caravanmaster who takes a cut of everything that crosses it.",
      holder: "wasters", garrison: ["riders", "hunters"],
      ground: { left: "open", centre: "open", right: "open" },
      ways: [
        { kind: "pay", res: { scrap: 50 }, label: "Buy the cut", text: "You buy the caravanmaster's cut and keep the caravanmaster, who is worth considerably more than the cut." },
        { kind: "fight", label: "Take the ground", text: "In the open against horse, on ground chosen three hundred years ago for being good to ride on." },
        { kind: "need", need: { tech: "horsemanship" }, label: "Out-ride them", text: "Your own riders on the salt road, faster and further. The caravanmaster changes sides before anybody draws anything." },
      ],
    },
  ],
  "17,120": [  // Solar seat
    {
      id: "solmirror", name: "The Mirror Field",
      intro: "Nine thousand heliostats on the plain below the court, aligned by hand every morning by people who consider it a devotion rather than a job.",
      holder: "wasters", garrison: ["spearmen", "hunters"],
      ground: { left: "open", centre: "open", right: "rough" },
      ways: [
        { kind: "pay", res: { scrap: 55 }, label: "Endow the alignment", text: "You pay for the alignment to be done properly, with instruments. The devotion is unoffended and the field is yours." },
        { kind: "fight", label: "Take the field", text: "In the open, among nine thousand mirrors, in full sun, which nobody enjoys." },
        { kind: "need", need: { tech: "refining" }, label: "Give the tower fuel", text: "The tower has run on sun alone for three centuries and it has always been a season short. You fix that, and the field follows the tower." },
      ],
    },
    {
      id: "solcourt", name: "The Lower Court",
      intro: "Everyone who serves the court and is not of it, living in the shade of the tower on the strict understanding that they do not come up.",
      holder: "wasters", garrison: ["axemen", "spearmen"],
      ground: { left: "rough", centre: "rough", right: "walls" },
      ways: [
        { kind: "pay", res: { food: 50, scrap: 15 }, label: "Feed the lower court", text: "Food, and a little money, and the understanding that they may come up. It costs almost nothing and buys the whole quarter." },
        { kind: "fight", label: "Clear the shade", text: "In the streets under the tower, where it is never light and everyone lives on top of everyone." },
        { kind: "need", need: { pop: 700 }, label: "Let it fill", text: "Enough people arrive that the lower court stops being a servants' quarter and starts being most of the city, and the understanding quietly lapses." },
      ],
    },
  ],
};

/* How many quarters a place has besides the one you get for holding it. */
export const DISTRICT_COUNT = { seat: 5, other: 4 };
