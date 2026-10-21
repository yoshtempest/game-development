import { useMemo, useState } from "react";

import { SceneBase } from "@/components/Game/Scenes/Base";
import { CAFETERIA_SCENES } from "@/scenes/cafeteria";
import { createCafeteria } from "@/interactions/cafeteria";
import { CAFETERIA_RETURN_KEY } from "@/data/storageKeys";
import { CAFETERIA_FRIDGE } from "@/data/containers";

import { useInventory } from "@/contexts/InventoryContext";
import { useQuestActions } from "@/hooks/quest/useQuestActions";
import { useFlags } from "@/contexts/FlagContext";

import { useRandomEncounter } from "@/hooks/scene/randomEncounter/useRandomEncounter";
import { useContainer } from "@/hooks/container/useContainer";

import { Container } from "@/components/Game/Map/Container";
import Talking from "@/components/Game/Interactions/Talking";
import { INTERACTION_LABELS } from "@/data/messages";

type Props = {
  sceneId: SceneId;
};

export function CafeteriaScene({ sceneId }: Props) {
  const scene = CAFETERIA_SCENES[sceneId];

  const { addItem, hasItem, removeItem, giveItem, npcGiveItem } = useInventory();
  const { progressQuest } = useQuestActions();
  const { setFlag } = useFlags();

  const [popup, setPopup] = useState<string | null>(null);

  const fridge = useContainer({
    storageKey: CAFETERIA_FRIDGE.storageKey,
    defaultSlots: CAFETERIA_FRIDGE.defaultSlots,
    size: CAFETERIA_FRIDGE.size,
    cols: CAFETERIA_FRIDGE.cols,
    onPickup: (_index, slot) => {
      // showToast: true para exibir toast de item coletado da geladeira
      addItem(slot, { showToast: true });
      setFlag("picked_sausage");
      progressQuest("go_cafeteria", 1);
      return true;
    },
  });

  const interactions = useMemo(
    () =>
      createCafeteria({
        hasItem,
        addItem,
        removeItem,
        giveItem,
        npcGiveItem,
        setPopup,
        progressQuest,
        openContainer: fridge.open,
      }),
    [addItem, hasItem, removeItem, giveItem, npcGiveItem, setPopup, progressQuest, fridge.open],
  );

  useRandomEncounter({
    storageKey: CAFETERIA_RETURN_KEY,
    blockedTiles: [
      { x: 4, y: 4 },
      { x: 4, y: 3 },
      { x: 12, y: 3 },
      { x: 12, y: 4 },
      { x: 8, y: 10 },
      { x: 8, y: 2 },
      { x: 8, y: 3 },
    ],
    encounters: [
      { route: "/battle/rice", weight: 1 },
      { route: "/battle/piupiu", weight: 1 },
      { route: "/battle/goat", weight: 1 },
    ],
    npcLevelRange: [4, 8],
    alfaChance: 0.005,
    locationId: "cafeteria",
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
        interactionLabels={{ "15,4": INTERACTION_LABELS.OPEN }}
        popup={popup}
        setPopup={setPopup}
      />

      {popup && <Talking name="Sistema" message={popup} />}

      <Container
        isOpen={fridge.isOpen}
        label={CAFETERIA_FRIDGE.label}
        cols={CAFETERIA_FRIDGE.cols}
        size={CAFETERIA_FRIDGE.size}
        slots={fridge.slots}
        selectedIndex={fridge.selectedIndex}
      />
    </>
  );
}
