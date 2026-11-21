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
import type { FilterConfig } from "@/utils/types/inventory/filterConfig";

export function useInventoryMenu(
  isOpen: boolean,
  listRef?: React.RefObject<HTMLUListElement | null>,
  filterConfig: FilterConfig | null = null,
  chestReady = false,
  onOpenChest: () => void = () => {},
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

  const [chestFocused, setChestFocused] = useState(false);
  const chestFocusedRef = useLatestRef(chestFocused);

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
    if (!chestReady && chestFocusedRef.current) {
      setChestFocused(false);
    }
  }, [chestReady, chestFocusedRef]);

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
  const onOpenChestRef = useLatestRef(onOpenChest);
  const onFocusTabsRef = useLatestRef(onFocusTabs);

  useEffect(() => {
    if (!isOpen) return;

    const controls = {
      onUp: () => {
        if (chestFocusedRef.current) return;

        if (filterFocusedRef.current && filterConfigRef.current) {
          playMoveRef.current();
          const cfg = filterConfigRef.current;
          const idx = cfg.labels.findIndex((l) => l.type === cfg.active);
          const prevIdx = circularPrev(idx, cfg.labels.length);
          cfg.onChange(cfg.labels[prevIdx]!.type);
          return;
        }

        const row = Math.floor(selectedIndexRef.current / 3);
        if ((row === 0 || navLength === 0) && filterConfigRef.current) {
          if (chestReadyRef.current) {
            playMoveRef.current();
            setChestFocused(true);
            return;
          }
          playMoveRef.current();
          setFilterFocused(true);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) => gridMove(prev, 3, "up", navLength));
      },

      onDown: () => {
        if (chestFocusedRef.current) {
          playMoveRef.current();
          setChestFocused(false);
          if (filterConfigRef.current) {
            setFilterFocused(true);
          } else {
            setSelectedIndex(0);
          }
          return;
        }

        if (filterFocusedRef.current && filterConfigRef.current) {
          playMoveRef.current();
          const cfg = filterConfigRef.current;
          const idx = cfg.labels.findIndex((l) => l.type === cfg.active);
          const nextIdx = circularNext(idx, cfg.labels.length);
          cfg.onChange(cfg.labels[nextIdx]!.type);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) => gridMove(prev, 3, "down", navLength));
      },

      onLeft: () => {
        if (chestFocusedRef.current) return;

        if (filterFocusedRef.current) return;

        if (navLength === 0) {
          if (filterConfigRef.current) {
            playMoveRef.current();
            setFilterFocused(true);
          } else if (chestReadyRef.current) {
            playMoveRef.current();
            setChestFocused(true);
          }
          return;
        }

        playMoveRef.current();

        // Coluna esquerda devolve o foco para as abas superiores.
        if (selectedIndexRef.current % 3 === 0) {
          onFocusTabsRef.current();
          return;
        }

        setSelectedIndex((prev) => gridMove(prev, 3, "left", navLength));
      },

      onRight: () => {
        if (chestFocusedRef.current) return;

        if (filterFocusedRef.current) {
          playMoveRef.current();
          setFilterFocused(false);
          setSelectedIndex(0);
          return;
        }

        if (navLength === 0) return;
        playMoveRef.current();
        setSelectedIndex((prev) => gridMove(prev, 3, "right", navLength));
      },

      onConfirm: () => {
        if (chestFocusedRef.current) {
          playSelectRef.current();
          onOpenChestRef.current();
          return true;
        }

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
    onOpenChestRef,
    onFocusTabsRef,
    playMoveRef,
    playSelectRef,
    pushControlsRef,
    chestFocusedRef,
    filterFocusedRef,
    handleUseItemRef,
    selectedIndexRef,
  ]);

  return {
    selectedIndex,
    filterFocused,
    setFilterFocused,
    chestFocused,
  };
}
