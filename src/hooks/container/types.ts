import type { InventoryItem } from "@/utils/types/player/inventory";
import type { SlotScopedKey } from "@/services/save/slotManager";
import type { ContainerSlots } from "@/utils/types/container";
import type { RespawnConfig } from "@/utils/types/container";

export type Params = {
  storageKey: SlotScopedKey;
  defaultSlots: ContainerSlots;
  size: number;
  cols?: number;
  onPickup?: (index: number, slot: InventoryItem) => boolean;
  onClose?: () => void;
  /** Configuração opcional de respawn do item. */
  respawn?: RespawnConfig;
};
