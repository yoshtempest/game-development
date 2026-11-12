import { soundEffectPath, transitionPath } from "@/utils/paths";

import { STATUS_LIST } from "@/gameRules/battle/status/statusEffects";

import { POTION_CONFIG } from "@/utils/buffs/xpBuff";
import type { PlayerStatus } from "@/utils/types/battle/status";

/** Fome restaurada por comida. */
export const FOOD_RESTORE: Record<string, number> = {
  queijo_cabra: 30,
  porcao_arroz: 20,
  ovo_piupiu: 25,
};

/** Bebidas energéticas: foco em recuperar sono, enchendo pouco a fome. */
export const ENERGETIC_RESTORE: Record<
  string,
  { hunger: number; sleep: number }
> = {
  cafe: { hunger: 5, sleep: 35 },
  energetico: { hunger: 6, sleep: 50 },
  whey_protein: { hunger: 20, sleep: 15 },
  creatina: { hunger: 12, sleep: 10 },
  coca_cola: { hunger: 10, sleep: 25 },
};

/** Mana restaurada por poção (use em batalha). */
export const MANA_RESTORE: Record<string, number> = {
  mana_potion_small: 50,
  mana_potion_great: 100,
};

/**
 * Fração da vida máxima que a poção de cura devolve. Proporcional (e não
 * absoluta) para continuar relevante conforme a vida cresce com o nível.
 */
export const HEALING_POTION_HEAL_RATIO = 0.3;

/** Poções de cura: fração da vida máxima restaurada (batalha ou exploração). */
export const HEAL_RESTORE: Record<string, number> = {
  healing_potion: HEALING_POTION_HEAL_RATIO,
};

/** Quanto tempo a imunidade de uma poção de resistência dura. */
export const STATUS_RESISTANCE_DURATION_MS = 60_000;

/**
 * Poções de resistência: status que cada uma cura e contra os quais deixa o
 * player imune por `STATUS_RESISTANCE_DURATION_MS`. A imunidade é aplicada
 * em `applyPlayerStatus`, o ponto único de entrada de status.
 */
export const STATUS_RESISTANCE: Record<string, readonly PlayerStatus[]> = {
  assopra: ["burn"],
  cha_camomila: ["poison"],
  beterraba: ["bleed"],
  freeze_resistance: ["freeze"],
  paralyze_resistance: ["paralyze"],
  all_resistance: STATUS_LIST,
};

export const GOOD_POWDER_ENCOUNTERS = [
  { npcType: "vandinhaFragment", route: "/battle/vandinhafragment" },
  { npcType: "hungryDeath", route: "/battle/hungry" },
  { npcType: "jhowsimar", route: "/battle/jhowsimar" },
  { npcType: "goat", route: "/battle/goat" },
] as const;

export function rollEncounter() {
  const roll = Math.random() * 100;

  if (roll < 1) return GOOD_POWDER_ENCOUNTERS[0];
  if (roll < 90) return GOOD_POWDER_ENCOUNTERS[1];
  if (roll < 95) return GOOD_POWDER_ENCOUNTERS[2];
  return GOOD_POWDER_ENCOUNTERS[3];
}

export type ItemAction =
  | { kind: "encounter"; sfxSrc: string }
  | { kind: "openMap"; sfxSrc: string }
  | { kind: "xpPotion"; sfxSrc: string }
  | { kind: "food"; restore: number; sfxSrc: string }
  | { kind: "energetic"; hunger: number; sleep: number; sfxSrc: string };

const SFX = {
  encounter: transitionPath("undertaleToBattle.mp3"),
  openMap: transitionPath("openMap.mp3"),
  potion: soundEffectPath("player/drinkingPotion.mp3"),
  eating: soundEffectPath("player/eating.mp3"),
} as const;

/**
 * Tabela declarativa de efeitos por item. Comida é derivada de
 * FOOD_RESTORE; poções de XP, de POTION_CONFIG. Itens sem entrada aqui
 * não são utilizáveis.
 */
export const ITEM_ACTIONS: Partial<Record<ItemId, ItemAction>> = {
  good_powder: { kind: "encounter", sfxSrc: SFX.encounter },
  jorjao_map: { kind: "openMap", sfxSrc: SFX.openMap },

  ...Object.fromEntries(
    Object.keys(POTION_CONFIG).map((id) => [
      id,
      { kind: "xpPotion", sfxSrc: SFX.potion } satisfies ItemAction,
    ]),
  ),

  ...Object.fromEntries(
    Object.entries(FOOD_RESTORE).map(([id, restore]) => [
      id,
      { kind: "food", restore, sfxSrc: SFX.eating } satisfies ItemAction,
    ]),
  ),

  ...Object.fromEntries(
    Object.entries(ENERGETIC_RESTORE).map(([id, restore]) => [
      id,
      {
        kind: "energetic",
        ...restore,
        sfxSrc: SFX.potion,
      } satisfies ItemAction,
    ]),
  ),
};

export function getItemAction(itemId: ItemId): ItemAction | null {
  return ITEM_ACTIONS[itemId] ?? null;
}
