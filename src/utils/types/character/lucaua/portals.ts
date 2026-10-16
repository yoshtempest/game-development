import type { LucauaPortal } from ".";

/** Direção que o joystick pode empurrar o fantasma/seletor. */
export type PortalDirection = "up" | "down" | "left" | "right";

/**
 * Fase do fluxo de colocação do portal: `selecting` (escolhendo o tipo),
 * `positioning` (mexendo o fantasma) ou `idle` (fora do fluxo). O fluxo é o que
 * trava o mundo durante a montagem do par.
 */
export type PortalFlowPhase = "idle" | "selecting" | "positioning";

/** Par de portais que uma travessia conecta (origem → destino). */
export type PortalWarp = { dest: LucauaPortal; source: LucauaPortal };

/** Grupo de entidade que atravessa (define qual setter escreve a posição). */
export type PortalTravelGroup = "npc" | "summon" | "ally" | "pet";

/**
 * Queda em curso de uma entidade não-player. A posição é dirigida aqui, não
 * pelo AI: enquanto a entidade atravessa, um efeito de time dirigido à classe
 * dela (`engageTravelLocks` + `TravelLockSpec`) a mantém congelada — só ela, o
 * resto do mundo segue vivo; `descend` afunda do portal terrestre até
 * `targetY`; `land` cai do destino suspenso até o chão.
 */
export type EntityTravel = {
  /** Id de travessia (mesma chave do `disarmedRef`, ex.: `summon:<id>`). */
  key: string;
  group: PortalTravelGroup;
  id: string;
  dest: LucauaPortal;
  phase: "descend" | "land";
  x: number;
  y: number;
  vy: number;
  targetY: number;
};

/** Queda em curso do player ao entrar num portal terrestre. */
export type PlayerTravel = {
  dest: LucauaPortal;
  targetY: number;
  startTime: number;
};