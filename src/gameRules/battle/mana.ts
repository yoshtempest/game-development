import type { EquipmentRank } from "@/utils/types/player/equipment";
import { loadEquipped } from "@/data/equipment/storage";
import { getEquipmentById } from "@/data/equipment";
import { eachEquippedItem } from "@/gameRules/battle/equipment/stats/eachEquippedItem";

export const MAX_MANA_BASE = 100;

/**
 * Energia máxima ganha por ponto de Espírito. Espírito também dá dano mágico,
 * então o valor é de propósito modesto — energia é o recurso que decide quantas
 * habilidades continuam válidas numa luta longa.
 */
export const MAX_MANA_PER_SPIRIT_POINT = 5;
export const YVEL_WEAPON_SWITCH_MANA_COST = 50;
export const MANA_REGEN_PER_SECOND = 1;

/**
 * Palavras-chave usadas pela regra genérica de mana: qualquer equipamento
 * (cajado na mão, pingente no slot) cujo nome contenha uma delas concede
 * mana pelo valor do rank.
 */
const MANA_KEYWORDS = ["cajado", "mago", "arquimago", "pingente"] as const;

const MANA_BONUS_BY_RANK: Partial<Record<EquipmentRank, number>> = {
  1: 5,
  2: 8,
  3: 10,
  4: 12,
  5: 15,
  6: 18,
  7: 20,
  8: 25,
  9: 30,
  0: 35,
  EX: 40,
};

export function getManaBonusFromEquipment(character: CharacterId): number {
  let total = 0;
  for (const info of eachEquippedItem(loadEquipped(character))) {
    const def = getEquipmentById(info.id);
    if (!def) continue;
    const name = def.name.toLowerCase();
    if (!MANA_KEYWORDS.some((keyword) => name.includes(keyword))) continue;
    total += MANA_BONUS_BY_RANK[def.rank] ?? 0;
  }
  return total;
}

/**
 * `spirit` é obrigatório de propósito: quando Espírito virou stat de menu,
 * esquecer de repassá-lo aqui devolveria o pool antigo em silêncio e o jogador
 * veria a barra de energia não acompanhar o status.
 */
export function getMaxMana(character: CharacterId, spirit: number): number {
  return (
    MAX_MANA_BASE +
    getManaBonusFromEquipment(character) +
    Math.max(0, spirit) * MAX_MANA_PER_SPIRIT_POINT
  );
}

/**
 * Personagens que exibem barra de mana genérica. Exceção: o marshadow usa a
 * barra de energia de fluxo (carregada ao caminhar, ver useEnergy.ts) no
 * lugar do mana — e esta barra não deve aparecer em duelos a seu lado.
 */
export function hasManaBar(character: CharacterId): boolean {
  return character !== "marshadow";
}

export function getEnergyName(character: CharacterId): string {
  if (character === "natsuki") return "Energia Amaldiçoada";
  if (character === "ematron") return "Ki";
  if (character === "babidi") return "Energia Dimensional";
  return "Mana";
}
