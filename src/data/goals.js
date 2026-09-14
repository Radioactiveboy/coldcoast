/* ---------------------------------- GOALS ----------------------------------
   The first few things worth doing, written down. Each one is a system the
   game has and the opening does not explain: a field, a border, a wood with
   something in it, a supply line, a wall. They are not a quest chain — the
   game does not wait for them — and they can be put away. Each pays a little
   when it is done, at the turn of the season, so the money says the same
   thing the text does.

   `check` reads the position. `tally` is kept on the player's realm for the
   things a position cannot show after the fact: a herd that was cleared is a
   wood with nothing in it, which is what an empty wood looks like too. */
export const GOALS = [
  {
    id: "host", name: "Break the Rendfast Host",
    hint: "It is walking at your seat. Take the field with everything you have, draw the line, and hold it.",
    teaches: "Battles are fought on a line of three sectors. What you put where decides who gets flanked.",
    pay: { men: 60, scrap: 20 },
    // Beaten, not annihilated: companies that rout still walk away, so the
    // host is often still on the map after it has lost the field.
    check: ({ tally }) => (tally.hosts || 0) >= 1,
  },
  {
    id: "five", name: "Hold five places",
    hint: "Send a warband onto unclaimed ground, investigate it, then claim it. Rations and recruits pay for the claim.",
    teaches: "Your border is your supply line. Everything a warband eats has to be carried from ground you hold.",
    pay: { food: 50 },
    check: ({ game, P }) => Object.values(game.provinces).filter((p) => p.owner === P).length >= 5,
  },
  {
    id: "herd", name: "Clear a feral herd",
    hint: "About a third of the woods are holding one. Send hunters — animals do not stand in the open being shot at.",
    teaches: "What a company is decides what it is good against. Bows double against beasts; axes have to go in among the teeth.",
    pay: { food: 45 },
    check: ({ tally }) => (tally.herds || 0) >= 1,
  },
  {
    id: "carting", name: "Learn carts and drovers",
    hint: "A tribal advance. It lets you raise a baggage train, which is what makes a long march survivable.",
    teaches: "Two hexes past your border a warband is living on what it carried. A baggage train carries the line two hexes further.",
    pay: { scrap: 40 },
    check: ({ game, P }) => !!game.nations[P]?.known?.carting,
  },
  {
    id: "walls", name: "Take a walled place",
    hint: "Stand a warband beside one and invest it. Every third season the wall gives somewhere; then storm it.",
    teaches: "A siege is a thing you keep doing. Walk away and it lapses; stay and it costs you rations and them everything.",
    pay: { men: 80, scrap: 60 },
    check: ({ tally }) => (tally.walls || 0) >= 1,
  },
];
export const GOAL_IDS = GOALS.map((g) => g.id);
