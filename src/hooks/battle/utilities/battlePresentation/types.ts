import { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import type { RefObject } from "react";

export type Props = {
  setup: ReturnType<typeof useBattleStageSetup>;
  audioSrc: string;
  training: boolean | undefined;
  isPausedRef: RefObject<boolean>;
  vastolordEndingRef: RefObject<{ current: boolean }>;
  runDefeatRef: RefObject<() => void>;
};
