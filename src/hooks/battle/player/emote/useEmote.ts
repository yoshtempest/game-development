import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  isPlayerFrozen,
  isPlayerParalyzed,
} from "@/gameRules/battle/status/statusEffects";
import { hasEmote } from "@/data/characters/emotes";

type Params = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /**
   * Bloqueio externo ao estado do player. O marshadow na Forma Vastolord não
   * tem `idle2`/`idle3` na pasta `vastolordForm/`, então o emote some ali.
   */
  blocked: boolean;
};

export type EmoteApi = {
  /** O personagem tem os sprites do emote — decide se o botão aparece. */
  emoteAvailable: boolean;
  /** Pode entrar no emote agora (parado no chão, sem status que trave). */
  emoteUsable: boolean;
  emotePress: () => void;
};

/**
 * Regra de entrada do emote, compartilhada pelo render (botão habilitado) e
 * pelo updater (que relê o player mais recente): só a partir do `idle`, no
 * chão, em batalha e sem congelamento/paralisia.
 */
function canStartEmote(player: Player): boolean {
  return (
    hasEmote(player.character) &&
    player.mode === "battle" &&
    player.state === "idle" &&
    Math.abs(player.y - player.groundY) < 1 &&
    !isPlayerFrozen(player) &&
    !isPlayerParalyzed(player)
  );
}

/**
 * Emote/taunt de batalha: toca `idle2` → `idle3` → `idle` pelo
 * `animationFlow` e não causa dano. Não há timer próprio a limpar — a
 * sequência é só estado, então qualquer ação (andar, pular, atacar, usar
 * habilidade, apanhar) sobrescreve o estado e interrompe o emote. As entradas
 * que exigem o player parado aceitam o emote via `ALL_PREDICATES.isReady`.
 */
export function useEmote({ player, setPlayer, blocked }: Params): EmoteApi {
  const emoteAvailable = hasEmote(player.character) && !blocked;
  const emoteUsable = emoteAvailable && canStartEmote(player);

  const emotePress = useCallback(() => {
    if (blocked) return;
    setPlayer((p) => (canStartEmote(p) ? { ...p, state: "idle2" } : p));
  }, [blocked, setPlayer]);

  return { emoteAvailable, emoteUsable, emotePress };
}
