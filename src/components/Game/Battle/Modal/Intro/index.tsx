import { npcPath, playerPath } from "@/utils/paths";
import styles from "./styles.module.css";
import { useEffect, useRef } from "react";
import { useAudio } from "@/hooks/audio/useAudio";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { FleeButton } from "@/components/Game/Battle/Buttons/Run";
import { sfx } from "@/utils/paths";

type Props = {
  playerCharacter: string;
  npcType: string;
  introAudioSrc?: string;
  onSkip: () => void;
  onFlee: () => void;
  isAlfa?: boolean;
};

export function BattleIntro({
  playerCharacter,
  npcType,
  introAudioSrc = "/battle/onePiece.mp3",
  onSkip,
  onFlee,
  isAlfa = false,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { sfxVolume } = useAudio();
  const sfxVolumeRef = useLatestRef(sfxVolume);
  const { pushControls } = useGameControls();
  const { playSound } = useSoundEffects();
  const { setMode } = usePlayerActions();

  useEffect(() => {
    const audio = sfx(introAudioSrc);

    audio.volume = 0.5 * (sfxVolumeRef.current / 100);
    audio.currentTime = 0;

    audio.play().catch(() => {
      // evita erro de autoplay bloqueado
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [sfxVolumeRef, introAudioSrc]);

  const handleSkip = () => {
    // para o áudio antes de sair
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    onSkip();
  };

  const handleFlee = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    playSound("run");
    setMode("explore");
    onFlee();
  };

  const handleSkipRef = useLatestRef(handleSkip);
  const handleFleeRef = useLatestRef(handleFlee);

  useEffect(() => {
    const controls = {
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onConfirm: () => {
        handleSkipRef.current();
        return true;
      },
      onCancel: () => {
        handleFleeRef.current();
        return true;
      },
    };

    const remove = pushControls(controls);
    return remove;
  }, [pushControls, handleFleeRef, handleSkipRef]);
  return (
    <div className="overlay">
      <div className={styles.left}>
        <img
          loading="lazy"
          decoding="async"
          src={playerPath(`/${playerCharacter}/expressions/default.svg`)}
          alt=""
        />
      </div>

      <div className={styles.center}>
        <div className={`${styles.combatText} ${styles.ready}`}>Ready?</div>
        <div className={`${styles.combatText} ${styles.fight}`}>Fight!</div>
      </div>

      <div className={styles.right}>
        {isAlfa && <div className={styles.alfaBadge}>ALFA</div>}
        <img
          loading="lazy"
          decoding="async"
          src={npcPath(`/${npcType}/right.svg`)}
          alt=""
          onError={(e) => {
            const img = e.currentTarget;

            if (img.dataset.fallback === "default") {
              img.dataset.fallback = "walk";
              img.src = npcPath(`/${npcType}/walk.svg`);
            } else if (img.dataset.fallback === "walk") {
              img.dataset.fallback = "right";
              img.src = npcPath(`/${npcType}/right.svg`);
            }
          }}
          data-fallback="default"
        />
      </div>

      <button className={styles.skip} onClick={handleSkip}>
        Pular
      </button>

      <div className={styles.fleeContainer}>
        <FleeButton onClick={handleFlee} />
      </div>
    </div>
  );
}
