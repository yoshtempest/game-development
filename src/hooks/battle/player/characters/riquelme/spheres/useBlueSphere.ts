import { useCallback, useEffect, useRef } from "react";

import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import { getAbilityDamageType } from "@/data/characters/abilities";
import {
  BLUE_SPHERE_DAMAGE_INTERVAL_MS,
  BLUE_SPHERE_DAMAGE_RATIO,
  BLUE_SPHERE_DRAIN_COST,
  BLUE_SPHERE_PULL_PX,
  BLUE_SPHERE_RANGE,
  SPHERE_CONTROL_PX,
} from "@/data/characters/riquelme/riquelme";

import type { RefObject } from "react";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { RiquelmeSphere } from "@/utils/types/character/riquelme";
import type { SphereBattle, SphereCore } from "./types";

const BLUE_DAMAGE_KIND = getAbilityDamageType("blueSphere");

type Props = {
  core: SphereCore;
  battle: SphereBattle;
  battleManaRef: RefObject<BattleManaApi | null>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};

type Api = {
  /** 1º aperto casta e entrega o controle, 2º para (parked), 3º dissipa. */
  press: () => void;
  usable: boolean;
  /** Tick das fases em campo (controle + atração/dano contínuo). */
  tick: (s: RiquelmeSphere) => void;
  /** Drain de energia amaldiçoada enquanto a esfera está em campo. */
  drain: () => void;
  /** Chamado quando o Setup acaba: o joystick passa a mover a esfera. */
  enterControl: () => void;
};

/**
 * Blue do riquelme: a esfera persistente.
 *
 * O 1º aperto casta e ENTREGA o controle (o joystick move a esfera e o
 * personagem fica parado); o 2º aperto para a esfera no lugar (ela segue
 * atraindo e o personagem volta a andar); o 3º dissipa (escala→0). Em campo ela
 * drena energia amaldiçoada, puxa NPC/summons para perto e causa dano mágico
 * contínuo — com passo limitado, para não impedir a fuga dos inimigos.
 */
export function useBlueSphere({
  core,
  battle,
  battleManaRef,
  playSound,
}: Props): Api {
  const {
    sphere,
    sphereRef,
    publish,
    setPlayerState,
    resetPlayerIfSphere,
    releaseWorldFreeze,
    startDismiss,
    startCast,
    activeRef,
    canUseRef,
    freezeActionsUntilRef,
  } = core;
  const { pushControls } = useGameControls();
  const playSoundRef = useLatestRef(playSound);

  const layerControlsRef = useRef<(() => void) | null>(null);
  const leftRef = useRef(false);
  const rightRef = useRef(false);
  const upRef = useRef(false);
  const downRef = useRef(false);
  /**
   * Último tick que feriu: a blue fere por intervalo, não a cada frame. Começa
   * em 0 (cast antigo), então a esfera fere no primeiro tick depois de entrar em
   * campo, como no cast original.
   */
  const lastDamageRef = useRef(0);

  const npcRef = useLatestRef(battle.npc);
  const summonsRef = useLatestRef(battle.summons);
  const setSummonsRef = useLatestRef(battle.setSummons);
  const playerRef = useLatestRef(battle.player);
  const playerClassRef = useLatestRef(battle.playerClass);
  const progressRef = useLatestRef(battle.progress);
  const giveSummonRewardsRef = useLatestRef(battle.giveSummonRewards);
  const battleRef = useLatestRef(battle.battle);
  const specialRatioRef = useLatestRef(battle.specialDamageRatio);

  const clearInputs = useCallback(() => {
    leftRef.current = false;
    rightRef.current = false;
    upRef.current = false;
    downRef.current = false;
  }, []);

  /** Devolve o joystick para o player (fim do controle, park, dissipação). */
  const releaseControl = useCallback(() => {
    layerControlsRef.current?.();
    layerControlsRef.current = null;
    clearInputs();
  }, [clearInputs]);

  // O layer de controle não pode ficar pendurado quando o ciclo da esfera
  // acaba (dissipou, foi cancelado ou a batalha terminou).
  useEffect(() => {
    if (sphere) return;
    releaseControl();
  }, [sphere, releaseControl]);

  // Cleanup no unmount: solta o layer de controle.
  useEffect(() => {
    return () => releaseControl();
  }, [releaseControl]);

  /** Blue: entra no controle (o joystick passa a mover a esfera). */
  function enterControl() {
    const s = sphereRef.current;
    if (!s) return;
    clearInputs();
    layerControlsRef.current = pushControls({
      onConfirm: () => true,
      onCancel: () => true,
      onOpen: () => true,
      onUp: () => {
        upRef.current = true;
        return true;
      },
      onDown: () => {
        downRef.current = true;
        return true;
      },
      onLeft: () => {
        leftRef.current = true;
        return true;
      },
      onRight: () => {
        rightRef.current = true;
        return true;
      },
      onUpRelease: () => {
        upRef.current = false;
      },
      onDownRelease: () => {
        downRef.current = false;
      },
      onLeftRelease: () => {
        leftRef.current = false;
      },
      onRightRelease: () => {
        rightRef.current = false;
      },
      onConfirmRelease: () => {},
      onCancelRelease: () => {},
    });
    publish({ ...s, phase: "controlled" });
    setPlayerState("blueSphereControl");
    playSoundRef.current("blink");
  }

  /** Blue controlada: move pelo joystick (sem gravidade, presa na arena). */
  function moveControlled(s: RiquelmeSphere) {
    let dx = 0;
    let dy = 0;
    if (leftRef.current) dx -= 1;
    if (rightRef.current) dx += 1;
    if (upRef.current) dy -= 1;
    if (downRef.current) dy += 1;
    if (dx === 0 && dy === 0) return;

    const len = Math.hypot(dx, dy);
    const p = playerRef.current;
    const nx = Math.max(
      BATTLE_LIMITS.minX,
      Math.min(BATTLE_LIMITS.maxX, s.x + (dx / len) * SPHERE_CONTROL_PX),
    );
    const ny = Math.max(
      0,
      Math.min(p.groundY, s.y + (dy / len) * SPHERE_CONTROL_PX),
    );
    const direction: Direction =
      dx !== 0 ? (dx > 0 ? "right" : "left") : s.direction;
    publish({ ...s, x: nx, y: ny, direction });
  }

  /** Blue: atrai NPC/summons e causa dano mágico contínuo. */
  function pullAndDamage(s: RiquelmeSphere, now: number) {
    const ratio = specialRatioRef.current;
    const mainNpc = npcRef.current;

    // Atração: passo limitado, para não impedir a fuga (buraco negro suave).
    if (Math.abs(mainNpc.x - s.x) <= BLUE_SPHERE_RANGE) {
      const dx = s.x - mainNpc.x;
      const step = Math.sign(dx) * Math.min(Math.abs(dx), BLUE_SPHERE_PULL_PX);
      mainNpc.updateNpc({ x: mainNpc.x + step });
    }
    const list = summonsRef.current;
    if (list.some((sum) => Math.abs(sum.x - s.x) <= BLUE_SPHERE_RANGE)) {
      setSummonsRef.current((prev) =>
        prev.map((sum) => {
          const dx = s.x - sum.x;
          if (Math.abs(dx) > BLUE_SPHERE_RANGE) return sum;
          const step =
            Math.sign(dx) * Math.min(Math.abs(dx), BLUE_SPHERE_PULL_PX);
          return { ...sum, x: sum.x + step };
        }),
      );
    }

    if (now - lastDamageRef.current < BLUE_SPHERE_DAMAGE_INTERVAL_MS) return;
    lastDamageRef.current = now;

    const b = battleRef.current;
    const damageMult = ratio * BLUE_SPHERE_DAMAGE_RATIO;
    if (Math.abs(mainNpc.x - s.x) <= BLUE_SPHERE_RANGE) {
      b.playerHit(damageMult, true, true, BLUE_DAMAGE_KIND);
    }
    for (const sum of list) {
      if (Math.abs(sum.x - s.x) > BLUE_SPHERE_RANGE) continue;
      damageSummon({
        target: { id: sum.id, x: sum.x, y: sum.y },
        multiplier: damageMult,
        source: "other",
        damageKind: BLUE_DAMAGE_KIND,
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

  function tick(s: RiquelmeSphere) {
    if (s.phase === "controlled") moveControlled(s);
    pullAndDamage(s, Date.now());
  }

  /** Fim da blue: devolve o joystick e entra no fade da dissipação. */
  function dismiss() {
    releaseControl();
    startDismiss();
  }

  /** Drain de energia da blue em campo (1 a cada 10ms). */
  function drain() {
    if (!activeRef.current) return;
    const s = sphereRef.current;
    if (!s || s.variant !== "blue") return;
    if (s.phase !== "controlled" && s.phase !== "parked") return;
    const mana = battleManaRef.current;
    if (!mana || !mana.consumeMana(BLUE_SPHERE_DRAIN_COST)) {
      dismiss();
    }
  }

  function press() {
    const s = sphereRef.current;
    if (!s) {
      startCast("blue");
      return;
    }
    if (s.variant !== "blue") return;
    if (s.phase === "controlled") {
      // 2º aperto: para a esfera (segue atraindo) e devolve o movimento.
      releaseControl();
      releaseWorldFreeze();
      freezeActionsUntilRef.current = Date.now();
      resetPlayerIfSphere();
      publish({ ...s, phase: "parked" });
      playSoundRef.current("blink");
      return;
    }
    if (s.phase === "parked") {
      // 3º aperto: dissipa (escala→0 + fade-out).
      dismiss();
    }
  }

  const blueInField =
    sphere != null &&
    sphere.variant === "blue" &&
    sphere.phase !== "dismissing";
  const usable = blueInField || (sphere == null && canUseRef.current);

  return { press, usable, tick, drain, enterControl };
}
