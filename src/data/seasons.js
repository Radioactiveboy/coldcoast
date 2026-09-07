// Four turns to the year. What the land gives and how far a column can walk
// both turn with them.
export const SEASONS = [
  { id: "spring", name: "Spring", food: 1.15, scrap: 1.0,  men: 1.2,  move: 0,
    note: "Thaw and lambing. The wards are full and the ground is soft." },
  { id: "summer", name: "Summer", food: 1.3,  scrap: 1.15, men: 1.0,  move: 1,
    note: "Long light and hard roads. The best season to be marching." },
  { id: "autumn", name: "Autumn", food: 0.95, scrap: 1.1,  men: 0.9,  move: 0,
    note: "Harvest in, and everyone watching the sky." },
  { id: "winter", name: "Winter", food: 0.55, scrap: 0.85, men: 0.7,  move: -1,
    note: "Short days, hard ground, and rations going out faster than they come in." },
];
export const seasonOf = (turn) => SEASONS[(turn - 1) % 4];
export const yearOf = (turn) => Math.floor((turn - 1) / 4) + 1;
