import type {
  EquippedItems,
  EquippedItemInfo,
} from "@/utils/types/player/equipment";
import {
  createEmptyEquipped,
  EQUIPMENT_SLOTS,
} from "@/data/equipment/definitions";
import { isEquipmentId } from "@/data/equipment";
import { saveCompressed, loadCompressed } from "@/services/save/storageService";
import { slotKey } from "@/services/save/slotManager";
import { PET_CLASS } from "@/data/characters/pets/petProgress";

export type CharacterEquipmentData = {
  equipped: EquippedItems;
  collection: Record<string, number>;
};

const EQUIP_KEY = "jomasio_equipment";

export function colKey(id: string, enhance: number): string {
  return `${id}+${enhance}`;
}

function normalizePets(data: CharacterEquipmentData): CharacterEquipmentData {
  const collection: Record<string, number> = {};
  for (const [key, qty] of Object.entries(data.collection)) {
    const i = key.lastIndexOf("+");
    const id = i > 0 ? key.slice(0, i) : key;
    if (PET_CLASS[id]) {
      const baseKey = colKey(id, 0);
      collection[baseKey] = (collection[baseKey] ?? 0) + qty;
    } else {
      collection[key] = qty;
    }
  }

  const equipped = { ...data.equipped };
  if (equipped.pet && PET_CLASS[equipped.pet.id]) {
    equipped.pet = { id: equipped.pet.id, enhance: 0 };
  }

  return { equipped, collection };
}

function migrateEquipped(slot: unknown): EquippedItemInfo | null {
  let rawId = "";
  let enhance = 0;
  if (typeof slot === "string") {
    rawId = slot;
  } else if (typeof slot === "object" && slot !== null) {
    const s = slot as Record<string, unknown>;
    const raw = s.id;
    rawId = typeof raw === "string" ? raw : "";
    enhance = typeof s.enhance === "number" ? s.enhance : 0;
  }
  // Fronteira localStorage: descarta ids que não existem mais no banco.
  if (!isEquipmentId(rawId)) return null;
  return { id: rawId, enhance };
}

function createEmptyCharacterData(character?: string): CharacterEquipmentData {
  const equipped = createEmptyEquipped();
  const collection: Record<string, number> = {};

  if (character === "marshadow") {
    equipped.weapon = { id: "weapon_espada_ferro", enhance: 0 };
    collection[colKey("weapon_espada_ferro", 0)] = 1;
  }

  return { equipped, collection };
}

function migrateAllData(
  raw: Record<string, unknown>,
): Record<string, CharacterEquipmentData> {
  const result: Record<string, CharacterEquipmentData> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object") continue;
    const d = val as Record<string, unknown>;
    const equipped = createEmptyEquipped();
    const rawEquip = d.equipped as Record<string, unknown> | undefined;
    if (rawEquip) {
      for (const s of EQUIPMENT_SLOTS) {
        equipped[s] = migrateEquipped(rawEquip[s]);
      }
      if (Array.isArray(rawEquip.accessories)) {
        equipped.accessories = rawEquip.accessories
          .map((a: unknown) => migrateEquipped(a))
          .filter((a): a is EquippedItemInfo => a !== null);
      }
    }
    const collection: Record<string, number> = {};
    const rawCol = d.collection as Record<string, number> | undefined;
    if (rawCol) {
      for (const [k, qty] of Object.entries(rawCol)) {
        if (qty > 0) {
          if (k.includes("+")) {
            collection[k] = qty;
          } else {
            collection[colKey(k, 0)] = qty;
          }
        }
      }
    }
    result[key] = normalizePets({ equipped, collection });
  }
  return result;
}

function createEmptyAllData(): Record<string, CharacterEquipmentData> {
  return {};
}

export function loadAllData(): Record<string, CharacterEquipmentData> {
  try {
    const parsed = loadCompressed<Record<string, unknown>>(slotKey(EQUIP_KEY));
    if (!parsed) return createEmptyAllData();
    if (typeof parsed !== "object") return createEmptyAllData();
    const firstVal = Object.values(parsed)[0];
    if (firstVal && typeof firstVal === "object" && "equipped" in firstVal) {
      const equipped = (firstVal as Record<string, unknown>).equipped;
      if (equipped && typeof equipped === "object") {
        const sample = Object.values(equipped as Record<string, unknown>)[0];
        if (typeof sample === "string" || sample === null) {
          return migrateAllData(parsed);
        }
      }
    }
    const data = parsed as Record<string, CharacterEquipmentData>;
    for (const charData of Object.values(data)) {
      if (charData?.equipped && !Array.isArray(charData.equipped.accessories)) {
        charData.equipped.accessories = [];
      }
    }
    for (const key of Object.keys(data)) {
      const charData = data[key];
      if (charData) data[key] = normalizePets(charData);
    }
    return data;
  } catch {
    return createEmptyAllData();
  }
}

export function saveAllData(
  allData: Record<string, CharacterEquipmentData>,
): void {
  saveCompressed(slotKey(EQUIP_KEY), allData);
  // Quem escreve é este módulo; invalidar aqui cobre toda troca de equipamento.
  equippedCache = null;
}

/**
 * Cache de leitura do equipamento.
 *
 * `loadEquipped` roda em hot path de batalha (`getHalfHealReduction`,
 * `getEquippedResistances` no corpo do `useSystem`, `getManaBonusFromEquipment`
 * por item no loop da mana) e cada chamada pagava LZString + `JSON.parse` +
 * migração. O cache vale enquanto ninguém grava — equipamento não muda no
 * meio de uma luta — e é invalidado por chave de slot para não sobreviver a
 * troca de save.
 */
let equippedCache: Record<string, CharacterEquipmentData> | null = null;
let equippedCacheKey: string | null = null;

function loadAllDataCached(): Record<string, CharacterEquipmentData> {
  const key = slotKey(EQUIP_KEY);
  if (equippedCache === null || equippedCacheKey !== key) {
    equippedCache = loadAllData();
    equippedCacheKey = key;
  }
  return equippedCache;
}

export function loadEquipped(character: CharacterId): EquippedItems {
  try {
    const data = loadAllDataCached()[character];
    if (!data) return createEmptyEquipped();
    return {
      ...data.equipped,
      accessories: [...data.equipped.accessories],
    };
  } catch {
    return createEmptyEquipped();
  }
}

export function getCharacterData(
  all: Record<string, CharacterEquipmentData>,
  character: CharacterId,
): CharacterEquipmentData {
  if (!all[character]) {
    all[character] = createEmptyCharacterData(character);
  }
  return all[character];
}
