import type { BattleManaApi } from "@/contexts/BattleManaContext";

import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { RefObject } from "react";

export type Props = {
  enabled: boolean;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  refs: ReturnType<typeof useBattleRefs>;
  /** O player não é `TimeKind`: o gate de ação dele é este lock. */
  freezeActionsUntilRef: RefObject<number>;
  resetTimeScale: () => void;
  battleManaRef: RefObject<BattleManaApi | null>;
  honoredRiseStartRef: RefObject<number>;
  honoredRiseStartYRef: RefObject<number>;
  honoredFallRef: RefObject<boolean>;
  /** Callback opcional chamado quando o jogador pula a animação. */
  onSkip?: () => void;
};
