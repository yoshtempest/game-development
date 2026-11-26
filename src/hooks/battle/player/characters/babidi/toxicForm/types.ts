import type { RefObject } from "react";

import type { BattleManaApi } from "@/contexts/BattleManaContext";

export type Props = {
  player: Player;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  /**
   * Outra transformação ocupando o personagem (Machine Gama sob controle):
   * nesse estado o babidi nem aparece, então o Modo Tóxico não pode ativar.
   */
  blocked: boolean;
  /** Consumo contabilizado (carga da Expansão de Domínio). */
  onUsed: () => void;
  /** Aplica o veneno no inimigo principal (o roll de chance já passou). */
  onPoison: () => void;
  cooldownReduction: number;
};

export type BabidiToxicFormApi = {
  /** Transformação em curso: muda o sprite e liga o veneno do básico. */
  active: boolean;
  press: () => void;
  usable: boolean;
  /** Segundos restantes de cooldown (botão). */
  remaining: number;
  cost: number;
  /**
   * Chamado a cada acerto do básico no inimigo principal. Fora da forma é
   * no-op, então o caller não precisa saber se ela está ativa.
   */
  onMainBasicHit: () => void;
};
