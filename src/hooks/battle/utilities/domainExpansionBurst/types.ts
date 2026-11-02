import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";

export type Props = {
  player: Player;
  /** Dono da habilidade: todos os personagens (o marshadow usa o mugetsu). */
  character: Player["character"];
  /** Carga atual/máxima da barra da Expansão (o uso consome tudo). */
  charges: number;
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  /**
   * Menu da batalha aberto (pausa dirigida pelo jogador): congela o overlay do
   * burst e o lock de ação.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** Aplica o dano em todos os inimigos (implementado no useBattleCombat). */
  onBurst: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};
