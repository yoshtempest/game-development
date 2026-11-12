import { useEffect, useMemo, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useTypewriter } from "@/hooks/interaction/useTypewriter";
import { useSettings } from "@/hooks/settings/useSetting";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useAudio } from "@/hooks/audio/useAudio";
import { resolveAsset } from "@/utils/paths";

/**
 * Expressão de player: /assets/player/<char>/expressions/<expr>.svg.
 * Como alguns personagens não possuem a pasta expressions/, o fallback
 * precisa cair no default.svg da raiz do personagem, não em expressions/.
 */
const PLAYER_EXPRESSION_RE = /(\/assets\/player\/[^/]+)\/expressions\/[^/]+$/;

function resolveFallbackPath(resolvedSrc: string): string {
  const expression = resolvedSrc.match(PLAYER_EXPRESSION_RE);
  if (expression) {
    return `${expression[1]}/default.svg`;
  }
  return resolvedSrc.replace(/[^/]*$/, "default.svg");
}

interface Props {
  name: string;
  message: string;
  src?: string;
  soundSrc?: string;
  autoAdvanceOnSound?: boolean;
  onNext?: () => void;
  onSoundEnd?: () => void;
  imageClassName?: string;
}

export default function Talking({
  name,
  message,
  src,
  soundSrc,
  autoAdvanceOnSound,
  onNext,
  onSoundEnd,
  imageClassName,
}: Props) {
  const { dialogueSpeedMs } = useSettings();
  const { sfxVolume } = useAudio();
  const { displayedText, isComplete, skip } = useTypewriter(
    message,
    dialogueSpeedMs,
  );
  const { pushControls } = useGameControls();

  const resolvedSrc = useMemo(() => (src ? resolveAsset(src) : ""), [src]);
  const fallbackSrc = useMemo(
    () => (resolvedSrc ? resolveAsset(resolveFallbackPath(resolvedSrc)) : ""),
    [resolvedSrc],
  );

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.talkingFallback === "true") return;
    img.dataset.talkingFallback = "true";
    img.onerror = null;
    if (fallbackSrc) img.src = fallbackSrc;
  };

  const [animate, setAnimate] = useState(true);
  const prevNameRef = useRef(name);

  useEffect(() => {
    if (name !== prevNameRef.current) {
      setAnimate(true);
      prevNameRef.current = name;
    }
  }, [name]);

  const handleAnimationEnd = () => setAnimate(false);

  const sfxVolumeRef = useLatestRef(sfxVolume);

  const isCompleteRef = useLatestRef(isComplete);
  const skipRef = useLatestRef(skip);
  const onNextRef = useLatestRef(onNext);
  const onSoundEndRef = useLatestRef(onSoundEnd);

  useEffect(() => {
    const controls = {
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onConfirm: () => {
        if (!isCompleteRef.current) {
          skipRef.current();
          return true;
        }
        if (onNextRef.current) {
          onNextRef.current();
          return true;
        }
        return;
      },
    };

    const remove = pushControls(controls);
    return remove;
  }, [pushControls, isCompleteRef, onNextRef, skipRef]);

  useEffect(() => {
    if (!soundSrc) return;

    const audio = new Audio(resolveAsset(soundSrc));
    audio.volume = sfxVolumeRef.current / 100;
    audio.play().catch(() => {});

    if (autoAdvanceOnSound) {
      audio.addEventListener("ended", () => {
        onSoundEndRef.current?.();
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [soundSrc, autoAdvanceOnSound, onSoundEndRef, sfxVolumeRef]);

  return (
    <div
      className={`talkingContainer${animate ? " talkingContainer--animate" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="talking">
        <h1>{name}</h1>
        <h2>{displayedText}</h2>
        {isComplete && <span className="talkingNextHint" />}
      </div>
      {resolvedSrc && (
        <img
          loading="lazy"
          decoding="async"
          key={resolvedSrc}
          className={`talkingImage ${imageClassName ?? ""}`.trim()}
          src={resolvedSrc}
          alt={name}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
