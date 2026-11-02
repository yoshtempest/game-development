import type {
  InteractionHandler,
  DialogueSystem,
} from "@/utils/types/sceneHooks";

export type Props = {
  player: Player;
  map: number[][];
  dialogueSystem: DialogueSystem;
  playSansTalking: () => void;
  onInteract?: InteractionHandler;
  isReady: boolean;
};
