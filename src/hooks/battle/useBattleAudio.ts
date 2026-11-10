import { useEffect } from "react";
import { useGameAudio } from "@/hooks/game/useGameAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";

type Params = {
  src: string;
  showIntro: boolean;
  showVictory: boolean;
  showDefeat: boolean;
  showHighlight: boolean;
  isBattleNavOpen: boolean;
};

/**
 * Trilha e efeitos da batalha: toca a música de fundo enquanto a luta está em
 * andamento (pausada em intro, vitória, derrota, highlight e navbar) e corta
 * os efeitos sonoros pendentes no fim da batalha.
 */
export function useBattleAudio({
  src,
  showIntro,
  showVictory,
  showDefeat,
  showHighlight,
  isBattleNavOpen,
}: Params) {
  const { stopAll } = useSoundEffects();

  const battleAudio = useGameAudio({
    src,
    loop: true,
    volume: 0.5,
  });
  const battleAudioRef = useLatestRef(battleAudio);

  useEffect(() => {
    const shouldPlay =
      !showIntro &&
      !showVictory &&
      !showDefeat &&
      !showHighlight &&
      !isBattleNavOpen;

    if (shouldPlay && !battleAudioRef.current.isPlaying()) {
      void battleAudioRef.current.play();
    } else if (!shouldPlay && battleAudioRef.current.isPlaying()) {
      battleAudioRef.current.pause();
    }

    if (showVictory || showDefeat) {
      stopAll();
    }
  }, [
    showIntro,
    showVictory,
    showDefeat,
    showHighlight,
    isBattleNavOpen,
    stopAll,
    battleAudioRef,
  ]);

  return battleAudio;
}
