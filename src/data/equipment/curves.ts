import type {
  EquipmentRank,
  EquipmentStats,
} from "@/utils/types/player/equipment";

/**
 * Curvas de status do equipamento, por rank (1–9, 0 = Transcendente, EX = Divino).
 *
 * Cada tipo de item tem 3 "perfis" por rank — são os três itens mínimos exigidos
 * por rank. Os perfis dão identidade sem inflar poder: um item "puro" no stat
 * principal, um "encorpado" (troca parte do principal por vida) e um "técnico"
 * (troca parte do principal por stat ofensivo/secundário).
 *
 * A progressão é granular (r2/r4/r6/r8 preenchem os vãos entre os ranks ímpares
 * clássicos) e o teto dos ranks novos (0 e EX) cresce devagar para não jogar o
 * power creep para cima do conteúdo existente.
 */

// ── Tabelas base ──

type ByRank = Record<EquipmentRank, number>;

/** Armadura-base por slot de armadura (perfil "guardião" = valor cheio). */
export const ARMOR_CURVE: Record<
  "helmet" | "chestplate" | "pants" | "boots",
  ByRank
> = {
  helmet: {
    1: 2,
    2: 3,
    3: 4,
    4: 6,
    5: 8,
    6: 10,
    7: 13,
    8: 16,
    9: 20,
    0: 25,
    EX: 31,
  },
  chestplate: {
    1: 4,
    2: 5,
    3: 7,
    4: 9,
    5: 12,
    6: 15,
    7: 19,
    8: 24,
    9: 30,
    0: 37,
    EX: 45,
  },
  pants: {
    1: 2,
    2: 3,
    3: 4,
    4: 6,
    5: 8,
    6: 10,
    7: 13,
    8: 16,
    9: 20,
    0: 25,
    EX: 31,
  },
  boots: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 6,
    6: 8,
    7: 10,
    8: 13,
    9: 16,
    0: 20,
    EX: 25,
  },
};

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

// ── Armaduras (capacete, colete, calça, botas) ──

export type ArmorFlavor = "guardiao" | "robusto" | "agil";

/**
 * Estatísticas de uma peça de armadura.
 * - `guardiao`: armadura cheia, sem bônus.
 * - `robusto`: ~80% da armadura + vida.
 * - `agil`: ~60% da armadura + meia vida + técnica.
 * Reflexo (rank 6+) entra em todos os perfis — nas peças antigas era padrão.
 */
export function armorStats(
  slot: "helmet" | "chestplate" | "pants" | "boots",
  rank: EquipmentRank,
  flavor: ArmorFlavor,
): Partial<EquipmentStats> {
  const base = ARMOR_CURVE[slot][rank];
  const reflect = PIECE_REFLECT[rank];
  if (flavor === "guardiao") {
    return { armor: base, ...(reflect > 0 ? { reflect } : {}) };
  }
  if (flavor === "robusto") {
    return {
      armor: Math.round(base * 0.8),
      hp: PIECE_HP[rank],
      ...(reflect > 0 ? { reflect } : {}),
    };
  }
  return {
    armor: Math.round(base * 0.6),
    hp: Math.max(1, Math.ceil(PIECE_HP[rank] / 2)),
    technique: PIECE_TECHNIQUE[rank],
    ...(reflect > 0 ? { reflect } : {}),
  };
}

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

export type AccessoryFlavor = "guerreiro" | "arcano" | "nomade";

/**
 * Acessórios — três perfis:
 * - `guerreiro`: força + técnica (anel do guerreiro).
 * - `arcano`: espírito (pingente/colar do conjurador).
 * - `nomade`: defesa e cooldown puros, sem stat ofensivo.
 * Todos levam vida + escudo + CDR em escalas menores.
 */
export function accessoryStats(
  rank: EquipmentRank,
  flavor: AccessoryFlavor,
): Partial<EquipmentStats> {
  const hp = PIECE_HP[rank];
  const shield = ACCESSORY_SHIELD[rank];
  const cdr = ACCESSORY_CDR[rank];
  // O guerreiro usa a armadura cheia (é o anel de armadura dos ranks antigos);
  // os outros perfis dividem por 2 — o foco deles é outro.
  const baseArmor = ACCESSORY_ARMOR[rank];
  const armor = Math.max(1, Math.floor(baseArmor / 2));
  if (flavor === "guerreiro") {
    return {
      hp,
      shield,
      cooldownReduction: cdr,
      armor: baseArmor,
      strength: ACCESSORY_STR[rank],
      technique: ACCESSORY_TEC[rank],
    };
  }
  if (flavor === "arcano") {
    return {
      hp,
      shield,
      cooldownReduction: cdr,
      armor,
      spirit: ACCESSORY_SPIRIT[rank],
    };
  }
  return { hp, shield, cooldownReduction: cdr, armor };
}

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

export type BladeFlavor = "aco" | "sangue" | "cortante";

/** Lâminas: `aco` (força+técnica), `sangue` (força+vampirismo+dano verdadeiro), `cortante` (força+técnica+dano verdadeiro). */
export function bladeStats(
  rank: EquipmentRank,
  flavor: BladeFlavor,
): Partial<EquipmentStats> {
  const strength = BLADE_STR[rank];
  if (flavor === "aco") {
    return { strength, technique: BLADE_TEC[rank] };
  }
  if (flavor === "sangue") {
    return {
      strength,
      vampirism: BLADE_VAMP[rank],
      trueDamage: BLADE_TRUE[rank],
    };
  }
  return {
    strength,
    technique: BLADE_TEC[rank],
    trueDamage: BLADE_TRUE[rank],
    maxHpDamage: BLADE_MAX_HP[rank],
  };
}

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

export type BowFlavor = "longo" | "pontaria" | "perfurante";

/** Arcos: `longo` (técnica+força), `pontaria` (téc+força+dano verdadeiro), `perfurante` (téc+força+% vida máxima). */
export function bowStats(
  rank: EquipmentRank,
  flavor: BowFlavor,
): Partial<EquipmentStats> {
  const technique = BOW_TEC[rank];
  const strength = BOW_STR[rank];
  if (flavor === "longo") {
    return { technique, strength };
  }
  if (flavor === "pontaria") {
    return { technique, strength, trueDamage: BOW_TRUE[rank] };
  }
  return { technique, strength, maxHpDamage: BOW_MAX_HP[rank] };
}

// Cajado (espírito + escudo)
const STAFF_SPIRIT: ByRank = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
  9: 6,
  0: 7,
  EX: 9,
};
const STAFF_SHIELD: ByRank = {
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
const STAFF_STR: ByRank = {
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 2,
  9: 3,
  0: 3,
  EX: 4,
};
const STAFF_VAMP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 1,
  7: 2,
  8: 2,
  9: 3,
  0: 3,
  EX: 4,
};
const STAFF_TRUE: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 1,
  8: 2,
  9: 2,
  0: 3,
  EX: 4,
};
const STAFF_MAX_HP: ByRank = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
  0: 2,
  EX: 3,
};

export type StaffFlavor = "runico" | "real" | "ancestral";

/** Cajados: `runico` (espírito+escudo), `real` (espírito+força+vampirismo), `ancestral` (espírito+escudo+dano verdadeiro/% vida). */
export function staffStats(
  rank: EquipmentRank,
  flavor: StaffFlavor,
): Partial<EquipmentStats> {
  const spirit = STAFF_SPIRIT[rank];
  if (flavor === "runico") {
    return { spirit, shield: STAFF_SHIELD[rank] };
  }
  if (flavor === "real") {
    return { spirit, strength: STAFF_STR[rank], vampirism: STAFF_VAMP[rank] };
  }
  return {
    spirit,
    shield: STAFF_SHIELD[rank],
    trueDamage: STAFF_TRUE[rank],
    maxHpDamage: STAFF_MAX_HP[rank],
  };
}

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

export type BookFlavor = "erudito" | "selo" | "profecia";

/** Livros: `erudito` (espírito+cooldown), `selo` (espírito+escudo), `profecia` (espírito+dano verdadeiro/% vida). */
export function bookStats(
  rank: EquipmentRank,
  flavor: BookFlavor,
): Partial<EquipmentStats> {
  const spirit = BOOK_SPIRIT[rank];
  if (flavor === "erudito") {
    return { spirit, cooldownReduction: BOOK_CDR[rank] };
  }
  if (flavor === "selo") {
    return { spirit, shield: BOOK_SHIELD[rank] };
  }
  return {
    spirit,
    trueDamage: BOOK_TRUE[rank],
    maxHpDamage: BOOK_MAX_HP[rank],
  };
}

// ── Mochilas ──

/** Espaço de inventário por rank — r9 em diante é infinito (cosmético). */
const BAG_SLOTS: ByRank = {
  1: 20,
  2: 30,
  3: 40,
  4: 55,
  5: 70,
  6: 90,
  7: 100,
  8: 130,
  9: Infinity,
  0: Infinity,
  EX: Infinity,
};

export function bagBonusSlots(rank: EquipmentRank): number {
  return BAG_SLOTS[rank];
}
