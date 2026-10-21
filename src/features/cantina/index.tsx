import { useMemo, useState } from "react";

import { SceneBase } from "@/components/Game/Scenes/Base";
import { CANTINA_SCENES } from "@/scenes/cantina";
import { createCantina } from "@/interactions/cantina";
import { npcPath, itemPath } from "@/utils/paths";
import type { MessageCardConfig } from "@/utils/types/interaction";

import { useInventory } from "@/contexts/InventoryContext";
import { useFlags } from "@/contexts/FlagContext";

import { cantinaBrothersDialogue } from "@/data/dialogues/cantina/brothers";
import { sceneBackgrounds } from "@/data/scene/background";

import Talking from "@/components/Game/Interactions/Talking";
import { MessageCard } from "@/components/Game/Interactions/MessageCard";
import { JesoFoodBadge } from "@/components/Game/Map/JesoFoodBadge";
import { cantinaJesoDialogue } from "@/data/dialogues/cantina/jeso";
import { cantinaJesoTwoDialogue } from "@/data/dialogues/cantina/jesoTwo";
import { useJesoFoodCooldown } from "@/hooks/jesoFood/useJesoFoodCooldown";

type Props = {
  sceneId: SceneId;
};

export function CantinaScene({ sceneId }: Props) {
  const scene = CANTINA_SCENES[sceneId];
  const { addItem, npcGiveItem } = useInventory();
  const { isReady, giveFood } = useJesoFoodCooldown();
  const { hasFlag, setFlag } = useFlags();

  const [popup, setPopup] = useState<string | null>(null);
  const [messageCardConfig, setMessageCardConfig] =
    useState<MessageCardConfig | null>(null);
  const gotKey = hasFlag("picked_orange_juice");

  // ✅ interações específicas da cantina
  const interactions = useMemo(
    () =>
      createCantina({
        addItem,
        setPopup,
        gotKey,
        setFlag,
        showMessageCard: (config) => {
          setMessageCardConfig(config);
        },
      }),
    [addItem, gotKey, setFlag, setMessageCardConfig],
  );

  const sceneWithJeso = useMemo(() => {
    if (!scene) return null;
    return {
      ...scene,
      npcs: (scene.npcs ?? []).map((npc) =>
        typeof npc.src === "string" &&
        npc.src === npcPath("/jeso/default.svg") &&
        sceneId === "two"
          ? {
              ...npc,
              interaction: (startDialogue: (d: Dialogue[]) => void) => {
                if (isReady) {
                  const foods = giveFood();
                  for (const id of foods) {
                    // NPC Jeso entrega comida: usa npcGiveItem para mostrar toast com imagem do Jeso
                    npcGiveItem(id as ItemId, "Jeso", "npc/jeso/right.svg");
                  }
                  startDialogue(cantinaJesoDialogue);
                } else {
                  startDialogue(cantinaJesoTwoDialogue);
                }
              },
            }
          : npc,
      ),
    };
  }, [scene, sceneId, isReady, giveFood, npcGiveItem]);

  if (!scene || !sceneWithJeso) {
    return <div>Scene não encontrada</div>;
  }

  return (
    <>
      <SceneBase
        scene={sceneWithJeso}
        className="Cantina"
        background={sceneBackgrounds.Cantina}
        interactions={interactions}
        itemPickupTiles={[
          {
            x: 16.8,
            y: 3.5,
            visible: !gotKey,
            image: itemPath("orange_juice.svg"),
            size: 0.4,
          },
        ]}
        popup={popup}
        setPopup={setPopup}
        tileDialogues={{
          "19,3": cantinaBrothersDialogue,
        }}
        npcOverlays={
          sceneId === "two"
            ? [{ gridX: 11, gridY: 3, element: <JesoFoodBadge /> }]
            : undefined
        }
      />

      {/* ✅ popup continua fora do SceneBase */}
      {popup && <Talking name="Sistema" message={popup} />}

      {messageCardConfig && (
        <MessageCard
          title={messageCardConfig.title}
          subtitle={messageCardConfig.subtitle}
          description={messageCardConfig.description}
          numberedCount={messageCardConfig.numberedCount}
          onClose={() => setMessageCardConfig(null)}
        />
      )}
    </>
  );
}
