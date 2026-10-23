import { useLocation } from "react-router";
import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useQuests } from "@/contexts/QuestContext";
import { useFlags } from "@/contexts/FlagContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTombstones } from "@/contexts/TombstoneContext";

import { QUESTS } from "@/data/quests";
import { ITEMS } from "@/data/items";
import type { Condition } from "@/utils/types/maps/conditions";

export function useSceneEvents() {
  const { navigateWithFade } = useTransitionCtx();
  const location = useLocation();

  const { items, addItem, removeItem } = useInventory();
  const { quests, addQuest, updateProgress } = useQuests();
  const { setFlag, hasFlag } = useFlags();
  const { player } = usePlayer();
  const { prepareTombstoneSpawn } = useTombstones();

  const lastPage = (location.state as { from?: string } | null)?.from;

  const checkCondition = (condition: Condition) => {
    if (
      condition.hasQuest &&
      !quests.some((q) => q.id === condition.hasQuest)
    ) {
      return false;
    }

    if (
      condition.notHasQuest &&
      quests.some((q) => q.id === condition.notHasQuest)
    ) {
      return false;
    }

    if (condition.hasItem && !items.some((i) => i.id === condition.hasItem)) {
      return false;
    }

    if (
      condition.notHasItem &&
      items.some((i) => i.id === condition.notHasItem)
    ) {
      return false;
    }

    if (condition.lastPage && lastPage !== condition.lastPage) {
      return false;
    }

    if (condition.notLastPage && lastPage === condition.notLastPage) {
      return false;
    }

    if (condition.hasFlag && !hasFlag(condition.hasFlag)) {
      return false;
    }

    if (condition.notHasFlag && hasFlag(condition.notHasFlag)) {
      return false;
    }

    return true;
  };

  const runEvent = (event: SceneEvent) => {
    switch (event.type) {
      case "navigate":
        setTimeout(() => {
          navigateWithFade(event.to, {
            state: { from: location.pathname },
          });
        }, 0);
        return;

      case "setFlag":
        setFlag(event.flagId);
        return;

      case "giveQuest": {
        const questData = QUESTS[event.questId];

        if (!questData) {
          console.warn("Quest não encontrada:", event.questId);
          return;
        }

        addQuest(questData);
        return;
      }

      case "addItem": {
        const itemData = ITEMS[event.itemId];

        if (!itemData) {
          console.warn("Item não encontrado:", event.itemId);
          return;
        }

        addItem(itemData);
        return;
      }

      case "removeItem":
        removeItem(event.itemId);
        return;

      case "progressQuest":
        updateProgress(event.id, event.value);
        return;

      case "conditional":
        if (checkCondition(event.condition)) {
          event.then.forEach(runEvent);
        } else {
          event.else?.forEach(runEvent);
        }
        return;

      case "prepareTombstone":
        prepareTombstoneSpawn({
          gridX: player.gridX,
          gridY: player.gridY,
          direction: player.direction,
          locationId: event.locationId,
        });
        return;
    }
  };

  return {
    checkCondition,
    runEvent,
  };
}
