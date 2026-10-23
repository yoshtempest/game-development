import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";
import { useTombstones } from "@/contexts/TombstoneContext";
import { useCompressedStorage } from "@/hooks/useCompressedStorage";
import { FOOTBALLCOURT_DOGS_KEY } from "@/data/storageKeys";
import { npcPath } from "@/utils/paths";
import type { SceneNPCData } from "@/utils/types/maps/exploreScene";
import {
  NO_DOGS,
  tileKey,
  type DogSpot,
  DOG_ALFA_SIZE,
  BATTLE_ROUTE,
} from "./constants";
import { normalizeDogSpots } from "./normalizeDogSpots";
import { reconcileSpots } from "./reconcileSpots";
import { rollDogLevel } from "./rollDogLevel";

export const FOOTBALLCOURT_DOG_LOCATION_ID = "footballCourt";

/**
 * Cães mortos de fome do campo: NPCs fixos que levam direto à batalha.
 * Permanecem nos mesmos locais até serem derrotados; ao ganhar, uma lápide
 * nasce no tile do cão (detectada aqui via tombstones) e outro cão ocupa
 * um novo ponto aleatório livre. Cada cão tem 10% de chance de ser alfa
 * (Black Mouth) e, nesse caso, renderiza 1.5x maior no modo explore.
 */

export function useFootballCourtDogs() {
  const { getTombstones, prepareTombstoneSpawn } = useTombstones();
  const { navigateWithFade } = useTransitionCtx();
  const location = useLocation();

  const tombstoneTiles = useMemo(
    () =>
      new Set(getTombstones(FOOTBALLCOURT_DOG_LOCATION_ID).active.map(tileKey)),
    [getTombstones],
  );

  const [rawSpots, setRawSpots] = useCompressedStorage<DogSpot[]>(
    FOOTBALLCOURT_DOGS_KEY,
    NO_DOGS,
    normalizeDogSpots,
  );

  const spots = useMemo(
    () => reconcileSpots(rawSpots, tombstoneTiles),
    [rawSpots, tombstoneTiles],
  );

  useEffect(() => {
    const same =
      spots.length === rawSpots.length &&
      spots.every((spot) =>
        rawSpots.some(
          (raw) =>
            raw.x === spot.x && raw.y === spot.y && raw.alfa === spot.alfa,
        ),
      );
    if (same) return;
    setRawSpots(spots);
  }, [spots, rawSpots, setRawSpots]);

  const dogNpcs = useMemo<SceneNPCData[]>(
    () =>
      spots.map((spot) => ({
        gridX: spot.x,
        gridY: spot.y,
        src: npcPath("/hungryDog/default.svg"),
        size: spot.alfa ? DOG_ALFA_SIZE : undefined,
        interaction: () => {
          prepareTombstoneSpawn({
            x: spot.x,
            y: spot.y,
            locationId: FOOTBALLCOURT_DOG_LOCATION_ID,
          });
          navigateWithFade(BATTLE_ROUTE, {
            state: {
              battleOrigin: location.pathname,
              npcLevel: rollDogLevel(),
              ...(spot.alfa ? { alfa: true } : {}),
            },
          });
        },
      })),
    [spots, prepareTombstoneSpawn, navigateWithFade, location.pathname],
  );

  return { dogNpcs };
}
