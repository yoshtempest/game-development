import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useFlags } from "@/contexts/FlagContext";
import { getSelectableCharacters } from "@/gameRules/menu/selectableCharacters";
import {
  circularNext,
  circularPrev,
  gridMove,
} from "@/gameRules/menu/navigation";
import { getSelected } from "@/gameRules/menu/selection";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useCharacterVoice } from "@/hooks/audio/useCharacterVoice";
import { CharacterCard } from "@/components/Game/Navbar/shared/CharacterCard";

export function Characters() {
  const { player, setCharacter } = usePlayer();
  const { progress } = useCharacterProgress();
  const { hasFlag } = useFlags();
  const { playMove, playSelect } = useMenuSFX();
  const listRef = useRef<HTMLDivElement>(null);

  const selectableCharacters = useMemo(
    () =>
      getSelectableCharacters({
        samurionUnlocked: hasFlag("samurionUnlocked"),
        yvelUnlocked: hasFlag("yvelUnlocked"),
        srGuaxinimUnlocked: hasFlag("srGuaxinimUnlocked"),
      }),
    [hasFlag],
  );

  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.max(
      0,
      selectableCharacters.findIndex((c) => c.image === player.character),
    ),
  );

  const selectedIndexRef = useLatestRef(selectedIndex);
  const selectableCharactersRef = useLatestRef(selectableCharacters);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const setCharacterRef = useLatestRef(setCharacter);
  const playVoice = useCharacterVoice();
  const playVoiceRef = useLatestRef(playVoice);

  useGameControlsLayer(
    {
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
        setCharacterRef.current(selected.image);
        playVoiceRef.current(selected.image);
        return true;
      },
      blockGlobalOpen: true,
    },
    [],
  );

  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as
      HTMLElement | undefined;
    selectedElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      className={`containerOfNavbar ${styles.charactersContainer}`}
    >
      {selectableCharacters.map((char, index) => {
        const charProgress = progress[char.image];
        const isSelected = index === selectedIndex;

        return (
          <CharacterCard
            key={char.name}
            character={char}
            isSelected={isSelected}
            progress={charProgress}
          />
        );
      })}
    </div>
  );
}
