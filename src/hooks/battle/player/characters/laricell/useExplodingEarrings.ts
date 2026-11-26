import { useCallback, useRef, useState } from "react";

import { useLaricellCooldown } from "./useLaricellCooldown";
import { LaricellEarringsConstants } from "@/data/characters/laricell/laricell";
import { FOUR_HUNDRED_MS } from "@/data/ms";
import type { PausableTimers } from "@/hooks/battle/utilities/pausableTimers/types";
import type {
  LaricellAbilitiesProps,
  LaricellAbilityButton,
  LaricellAbilityDeps,
  LaricellEarrings,
} from "./types";

type Props = LaricellAbilityDeps & {
  timers: PausableTimers;
  areaHit: LaricellAbilitiesProps["areaHit"];
};

/** Quanto o sprite da explosão fica na tela depois do dano. */
const EXPLOSION_VISIBLE_MS = FOUR_HUNDRED_MS;

/**
 * A2 — Brincos Explosivos. O alvo é a posição do NPC **no arremesso**; a
 * explosão acontece ali depois do pavio, então um inimigo que sai do raio
 * escapa. É o que separa a habilidade de um golpe direto. O dano passa pelo
 * funil de área (`areaHit`) com a natureza declarada no dado
 * (`explodingEarrings`, mágico).
 */
export function useExplodingEarrings({
  npc,
  usableRef,
  isPausedRef,
  cooldownReduction,
  playSound,
  onUsed,
  timers,
  areaHit,
}: Props): LaricellAbilityButton & { earrings: LaricellEarrings | null } {
  const [earrings, setEarrings] = useState<LaricellEarrings | null>(null);
  const idRef = useRef(0);
  const { arm, isReady, remaining } = useLaricellCooldown({
    isPausedRef,
    cooldownReduction,
  });

  const press = useCallback(() => {
    if (!usableRef.current || !isReady()) return;
    idRef.current += 1;
    const thrown: LaricellEarrings = {
      id: idRef.current,
      x: npc.x,
      y: npc.y,
      phase: "fuse",
    };
    setEarrings(thrown);
    onUsed();
    arm(LaricellEarringsConstants.COOLDOWN_MS);

    timers.schedule(() => {
      setEarrings((current) =>
        current?.id === thrown.id
          ? { ...current, phase: "explosion" }
          : current,
      );
      playSound("explosion");
      areaHit(
        "explodingEarrings",
        thrown.x,
        thrown.y,
        LaricellEarringsConstants.RADIUS_PX,
        LaricellEarringsConstants.MULTIPLIER,
      );
    }, LaricellEarringsConstants.FUSE_MS);

    timers.schedule(() => {
      setEarrings((current) => (current?.id === thrown.id ? null : current));
    }, LaricellEarringsConstants.FUSE_MS + EXPLOSION_VISIBLE_MS);
  }, [
    areaHit,
    arm,
    isReady,
    npc.x,
    npc.y,
    onUsed,
    playSound,
    timers,
    usableRef,
  ]);

  return { press, usable: remaining <= 0, remaining, earrings };
}
