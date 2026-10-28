import { useLatestRef } from "@/hooks/useLatestRef";
import {
  incrementBlockCount,
  incrementAttacksUsedStats,
  incrementDamageDealtStats,
  incrementDamageTakenStats,
  incrementHitsUsedStats,
  incrementMissesStats,
} from "@/utils/rewards";

import type { BabidiShieldSide } from "@/utils/types/character/babidi";

type Props = {
  playerCharacter: CharacterId;
  incrementBlockCounter: () => void;
  incrementDamageTaken: (amount: number) => void;
  incrementDodgeCounter: () => void;
  incrementDamageDealt: (amount: number) => void;
  /** Lado do shield de bloqueio do babidi (repasse do golpe bloqueado). */
  onBlockSide?: (side?: BabidiShieldSide) => void;
};

export function useStatCallbacks({
  playerCharacter,
  incrementBlockCounter,
  incrementDamageTaken,
  incrementDodgeCounter,
  incrementDamageDealt,
  onBlockSide,
}: Props) {
  const onBlockRef = useLatestRef((side?: BabidiShieldSide) => {
    incrementBlockCount(playerCharacter);
    incrementBlockCounter();
    onBlockSide?.(side);
  });

  const onDamageTakenRef = useLatestRef((amount: number) => {
    incrementDamageTaken(amount);
    incrementDamageTakenStats(playerCharacter, amount);
  });

  const onDodgeRef = useLatestRef(() => {
    incrementDodgeCounter();
    incrementMissesStats(playerCharacter);
  });

  const onDamageDealtRef = useLatestRef((amount: number) => {
    incrementDamageDealt(amount);
    incrementDamageDealtStats(playerCharacter, amount);
  });

  const onAttackRef = useLatestRef(() => {
    incrementAttacksUsedStats(playerCharacter);
    incrementHitsUsedStats(playerCharacter);
  });

  const onSpecialRef = useLatestRef(() => {
    incrementHitsUsedStats(playerCharacter);
  });

  return {
    onBlockRef,
    onDamageTakenRef,
    onDodgeRef,
    onDamageDealtRef,
    onAttackRef,
    onSpecialRef,
  };
}
