import type { NPCBattleState } from "@/utils/types/npc/npc";

export type Props = {
  enabled: boolean;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setPlayerHP?: (hp: number) => void;
  getPlayerMaxHp?: () => number;
  getNpc: () => NPCBattleState;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  freezeActionsUntilRef: React.RefObject<number>;
};