import { useCallback, useEffect, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import {
  INVENTORY_SECTIONS,
  INVENTORY_SECTION_COUNT,
  type InventorySection,
} from "@/data/inventory/tabs";

type InventoryFocus = "tabs" | "chest" | "content";

/**
 * Cabeçalho compartilhado da Mochila: abas + baú diário. O foco é um único
 * estado porque os três alvos disputam a mesma layer de input — o conteúdo
 * só recebe comandos quando `focus === "content"`, e o baú continua alcançável
 * de qualquer aba pela seta direita da última aba.
 */
export function useInventoryTabs(
  initialSection: InventorySection,
  chestReady: boolean,
  onOpenChest: () => void,
) {
  const { pushControls } = useGameControls();
  const { playMove, playSelect } = useMenuSFX();

  const [activeSection, setActiveSection] =
    useState<InventorySection>(initialSection);
  const [focus, setFocus] = useState<InventoryFocus>("tabs");

  const activeSectionRef = useLatestRef(activeSection);
  const focusRef = useLatestRef(focus);
  const chestReadyRef = useLatestRef(chestReady);
  const onOpenChestRef = useLatestRef(onOpenChest);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const pushControlsRef = useLatestRef(pushControls);

  const focusTab = useCallback(() => setFocus("tabs"), []);
  const enterContent = useCallback(() => setFocus("content"), []);
  const focusChest = useCallback(() => setFocus("chest"), []);

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
        if (focusRef.current === "tabs") {
          cycleSection(-1);
          return true;
        }
        if (focusRef.current === "chest") {
          playMoveRef.current();
          focusTab();
          return true;
        }
        return false;
      },

      onRight: () => {
        if (focusRef.current !== "tabs") return false;
        const index = INVENTORY_SECTIONS.indexOf(activeSectionRef.current);
        const isLastTab = index === INVENTORY_SECTIONS.length - 1;
        if (isLastTab && chestReadyRef.current) {
          playMoveRef.current();
          focusChest();
          return true;
        }
        cycleSection(1);
        return true;
      },

      onDown: () => {
        if (focusRef.current === "content") return false;
        playMoveRef.current();
        enterContent();
        return true;
      },

      onUp: () => {
        if (focusRef.current !== "chest") return false;
        playMoveRef.current();
        focusTab();
        return true;
      },

      onConfirm: () => {
        if (focusRef.current === "tabs") {
          playSelectRef.current();
          enterContent();
          return true;
        }
        if (focusRef.current === "chest") {
          playSelectRef.current();
          if (chestReadyRef.current) onOpenChestRef.current();
          return true;
        }
        return false;
      },

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [
    activeSectionRef,
    chestReadyRef,
    cycleSection,
    enterContent,
    focusChest,
    focusRef,
    focusTab,
    onOpenChestRef,
    playMoveRef,
    playSelectRef,
    pushControlsRef,
  ]);

  return {
    activeSection,
    setActiveSection,
    isOnTab: focus === "tabs",
    isChestFocused: focus === "chest",
    isContentActive: focus === "content",
    focusTab,
    enterContent,
    focusChest,
  };
}
