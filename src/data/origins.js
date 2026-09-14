/* --------------------------------- ORIGINS ---------------------------------
   Where the warlord came from before the seat. One is chosen in the opening
   scene. It sets a habit on the realm, changes what the first winter has in
   it, and puts a different second thing on the list of what is worth doing.
   ------------------------------------------------------------------------ */
export const ORIGINS = {
  hunter: {
    name: "The hunter's child", trait: "tracker",
    blurb: "You fed the ward through nineteen winters before anyone called you anything. You know the moor, the woods and what lives in them, and so does everyone who rides with you.",
    start: "A second company of hunters rides out with the outrider column.",
    gives: { unit: "hunters" },
    goal: {
      id: "herd", name: "Clear a feral herd",
      hint: "You know the woods better than anyone. About a third of them are holding a herd; hunters shoot it out of the trees.",
      teaches: "What a company is decides what it is good against. Bows double against beasts; axes have to go in among the teeth.",
      pay: { food: 60 },
      check: ({ tally }) => (tally.herds || 0) >= 1,
    },
  },
  smith: {
    name: "The smith's child", trait: "forgewise",
    blurb: "You grew up at the bloomery, sorting the heap and working the bellows. You can tell what a ruin is worth from the door, and the realm gets more out of every load of scrap because of it.",
    start: "Eighty scrap in hand that another warlord would not have.",
    gives: { scrap: 80 },
    goal: {
      id: "improve", name: "Raise something to its second level",
      hint: "Open a settlement's district and improve a finished building. The second level is where a building starts to pay.",
      teaches: "Buildings come in levels, with a fork near the top. Improving what you have is usually cheaper than raising something new.",
      pay: { scrap: 50 },
      check: ({ game, P }) => Object.values(game.provinces).some((p) => p.owner === P
        && (p.builds || []).some((b) => (b.lvl || 1) >= 2 && !b.left)),
    },
  },
  captain: {
    name: "The captain's child", trait: "oldsoldier",
    blurb: "You stood in a line before you could see over it, and you held a seat because the companies would not follow anyone else. Your captains start out believing in you, and nobody under your banner breaks early.",
    start: "Every captain begins fifteen points more loyal.",
    gives: { loyalty: 15 },
    goal: {
      id: "field", name: "Win a field in the open",
      hint: "Draw the line yourself. Put the heavy companies in the centre, keep something back, and press when they waver.",
      teaches: "A line is three sectors. When one goes, the enemy turns onto whatever is beside it — that is how fields are lost.",
      pay: { men: 50, scrap: 25 },
      check: ({ tally }) => (tally.fields || 0) >= 1,
    },
  },
};
export const ORIGIN_IDS = Object.keys(ORIGINS);
