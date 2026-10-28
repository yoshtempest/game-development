import { useCallback, useEffect, useRef, useState } from "react";
import {
  BLINK_UNTIL_TELEPORT_MS,
  BLINK_AFTERIMAGE_MS,
} from "@/gameRules/battle/cursedEnergy";

export type BlinkVisual = {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  state: PlayerState;
  /** true quando o teleporte aconteceu: o jogador surge no destino com silhueta branca. */
  teleported: boolean;
};

/**
 * Coreografia visual do blink do natsuki:
 * 1. Por `BLINK_UNTIL_TELEPORT_MS` o personagem não teleporta e vira silhueta
 *    preta no local de origem.
 * 2. Em seguida teleporta: o destino mostra silhueta branca enquanto a silhueta
 *    preta do local anterior ainda é renderizada (após-imagem).
 * 3. A silhueta da origem some após `BLINK_AFTERIMAGE_MS`.
 */
export function useBlinkAnimation() {
  const [visual, setVisual] = useState<BlinkVisual | null>(null);
  const teleportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (teleportTimerRef.current) {
      clearTimeout(teleportTimerRef.current);
      teleportTimerRef.current = null;
    }
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const clearBlink = useCallback(() => {
    clearTimers();
    setVisual(null);
  }, [clearTimers]);

  useEffect(() => clearBlink, [clearBlink]);

  const triggerBlink = useCallback(
    (
      origin: { x: number; y: number },
      target: { x: number; y: number },
      snapshot: { direction: Direction; state: PlayerState },
      onTeleport: () => void,
    ) => {
      clearTimers();
      setVisual({
        originX: origin.x,
        originY: origin.y,
        targetX: target.x,
        targetY: target.y,
        direction: snapshot.direction,
        state: snapshot.state,
        teleported: false,
      });
      teleportTimerRef.current = setTimeout(() => {
        onTeleport();
        setVisual((v) => (v ? { ...v, teleported: true } : v));
      }, BLINK_UNTIL_TELEPORT_MS);
      clearTimerRef.current = setTimeout(
        () => setVisual(null),
        BLINK_AFTERIMAGE_MS,
      );
    },
    [clearTimers],
  );

  return { blinkVisual: visual, triggerBlink, clearBlink };
}
