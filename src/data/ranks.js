/* ---------------------------------- RANKS ----------------------------------
   A company is not the same company after five fields. Experience is counted
   in fields stood in — not men killed, because a company that held a quiet
   flank all afternoon learned the same lesson about standing still under
   arrows as one in the centre did.

   Six rungs. The steps grow: the difference between Raw and Blooded is
   somebody who has heard the noise before, and the difference between
   Veteran and Elder is a company that decides how a field goes. The top is
   about a quarter better than the bottom, which is enough to matter and not
   enough to win a war on its own — the point of a veteran company is that
   losing it hurts.
   ------------------------------------------------------------------------ */
export const RANKS = [
  { n: 0, name: "Raw",      at: 0,  dealt: 1,    def: 0, morale: 1,    desc: "They have been issued a spear and told which end." },
  { n: 1, name: "Blooded",  at: 1,  dealt: 1.04, def: 1, morale: 0.98, desc: "They have stood in a line once and found out what it sounds like." },
  { n: 2, name: "Seasoned", at: 3,  dealt: 1.09, def: 2, morale: 0.95, desc: "Three fields. They know when to close and when to hold." },
  { n: 3, name: "Hardened", at: 6,  dealt: 1.14, def: 3, morale: 0.92, desc: "Six fields. Nothing that happens on one surprises them any more." },
  { n: 4, name: "Veteran",  at: 10, dealt: 1.19, def: 4, morale: 0.88, desc: "Ten fields. The companies beside them steady up just from seeing the standard." },
  { n: 5, name: "Elder",    at: 15, dealt: 1.25, def: 6, morale: 0.84, desc: "Fifteen fields. There are not many of these left anywhere, and everyone knows their name." },
];

export const rankOf = (xp) => {
  let r = RANKS[0];
  RANKS.forEach((x) => { if ((xp || 0) >= x.at) r = x; });
  return r;
};
export const nextRank = (xp) => RANKS.find((x) => x.at > (xp || 0)) || null;
export const MAX_RANK = RANKS[RANKS.length - 1];

/* What a field is worth. Standing in the line is the lesson; winning it and
   being in a sector that was actually fought over are worth a little more. */
export const XP_FIELD = 1;
export const XP_WON = 1;
