import { useCallback, useState } from "react";
import type { RefObject } from "react";

import { useLaricellCooldown } from "./useLaricellCooldown";
import { clampX } from "@/gameRules/movement/clampX";
import { LaricellIceWallConstants } from "@/data/characters/laricell/laricell";
import type { PausableTimers } from "@/hooks/battle/utilities/pausableTimers/types";
import type { BattleBarrier } from "@/utils/types/battle/npcControl";
import type { LaricellAbilityButton, LaricellAbilityDeps } from "./types";

type Props = LaricellAbilityDeps & {
  barrierRef: RefObject<BattleBarrier | null>;
  timers: PausableTimers;
};

/**
 * A1 — Parede de Gelo. Ergue a barreira à frente da Laricell e a derruba com
 * um timer pausável.
 *
 * O `until` da barreira fica em infinito de propósito: quem a derruba é o
 * timer (que congela com o menu aberto), não um deadline de relógio real —
 * senão abrir o menu consumiria a parede sem a batalha andar.
 */
export function useIceWall({
  player,
  usableRef,
  isPausedRef,
  cooldownReduction,
  playSound,
  onUsed,
  barrierRef,
  timers,
}: Props): LaricellAbilityButton & { wall: BattleBarrier | null } {
  const [wall, setWall] = useState<BattleBarrier | null>(null);
  const { arm, isReady, remaining } = useLaricellCooldown({
    isPausedRef,
    cooldownReduction,
  });

  const press = useCallback(() => {
    if (!usableRef.current || !isReady()) return;
    const dir = player.battleDirection === "left" ? -1 : 1;
    const next: BattleBarrier = {
      x: clampX(player.x + dir * LaricellIceWallConstants.OFFSET_PX),
      halfWidth: LaricellIceWallConstants.HALF_WIDTH_PX,
      until: Number.POSITIVE_INFINITY,
    };
    barrierRef.current = next;
    setWall(next);
    playSound("shieldStack");
    onUsed();
    arm(LaricellIceWallConstants.COOLDOWN_MS);
    timers.schedule(() => {
      if (barrierRef.current === next) barrierRef.current = null;
      setWall((current) => (current === next ? null : current));
    }, LaricellIceWallConstants.DURATION_MS);
  }, [
    arm,
    barrierRef,
    isReady,
    onUsed,
    player.battleDirection,
    player.x,
    playSound,
    timers,
    usableRef,
  ]);

  return {
    press,
    usable: remaining <= 0,
    remaining,
    wall,
  };
}
