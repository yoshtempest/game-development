import type { NatsukiSphere } from "@/utils/types/character/natsuki";

export type Api = {
  /** 1º aperto casta e entrega o controle, 2º para (parked), 3º dissipa. */
  press: () => void;
  usable: boolean;
  /** Tick das fases em campo (controle + atração/dano contínuo). */
  tick: (s: NatsukiSphere) => void;
  /** Drain de energia amaldiçoada enquanto a esfera está em campo. */
  drain: () => void;
  /** Chamado quando o Setup acaba: o joystick passa a mover a esfera. */
  enterControl: () => void;
};
