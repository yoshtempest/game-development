import { useLatestRef } from "@/hooks/useLatestRef";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import { getAbilityDamageType } from "@/data/characters/abilities";
import {
  RED_SPHERE_FLY_MS,
  RED_SPHERE_HIT_RANGE,
  RED_SPHERE_MULTIPLIER,
  RED_SPHERE_PUSH,
  RED_SPHERE_RANGE,
} from "@/data/characters/riquelme/riquelme";

import type { RiquelmeSphere } from "@/utils/types/character/riquelme";
import type { SphereBattle, SphereCore } from "./types";

const RED_DAMAGE_KIND = getAbilityDamageType("redSphere");
/** Altura do ponto de mira: acima dos pés do NPC (na altura do corpo). */
const RED_TARGET_Y_OFFSET = 40;

type Props = {
  core: SphereCore;
  battle: SphereBattle;
};

type Api = {
  /** Aperto com a esfera fora de campo: casta a red. */
  press: () => void;
  usable: boolean;
  /** Chamado quando o Setup acaba: prepara o voo até o alvo. */
  enterFire: () => void;
  /** Tick do voo: move até o alvo e resolve o impacto no fim. */
  tickFire: (s: RiquelmeSphere, now: number) => void;
};

/**
 * Red do riquelme: a esfera de arremesso.
 *
 * Depois do Setup ela voa em linha reta até o NPC principal — se ele estiver à
 * frente na direção da esfera, mira nele; senão voa `RED_SPHERE_RANGE` e para.
 * No ponto de chegada causa dano mágico e empurra quem está no raio de impacto
 * (NPC e summons, cada um uma vez).
 */
export function useRedSphere({ core, battle }: Props): Api {
  const {
    sphere,
    sphereRef,
    publish,
    phaseStartRef,
    fromRef,
    targetRef,
    setPlayerState,
    finish,
    startCast,
    canUseRef,
  } = core;

  const npcRef = useLatestRef(battle.npc);
  const summonsRef = useLatestRef(battle.summons);
  const setSummonsRef = useLatestRef(battle.setSummons);
  const playerRef = useLatestRef(battle.player);
  const playerClassRef = useLatestRef(battle.playerClass);
  const progressRef = useLatestRef(battle.progress);
  const giveSummonRewardsRef = useLatestRef(battle.giveSummonRewards);
  const battleRef = useLatestRef(battle.battle);
  const specialRatioRef = useLatestRef(battle.specialDamageRatio);

  /** Red: prepara o voo até o alvo. */
  function enterFire() {
    const s = sphereRef.current;
    if (!s) return;
    const forward = s.direction === "right" ? 1 : -1;
    const mainNpc = npcRef.current;
    const ahead = (mainNpc.x - s.x) * forward > 0;
    fromRef.current = { x: s.x, y: s.y };
    targetRef.current = ahead
      ? { x: mainNpc.x, y: mainNpc.y - RED_TARGET_Y_OFFSET }
      : { x: s.x + forward * RED_SPHERE_RANGE, y: s.y };
    phaseStartRef.current = Date.now();
    publish({ ...s, phase: "firing" });
    setPlayerState("sphereFire");
  }

  /** Red: dano + empurrão no ponto de chegada. */
  function applyRedImpact(s: RiquelmeSphere) {
    const b = battleRef.current;
    const ratio = specialRatioRef.current;
    const damageMult = RED_SPHERE_MULTIPLIER * ratio;
    const mainNpc = npcRef.current;
    const pushDir = s.x < mainNpc.x ? -1 : 1;

    if (Math.abs(mainNpc.x - s.x) <= RED_SPHERE_HIT_RANGE) {
      b.playerHit(damageMult, true, true, RED_DAMAGE_KIND);
      mainNpc.updateNpc({ x: mainNpc.x + pushDir * RED_SPHERE_PUSH });
    }

    const list = summonsRef.current;
    for (const sum of list) {
      if (Math.abs(sum.x - s.x) > RED_SPHERE_HIT_RANGE) continue;
      damageSummon({
        target: { id: sum.id, x: sum.x, y: sum.y },
        multiplier: damageMult,
        source: "other",
        damageKind: RED_DAMAGE_KIND,
        player: playerRef.current,
        playerClass: playerClassRef.current,
        progress: progressRef.current,
        playerHP: b.playerHP,
        playerMaxHp: b.playerMaxHp,
        vampirism: b.vampirism,
        summons: list,
        setSummons: setSummonsRef.current,
        giveSummonRewards: giveSummonRewardsRef.current,
        spawnDamageRef: battle.refs.spawnDamageRef,
        registerHitRef: battle.refs.registerHitRef,
        setPlayerHP: b.setPlayerHP,
        deliciaSetter: b.setDelicia,
        hitsToSpecial: b.hitsToSpecial,
      });
    }
    if (list.some((sum) => Math.abs(sum.x - s.x) <= RED_SPHERE_HIT_RANGE)) {
      setSummonsRef.current((prev) =>
        prev.map((sum) =>
          Math.abs(sum.x - s.x) <= RED_SPHERE_HIT_RANGE
            ? { ...sum, x: sum.x + pushDir * RED_SPHERE_PUSH }
            : sum,
        ),
      );
    }
  }

  function tickFire(s: RiquelmeSphere, now: number) {
    const t = Math.min(1, (now - phaseStartRef.current) / RED_SPHERE_FLY_MS);
    const ease = t * t * (3 - 2 * t);
    const x =
      fromRef.current.x + (targetRef.current.x - fromRef.current.x) * ease;
    const y =
      fromRef.current.y + (targetRef.current.y - fromRef.current.y) * ease;
    const next: RiquelmeSphere = { ...s, x, y };
    publish(next);

    if (t >= 1) {
      applyRedImpact(next);
      finish();
    }
  }

  function press() {
    if (sphereRef.current) return;
    startCast("red");
  }

  return {
    press,
    usable: sphere == null && canUseRef.current,
    enterFire,
    tickFire,
  };
}
