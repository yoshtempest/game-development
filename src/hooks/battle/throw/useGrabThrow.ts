import { useRef, useState, useCallback, useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

import { clampX } from "@/gameRules/movement/clampX";
type Props = {
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  npcThrowAttackRef: React.RefObject<() => void>;
  /**
   * `true` enquanto o jogador não pode ser agarrado nem arremessado (sequência
   * do O Abençoado): o agarrão/arremesso trocaria o estado para `fallen` e
   * cancelaria a coreografia.
   */
  displacementLockedRef: React.RefObject<boolean>;
};

export function useGrabThrow({
  setPlayer,
  npcThrowAttackRef,
  displacementLockedRef,
}: Props) {
  const [isGrabbed, setIsGrabbed] = useState(false);
  const isGrabbedRef = useLatestRef(isGrabbed);

  const [grabFlipped, setGrabFlipped] = useState(false);
  const grabFlippedRef = useLatestRef(grabFlipped);

  const grabbedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isThrown, setIsThrown] = useState(false);

  const onGrabPlayer = useCallback(
    (flipped: boolean) => {
      if (displacementLockedRef.current) return;
      setGrabFlipped(flipped);
      setIsGrabbed(true);
      setPlayer((p) => ({ ...p, grabbedUntil: Date.now() + 4000 }));
      if (grabbedTimerRef.current) clearTimeout(grabbedTimerRef.current);
      grabbedTimerRef.current = setTimeout(() => {
        setIsGrabbed(false);
        setGrabFlipped(false);
      }, 4000);
    },
    [setPlayer, displacementLockedRef],
  );

  const onThrowStart = useCallback(
    (npcX: number, npcDirection: "left" | "right") => {
      if (displacementLockedRef.current) return;
      setIsThrown(true);
      setPlayer((p) => {
        const dirAway = npcX > p.x ? -1 : 1;
        const throwToX = clampX(p.x + dirAway * 300);
        return {
          ...p,
          throwStartTime: Date.now(),
          throwFromX: p.x,
          throwToX,
          battleDirection: npcDirection,
          state: "fallen",
        };
      });
    },
    [setPlayer, displacementLockedRef],
  );

  /**
   * Solta o jogador de um agarrão/arremesso em curso sem passar pela
   * recuperação no chão. Usado quando a sequência do O Abençoado começa no
   * meio do arremesso: o player já teve `throwStartTime` zerado, então a
   * animação de arremesso nunca agenda o `setIsThrown(false)` dela e os
   * controles ficariam travados para sempre.
   */
  const releasePlayer = useCallback(() => {
    if (grabbedTimerRef.current) {
      clearTimeout(grabbedTimerRef.current);
      grabbedTimerRef.current = null;
    }
    setIsGrabbed(false);
    setGrabFlipped(false);
    setIsThrown(false);
  }, []);

  const onThrowPlayer = useCallback(() => {
    setIsGrabbed(false);
    npcThrowAttackRef.current();
  }, [npcThrowAttackRef]);

  useEffect(() => {
    return () => {
      if (grabbedTimerRef.current) clearTimeout(grabbedTimerRef.current);
    };
  }, []);

  return {
    isGrabbedRef,
    grabFlipped,
    grabFlippedRef,
    isThrown,
    setIsThrown,
    grabbedTimerRef,
    setIsGrabbed,
    onGrabPlayer,
    onThrowStart,
    onThrowPlayer,
    releasePlayer,
  };
}
