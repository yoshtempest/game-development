import { useCallback, useState } from "react";
import type { ReplayData } from "@/utils/types/replay";
import { extractHighlightFrames } from "./extractHighlightFrames";

export function useHighlight() {
  const [highlightData, setHighlightData] = useState<ReplayData | null>(null);

  const prepareHighlight = useCallback(
    (getReplayData: () => ReplayData | null) => {
      const data = getReplayData();
      // Reduzido de 5 para 2 frames (200ms) para permitir highlights em
      // batalhas rápidas. O jogo grava frames a cada 100ms.
      if (!data || data.frames.length < 2) {
        setHighlightData(null);
        return false;
      }
      const highlight = extractHighlightFrames(data);
      setHighlightData(highlight);
      return highlight !== null;
    },
    [],
  );

  const clearHighlight = useCallback(() => {
    setHighlightData(null);
  }, []);

  return { highlightData, prepareHighlight, clearHighlight };
}
