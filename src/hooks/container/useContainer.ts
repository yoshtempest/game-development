import { useCallback, useEffect, useRef, useState } from "react";

import { useGameControls } from "@/contexts/GameControlsContext";
import { gridMove } from "@/gameRules/menu/navigation";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useCompressedStorage } from "@/hooks/useCompressedStorage";

import type { SlotScopedKey } from "@/services/save/slotManager";
import type { ContainerSlots } from "@/utils/types/container";
import type { InventoryItem } from "@/utils/types/player/inventory";

type RespawnConfig = {
  /** Intervalo em milissegundos para o item reaparecer. */
  intervalMs: number;
  /** Índice do slot que deve ter o item respawnado. */
  slot: number;
  /** Item que será colocado no slot quando fizer respawn. */
  item: InventoryItem;
};

type Params = {
  storageKey: SlotScopedKey;
  defaultSlots: ContainerSlots;
  size: number;
  cols?: number;
  onPickup?: (index: number, slot: InventoryItem) => boolean;
  onClose?: () => void;
  /** Configuração opcional de respawn do item. */
  respawn?: RespawnConfig;
};

export function useContainer({
  storageKey,
  defaultSlots,
  size,
  cols = 3,
  onPickup,
  onClose,
  respawn,
}: Params) {
  const { pushControls } = useGameControls();
  const { playMove, playSelect, playClose } = useMenuSFX();

  const [slots, setSlots] = useCompressedStorage<ContainerSlots>(
    storageKey,
    defaultSlots,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slotsRef = useLatestRef(slots);
  const selectedIndexRef = useLatestRef(selectedIndex);
  const colsRef = useLatestRef(cols);
  const sizeRef = useLatestRef(size);

  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const playCloseRef = useLatestRef(playClose);
  const onPickupRef = useLatestRef(onPickup);
  const onCloseRef = useLatestRef(onClose);
  const respawnRef = useLatestRef(respawn);

  // Ref para rastrear quando o item foi pego pela última vez (timestamp)
  const lastPickupTimeRef = useRef<number | null>(null);

  const open = useCallback(() => {
    setSelectedIndex(0);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    onCloseRef.current?.();
  }, [onCloseRef]);

  // Respawn logic: se configurado, verifica periodicamente se o item deve reaparecer
  useEffect(() => {
    if (!respawnRef.current) return;

    const { intervalMs, slot, item } = respawnRef.current;

    const checkAndRespawn = () => {
      // Se não houve pickup ainda, não faz nada (item já está lá no início)
      if (lastPickupTimeRef.current === null) return;

      const now = Date.now();
      const elapsed = now - lastPickupTimeRef.current;

      if (elapsed >= intervalMs) {
        // Verifica se o slot está vazio
        if (!slotsRef.current[slot]) {
          setSlots((prev) => {
            const next = [...prev];
            next[slot] = item;
            return next;
          });
          lastPickupTimeRef.current = null; // Reseta para não spammar
        }
      }
    };

    const interval = setInterval(checkAndRespawn, 1000); // Verifica a cada 1s
    return () => clearInterval(interval);
  }, [setSlots, slotsRef, respawnRef]);

  useEffect(() => {
    if (!isOpen) return;

    const controls = {
      onUp: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, colsRef.current, "up", sizeRef.current),
        );
        return true;
      },

      onDown: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, colsRef.current, "down", sizeRef.current),
        );
        return true;
      },

      onLeft: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, colsRef.current, "left", sizeRef.current),
        );
        return true;
      },

      onRight: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, colsRef.current, "right", sizeRef.current),
        );
        return true;
      },

      onConfirm: () => {
        const index = selectedIndexRef.current;
        const slot = slotsRef.current[index] ?? null;
        if (!slot) return true;

        const handled = onPickupRef.current?.(index, slot) ?? true;
        if (handled) {
          setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
          playSelectRef.current();

          // Se este é o slot de respawn, registra o tempo do pickup
          if (respawnRef.current && index === respawnRef.current.slot) {
            lastPickupTimeRef.current = Date.now();
          }
        }
        return true;
      },

      onCancel: () => {
        playCloseRef.current();
        close();
        return true;
      },

      blockGlobalOpen: true,
    };

    const remove = pushControls(controls);
    return remove;
  }, [
    isOpen,
    pushControls,
    close,
    setSlots,
    colsRef,
    onPickupRef,
    playCloseRef,
    playMoveRef,
    playSelectRef,
    selectedIndexRef,
    sizeRef,
    slotsRef,
    respawnRef,
  ]);

  return {
    isOpen,
    open,
    close,
    slots,
    setSlots,
    selectedIndex,
  };
}
