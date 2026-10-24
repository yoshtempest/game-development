import type { SlotScopedKey } from "@/services/save/slotManager";
import type { InventoryItem } from "@/utils/types/player/inventory";

export type ContainerSlot = InventoryItem | null;

export type ContainerSlots = ContainerSlot[];

export type RespawnConfig = {
  /** Intervalo em milissegundos para o item reaparecer. */
  intervalMs: number;
  /** Índice do slot que deve ter o item respawnado. */
  slot: number;
  /** Item que será colocado no slot quando fizer respawn. */
  item: InventoryItem;
};

export type ContainerDef = {
  id: string;
  label: string;
  size: number;
  cols: number;
  defaultSlots: ContainerSlots;
  storageKey: SlotScopedKey;
  /** Configuração opcional de respawn do item. */
  respawn?: RespawnConfig;
};
