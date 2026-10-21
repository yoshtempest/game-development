import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useVictory } from "@/hooks/battle/victory/useVictory";
import { useHighlight } from "@/hooks/battle/highlight/useHighlight";
import { useTombstones } from "@/contexts/TombstoneContext";
import type { ReplayData } from "@/utils/types/replay";

type OutroProps = {
  redirectTo?: string;
  onVictory?: () => void;
  getReplayData: () => ReplayData | null;
  showHighlightEnabled: boolean;
};

export function useBattleOutro({
  redirectTo,
  onVictory,
  getReplayData,
  showHighlightEnabled,
}: OutroProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearPendingTombstoneSpawn } = useTombstones();

  const [showDefeat, setShowDefeat] = useState(false);
  const [showOutro, setShowOutro] = useState<"victory" | "defeat" | null>(null);
  const [skipVictoryDelay, setSkipVictoryDelay] = useState(false);
  const [lastRewards, setLastRewards] = useState<RewardInfo | null>(null);
  const outroTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const { highlightData, prepareHighlight, clearHighlight } = useHighlight();
  const [showHighlight, setShowHighlight] = useState(false);
  // Nova fase: "clear" para a animação Clear antes do outro
  const [showClear, setShowClear] = useState(false);

  const showHighlightEnabledRef = useLatestRef(showHighlightEnabled);
  const getReplayDataRef = useLatestRef(getReplayData);

  const { showVictory, triggerVictory } = useVictory({ redirectTo });

  const prepareAndShowHighlight = useCallback(() => {
    if (showHighlightEnabledRef.current) {
      const has = prepareHighlight(getReplayDataRef.current);
      if (has) {
        setShowHighlight(true);
      }
    }
  }, [prepareHighlight, getReplayDataRef, showHighlightEnabledRef]);

  // Sequência de vitória: Clear (1.5s) → Outro (2.5s) → Highlight
  useEffect(() => {
    if (!showVictory) return undefined;

    // 1. Mostra Clear imediatamente
    setShowClear(true);

    // 2. Após Clear (1.5s), mostra Outro
    const clearTimeoutId = setTimeout(() => {
      setShowClear(false);
      setShowOutro("victory");

      // 3. Após Outro (2.5s), prepara highlight
      outroTimeoutRef.current = setTimeout(() => {
        setShowOutro(null);
        prepareAndShowHighlight();
      }, 2500);
    }, 1500); // Clear dura 1.5s

    return () => {
      window.clearTimeout(clearTimeoutId);
      if (outroTimeoutRef.current) window.clearTimeout(outroTimeoutRef.current);
    };
  }, [showVictory, prepareAndShowHighlight]);

  useEffect(() => {
    if (!showDefeat) return undefined;

    setShowOutro("defeat");
    outroTimeoutRef.current = setTimeout(() => {
      setShowOutro(null);
      prepareAndShowHighlight();
    }, 2500);
    return () => window.clearTimeout(outroTimeoutRef.current);
  }, [showDefeat, prepareAndShowHighlight]);

  const handleCloseOutro = useCallback(() => {
    if (outroTimeoutRef.current) window.clearTimeout(outroTimeoutRef.current);
    setShowOutro(null);
    setSkipVictoryDelay(true);
    // Se pulou o outro, ainda tenta preparar highlight
    prepareAndShowHighlight();
  }, [prepareAndShowHighlight]);

  const handleCloseHighlight = useCallback(() => {
    setShowHighlight(false);
    clearHighlight();
  }, [clearHighlight]);

  const handleContinue = useCallback(() => {
    const wasVictory = !!onVictory;
    if (onVictory) onVictory();
    if (!wasVictory) {
      clearPendingTombstoneSpawn();
    }
    if (redirectTo) {
      void navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [
    onVictory,
    redirectTo,
    navigate,
    location.pathname,
    clearPendingTombstoneSpawn,
  ]);

  return {
    showVictory,
    triggerVictory,
    showDefeat,
    setShowDefeat,
    showOutro,
    setShowOutro,
    showClear,
    showHighlight,
    highlightData,
    handleCloseHighlight,
    skipVictoryDelay,
    setSkipVictoryDelay,
    lastRewards,
    setLastRewards,
    handleCloseOutro,
    handleContinue,
  };
}
