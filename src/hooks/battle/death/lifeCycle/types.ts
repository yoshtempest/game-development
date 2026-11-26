export type Props = {
  playerHP: number;
  npcHP: number;

  npcClass: string;

  setNpcPhase: (n: number) => void;
  npcPhaseRef: React.RefObject<number>;
  setNpcHP: (n: number) => void;

  npcMaxHp: number;

  onPlayerDeath: () => void;
  onNpcDeath: () => void;

  isEnding: React.RefObject<boolean>;
  /**
   * Segura a morte do NPC principal (troca de fase ou vitória) enquanto
   * `true` — companheiro ainda de pé (`hasCompanionAlive`). Quando vira
   * `false` o effect roda de novo e a morte segue o fluxo normal.
   */
  holdNpcDeath?: boolean;
};
