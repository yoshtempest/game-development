import type { RefObject } from "react";

export type SkillGuardOptions = {
  player: Player;
  /** Personagem dono da habilidade. */
  character: Player["character"];
  /** Lock de ação compartilhado (câmera, Vastolord, Ematron, Órbita...). */
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

export type SkillGuard = {
  /** Só a regra de estado: personagem, chão, não congelado, sem lock. */
  canUse: boolean;
  /** `canUse` + recurso + não desabilitada + batalha rolando. */
  usable: boolean;
  usableRef: RefObject<boolean>;
  /** Abortar a habilidade em curso (lido de dentro de timers). */
  shouldCancelRef: RefObject<() => boolean>;
};
