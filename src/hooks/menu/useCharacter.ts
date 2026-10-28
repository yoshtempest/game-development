import { useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { CHARACTERS } from "@/data/options/characters";
import {
  circularNext,
  circularPrev,
  gridMove,
} from "@/gameRules/menu/navigation";
import { getSelected } from "@/gameRules/menu/selection";
import { getSelectableCharacters } from "@/gameRules/menu/selectableCharacters";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useFlags } from "@/contexts/FlagContext";

export function useCharacterMenu(
  isOpen: boolean,
  listRef?: React.RefObject<HTMLDivElement | null>,
) {
  const { player, setCharacter } = usePlayer();
  const playerCharacter = player.character;
  const { pushControls } = useGameControls();
  const { playMove, playSelect } = useMenuSFX();
  const { hasFlag } = useFlags();

  const flags = {
    samurionUnlocked: hasFlag("samurionUnlocked"),
    yvelUnlocked: hasFlag("yvelUnlocked"),
    srGuaxinimUnlocked: hasFlag("srGuaxinimUnlocked"),
  };

  const selectableCharacters = getSelectableCharacters(flags);

  const characters = CHARACTERS.map((c) => ({
    ...c,
    selectable:
      c.selectable ||
      (c.image === "samurion" && flags.samurionUnlocked) ||
      (c.image === "yvel" && flags.yvelUnlocked) ||
      (c.image === "srGuaxinim" && flags.srGuaxinimUnlocked),
  }));

  // Personagem cujas habilidades estão em tela (null = mostrando os cards).
  const [abilitiesFor, setAbilitiesFor] = useState<CharacterId | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(
      0,
      selectableCharacters.findIndex((c) => c.image === playerCharacter),
    ),
  );
  const selectedIndexRef = useRef(selectedIndex);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const handleChooseCharacterRef = useRef<(id: CharacterId) => void>(() => {});
  handleChooseCharacterRef.current = (id: CharacterId) => setCharacter(id);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const pushControlsRef = useLatestRef(pushControls);
  const selectableCharactersRef = useLatestRef(selectableCharacters);

  // 🎮 CONTROLES
  useEffect(() => {
    // Com a lista de habilidades aberta quem responde por up/down é ela — as
    // duas camadas ativas juntas fariam o cursor andar em paralelo.
    if (abilitiesFor) return;

    const controls = {
      onRight: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          circularNext(prev, selectableCharactersRef.current.length),
        );
      },

      onLeft: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          circularPrev(prev, selectableCharactersRef.current.length),
        );
      },

      onDown: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "down", selectableCharactersRef.current.length),
        );
      },

      onUp: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "up", selectableCharactersRef.current.length),
        );
      },

      onConfirm: () => {
        playSelectRef.current();
        const selected = getSelected(
          selectableCharactersRef.current,
          selectedIndexRef.current,
        );
        handleChooseCharacterRef.current(selected.image);
        return true;
      },

      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [
    playMoveRef,
    playSelectRef,
    pushControlsRef,
    selectableCharactersRef,
    abilitiesFor,
  ]);

  useEffect(() => {
    if (abilitiesFor) return;
    if (!isOpen || !listRef?.current) return;
    const container = listRef.current;
    const selectedElement = container.children[selectedIndex] as HTMLElement;
    if (!selectedElement) return;
    selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isOpen, selectedIndex, listRef, abilitiesFor]);

  const closeAbilities = useStableCallback(() => setAbilitiesFor(null));

  return {
    characters,
    selectableCharacters,
    selectedIndex,
    abilitiesFor,
    openAbilities: setAbilitiesFor,
    closeAbilities,
  };
}
