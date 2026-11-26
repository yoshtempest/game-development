import { useEffect, useState } from "react";

import { NPC_PUSHED_SPRITE_MS } from "@/data/npc";

/**
 * Pose de "empurrado" do NPC por um tempo curto depois do knockback (issue #244).
 *
 * O gatilho é um contador (`pushCount`) que os funis de empurrão incrementam no
 * estado do NPC, e não um timestamp: comparar número com o valor anterior
 * durante o render (mesmo padrão do `useHitFlash`) dispensa `Date.now()` no
 * render e detecta dois empurrões seguidos. Só o fim da pose usa timer, e um
 * empurrão novo reinicia a contagem porque o effect depende do contador.
 *
 * @param pushCount - Total de empurrões sofridos; `undefined` = nunca empurrado.
 * @returns `true` enquanto a pose de empurrado deve aparecer.
 */
export function usePushedPose(pushCount: number | undefined): boolean {
  const [prevCount, setPrevCount] = useState(pushCount);
  const [isPushed, setIsPushed] = useState(false);

  if (pushCount !== prevCount) {
    setPrevCount(pushCount);
    if (pushCount !== undefined && pushCount > (prevCount ?? 0)) {
      setIsPushed(true);
    }
  }

  useEffect(() => {
    if (!isPushed) return;
    const timer = setTimeout(() => setIsPushed(false), NPC_PUSHED_SPRITE_MS);
    return () => clearTimeout(timer);
  }, [isPushed, pushCount]);

  return isPushed;
}
