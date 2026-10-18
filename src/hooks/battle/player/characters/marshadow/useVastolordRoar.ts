import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { clampX } from "@/gameRules/movement/clampX";
import {
  VASTOLORD_ROAR_PUSH_PER_TICK_PX,
  VASTOLORD_ROAR_RADIUS_PX,
  VASTOLORD_ROAR_SCREAM_FRAMES,
  VASTOLORD_ROAR_TICK_MS,
} from "@/data/characters/marcelo/vastolordForm";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  /** Quadro da transformação (0=screamOne … 3=transformated) ou `null`. */
  transformationFrame: number | null;
  /** X do jogador — origem do empurrão (o Vastolord grita parado). */
  playerX: number;
  /** NPC principal: estado lido via ref; `setNpc` aplica o empurrão. */
  npc: {
    x: number;
    setNpc: Dispatch<SetStateAction<NPCBattleState>>;
  };
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
};

/** Distância horizontal até a origem e direção para longe dela. */
function awayFrom(
  originX: number,
  x: number,
): { distance: number; dir: 1 | -1 } {
  return { distance: Math.abs(x - originX), dir: x >= originX ? 1 : -1 };
}

/**
 * Grito da transformação Vastolord: enquanto o sprite do Vastolord está num
 * quadro de grito (`screamOne/Two/Three`), empurra continuamente para longe todo
 * inimigo dentro do raio — `VASTOLORD_ROAR_PUSH_PER_TICK_PX` a cada
 * `VASTOLORD_ROAR_TICK_MS`. O deslocamento é o mesmo do laser: horizontal,
 * passando pelo `clampX`, e cada alvo é empurrado enquanto estiver dentro do
 * raio. Quem está colado leva os 200px inteiros; quem já está na beirada sai
 * pouco antes de ficar fora de alcance — a queda por proximidade é consequência
 * do raio, não de uma fórmula de falloff.
 *
 * Os updates usam o setter FUNCIONAL (`setNpc`/`setSummons`) de propósito: a
 * 10ms por tick o React pode não ter re-renderizado entre dois ticks, e um valor
 * absoluto calculado sobre estado velho perderia empurrões. Com o updater o
 * incremento é sempre cumulativo.
 */
export function useVastolordRoar({
  transformationFrame,
  playerX,
  npc,
  setSummons,
}: Props): void {
  const npcRef = useLatestRef(npc);
  const playerXRef = useLatestRef(playerX);

  const screaming =
    transformationFrame != null &&
    transformationFrame < VASTOLORD_ROAR_SCREAM_FRAMES;

  useEffect(() => {
    if (!screaming) return;

    const tick = () => {
      const originX = playerXRef.current;

      // NPC principal: só enquanto estiver dentro do raio.
      npcRef.current.setNpc((state) => {
        const { distance, dir } = awayFrom(originX, state.x);
        if (distance >= VASTOLORD_ROAR_RADIUS_PX) return state;
        return {
          ...state,
          x: clampX(state.x + dir * VASTOLORD_ROAR_PUSH_PER_TICK_PX),
        };
      });

      // Summons: cada um com a própria distância ao Vastolord.
      setSummons((prev) => {
        let changed = false;
        const next = prev.map((summon) => {
          if (summon.isDying) return summon;
          const { distance, dir } = awayFrom(originX, summon.x);
          if (distance >= VASTOLORD_ROAR_RADIUS_PX) return summon;
          changed = true;
          return {
            ...summon,
            x: clampX(summon.x + dir * VASTOLORD_ROAR_PUSH_PER_TICK_PX),
          };
        });
        return changed ? next : prev;
      });
    };

    const interval = window.setInterval(tick, VASTOLORD_ROAR_TICK_MS);
    return () => window.clearInterval(interval);
  }, [screaming, npcRef, playerXRef, setSummons]);
}
