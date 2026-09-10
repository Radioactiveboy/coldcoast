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
  hosting: {
    name: "The long muster", short: "Long muster", turns: 4, scrap: 30, needs: ["foraging"],
    desc: "Rolls of who owes what, where they sleep and who feeds them on the road. Keeping more than a few companies together is a clerical problem before it is a military one.",
    gives: ["Warbands of up to ten companies instead of eight"],
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

/* ---------------------------------- TIERS ----------------------------------
   Advances come in bands, and a band stays out of sight until the one below
   it is nearly done. The point is pacing: a realm should not be reading about
   vault craft in its first winter, and the tree should grow as you do.

   A tier opens when all but one of the tier below is understood. All but one
   rather than all of it, so a realm can leave a branch it has no use for —
   horse breaking, say — and still get on. Every advance belongs to exactly
   one tier, and no advance depends on one from a higher tier, so a tier can
   never be needed before it is visible; there is a check for both below.
   ------------------------------------------------------------------------ */
export const TECH_TIERS = [
  { id: "tribal", name: "Tribal",
    desc: "What anyone can work out with horn, hide and a long winter.",
    techs: ["foraging", "hosting", "bowyery", "horsemanship", "coastworks", "scavenging"] },
  { id: "forged", name: "Forged",
    desc: "Ore out of the ground, and a fire hot enough to change it.",
    techs: ["smelting", "toolcraft", "dyking"] },
  { id: "drilled", name: "Drilled",
    desc: "Order, written down: ranks that hold, fields that are dyked, nitre banked.",
    techs: ["drill", "saltpetre", "refining"] },
  { id: "powder", name: "Powder",
    desc: "Corned powder, cast barrels, and engines that will still turn over.",
    techs: ["blackpowder", "casting", "enginework"] },
  { id: "vault", name: "Vault",
    desc: "Pre-Collapse tolerances, read off the machines that made them.",
    techs: ["vaultcraft"] },
];

/* All but one of a tier opens the next. A one-advance tier needs that one. */
export const tierGate = (tier) => Math.max(1, tier.techs.length - 1);

export const TIER_OF = {};
TECH_TIERS.forEach((t, i) => t.techs.forEach((id) => { TIER_OF[id] = i; }));

/* How many tiers this realm can see. The first is always open. */
export function tiersOpen(known) {
  let open = 1;
  for (let i = 0; i < TECH_TIERS.length - 1; i++) {
    const done = TECH_TIERS[i].techs.filter((id) => known?.[id]).length;
    if (done < tierGate(TECH_TIERS[i])) break;
    open = i + 2;
  }
  return Math.min(open, TECH_TIERS.length);
}

export const tierOpen = (known, i) => i < tiersOpen(known);

/* What is still wanted before tier i comes into view. */
export function tierNeeds(known, i) {
  if (i <= 0) return null;
  const below = TECH_TIERS[i - 1];
  const done = below.techs.filter((id) => known?.[id]).length;
  return { tier: below, done, want: tierGate(below), left: Math.max(0, tierGate(below) - done) };
}
