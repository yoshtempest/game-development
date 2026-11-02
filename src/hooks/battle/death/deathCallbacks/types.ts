import type { InventoryItem } from "@/utils/types/player/inventory";

export type Params = {
  playerCharacter: CharacterId;
  playerClass: PlayerClass;
  location: { pathname: string };
  items: InventoryItem[];
  quests: Quest[];
  npcType: string;
  isAlfa?: boolean;
  handleDefeat: () => void;
  addBattleTime: (character: CharacterId, seconds: number) => void;
  reduceHunger: (character: CharacterId, amount: number) => void;
  setShowDefeat: (v: boolean) => void;
  setVictoryElapsed: (v: number) => void;
  setDefeatElapsed: (v: number) => void;
  setBestTime: (v: number) => void;
  triggerVictory: () => void;
  setLastRewards: (rewards: Record<string, unknown>) => void;
  giveRewards: () => { equipmentDrops: InventoryItem[] };
  progressDailyWeekly: (id: string, amount: number) => void;
  incrementPetDropCounter: () => void;
  killCounter: {
    npcDataRef: { current: { class: NPCClass } };
    handleNpcDeath: (type: string, cls: NPCClass, isAlfa?: boolean) => void;
  };
  battleStartRef: React.RefObject<number>;
};
