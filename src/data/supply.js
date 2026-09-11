/* --------------------------------- SUPPLY ----------------------------------
   A warband eats whether or not it is doing anything, and it eats a great deal
   more when the carts have further to come. Supply is measured in hexes: how
   far the nearest ground you actually hold is from where the companies are
   standing, traced only through ground nobody else holds — somebody else's
   territory does not carry your rations.

   Standing at home is the baseline. One hex over the line already costs half
   again, because everything out there has to be carried out to them. Two hexes
   is as far as a cart goes and comes back, and it costs more than twice what
   it does at home. Past that there is no line at all: they are eating what is
   on the waggons, and the waggons are going down.

   The point of the table is that a long campaign should be a decision, not a
   drift. Marching four hexes into somebody else's country with eight companies
   is not expensive — it is ruinous, and it should read that way before you go.
   ------------------------------------------------------------------------ */

// Anything this far out is simply cut off; there is no deeper band.
export const SUPPLY_MAX = 4;

export const SUPPLY_BANDS = [
  { d: 0, name: "In supply", tone: "good",
    note: "Standing on your own ground. Everything they eat is already here.",
    draw: 1, waste: 0, morale: 0 },
  { d: 1, name: "Over the line", tone: "warn",
    note: "A hex past your border. Every ration has to be carried out to them.",
    draw: 1.5, waste: 0, morale: 0 },
  { d: 2, name: "The end of the line", tone: "warn",
    note: "As far as a cart goes and comes back. They can be kept out here, at a price.",
    draw: 2.4, waste: 0, morale: 0 },
  { d: 3, name: "Off the waggons", tone: "bad",
    note: "Past the reach of any supply line. They are living on what they carried, and losing men to it.",
    draw: 3.6, waste: 0.06, morale: 6 },
  { d: 4, name: "Cut off", tone: "bad",
    note: "Nothing is reaching them at all. Every season out here costs companies and nerve.",
    draw: 5, waste: 0.11, morale: 11 },
];

export const bandAt = (d) => SUPPLY_BANDS[Math.max(0, Math.min(SUPPLY_MAX, d))];

/* Ground that makes a long line worse: nothing grows on it, nothing can be
   bought on it, and hauling anything across it costs twice what the map says. */
export const HARD_GROUND = { m: 1.5, g: 1.6, t: 1.3, c: 1.2 };

// A season of winter on the end of a supply line is not the same as a season
// of summer on it.
export const WINTER_WASTE = 1.5;

// How far the carts a warband drags with it, and the advance that teaches a
// realm to keep a road open, pull that distance back in.
export const CART_RELIEF_CAP = 2;
export const QUARTER_RELIEF = 1;
export const QUARTER_EASE = 0.5;
