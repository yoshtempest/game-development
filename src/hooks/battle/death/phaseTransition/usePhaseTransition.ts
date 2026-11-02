import type { Props } from "./types";
import { useEffect, useRef } from "react";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";

export function usePhaseTransition({
  npcPhase,
  player,
  setPlayer,
  npc,
  clearSummons,
  clearAllies,
  setIsPhaseTransitioning,
}: Props) {
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (npcPhase !== 2) return;

    clearSummons();
    clearAllies();
    setIsPhaseTransitioning(true);

    const startPlayerX = player.x;
    const startPlayerY = player.y;
    const startNpcX = npc.x;
    const DURATION = 700;

    setPlayer((p) => ({
      ...p,
      state: "walk",
      battleDirection: "right",
    }));
    npc.updateNpc({ direction: "left", state: "walk" });

    const startTime = performance.now();
    let animFrame: number;

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      const px = startPlayerX + (BATTLE_SPAWN.player.x - startPlayerX) * ease;
      const py = startPlayerY + (BATTLE_SPAWN.npc.y - startPlayerY) * ease;
      const nx = startNpcX + (BATTLE_SPAWN.npc.x - startNpcX) * ease;

      setPlayer((p) => ({
        ...p,
        x: px,
        y: py,
        groundY: BATTLE_SPAWN.player.y,
        velY: 0,
        battleDirection: "right",
      }));
      npc.updateNpc({ x: nx, y: BATTLE_SPAWN.npc.y });

      if (t < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setPlayer((p) => ({
          ...p,
          x: BATTLE_SPAWN.player.x,
          y: BATTLE_SPAWN.player.y,
          groundY: BATTLE_SPAWN.player.y,
          velY: 0,
          state: "idle",
          battleDirection: "right",
        }));
        npc.resetNpc("pitch");
        phaseTimeoutRef.current = setTimeout(
          () => setIsPhaseTransitioning(false),
          600,
        );
      }
    }

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(phaseTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcPhase]);
}
