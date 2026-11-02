import type { DialogueSystem } from "@/utils/types/sceneHooks";

export type RaparigaState =
  "idle" | "walking" | "eating" | "talking" | "waitingChoice" | "leaving";

export type RouteStep = {
  gridX: number;
  gridY: number;
  ms: number;
  facing: "left" | "right" | "up" | "down";
  flipX: boolean;
};

export type FoodPlateEncounterReturn = {
  raparigaState: RaparigaState;
  raparigaPos: { gridX: number; gridY: number };
  raparigaSprite: string;
  raparigaFacing: "left" | "right" | "up" | "down";
  raparigaFlipX: boolean;
  showChoiceBox: boolean;
  handleChoice: (choice: "dar denovo" | "não quero dar") => void;
  startRaparigaDialogue: (dialogueSystem: DialogueSystem) => void;
  cameraTarget?: { x: number; y: number } | null;
  blockMovement: boolean;
};
