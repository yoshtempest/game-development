import { useCallback, useMemo, useState } from "react";

import { doofusRickDialogue } from "@/data/dialogues/doofusRick";

import { npcPath } from "@/utils/paths";
import type { SceneNPCData } from "@/utils/types/maps/exploreScene";
import type { DialogueSystem } from "@/utils/types/sceneHooks";

export type DoofusRickSpot = {
  gridX: number;
  gridY: number;
};

/**
 * Doofus Rick "anda" pela região (issue #445): a cada montagem da cena ele
 * aparece num dos pontos candidatos, sorteado uma vez no inicializador do
 * `useState` — sortear no render faria ele pular de tile a cada re-render.
 * Não é persistido de propósito: voltar à cena é o que o faz mudar de lugar.
 *
 * Sem pontos candidatos ele não aparece (`null`), em vez de nascer num tile
 * arbitrário que pode ser parede.
 */
export function useDoofusRick(spots: readonly DoofusRickSpot[]) {
  const [spot] = useState<DoofusRickSpot | null>(
    () => spots[Math.floor(Math.random() * spots.length)] ?? null,
  );

  const talk = useCallback((dialogueSystem: DialogueSystem) => {
    dialogueSystem.start(doofusRickDialogue);
  }, []);

  const doofusRickNpc = useMemo<SceneNPCData | null>(
    () =>
      spot
        ? {
            id: "doofusRick",
            gridX: spot.gridX,
            gridY: spot.gridY,
            src: npcPath("/doofusRick/default.svg"),
            interaction: talk,
          }
        : null,
    [spot, talk],
  );

  return { doofusRickNpc };
}
