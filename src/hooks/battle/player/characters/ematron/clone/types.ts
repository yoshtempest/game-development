import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { RefObject } from "react";

export type CloneProps = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  obstacles?: BattleObstacle[];
  freezeActionsUntilRef: RefObject<number>;
  setTimeScale: (scale: number) => void;
  resetTimeScale: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a instância (carga da Expansão de Domínio). */
  onUsed?: () => void;
  isPausedRef: RefObject<boolean>;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};