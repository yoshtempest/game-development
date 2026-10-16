import type { LucauaPortal } from "./lucaua";

/** Direção que o joystick pode empurrar o fantasma/seletor. */
export type PortalDirection = "up" | "down" | "left" | "right";

/** Par de portais que uma travessia conecta (origem → destino). */
export type PortalWarp = { dest: LucauaPortal; source: LucauaPortal };

/** Grupo de entidade que atravessa (define qual setter escreve a posição). */
export type PortalTravelGroup = "npc" | "summon" | "ally" | "pet";

/**
 * Queda em curso de uma entidade não-player. A posição é dirigida aqui (não
 * pelo AI, que fica congelado pelo efeito de time): `descend` afunda do portal
 * terrestre até `targetY`; `land` cai do destino suspenso até o chão.
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