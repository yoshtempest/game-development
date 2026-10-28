/**
 * REGRA DE TIME DA BATALHA
 * ========================
 * Um efeito de time (congelamento, slow-motion, escala de recarga) é declarado
 * **uma vez** e consultado por todas as entidades móveis/atacantes, em vez de
 * cada habilidade reiterate o seu próprio conjunto de refs (`hitstopRef`,
 * `projectilesFreezeUntilRef`, `freezeSummonsUntilRef`, ...).
 *
 * O caso geral dos efeitos de batalha é "atinge tudo, exceto quem aplicou": o
 * `exempt` é o que expressa isso. O hitstop é o caso degenerado (congela tudo,
 * ninguém isento).
 *
 * Semântica por entidade:
 * - `speed === 0` → a entidade está **congelada**: o tick dela não roda, então
 *   não move, não colide e não ataca.
 * - `speed > 0` → o tick roda, o movimento é multiplicado por `speed` e o
 *   cooldown de ataque é multiplicado por `cooldown` (2 = ataca 2x mais devagar).
 *
 * Efeitos combinam pelo pior caso entre os que atingem a entidade: `speed` é o
 * menor e `cooldown` é o maior.
 *
 * O **player** não faz parte de `TimeKind`: o gate de ação dele é o
 * `freezeActionsUntilRef`, compartilhado por dez habilidades (câmera, Vastolord,
 * Ematron, Órbita...). Habilidades que travam o mundo escrevem os dois: o
 * efeito de time para o mundo e o lock de ação para o player.
 *
 * Este módulo é o dono dos tipos e das constantes. Os helpers de `time/`
 * importam daqui — nunca do barrel `index.ts`, que os re-exporta. O barrel
 * misturaria então declaração de valor com re-export e criaria um ciclo em que
 * um filho lê uma `const` ainda em TDZ.
 */

/** Classe de entidade que a regra sabe atingir. */
export type TimeKind =
  /** NPC principal. */
  | "npc"
  /** Summons inimigos. */
  | "summon"
  /** Allies do jogador. */
  | "ally"
  /** Pet. */
  | "pet"
  /** Projéteis do NPC. */
  | "projectile"
  /**
   * Projétil do jogador (esfera do Natsuki). Declarado para efeitos que
   * precisam **isentar** a esfera (`PLAYER_SPHERE_TIME_ID`): a esfera anima por
   * time absoluto e a fase dela avança pelo `player.state`, então ela nunca
   * consulta a regra — o que a torna 1x por construção, inclusive sob o slow do
   * próprio O Mais Honrado.
   */
  | "playerProjectile";

/** Todas as classes de entidade do mundo da batalha. */
export const ALL_TIME_KINDS: TimeKind[] = [
  "npc",
  "summon",
  "ally",
  "pet",
  "projectile",
  "playerProjectile",
];

/**
 * Ids canônicos de entidades de uso único (summons/ally/projéteis usam o próprio
 * id). O `NPC_TIME_ID` é fixo porque o NPC principal não tem id próprio —
 * summons, allies e projéteis se identificam pelo id que já nasceram.
 */
export const NPC_TIME_ID = "npc:main";
export const PET_TIME_ID = "pet";
export const PLAYER_SPHERE_TIME_ID = "playerProjectile:sphere";

/** Estado de time de uma entidade. `speed` 0 = congelada. */
export type BattleTime = {
  /** Multiplicador de movimento (0 = congelado, 1 = normal, 0.25 = 4x mais lento). */
  speed: number;
  /** Multiplicador do time de recarga de ataque (1 = normal, 3 = 3x mais lento). */
  cooldown: number;
};

/** Efeito de time ativo no mundo. */
export type TimeEffect = {
  /** Identidade do efeito — `applyTime` faz upsert por este id. */
  id: string;
  /** Classes de entidade atingidas. */
  kinds: TimeKind[];
  /** Ids de entidade isentos (o caster, ou o projétil dele). */
  exempt: string[];
  /** Timestamp de expiração. */
  until: number;
  /** Multiplicador de movimento (0 = congelado). */
  speed: number;
  /** Multiplicador do time de recarga de ataque. */
  cooldown: number;
};

/** Efeito a aplicar; a duração é relativa e vira `until` no `applyTime`. */
export type TimeSpec = Omit<TimeEffect, "until"> & { durationMs: number };

/** Estado normal: nada afetando. */
export const NEUTRAL_TIME: BattleTime = { speed: 1, cooldown: 1 };

/** Id do efeito global de hitstop (impacto). */
export const HITSTOP_ID = "hitstop";
