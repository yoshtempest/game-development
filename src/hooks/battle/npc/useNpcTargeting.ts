import { useRef } from "react";
import type { OnBeforeNpcHit } from "@/hooks/battle/npc/blocking/useBlocking";

export function useNpcTargeting() {
  const npcAiHpRef = useRef(0);
  const npcAiMaxHpRef = useRef(0);

  const npcBlockedRef = useRef(false);
  const npcBlockTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const onBeforeNpcHitRef = useRef<OnBeforeNpcHit>(() => ({ blocked: false }));

  return {
    npcAiHpRef,
    npcAiMaxHpRef,
    npcBlockedRef,
    npcBlockTimerRef,
    onBeforeNpcHitRef,
  };
}
