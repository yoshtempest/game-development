import { useMemo, useRef, useState } from "react";

import { useInventory } from "@/contexts/InventoryContext";
import { useQuests } from "@/contexts/QuestContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProfessionProgress } from "@/contexts/ProfessionProgressContext";
import { useProfessionBadge } from "@/contexts/ProfessionBadgeContext";

import { useRickPrimeEncounter } from "@/hooks/scene/rickPrime/useRickPrimeEncounter";
import {
  useDoofusRick,
  type DoofusRickSpot,
} from "@/hooks/scene/doofusRick/useDoofusRick";
import {
  useHasToolEquipped,
  useEquippedWeaponId,
} from "@/hooks/interaction/useHasToolEquipped";
import { createToolInteraction } from "@/interactions/builder";
import type { ToolDeps } from "@/utils/types/interaction";
import type { InventoryItem } from "@/utils/types/player/inventory";
import type { Character } from "@/utils/types/player/player";
import type {
  ProfessionId,
  ProfessionProficiency,
} from "@/utils/types/player/profession";

import { SceneBase } from "@/components/Game/Scenes/Base";
import Talking from "@/components/Game/Interactions/Talking";

import {
  JOMASIO_ENTRANCE_SCENES,
  jomasioEntranceRocks,
} from "@/scenes/jomasioEntrance";
import { sceneBackgrounds } from "@/data/scene/background";
import { ITEMS } from "@/data/items";
import {
  getOresByRockLevel,
  getLowestOreLevel,
} from "@/data/professions/oreLevels";
import {
  WOOD_LEVELS,
  getWoodLevelByTreeLevel,
} from "@/data/professions/woodLevels";
import { rollWoodGather } from "@/gameRules/professions/wood";
import { rollMineGather } from "@/gameRules/professions/mine";
import { rollProfessionMaterial } from "@/gameRules/professions/weapon";
import { rockGridKey, toRockTiles } from "@/gameRules/movement/rocks";
import { THREE_THOUSAND_MS } from "@/data/ms";
import {
  INTERACTION_LABELS,
  POPUP_MESSAGES,
  TOOL_REQUIRED_MESSAGES,
  gatherResult,
  professionLevelRequired,
} from "@/data/messages";

type Props = {
  sceneId: SceneId;
};

const MINE_COOLDOWN_MS = THREE_THOUSAND_MS;

/**
 * Tile do Rick Prime na entrada do Jomásio: canto esquerdo do pátio, livre
 * das rochas (y=10) e fora do caminho entre o spawn (7,12) e a porta (7,7).
 */
const RICK_PRIME_TILE = { gridX: 3, gridY: 11 };

/**
 * Pontos onde o Doofus Rick pode estar a cada visita. Só o pátio de baixo
 * (y=8..13) é alcançável — o de cima fica atrás da parede da linha 5 —, e
 * os pontos evitam as rochas (y=10), o tile do Rick Prime e o corredor
 * spawn → porta (x=7).
 */
const DOOFUS_RICK_SPOTS: readonly DoofusRickSpot[] = [
  { gridX: 2, gridY: 13 },
  { gridX: 5, gridY: 11 },
  { gridX: 11, gridY: 12 },
  { gridX: 12, gridY: 8 },
  { gridX: 14, gridY: 13 },
  { gridX: 15, gridY: 11 },
];

const ROCK_TILES = toRockTiles(jomasioEntranceRocks);

const ROCK_LABELS = Object.fromEntries(
  jomasioEntranceRocks.map((rock) => [
    rockGridKey(rock),
    INTERACTION_LABELS.MINE,
  ]),
);

type MineRockDeps = ToolDeps & {
  addItem: (item: InventoryItem) => void;
  character: Character;
  getProficiency: (
    character: Character,
    professionId: ProfessionId,
  ) => ProfessionProficiency;
  addProficiencyXP: (
    character: Character,
    professionId: ProfessionId,
    amount: number,
  ) => void;
  equippedWeaponId: string | null;
  showProfessionBadge: (profession: ProfessionId) => void;
};

export function JomasioEntranceScene({ sceneId }: Props) {
  const scene = JOMASIO_ENTRANCE_SCENES[sceneId];

  const { addItem, removeItem, hasItem } = useInventory();
  const { quests } = useQuests();
  const { player } = usePlayer();
  const { getProficiency, addProficiencyXP } = useProfessionProgress();
  const hasToolEquipped = useHasToolEquipped();
  const equippedWeaponId = useEquippedWeaponId();
  const { showProfessionBadge } = useProfessionBadge();

  const { rickPrimeNpc } = useRickPrimeEncounter(RICK_PRIME_TILE);
  const { doofusRickNpc } = useDoofusRick(DOOFUS_RICK_SPOTS);

  const sceneWithRicks = useMemo(
    () =>
      scene?.id === "one"
        ? {
            ...scene,
            npcs: [
              ...(scene.npcs ?? []),
              rickPrimeNpc,
              ...(doofusRickNpc ? [doofusRickNpc] : []),
            ],
          }
        : scene,
    [scene, rickPrimeNpc, doofusRickNpc],
  );

  const [popup, setPopup] = useState<string | null>(null);
  const lastMineTimeRef = useRef(0);

  const hasQuest = (id: string) => quests.some((q) => q.id === id);

  const interactions = useMemo(() => {
    const mineRock = (rockLevel: number) =>
      createToolInteraction<MineRockDeps>(
        "weapon_pickaxe",
        TOOL_REQUIRED_MESSAGES.PICKAXE,
        (deps) => {
          if (Date.now() - lastMineTimeRef.current < MINE_COOLDOWN_MS) {
            deps.setPopup(POPUP_MESSAGES.ROCK_ON_COOLDOWN);
            return;
          }
          lastMineTimeRef.current = Date.now();

          const { level } = deps.getProficiency(deps.character, "miner");

          const ores = getOresByRockLevel(rockLevel);
          if (ores.length === 0) {
            deps.setPopup(POPUP_MESSAGES.ROCK_WITHOUT_ORE);
            return;
          }

          if (level < rockLevel) {
            deps.setPopup(
              professionLevelRequired(
                "Mineiro",
                rockLevel,
                level,
                "minerar esta rocha",
              ),
            );
            return;
          }

          const result = rollMineGather(rockLevel, level);
          const rolled = result?.items ?? [];

          deps.showProfessionBadge("miner");

          const material = deps.equippedWeaponId
            ? rollProfessionMaterial(deps.equippedWeaponId)
            : null;
          if (material) rolled.push(material);

          rolled.forEach(({ itemId, qty }) =>
            deps.addItem({ id: itemId, qty }),
          );

          const summary = rolled
            .map(
              ({ itemId, qty }) => `${ITEMS[itemId]?.name ?? itemId} x${qty}`,
            )
            .join(", ");

          const xpGained = result?.xpGained ?? 0;
          deps.setPopup(
            gatherResult("Você minerou a rocha!", summary, xpGained, "Mineiro"),
          );

          if (xpGained > 0) {
            deps.addProficiencyXP(deps.character, "miner", xpGained);
          }
        },
      );

    const chopWood = (treeLevel: number) =>
      createToolInteraction<MineRockDeps>(
        "weapon_axe",
        TOOL_REQUIRED_MESSAGES.AXE,
        (deps) => {
          const { level } = deps.getProficiency(deps.character, "lumberjack");

          const wood = getWoodLevelByTreeLevel(treeLevel);
          if (!wood) {
            deps.setPopup(POPUP_MESSAGES.TREE_WITHOUT_WOOD);
            return;
          }

          if (level < wood.treeLevel) {
            deps.setPopup(
              professionLevelRequired(
                "Lenhador",
                wood.treeLevel,
                level,
                "lenhar esta árvore",
              ),
            );
            return;
          }

          const { items: rolled, xpGained } = rollWoodGather(wood, level);

          deps.showProfessionBadge("lumberjack");

          const material = deps.equippedWeaponId
            ? rollProfessionMaterial(deps.equippedWeaponId)
            : null;
          if (material) rolled.push(material);

          rolled.forEach(({ itemId, qty }) =>
            deps.addItem({ id: itemId, qty }),
          );

          const summary = rolled
            .map(
              ({ itemId, qty }) => `${ITEMS[itemId]?.name ?? itemId} x${qty}`,
            )
            .join(", ");

          deps.setPopup(
            gatherResult(
              "Você lenhou a árvore!",
              summary,
              xpGained,
              "Lenhador",
            ),
          );

          if (xpGained > 0) {
            deps.addProficiencyXP(deps.character, "lumberjack", xpGained);
          }
        },
      );

    const gatherDeps: MineRockDeps = {
      setPopup,
      addItem,
      hasToolEquipped,
      character: player.character,
      getProficiency,
      addProficiencyXP,
      equippedWeaponId,
      showProfessionBadge,
    };

    const rockInteractions = Object.fromEntries(
      jomasioEntranceRocks.map((rock) => [
        rockGridKey(rock),
        () => mineRock(getLowestOreLevel())(gatherDeps),
      ]),
    );

    return {
      ...rockInteractions,
      "5,7": () => chopWood(WOOD_LEVELS[0]?.treeLevel ?? 0)(gatherDeps),
    };
  }, [
    setPopup,
    addItem,
    hasToolEquipped,
    player.character,
    getProficiency,
    addProficiencyXP,
    equippedWeaponId,
    showProfessionBadge,
  ]);

  if (!sceneWithRicks) {
    return <div>Scene não encontrada</div>;
  }

  return (
    <>
      <SceneBase
        scene={sceneWithRicks}
        background={sceneBackgrounds.JomasioEntrance}
        interactions={interactions}
        interactionLabels={{
          ...ROCK_LABELS,
          "5,7": INTERACTION_LABELS.CHOP,
        }}
        itemPickupTiles={ROCK_TILES}
        popup={popup}
        setPopup={setPopup}
        onFinishExtra={() => ({
          addItem,
          removeItem,
          hasItem,
          hasQuest,
        })}
      />

      {popup && <Talking name="Sistema" message={popup} />}
    </>
  );
}
