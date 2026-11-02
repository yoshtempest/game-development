export type Params = {
  chestRewardsVisible: boolean;
  rewardOptionCount: number;
  lastOpened: { chestId: ItemId } | null | undefined;
  playMove: () => void;
  playSelect: () => void;
  closeRewards: () => void;
  openNextChest: (id?: ItemId) => unknown;
  onRewardOptionChange: (
    indexOrUpdater: number | ((prev: number) => number),
  ) => void;
};
