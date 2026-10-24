// Arco (técnica)
const BOW_TEC: ByRank = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 4,
  6: 4,
  7: 5,
  8: 6,
  9: 7,
  0: 8,
  EX: 10,
};
const BOW_STR: ByRank = {
  1: 1,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  0: 5,
  EX: 6,
};
const BOW_TRUE: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
  0: 3,
  EX: 4,
};
const BOW_MAX_HP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
  0: 2,
  EX: 3,
};

export const BOWS = {
  MAX_HP: BOW_MAX_HP,
  TRUE: BOW_TRUE,
  STR: BOW_STR,
  TEC: BOW_TEC,
};
