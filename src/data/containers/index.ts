import {
  CONTAINER_KEY_PREFIX,
  type SlotScopedKey,
} from "@/services/save/slotManager";
import type { ContainerDef } from "@/utils/types/container";

export const CONTAINER_STORAGE_PREFIX = CONTAINER_KEY_PREFIX;

export function containerStorageKey(id: string): SlotScopedKey {
  return `${CONTAINER_STORAGE_PREFIX}${id}`;
}

export const CAFETERIA_FRIDGE: ContainerDef = {
  id: "cafeteria_fridge",
  label: "Geladeira",
  size: 9,
  cols: 3,
  defaultSlots: [
    { id: "sausage" },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  storageKey: containerStorageKey("cafeteria_fridge"),
};

export const CAFETERIA_STOVE: ContainerDef = {
  id: "cafeteria_stove",
  label: "Fogão",
  size: 1,
  cols: 1,
  defaultSlots: [
    { id: "foodPlate" },
    { id: "foodPlate" },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  storageKey: containerStorageKey("cafeteria_stove"),
};
