import { getNpcStatusMultipliers } from "@/data/npc/statusMultipliers";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

/**
 * Tabela de dificuldade em escopo de módulo: ela é constante, mas estava
 * declarada **dentro** de `getNpcStats`, ou seja, o objeto inteiro (4
 * dificuldades × 7 classes) era alocado de novo a cada chamada — inclusive no
 * loop de spawn de summons.
 */
const DIFFICULTY_MULTIPLIERS: Record<
  NpcDifficulty,
  Record<NPCClass, { hp: number; dmg: number; armor: number }>
> = {
  easy: {
    common: { hp: 0.5, dmg: 0.15, armor: 1 },
    rare: { hp: 1.0, dmg: 0.35, armor: 3 },
    epic: { hp: 2.0, dmg: 0.8, armor: 6 },
    boss: { hp: 5, dmg: 3, armor: 10 },
    legendary: { hp: 10.0, dmg: 10.0, armor: 25 },
    supreme: { hp: 40.0, dmg: 30.0, armor: 40 },
    omega: { hp: 100.0, dmg: 90.0, armor: 50 },
  },

  medium: {
    common: { hp: 1.5, dmg: 0.4, armor: 2 },
    rare: { hp: 3.0, dmg: 0.9, armor: 5 },
    epic: { hp: 5.0, dmg: 2.0, armor: 10 },
    boss: { hp: 6.0, dmg: 3, armor: 15 },
    legendary: { hp: 30.0, dmg: 30.0, armor: 20 },
    supreme: { hp: 60.0, dmg: 45.0, armor: 45 },
    omega: { hp: 200.0, dmg: 180.0, armor: 100 },
  },

  hard: {
    common: { hp: 4.0, dmg: 1.0, armor: 4 },
    rare: { hp: 7.0, dmg: 2.2, armor: 8 },
    epic: { hp: 12.0, dmg: 4.5, armor: 15 },
    boss: { hp: 15.0, dmg: 5.0, armor: 28 },
    legendary: { hp: 60.0, dmg: 50.0, armor: 45 },
    supreme: { hp: 90.0, dmg: 60.0, armor: 60 },
    omega: { hp: 400.0, dmg: 360.0, armor: 200 },
  },

  insano: {
    common: { hp: 10.0, dmg: 2.5, armor: 10 },
    rare: { hp: 18.0, dmg: 6.0, armor: 20 },
    epic: { hp: 30.0, dmg: 12.0, armor: 36 },
    boss: { hp: 50.0, dmg: 20.0, armor: 64 },
    legendary: { hp: 160.0, dmg: 100.0, armor: 90 },
    supreme: { hp: 250.0, dmg: 140.0, armor: 140 },
    omega: { hp: 800.0, dmg: 720.0, armor: 400 },
  },
};

const BASE_HP = 90;
const BASE_DAMAGE = 5;

/**
 * Multiplicador global dos status do NPC principal. Cada jogador na mesma
 * batalha vale 150% da base: dois jogadores deixam o NPC com 3x vida, dano e
 * armadura. O alfa dobra por cima disso.
 */
export function getNpcStatMultiplier(
  isAlfa: boolean,
  playerCount: number,
): number {
  const coop = playerCount > 1 ? playerCount * 1.5 : 1;
  return (isAlfa ? 2 : 1) * coop;
}

/**
 * Status do NPC: base por nível × classe × dificuldade, multiplicados pelo
 * `multiplier` global (alfa, estrela de pet) e pelos multiplicadores próprios
 * do tipo (`NPC_STATUS_MULTIPLIERS`, 5º parâmetro opcional) — que é o que
 * permite dois bosses da mesma classe terem perfis diferentes (dano, vida e
 * as duas colunas de armadura podem puxar para lados opostos).
 */
export function getNpcStats(
  level: number,
  npcClass: NPCClass,
  difficulty: NpcDifficulty,
  multiplier: number = 1,
  npcType?: string,
): { hp: number; damage: number; armor: DamageArmor } {
  const multipliers = DIFFICULTY_MULTIPLIERS[difficulty][npcClass];
  const status = getNpcStatusMultipliers(npcType ?? "");
  const armor = Math.round(level * multipliers.armor * multiplier);

  return {
    hp: Math.round((BASE_HP + level * multipliers.hp) * multiplier * status.hp),
    damage: Math.round(
      (BASE_DAMAGE + level * multipliers.dmg) * multiplier * status.damage,
    ),
    /**
     * Mesma base nas duas colunas (como no equipamento), mas os
     * multiplicadores do NPC separam as colunas: um boss só físico ou com
     * fraqueza mágica declara o desvio em `NPC_STATUS_MULTIPLIERS`
     * (`data/npc/statusMultipliers.ts`).
     */
    armor: {
      physical: Math.round(armor * status.physicalArmor),
      magical: Math.round(armor * status.magicalArmor),
    },
  };
}
