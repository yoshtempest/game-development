import type { NatsukiSphere } from "@/utils/types/character/natsuki";

export type Api = {
  /** Aperto com a esfera fora de campo: casta a red. */
  press: () => void;
  usable: boolean;
  /** Chamado quando o Setup acaba: prepara o voo até o alvo. */
  enterFire: () => void;
  /** Tick do voo: move até o alvo e resolve o impacto no fim. */
  tickFire: (s: NatsukiSphere, now: number) => void;
};
