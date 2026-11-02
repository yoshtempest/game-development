import type { SphereBattle, SphereCore } from "../types";
import type { RefObject } from "react";
import type { NatsukiSphere } from "@/utils/types/character/natsuki";

export type Props = {
  core: SphereCore;
  battle: SphereBattle;
  /**
   * Esfera em voo consumida pelo `useProjectile` (destrói projéteis inimigos).
   * A purple escreve aqui durante a fase `firing` — é o mesmo contrato do
   * projétil especial, só que conduzido por este hook.
   */
  playerProjectileRef: RefObject<PlayerSpecialProjectile | null>;
};

export type Api = {
  /** Aperto com as esferas fora de campo: casta a fusão (blue + red). */
  press: () => void;
  usable: boolean;
  /** `junction`: a blue e a red convergem até a cabeça e se fundem. */
  tickJunction: (s: NatsukiSphere) => void;
  /** Chamado quando o Setup acaba: arremessa a esfera fundida. */
  enterFire: () => void;
  /** Tick do voo: move, publica o projétil e resolve o dano em linha. */
  tickFire: (s: NatsukiSphere, now: number) => void;
  /** Furo no sprite (só é desenhado se o NPC morrer — ver `isNpcDying`). */
  hole: boolean;
};
