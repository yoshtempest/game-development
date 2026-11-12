import type { ReactNode } from "react";
import type { ItemPickupTile } from "@/utils/types/maps/exploreScene";

type QuestHighlightTile = { x: number; y: number };
type QuestNpcPosition = { gridX: number; gridY: number };

export type ExploreSceneExtraProps = {
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
  npcOverlays?: {
    gridX: number;
    gridY: number;
    element: ReactNode;
  }[];
  cutscene?: SceneCutscene;
  tombstoneLocationId?: string;
};

export type ExploreSceneComponentProps = ExploreSceneProps &
  ExploreSceneExtraProps;
