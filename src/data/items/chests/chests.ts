import { CRAFT_MATERIALS } from "@/data/items/crafting";
import { ITEMS } from "@/data/items";
import { getEquipmentBySlotAndRank } from "@/data/equipment";
import { PETS } from "@/data/equipment/pets";
import type { EquipmentRank } from "@/utils/types/player/equipment";

type ChestDropTable = {
  materialWeights: Record<string, number>;
  equipmentRankWeights: Record<EquipmentRank, number>;
  petDropChance: number;
};

export const CHEST_DROP_TABLES: Record<NPCClass, ChestDropTable> = {
  common: {
    materialWeights: {
      hungry_essence: 70,
      figurant_totem: 30,
      xp_potion_common: 15,
    },
    equipmentRankWeights: {
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
    petDropChance: 0.01,
  },
  rare: {
    materialWeights: { rare_scale: 60, goat_horn: 40, xp_potion_rare: 12 },
    equipmentRankWeights: {
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
    petDropChance: 0.03,
  },
  epic: {
    materialWeights: { epic_core: 100, xp_potion_epic: 10 },
    equipmentRankWeights: {
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
    petDropChance: 0.07,
  },
  boss: {
    materialWeights: { boss_soul: 100, xp_potion_boss: 8 },
    equipmentRankWeights: {
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
    petDropChance: 0.12,
  },
  legendary: {
    materialWeights: { legendary_fragment: 100, xp_potion_legendary: 5 },
    equipmentRankWeights: {
      1: 0,
      2: 0,
      3: 2,
      4: 5,
      5: 10,
      6: 15,
      7: 20,
      8: 18,
      9: 15,
      0: 10,
      EX: 5,
    },
    petDropChance: 0.2,
  },
  supreme: {
    materialWeights: {
      boss_soul: 60,
      legendary_fragment: 100,
      xp_potion_legendary: 5,
    },
    equipmentRankWeights: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 5,
      6: 10,
      7: 15,
      8: 20,
      9: 25,
      0: 15,
      EX: 10,
    },
    petDropChance: 0.3,
  },
  omega: {
    materialWeights: {
      legendary_fragment: 100,
      xp_potion_legendary: 10,
    },
    equipmentRankWeights: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 5,
      7: 10,
      8: 15,
      9: 25,
      0: 25,
      EX: 20,
    },
    petDropChance: 0.5,
  },
};

export type ChestDropResult = {
  materials: Array<{ id: string; name: string; qty: number }>;
  equipment: Array<{
    id: EquipmentId;
    name: string;
    slot: EquipmentSlot;
    rank: EquipmentRank;
    enhance: number;
  }>;
  pets: Array<{
    id: EquipmentId;
    name: string;
    slot: EquipmentSlot;
    rank: EquipmentRank;
    enhance: number;
  }>;
};

const SLOTS = [
  "weapon",
  "helmet",
  "chestplate",
  "pants",
  "boots",
  "accessory",
  "bag",
] as const;

function pickWeighted<K extends string | number>(
  weights: Record<K, number>,
): K | null {
  const entries = Object.entries(weights) as [K, number][];
  const positive = entries.filter(([, w]) => w > 0);
  if (positive.length === 0) return null;
  const total = positive.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of positive) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return positive[positive.length - 1]![0];
}

/**
 * Sorteia o conteúdo de um baú.
 *
 * Materiais são acumulados por id em vez de virar uma entrada por
 * sorteio. Como o baú faz de 4 a 9 sorteios sobre uma tabela de 2 ou 3
 * materiais, repetir é o caso normal — em amostragem de 10 mil baús,
 * 96% a 99% deles repetem pelo menos um id. Uma entrada por sorteio
 * fazia a tela de recompensa listar o mesmo material várias vezes com
 * quantidades parciais, e colidia a key do React, que usa o id.
 *
 * Ranks 0 (Transcendente) e EX só saem de baús lendários ou melhores —
 * em baús inferiores a tabela deles é ignorada (antes só o baú "legendary"
 * liberava, e supreme/omega tinham 25%–45% do peso da tabela virando
 * massa morta).
 */
export function openChest(
  chestTier: NPCClass,
  petChance?: number,
): ChestDropResult {
  const table = CHEST_DROP_TABLES[chestTier];
  const dropCount = Math.floor(Math.random() * 6) + 4;
  const result: ChestDropResult = { materials: [], equipment: [], pets: [] };
  const materialsById = new Map<string, ChestDropResult["materials"][number]>();

  const addMaterial = (id: string, name: string, qty: number) => {
    const existing = materialsById.get(id);
    if (existing) {
      existing.qty += qty;
      return;
    }
    const entry = { id, name, qty };
    materialsById.set(id, entry);
    result.materials.push(entry);
  };

  for (let i = 0; i < dropCount; i++) {
    const isMaterial = Math.random() < 0.75;

    if (isMaterial) {
      const matId = pickWeighted(table.materialWeights);
      if (matId) {
        const craftDef = CRAFT_MATERIALS[matId as keyof typeof CRAFT_MATERIALS];
        const qty = Math.floor(Math.random() * 3) + 1;
        if (craftDef) {
          addMaterial(craftDef.id, craftDef.name, qty);
        } else {
          const itemDef = ITEMS[matId as keyof typeof ITEMS];
          if (itemDef) {
            addMaterial(matId, itemDef.name, qty);
          }
        }
      }
    } else {
      const rank = pickWeighted(table.equipmentRankWeights);
      // `rank === null` explícito: `!rank` engoliria o rank 0 (Transcendente).
      if (rank === null) continue;

      // Rank 0/EX só de baú lendário ou melhor (ver JSDoc de openChest).
      const canDropTopRank =
        chestTier === "legendary" ||
        chestTier === "supreme" ||
        chestTier === "omega";
      if (!canDropTopRank && (rank === "EX" || rank === 0)) continue;

      const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)]!;
      const candidates = getEquipmentBySlotAndRank(slot, rank).filter(
        (e) => !e.craftOnly,
      );
      if (candidates.length === 0) continue;

      const equip = candidates[Math.floor(Math.random() * candidates.length)]!;
      const enhance = Math.floor(Math.random() * 6);
      result.equipment.push({
        id: equip.id,
        name: equip.name,
        slot: equip.slot,
        rank: equip.rank,
        enhance,
      });
    }
  }

  const chance = petChance ?? table.petDropChance;
  if (chance > 0 && Math.random() < chance) {
    const pet = PETS[Math.floor(Math.random() * PETS.length)]!;
    result.pets.push({
      id: pet.id,
      name: pet.name,
      slot: pet.slot,
      rank: pet.rank,
      enhance: 0,
    });
  }

  return result;
}
