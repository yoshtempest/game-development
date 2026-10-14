import type { NpcType } from "@/data/npc/npc";

/**
 * Multiplicadores de status por NPC — o jeito de dois NPCs da MESMA classe
 * (ex.: dois bosses) terem pontos fortes e fracos diferentes.
 *
 * Os quatro eixos multiplicam o status já calculado por
 * nível × classe × dificuldade (`getNpcStats`), então o NPC continua
 * escalando com o nível — só muda a "personalidade" dele: dano alto e vida
 * baixa (glass cannon) vs. dano baixo e vida alta (tanque), armadura
 * física ≠ mágica para punir builds, etc.
 *
 * `Partial`: NPC sem entrada é neutro (×1 nos quatro eixos) e mantém o
 * status puro da tabela de classe. Ao criar uma entrada, declare os quatro
 * eixos de propósito — campos opcionais esconderiam balanceamento esquecido.
 */
export type NpcStatusMultipliers = {
  damage: number;
  physicalArmor: number;
  magicalArmor: number;
  hp: number;
};

/** Neutro: NPC sem entrada na tabela não sofre nenhum ajuste. */
const NEUTRAL_STATUS_MULTIPLIERS: NpcStatusMultipliers = {
  damage: 1,
  physicalArmor: 1,
  magicalArmor: 1,
  hp: 1,
};

export const NPC_STATUS_MULTIPLIERS: Partial<
  Record<NpcType, NpcStatusMultipliers>
> = {
  maugrelo: {
    damage: 1.2,
    physicalArmor: 0.9,
    magicalArmor: 0.9,
    hp: 0.9,
  },
  hungryKing: {
    damage: 0.6,
    physicalArmor: 1.4,
    magicalArmor: 0.9,
    hp: 1.5,
  },
  hungryDeath: { damage: 1, physicalArmor: 0.8, magicalArmor: 0.8, hp: 1.1 },
  piupiu: { damage: 1.3, physicalArmor: 0.9, magicalArmor: 0.8, hp: 1 },
  rice: { damage: 0.7, physicalArmor: 1.5, magicalArmor: 1.2, hp: 1 },
  goat: { damage: 1.1, physicalArmor: 1.3, magicalArmor: 2, hp: 1.2 },
  vandinhaFragment: { damage: 1.3, physicalArmor: 1, magicalArmor: 1, hp: 1.3 },
  // trueVandinha: { damage: 0.1, physicalArmor: 0.1, magicalArmor: 0.1, hp: 0.1 },
  deise: { damage: 1, physicalArmor: 1, magicalArmor: 1, hp: 0.8 },
};

export function getNpcStatusMultipliers(npcType: string): NpcStatusMultipliers {
  return (
    NPC_STATUS_MULTIPLIERS[npcType as NpcType] ?? NEUTRAL_STATUS_MULTIPLIERS
  );
}
