import styles from "./styles.module.css";
import { useEffect, useRef, useCallback, useState } from "react";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { formatDuration } from "@/utils/formatDuration";
import { ActivePotionDisplay } from "@/components/Game/Battle/ActivePotionDisplay";
import { FleeButton } from "@/components/Game/Battle/Buttons/Run";
import { type Props, type DefeatMenuSelection, OTHER } from "./types";


export function DefeatModal({
  isOpen,
  title = "Derrota",
  onContinue,
  onBack,
  progress,
  elapsed,
  bestTime,
  showRetry = true,
}: Props) {
  const { setMode } = usePlayerActions();
  const { playSound } = useSoundEffects();
  const { pushControls } = useGameControls();
  const { playMove } = useMenuSFX();
  const hasPlayedRef = useRef(false);

  const [menuSelection, setMenuSelection] =
    useState<DefeatMenuSelection>("retry");

  const onContinueRef = useLatestRef(onContinue);
  const onBackRef = useLatestRef(onBack);
  const setModeRef = useLatestRef(setMode);
  const playMoveRef = useLatestRef(playMove);

  const executeSelected = useCallback(() => {
    if (menuSelection === "retry" && showRetry) {
      playSound("tryAgain");
      onContinueRef.current();
    } else {
      playSound("run");
      onBackRef.current();
      setModeRef.current("explore");
    }
  }, [
    menuSelection,
    playSound,
    showRetry,
    onBackRef,
    onContinueRef,
    setModeRef,
  ]);

  const executeSelectedRef = useLatestRef(executeSelected);

  useEffect(() => {
    if (isOpen && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      playSound("defeat");
    }

    if (!isOpen) {
      hasPlayedRef.current = false;
    }
  }, [isOpen, playSound]);

  useEffect(() => {
    if (!isOpen) return;

    const cycleSelection = () => {
      playMoveRef.current();
      setMenuSelection((prev) => OTHER[prev]);
    };

    const remove = pushControls({
      onConfirm: () => {
        executeSelectedRef.current();
        return true;
      },
      onCancel: () => {
        playSound("run");
        onBackRef.current();
        setModeRef.current("explore");
      },
      onLeft: cycleSelection,
      onRight: cycleSelection,
      onUp: cycleSelection,
      onDown: cycleSelection,
    });

    return remove;
  }, [
    isOpen,
    pushControls,
    playSound,
    executeSelectedRef,
    onBackRef,
    setModeRef,
    playMoveRef,
  ]);

  if (!isOpen) return null;

  const menuBtnClass = (sel: DefeatMenuSelection) =>
    `${menuSelection === sel ? styles.active : ""}`;

  return (
    <div className="overlay">
      <div className={`modal ${styles.modal}`}>
        <h1>{title}</h1>
        <div className={styles.progressSection}>
          <p className={styles.label}>Progresso na batalha</p>
          <div className={styles.bar}>
            <div
              className={styles.fill}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className={styles.text}>{(progress * 100).toFixed(0)}%</p>
        </div>
        <div className={styles.timeSection}>
          <p className={styles.timeRow}>
            <span className={styles.timeLabel}>Tempo:</span>
            <span>{formatDuration(elapsed)}</span>
          </p>
          <p className={styles.timeRow}>
            <span className={styles.timeLabel}>Melhor tempo:</span>
            <span>{bestTime > 0 ? formatDuration(bestTime) : "0:00"}</span>
          </p>
        </div>
        <ActivePotionDisplay />
        <div className={styles.buttonContainer}>
          {showRetry && (
            <button className={menuBtnClass("retry")} onClick={executeSelected}>
              Tentar novamente
            </button>
          )}

          <FleeButton
            onClick={executeSelected}
            isSelected={menuSelection === "flee"}
          />
        </div>
      </div>
    </div>
  );
}
