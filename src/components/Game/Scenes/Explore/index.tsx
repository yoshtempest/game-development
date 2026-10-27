import { usePlayer } from "@/contexts/PlayerContext";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useGameLayout } from "@/hooks/game/useGameLayout";
import { SmoothCamera } from "@/components/Game/Map/SmoothCamera";
import { Player } from "@/components/Game/Entities/Player";
import { NPC } from "@/components/Game/Entities/Npc";
import { Tombstone } from "@/components/Game/Entities/Tombstone";
import { Plate } from "@/components/Game/Map/Plate";
import { LootBag } from "@/components/Game/Map/LootBag";
import { LootBagModal } from "@/components/Game/Map/LootBag/LootBagModal";
// import { LevelSteps } from "@/components/Game/LevelSteps";
import { HEIGHT_STEP_OFFSET } from "@/gameRules/movement/levels";
import {
  QuestArrow,
  QuestNPCBadge,
  QuestDirectionArrow,
} from "@/components/Game/Quest/Indicator";
import Talking from "@/components/Game/Interactions/Talking";
import { useDialogue } from "@/hooks/interaction/useDialogue";
import { useSceneDialogue } from "@/hooks/interaction/useSceneDialogue";
import { useGoodPowderEncounter } from "@/hooks/interaction/useGoodPowderEncounter";
import { useSansTalking } from "@/hooks/interaction/useSansTalking";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSceneNavigation } from "@/hooks/scene/useNavigation";
import { useSceneSetup } from "@/hooks/scene/useSetup";
import { useSceneControls } from "@/hooks/scene/useControls";
import { useSceneInteraction } from "@/hooks/scene/useInteraction";
import { useSceneAudio } from "@/hooks/scene/useAudio";
import { useSceneLayers } from "@/hooks/scene/useSceneLayers";
import { useSceneTombstones } from "@/hooks/tombstone/useSceneTombstones";
import { useLocation } from "react-router";
import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";
import { getTileInFront } from "@/utils/getTileInFront";
import { isNpcInFront } from "@/utils/isNpcInFront";
import { saveGame } from "@/services/save/saveService";
import { useInventory } from "@/contexts/InventoryContext";
import { useQuests } from "@/contexts/QuestContext";
import { useFlags } from "@/contexts/FlagContext";
import { useGroundItems } from "@/contexts/GroundItemContext";
import { chestPath } from "@/utils/paths";
import { InteractionPrompt } from "@/components/Game/Interactions/InteractionPrompt";
import { CutsceneVideo } from "@/components/Game/Map/Cutscene";
import type { ItemPickupTile } from "@/utils/types/maps/exploreScene";
import {
  getSceneMemory,
  hasSeenSceneMemory,
  markSceneMemorySeen,
} from "@/utils/sceneMemory";
import {
  SCENE_MEMORY_WALKS,
  type SceneMemoryWalkTarget,
} from "@/data/dialogues/sceneMemories";
import { useAutoWalk } from "@/hooks/scene/useAutoWalk";

type QuestHighlightTile = { x: number; y: number };
type QuestNpcPosition = { gridX: number; gridY: number };

export function ExploreScene({
  map,
  heightMap,
  dialogueData = [],
  initialPosition,
  npcs = [],
  plates = [],
  audio,
  transitions,
  onInteract,
  autoStartDialogue,
  onFinish,
  nextRoute,
  className,
  setPopup,
  popup,
  questHighlightTiles,
  questNpcPositions,
  questDirection,
  itemPickupTiles,
  interactionKeys,
  interactionLabels,
  tileDialogues,
  npcOverlays,
  cameraTargetOverride,
  cutscene,
  background,
  backgroundSize,
  scaleFix,
  tombstoneLocationId,
}: ExploreSceneProps & {
  background?: string;
  backgroundSize?: string;
  scaleFix?: number;
  events?: SceneEvent[];
  setPopup?: (msg: string | null) => void;
  popup?: string | null;
  cameraTargetOverride?: { x: number; y: number } | null;
  questHighlightTiles?: QuestHighlightTile[];
  questNpcPositions?: QuestNpcPosition[];
  questDirection?: Direction | null;
  itemPickupTiles?: ItemPickupTile[];
  interactionKeys?: string[];
  interactionLabels?: Record<string, string>;
  tileDialogues?: Record<string, Dialogue[]>;
  npcOverlays?: { gridX: number; gridY: number; element: React.ReactNode }[];
  cutscene?: SceneCutscene;
  tombstoneLocationId?: string;
}) {
  const {
    player,
    playerClass,
    setMap,
    setHeightMap,
    setPosition,
    setMode,
    setPlayer,
  } = usePlayer();
  const { pushControls } = useGameControls();
  const { navigateWithFade } = useTransitionCtx();
  const location = useLocation();
  const { items, addItem } = useInventory();
  const { quests } = useQuests();
  const { flags } = useFlags();
  const { setCurrentLocationId } = useGroundItems();
  const lastPage = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    saveGame({
      lastRoute: location.pathname,
      inventory: items,
      quests,
      playerClass,
      character: player.character,
    });
  }, [location.pathname, items, quests, playerClass, player.character]);

  useEffect(() => {
    setCurrentLocationId(location.pathname);
    return () => setCurrentLocationId(null);
  }, [location.pathname, setCurrentLocationId]);

  const [cutsceneActive, setCutsceneActive] = useState(false);
  const cutsceneDoneRef = useRef(false);

  const finishScene = () => {
    setTimeout(() => {
      if (onFinish) onFinish();

      if (nextRoute) {
        navigateWithFade(nextRoute, { state: { from: location.pathname } });
      }
    }, 0);
  };

  /**
   * Estável porque é o `onFinish` de `useDialogue`: uma identidade nova por
   * render recriava `finish`/`next`/`dialogueSystem` e religava os efeitos que
   * dependem do sistema de diálogo a cada passo do jogador.
   */
  const handleFinish = useStableCallback(() => {
    if (cutscene) {
      cutsceneDoneRef.current = false;
      setCutsceneActive(true);
      return;
    }
    finishScene();
  });

  const handleCutsceneEnd = () => {
    if (cutsceneDoneRef.current) return;
    cutsceneDoneRef.current = true;
    setCutsceneActive(false);
    finishScene();
  };

  const handleCutsceneEndRef = useLatestRef(handleCutsceneEnd);

  useEffect(() => {
    if (!cutsceneActive) return;

    const timeout = setTimeout(() => handleCutsceneEndRef.current(), 4000);
    return () => clearTimeout(timeout);
  }, [cutsceneActive, handleCutsceneEndRef]);

  useEffect(() => {
    if (!cutsceneActive) return;

    const remove = pushControls({
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onConfirm: () => true,
      onCancel: () => true,
    });

    return remove;
  }, [cutsceneActive, pushControls]);

  const { resolvedDialogueData, npcContext } = useSceneDialogue(dialogueData);

  const dialogueSystem = useDialogue(resolvedDialogueData, handleFinish);
  const { play: playSansTalking } = useSansTalking(dialogueSystem.isOpen);
  const hasStarted = useRef(false);

  const resolvedNpcs = useMemo(
    () =>
      npcs.map((npc) => {
        const resolvedSrc =
          typeof npc.src === "function"
            ? npc.src({ ...npcContext, dialogueIndex: dialogueSystem.index })
            : npc.src;
        return {
          ...npc,
          src: resolvedSrc,
          size:
            typeof npc.size === "function" ? npc.size(resolvedSrc) : npc.size,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      npcs,
      flags,
      quests,
      items,
      player.character,
      lastPage,
      dialogueSystem.index,
    ],
  );

  const resolvedInitialPosition =
    typeof initialPosition === "function"
      ? initialPosition(lastPage) // ⚠️ aqui falta o lastPage ainda
      : initialPosition;

  const resolvedAutoStartDialogue = useMemo(
    () =>
      typeof autoStartDialogue === "function"
        ? autoStartDialogue(npcContext)
        : autoStartDialogue,
    [autoStartDialogue, npcContext],
  );

  const { isReady } = useSceneSetup({
    map,
    heightMap,
    initialPosition: resolvedInitialPosition,
    setMap,
    setHeightMap,
    setPosition,
  });

  const { encounterNpc } = useGoodPowderEncounter({
    map,
    isReady,
    dialogueSystem,
    navigateWithFade,
    locationId: tombstoneLocationId,
  });

  const { tombstones, collectableTombstones, fadingIds, collectAt } =
    useSceneTombstones({
      locationId: tombstoneLocationId,
      onMessage: setPopup,
    });

  const {
    getLootAt,
    collectAll,
    removeItem: removeGroundItem,
    currentLocationId,
  } = useGroundItems();

  const [activeLootBag, setActiveLootBag] = useState<GroundLoot | null>(null);

  useSceneNavigation({
    player,
    transitions,
  });

  useSceneControls({
    pushControls,
    dialogueSystem,
    playSansTalking,
    setMode,
  });

  useSceneInteraction({
    player,
    map,
    dialogueSystem,
    playSansTalking,
    onInteract: (tile, x, y) => {
      const front = getTileInFront(player, map);

      // 🔥 se popup ativo, fecha ao interagir
      if (popup) {
        setPopup?.(null);
        return true;
      }

      // 🔥 verifica NPC na frente (posições fracionadas X.5/Y.5 inclusas)
      const npc = resolvedNpcs.find((n) => isNpcInFront(player, n));

      if (npc?.interaction) {
        npc.interaction(dialogueSystem);
        return true;
      }

      // 🔥 verifica tileDialogue na frente
      const tileDialogue = tileDialogues?.[`${front.x},${front.y}`];
      if (tileDialogue) {
        dialogueSystem.start(tileDialogue);
        return true;
      }

      // 🔥 verifica lápide na frente (coleta de drops do npc derrotado)
      if (collectAt(front.x, front.y)) {
        return true;
      }

      // 🔥 verifica lootbag no chão na frente
      if (currentLocationId) {
        const lootAtFront = getLootAt(currentLocationId).find(
          (l) => l.x === front.x && l.y === front.y,
        );
        if (lootAtFront) {
          setActiveLootBag(lootAtFront);
          return true;
        }
      }

      // 🔥 verifica placa na frente
      const plate = plates.find(
        (p) => p.gridX === front.x && p.gridY === front.y,
      );

      if (plate?.message) {
        setPopup?.(plate.message);
        return true;
      }

      // fallback
      return onInteract?.(tile, x, y) ?? false;
    },
    isReady,
  });

  useSceneAudio({
    audio,
  });

  useEffect(() => {
    if (resolvedAutoStartDialogue && !hasStarted.current) {
      hasStarted.current = true;
      dialogueSystem.start();
      if (!dialogueSystem.nextSoundSrc) {
        playSansTalking();
      }
    }
  }, [resolvedAutoStartDialogue, dialogueSystem, playSansTalking]);

  useEffect(() => {
    if (resolvedAutoStartDialogue) return;

    const route = location.pathname;
    const memory = getSceneMemory(route);
    if (!memory || hasSeenSceneMemory(route)) return;

    markSceneMemorySeen(route);
    dialogueSystem.start(memory, () => {
      const walkIn = SCENE_MEMORY_WALKS[route];
      if (walkIn) setWalkInTarget(walkIn);
    });
    if (!dialogueSystem.nextSoundSrc) {
      playSansTalking();
    }
  }, [
    resolvedAutoStartDialogue,
    location.pathname,
    dialogueSystem,
    playSansTalking,
  ]);

  const [walkInTarget, setWalkInTarget] =
    useState<SceneMemoryWalkTarget | null>(null);

  useAutoWalk({
    active: walkInTarget !== null,
    target: walkInTarget ?? { x: player.gridX, y: player.gridY },
    player,
    setPlayer,
    map,
    heightMap,
    onArrived: () => setWalkInTarget(null),
  });

  useEffect(() => {
    if (!walkInTarget) return;
    const remove = pushControls({
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onConfirm: () => true,
      onCancel: () => true,
    });
    return remove;
  }, [walkInTarget, pushControls]);

  /**
   * Memo por dupla razão: `getLootAt` já só muda quando o chão muda, e a
   * identidade estável evita refazer o `filter` a cada render — antes rodava
   * duas vezes por render (hint + JSX).
   */
  const interactionLoot = useMemo(
    () => (currentLocationId ? getLootAt(currentLocationId) : []),
    [getLootAt, currentLocationId],
  );

  const { interactionHint } = useSceneLayers({
    player,
    map,
    heightMap,
    isReady,
    npcs: resolvedNpcs,
    itemPickupTiles,
    plates,
    interactionKeys,
    interactionLabels,
    tileDialogues,
    tombstones: collectableTombstones,
    groundLoots: interactionLoot,
  });

  const {
    TILE_SIZE,
    cameraX,
    cameraY,
    PLAYER_SIZE,
    MAP_COLS,
    MAP_ROWS,
    MAP_WIDTH,
    MAP_HEIGHT,
    containerWidth,
    containerHeight,
  } = useGameLayout(map, scaleFix);

  const finalCameraX = cameraTargetOverride
    ? Math.max(
        0,
        Math.min(
          cameraTargetOverride.x * TILE_SIZE - containerWidth / 2,
          MAP_WIDTH - containerWidth,
        ),
      )
    : cameraX;
  const finalCameraY = cameraTargetOverride
    ? Math.max(
        0,
        Math.min(
          cameraTargetOverride.y * TILE_SIZE - containerHeight / 2,
          MAP_HEIGHT - containerHeight,
        ),
      )
    : cameraY;

  if (!isReady) return null;

  return (
    <div className={className}>
      <SmoothCamera
        TILE_SIZE={TILE_SIZE}
        cols={MAP_COLS}
        rows={MAP_ROWS}
        targetX={finalCameraX}
        targetY={finalCameraY}
        backgroundUrl={background}
        backgroundSize={backgroundSize}
      >
        {resolvedNpcs.map((npc) => (
          <NPC
            // A key sai do `id` quando o NPC declara um: quem anda muda de tile
            // a cada passo e uma key de posição remontaria a imagem, zerando o
            // deslize de `moveMs`.
            key={npc.id ?? `${npc.gridX},${npc.gridY}`}
            {...npc}
            TILE_SIZE={TILE_SIZE}
            fading={
              cutsceneActive &&
              cutscene !== undefined &&
              npc.gridX === cutscene.npcGridX &&
              npc.gridY === cutscene.npcGridY
            }
          />
        ))}

        {encounterNpc && (
          <NPC
            key={`encounter-${encounterNpc.gridX}-${encounterNpc.gridY}`}
            {...encounterNpc}
            TILE_SIZE={TILE_SIZE}
          />
        )}

        {tombstones.map((tombstone) => (
          <Tombstone
            key={tombstone.id}
            gridX={tombstone.x}
            gridY={tombstone.y}
            variant={tombstone.variant}
            TILE_SIZE={TILE_SIZE}
            fading={fadingIds.includes(tombstone.id)}
          />
        ))}

        {npcOverlays?.map((overlay, i) => (
          <div
            key={`overlay-${i}`}
            style={{
              position: "absolute",
              left: overlay.gridX * TILE_SIZE - 40 + (TILE_SIZE * 1.7) / 2,
              top: overlay.gridY * TILE_SIZE - 80,
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            {overlay.element}
          </div>
        ))}

        {cutsceneActive &&
          cutscene !== undefined &&
          (() => {
            const videoWidth = TILE_SIZE * 2.2;
            const videoHeight = (videoWidth * 9) / 16;
            const npcCenterX =
              cutscene.npcGridX * TILE_SIZE - 40 + (TILE_SIZE * 1.7) / 2;
            const npcCenterY =
              cutscene.npcGridY * TILE_SIZE - 20 + (TILE_SIZE * 1.7) / 2;

            return (
              <div
                style={{
                  position: "absolute",
                  left: npcCenterX - videoWidth / 2,
                  top: npcCenterY - videoHeight / 2,
                  zIndex: 30,
                  pointerEvents: "none",
                }}
              >
                <CutsceneVideo
                  src={cutscene.videoSrc}
                  width={videoWidth}
                  height={videoHeight}
                  onEnded={handleCutsceneEnd}
                />
              </div>
            );
          })()}

        {questNpcPositions?.map((pos) => (
          <QuestNPCBadge
            key={`quest-npc-${pos.gridX}-${pos.gridY}`}
            gridX={pos.gridX}
            gridY={pos.gridY}
            TILE_SIZE={TILE_SIZE}
          />
        ))}

        {questHighlightTiles?.map((tile) => (
          <QuestArrow
            key={`quest-arrow-${tile.x}-${tile.y}`}
            x={tile.x}
            y={tile.y}
            TILE_SIZE={TILE_SIZE}
          />
        ))}

        {plates.map((plate) => (
          <Plate
            key={`plate-${plate.gridX}-${plate.gridY}`}
            {...plate}
            TILE_SIZE={TILE_SIZE}
          />
        ))}

        {itemPickupTiles?.map(
          (tile) =>
            tile.visible && (
              <img
                key={`item-${tile.x}-${tile.y}`}
                src={tile.image ?? chestPath("default.svg")}
                alt=""
                style={{
                  position: "absolute",
                  width: TILE_SIZE * (tile.size ?? 0.7),
                  height: TILE_SIZE * (tile.size ?? 0.7),
                  left: tile.x * TILE_SIZE,
                  top:
                    tile.y * TILE_SIZE * 1.1 -
                    (tile.height ?? 0) * TILE_SIZE * HEIGHT_STEP_OFFSET,
                  zIndex: 5,
                  pointerEvents: "none",
                }}
              />
            ),
        )}

        {interactionLoot.map((loot) => (
          <LootBag
            key={`lootbag-${loot.x}-${loot.y}`}
            gridX={loot.x}
            gridY={loot.y}
            tileSize={TILE_SIZE}
            items={loot.items}
          />
        ))}

        {/* <LevelSteps heightMap={heightMap} TILE_SIZE={TILE_SIZE} /> */}

        <Player
          character={player.character}
          direction={player.direction}
          gridX={player.gridX}
          gridY={player.gridY}
          height={player.height}
          TILE_SIZE={TILE_SIZE}
          PLAYER_SIZE={PLAYER_SIZE}
          hasPeru={player.hasPeru}
          moving={player.moving}
        />

        {questDirection && (
          <QuestDirectionArrow
            gridX={player.gridX}
            gridY={player.gridY}
            TILE_SIZE={TILE_SIZE}
            PLAYER_SIZE={PLAYER_SIZE}
            direction={questDirection}
          />
        )}
      </SmoothCamera>

      {interactionHint && !dialogueSystem.isOpen && (
        <InteractionPrompt text={interactionHint} />
      )}

      {dialogueSystem.isOpen && dialogueSystem.dialogue && (
        <Talking
          {...dialogueSystem.dialogue}
          onSoundEnd={dialogueSystem.next}
        />
      )}

      {activeLootBag && currentLocationId && (
        <LootBagModal
          isOpen={!!activeLootBag}
          items={activeLootBag.items}
          onCollectAll={() => {
            if (!activeLootBag || !currentLocationId) return;
            const collected = collectAll(
              currentLocationId,
              activeLootBag.x,
              activeLootBag.y,
            );
            for (const item of collected) {
              addItem({ id: item.id, qty: item.qty }, { showToast: true });
            }
            setActiveLootBag(null);
          }}
          onCollectOne={() => {
            if (!activeLootBag || !currentLocationId) return;
            const first = activeLootBag.items[0];
            if (!first) return;
            addItem({ id: first.id, qty: 1 }, { showToast: true });
            removeGroundItem(
              currentLocationId,
              activeLootBag.x,
              activeLootBag.y,
              first.id,
            );
            setActiveLootBag((prev) => {
              if (!prev) return null;
              const next = prev.items
                .map((i) => (i.id === first.id ? { ...i, qty: i.qty - 1 } : i))
                .filter((i) => i.qty > 0);
              if (next.length === 0) return null;
              return { ...prev, items: next };
            });
          }}
          onClose={() => setActiveLootBag(null)}
        />
      )}
    </div>
  );
}
