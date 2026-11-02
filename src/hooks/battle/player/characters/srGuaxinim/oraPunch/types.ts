import type { PunchHitResult } from "@/utils/types/character/srGuaxinim";

export type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** Dispara a instância de attack do punch (dano) e devolve o alvo atingido. */
  onPunchHit: (multiplier: number) => PunchHitResult;
  /** Ref preenchido com o multiplicador atual do ataque básico do srGuaxinim. */
  multiplierRef: React.RefObject<() => number>;
};
