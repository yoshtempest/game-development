import { useEffect, useRef } from "react";

import { usePlayer } from "@/contexts/PlayerContext";
import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";
import { useMahoragaEvent } from "@/hooks/events/useMahoragaEvent";
import { useLatestRef } from "@/hooks/useLatestRef";

import { slotKey } from "@/services/save/slotManager";
import type { SlotScopedKey } from "@/services/save/slotManager";

/**
 * Nível do Mahoraga no encontro. Decisão para revisar: fixo (e não sorteado
 * por faixa como os encontros aleatórios) porque é boss de evento.
 */
export const MAHORAGA_NPC_LEVEL = 30;

export const MAHORAGA_BATTLE_ROUTE = "/battle/mahoraga";

type Options = {
  /**
   * Chave de retorno do local (a mesma do `useRandomEncounter` dele): o
   * restore de posição pós-batalha já é feito por aquele hook, então salvar
   * aqui na mesma chave devolve o jogador ao tile do encontro.
   */
  storageKey: SlotScopedKey;
};

/**
 * Encontro forçado com o Mahoraga: enquanto o evento estiver `active`, o
 * próximo passo do jogador no local leva à batalha.
 *
 * Não existe local "Shibuya" ainda; o feature que chama este hook é o
 * substituto até o local existir (issue #444). Quando Shibuya for criado,
 * basta mover a chamada para o feature dele.
 */
export function useMahoragaEncounter({ storageKey }: Options) {
  const { player } = usePlayer();
  const { navigateWithFade } = useTransitionCtx();
  const { status, markFought } = useMahoragaEvent();

  const playerRef = useLatestRef(player);
  const statusRef = useLatestRef(status);
  const markFoughtRef = useLatestRef(markFought);
  const navigateRef = useLatestRef(navigateWithFade);
  const lastPositionRef = useRef({ x: player.gridX, y: player.gridY });

  useEffect(() => {
    const current = playerRef.current;
    const moved =
      current.gridX !== lastPositionRef.current.x ||
      current.gridY !== lastPositionRef.current.y;
    lastPositionRef.current = { x: current.gridX, y: current.gridY };
    if (!moved) return;
    if (current.mode !== "explore" || statusRef.current !== "active") return;

    markFoughtRef.current();
    localStorage.setItem(
      slotKey(storageKey),
      JSON.stringify({
        x: current.gridX,
        y: current.gridY,
        direction: current.direction,
      }),
    );
    void navigateRef.current(MAHORAGA_BATTLE_ROUTE, {
      state: { npcLevel: MAHORAGA_NPC_LEVEL },
    });
  }, [
    player.gridX,
    player.gridY,
    storageKey,
    playerRef,
    statusRef,
    markFoughtRef,
    navigateRef,
  ]);
}
