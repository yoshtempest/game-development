import { useEffect, useRef } from "react";
import type { AbilitySlot } from "@/components/Game/Scenes/Battle/components/Abilities/types";
import type { CharacterId } from "@/data/characters/list";

type Params = {
  abilitySlotsRef: React.RefObject<AbilitySlot[]>;
  controlsDisabled: boolean;
  isBattleNavOpen: boolean;
  playerMode: string;
  playerCharacter: CharacterId;
  triggerAbilityCameraFocus: (
    characterId: CharacterId,
    abilityId: string,
  ) => boolean;
};

export function useAbilityShortcuts({
  abilitySlotsRef,
  controlsDisabled,
  isBattleNavOpen,
  playerMode,
  playerCharacter,
  triggerAbilityCameraFocus,
}: Params) {
  const pressedAbilityKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (playerMode !== "battle") return;
      if (controlsDisabled) return;
      if (isBattleNavOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!/^[1-9]$/.test(e.key)) return;
      const idx = Number(e.key) - 1;
      const slot = abilitySlotsRef.current[idx];
      if (!slot || slot.disabled) return;
      if (slot.hold) {
        if (pressedAbilityKeysRef.current.has(e.key)) return;
        pressedAbilityKeysRef.current.add(e.key);
        slot.press?.();
        if (slot.abilityId) {
          triggerAbilityCameraFocus(playerCharacter, slot.abilityId);
        }
      } else {
        if (e.repeat) return;
        slot.click?.();
        if (slot.abilityId) {
          triggerAbilityCameraFocus(playerCharacter, slot.abilityId);
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (!/^[1-9]$/.test(e.key)) return;
      if (!pressedAbilityKeysRef.current.has(e.key)) return;
      pressedAbilityKeysRef.current.delete(e.key);
      const idx = Number(e.key) - 1;
      const slot = abilitySlotsRef.current[idx];
      slot?.release?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    controlsDisabled,
    isBattleNavOpen,
    playerMode,
    playerCharacter,
    triggerAbilityCameraFocus,
    abilitySlotsRef,
  ]);
}