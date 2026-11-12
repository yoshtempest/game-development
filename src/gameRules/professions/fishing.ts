import { BAIT_EFFECTS } from "@/data/professions/baits";
import type { BaitId, BaitQuality } from "@/data/professions/baits";
import {
  getProfessionWeaponConfig,
  getProfessionWeaponTier,
} from "@/data/professions/weapons";
import type { ProfessionWeaponTierId } from "@/data/professions/weapons/types";

/**
 * Chance de o Leviathan subir numa pesca sem bônus nenhum (issue #40:
 * "0.5% de chance de pescar um Leviathan").
 */
export const LEVIATHAN_BASE_CHANCE = 0.005;

/**
 * Chance de vir um monstro quando o jogador pesca sem isca.
 * Decisão para revisar: as issues não definem esse número.
 */
export const FISHING_NO_BAIT_MONSTER_CHANCE = 0.2;

/**
 * Chance base de fisgar um pet em dia útil, antes de vara e fim de semana.
 * Decisão para revisar: a issue #40 só diz que o fim de semana dobra.
 */
export const FISHING_BASE_PET_CHANCE = 0.01;

/** Multiplicador da chance de pet de sábado 00:00 até o fim do domingo (issue #40). */
export const WEEKEND_PET_CHANCE_MULTIPLIER = 2;

/** Janela de espera até o peixe morder, em ms (issue #40: "varia de 2 a 7s"). */
export const FISHING_MIN_DURATION_MS = 2000;
export const FISHING_MAX_DURATION_MS = 7000;

/** Monstro comum que sobe quando o forte não sai. */
export const FISHING_COMMON_MONSTER: NpcType = "hungryFish";

/** Monstro forte da pesca — o que a isca melhor tenta atrair (issue #138). */
export const FISHING_STRONG_MONSTER: NpcType = "leviathan";

/**
 * Quanto cada qualidade de isca de batalha multiplica a chance do monstro
 * forte. Dobra por nível para que trocar de isca seja perceptível mesmo com a
 * base em 0.5%. Decisão para revisar.
 */
export const BAIT_QUALITY_STRONG_MULTIPLIER = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
} as const satisfies Record<BaitQuality, number>;

/**
 * Bônus da vara por ranque (issue #40: vara curta comum, média rara, grande
 * épica, "de cutucar estrela" lendária — o ranque Boss do sistema de armas de
 * profissão fica entre épico e lendário). Multiplica a chance do monstro forte
 * e a chance de pet. Decisão para revisar.
 */
export const FISHING_ROD_TIER_MULTIPLIER = {
  comum: 1,
  raro: 1.25,
  epico: 1.5,
  boss: 1.75,
  lendario: 2,
} as const satisfies Record<ProfessionWeaponTierId, number>;

export type FishingOutcome =
  | { kind: "resource" }
  | { kind: "monster"; npcType: NpcType; isStrong: boolean };

export type FishingRoll = {
  outcome: FishingOutcome;
  /** Pet fisgado junto; rolado à parte para não furar a garantia da isca. */
  petCaught: boolean;
  /** Quanto tempo a boia fica na água antes do resultado aparecer. */
  durationMs: number;
};

export type FishingRollInput = {
  baitId: BaitId | null;
  /** Arma equipada; só conta se for uma Vara de Pesca de algum ranque. */
  rodId: string | null;
  now: Date;
  /** Injetado para a rolagem ser reproduzível em replay/teste. */
  random?: () => number;
};

/**
 * Sábado e domingo inteiros, no fuso local do jogador — o mesmo relógio que
 * ele vê, que é o que "do sábado até o fim do domingo" quer dizer.
 */
export function isFishingWeekend(now: Date): boolean {
  const day = now.getDay();
  return day === 6 || day === 0;
}

/**
 * Ranque da vara equipada. Arma que não é Vara de Pesca devolve null: pescar
 * exige a vara, e uma arma de outra profissão não pode emprestar o ranque.
 */
export function getFishingRodTier(
  rodId: string | null,
): ProfessionWeaponTierId | null {
  if (!rodId) return null;
  if (getProfessionWeaponConfig(rodId)?.professionId !== "fisher") return null;
  return getProfessionWeaponTier(rodId);
}

function getRodMultiplier(rodId: string | null): number {
  const tier = getFishingRodTier(rodId);
  return tier ? FISHING_ROD_TIER_MULTIPLIER[tier] : 1;
}

/** Chance de pet com vara e fim de semana aplicados, limitada a 100%. */
export function getFishingPetChance(rodId: string | null, now: Date): number {
  const weekend = isFishingWeekend(now) ? WEEKEND_PET_CHANCE_MULTIPLIER : 1;
  return Math.min(
    1,
    FISHING_BASE_PET_CHANCE * getRodMultiplier(rodId) * weekend,
  );
}

/**
 * Chance de o monstro fisgado ser o forte. Sem isca vale a base da issue
 * (0.5%) escalada só pela vara; isca de recurso nunca traz monstro, então
 * a chance é zero.
 */
export function getStrongMonsterChance(
  baitId: BaitId | null,
  rodId: string | null,
): number {
  const rod = getRodMultiplier(rodId);
  if (!baitId) return Math.min(1, LEVIATHAN_BASE_CHANCE * rod);
  const effect = BAIT_EFFECTS[baitId];
  if (effect.kind === "resource") return 0;
  const quality = BAIT_QUALITY_STRONG_MULTIPLIER[effect.quality];
  return Math.min(1, LEVIATHAN_BASE_CHANCE * quality * rod);
}

/**
 * Chance de vir monstro (forte ou comum). A isca decide sozinha quando
 * existe — garantia é garantia, a vara não a altera.
 */
export function getFishingMonsterChance(baitId: BaitId | null): number {
  if (!baitId) return FISHING_NO_BAIT_MONSTER_CHANCE;
  return BAIT_EFFECTS[baitId].kind === "battle" ? 1 : 0;
}

/** Sorteia a espera da boia dentro da janela da issue #40. */
export function rollFishingDurationMs(
  random: () => number = Math.random,
): number {
  const span = FISHING_MAX_DURATION_MS - FISHING_MIN_DURATION_MS;
  return FISHING_MIN_DURATION_MS + Math.round(random() * span);
}

/**
 * Rola uma pescaria completa: o que sai do anzol, se veio pet junto e quanto
 * a boia demora.
 *
 * O Leviathan da issue #40 (0.5%) é tratado como um monstro, não como recurso
 * à parte: assim a isca de recurso o bloqueia e a de batalha o favorece, sem
 * precisar de uma terceira regra. A rolagem do recurso em si (qual peixe,
 * XP) continua em `rollFishGather`, que o chamador usa quando o resultado é
 * `resource`. Gastar a isca é responsabilidade de `FishingService`.
 */
export function rollFishing(input: FishingRollInput): FishingRoll {
  const random = input.random ?? Math.random;
  const strongChance = getStrongMonsterChance(input.baitId, input.rodId);
  const monsterChance = Math.max(
    getFishingMonsterChance(input.baitId),
    strongChance,
  );

  let outcome: FishingOutcome = { kind: "resource" };
  if (random() < monsterChance) {
    const isStrong = random() < strongChance / monsterChance;
    outcome = {
      kind: "monster",
      npcType: isStrong ? FISHING_STRONG_MONSTER : FISHING_COMMON_MONSTER,
      isStrong,
    };
  }

  const petCaught = random() < getFishingPetChance(input.rodId, input.now);
  return { outcome, petCaught, durationMs: rollFishingDurationMs(random) };
}
