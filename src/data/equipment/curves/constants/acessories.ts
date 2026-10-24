// ── Acessórios ──

const ACCESSORY_ARMOR: ByRank = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 7,
  7: 10,
  8: 12,
  9: 16,
  0: 19,
  EX: 24,
};
const ACCESSORY_SHIELD: ByRank = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 8,
  7: 12,
  8: 15,
  9: 20,
  0: 25,
  EX: 31,
};
const ACCESSORY_CDR: ByRank = {
  1: 5,
  2: 6,
  3: 8,
  4: 9,
  5: 10,
  6: 11,
  7: 12,
  8: 13,
  9: 15,
  0: 17,
  EX: 20,
};
const ACCESSORY_STR: ByRank = {
  1: 1,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 4,
  9: 5,
  0: 6,
  EX: 7,
};
const ACCESSORY_TEC: ByRank = {
  1: 0,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 3,
  9: 4,
  0: 5,
  EX: 6,
};
const ACCESSORY_SPIRIT: ByRank = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 5,
  0: 6,
  EX: 8,
};

export const ACCESSORIES = {
  ARMOR: ACCESSORY_ARMOR,
  SHIELD: ACCESSORY_SHIELD,
  CDR: ACCESSORY_CDR,
  STR: ACCESSORY_STR,
  TEC: ACCESSORY_TEC,
  SPIRIT: ACCESSORY_SPIRIT,
};
