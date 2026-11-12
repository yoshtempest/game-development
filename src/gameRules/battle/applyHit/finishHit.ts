import { applyHitstop } from "@/gameRules/battle/time";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismSource } from "@/gameRules/battle/vampirism/applyVampirism";
import type { BaseHitParams } from "./types";
import type { DamageKind } from "@/utils/types/battle/damageKind";

export function finishHit(
  params: BaseHitParams & {
    npcX: number;
    npcY: number;
    damageKind: DamageKind;
  },
  damage: number,
  dmgType: DamageType,
  hitstop: number,
  /** `basic` só entra no vampirismo normal; `other` paga só pelo universal. */
  source: VampirismSource,
  onActionRef?: React.RefObject<() => void>,
) {
  params.spawnDamageRef.current?.(damage, params.npcX, params.npcY, dmgType);
  params.registerHitRef.current?.(damage);
  params.onDamageDealtRef?.current?.(damage, params.damageKind);
  onActionRef?.current?.();
  params.timeRef.current = applyHitstop(params.timeRef.current, hitstop);

  applyVampirism({
    damage,
    source,
    vampirism: params.vampirism,
    playerMaxHp: params.playerMaxHp,
    setPlayerHP: params.setPlayerHP,
  });
}
