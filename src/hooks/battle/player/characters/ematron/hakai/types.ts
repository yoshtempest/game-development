import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { TimeEffect } from "@/gameRules/battle/time";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { EmatronCloneVisual } from "@/utils/types/character/ematron";

export type HakaiProps = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  npc: { x: number; y: number };
  npcHP: number;
  npcMaxHp: number;
  setNpcHP: Dispatch<SetStateAction<number>>;
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  spawnDamageNumber: (value: number, x: number, y: number, type: DamageType) => void;
  freezeActionsUntilRef: RefObject<number>;
  startSpecialIntro: (character: string, onActivate: () => void, ability?: string, form?: MarshadowBattleForm, onCancel?: () => void) => boolean;
  battleManaRef: RefObject<BattleManaApi | null>;
  timeRef: RefObject<TimeEffect[]>;
  isPausedRef: RefObject<boolean>;
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  charges: number;
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
};

export type HakaiApi = {
  active: boolean;
  shattering: boolean;
  press: () => void;
  usable: boolean;
  cloneVisual: EmatronCloneVisual | null;
  hakai: boolean;
};