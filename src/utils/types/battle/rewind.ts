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
