/* --------------------------------- THE WAY ----------------------------------
   What your people actually do, as against what you have ordered them to do
   this season. An edict is a shout from the seat and can be changed next
   winter; a tradition is how a hundred thousand people bury their dead, feed
   their children and decide who is allowed through the gate, and changing one
   is a thing they will talk about for years.

   Four slots. They start empty, and they are supposed to: a realm three
   hundred years into the cold has habits but has not yet decided what it is.
   Taking a tradition into an empty slot costs nothing but the saying of it.
   Replacing one costs scrap and unsettles everybody, which is the whole point
   of calling it a reform.

   This table is meant to grow. A tradition is one entry: a name, what it means
   in prose, and any of `mul` (what the land brings in), `mods` (the field and
   the road), `growth` (whether anybody moves to your wards), `regard` (how a
   named people or everybody thinks of you), and `tags` for the ones that
   unlock elsewhere. Nothing else in the game needs touching to add one.
   ------------------------------------------------------------------------ */

export const CULTURE_SLOTS = 4;
/* What it costs to tear one out and put another in, and how long the talk goes
   on afterwards. */
export const REFORM = { scrap: 80, regard: -4, seasons: 8 };

export const TRADITIONS = {
  wreckright: {
    name: "Wreck-right",
    line: "Every keel on the flats is common property.",
    note: "No family owns a hull. A crew that cuts one owns what it carries out, and the yards take a share for the wards. It has made the Doggerbund rich and it has made inheritance a subject nobody raises at a funeral.",
    mul: { scrap: 1.08 },
    regard: { holk: 6 },
  },
  longmuster: {
    name: "The long muster",
    line: "Every household owes a body when the horn goes.",
    note: "Not a levy — a debt, and one people pay without being asked twice. The companies come up fast and they come up resentful, and the wards are thinner for it every year.",
    mul: { men: 1.12 },
    growth: 0.9,
  },
  saltburial: {
    name: "Salt-burial",
    line: "The drowned are given back to the water.",
    note: "No barrows, no names cut in stone. A body goes out on the ebb with its tools and that is the end of the matter, which makes a defeat something a family can absorb in an afternoon.",
    mods: { morale: 0.94 },
  },
  opengate: {
    name: "The open gate",
    line: "Anyone who walks in and works is one of ours by spring.",
    note: "No questions about where somebody came from, which is how a realm on a drowned coast grows at all. It also means every court on this coast has people in your wards, and they write letters.",
    mul: { food: 1.04 },
    growth: 1.15,
    regard: { all: 3 },
  },
  shutgate: {
    name: "The shut gate",
    line: "Ours are ours, and the rest can walk on.",
    note: "A ward that knows every face in it is a ward nobody robs. It is also a ward that does not grow, and the roads outside it are full of people who remember being turned away.",
    mods: { taken: 0.96 },
    growth: 0.9,
    regard: { all: -4 },
  },
  oathofthefire: {
    name: "The oath at the fire",
    line: "A captain's word is given in front of the companies, or not at all.",
    note: "Nobody is appointed in a room. It is done at a fire, out loud, with the men who will die on it standing there — and a captain who breaks one has to walk past all of them afterwards.",
    loyalGain: 1.3,
  },
  chartkeepers: {
    name: "The chart-keepers",
    line: "Every column that goes out comes back and says what it saw.",
    note: "Copied, corrected, and kept in a room that is never allowed to get wet. Three hundred years of it means your riders are rarely surprised by ground.",
    scoutAdd: 1,
    mul: { scrap: 0.97 },
  },
  cartcreed: {
    name: "The creed of the carts",
    line: "The column eats before the seat does.",
    note: "A quartermaster outranks a ward elder at a granary door, and everybody has agreed to this for so long that nobody finds it strange. Warbands go further out than they have any right to.",
    reliefAdd: 1,
    mul: { food: 0.97 },
  },
  ironvigil: {
    name: "The iron vigil",
    line: "Powder and iron before bread, always.",
    note: "The mills run through winter and the kilns burn whatever will burn. It has kept the Doggerbund armed through worse years than this one, and it has also starved some of them.",
    mul: { powder: 1.15, metal: 1.08, food: 0.94 },
  },
  quietdead: {
    name: "The quiet dead",
    line: "The ones who did not come home are counted out loud, every winter.",
    note: "Every name, every year, until the list is longer than the evening. It is a miserable custom and it is the reason a company that has been broken once will stand the second time.",
    mods: { morale: 0.92, dealt: 0.98 },
  },
  nobreaking: {
    name: "No breaking of bread",
    line: "Nobody eats with a realm we are at war with.",
    note: "Not a policy, a manners thing, and it is absolute. It makes an envoy's life very difficult and it makes your own people impossible to bribe.",
    mods: { taken: 0.95 },
    regard: { all: -3 },
    tags: ["hardline"],
  },
  saltroad: {
    name: "The salt road",
    line: "A guest on the road is fed, whoever they are.",
    note: "It costs a household a meal and it has meant that for three centuries no Doggerbund column has walked a road where nobody would talk to it.",
    mul: { food: 0.98 },
    regard: { all: 6 },
    tags: ["open"],
  },
};
export const TRADITION_IDS = Object.keys(TRADITIONS);

const BASE = { dealt: 1, taken: 1, morale: 1, storm: 1, ranged: 1, flank: 1, waste: 1, draw: 1 };
/* Everything the held traditions come to, in the two shapes the rest of the
   game already multiplies by. */
export function cultureMods(held) {
  const out = { ...BASE, scout: 0, relief: 0, loyalGain: 1, mul: {}, growth: 1 };
  (held || []).forEach((id) => {
    const t = TRADITIONS[id];
    if (!t) return;
    Object.entries(t.mods || {}).forEach(([k, v]) => { if (out[k] != null) out[k] *= v; });
    Object.entries(t.mul || {}).forEach(([k, v]) => { out.mul[k] = (out.mul[k] || 1) * v; });
    if (t.scoutAdd) out.scout += t.scoutAdd;
    if (t.reliefAdd) out.relief += t.reliefAdd;
    if (t.loyalGain) out.loyalGain *= t.loyalGain;
      if (t.growth) out.growth *= t.growth;
  });
  return out;
}

/* How a tradition reads on its card. Same words the ledger and the field use. */
const MOD_WORD = {
  dealt: ["damage dealt", 1], taken: ["damage taken", -1], morale: ["nerve holds", -1],
  storm: ["storming a wall", 1], ranged: ["shooting", 1], flank: ["turning a flank", 1],
  waste: ["losses out of supply", -1], draw: ["rations drawn", -1],
};
const RES_WORD = { food: "rations", scrap: "scrap", metal: "metal", fuel: "fuel", powder: "powder", men: "recruits" };
export function traditionChips(id) {
  const t = TRADITIONS[id];
  if (!t) return [];
  const out = [];
  Object.entries(t.mul || {}).forEach(([k, v]) => {
    out.push({ t: `${RES_WORD[k] || k} ${v > 1 ? "+" : "−"}${Math.round(Math.abs(v - 1) * 100)}%`, good: v > 1 });
  });
  Object.entries(t.mods || {}).forEach(([k, v]) => {
    const w = MOD_WORD[k];
    if (!w) return;
    const pc = Math.round(Math.abs(v - 1) * 100);
    if (!pc) return;
    out.push({ t: `${w[0]} ${v > 1 ? "+" : "−"}${pc}%`, good: w[1] > 0 ? v > 1 : v < 1 });
  });
  if (t.scoutAdd) out.push({ t: `scouting +${t.scoutAdd}`, good: true });
  if (t.reliefAdd) out.push({ t: `supply reach +${t.reliefAdd}`, good: true });
  if (t.loyalGain) out.push({ t: `loyalty earned +${Math.round((t.loyalGain - 1) * 100)}%`, good: true });
  if (t.growth && t.growth !== 1) out.push({ t: `people grow ${t.growth > 1 ? "+" : "−"}${Math.round(Math.abs(t.growth - 1) * 100)}%`, good: t.growth > 1 });
  if (t.regard) {
    Object.entries(t.regard).forEach(([who, v]) => {
      out.push({ t: who === "all" ? `everybody's regard ${v > 0 ? "+" : "−"}${Math.abs(v)}` : `${who} ${v > 0 ? "+" : "−"}${Math.abs(v)}`, good: v > 0 });
    });
  }
  return out;
}
