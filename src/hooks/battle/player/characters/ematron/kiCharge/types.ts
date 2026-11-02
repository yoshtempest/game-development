
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { RefObject } from "react";

export type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a carga (carga da Expansão de Domínio). */
  onUsed?: () => void;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};
