import { useCallback, useRef } from "react";
import type { RefObject } from "react";

export function useBattleCooldowns() {
  const npcCooldown = useRef(true);
  const isEnding = useRef(false);

  return { npcCooldown, isEnding };
}

/** Intervalo do tick que conta o cooldown restante dos botões de habilidade. */
export const ABILITY_COOLDOWN_TICK_MS = 200;

/**
 * Congela um cooldown de relógio real enquanto a batalha está pausada.
 *
 * Os cooldowns de habilidade são deadlines de `Date.now()`
 * (`readyAt = Date.now() + cooldownMs`); com o menu de batalha aberto o
 * relógio real seguia correndo e o cooldown regenerava mesmo com a batalha
 * parada. Chame `tick()` de dentro do `setInterval` do countdown: enquanto
 * pausado ele marca o início da pausa e devolve `false` (o restante exibido
 * fica onde estava); no primeiro tick depois do fecho, empurra o deadline
 * pela duração pausada e devolve `true` — o countdown continua de onde parou.
 *
 * O shift é calculado no fecho com o tempo real pausado, então não sofre
 * drift do `setInterval`; o atraso máximo é o próprio intervalo do tick.
 */
export function useCooldownPauseTick({
  readyAtRef,
  isPausedRef,
}: {
  /** Deadline do cooldown em `Date.now()`, empurrado durante a pausa. */
  readyAtRef: RefObject<number>;
  /** Pausa global da batalha (menu aberto, intro, vitória, rewind...). */
  isPausedRef: RefObject<boolean> | undefined;
}) {
  const pauseStartRef = useRef(0);

  return useCallback(() => {
    if (isPausedRef?.current) {
      // Marca só uma vez por pausa: o shift lá na frente mede do primeiro
      // tick depois da abertura até o primeiro depois do fecho.
      if (pauseStartRef.current === 0) pauseStartRef.current = Date.now();
      return false;
    }
    const pauseStart = pauseStartRef.current;
    pauseStartRef.current = 0;
    // Deadline já vencido (ou nunca armado) não é shiftado: reempurrar um
    // cooldown velho faria o botão recusar um uso legítimo.
    if (pauseStart !== 0 && readyAtRef.current > pauseStart) {
      readyAtRef.current += Date.now() - pauseStart;
    }
    return true;
  }, [isPausedRef, readyAtRef]);
}
