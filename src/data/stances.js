/* ------------------------------- STANCES ------------------------------------
   Between one field and the next, a warband is doing something. Until now it
   was always doing the same thing — standing where it was left with its whole
   movement in hand — and so the only question a season ever asked was which
   hex to walk to next. A campaign made of nothing but walking is a campaign
   with one verb in it.

   A stance is that question made explicit: what is this warband FOR, this
   season. Every one of them is a trade, paid in the only three currencies a
   campaign has — movement, men, and rations — and every one of them costs
   something real, because a free stance is just a better default.

   The numbers are multipliers on the same keys a captain's habit uses, so a
   stance reaches the line of battle through exactly the machinery everything
   else does. `still` means no movement at all; `move` is added to the
   allowance; `waste` is taken off every company each season it is held.
   ------------------------------------------------------------------------ */
export const STANCES = {
  column: {
    name: "In column",
    short: "Column",
    verb: "March in column",
    desc: "In order, on the road, at the pace the carts can keep. Nothing added and nothing taken away.",
    note: "The ordinary way of getting anywhere.",
  },
  forced: {
    name: "Forced march",
    short: "Forced",
    verb: "Force the march",
    desc: "Two more hexes a season out of men who were not asked whether they wanted to give them. They arrive strung out, short of sleep, and they arrive.",
    move: 2,
    waste: 0.05,
    morale: 1.12,
    dealt: 0.95,
    tires: true,
    note: "Two hexes the moment it is ordered, one a season after — paid in men, in nerve, and in weight in the line.",
  },
  dug: {
    name: "Dug in",
    short: "Dug in",
    verb: "Dig in on this ground",
    desc: "Spoil out of the ground, stakes driven into the mud in front of it, and the carts emptied where they stand. Nobody is going anywhere.",
    still: true,
    taken: 0.85,
    morale: 0.9,
    draw: 0.8,
    dug: 14,
    note: "No movement at all. Much harder to shift, and eats less sitting still.",
  },
  ambush: {
    name: "Lying up",
    short: "Lying up",
    verb: "Lie up here",
    desc: "Off the road, in the treeline, no fires and no horns. Nobody looking at a map can see them. Whoever walks onto this ground finds out the hard way.",
    still: true,
    scout: 2,
    flank: 1.3,
    dealt: 1.12,
    hidden: true,
    note: "No movement. Hidden from anybody looking, and murderous to walk into.",
  },
  raid: {
    name: "Raiding",
    short: "Raiding",
    verb: "Ride out and strip this ground",
    desc: "Off the leash on somebody else's country: barns, pens, carts, cattle, and whoever is slow getting away from them.",
    move: -1,
    waste: 0.02,
    needsEnemyGround: true,
    note: "Only on the ground of somebody you are at war with. Strips it every season you stay, and everybody hears about it.",
  },
};
export const STANCE_IDS = Object.keys(STANCES);

/* What a season of working somebody else's ground is actually worth, and what
   it costs you in the eyes of everybody who hears. These are the same kinds of
   thing a holdout's band takes off you, deliberately: a raid ought to read the
   same from both ends of it. */
export const RAID = {
  scrap: [16, 34],      // carried off
  food: [10, 24],
  heads: [12, 30],      // driven off, out of the province's own people
  wreck: 0.3,           // ...or a building put out of use instead
  regard: -7,           // what the people whose ground it was think of it
  watching: -2,         // ...and what everybody else does
  pop: 0.4,             // of the heads taken, the share that stays gone
};
