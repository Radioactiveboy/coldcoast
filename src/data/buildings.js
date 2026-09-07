/* ------------------------------- BUILDINGS -------------------------------- */
export const BUILDINGS = {
  siltfarm: { name: "Silt farm",    scrap: 30, turns: 2, yield: { food: 3 },   on: ["d", "p", "c", "s", "l"], desc: "Dyked plots on the old seabed." },
  yard:     { name: "Salvage yard", scrap: 25, turns: 2, yield: { scrap: 3 },  on: ["r", "h", "m", "d"],      desc: "Cranes and cutting torches." },
  mill:     { name: "Powder mill",  scrap: 45, turns: 3, yield: { powder: 3 }, on: ["f", "h", "r", "p"],      desc: "Saltpetre beds and a charcoal kiln." },
  refinery: { name: "Refinery",     scrap: 55, turns: 3, yield: { fuel: 3 },   on: ["b", "f", "h", "c", "r"], desc: "Cracks anything that burns." },
  muster:   { name: "Muster hall",  scrap: 35, turns: 2, yield: { men: 3 },    on: null,                       desc: "Lets you raise warbands here." },
  workshop: { name: "Craftsmen's hut", scrap: 45, turns: 2, yield: {},            on: null,             desc: "Turns out arms every season. What kind is up to you." },
  mine:     { name: "Mine",         scrap: 70, turns: 3, yield: { metal: 5 },  on: ["m", "h"],       desc: "A cut face and a windlass. Ore in quantity." },
  fishery:  { name: "Fishery",      scrap: 35, turns: 2, yield: { food: 5 },   on: null, coast: true,          desc: "Weirs, lines and a smoke-house on the shore." },
  pier:     { name: "Pier",         scrap: 48, turns: 3, yield: { scrap: 3, food: 1 }, on: null, coast: true,  desc: "A landing stage. Wrecks come in whole instead of in pieces." },
  redoubt:  { name: "Redoubt",      scrap: 40, turns: 2, yield: {},            on: null, def: 18,              desc: "Earthworks and a firing step." },
};
