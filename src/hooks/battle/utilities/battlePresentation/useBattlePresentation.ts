import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameAudio } from "@/hooks/game/useGameAudio";
import {
  useVastolordForm,
  VASTOLORD_DURATION_MS,
  VASTOLORD_MULTIPLIER,
} from "@/hooks/battle/player/characters/marshadow/vastolordForm/useVastolordForm";
import { useKokusenAnimation } from "@/hooks/battle/player/characters/natsuki/useKokusenAnimation";
import {
  useBlackFlashAnimation,
  BLACK_FLASH_TIME_SCALE,
} from "@/hooks/battle/player/characters/natsuki/useBlackFlashAnimation";
import { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/blinkAnimation/useBlinkAnimation";
import { useDivergentFistAnimation } from "@/hooks/battle/player/characters/natsuki/useDivergentFistAnimation";
import { getCharacterPassive } from "@/data/characters/passives";
import { BANKAI_DAMAGE_MULTIPLIER } from "@/data/characters/marshadow/bankai";

export function useBattlePresentation({
  setup,
  audioSrc,
  training,
  isPausedRef,
  vastolordEndingRef,
  runDefeatRef,
}: Props) {
  const { player, setTimeScale, resetTimeScale, forcePunchRef } = setup;

  const { kokusenActive, kokusenFrame, triggerKokusen } = useKokusenAnimation();
  const onKokusenRef = useLatestRef(triggerKokusen);

  const { blackFlashActive, blackFlashVariant, triggerBlackFlash } =
    useBlackFlashAnimation();
  const onBlackFlashRef = useLatestRef(triggerBlackFlash);

  useEffect(() => {
    if (blackFlashActive) {
      setTimeScale(BLACK_FLASH_TIME_SCALE);
    } else {
      resetTimeScale();
    }
  }, [blackFlashActive, setTimeScale, resetTimeScale]);

  const { blinkVisual, triggerBlink, clearBlink } = useBlinkAnimation();

  const [divergentFistActive, setDivergentFistActive] = useState(false);
  const divergentFistRef = useRef(false);
  const { divergentFistFrame, triggerDivergentFist, clearDivergentFist } =
    useDivergentFistAnimation();

  const onDivergentFistConsumed = useCallback(() => {
    setDivergentFistActive(false);
    forcePunchRef.current = false;
    triggerDivergentFist();
  }, [forcePunchRef, triggerDivergentFist]);
  const onDivergentFistConsumedRef = useLatestRef(onDivergentFistConsumed);

  const vastolordActiveRef = useRef(false);
  const vastolordUsedRef = useRef(false);
  const vastolordMultiplierRef = useRef<() => number>(() => 1);
  const bankaiActiveRef = useRef(false);

  const vastolordDurationMs =
    getCharacterPassive(player.character, "vastolordForm")?.effect.durationMs ??
    VASTOLORD_DURATION_MS;

  const {
    vastolordActive,
    vastolordRemainingMs,
    transformationFrame,
    triggerVastolord,
    resetVastolord,
    extendVastolord,
    skipVastolordTransform,
  } = useVastolordForm({
    enabled: player.character === "marshadow" && !training,
    durationMs: vastolordDurationMs,
    isPausedRef,
    isEndingRef: vastolordEndingRef,
    onExpire: () => runDefeatRef.current(),
    onSkip: () => {
      // O skip da transformação é chamado via UI; nada extra aqui.
    },
  });
  vastolordActiveRef.current = vastolordActive;
  vastolordMultiplierRef.current = () =>
    (vastolordActive ? VASTOLORD_MULTIPLIER : 1) *
    (bankaiActiveRef.current ? BANKAI_DAMAGE_MULTIPLIER : 1);

  useGameAudio({ src: audioSrc, loop: true, volume: 0.5 });

  return {
    kokusenActive,
    kokusenFrame,
    onKokusenRef,
    blackFlashActive,
    blackFlashVariant,
    onBlackFlashRef,
    blinkVisual,
    triggerBlink,
    clearBlink,
    divergentFistActive,
    setDivergentFistActive,
    divergentFistRef,
    divergentFistFrame,
    clearDivergentFist,
    onDivergentFistConsumedRef,
    vastolordActive,
    vastolordRemainingMs,
    transformationFrame,
    triggerVastolord,
    resetVastolord,
    extendVastolord,
    skipVastolordTransform,
    vastolordUsedRef,
    vastolordActiveRef,
    vastolordMultiplierRef,
    bankaiActiveRef,
  };
}
