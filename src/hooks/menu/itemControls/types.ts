export type Params = {
  filterFocused: boolean;
  chestFocused: boolean;
  selectedItem: { id: string } | undefined;
  isConsumableSelected: boolean;
  isChestSelected: boolean;
  isMapSelected: boolean;
  isTeleportSelected: boolean;
  isDroppableSelected: boolean;
  keyId: string | null;
  items: { id: string }[];
  openPlayerChest: (id: ItemId) => void;
  getEffect: (id: ItemId) => (() => void) | null;
  consumeItem: (id: string) => boolean;
  onReject: (index: number) => void;
  onNoKey: () => void;
  onDropItem: () => void;
};
