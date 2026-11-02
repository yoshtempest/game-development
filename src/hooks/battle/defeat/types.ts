import type { CharacterId } from "@/data/characters/list";
import type { Enchantment } from "@/data/equipment/enchantments";
import type { useChargeAttack } from "@/hooks/battle/charge/attack/useAttack";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { RefObject } from "react";

export type Props = {
  player: Player;
  setBattleHP: (character: CharacterId, hp: number | null) => void;
  setBattleMana: (character: CharacterId, mana: number | null) => void;
  handleDefeat: (reason?: unknown) => void;
  clearPendingTombstoneSpawn: () => void;
  setShowDefeat: React.Dispatch<React.SetStateAction<boolean>>;
  addBattleTime: (character: CharacterId, seconds: number) => void;
  battleStartRef: RefObject<number>;
  prevModeRef: RefObject<PlayerMode>;
  pauseStartRef: RefObject<number>;
  pauseDurationRef: RefObject<number>;
  runDefeatRef: RefObject<() => void>;
  resetRewind: () => void;
  charge: ReturnType<typeof useChargeAttack>;
  startRecording: () => void;
  resetVastolord: () => void;
  vastolordUsedRef: RefObject<boolean>;
  resetHonoredOne: () => void;
  resetTimeScale: () => void;
  clearBlink: () => void;
  clearDivergentFist: () => void;
  divergentFistRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
  forcePunchRef: RefObject<boolean>;
  clearSummons: () => void;
  clearAllies: () => void;
  clearCoffins: () => void;
  coffinStartedRef: RefObject<boolean>;
  npcRootedUntilRef: RefObject<number>;
  rootedSummonsUntilRef: RefObject<Record<string, number>>;
  summonsBleedUntilRef: RefObject<Record<string, number>>;
  npcEnchantUntilRef: RefObject<Record<Enchantment, number>>;
  isAlfa: boolean;
  summonNpc: (
    npcType: string,
    overrideX?: number,
    options?: { level?: number; statMultiplier?: number },
  ) => void;
  npcType: string;
  battle: ReturnType<typeof useBattleSystem>;
  npc: ReturnType<typeof useNpcAI>;
  resetBattleState: () => void;
  resetCombo: () => void;
  /** Zera os portais do babidi (o estado deles sobrevive ao retry da batalha). */
  resetPortals: () => void;
  grabbedTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;
  setIsGrabbed: React.Dispatch<React.SetStateAction<boolean>>;
};
