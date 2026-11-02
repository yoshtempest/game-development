import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { RefObject } from "react";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/blinkAnimation/useBlinkAnimation";

export type Props = {
  cursedEnergyEnabled: boolean;
  battle: ReturnType<typeof useBattleSystem>;
  battleManaRef: RefObject<BattleManaApi | null>;
  player: Player;
  honoredOneActiveRef: RefObject<boolean>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  triggerBlink: ReturnType<typeof useBlinkAnimation>["triggerBlink"];
  divergentFistActive: boolean;
  divergentFistRef: RefObject<boolean>;
  forcePunchRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
};
