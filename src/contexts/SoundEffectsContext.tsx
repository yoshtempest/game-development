import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAudio } from "@/hooks/audio/useAudio";
import { useLatestRef } from "@/hooks/useLatestRef";
import { createSounds } from "@/utils/soundEffects";
import type { SoundId } from "@/utils/audio/soundId";

type SoundEffectsContextType = {
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  stopSound: (sound: SoundId) => void;
  stopAll: () => void;
  /** Congela todos os SFX em curso (pausa da batalha): pausa, não para. */
  pauseAllPlaying: () => void;
  /** Retoma exatamente o que `pauseAllPlaying` congelou. */
  resumeAllPaused: () => void;
};

const SoundEffectsContext = createContext<SoundEffectsContextType | null>(null);

/** Fallback estável (identidade fixa) para consumir o hook sem provider. */
const FALLBACK_SOUNDS: SoundEffectsContextType = {
  playSound: () => {},
  stopSound: () => {},
  stopAll: () => {},
  pauseAllPlaying: () => {},
  resumeAllPaused: () => {},
};

const SOUND_VOLUMES: Partial<Record<SoundId, number>> = {
  boom: 1.3,
  slimitaJump: 0.3,
  impact: 0.5,
  hollowPurple: 1.3,
  domainInitiate: 1.7,
  natsukiOpenedDomain: 1.3,
  atomic: 0.7,
  mugetsu: 2,
  win: 0.5,
};

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const { sfxVolume } = useAudio();
  const sfxVolumeRef = useLatestRef(sfxVolume);

  const soundsRef = useRef<Record<SoundId, HTMLAudioElement>>(
    {} as Record<SoundId, HTMLAudioElement>,
  );
  /** Elementos congelados pela pausa da batalha — retomados no fechamento. */
  const pausedByPauseRef = useRef<Set<HTMLAudioElement>>(new Set());

  useEffect(() => {
    soundsRef.current = createSounds();

    Object.values(soundsRef.current).forEach((audio) => {
      audio.preload = "none";
    });

    return () => {
      Object.values(soundsRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  useEffect(() => {
    const vol = Number.isFinite(sfxVolume) ? sfxVolume / 100 : 0.5;
    Object.values(soundsRef.current).forEach((audio) => {
      audio.volume = vol;
    });
  }, [sfxVolume]);

  const playSound = useCallback(
    async (sound: SoundId, loop?: boolean, volumeOverride?: number) => {
      const audio = soundsRef.current[sound];

      if (!audio) return;

      // Religado durante a pausa: deixa de estar na lista "para continuar
      // depois" — o playback novo já é o comportamento pós-unpause desejado.
      pausedByPauseRef.current.delete(audio);

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = loop ?? false;
        audio.volume =
          (sfxVolumeRef.current / 100) *
          (SOUND_VOLUMES[sound] ?? 1) *
          (volumeOverride ?? 1);

        await audio.play();
      } catch {
        // AbortError é esperado quando play() é interrompido por pause()
      }
    },
    [sfxVolumeRef],
  );

  const stopSound = useCallback((sound: SoundId) => {
    const audio = soundsRef.current[sound];

    if (!audio) return;

    // Parado não é pausado: quem foi stopado durante a pausa não volta no
    // fechamento (o próprio stop já definiu o comportamento).
    pausedByPauseRef.current.delete(audio);
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const stopAll = useCallback(() => {
    pausedByPauseRef.current.clear();
    Object.values(soundsRef.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const pauseAllPlaying = useCallback(() => {
    const paused = pausedByPauseRef.current;
    Object.values(soundsRef.current).forEach((audio) => {
      if (audio.paused || audio.ended) return;
      audio.pause();
      paused.add(audio);
    });
  }, []);

  const resumeAllPaused = useCallback(() => {
    const paused = pausedByPauseRef.current;
    paused.forEach((audio) => {
      // Só o que a pausa congelou volta a tocar: se o som acabou ou foi
      // religado durante o menu, deixa como está.
      if (audio.paused && !audio.ended) audio.play().catch(() => {});
    });
    paused.clear();
  }, []);

  const value = useMemo(
    () => ({
      playSound,
      stopSound,
      stopAll,
      pauseAllPlaying,
      resumeAllPaused,
    }),
    [playSound, stopSound, stopAll, pauseAllPlaying, resumeAllPaused],
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
    </SoundEffectsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSoundEffects(): SoundEffectsContextType {
  const context = useContext(SoundEffectsContext);

  return context ?? FALLBACK_SOUNDS;
}
