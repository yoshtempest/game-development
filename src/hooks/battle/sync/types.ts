import type { RefObject } from "react";
import type { DamageKind } from "@/utils/types/battle/damageKind";

export type SyncProps = {
  battle: {
    npcHP: number;
    npcMaxHp: number;
    setNpcHP: (fn: (prev: number) => number) => void;
    isEnding: { readonly current: boolean };
    npcPhase: number;
  };
  npcAiHpRef: RefObject<number>;
  npc: { x: number };
  updateNpcPosition: (x: number) => void;
  npcType: string;
  npcMaxHpRef: RefObject<number>;
  setNpcHPRef: RefObject<(fn: (prev: number) => number) => void>;
  isEndingRef: RefObject<{ readonly current: boolean }>;
  isPausedRef: RefObject<boolean>;
  resetBattleNavbarRef: RefObject<() => void>;
  setNpcPhase: (phase: number) => void;
  setModeRef: RefObject<(mode: PlayerMode) => void>;
  closeInventoryRef: RefObject<() => void>;
  closeNavbarRef: RefObject<() => void>;
  refs: {
    npcRangedAttackRef: RefObject<(damageKind?: DamageKind) => void>;
    npcMeleeAttackRef: RefObject<
      (multiplier?: number, damageKind?: DamageKind) => void
    >;
    npcBurstAttackRef: RefObject<(pushDir: number) => void>;
    npcThrowAttackRef: RefObject<() => void>;
  };
  charge: { cancelCharge: () => void };
  player: { state: string; halfHealUntil: number };
  halfHealReduction: number;
  battleNpcRangedHit: (damageKind?: DamageKind) => void;
  battleNpcMeleeHit: (multiplier?: number, damageKind?: DamageKind) => void;
  battleNpcBurstHit: (pushDir: number) => void;
  battleNpcThrowHit: (multiplier: number) => void;
};
