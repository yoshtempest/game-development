import type { BabidiShieldSide } from "@/utils/types/character/babidi";

export type Props = {
  playerCharacter: CharacterId;
  incrementBlockCounter: () => void;
  incrementDamageTaken: (amount: number) => void;
  incrementDodgeCounter: () => void;
  incrementDamageDealt: (amount: number) => void;
  /** Lado do shield de bloqueio do babidi (repasse do golpe bloqueado). */
  onBlockSide?: (side?: BabidiShieldSide) => void;
};
