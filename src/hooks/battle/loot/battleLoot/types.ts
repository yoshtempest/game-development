import type { PetState } from "@/hooks/battle/player/pets/pet/types";

import type { LootBagContents } from "@/utils/types/battle/loot";

export type Props = {
  playerX: number;
  playerY: number;
  pet: PetState;
  setPet: React.Dispatch<React.SetStateAction<PetState>>;
  isPausedRef: React.RefObject<boolean>;
  onCollect: (contents: LootBagContents) => void;
  onNotify: (contents: LootBagContents, x: number, y: number) => void;
  onDone: () => void;
  playSound: (id: SoundId) => void;
};
