import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";
import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";

export type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  freezeActionsUntilRef: RefObject<number>;
  timeRef: RefObject<TimeEffect[]>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarshadowBattleForm,
    onCancel?: () => void,
  ) => boolean;
  /** +5 cargas da Expansão por uso (a purple conta como dois: 2×). */
  onUsed?: (times?: number) => void;
  /**
   * Energia amaldiçoada: red e purple cobram uma fração da MÁXIMA no cast
   * (`sphereEnergyCost`). A blue não passa por aqui — o custo dela é o dreno
   * contínuo em campo.
   */
  battleManaRef: RefObject<BattleManaApi | null>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};
