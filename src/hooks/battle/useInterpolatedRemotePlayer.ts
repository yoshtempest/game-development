import { useEffect, useRef, useState } from "react";

/** Frame do jogador remoto como chega pelo socket (10 Hz). */
export type RemotePlayerFrame = {
  x: number;
  y: number;
  hp: number;
  state?: string;
  direction?: Direction;
  character?: string;
};

const LERP = 0.3;

/**
 * Interpola a posição do jogador remoto no cliente que **hospeda** a batalha.
 * O estado chega a 10 Hz; aplicar `lerp` dentro do effect de mensagem só dava um
 * passo a cada 100 ms (avatar "teleportando"). Aqui o alvo mais recente fica num
 * ref e o RAF persegue ele a cada frame, como no `useInterpolatedSnapshot` do
 * guest.
 */
export function useInterpolatedRemotePlayer(
  target: RemotePlayerFrame | null,
): { x: number; y: number } | null {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    target ? { x: target.x, y: target.y } : null,
  );
  const targetRef = useRef(target);
  const currentRef = useRef(position);

  useEffect(() => {
    targetRef.current = target;
    if (!currentRef.current && target) {
      const next = { x: target.x, y: target.y };
      currentRef.current = next;
      setPosition(next);
    }
  }, [target]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const current = currentRef.current;
      const nextTarget = targetRef.current;
      if (current && nextTarget) {
        const next = {
          x: current.x + (nextTarget.x - current.x) * LERP,
          y: current.y + (nextTarget.y - current.y) * LERP,
        };
        currentRef.current = next;
        setPosition(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return position;
}
