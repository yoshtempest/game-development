import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { FOUR_THOUSAND_MS, ONE_THOUSAND_MS } from "@/data/ms";

export const VASTOLORD_MULTIPLIER = 4;
export const VASTOLORD_DURATION_MS = 10_000;
const VASTOLORD_TICK_MS = 100;

/** Extensão de duração: +0.1s a cada 10% do dano base causado a um inimigo. */
export const VASTOLORD_DAMAGE_EXTEND_MS = 50;
/** Fração do dano base que gera uma extensão de VASTOLORD_DAMAGE_EXTEND_MS. */
export const VASTOLORD_DAMAGE_EXTEND_RATIO = 0.1;
/** Extensão de duração ao matar qualquer inimigo (inclusive summons) na forma. */
export const VASTOLORD_KILL_EXTEND_MS = 3 * ONE_THOUSAND_MS;

/** Duração total da animação de transformação (`transformating/*`). */
export const VASTOLORD_TRANSFORM_MS = FOUR_THOUSAND_MS;
/** Tempo de cada quadro da transformação (screamOne→screamTwo→screamThree→transformated). */
export const VASTOLORD_TRANSFORM_FRAME_MS = ONE_THOUSAND_MS;
export const VASTOLORD_TRANSFORM_FRAME_COUNT = 4;

type Props = {
  enabled: boolean;
  durationMs: number;
  /** Pausa a contagem enquanto a batalha estiver pausada. */
  isPausedRef?: React.RefObject<boolean>;
  /** Aponta para o `isEnding` da batalha; para de contar quando ela acaba. */
  isEndingRef?: React.RefObject<{ current: boolean }>;
  onExpire: () => void;
  /** Callback opcional chamado quando o jogador pula a animação de transformação. */
  onSkip?: () => void;
};

export type VastolordFormApi = {
  vastolordActive: boolean;
  vastolordRemainingMs: number;
  /** Quadro atual da transformação (0=screamOne … 3=transformated) ou `null`. */
  transformationFrame: number | null;
  triggerVastolord: () => void;
  resetVastolord: () => void;
  /** Aumenta a duração restante da forma em `ms` (sem efeito fora dela). */
  extendVastolord: (ms: number) => void;
  /** Pula a animação de transformação indo direto ao último quadro. */
  skipVastolordTransform: () => void;
};

/**
 * Passiva do marcelo: ao morrer, desperta a Forma Vastolord por `durationMs`.
 * A barra de vida volta a 100%, dano e armadura multiplicam por 4 e, se o
 * inimigo não for derrotado dentro do prazo, o jogador perde a batalha.
 *
 * A transformação ativa a sequência de sprites `transformating/` por
 * `VASTOLORD_TRANSFORM_MS` (1s por quadro), ao fim da qual o sprite volta ao
 * `idle` da forma. `vastolordActive` já é verdadeiro durante a animação — os
 * sprites do marcelo passam a vir exclusivamente de `vastolordForm/`.
 */
export function useVastolordForm({
  enabled,
  durationMs,
  isPausedRef,
  isEndingRef,
  onExpire,
  onSkip,
}: Props): VastolordFormApi {
  const [vastolordActive, setVastolordActive] = useState(false);
  const [vastolordRemainingMs, setVastolordRemainingMs] = useState(0);
  const [transformationFrame, setTransformationFrame] = useState<number | null>(
    null,
  );
  const remainingRef = useRef(0);
  const transformFrameTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const onExpireRef = useLatestRef(onExpire);
  const onSkipRef = useLatestRef(onSkip);

  const triggerVastolord = useCallback(() => {
    if (!enabled) return;
    remainingRef.current = durationMs;
    setVastolordRemainingMs(durationMs);
    setVastolordActive(true);

    // Animação da transformação: screamOne → screamTwo → screamThree →
    // transformated, 1s por quadro; ao fim (`VASTOLORD_TRANSFORM_MS`) o
    // sprite volta ao idle da forma.
    if (transformFrameTimerRef.current) {
      clearInterval(transformFrameTimerRef.current);
      transformFrameTimerRef.current = null;
    }
    let frame = 0;
    setTransformationFrame(0);
    transformFrameTimerRef.current = setInterval(() => {
      frame += 1;
      if (frame >= VASTOLORD_TRANSFORM_FRAME_COUNT) {
        if (transformFrameTimerRef.current) {
          clearInterval(transformFrameTimerRef.current);
          transformFrameTimerRef.current = null;
        }
        setTransformationFrame(null);
        return;
      }
      setTransformationFrame(frame);
    }, VASTOLORD_TRANSFORM_FRAME_MS);
  }, [enabled, durationMs]);

  const resetVastolord = useCallback(() => {
    remainingRef.current = 0;
    setVastolordRemainingMs(0);
    setVastolordActive(false);
    if (transformFrameTimerRef.current) {
      clearInterval(transformFrameTimerRef.current);
      transformFrameTimerRef.current = null;
    }
    setTransformationFrame(null);
  }, []);

  /** Pula a animação de transformação Vastolord: vai direto ao último quadro. */
  const skipVastolordTransform = useCallback(() => {
    if (transformationFrame === null) return;
    if (transformFrameTimerRef.current) {
      clearInterval(transformFrameTimerRef.current);
      transformFrameTimerRef.current = null;
    }
    setTransformationFrame(null);
    onSkipRef.current?.();
  }, [transformationFrame, onSkipRef]);

  const extendVastolord = useCallback(
    (ms: number) => {
      if (!vastolordActive) return;
      remainingRef.current = Math.max(0, remainingRef.current) + ms;
      setVastolordRemainingMs(remainingRef.current);
    },
    [vastolordActive],
  );

  useEffect(() => {
    return () => {
      if (transformFrameTimerRef.current) {
        clearInterval(transformFrameTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!vastolordActive) return;

    const interval = window.setInterval(() => {
      if (isPausedRef?.current || isEndingRef?.current.current) return;
      if (remainingRef.current <= 0) return;
      const next = Math.max(0, remainingRef.current - VASTOLORD_TICK_MS);
      remainingRef.current = next;
      setVastolordRemainingMs(next);

      if (next <= 0) {
        setVastolordActive(false);
        onExpireRef.current();
      }
    }, VASTOLORD_TICK_MS);

    return () => window.clearInterval(interval);
  }, [vastolordActive, isPausedRef, isEndingRef, onExpireRef]);

  return {
    vastolordActive,
    vastolordRemainingMs,
    transformationFrame,
    triggerVastolord,
    resetVastolord,
    extendVastolord,
    skipVastolordTransform,
  };
}
