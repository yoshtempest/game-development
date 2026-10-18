type DropConfig = {
  baseChance: number;
  rankWeights: Record<EquipmentRank, number>;
};

/**
 * Tabela de rank por classe de NPC para DROPS DE BATALHA.
 *
 * Ranks 0 (Transcendente) e EX nunca entram aqui: eles são exclusivos de
 * baús lendários ou melhores (ver `CHEST_DROP_TABLES`). As sobras de peso
 * deles foram redistribuídas para o rank 9 — antes ficavam em massas mortas
 * que o `rollEquipmentDrops` descartava, o que também fazia rank 0 vazar
 * (o gate antigo era `rank >= 9`, e 0 < 9).
 */
export const DROP_CONFIG: Record<NPCClass, DropConfig> = {
  common: {
    baseChance: 0.08,
    rankWeights: {
      1: 50,
      2: 30,
      3: 13,
      4: 5,
      5: 2,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      0: 0,
      EX: 0,
    },
  },

  rare: {
    baseChance: 0.12,
    rankWeights: {
      1: 15,
      2: 30,
      3: 25,
      4: 15,
      5: 10,
      6: 4,
      7: 1,
      8: 0,
      9: 0,
      0: 0,
      EX: 0,
    },
  },

  epic: {
    baseChance: 0.18,
    rankWeights: {
      1: 5,
      2: 10,
      3: 20,
      4: 20,
      5: 20,
      6: 12,
      7: 8,
      8: 4,
      9: 1,
      0: 0,
      EX: 0,
    },
  },

  boss: {
    baseChance: 0.25,
    rankWeights: {
      1: 0,
      2: 5,
      3: 10,
      4: 15,
      5: 20,
      6: 18,
      7: 15,
      8: 12,
      9: 5,
      0: 0,
      EX: 0,
    },
  },

  legendary: {
    baseChance: 0.32,
    rankWeights: {
      1: 0,
      2: 0,
      3: 2,
      4: 5,
      5: 10,
      6: 15,
      7: 20,
      8: 18,
      9: 30,
      0: 0,
      EX: 0,
    },
  },

  supreme: {
    baseChance: 0.4,
    rankWeights: {
      1: 0,
      2: 0,
      3: 0,
      4: 2,
      5: 5,
      6: 10,
      7: 15,
      8: 20,
      9: 48,
      0: 0,
      EX: 0,
    },
  },

  omega: {
    baseChance: 0.5,
    rankWeights: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 2,
      6: 5,
      7: 10,
      8: 15,
      9: 68,
      0: 0,
      EX: 0,
    },
  },
};

/**
 * Chance por slot de equipamento por kill, por classe. O loop de drops
 * faz um roll independente por slot (7 slots), então o total esperado por
 * kill é ~7× este número. Os valores caíram ~50% em relação à versão
 * anterior (0.15→1.0), que dava ~1 item por mob comum e ~7 por omega —
 * com o catálogo ~5× maior, a diluição por item específico já cuida do
 * resto.
 */
const SLOT_CHANCE: Record<NPCClass, number> = {
  common: 0.08,
  rare: 0.12,
  epic: 0.18,
  boss: 0.25,
  legendary: 0.32,
  supreme: 0.4,
  omega: 0.5,
};

const RANKS: EquipmentRank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "EX"];

function pickWeighted(weights: Record<EquipmentRank, number>): EquipmentRank {
  let total = 0;
  for (const r of RANKS) {
    total += weights[r];
  }
  if (total <= 0) return 1;

  let roll = Math.random() * total;
  for (const rank of RANKS) {
    roll -= weights[rank];
    if (roll <= 0) return rank;
  }

  return 1;
}

export function rollDrop(npcClass: NPCClass): EquipmentRank | null {
  const config = DROP_CONFIG[npcClass];
  if (!config) return null;

  if (Math.random() > config.baseChance) return null;

  const totalWeight = Object.values(config.rankWeights).reduce(
    (a, b) => a + b,
    0,
  );
  if (totalWeight <= 0) return null;

  return pickWeighted(config.rankWeights);
}

export function rollSlotDrop(
  npcClass: NPCClass,
  luckBonus: number,
): EquipmentRank | null {
  const config = DROP_CONFIG[npcClass];
  if (!config) return null;

  if (Math.random() > SLOT_CHANCE[npcClass] + luckBonus) return null;

  return pickWeighted(config.rankWeights);
}

export function getDropChanceText(npcClass: NPCClass): string {
  const config = DROP_CONFIG[npcClass];
  if (!config) return "0%";

  return `${(config.baseChance * 100).toFixed(0)}%`;
}
