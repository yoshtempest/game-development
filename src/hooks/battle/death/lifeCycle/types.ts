export type Props = {
  playerHP: number;
  npcHP: number;

  npcClass: string;
  /** Tipo do NPC: decide quantas fases ele tem (`getNpcPhaseCount`). */
  npcType: string;

  setNpcPhase: (n: number) => void;
  npcPhaseRef: React.RefObject<number>;
  setNpcHP: (n: number) => void;

  npcMaxHp: number;

  onPlayerDeath: () => void;
  onNpcDeath: () => void;

  isEnding: React.RefObject<boolean>;
};
