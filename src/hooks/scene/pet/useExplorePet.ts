import { useCallback, useEffect } from "react";

import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";

import {
  getPetRole,
  getPetSkillDefinition,
} from "@/data/characters/pets/petSkills";

import { petNpcType } from "@/utils/character/petVisuals";
import { KEYBOARD_ACTIONS } from "@/utils/keyboardMapping";

type Props = {
  /** false enquanto há diálogo aberto: montar no meio da fala não faz sentido. */
  enabled: boolean;
};

export type ExplorePet = {
  /** Pasta do sprite do pet (`public/assets/npcs/pets/<npcType>/`). */
  npcType: string;
  /** Estrelas do pet equipado (1..5), para o mesmo brilho do menu de pets. */
  stars: number;
};

export type ExplorePetState = {
  /** Pet equipado, ou null sem pet. */
  pet: ExplorePet | null;
  /** Pet equipado é de montaria (só esses podem ser montados). */
  canMount: boolean;
  mounted: boolean;
  toggleMount: () => void;
};

const MOUNT_KEYS: readonly string[] = KEYBOARD_ACTIONS.mountPet;

/**
 * Pet equipado na exploração e o montar/desmontar da montaria (#513).
 *
 * Montar só grava a preferência (`player.petDismounted`); quem decide
 * `hasPeru` — e, com ele, o sprite montado e o passo duplo da passiva
 * "Andarilho" — continua sendo o effect do `PlayerContext`, para existir um
 * único lugar que combina "pet equipado" com "montado".
 *
 * A tecla é ouvida direto na `window` em vez de entrar na pilha do
 * `GameControlsContext`: a pilha só conhece as ações fixas de um layer
 * (direção/confirmar/cancelar). O gate é `player.mode === "explore"`, que
 * deixa de valer quando qualquer menu/tela abre por cima da cena.
 */
export function useExplorePet({ enabled }: Props): ExplorePetState {
  const { player, setPlayer } = usePlayer();
  const { getEquippedInfo } = useEquipment();

  const equippedPet = getEquippedInfo(player.character, "pet");
  const canMount =
    equippedPet != null && getPetRole(equippedPet.id) === "montaria";
  const mounted = canMount && !player.petDismounted;
  const isExplore = player.mode === "explore";

  const pet: ExplorePet | null =
    equippedPet == null
      ? null
      : {
          npcType:
            getPetSkillDefinition(equippedPet.id)?.npcType ??
            petNpcType({ id: equippedPet.id }),
          stars: equippedPet.enhance + 1,
        };

  const toggleMount = useCallback(() => {
    setPlayer((prev) => ({ ...prev, petDismounted: !prev.petDismounted }));
  }, [setPlayer]);

  useEffect(() => {
    if (!enabled || !canMount || !isExplore) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || !MOUNT_KEYS.includes(event.key)) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      toggleMount();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, canMount, isExplore, toggleMount]);

  return { pet, canMount, mounted, toggleMount };
}
