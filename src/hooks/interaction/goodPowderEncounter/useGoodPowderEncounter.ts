import type { Props } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTombstones } from "@/contexts/TombstoneContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { goodPowderDialogue } from "@/data/dialogues/goodPowder";
import { getNpcDisplayName } from "@/data/npc";
import { npcPath } from "@/utils/paths";
import { getTileInFront } from "@/utils/getTileInFront";

export type GoodPowderEncounter = {
  npcType: string;
  route: string;
};


export function useGoodPowderEncounter({
  map,
  isReady,
  dialogueSystem,
  navigateWithFade,
  locationId,
}: Props) {
  const { player } = usePlayer();
  const { prepareTombstoneSpawn } = useTombstones();
  const location = useLocation();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState<GoodPowderEncounter | null>(null);
  const encounterFromLocation = (
    location.state as { goodPowderEncounter?: GoodPowderEncounter } | null
  )?.goodPowderEncounter;

  const handledRef = useRef(false);
  const navigateRef = useLatestRef(navigate);
  const navigateWithFadeRef = useLatestRef(navigateWithFade);

  useEffect(() => {
    if (!encounterFromLocation) return;
    handledRef.current = false;
    setEncounter(encounterFromLocation);
  }, [encounterFromLocation]);

  const encounterDialogue = useMemo(() => {
    if (!encounter) return null;

    const name = getNpcDisplayName(encounter.npcType);

    return goodPowderDialogue.map((line) =>
      line.src === "npc"
        ? { ...line, name, src: npcPath(`/${encounter.npcType}/default.svg`) }
        : line,
    );
  }, [encounter]);

  useEffect(() => {
    if (!encounter || !isReady) return;
    if (handledRef.current) return;
    handledRef.current = true;

    const route = encounter.route;
    const origin = location.pathname;

    dialogueSystem.start(encounterDialogue ?? [], () => {
      if (locationId) {
        prepareTombstoneSpawn({
          gridX: player.gridX,
          gridY: player.gridY,
          direction: player.direction,
          locationId,
        });
      }
      navigateWithFadeRef.current(route, { state: { battleOrigin: origin } });
    });

    // limpa o estado da rota para o retorno da batalha não reagendar o cutscene
    void navigateRef.current(location.pathname, {
      replace: true,
      state: {
        ...((location.state as Record<string, unknown> | null) ?? {}),
        goodPowderEncounter: null,
      },
    });
  }, [
    encounter,
    isReady,
    dialogueSystem,
    encounterDialogue,
    location.pathname,
    location.state,
    navigateRef,
    navigateWithFadeRef,
    locationId,
    prepareTombstoneSpawn,
    player,
  ]);

  const encounterNpc = useMemo(() => {
    if (!encounter) return null;

    const front = getTileInFront(player, map);

    return {
      gridX: front.x,
      gridY: front.y,
      src: npcPath(`/${encounter.npcType}/default.svg`),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter, player.gridX, player.gridY, player.direction, map]);

  return { encounterNpc };
}
