import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { applyTime, clearTime, freezeWorldSpec } from "@/gameRules/battle/time";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import { getAbilityDamageType } from "@/data/characters/abilities";
import {
  BLUE_SPHERE_DAMAGE_INTERVAL_MS,
  BLUE_SPHERE_DAMAGE_RATIO,
  BLUE_SPHERE_DRAIN_COST,
  BLUE_SPHERE_DRAIN_INTERVAL_MS,
  BLUE_SPHERE_PULL_PX,
  BLUE_SPHERE_RANGE,
  RED_SPHERE_FLY_MS,
  RED_SPHERE_HIT_RANGE,
  RED_SPHERE_MULTIPLIER,
  RED_SPHERE_PUSH,
  RED_SPHERE_RANGE,
  SPHERE_BLINK_MS,
  SPHERE_CAST_FREEZE_MS,
  SPHERE_CONTROL_PX,
  SPHERE_DISMISS_MS,
  SPHERE_MIN_COOLDOWN_MS,
  SPHERE_MOVE_MS,
  SPHERE_OFFSET_X,
  SPHERE_OFFSET_Y,
  SPHERE_SPAWN_MS,
  SPHERE_SPAWN_SCALE,
  SPHERE_TICK_MS,
} from "@/data/characters/riquelme/riquelme";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { CharactersProgress } from "@/data/characters/defaultProgress";
import type { TimeEffect } from "@/gameRules/battle/time";
import type { useBattleSystem } from "@/hooks/battle/main/useSystem";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import type { MarceloBattleForm } from "@/utils/paths/characters/marcelo/types";
import type {
  RiquelmeSphere,
  RiquelmeSphereFocus,
  RiquelmeSphereVariant,
} from "@/utils/types/character/riquelme";

/** Id do efeito de time do Setup (congela o mundo enquanto a esfera se forma). */
const SPHERE_TIME_ID = "riquelme:spheres";
const BLUE_DAMAGE_KIND = getAbilityDamageType("blueSphere");
const RED_DAMAGE_KIND = getAbilityDamageType("redSphere");

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  battle: ReturnType<typeof useBattleSystem>;
  npc: { x: number; y: number; updateNpc: (partial: { x: number }) => void };
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  playerClass: PlayerClass;
  progress: CharactersProgress;
  giveSummonRewards: (npcClass: NPCClass) => void;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  timeRef: RefObject<TimeEffect[]>;
  refs: ReturnType<typeof useBattleRefs>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarceloBattleForm,
  ) => boolean;
  /** +5 cargas da Expansão ao usar uma habilidade ativa. */
  onUsed?: () => void;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  /** Proporção especial/básico (ver `specialDamageRatio` no useBattleCombat). */
  specialDamageRatio: number;
};

/**
 * Esferas do riquelme (habilidades "blue"/"red").
 *
 * As duas compartilham a sequência de Setup (`habilities/Setup/`):
 * `one.svg` (cast) → `two.svg` (deslocamento) → `three.svg` (arremesso da red).
 * Durante o Setup o mundo congela (`freezeWorldSpec`) e o player fica travado;
 * a esfera surge na cabeça com blink e escala 0.1→1, desliza para a frente e
 * então entra em campo.
 *
 * A blue é persistente: o 1º aperto casta e entrega o controle (o joystick move
 * a esfera, o personagem fica parado); o 2º aperto para a esfera (segue atraindo
 * e o personagem volta a andar); o 3º dissipa (escala→0 + fade-out). Em campo
 * ela drena energia amaldiçoada, atrai os inimigos e causa dano mágico contínuo.
 * A red é um arremesso único: voa até o alvo e empurra quem acerta.
 */
export function useRiquelmeSpheres({
  player,
  setPlayer,
  battle,
  npc,
  summons,
  setSummons,
  playerClass,
  progress,
  giveSummonRewards,
  battleManaRef,
  freezeActionsUntilRef,
  timeRef,
  refs,
  playSound,
  startSpecialIntro,
  onUsed,
  isPausedRef,
  disabledRef,
  battleEndedRef,
  specialDamageRatio,
}: Props) {
  const { pushControls } = useGameControls();

  const [sphere, setSphere] = useState<RiquelmeSphere | null>(null);

  const activeRef = useRef(false);
  const sphereRef = useRef<RiquelmeSphere | null>(null);
  const phaseStartRef = useRef(0);
  const fromRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const layerControlsRef = useRef<(() => void) | null>(null);
  const leftRef = useRef(false);
  const rightRef = useRef(false);
  const upRef = useRef(false);
  const downRef = useRef(false);
  const lastDamageRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  const pushControlsRef = useLatestRef(pushControls);
  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const setSummonsRef = useLatestRef(setSummons);
  const setPlayerRef = useLatestRef(setPlayer);
  const playSoundRef = useLatestRef(playSound);
  const startIntroRef = useLatestRef(startSpecialIntro);
  const onUsedRef = useLatestRef(onUsed);
  const battleRef = useLatestRef(battle);
  const specialRatioRef = useLatestRef(specialDamageRatio);
  const playerClassRef = useLatestRef(playerClass);
  const progressRef = useLatestRef(progress);
  const giveSummonRewardsRef = useLatestRef(giveSummonRewards);

  // Recurso / pausa / lock só valem para INICIAR um cast; o ciclo park/dismiss
  // é decidido pelas fases (o player está idle e `canUse` é readquirido).
  const { usableRef: canUseRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "riquelme",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  // ── Helpers de estado/time ────────────────────────────────
  const applyWorldFreeze = useCallback(
    (ms: number) => {
      timeRef.current = applyTime(
        timeRef.current,
        freezeWorldSpec(SPHERE_TIME_ID, ms, []),
      );
    },
    [timeRef],
  );

  const releaseWorldFreeze = useCallback(() => {
    timeRef.current = clearTime(timeRef.current, SPHERE_TIME_ID);
  }, [timeRef]);

  const setPlayerState = useCallback((state: PlayerState) => {
    setPlayerRef.current((p) => (p.mode === "battle" ? { ...p, state } : p));
  }, [setPlayerRef]);

  /** Volta para `idle` só se o player ainda estiver num estado de esfera. */
  const resetPlayerIfSphere = useCallback(() => {
    setPlayerRef.current((p) =>
      p.mode === "battle" && ALL_PREDICATES.isSphere(p.state)
        ? { ...p, state: "idle" }
        : p,
    );
  }, [setPlayerRef]);

  const clearInputs = () => {
    leftRef.current = false;
    rightRef.current = false;
    upRef.current = false;
    downRef.current = false;
  };

  const releaseControl = () => {
    layerControlsRef.current?.();
    layerControlsRef.current = null;
    clearInputs();
  };

  const finish = useCallback(() => {
    activeRef.current = false;
    releaseControl();
    releaseWorldFreeze();
    freezeActionsUntilRef.current = Date.now();
    resetPlayerIfSphere();
    sphereRef.current = null;
    setSphere(null);
    cooldownUntilRef.current = Date.now() + SPHERE_MIN_COOLDOWN_MS;
  }, [freezeActionsUntilRef, releaseWorldFreeze, resetPlayerIfSphere, releaseControl]);

  /** Libera o controle/player já no início do fade da dissipação. */
  const startDismiss = useCallback(() => {
    const s = sphereRef.current;
    if (!s) return;
    releaseControl();
    releaseWorldFreeze();
    freezeActionsUntilRef.current = Date.now();
    resetPlayerIfSphere();
    const next: RiquelmeSphere = { ...s, phase: "dismissing" };
    sphereRef.current = next;
    setSphere(next);
    phaseStartRef.current = Date.now();
  }, [freezeActionsUntilRef, releaseWorldFreeze, resetPlayerIfSphere, releaseControl]);

  // ── Tick principal (fases, movimento, atração, dano) ───────
  const tick = () => {
    const s = sphereRef.current;
    if (!s) return;

    if (shouldCancelRef.current()) {
      finish();
      return;
    }

    const now = Date.now();
    const p = playerRef.current;

    if (s.phase === "spawning") {
      const elapsed = now - phaseStartRef.current;
      const t = Math.min(1, elapsed / SPHERE_SPAWN_MS);
      const scale = SPHERE_SPAWN_SCALE + (1 - SPHERE_SPAWN_SCALE) * t;
      const blink = Math.max(0, 1 - elapsed / SPHERE_BLINK_MS);
      const next: RiquelmeSphere = {
        ...s,
        x: p.x,
        y: p.y - SPHERE_OFFSET_Y,
        scale,
        blink,
      };
      sphereRef.current = next;
      setSphere(next);

      if (t >= 1) {
        const forward = s.direction === "right" ? 1 : -1;
        fromRef.current = { x: next.x, y: next.y };
        targetRef.current = {
          x: p.x + forward * SPHERE_OFFSET_X,
          y: p.y - SPHERE_OFFSET_Y,
        };
        phaseStartRef.current = now;
        const moving: RiquelmeSphere = { ...next, phase: "moving", blink: 0 };
        sphereRef.current = moving;
        setSphere(moving);
        setPlayerState("sphereMove");
      }
      return;
    }

    if (s.phase === "moving") {
      const t = Math.min(1, (now - phaseStartRef.current) / SPHERE_MOVE_MS);
      const ease = t * t * (3 - 2 * t);
      const x = fromRef.current.x + (targetRef.current.x - fromRef.current.x) * ease;
      const y = fromRef.current.y + (targetRef.current.y - fromRef.current.y) * ease;
      const next: RiquelmeSphere = { ...s, x, y };
      sphereRef.current = next;
      setSphere(next);

      if (t >= 1) {
        if (s.variant === "blue") enterControl();
        else enterFire();
      }
      return;
    }

    if (s.phase === "controlled" || s.phase === "parked") {
      if (s.phase === "controlled") moveControlled();
      pullAndDamage(now);
      return;
    }

    if (s.phase === "firing") {
      const t = Math.min(1, (now - phaseStartRef.current) / RED_SPHERE_FLY_MS);
      const ease = t * t * (3 - 2 * t);
      const x = fromRef.current.x + (targetRef.current.x - fromRef.current.x) * ease;
      const y = fromRef.current.y + (targetRef.current.y - fromRef.current.y) * ease;
      const next: RiquelmeSphere = { ...s, x, y };
      sphereRef.current = next;
      setSphere(next);

      if (t >= 1) {
        applyRedImpact(next);
        finish();
      }
      return;
    }

    if (s.phase === "dismissing") {
      const t = Math.min(1, (now - phaseStartRef.current) / SPHERE_DISMISS_MS);
      const next: RiquelmeSphere = {
        ...s,
        scale: Math.max(0, 1 - t),
        opacity: Math.max(0, 1 - t),
      };
      sphereRef.current = next;
      setSphere(next);
      if (t >= 1) finish();
    }
  };

  /** Blue: entra no controle (o joystick passa a mover a esfera). */
  const enterControl = () => {
    const s = sphereRef.current;
    if (!s) return;
    clearInputs();
    layerControlsRef.current = pushControlsRef.current({
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
    const next: RiquelmeSphere = { ...s, phase: "controlled" };
    sphereRef.current = next;
    setSphere(next);
    setPlayerState("blueSphereControl");
    playSoundRef.current("blink");
  };

  /** Red: prepara o voo até o alvo. */
  const enterFire = () => {
    const s = sphereRef.current;
    if (!s) return;
    const forward = s.direction === "right" ? 1 : -1;
    const mainNpc = npcRef.current;
    const ahead = (mainNpc.x - s.x) * forward > 0;
    fromRef.current = { x: s.x, y: s.y };
    targetRef.current = ahead
      ? { x: mainNpc.x, y: mainNpc.y - 40 }
      : { x: s.x + forward * RED_SPHERE_RANGE, y: s.y };
    phaseStartRef.current = Date.now();
    const next: RiquelmeSphere = { ...s, phase: "firing" };
    sphereRef.current = next;
    setSphere(next);
    setPlayerState("sphereFire");
    playSoundRef.current("explosion");
  };

  /** Blue controlada: move pelo joystick (sem gravidade, presa na arena). */
  const moveControlled = () => {
    const s = sphereRef.current;
    if (!s) return;
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
    const next: RiquelmeSphere = { ...s, x: nx, y: ny, direction };
    sphereRef.current = next;
    setSphere(next);
  };

  /** Blue: atrai NPC/summons e causa dano mágico contínuo. */
  const pullAndDamage = (now: number) => {
    const s = sphereRef.current;
    if (!s) return;
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
        spawnDamageRef: refs.spawnDamageRef,
        registerHitRef: refs.registerHitRef,
        setPlayerHP: b.setPlayerHP,
        deliciaSetter: b.setDelicia,
        hitsToSpecial: b.hitsToSpecial,
      });
    }
  };

  /** Red: dano + empurrão no ponto de chegada. */
  const applyRedImpact = (s: RiquelmeSphere) => {
    const b = battleRef.current;
    const ratio = specialRatioRef.current;
    const damageMult = RED_SPHERE_MULTIPLIER * ratio;
    const pushDir = s.x < npcRef.current.x ? -1 : 1;

    const mainNpc = npcRef.current;
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
        spawnDamageRef: refs.spawnDamageRef,
        registerHitRef: refs.registerHitRef,
        setPlayerHP: b.setPlayerHP,
        deliciaSetter: b.setDelicia,
        hitsToSpecial: b.hitsToSpecial,
      });
    }
    if (list.some((sum) => Math.abs(sum.x - s.x) <= RED_SPHERE_HIT_RANGE)) {
      const dir = pushDir;
      setSummonsRef.current((prev) =>
        prev.map((sum) =>
          Math.abs(sum.x - s.x) <= RED_SPHERE_HIT_RANGE
            ? { ...sum, x: sum.x + dir * RED_SPHERE_PUSH }
            : sum,
        ),
      );
    }
  };

  /** Drain de energia da blue em campo (1 a cada 10ms). */
  const drain = () => {
    if (!activeRef.current) return;
    const s = sphereRef.current;
    if (!s || s.variant !== "blue") return;
    if (s.phase !== "controlled" && s.phase !== "parked") return;
    const mana = battleManaRef.current;
    if (!mana || !mana.consumeMana(BLUE_SPHERE_DRAIN_COST)) {
      startDismiss();
    }
  };

  // ── Cast ──────────────────────────────────────────────────
  const startCast = (variant: RiquelmeSphereVariant) => {
    if (activeRef.current) return;
    if (Date.now() < cooldownUntilRef.current) return;
    if (!canUseRef.current) return;

    onUsedRef.current?.();
    activeRef.current = true;

    const run = () => {
      const p = playerRef.current;
      applyWorldFreeze(SPHERE_CAST_FREEZE_MS);
      freezeActionsUntilRef.current = Infinity;
      phaseStartRef.current = Date.now();
      lastDamageRef.current = Date.now();
      const s: RiquelmeSphere = {
        variant,
        phase: "spawning",
        x: p.x,
        y: p.y - SPHERE_OFFSET_Y,
        scale: SPHERE_SPAWN_SCALE,
        blink: 1,
        opacity: 1,
        direction: p.battleDirection,
      };
      sphereRef.current = s;
      setSphere(s);
      setPlayerState("sphereCast");
      playSoundRef.current("natsukiSpecial");
    };

    // O intro abre o background (blue|red) em slow-motion e chama `run` ao fim;
    // se já houver um intro em andamento ele não roda, e o cast precisa sair na
    // hora para a ativação (e o recurso) não sumirem.
    const started = startIntroRef.current("riquelme", run, variant);
    if (!started) run();
  };

  const bluePress = () => {
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
      const next: RiquelmeSphere = { ...s, phase: "parked" };
      sphereRef.current = next;
      setSphere(next);
      playSoundRef.current("blink");
      return;
    }
    if (s.phase === "parked") {
      // 3º aperto: dissipa (escala→0 + fade-out).
      startDismiss();
    }
  };

  const redPress = () => {
    if (sphereRef.current) return;
    startCast("red");
  };

  // ── Efeitos ───────────────────────────────────────────────
  const tickRef = useLatestRef(tick);
  const drainRef = useLatestRef(drain);

  useEffect(() => {
    const id = setInterval(() => tickRef.current(), SPHERE_TICK_MS);
    return () => clearInterval(id);
  }, [tickRef]);

  useEffect(() => {
    const id = setInterval(
      () => drainRef.current(),
      BLUE_SPHERE_DRAIN_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [drainRef]);

  // Cleanup no unmount: solta o layer de controle e o freeze do mundo.
  useEffect(() => {
    return () => {
      layerControlsRef.current?.();
      layerControlsRef.current = null;
      timeRef.current = clearTime(timeRef.current, SPHERE_TIME_ID);
    };
  }, [timeRef]);

  const sphereFocus: RiquelmeSphereFocus =
    sphere?.phase === "controlled" ? { x: sphere.x, y: sphere.y } : null;
  const castActive =
    sphere?.phase === "spawning" || sphere?.phase === "moving";

  const blueInField =
    sphere != null && sphere.variant === "blue" && sphere.phase !== "dismissing";
  const blueUsable = blueInField || (sphere == null && canUseRef.current);
  const redUsable = sphere == null && canUseRef.current;

  return {
    sphere,
    sphereFocus,
    castActive,
    bluePress,
    blueUsable,
    redPress,
    redUsable,
  };
}
