import type { RefObject } from "react";

import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { Enchantment } from "@/data/equipment/enchantments";
import type { PetBlind } from "@/gameRules/battle/petSkill/blind";

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
  /** `updateNpc` aplica o clamp da arena no `x` (empurrão do Tsunami). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: { x?: number }) => void;
  };
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
  /** Põe o pet no sprite `invoking` por `durationMs` (hungryKing). */
  triggerPetInvoke: (durationMs: number) => void;
  applyNpcBleed: (durationMs: number) => void;
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  summonsBleedUntilRef: RefObject<Record<string, number>>;
  npcRootedUntilRef: RefObject<number>;
  rootedSummonsUntilRef: RefObject<Record<string, number>>;
  rootDurationMs: number;
  /**
   * Fim de cada status de encantamento no NPC principal. O congelamento do
   * Tsunami reusa o `freeze` daqui (com `npcStaggerRef` segurando o NPC) para
   * o indicador de status e o reset da derrota valerem sem caminho paralelo.
   */
  npcEnchantUntilRef: RefObject<Record<Enchantment, number>>;
  npcStaggerRef: RefObject<number>;
  /** Cegueira do Tornado de Terra (Peru) no NPC principal. */
  npcPetBlindRef: RefObject<PetBlind>;
  /** Cegueira do Tornado de Terra (Peru) por summon inimigo (id → cegueira). */
  summonsPetBlindRef: RefObject<Record<string, PetBlind>>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};
