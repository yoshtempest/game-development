import { isFacingTarget } from "@/gameRules/battle/direction";
import { blocksOmnidirectionally } from "@/gameRules/battle/lucauaShield";
import { handleNpcBlocking } from "./useBlocking";
import { type TimeEffect } from "@/gameRules/battle/time";

import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

export function checkBlocked(params: {
  dmg: number;
  character: CharacterId;
  playerState: PlayerState;
  playerBattleDirection: Direction;
  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;
  blockGauge: number;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  damagePlayerWithReflect: (damage: number) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  npcCooldown: React.RefObject<boolean>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onFullBlock?: () => void;
  onBlockRef?: React.RefObject<(side?: LucauaShieldSide) => void>;
  onParry?: () => void;
  onDamageBlocked?: (blockedDamage: number) => void;
}): boolean {
  const {
    dmg,
    character,
    playerState,
    playerBattleDirection,
    playerX,
    playerY,
    npcX,
    npcY,
    blockGauge,
    setBlockGauge,
    damagePlayerWithReflect,
    setPlayer,
    spawnDamageRef,
    timeRef,
    npcStaggerRef,
    npcCooldown,
    lastBlockPressRef,
    lastAttackPressRef,
    onFullBlock,
    onBlockRef,
    onParry,
    onDamageBlocked,
  } = params;

  // O lucaua bloqueia os dois lados (Babidi Block); os demais só bloqueiam o
  // golpe quando estão virados para quem ataca.
  const isBlocking =
    playerState === "blocked" &&
    (blocksOmnidirectionally(character) ||
      isFacingTarget(playerX, playerY, npcX, npcY, playerBattleDirection));

  const blocked = handleNpcBlocking({
    dmg,
    isBlocking,
    blockGauge,
    setBlockGauge,
    damagePlayerWithReflect,
    setPlayer,
    spawnDamageRef,
    playerX,
    playerY,
    attackerX: npcX,
    timeRef,
    npcStaggerRef,
    npcCooldown,
    lastBlockPressRef,
    lastAttackPressRef,
    onFullBlock,
    onBlockRef,
    onParry,
    onDamageBlocked,
  });
  return blocked;
}
