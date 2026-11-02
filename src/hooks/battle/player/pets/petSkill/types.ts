import type { RefObject } from "react";

export type Props = {
  enabled: boolean;
  cooldownMs: number;
  isPaused: boolean;
  /**
   * Pausa global da batalha (menu de batalha aberto, intro, vitória...):
   * congela o cooldown — a batalha pausada não regenera habilidade.
   */
  isPausedRef?: RefObject<boolean>;
  onTrigger: () => void;
};
