import { useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router";

import { SceneBase } from "@/components/Game/Scenes/Base";
import { CAFETERIA_SCENES } from "@/scenes/cafeteria";
import { createCafeteria } from "@/interactions/cafeteria";
import { CAFETERIA_RETURN_KEY } from "@/data/storageKeys";
import { CAFETERIA_FRIDGE, CAFETERIA_STOVE } from "@/data/containers";

import { useInventory } from "@/contexts/InventoryContext";
import { useQuestActions } from "@/hooks/quest/useQuestActions";
import { useFlags } from "@/contexts/FlagContext";
import { useGroundItems } from "@/contexts/GroundItemContext";
import { usePlayer } from "@/contexts/PlayerContext";

import { useRandomEncounter } from "@/hooks/scene/randomEncounter/useRandomEncounter";
import { useContainer } from "@/hooks/container/useContainer";

import { Container } from "@/components/Game/Map/Container";
import Talking from "@/components/Game/Interactions/Talking";
import { INTERACTION_LABELS } from "@/data/messages";
import { useFoodPlateEncounter } from "@/hooks/scene/useFoodPlateEncounter";
import type { DialogueSystem } from "@/utils/types/sceneHooks";
import { RaparigaEncounter } from "@/components/Game/SceneObjects/RaparigaEncounter";

type Props = {
  sceneId: SceneId;
};

export function CafeteriaScene({ sceneId }: Props) {
  const scene = CAFETERIA_SCENES[sceneId];

  // Food plate encounter system
  const foodPlateEncounter = useFoodPlateEncounter();

  const sceneWithRapariga = useMemo(() => {
    if (!scene) return null;
    if (foodPlateEncounter.raparigaState === "idle") return scene;
    return {
      ...scene,
      npcs: [
        ...(scene.npcs ?? []),
        {
          id: "rapariga-encounter",
          src: foodPlateEncounter.raparigaSprite,
          gridX: foodPlateEncounter.raparigaPos.gridX,
          gridY: foodPlateEncounter.raparigaPos.gridY,
          flipX: foodPlateEncounter.raparigaFlipX,
          size: 1.7,
          interaction: (dialogueSystem: DialogueSystem) => {
            if (foodPlateEncounter.raparigaState === "eating") {
              // Dispara o diálogo da Rapariga; a ChoiceBox aparece após a 3ª fala
              foodPlateEncounter.startRaparigaDialogue(dialogueSystem);
            }
          },
        },
      ],
    };
  }, [scene, foodPlateEncounter]);

  const { addItem, hasItem, removeItem, giveItem, npcGiveItem } =
    useInventory();
  const { progressQuest } = useQuestActions();
  const { setFlag } = useFlags();
  const { addLoot } = useGroundItems();
  const { player } = usePlayer();
  const location = useLocation();

  const [popup, setPopup] = useState<string | null>(null);

  const fridge = useContainer({
    storageKey: CAFETERIA_FRIDGE.storageKey,
    defaultSlots: CAFETERIA_FRIDGE.defaultSlots,
    size: CAFETERIA_FRIDGE.size,
    cols: CAFETERIA_FRIDGE.cols,
    onPickup: (_index, slot) => {
      addItem(slot, { showToast: true });
      setFlag("picked_sausage");
      progressQuest("go_cafeteria", 1);
      return true;
    },
  });

  const stove = useContainer({
    storageKey: CAFETERIA_STOVE.storageKey,
    defaultSlots: CAFETERIA_STOVE.defaultSlots,
    size: CAFETERIA_STOVE.size,
    cols: CAFETERIA_STOVE.cols,
    respawn: CAFETERIA_STOVE.respawn,
    onPickup: (_index, slot) => {
      addItem(slot, { showToast: true });
      setFlag("picked_food_plate");
      progressQuest("go_cafeteria", 1);
      return true;
    },
  });

  // Interação para dropar foodPlate no chão
  const dropFoodPlate = useCallback(() => {
    if (!hasItem("foodPlate")) {
      setPopup("Você não tem prato de comida para deixar no chão.");
      return;
    }
    removeItem("foodPlate", 1);
    const locationId = location.pathname ?? "cafeteria";
    addLoot(locationId, Math.floor(player.gridX), Math.floor(player.gridY), [
      { id: "foodPlate", qty: 1, droppedAt: Date.now() },
    ]);
    setPopup(
      "Você deixou o prato de comida no chão. Cuidado para não estragar!",
    );
  }, [
    hasItem,
    removeItem,
    addLoot,
    player.gridX,
    player.gridY,
    location.pathname,
  ]);

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
        openContainer: (container?: string) => {
          if (container === "fridge") {
            fridge.open();
            return;
          }
          if (container === "stove") {
            stove.open();
            return;
          }
        },
        dropFoodPlate,
      }),
    [
      addItem,
      hasItem,
      removeItem,
      giveItem,
      npcGiveItem,
      setPopup,
      progressQuest,
      fridge,
      stove,
      dropFoodPlate,
    ],
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
        scene={sceneWithRapariga ?? scene}
        background={scene.background}
        interactions={interactions}
        interactionLabels={{
          "6,4": INTERACTION_LABELS.OPEN,
          "15,4": INTERACTION_LABELS.OPEN,
        }}
        popup={popup}
        setPopup={setPopup}
        cameraTargetOverride={foodPlateEncounter.cameraTarget}
      />

      {popup && <Talking name="Sistema" message={popup} />}

      <RaparigaEncounter
        raparigaState={foodPlateEncounter.raparigaState}
        showChoiceBox={foodPlateEncounter.showChoiceBox}
        handleChoice={foodPlateEncounter.handleChoice}
      />

      <Container
        isOpen={fridge.isOpen}
        label={CAFETERIA_FRIDGE.label}
        cols={CAFETERIA_FRIDGE.cols}
        size={CAFETERIA_FRIDGE.size}
        slots={fridge.slots}
        selectedIndex={fridge.selectedIndex}
      />

      <Container
        isOpen={stove.isOpen}
        label={CAFETERIA_STOVE.label}
        cols={CAFETERIA_STOVE.cols}
        size={CAFETERIA_STOVE.size}
        slots={stove.slots}
        selectedIndex={stove.selectedIndex}
      />
    </>
  );
}
