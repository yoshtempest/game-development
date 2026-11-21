import { useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import {
  circularNext,
  circularPrev,
  gridMove,
} from "@/gameRules/menu/navigation";
import { useInventory } from "@/contexts/InventoryContext";
import { useItemEffect } from "@/hooks/items/useItemEffect";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useAudio } from "@/hooks/audio/useAudio";
import { resolveAsset } from "@/utils/paths";
import { INVENTORY_GRID_COLUMNS } from "@/data/inventory/tabs";
import type { FilterConfig } from "@/utils/types/inventory/filterConfig";

export function useInventoryMenu(
  isOpen: boolean,
  listRef?: React.RefObject<HTMLUListElement | null>,
  filterConfig: FilterConfig | null = null,
  chestReady = false,
  onFocusChest: () => void = () => {},
  onFocusTabs: () => void = () => {},
) {
  const { pushControls } = useGameControls();
  const { items: rawItems } = useInventory();
  const { sfxVolume } = useAudio();

  const items = filterConfig ? filterConfig.filteredItems : rawItems;
  const navLength = items.length;

  const sfxVolumeRef = useLatestRef(sfxVolume);

  const sfxPoolRef = useRef(new Map<string, HTMLAudioElement>());

  const playSFX = (src: string, volume = 1) => {
    const resolved = resolveAsset(src);
    let audio = sfxPoolRef.current.get(resolved);

    if (!audio) {
      audio = new Audio(resolved);
      sfxPoolRef.current.set(resolved, audio);
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume * (sfxVolumeRef.current / 100);
    audio.play().catch(() => {});
  };

  const { getEffect } = useItemEffect({ playSFX });
  const { playMove, playSelect } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useLatestRef(selectedIndex);

  const [filterFocused, setFilterFocused] = useState(false);
  const filterFocusedRef = useLatestRef(filterFocused);

  useEffect(() => {
    if (!listRef?.current) return;

    const container = listRef.current;
    const selectedElement = container.children[selectedIndex] as HTMLElement;

    if (!selectedElement) return;

    selectedElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedIndex, listRef]);

  useEffect(() => {
    setSelectedIndex((prev) =>
      navLength === 0 ? 0 : Math.min(prev, navLength - 1),
    );
  }, [navLength]);

  const handleUseItemRef = useLatestRef((index: number): boolean => {
    const item = items[index];
    if (!item) return false;

    const effect = getEffect(item.id);
    if (!effect) return false;

    effect();
    return true;
  });

  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const pushControlsRef = useLatestRef(pushControls);
  const filterConfigRef = useLatestRef(filterConfig);
  const chestReadyRef = useLatestRef(chestReady);
  const onFocusChestRef = useLatestRef(onFocusChest);
  const onFocusTabsRef = useLatestRef(onFocusTabs);

  useEffect(() => {
    if (!isOpen) return;

    // A barra de filtros agora é horizontal: esquerda/direita trocam de filtro
    // e para baixo devolve o foco ao grid.
    const cycleFilter = (dir: 1 | -1) => {
      const cfg = filterConfigRef.current;
      if (!cfg) return;
      playMoveRef.current();
      const idx = cfg.labels.findIndex((label) => label.type === cfg.active);
      const nextIdx =
        dir === 1
          ? circularNext(idx, cfg.labels.length)
          : circularPrev(idx, cfg.labels.length);
      cfg.onChange(cfg.labels[nextIdx]!.type);
    };

    const controls = {
      onUp: () => {
        if (filterFocusedRef.current) {
          playMoveRef.current();
          onFocusTabsRef.current();
          return;
        }

        const row = Math.floor(
          selectedIndexRef.current / INVENTORY_GRID_COLUMNS,
        );
        if ((row === 0 || navLength === 0) && filterConfigRef.current) {
          if (chestReadyRef.current) {
            playMoveRef.current();
            onFocusChestRef.current();
            return;
          }
          playMoveRef.current();
          setFilterFocused(true);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, INVENTORY_GRID_COLUMNS, "up", navLength),
        );
      },

      onDown: () => {
        if (filterFocusedRef.current) {
          playMoveRef.current();
          setFilterFocused(false);
          setSelectedIndex(0);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, INVENTORY_GRID_COLUMNS, "down", navLength),
        );
      },

      onLeft: () => {
        if (filterFocusedRef.current) {
          cycleFilter(-1);
          return;
        }

        if (navLength === 0) {
          if (filterConfigRef.current) {
            playMoveRef.current();
            setFilterFocused(true);
          } else if (chestReadyRef.current) {
            playMoveRef.current();
            onFocusChestRef.current();
          }
          return;
        }

        playMoveRef.current();

        // Coluna esquerda devolve o foco para as abas superiores.
        if (selectedIndexRef.current % INVENTORY_GRID_COLUMNS === 0) {
          onFocusTabsRef.current();
          return;
        }

        setSelectedIndex((prev) =>
          gridMove(prev, INVENTORY_GRID_COLUMNS, "left", navLength),
        );
      },

      onRight: () => {
        if (filterFocusedRef.current) {
          cycleFilter(1);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, INVENTORY_GRID_COLUMNS, "right", navLength),
        );
      },

      onConfirm: () => {
        if (filterFocusedRef.current) {
          playSelectRef.current();
          return true;
        }

        playSelectRef.current();
        return handleUseItemRef.current(selectedIndexRef.current);
      },

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [
    isOpen,
    navLength,
    chestReadyRef,
    filterConfigRef,
    onFocusChestRef,
    onFocusTabsRef,
    playMoveRef,
    playSelectRef,
    pushControlsRef,
    filterFocusedRef,
    handleUseItemRef,
    selectedIndexRef,
  ]);

  return {
    selectedIndex,
    filterFocused,
    setFilterFocused,
  };
}
