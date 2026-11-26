import { useCallback, useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import {
  EQUIPPED_COUNT,
  FILTER_TAB_COUNT,
  FILTER_TABS,
} from "@/utils/equipment/equipmentMenu";
import type { EquipmentFilter } from "@/utils/equipment/equipmentMenu";
import { useEquipmentItems } from "./useEquipmentItems";

export function useEquipmentMenu(
  isOpen: boolean,
  character: CharacterId,
  rightItemsRef?: React.RefObject<HTMLDivElement | null>,
  onFocusTabs: () => void = () => {},
) {
  const { pushControls } = useGameControls();
  const { equip, unequip, unequipAccessoryAtIndex } = useEquipment();
  const { playMove } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(selectedIndex);
  const onFocusTabsRef = useLatestRef(onFocusTabs);
  const [filter, setFilter] = useState<EquipmentFilter>("all");

  const { equippedItems, allCollected, filteredItems } = useEquipmentItems(
    character,
    filter,
  );

  const rightPanelCount = FILTER_TAB_COUNT + filteredItems.length;
  const totalItems = EQUIPPED_COUNT + rightPanelCount;

  const isLockedIndex = useCallback(
    (index: number): boolean => {
      const entry = equippedItems[index];
      return entry?.type === "accessory-slot" && entry.locked;
    },
    [equippedItems],
  );

  const lastNonLockedInEquipped = useCallback((): number => {
    let i = EQUIPPED_COUNT - 1;
    while (i >= 0 && isLockedIndex(i)) i--;
    return Math.max(i, 0);
  }, [isLockedIndex]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (totalItems === 0) return 0;
      const clamped = Math.min(prev, totalItems - 1);
      if (clamped < EQUIPPED_COUNT && isLockedIndex(clamped)) {
        return lastNonLockedInEquipped();
      }
      return clamped;
    });
  }, [totalItems, equippedItems, isLockedIndex, lastNonLockedInEquipped]);

  // Auto-activate filter tab when navigating over it
  useEffect(() => {
    if (selectedIndex < EQUIPPED_COUNT) return;
    const tabIndex = selectedIndex - EQUIPPED_COUNT;
    if (tabIndex < FILTER_TAB_COUNT) {
      const newFilter = FILTER_TABS[tabIndex]!;
      if (newFilter !== filter) {
        setFilter(newFilter);
      }
    }
  }, [selectedIndex, filter]);

  useEffect(() => {
    if (!rightItemsRef?.current) return;

    const relativeIndex = selectedIndex - EQUIPPED_COUNT - FILTER_TAB_COUNT;
    if (relativeIndex < 0) return;

    const selectedElement = rightItemsRef.current.children[relativeIndex] as
      HTMLElement | undefined;
    if (!selectedElement) return;

    selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex, rightItemsRef]);

  function handleUseItem(index: number) {
    if (index < EQUIPPED_COUNT) {
      const entry = equippedItems[index];
      if (!entry || !entry.item || isLockedIndex(index)) return false;
      if (entry.type === "accessory-slot") {
        if (entry.index === 0) {
          unequip(character, "accessory");
        } else {
          unequipAccessoryAtIndex(character, entry.index - 1);
        }
      } else {
        unequip(character, entry.slot);
      }
      return true;
    }

    const rightIndex = index - EQUIPPED_COUNT;

    if (rightIndex < FILTER_TAB_COUNT) {
      const newFilter = FILTER_TABS[rightIndex]!;
      if (newFilter !== filter) {
        setFilter(newFilter);
      }
      return false;
    }

    const entry = filteredItems[rightIndex - FILTER_TAB_COUNT];
    if (!entry) return false;
    equip(character, entry.item.id, entry.enhance);
    return true;
  }

  function navigate(
    prev: number,
    direction: "up" | "down" | "left" | "right",
  ): number {
    const firstTab = EQUIPPED_COUNT;
    const lastTab = EQUIPPED_COUNT + FILTER_TAB_COUNT - 1;
    const firstItem = EQUIPPED_COUNT + FILTER_TAB_COUNT;

    if (prev < EQUIPPED_COUNT) {
      const cols = 4;

      if (direction === "up") {
        if (prev < cols) {
          if (totalItems > EQUIPPED_COUNT) return firstTab;
          return prev;
        }
        let next = prev - cols;
        while (next >= 0 && isLockedIndex(next)) {
          next--;
        }
        return next < 0 ? prev : next;
      }

      if (direction === "down") {
        let next = prev + cols;
        if (next >= EQUIPPED_COUNT) return prev;
        while (next < EQUIPPED_COUNT && isLockedIndex(next)) {
          next++;
        }
        return next >= EQUIPPED_COUNT ? prev : next;
      }

      if (direction === "left") {
        const rowStart = Math.floor(prev / cols) * cols;
        let next = prev - 1;
        if (next < rowStart) {
          // Primeira coluna dos slots: volta para as abas da Mochila.
          onFocusTabsRef.current();
          return prev;
        }
        while (next >= rowStart && isLockedIndex(next)) {
          next--;
        }
        return next < rowStart ? prev : next;
      }

      if (direction === "right") {
        const rowEnd = Math.min(
          Math.floor(prev / cols) * cols + cols - 1,
          EQUIPPED_COUNT - 1,
        );
        let next = prev + 1;
        if (next > rowEnd) return prev;
        while (next <= rowEnd && isLockedIndex(next)) {
          next++;
        }
        return next > rowEnd ? prev : next;
      }

      return prev;
    }

    if (prev <= lastTab) {
      if (direction === "right") return prev < lastTab ? prev + 1 : prev;
      if (direction === "left")
        return prev > firstTab ? prev - 1 : lastNonLockedInEquipped();
      if (direction === "down") {
        if (filteredItems.length > 0) return firstItem;
        return lastNonLockedInEquipped();
      }
      if (direction === "up") return lastNonLockedInEquipped();
      return prev;
    }

    if (direction === "up") return prev > firstItem ? prev - 1 : firstTab;
    if (direction === "down") return prev < totalItems - 1 ? prev + 1 : prev;
    if (direction === "left") return firstTab;
    return prev;
  }

  const playMoveRef = useLatestRef(playMove);
  const pushControlsRef = useLatestRef(pushControls);
  const handleUseItemRef = useRef<(index: number) => boolean>(() => false);
  handleUseItemRef.current = handleUseItem;
  const navigateRef = useLatestRef(navigate);

  useEffect(() => {
    if (!isOpen) return;

    const controls = {
      onRight: () => {
        playMoveRef.current();
        setSelectedIndex((prev) => navigateRef.current(prev, "right"));
      },

      onLeft: () => {
        playMoveRef.current();
        setSelectedIndex((prev) => navigateRef.current(prev, "left"));
      },

      onDown: () => {
        playMoveRef.current();
        setSelectedIndex((prev) => navigateRef.current(prev, "down"));
      },

      onUp: () => {
        playMoveRef.current();
        setSelectedIndex((prev) => navigateRef.current(prev, "up"));
      },

      onConfirm: () => {
        return handleUseItemRef.current(selectedIndexRef.current);
      },

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [isOpen, totalItems, navigateRef, playMoveRef, pushControlsRef]);

  return {
    selectedIndex,
    equippedItems,
    filteredItems,
    filter,
    allCollected,
  };
}
