import type { RefObject } from "react";

export type Props = {
  player: Player;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /**
   * A Bankai não acumula com a Forma Vastolord: a forma já é o pico do
   * marshadow (x4), e somar 1.5x por cima desequilibra a janela de 10s.
   */
  vastolordActive: boolean;
  /**
   * Espelho do estado ativo lido pelo funil de dano (`vastolordMultiplierRef`
   * em `useBattlePresentation`). Ref, e não estado, porque o funil roda fora
   * do ciclo de render.
   */
  bankaiActiveRef: RefObject<boolean>;
  /** Chamado quando o press arma a habilidade (carga da Expansão de Domínio). */
  onUsed?: () => void;
  /** Redução de cooldown BRUTA; a curva fica em `applyCooldownReduction`. */
  cooldownReduction: number;
};

export type BankaiApi = {
  active: boolean;
  /** Tempo restante da liberação, em ms. */
  activeRemainingMs: number;
  press: () => void;
  usable: boolean;
  /** Cooldown restante do botão, em segundos. */
  remaining: number;
};
