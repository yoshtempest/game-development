import type { ReplayData } from "@/utils/types/replay";
import type { TitlesData } from "@/utils/types/player/titles";

export type Props = {
  isOpen: boolean;
  character: string;
  enemyType: string;
  enemyLevel: number;
  onContinue: () => void;
  xpReward: number;
  rewards: RewardInfo | null;
  skipDelay?: boolean;
  elapsed: number;
  bestTime: number;
  getReplayData?: () => ReplayData | null;
  isAlfa?: boolean;
  titleProgressSnapshot?: TitlesData["progress"];
};