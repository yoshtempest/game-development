import type { NPCBattleState } from "@/utils/types/npc/npc";

export type RewindSnapshot = {
  at: number;
  playerHP: number;
  playerShield: number;
  npcHP: number;
  npcPhase: number;
  delicia: number;
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerBattleDirection: Direction;
  npcX: number;
  npcY: number;
  npcState: NPCBattleState["state"];
  npcDirection: NPCBattleState["direction"];
  projectiles: Projectile[];
  summons: SummonedNpc[];
};

/**
 * Fases da cinemática da passiva "Retrocesso Temporal" (#284), em ordem:
 * `launch` (explode e é arremessado para cima), `portal` (some ao tocar o
 * portal dimensional), `void` (espaço alternativo galáctico com a câmera
 * aproximando) e `flash` (clarão que devolve à batalha 10s antes).
 */
export type RewindResurrectionPhase = "launch" | "portal" | "void" | "flash";

/**
 * Cinemática de ressurreição em curso. Enquanto não é `null` a batalha fica
 * pausada (`isPaused` do `useScene`): player e todas as entidades congelam.
 * `originX`/`originY` são a posição da morte, de onde o arremesso parte.
 */
export type RewindResurrection = {
  phase: RewindResurrectionPhase;
  originX: number;
  originY: number;
  character: CharacterId;
};
