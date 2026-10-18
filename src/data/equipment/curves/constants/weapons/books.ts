// Livro (espírito + cooldown)
const BOOK_SPIRIT: ByRank = {
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
const BOOK_SHIELD: ByRank = {
  1: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 4,
  9: 5,
  0: 6,
  EX: 8,
};
const BOOK_CDR: ByRank = {
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 4,
  0: 5,
  EX: 6,
};
const BOOK_TRUE: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 1,
  7: 1,
  8: 2,
  9: 2,
  0: 3,
  EX: 4,
};
const BOOK_MAX_HP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 1,
  8: 1,
  9: 2,
  0: 3,
  EX: 4,
};

export const BOOKS = {
  MAX_HP: BOOK_MAX_HP,
  TRUE: BOOK_TRUE,
  CDR: BOOK_CDR,
  SHIELD: BOOK_SHIELD,
  SPIRIT: BOOK_SPIRIT,
};