import { useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import { getAbilityDamageType } from "@/data/characters/abilities";
import {
  PURPLE_FLY_MS,
  PURPLE_JUNCTION_MS,
  PURPLE_SPHERE_MULTIPLIER,
  PURPLE_SPHERE_RANGE,
} from "@/data/characters/riquelme/riquelme";

import type { RefObject } from "react";
import type { RiquelmeSphere } from "@/utils/types/character/riquelme";
import type { SphereBattle, SphereCore } from "./types";

/** Id estável do projétil da purple (colisão com projéteis inimigos). */
const PURPLE_PROJECTILE_ID = "riquelme:purpleSphere";
const PURPLE_DAMAGE_KIND = getAbilityDamageType("purpleSphere");

type Props = {
  core: SphereCore;
  battle: SphereBattle;
  /**
   * Esfera em voo consumida pelo `useProjectile` (destrói projéteis inimigos).
   * A purple escreve aqui durante a fase `firing` — é o mesmo contrato do
   * projétil especial, só que conduzido por este hook.
   */
  playerProjectileRef: RefObject<PlayerSpecialProjectile | null>;
};

type Api = {
  /** Aperto com as esferas fora de campo: casta a fusão (blue + red). */
  press: () => void;
  usable: boolean;
  /** `junction`: a blue e a red convergem até a cabeça e se fundem. */
  tickJunction: (s: RiquelmeSphere) => void;
  /** Chamado quando o Setup acaba: arremessa a esfera fundida. */
  enterFire: () => void;
  /** Tick do voo: move, publica o projétil e resolve o dano em linha. */
  tickFire: (s: RiquelmeSphere, now: number) => void;
  /** Furo no sprite (só é desenhado se o NPC morrer — ver `isNpcDying`). */
  hole: boolean;
};

/**
 * Purple do riquelme: a fusão da blue com a red.
 *
 * O cast começa pela `junction` (as duas esferas convergem até a cabeça e se
 * fundem, `purpleJunction`) e segue o Setup compartilhado; em campo ela
 * atravessa a arena em linha reta. O dano é perfurante: acerta todos os alvos à
 * frente do ponto de disparo, cada um uma única vez, com 2x o dano da red.
 */
export function usePurpleSphere({
  core,
  battle,
  playerProjectileRef,
}: Props): Api {
  const {
    sphere,
    sphereRef,
    publish,
    phaseStartRef,
    fromRef,
    targetRef,
    setPlayerState,
    releaseWorldFreeze,
    finish,
    startCast,
    canUseRef,
  } = core;

  const [hole, setHole] = useState(false);

  /** Alvos já atingidos em voo (a esfera não é parada pelo primeiro). */
  const hitIdsRef = useRef<Set<string>>(new Set());
  /** x do player no disparo: só quem está à frente entra na linha da purple. */
  const originXRef = useRef(0);

  const npcRef = useLatestRef(battle.npc);
  const summonsRef = useLatestRef(battle.summons);
  const setSummonsRef = useLatestRef(battle.setSummons);
  const playerRef = useLatestRef(battle.player);
  const playerClassRef = useLatestRef(battle.playerClass);
  const progressRef = useLatestRef(battle.progress);
  const giveSummonRewardsRef = useLatestRef(battle.giveSummonRewards);
  const battleRef = useLatestRef(battle.battle);
  const specialRatioRef = useLatestRef(battle.specialDamageRatio);

  // O slot do projétil não pode ficar pendurado quando o ciclo acaba (dissipou,
  // foi cancelado ou a batalha terminou no meio do voo).
  useEffect(() => {
    if (sphere) return;
    playerProjectileRef.current = null;
  }, [sphere, playerProjectileRef]);

  /** Junção: a blue e a red convergem dos lados da cabeça até o centro. */
  function tickJunction(s: RiquelmeSphere) {
    const now = Date.now();
    const t = Math.min(1, (now - phaseStartRef.current) / PURPLE_JUNCTION_MS);
    const ease = t * t * (3 - 2 * t);
    const blueFromX = s.blueX ?? s.x;
    const blueFromY = s.blueY ?? s.y;
    const redFromX = s.redX ?? s.x;
    const redFromY = s.redY ?? s.y;
    const next: RiquelmeSphere = {
      ...s,
      blueX: blueFromX + (s.x - blueFromX) * ease,
      blueY: blueFromY + (s.y - blueFromY) * ease,
      redX: redFromX + (s.x - redFromX) * ease,
      redY: redFromY + (s.y - redFromY) * ease,
    };
    publish(next);

    if (t >= 1) {
      // Fusão consumada: a esfera purple já está formada na cabeça.
      phaseStartRef.current = now;
      publish({ ...next, phase: "spawning", scale: 1, blink: 0 });
      setPlayerState("sphereCast");
    }
  }

  /** Purple: dispara a esfera fundida atravessando a arena. */
  function enterFire() {
    const s = sphereRef.current;
    if (!s) return;
    const forward = s.direction === "right" ? 1 : -1;
    // O voo é em tempo real: solta o congelamento do Setup antes de arremessar.
    releaseWorldFreeze();
    hitIdsRef.current.clear();
    originXRef.current = playerRef.current.x;
    fromRef.current = { x: s.x, y: s.y };
    targetRef.current = { x: s.x + forward * PURPLE_SPHERE_RANGE, y: s.y };
    phaseStartRef.current = Date.now();
    publish({ ...s, phase: "firing" });
    setPlayerState("sphereFire");
  }

  /** Publica a esfera em voo para o `useProjectile` destruir projéteis. */
  function syncProjectile(s: RiquelmeSphere) {
    playerProjectileRef.current = {
      id: PURPLE_PROJECTILE_ID,
      phase: "fire",
      x: s.x,
      y: s.y,
      startX: fromRef.current.x,
      startY: fromRef.current.y,
      targetX: targetRef.current.x,
      targetY: targetRef.current.y,
      blueX: s.x,
      blueY: s.y,
      redX: s.x,
      redY: s.y,
      direction: s.direction,
      indestructible: true,
    };
  }

  /**
   * Purple: dano perfurante. Atravessa todos os alvos à frente e acerta cada um
   * uma única vez (não é parada pelo primeiro). Dano mágico de 2x a redSphere.
   */
  function applyLine(s: RiquelmeSphere) {
    const b = battleRef.current;
    const ratio = specialRatioRef.current;
    const damageMult = PURPLE_SPHERE_MULTIPLIER * ratio;
    const dir = s.direction === "right" ? 1 : -1;
    const originX = originXRef.current;

    const mainNpc = npcRef.current;
    const mainAhead = dir * (mainNpc.x - originX) >= 0;
    if (
      mainAhead &&
      !hitIdsRef.current.has("main") &&
      dir * (s.x - mainNpc.x) >= 0
    ) {
      hitIdsRef.current.add("main");
      b.playerHit(damageMult, true, true, PURPLE_DAMAGE_KIND);
      // O furo no sprite só aparece se o NPC morrer (a cena condiciona a isNpcDying).
      setHole(true);
    }

    const list = summonsRef.current;
    for (const sum of list) {
      if (hitIdsRef.current.has(sum.id)) continue;
      if (dir * (sum.x - originX) < 0) continue;
      if (dir * (s.x - sum.x) < 0) continue;
      hitIdsRef.current.add(sum.id);
      damageSummon({
        target: { id: sum.id, x: sum.x, y: sum.y },
        multiplier: damageMult,
        source: "other",
        damageKind: PURPLE_DAMAGE_KIND,
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
  }

  function tickFire(s: RiquelmeSphere, now: number) {
    const t = Math.min(1, (now - phaseStartRef.current) / PURPLE_FLY_MS);
    const ease = t * t * (3 - 2 * t);
    const x =
      fromRef.current.x + (targetRef.current.x - fromRef.current.x) * ease;
    const next: RiquelmeSphere = { ...s, x };
    publish(next);
    syncProjectile(next);
    applyLine(next);

    if (t >= 1) {
      playerProjectileRef.current = null;
      // Se o NPC sobreviveu à esfera, o furo não deve aparecer numa morte
      // futura (o furo é exclusivo de morte por purple).
      if (battleRef.current.npcHP > 0) setHole(false);
      finish();
    }
  }

  function press() {
    if (sphereRef.current) return;
    startCast("purple");
  }

  return {
    press,
    usable: sphere == null && canUseRef.current,
    tickJunction,
    enterFire,
    tickFire,
    hole,
  };
}
