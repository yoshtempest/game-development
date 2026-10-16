import {
  NPC_BLOCK_COOLDOWN,
  NPC_GUARD_BREAK_COOLDOWN,
  NPC_RECENT_BLOCK_COOLDOWN,
} from "@/data/cooldowns";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import {
  FIFTY_MS,
  ONE_THOUSAND_FIVE_HUNDRED_MS,
  THREE_HUNDRED_MS,
} from "@/data/ms";
import { timeSinceParryInput } from "./timeSinceParryInput";
import { applyGuardBreak } from "./apply/applyGuardBreak";
import { applyDesperateBlock } from "./apply/applyDesperateBlock";
import { applyHitstop, type TimeEffect } from "@/gameRules/battle/time";
import { getShieldSide } from "@/gameRules/battle/lucauaShield";

import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

/**
 * Janela de time (ms) entre a entrada do jogador e sofrer o dano para o
 * parry disparar. Precisa ser um toque bem no timing do hit (0-50ms antes).
 */
export const PARRY_WINDOW_MS = FIFTY_MS;

/** Time em que o NPC fica impedido de atacar depois de levar um parry. */
export const PARRY_STAGGER_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;

/** Fracão mínima do gauge (%) para o NPC tentar bloquear o jogador. */
export const NPC_BLOCK_MIN_PCT = 0.1;

/** Time que o NPC fica na pose de "block" após absorver um golpe. */
export const NPC_BLOCK_HOLD_MS = THREE_HUNDRED_MS;

export type NpcBlockResult =
  { blocked: false } | { blocked: true; remainingDamage: number };

/**
 * Chamado antes de o dano do jogador ser aplicado no NPC. Recebe um getter
 * do dano real do golpe (computado sob demanda) e decide se o NPC bloqueia.
 */
export type OnBeforeNpcHit = (getDamage: () => number) => NpcBlockResult;

type HandleBlockingParams = {
  dmg: number;
  isBlocking: boolean;
  blockGauge: number;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  damagePlayerWithReflect: (damage: number) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<SpawnDamageFn>;
  playerX: number;
  playerY: number;
  /** X de quem ataca: define o lado em que o shield do lucaua surge. */
  attackerX: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  npcCooldown: React.RefObject<boolean>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onFullBlock?: () => void;
  onBlockRef?: React.RefObject<(side?: LucauaShieldSide) => void>;
  onParry?: () => void;
  onDamageBlocked?: (blockedDamage: number) => void;
};

export function handleNpcBlocking({
  dmg,
  isBlocking,
  blockGauge,
  setBlockGauge,
  damagePlayerWithReflect,
  setPlayer,
  spawnDamageRef,
  playerX,
  playerY,
  attackerX,
  timeRef,
  npcStaggerRef,
  npcCooldown,
  lastBlockPressRef,
  lastAttackPressRef,
  onFullBlock,
  onBlockRef,
  onParry,
  onDamageBlocked,
}: HandleBlockingParams): boolean {
  const now = Date.now();
  const sincePress = timeSinceParryInput(lastBlockPressRef, lastAttackPressRef);

  if (sincePress <= PARRY_WINDOW_MS) {
    onParry?.();
    spawnDamageRef.current?.(0, playerX, playerY - 40, "parry");
    timeRef.current = applyHitstop(timeRef.current, 80, now);
    npcStaggerRef.current = now + PARRY_STAGGER_MS;
    npcCooldown.current = false;
    onFullBlock?.();
    onBlockRef?.current?.(getShieldSide(attackerX, playerX));
    setTimeout(() => (npcCooldown.current = true), PARRY_STAGGER_MS);
    return true;
  }

  if (isBlocking) {
    if (blockGauge > 0) {
      if (dmg <= blockGauge) {
        setBlockGauge((g) => Math.max(0, g - dmg));
        timeRef.current = applyHitstop(timeRef.current, 60);
        npcStaggerRef.current = Date.now() + 500;
        spawnDamageRef.current?.(0, playerX, playerY - 40, "blocked");
        npcCooldown.current = false;
        onFullBlock?.();
        onDamageBlocked?.(dmg);
        onBlockRef?.current?.(getShieldSide(attackerX, playerX));
        setTimeout(() => (npcCooldown.current = true), NPC_BLOCK_COOLDOWN);
        return true;
      }

      const remaining = dmg - blockGauge;
      setBlockGauge(0);
      applyGuardBreak(
        remaining,
        damagePlayerWithReflect,
        setPlayer,
        spawnDamageRef,
        playerX,
        playerY,
      );
      timeRef.current = applyHitstop(timeRef.current, 80);
      npcCooldown.current = false;
      onBlockRef?.current?.(getShieldSide(attackerX, playerX));
      setTimeout(() => (npcCooldown.current = true), NPC_GUARD_BREAK_COOLDOWN);
      return true;
    }

    const halved = Math.max(1, Math.round(dmg / 2));
    damagePlayerWithReflect(halved);
    spawnDamageRef.current?.(halved, playerX, playerY, "npc");
    timeRef.current = applyHitstop(timeRef.current, 40);
    npcCooldown.current = false;
    onBlockRef?.current?.(getShieldSide(attackerX, playerX));
    setTimeout(() => (npcCooldown.current = true), NPC_BLOCK_COOLDOWN);
    return true;
  }

  const recentBlock = sincePress < 300;

  if (recentBlock) {
    applyDesperateBlock(
      dmg,
      damagePlayerWithReflect,
      setPlayer,
      spawnDamageRef,
      playerX,
      playerY,
    );
    timeRef.current = applyHitstop(timeRef.current, 60);
    npcCooldown.current = false;
    onBlockRef?.current?.(getShieldSide(attackerX, playerX));
    setTimeout(() => (npcCooldown.current = true), NPC_RECENT_BLOCK_COOLDOWN);
    return true;
  }

  return false;
}
