import { useCallback, useEffect, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import {
  INVENTORY_SECTIONS,
  INVENTORY_SECTION_COUNT,
  type InventorySection,
} from "@/data/inventory/tabs";

/**
 * Abas superiores da Mochila. A layer fica abaixo das do conteúdo ativo:
 * quando `isOnTab` é false ela devolve o input para a subseção; quando true,
 * as layers da subseção são desmontadas e esta passa a capturar tudo.
 */
export function useInventoryTabs(initialSection: InventorySection) {
  const { pushControls } = useGameControls();
  const { playMove, playSelect } = useMenuSFX();

  const [activeSection, setActiveSection] =
    useState<InventorySection>(initialSection);
  const [isOnTab, setIsOnTab] = useState(true);

  const isOnTabRef = useLatestRef(isOnTab);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const pushControlsRef = useLatestRef(pushControls);

  const focusTab = useCallback(() => setIsOnTab(true), []);
  const enterContent = useCallback(() => setIsOnTab(false), []);

  const cycleSection = useCallback((dir: 1 | -1) => {
    playMoveRef.current();
    setActiveSection((prev) => {
      const index = INVENTORY_SECTIONS.indexOf(prev);
      const nextIndex =
        (index + dir + INVENTORY_SECTION_COUNT) % INVENTORY_SECTION_COUNT;
      return INVENTORY_SECTIONS[nextIndex] ?? prev;
    });
  }, [playMoveRef]);

  useEffect(() => {
    const controls = {
      onLeft: () => {
        if (!isOnTabRef.current) return false;
        cycleSection(-1);
        return true;
      },

      onRight: () => {
        if (!isOnTabRef.current) return false;
        cycleSection(1);
        return true;
      },

      onDown: () => {
        if (!isOnTabRef.current) return false;
        playMoveRef.current();
        enterContent();
        return true;
      },

      onUp: () => {
        if (!isOnTabRef.current) return false;
        return true;
      },

      onConfirm: () => {
        if (!isOnTabRef.current) return false;
        playSelectRef.current();
        enterContent();
        return true;
      },

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [
    cycleSection,
    enterContent,
    isOnTabRef,
    playMoveRef,
    playSelectRef,
    pushControlsRef,
  ]);

  return {
    activeSection,
    isOnTab,
    setActiveSection,
    focusTab,
    enterContent,
  };
}
