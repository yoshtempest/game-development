import { useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { BESTIARY_NPC_ORDER } from "@/data/bestiary";

export function useBestiaryMenu(
  isOpen: boolean,
  listRef?: React.RefObject<HTMLDivElement | null>,
  itemCount = BESTIARY_NPC_ORDER.length,
) {
  const { pushControls } = useGameControls();
  const { playMove } = useMenuSFX();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(selectedIndex);
  // A navegação precisa enxergar a lista filtrada, mas não deve empilhar a
  // layer de controle de novo toda vez que um filtro mudar.
  const itemCountRef = useLatestRef(itemCount);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (!listRef?.current) return;

    const selectedElement = listRef.current.children[
      selectedIndex
    ] as HTMLElement;
    if (!selectedElement) return;

    selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex, listRef]);

  const playMoveRef = useLatestRef(playMove);
  const pushControlsRef = useLatestRef(pushControls);

  useEffect(() => {
    if (!isOpen) return;

    const controls = {
      onUp: () => {
        playMoveRef.current();
        const last = Math.max(0, itemCountRef.current - 1);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : last));
      },

      onDown: () => {
        playMoveRef.current();
        const last = Math.max(0, itemCountRef.current - 1);
        setSelectedIndex((prev) => (prev < last ? prev + 1 : 0));
      },

      onConfirm: () => true,

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [isOpen, itemCountRef, playMoveRef, pushControlsRef]);

  return {
    selectedIndex,
    setSelectedIndex,
    npcIds: BESTIARY_NPC_ORDER,
  };
}
