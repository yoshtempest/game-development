import { combatService } from "@/services/combat";
import { computeHitDamage } from "./computeHitDamage";
import type { DamageCalcParams } from "./types";

export function calculateSpecialHitDamage(
  params: Omit<DamageCalcParams, "titleDamageBonus"> & { stacks: number },
): { damage: number; isCrit: boolean; type: DamageType } {
  let rawDmg: number;
  if (params.player.character === "laricell") {
    rawDmg = params.stacks * 5;
  } else {
    const baseSpecial = combatService.calculateSpecialDamage(
      // Especial mágico lê Espírito; todo o resto lê Técnica. Derivar do
      // `damageKind` que já vem nos params (e que decide a coluna de armadura
      // furada) garante que as duas decisões não possam divergir: não existe
      // caminho que fure a armadura mágica com um dano escalado por Técnica.
      params.damageKind === "magical"
        ? params.char.stats.spirit
        : params.char.stats.technique,
      params.playerClass,
    );
    rawDmg =
      params.player.character === "natsuki" ? baseSpecial * 2 : baseSpecial;
  }

  return computeHitDamage({ ...params, rawDmg });
}
