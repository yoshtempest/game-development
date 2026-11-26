import { useCallback, useMemo } from "react";
import { useLocation } from "react-router";

import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";

import { useCompressedStorage } from "@/hooks/useCompressedStorage";
import { useLatestRef } from "@/hooks/useLatestRef";

import {
  NO_RICK_PRIME_PROGRESS,
  normalizeRickPrimeProgress,
  pickRickPrimeEpisode,
  type RickPrimeProgress,
} from "@/gameRules/npc/rickPrimePodcast";

import { RICK_PRIME_PODCAST } from "@/data/dialogues/rickPrimePodcast";
import { rickPrimeLostPatienceDialogue } from "@/data/dialogues/rickPrimePodcast/lostPatience";
import { RICK_PRIME_PODCAST_KEY } from "@/data/storageKeys";

import { npcPath } from "@/utils/paths";
import type { SceneNPCData } from "@/utils/types/maps/exploreScene";
import type { DialogueSystem } from "@/utils/types/sceneHooks";

/** Rota da luta registrada em `BATTLE_CONFIGS.rickPrime`. */
export const RICK_PRIME_BATTLE_ROUTE = "/battle/rickprime";

type Props = {
  gridX: number;
  gridY: number;
};

/**
 * Rick Prime na exploração (issue #442): cada conversa é um encontro, que
 * sorteia um episódio inédito do podcast e o marca como ouvido. Quando não
 * sobra episódio, ele perde a paciência e a conversa termina na batalha.
 *
 * O progresso é lido por ref no clique (e não capturado no `useMemo`) para
 * dois cliques seguidos antes do re-render não sortearem o mesmo episódio.
 * O `setProgress` recebe o valor pronto — nada de side effect dentro de
 * updater (regra 1 do AGENTS.md).
 *
 * Depois que a fala acaba, o contador não volta: falar de novo com ele após
 * a luta reabre a luta (revanche), em vez de reiniciar o podcast.
 */
export function useRickPrimeEncounter({ gridX, gridY }: Props) {
  const { navigateWithFade } = useTransitionCtx();
  const location = useLocation();

  const [progress, setProgress] = useCompressedStorage<RickPrimeProgress>(
    RICK_PRIME_PODCAST_KEY,
    NO_RICK_PRIME_PROGRESS,
    normalizeRickPrimeProgress,
  );
  const progressRef = useLatestRef(progress);

  const talk = useCallback(
    (dialogueSystem: DialogueSystem) => {
      const current = progressRef.current;
      const episode = pickRickPrimeEpisode(current, RICK_PRIME_PODCAST);

      const next: RickPrimeProgress = {
        encounters: current.encounters + 1,
        heard: episode ? [...current.heard, episode.id] : current.heard,
      };
      progressRef.current = next;
      setProgress(next);

      if (episode) {
        dialogueSystem.start(episode.dialogue);
        return;
      }

      dialogueSystem.start(rickPrimeLostPatienceDialogue, () => {
        navigateWithFade(RICK_PRIME_BATTLE_ROUTE, {
          state: { battleOrigin: location.pathname },
        });
      });
    },
    [progressRef, setProgress, navigateWithFade, location.pathname],
  );

  const rickPrimeNpc = useMemo<SceneNPCData>(
    () => ({
      id: "rickPrime",
      gridX,
      gridY,
      src: npcPath("/rickPrime/default.svg"),
      interaction: talk,
    }),
    [gridX, gridY, talk],
  );

  return { rickPrimeNpc };
}
