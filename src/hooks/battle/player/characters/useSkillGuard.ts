import type { RefObject } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuPause } from "@/hooks/battle/utilities/useMenuPause";
import {
  isPlayerFrozen,
  isPlayerParalyzed,
} from "@/gameRules/battle/status/statusEffects";

type SkillGuardOptions = {
  player: Player;
  /** Personagem dono da habilidade. */
  character: Player["character"];
  /** Lock de ação compartilhado (câmera, Vastolord, Emanuel, Órbita...). */
  freezeActionsUntilRef: RefObject<number>;
  disabledRef: RefObject<boolean>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  /**
   * Condições próprias da habilidade que entram no `canUse` — cooldown interno,
   * forma ativa, número de stacks. Combinam com `&&` na regra base.
   */
  extraCanUse?: () => boolean;
  /**
   * Recurso consumido pela habilidade (custo de ki, por exemplo). Entra no
   * `usable`, não no `canUse`: o personagem *pode* usar, só não tem o recurso
   * agora.
   */
  extraUsable?: () => boolean;
  /**
   * Razões para abortar uma habilidade **já em curso** — além de pausa/fim de
   * batalha, a forma pode ter expirado ou a habilidade já ter terminado.
   */
  extraCancel?: () => boolean;
};

type SkillGuard = {
  /** Só a regra de estado: personagem, chão, não congelado, sem lock. */
  canUse: boolean;
  /** `canUse` + recurso + não desabilitada + batalha rolando. */
  usable: boolean;
  usableRef: RefObject<boolean>;
  /** Abortar a habilidade em curso (lido de dentro de timers). */
  shouldCancelRef: RefObject<() => boolean>;
};

/**
 * Guarda de uso compartilhada pelas habilidades de personagem.
 *
 * Todas elas respondem à mesma pergunta antes de entrar — "o personagem é o
 * dono, está de pé no chão em batalha, não está congelado/paralisado e não está
 * sob lock de ação?" — e a mesma pergunta no meio — "a batalha continua e a
 * habilidade não foi desabilitada?". Isso era reescrito à mão em seis arquivos,
 * e uma regra esquecida num deles virava divergência silenciosa.
 *
 * "A batalha continua" na pausa tem nuance: a pausa dirigida pelo jogador (o
 * menu aberto) congela a IA e os ticks, mas a habilidade em curso continua —
 * só a pausa que interrompe a batalha de verdade aborta o golpe.
 *
 * Cada habilidade declara só o que é dela em `extraCanUse` / `extraUsable` /
 * `extraCancel`.
 */
export function useSkillGuard({
  player,
  character,
  freezeActionsUntilRef,
  disabledRef,
  isPausedRef,
  battleEndedRef,
  extraCanUse,
  extraUsable,
  extraCancel,
}: SkillGuardOptions): SkillGuard {
  const { isMenuOpenRef } = useMenuPause();

  const canUse =
    player.character === character &&
    player.mode === "battle" &&
    player.state === "idle" &&
    Math.abs(player.y - player.groundY) < 1 &&
    !isPlayerFrozen(player) &&
    !isPlayerParalyzed(player) &&
    freezeActionsUntilRef.current <= Date.now() &&
    (extraCanUse?.() ?? true);

  const usable =
    canUse &&
    (extraUsable?.() ?? true) &&
    !disabledRef.current &&
    !isPausedRef.current &&
    !battleEndedRef.current;

  return {
    canUse,
    usable,
    usableRef: useLatestRef(usable),
    shouldCancelRef: useLatestRef(
      () =>
        disabledRef.current ||
        // A pausa dirigida pelo jogador (menu aberto) NÃO aborta a habilidade:
        // o golpe tem de continuar enquanto o menu está aberto, senão a
        // entidade gerada some no meio do caminho e o cooldown já gasto vira
        // "nada aconteceu". Só a pausa que interrompe a batalha de verdade
        // (vitória, derrota, cutscene, rewind) cancela.
        (isPausedRef.current && !isMenuOpenRef.current) ||
        battleEndedRef.current ||
        (extraCancel?.() ?? false),
    ),
  };
}
