import { itemPath, chestPath } from "@/utils/paths";
import { useCallback, useMemo, useState } from "react";

import { SceneBase } from "@/components/Game/Scenes/Base";
import { LIBRARY_SCENES } from "@/scenes/library";
import { createLibrary } from "@/interactions/library";

import { useInventory } from "@/contexts/InventoryContext";
import { useFlags } from "@/contexts/FlagContext";
import { useQuests } from "@/contexts/QuestContext";

import { useNavigate, useLocation } from "react-router";

import { LIBRARY_RETURN_KEY } from "@/data/storageKeys";

import { useRandomEncounter } from "@/hooks/scene/randomEncounter/useRandomEncounter";

import Talking from "@/components/Game/Interactions/Talking";

type Props = {
  sceneId: SceneId;
};

export function LibraryScene({ sceneId }: Props) {
  const scene = LIBRARY_SCENES[sceneId];
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useInventory();
  const { hasFlag, setFlag } = useFlags();
  const { quests } = useQuests();

  const [popup, setPopup] = useState<string | null>(null);
  const gotPackage = hasFlag("picked_package_01");
  const gotChest = hasFlag("picked_rare_chest");

  const navigateFrom = useCallback(
    (to: string) => {
      void navigate(to, { state: { from: location.pathname } });
    },
    [navigate, location.pathname],
  );

  const interactions = useMemo(
    () =>
      createLibrary({
        addItem,
        setPopup,
        quests,
        navigate: navigateFrom,
        packageDeps: { gotKey: gotPackage, setFlag },
        chestDeps: { gotKey: gotChest, setFlag },
      }),
    [addItem, gotPackage, gotChest, quests, navigateFrom, setPopup, setFlag],
  );

  useRandomEncounter({
    storageKey: LIBRARY_RETURN_KEY,
    blockedTiles: [
      { x: 4, y: 3 },
      { x: 4, y: 2 },
      { x: 14, y: 2 },
      { x: 14, y: 3 },
      { x: 8, y: 10 },
      { x: 8, y: 2 },
      { x: 8, y: 3 },
    ],
    encounters: [
      { route: "/battle/hungry", weight: 361 },
      { route: "/battle/vandinhafragment", weight: 19 },
    ],
    npcLevelRange: sceneId === "secret-passage" ? [8, 12] : [1, 4],
    alfaChance: 0.005,
    locationId: "library",
  });

  if (!scene) {
    return <div>Scene não encontrada</div>;
  }

  return (
    <>
      <SceneBase
        scene={scene}
        background={scene.background}
        interactions={interactions}
        itemPickupTiles={[
          {
            x: 15,
            y: 9,
            visible: !gotPackage,
            image: itemPath("package_01.svg"),
          },
          {
            x: 3,
            y: 5,
            visible: !gotChest,
            image: chestPath("rare.svg"),
          },
        ]}
        popup={popup}
        setPopup={setPopup}
      />

      {popup && <Talking name="Sistema" message={popup} />}
    </>
  );
}
