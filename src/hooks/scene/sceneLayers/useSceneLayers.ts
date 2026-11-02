import type { Params } from "./types";
import { useMemo } from "react";
import { getTileInFront } from "@/utils/getTileInFront";
import { isNpcInFront } from "@/utils/isNpcInFront";
import { isPositionInFront, parseGridKey } from "@/utils/isPositionInFront";
import { canStepTo } from "@/gameRules/movement/levels";
import { INTERACTION_LABELS } from "@/data/messages";

/**
 * Deriva o tile em frente ao jogador e o hint de interação daquele tile.
 *
 * A ordem dos testes espelha a cadeia de `onInteract` do ExploreScene
 * (npc → tileDialogue → lápide → placa): hint e ação precisam concordar,
 * senão o jogador lê um rótulo e recebe outra interação.
 *
 * `tombstones` deve conter só as lápides coletáveis — as que estão em
 * fade-out ainda bloqueiam o tile, mas não aceitam mais interação.
 */
export function useSceneLayers({
  player,
  map,
  heightMap,
  isReady,
  npcs,
  itemPickupTiles,
  plates,
  interactionKeys,
  interactionLabels,
  tileDialogues,
  tombstones,
  groundLoots,
}: Params) {
  const frontTile = useMemo(() => {
    if (!isReady) return null;
    return getTileInFront(player, map);
  }, [player, map, isReady]);

  const interactionHint = useMemo(() => {
    if (!frontTile) return null;

    const { x, y } = frontTile;

    if (!canStepTo(player.height, heightMap, x, y)) return null;

    const npc = npcs.find((n) => isNpcInFront(player, n));
    if (npc) return INTERACTION_LABELS.TALK;

    const hasInteractionKey = interactionKeys?.some((key) => {
      const pos = parseGridKey(key);
      return pos ? isPositionInFront(player, pos.x, pos.y) : false;
    });
    if (hasInteractionKey) {
      return interactionLabels?.[`${x},${y}`] ?? INTERACTION_LABELS.INTERACT;
    }

    const pickup = itemPickupTiles?.find(
      (t) => t.visible && isPositionInFront(player, t.x, t.y),
    );
    if (pickup) return INTERACTION_LABELS.PICK_UP;

    if (tileDialogues?.[`${x},${y}`]) return INTERACTION_LABELS.INTERACT;

    const tombstone = tombstones?.find((t) => t.x === x && t.y === y);
    if (tombstone) return INTERACTION_LABELS.COLLECT;

    const groundLoot = groundLoots?.find((l) => l.x === x && l.y === y);
    if (groundLoot) return INTERACTION_LABELS.PICK_UP;

    const plate = plates.find((p) => p.gridX === x && p.gridY === y);
    if (plate) return INTERACTION_LABELS.INTERACT;

    return null;
  }, [
    frontTile,
    player,
    heightMap,
    npcs,
    itemPickupTiles,
    plates,
    interactionKeys,
    interactionLabels,
    tileDialogues,
    tombstones,
    groundLoots,
  ]);

  return { frontTile, interactionHint };
}
