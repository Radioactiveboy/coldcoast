/* ------------------------------ THE HOUSEHOLD -------------------------------
   Three places at the warlord's own fire, and nobody in them is bought. A
   retainer arrives because of something that happened on the map — a field you
   won and did not chase, a seat you broke, a road you let somebody walk down —
   and they arrive as a scene with a face and a reason, not as a line in a
   ledger. That was the whole point of asking for them: the court should fill
   up with people who turned up, the way a hall actually fills.

   `when` is what has to be true before they will come, read off the realm once
   a season. `mods` are the same keys as a tradition or a piece of regalia, so
   the household folds into courtCommand and courtLedger like everything else
   and no call site has to learn about it. Nothing here is more than about a
   tenth: three of them together should make a noticeably better realm, not a
   different game.

   A retainer can be let go, and one who has been let go does not come back.
   That is deliberate — a slot you filled badly in year three should cost you
   something, and the fourth person through the door is the punishment for it.
   ------------------------------------------------------------------------ */

export const HOUSEHOLD_SLOTS = 3;

export const RETAINERS = {
  hearthman: {
    name: "Ordric Fen",
    title: "Sworn to the hearth",
    when: { fields: 1 },
    face: "An enormous quiet man with a broken nose and a shield he made himself.",
    text: "He was standing at the back of the hall when you came in, and had been for two days. He fought on the other side at your first field, went down early, woke up under a cart and walked here. He does not want a company. He wants to stand where you stand, and he says so once and then stops talking.",
    took: "He takes the place at your right shoulder and keeps it.",
    mods: { taken: 0.94, morale: 1.04 },
  },
  ledgerwoman: {
    name: "Alwe Tallow",
    title: "Keeper of the tally",
    when: { turn: 8 },
    face: "Ink to the elbow, a satchel of split boards, and no patience at all.",
    text: "She turned up behind the grain carts with three years of somebody else's accounts and a list of everything your quartermasters have been getting wrong. Most of the list is right. She is not asking for a post; she says a post would only mean somebody could take it off her.",
    took: "She sets up at the end of the long table and starts counting.",
    mods: { mul: { scrap: 1.08 }, waste: 0.92 },
  },
  roadpriest: {
    name: "Brother Hask",
    title: "Walks ahead of the column",
    when: { accords: 1 },
    face: "Burnt brown, barefoot in all weather, carrying a bell and nothing else.",
    text: "He walked in behind your envoys, which is how you find out he had walked in front of them the whole way. Every gate on the coast knows the bell. He will not swear to you and says so cheerfully; he will walk where you are going and tell them you are coming, which he thinks is a different thing.",
    took: "He is given a place at the fire and does not sleep in it.",
    mods: { regardGain: 1.15, accordEase: 4 },
  },
  houndmaster: {
    name: "Ceol of the Wet Wood",
    title: "Keeps the dogs",
    when: { turn: 14 },
    face: "Half a face, a whistle round his neck, and eleven dogs that watch him and nobody else.",
    text: "You have been hearing the dogs for three seasons — out past the treeline, always on the flank, always about a day ahead of your outriders. He finally came in to the fire because one of the bitches is old and he wants her to die indoors. He mentions, on his way out again, that he can see your ground better than you can.",
    took: "The dogs are quartered in the yard. Ceol is not.",
    mods: { scout: 2, chase: 1.12 },
  },
  wallwright: {
    name: "Mother Quarrel",
    title: "Builds the ditch",
    when: { walls: 1 },
    face: "Seventy if she is a day, and she will out-dig anyone you have.",
    text: "She came to look at your palisade and stood in front of it long enough to be rude. Then she told you what was wrong with it — the revetment, the gate, the angle of the ditch — and when you asked who she was she said she had put up the bank at Kernev and would rather not talk about why she left.",
    took: "She takes the works in hand and the wards stop arguing about them.",
    mods: { garrison: 1.15, siege: 1.1, mul: { men: 1.04 } },
  },
  wanderer: {
    name: "The Wight Walker",
    title: "Came down off the mountain",
    when: { holdouts: 1 },
    face: "Under all the hide there is somebody about nineteen years old.",
    text: "Nobody saw them come in. They were simply at the fire in the morning, eating, in a mask cut from something that had a face on it before. They will not say what they were, and everyone who might have told you is dead by your hand. What they will do is stand in the line, and the line does not break where they are standing.",
    took: "A place is made at the fire. Nobody asks them to take the mask off.",
    mods: { morale: 1.06, dealt: 1.05, regardGain: 0.94 },
  },
  saltmother: {
    name: "Gudrun Saltmother",
    title: "Feeds the hall",
    when: { turn: 22 },
    face: "Arms like hawsers and an opinion about every field you hold.",
    text: "She came up the coast with four boats of her own people and no intention of asking permission. What she has is three generations of knowing which flats will carry a crop and which will kill it, and she would rather spend it here than argue with the Holk about it for another winter.",
    took: "She is given the flats and the hall stops going short in spring.",
    mods: { mul: { food: 1.1 }, growth: 1.08 },
  },
  oldcaptain: {
    name: "Ranulf Stint",
    title: "Held the line at somebody else's seat",
    when: { fields: 5 },
    face: "Grey, scarred, and entirely done with being in charge of anything.",
    text: "He commanded for somebody else for thirty years and watched it come apart in one afternoon. He does not want a warband and will not take one. He wants a stool near the fire and to be asked, occasionally, what he thinks — and what he thinks is usually right, and always half an hour before anybody else thinks it.",
    took: "He takes a stool by the fire and is asked.",
    mods: { xp: 1, loyalGain: 1.12, hall: 1 },
  },
};

export const RETAINER_IDS = Object.keys(RETAINERS);

/* Everything the household is worth, in the shape courtCommand and
   courtLedger already know how to fold. */
export function householdMods(ids) {
  const out = { mul: {} };
  (ids || []).forEach((id) => {
    const r = RETAINERS[id];
    if (!r) return;
    Object.entries(r.mods || {}).forEach(([k, v]) => {
      if (k === "mul") Object.entries(v).forEach(([m, x]) => { out.mul[m] = (out.mul[m] || 1) * x; });
      else if (k === "scout" || k === "relief" || k === "xp" || k === "hall" || k === "accordEase" || k === "regardDrift") {
        out[k] = (out[k] || 0) + v;
      } else out[k] = (out[k] || 1) * v;
    });
  });
  return out;
}

/* What a retainer is worth, said in the words the rest of the court screen
   uses. Written out rather than generated so each one reads like a sentence. */
const WORDS = {
  dealt: (v) => [`the line deals ${pc(v)}`, v > 1],
  taken: (v) => [`the line takes ${pc(v)}`, v < 1],
  morale: (v) => [`nerve holds ${pc(v)}`, v > 1],
  storm: (v) => [`storming a wall ${pc(v)}`, v > 1],
  waste: (v) => [`wastage on the road ${pc(v)}`, v < 1],
  draw: (v) => [`rations on the road ${pc(v)}`, v < 1],
  chase: (v) => [`a broken host is ridden down ${pc(v)}`, v > 1],
  siege: (v) => [`a siege bites ${pc(v)}`, v > 1],
  garrison: (v) => [`men on a wall hold ${pc(v)}`, v > 1],
  regardGain: (v) => [`what is thought of you moves ${pc(v)}`, v > 1],
  growth: (v) => [`the wards grow ${pc(v)}`, v > 1],
  loyalGain: (v) => [`captains hold their loyalty ${pc(v)}`, v > 1],
};
const pc = (v) => `${v > 1 ? "+" : "−"}${Math.round(Math.abs(v - 1) * 100)}%`;

export function retainerChips(id) {
  const r = RETAINERS[id];
  if (!r) return [];
  const out = [];
  Object.entries(r.mods || {}).forEach(([k, v]) => {
    if (k === "mul") {
      Object.entries(v).forEach(([m, x]) => out.push({
        t: `${m === "men" ? "recruits" : m === "food" ? "rations" : m} ${pc(x)}`, good: x > 1 }));
    } else if (k === "scout") out.push({ t: `eyes +${v}`, good: true });
    else if (k === "relief") out.push({ t: `supply reaches +${v}`, good: true });
    else if (k === "xp") out.push({ t: `companies learn +${v} a field`, good: true });
    else if (k === "hall") out.push({ t: `${v} more waiting in the hall`, good: true });
    else if (k === "accordEase") out.push({ t: `accords come ${v} easier`, good: true });
    else if (WORDS[k]) { const [t, good] = WORDS[k](v); out.push({ t, good }); }
  });
  return out;
}

/* Who would come to this realm right now: the first retainer whose reason has
   happened, who has not come before and has not been let go. One at a time —
   a hall that fills three deep in one season is a list, not a household. */
export function retainerDue(nat, tally) {
  if ((nat.household || []).length >= HOUSEHOLD_SLOTS) return null;
  const seen = [...(nat.household || []), ...(nat.household_gone || [])];
  return RETAINER_IDS.find((id) => {
    if (seen.includes(id)) return false;
    const w = RETAINERS[id].when || {};
    return Object.entries(w).every(([k, v]) => (tally[k] || 0) >= v);
  }) || null;
}
