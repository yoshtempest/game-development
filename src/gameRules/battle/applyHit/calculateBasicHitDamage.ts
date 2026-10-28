import { combatService } from "@/services/combat";
import { computeHitDamage } from "./computeHitDamage";
import type { DamageCalcParams } from "./types";

export function calculateBasicHitDamage(params: DamageCalcParams): {
  damage: number;
  isCrit: boolean;
  type: DamageType;
} {
  const rawDmg =
    params.player.character === "laricell"
      ? 2
      : combatService.calculatePlayerDamage(
          params.char.stats.strength,
          params.playerClass,
          params.titleDamageBonus,
        );

  return computeHitDamage({ ...params, rawDmg });
}
