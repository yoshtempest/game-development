import type { RefObject } from "react";

import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

export type PetSkillRunDeps = {
  petLevel: number;
  petStars: number;
  playerLevel: number;
  groundY: number;
  beginCoffinSequence: (
    spawnPositions: number[],
    groundY: number,
    npcType: string,
    onSpawn: (npcType: string, x: number) => void,
  ) => void;
  npcType: string;
  playerX: number;
  playerY: number;
  battle: {
    npcArmor: DamageArmor;
    npcHP: number;
    npcMaxHp: number;
    setNpcHP: React.Dispatch<React.SetStateAction<number>>;
    playerMaxHp: number;
    setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
    setPlayerShield: React.Dispatch<React.SetStateAction<number>>;
  };
  spawnDamageRef: RefObject<SpawnDamageFn>;
  npc: { x: number; y: number };
  summonAlly: (
    npcType: string,
    overrideX?: number,
    options?: { level?: number; statMultiplier?: number },
  ) => void;
  triggerJumpAttack: (npcY: number, cb: (damage: number) => void) => void;
  triggerTeleportBite: (
    targetX: number,
    targetY: number,
    cb: (damage: number) => void,
  ) => void;
  applyNpcBleed: (durationMs: number) => void;
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  summonsBleedUntilRef: RefObject<Record<string, number>>;
  npcRootedUntilRef: RefObject<number>;
  rootedSummonsUntilRef: RefObject<Record<string, number>>;
  rootDurationMs: number;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};
