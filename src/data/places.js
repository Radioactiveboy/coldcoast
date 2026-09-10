/* ------------------------------- MAP NAMES ---------------------------------
   The names of the ground itself, as opposed to the names of places people
   live in — those are the LANDMARKS table. Geography is not a secret: a realm
   that has never sent anyone east still knows there is a steppe out there and
   what it is called, so these are drawn over the fog rather than under it.

   Positions are hex coordinates and were taken from the terrain itself — the
   centroid of the largest connected run of each class — rather than guessed,
   which is why the Alpine Wall sits on the Alps and not somewhere near them.
   `rot` tilts a name to follow what it names; `size` is its weight in the
   hierarchy, not just its height.
   ------------------------------------------------------------------------ */

export const MAP_NAMES = [
  // Water. What is left of it.
  { at: [21, 44], name: "The Northway", sea: true, size: 26, rot: -14 },
  { at: [87, 23], name: "The White Reach", sea: true, size: 21, rot: 6 },
  { at: [53, 130], name: "The Middle Sea", sea: true, size: 26, rot: -5 },
  { at: [91, 110], name: "The Black Basin", sea: true, size: 20, rot: 0 },
  { at: [66, 49], name: "The Balt", sea: true, size: 18, rot: -20 },
  { at: [97, 106], name: "The Caspian Sill", sea: true, size: 16, rot: 74 },

  // The ground the sea left behind.
  { at: [32, 64], name: "The Dogger Flats", size: 22, rot: -8 },
  { at: [18, 84], name: "The Narrow Floor", size: 16, rot: 20 },
  { at: [37, 141], name: "The Salt Pans", size: 18, rot: 0 },

  // Country.
  { at: [22, 70], name: "Albion", size: 20, rot: -12 },
  { at: [12, 67], name: "The Western Isle", size: 14, rot: -12 },
  { at: [62, 78], name: "The Great Plain", size: 22, rot: 4 },
  { at: [95, 80], name: "The Horse Sea", size: 24, rot: -6 },
  { at: [16, 124], name: "The Meseta", size: 20, rot: 8 },

  // The walls. Mountains read as barriers in this game and the names say so.
  { at: [44, 96], name: "The Alpine Wall", size: 18, rot: -8, ridge: true },
  { at: [26, 111], name: "The Pyrenean Wall", size: 15, rot: -4, ridge: true },
  { at: [73, 93], name: "The Carpath", size: 17, rot: -34, ridge: true },
  { at: [42, 37], name: "The Keel", size: 18, rot: -62, ridge: true },
  { at: [73, 11], name: "The Ice", size: 24, rot: 0, ice: true },
];
