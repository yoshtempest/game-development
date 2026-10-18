/** Vida em peças de armadura (perfil encorpado). */
const PIECE_HP: ByRank = {
  1: 1,
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

/** Reflexão passiva — só ranks altos, como nas peças antigas (r7/r9). */
const PIECE_REFLECT: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 1,
  7: 2,
  8: 2,
  9: 3,
  0: 4,
  EX: 5,
};

/** Técnica do perfil ágil (armadura com leve viés ofensivo). */
const PIECE_TECHNIQUE: ByRank = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 2,
  8: 3,
  9: 3,
  0: 4,
  EX: 5,
};

export const PIECES = {
  HP: PIECE_HP,
  REFLECT: PIECE_REFLECT,
  TECHNIQUE: PIECE_TECHNIQUE,
};