import type { ItemPickupTile } from "@/utils/types/maps/exploreScene";
import type { NavigateFunction, Location } from "react-router";

export type SceneBaseProps = {
  scene: SceneConfig;
  className?: string;
  background?: string;
  /**
   * Trilha que substitui a da cena enquanto durar (modal aberto, por
   * exemplo). Sem ela, vale `scene.audio`.
   */
  audioOverride?: AudioConfig;

  interactions?: Record<string, () => void>;
  itemPickupTiles?: ItemPickupTile[];
  interactionLabels?: Record<string, string>;
  popup?: string | null;
  setPopup?: (msg: string | null) => void;

  handleExit?: (ctx: {
    player: Player;
    scene: SceneConfig;
    navigate: NavigateFunction;
    location: Location;
    quests: Quest[];
  }) => boolean;
  onFinishExtra?: (ctx: {
    navigate: NavigateFunction;
    location: Location;
  }) => Record<string, unknown> | void;
  tileDialogues?: Record<string, Dialogue[]>;
  npcOverlays?: { gridX: number; gridY: number; element: React.ReactNode }[];
  cameraTargetOverride?: { x: number; y: number } | null;
  children?: React.ReactNode;
};