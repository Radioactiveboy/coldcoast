/* ------------------------------ THE SETTLEMENT ----------------------------
   A seat grows in stages. Each stage costs winters and scrap, wants something
   learned first, and opens another slot for the works below it. You never have
   room for everything, so a capital ends up saying what a realm is for.
   ------------------------------------------------------------------------ */
export const SETTLEMENT = [
  { name: "A cluster of huts", slots: 2, def: 0,
    desc: "Turf, salvage and a ditch somebody started and gave up on." },
  { name: "Palisade town", slots: 3, def: 15, scrap: 70, turns: 3, needs: null,
    desc: "A split-timber wall and a gate that shuts. It stops a raid, not a siege." },
  { name: "Walled town", slots: 4, def: 35, scrap: 160, turns: 5, needs: "toolcraft",
    desc: "Coursed rubble and iron ties, high enough to need ladders." },
  { name: "Citadel", slots: 6, def: 65, scrap: 320, turns: 7, needs: "refining",
    desc: "Angled bastions, cleared ground and magazines cut into the rock." },
];

export const WORKS = {
  longhall:   { name: "Longhall", scrap: 30, turns: 2, tier: 0, yield: { men: 3 },
                desc: "One roof big enough to argue under. People come to be counted." },
  granary:    { name: "Granary", scrap: 35, turns: 2, tier: 0, yield: { food: 4 },
                desc: "Raised floors and rat-guards. Less of the harvest rots." },
  middens:    { name: "Sorting middens", scrap: 30, turns: 2, tier: 0, yield: { scrap: 3 },
                needs: "scavenging", desc: "Everything brought in gets picked over properly." },
  cistern:    { name: "Cistern", scrap: 50, turns: 3, tier: 1, yield: { food: 2 }, def: 10,
                desc: "Clean water under cover. A town that can drink can hold out." },
  smithy:     { name: "Smithy row", scrap: 65, turns: 3, tier: 1, yield: { scrap: 3 },
                needs: "smelting", desc: "A street of hearths working iron from dawn." },
  storehouse: { name: "Storehouse", scrap: 80, turns: 3, tier: 1, yield: { food: 2, scrap: 2 },
                cap: 250, desc: "Deep dry stores. You can hold far more recruits on the books." },
  drillyard:  { name: "Drill yard", scrap: 90, turns: 4, tier: 2, yield: { men: 5 },
                needs: "drill", desc: "Beaten earth and a serjeant with a voice." },
  arsenal:    { name: "Arsenal", scrap: 120, turns: 4, tier: 2, yield: { powder: 4 },
                needs: "blackpowder", desc: "Powder kept dry, apart, and away from the fires." },
  bastions:   { name: "Bastions", scrap: 130, turns: 4, tier: 2, def: 25,
                needs: "toolcraft", desc: "Earth and stone thrown out from the wall to take a gun." },
  foundry:    { name: "Great foundry", scrap: 180, turns: 5, tier: 3, yield: { scrap: 6, fuel: 2 },
                needs: "toolcraft", desc: "Blast, crucible and crane. It never goes out." },
  gunhouse:   { name: "Gun house", scrap: 200, turns: 5, tier: 3, def: 20, yield: { powder: 2 },
                needs: "casting", desc: "Pieces ranged on every approach, and the crews to serve them." },
};
export const WORK_IDS = Object.keys(WORKS);
