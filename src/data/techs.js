/* ----------------------------------- TECHS ---------------------------------
   The advance table. Pure data, no React — the tech tree computes its own
   layout from the `needs` graph, so a new advance places itself.
   ------------------------------------------------------------------------ */
export const TECHS = {
  foraging: {
    name: "Organised foraging", short: "Foraging", turns: 3, scrap: 20, needs: [],
    desc: "Somebody writes down where the good ground is, and the wards stop competing for it.",
    gives: ["Every field, marsh and steppe you hold feeds one more mouth"],
    yield: { food: 1 }, on: ["p", "s", "d", "c", "l"],
  },
  bowyery: {
    name: "Recurve bowyery", short: "Bowyery", turns: 3, scrap: 25, needs: ["foraging"],
    desc: "Horn, sinew and a winter of drying. Reach without powder.",
    gives: ["Recurve bows"], unlocks: ["bows"],
  },
  horsemanship: {
    name: "Horse breaking", short: "Horse breaking", turns: 4, scrap: 35, needs: ["foraging"],
    desc: "The herds out on the grass will carry a rider, if you have the patience.",
    gives: ["Mounted companies"], unlocks: ["horse"],
  },
  coastworks: {
    name: "Piers and weirs", short: "Coastal works", turns: 3, scrap: 30, needs: [],
    desc: "Working the shoreline properly: fixed weirs, a smoke-house, and a stage strong enough to land a hull on.",
    gives: ["Fisheries", "Piers"], unlocks: ["fishery", "pier"],
  },
  scavenging: {
    name: "Systematic scavenging", short: "Scavenging", turns: 3, scrap: 20, needs: [],
    desc: "Stop picking at the ruins and start working them in shifts, floor by floor.",
    gives: ["Salvage yards", "Craftsmen's huts", "Ruinfields and hills give one more scrap"],
    yield: { scrap: 1 }, on: ["r", "h", "m", "d"], unlocks: ["yard", "workshop"],
  },
  smelting: {
    name: "Bloomery smelting", short: "Smelting", turns: 5, scrap: 45, needs: ["scavenging"],
    desc: "A clay stack, a bellows and enough charcoal. Scrap becomes iron you chose the shape of.",
    gives: ["Ore from hills and mountains", "Wrought iron", "Boiled leather"], unlocks: [],
  },
  toolcraft: {
    name: "Metal toolcraft", short: "Toolcraft", turns: 5, scrap: 55, needs: ["smelting"],
    desc: "Hammers, tongs and dies. Once you can make tools, you can make anything slowly.",
    gives: ["Mines", "Forged mail", "Everything you hold gives one more scrap"],
    yield: { scrap: 1 }, unlocks: ["mine"],
  },
  drill: {
    name: "Drill and standard", short: "Drill & standard", turns: 4, scrap: 40, needs: ["toolcraft"],
    desc: "Ranks, a pace, and a flag to dress on. It is the drill that holds, not the armour.",
    gives: ["Line companies", "Muster halls"], unlocks: ["line", "muster"],
  },
  dyking: {
    name: "Dyked fields", short: "Dyked fields", turns: 5, scrap: 45, needs: ["foraging", "smelting"],
    desc: "Sluices and banked earth. The silt out there is the richest soil on the island.",
    gives: ["Silt farms", "Silt flats feed one more mouth again"],
    yield: { food: 1 }, on: ["d"], unlocks: ["siltfarm"],
  },
  saltpetre: {
    name: "Saltpetre beds", short: "Saltpetre", turns: 5, scrap: 50, needs: ["toolcraft"],
    desc: "Dung, straw and patience, turned every month for two years.",
    gives: ["Powder mills"], unlocks: ["mill"],
  },
  blackpowder: {
    name: "Black powder", short: "Black powder", turns: 6, scrap: 70, needs: ["saltpetre"],
    desc: "Corned, not dust. The difference is whether the barrel or the enemy goes.",
    gives: ["Powder muskets"], unlocks: ["muskets"],
    site: { building: "mill", label: "a finished powder mill of your own" },
  },
  refining: {
    name: "Cracking and refining", short: "Refining", turns: 6, scrap: 65, needs: ["toolcraft"],
    desc: "Anything that will burn can be persuaded to burn usefully.",
    gives: ["Refineries", "Redoubts"], unlocks: ["refinery", "redoubt"],
    site: { terrain: ["b"], feature: ["seep"], label: "a saltpan or a fuel seep" },
  },
  casting: {
    name: "Barrel casting", short: "Barrel casting", turns: 7, scrap: 95, needs: ["blackpowder"],
    desc: "Bored true from heavy pipe. It takes a real working to do it at all.",
    gives: ["Scrap cannon", "Gun crews"], unlocks: ["cannon", "battery"],
    site: { feature: ["quarry", "vault", "depot"], label: "heavy workings — Red-Ruth, a cracked vault or a buried depot" },
  },
  enginework: {
    name: "Salvaged engines", short: "Engines", turns: 7, scrap: 90, needs: ["refining"],
    desc: "Two dead engines make one that turns over, if you have the fuel to feed it.",
    gives: ["Technicals"], unlocks: ["technical"],
  },
  vaultcraft: {
    name: "Vault craft", short: "Vault craft", turns: 8, scrap: 120, needs: ["casting"],
    desc: "Pre-Collapse tolerances, read off the machines that made them and copied by hand.",
    gives: ["Preserved rifles", "Riot composite", "Vault guard"],
    unlocks: ["rifles", "composite", "guard"],
    site: { feature: ["vault"], label: "a cracked vault you hold" },
  },
};
export const TECH_IDS = Object.keys(TECHS);
