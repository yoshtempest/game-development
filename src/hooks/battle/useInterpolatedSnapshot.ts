import { useEffect, useRef, useState } from "react";
import type { BattleSnapshot } from "@/hooks/battle/useBattleSnapshot";

const LERP = 0.25;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useInterpolatedSnapshot(snapshot: BattleSnapshot | null) {
  const [interp, setInterp] = useState<BattleSnapshot | null>(snapshot);
  const targetRef = useRef<BattleSnapshot | null>(snapshot);
  const currentRef = useRef<BattleSnapshot | null>(snapshot);

  useEffect(() => {
    targetRef.current = snapshot;
    if (!currentRef.current && snapshot) {
      currentRef.current = snapshot;
      setInterp(snapshot);
    }
  }, [snapshot]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      if (target && current) {
        const next: BattleSnapshot = {
          t: Date.now(),
          player: target.player
            ? {
                x: lerp(current.player?.x ?? target.player.x, target.player.x, LERP),
                y: lerp(current.player?.y ?? target.player.y, target.player.y, LERP),
                hp: target.player.hp,
                state: target.player.state,
                direction: target.player.direction,
                character: target.player.character,
              }
            : undefined,
          npc: target.npc
            ? {
                x: lerp(current.npc?.x ?? target.npc.x, target.npc.x, LERP),
                y: lerp(current.npc?.y ?? target.npc.y, target.npc.y, LERP),
                hp: target.npc.hp,
                state: target.npc.state,
                phase: target.npc.phase,
              }
            : undefined,
        };
        currentRef.current = next;
        setInterp(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return interp;
}