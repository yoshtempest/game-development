import { cafeteriaMessages } from "@/data/dialogues/cafeteria/messages";
import { createContainerHandler, createInteractionMap } from "./builder";
import type {
  ContainerDeps,
  InventoryDeps,
  QuestDeps,
} from "@/utils/types/interaction";

type CafeteriaContainer = "fridge" | "stove";

type CafeteriaDeps =
  ContainerDeps &
  InventoryDeps &
  QuestDeps & {
  openContainer: (container: CafeteriaContainer) => void;
};

export function createCafeteria(deps: CafeteriaDeps) {
  return createInteractionMap(cafeteriaMessages, deps, {
    "6,4": createContainerHandler("fridge"),
    "15,4": createContainerHandler("stove"),
  });
}
