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
  /** Só alfas e bosses (ou acima) têm a sequência Clear → Outro. */
  hasBattleOutro: boolean;
};

export function useBattleOutro({
  redirectTo,
  onVictory,
  getReplayData,
  showHighlightEnabled,
  hasBattleOutro,
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

  // Sem direito ao outro, a vitória pula direto para o highlight (ou para o
  // modal de vitória, se não houver replay). O estado do outro é limpo para
  // não sobrar nada de uma batalha anterior com boss.
  useEffect(() => {
    if (!hasBattleOutro) {
      setShowClear(false);
      setShowOutro(null);
    }
  }, [hasBattleOutro]);

  // Sequência de vitória: Clear (1.5s) → Outro (2.5s) → Highlight
  useEffect(() => {
    if (!showVictory) return undefined;
    if (!hasBattleOutro) {
      prepareAndShowHighlight();
      return undefined;
    }

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
  }, [showVictory, prepareAndShowHighlight, hasBattleOutro]);

  useEffect(() => {
    if (!showDefeat) return undefined;
    if (!hasBattleOutro) {
      prepareAndShowHighlight();
      return undefined;
    }

    setShowOutro("defeat");
    outroTimeoutRef.current = setTimeout(() => {
      setShowOutro(null);
      prepareAndShowHighlight();
    }, 2500);
    return () => window.clearTimeout(outroTimeoutRef.current);
  }, [showDefeat, prepareAndShowHighlight, hasBattleOutro]);

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
