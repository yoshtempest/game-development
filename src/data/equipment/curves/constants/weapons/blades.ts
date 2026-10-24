// ── Armas por subtipo ──

// Lamina (força)
const BLADE_STR: ByRank = {
  1: 2,
  2: 2,
  3: 3,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 5,
  9: 6,
  0: 7,
  EX: 9,
};
const BLADE_TEC: ByRank = {
  1: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 4,
  9: 4,
  0: 5,
  EX: 6,
};
const BLADE_VAMP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 1,
  5: 1,
  6: 1,
  7: 2,
  8: 2,
  9: 3,
  0: 4,
  EX: 5,
};
const BLADE_TRUE: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 2,
  8: 2,
  9: 3,
  0: 4,
  EX: 5,
};
const BLADE_MAX_HP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
  0: 3,
  EX: 4,
};

export const BLADES = {
  MAX_HP: BLADE_MAX_HP,
  TRUE: BLADE_TRUE,
  STR: BLADE_STR,
  VAMP: BLADE_VAMP,
  TEC: BLADE_TEC,
};
