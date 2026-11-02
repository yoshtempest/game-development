import { useDialogue } from "@/hooks/interaction/useDialogue";

export type Props = {
  dialogue: Parameters<typeof useDialogue>[0];
  autoStart?: boolean;
  playOnce?: boolean;
  onFinish?: () => void;
  playAudio?: () => void;
  onBeforeNext?: (dialogue: Dialogue) => boolean;
};
