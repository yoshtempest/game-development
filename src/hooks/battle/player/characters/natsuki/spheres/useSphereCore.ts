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
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { sphereEnergyCost } from "@/gameRules/battle/cursedEnergy";
import { applyTime, clearTime, freezeWorldSpec } from "@/gameRules/battle/time";
import {
  PURPLE_FORM_MS,
  PURPLE_JUNCTION_MS,
  SPHERE_BLINK_MS,
  SPHERE_CAST_FREEZE_MS,
  SPHERE_DISMISS_MS,
  SPHERE_MIN_COOLDOWN_MS,
  SPHERE_MOVE_MS,
  SPHERE_OFFSET_X,
  SPHERE_OFFSET_Y,
  SPHERE_SPAWN_MS,
  SPHERE_SPAWN_SCALE,
} from "@/data/characters/riquelme/riquelme";

import type { TimeEffect } from "@/gameRules/battle/time";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { MarceloBattleForm } from "@/utils/paths/characters/marcelo/types";
import type {
  RiquelmeSphere,
  RiquelmeSphereVariant,
} from "@/utils/types/character/riquelme";
import { createSphereFrame } from "./createSphereFrame";
import type { SphereCore } from "./types";

/** Id do efeito de time do Setup (congela o mundo enquanto a esfera se forma). */
const SPHERE_TIME_ID = "riquelme:spheres";
/** Congelamento do mundo durante o Setup da purple (junction + one + two). */
const PURPLE_CAST_FREEZE_MS =
  PURPLE_JUNCTION_MS + PURPLE_FORM_MS + SPHERE_MOVE_MS;

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  freezeActionsUntilRef: RefObject<number>;
  timeRef: RefObject<TimeEffect[]>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarceloBattleForm,
  ) => boolean;
  /** +5 cargas da Expansão por uso (a purple conta como dois: 2×). */
  onUsed?: (times?: number) => void;
  /**
   * Energia amaldiçoada: red e purple cobram uma fração da MÁXIMA no cast
   * (`sphereEnergyCost`). A blue não passa por aqui — o custo dela é o dreno
   * contínuo em campo.
   */
  battleManaRef: RefObject<BattleManaApi | null>;
  isPausedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};

/**
 * Núcleo das esferas do riquelme: o estado da esfera em campo, as fases que as
 * três variantes compartilham (Setup `spawning` → `moving` e a dissipação) e o
 * congelamento do mundo.
 *
 * O que é de uma esfera só — controle da blue, voo da red e fusão/perfuração da
 * purple — mora nos hooks dela (`useBlueSphere`, `useRedSphere`,
 * `usePurpleSphere`); aqui fica apenas o ciclo que as três usam.
 */
export function useSphereCore({
  player,
  setPlayer,
  freezeActionsUntilRef,
  timeRef,
  playSound,
  startSpecialIntro,
  onUsed,
  battleManaRef,
  isPausedRef,
  disabledRef,
  battleEndedRef,
}: Props): SphereCore {
  const [sphere, setSphere] = useState<RiquelmeSphere | null>(null);

  const activeRef = useRef(false);
  const sphereRef = useRef<RiquelmeSphere | null>(null);
  const phaseStartRef = useRef(0);
  const fromRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const cooldownUntilRef = useRef(0);

  const playerRef = useLatestRef(player);
  const setPlayerRef = useLatestRef(setPlayer);
  const playSoundRef = useLatestRef(playSound);
  const startIntroRef = useLatestRef(startSpecialIntro);
  const onUsedRef = useLatestRef(onUsed);

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

  /** Publica um frame novo: o ref é o valor que os ticks leem, o state desenha. */
  const publish = useCallback((next: RiquelmeSphere) => {
    sphereRef.current = next;
    setSphere(next);
  }, []);

  const setPlayerState = useCallback(
    (state: PlayerState) => {
      setPlayerRef.current((p) => (p.mode === "battle" ? { ...p, state } : p));
    },
    [setPlayerRef],
  );

  /** Volta para `idle` só se o player ainda estiver num estado de esfera. */
  const resetPlayerIfSphere = useCallback(() => {
    setPlayerRef.current((p) =>
      p.mode === "battle" && ALL_PREDICATES.isSphere(p.state)
        ? { ...p, state: "idle" }
        : p,
    );
  }, [setPlayerRef]);

  const freezeWorld = useCallback(
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

  /** Encerra o ciclo (cast cancelado, esfera dissipada ou fim do voo). */
  const finish = useCallback(() => {
    activeRef.current = false;
    releaseWorldFreeze();
    freezeActionsUntilRef.current = Date.now();
    resetPlayerIfSphere();
    sphereRef.current = null;
    setSphere(null);
    cooldownUntilRef.current = Date.now() + SPHERE_MIN_COOLDOWN_MS;
  }, [freezeActionsUntilRef, releaseWorldFreeze, resetPlayerIfSphere]);

  /** Começa o fim: libera o player já no início do fade da dissipação. */
  const startDismiss = useCallback(() => {
    const s = sphereRef.current;
    if (!s) return;
    releaseWorldFreeze();
    freezeActionsUntilRef.current = Date.now();
    resetPlayerIfSphere();
    publish({ ...s, phase: "dismissing" });
    phaseStartRef.current = Date.now();
  }, [freezeActionsUntilRef, releaseWorldFreeze, resetPlayerIfSphere, publish]);

  /**
   * Setup compartilhado pelas três variantes: a esfera surge na cabeça com
   * blink (escala 0.1→1) e desliza para a frente até entrar em campo. Devolve
   * `true` no frame em que ele acaba — quem decide o destino é o orquestrador,
   * que conhece as três esferas.
   */
  const tickSetup = useCallback(
    (s: RiquelmeSphere): boolean => {
      const now = Date.now();
      const p = playerRef.current;

      if (s.phase === "spawning") {
        const isPurple = s.variant === "purple";
        const elapsed = now - phaseStartRef.current;
        const duration = isPurple ? PURPLE_FORM_MS : SPHERE_SPAWN_MS;
        const t = Math.min(1, elapsed / duration);
        const scale = isPurple
          ? 1
          : SPHERE_SPAWN_SCALE + (1 - SPHERE_SPAWN_SCALE) * t;
        const blink = isPurple ? 0 : Math.max(0, 1 - elapsed / SPHERE_BLINK_MS);
        const next: RiquelmeSphere = {
          ...s,
          x: p.x,
          y: p.y - SPHERE_OFFSET_Y,
          scale,
          blink,
        };
        publish(next);

        if (t >= 1) {
          const forward = s.direction === "right" ? 1 : -1;
          fromRef.current = { x: next.x, y: next.y };
          targetRef.current = {
            x: p.x + forward * SPHERE_OFFSET_X,
            y: p.y - SPHERE_OFFSET_Y,
          };
          phaseStartRef.current = now;
          publish({ ...next, phase: "moving", blink: 0 });
          setPlayerState("sphereMove");
        }
        return false;
      }

      const t = Math.min(1, (now - phaseStartRef.current) / SPHERE_MOVE_MS);
      const ease = t * t * (3 - 2 * t);
      const x =
        fromRef.current.x + (targetRef.current.x - fromRef.current.x) * ease;
      const y =
        fromRef.current.y + (targetRef.current.y - fromRef.current.y) * ease;
      publish({ ...s, x, y });

      return t >= 1;
    },
    [publish, setPlayerState, playerRef],
  );

  /** Dissipação: escala e opacidade até 0 e então o ciclo termina. */
  const tickDismiss = useCallback(
    (s: RiquelmeSphere) => {
      const t = Math.min(
        1,
        (Date.now() - phaseStartRef.current) / SPHERE_DISMISS_MS,
      );
      publish({
        ...s,
        scale: Math.max(0, 1 - t),
        opacity: Math.max(0, 1 - t),
      });
      if (t >= 1) finish();
    },
    [finish, publish],
  );

  const startCast = useCallback(
    (variant: RiquelmeSphereVariant) => {
      if (activeRef.current) return;
      if (Date.now() < cooldownUntilRef.current) return;
      if (!canUseRef.current) return;

      // Custo por uso: a red cobra 10% e a purple 25% da energia MÁXIMA (a blue
      // não passa por aqui). Consome ANTES de armar o cast; sem saldo, o
      // aperto morre sem gastar carga nem abrir a intro.
      const mana = battleManaRef.current;
      if (variant !== "blue") {
        const cost = sphereEnergyCost(variant, mana?.playerMaxMana ?? 0);
        if (cost > 0 && (!mana || !mana.consumeMana(cost))) return;
      }

      // A purple é a fusão das duas esferas: vale como dois usos (+10 cargas).
      onUsedRef.current?.(variant === "purple" ? 2 : 1);
      activeRef.current = true;

      const run = () => {
        const p = playerRef.current;
        freezeWorld(
          variant === "purple" ? PURPLE_CAST_FREEZE_MS : SPHERE_CAST_FREEZE_MS,
        );
        freezeActionsUntilRef.current = Infinity;
        phaseStartRef.current = Date.now();
        publish(createSphereFrame(variant, p));
        setPlayerState(variant === "purple" ? "purpleJunction" : "sphereCast");
        playSoundRef.current("hollowPurple");
      };

      // O intro abre o background (blue|red|purple) em slow-motion e chama
      // `run` ao fim; se já houver um intro em andamento ele não roda, e o cast
      // precisa sair na hora para a ativação (e o recurso) não sumirem.
      const started = startIntroRef.current("riquelme", run, variant);
      if (!started) run();
    },
    [
      battleManaRef,
      canUseRef,
      freezeActionsUntilRef,
      freezeWorld,
      onUsedRef,
      playSoundRef,
      playerRef,
      publish,
      setPlayerState,
      startIntroRef,
    ],
  );

  // Cleanup no unmount: o mundo não pode ficar congelado depois da batalha.
  useEffect(() => {
    return () => {
      timeRef.current = clearTime(timeRef.current, SPHERE_TIME_ID);
    };
  }, [timeRef]);

  return {
    sphere,
    sphereRef,
    phaseStartRef,
    fromRef,
    targetRef,
    activeRef,
    canUseRef,
    shouldCancelRef,
    freezeActionsUntilRef,
    publish,
    setPlayerState,
    resetPlayerIfSphere,
    freezeWorld,
    releaseWorldFreeze,
    tickSetup,
    tickDismiss,
    startCast,
    finish,
    startDismiss,
  };
}
