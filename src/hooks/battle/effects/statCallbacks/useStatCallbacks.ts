import type { Props } from "./types";
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
