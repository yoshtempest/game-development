import type { DialogueSystem } from "@/utils/types/sceneHooks";
import type { To, NavigateOptions } from "react-router";


export type Props = {
  map: number[][];
  isReady: boolean;
  dialogueSystem: DialogueSystem;
  navigateWithFade: (to: To | number, options?: NavigateOptions) => void;
  locationId?: string;
};
