import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import {
  PUNCH_FINALIZE_MS,
  PUNCH_LIFETIME_MS,
  PUNCH_MOVE_FACTOR,
  PUNCH_MOVE_TICK_MS,
  PUNCH_MIN_DISTANCE_MS,
  PUNCH_SPAWN_INTERVAL_MS,
  PUNCH_TARGET_JITTER,
} from "@/data/characters/srGuaxinim/srGuaxinim";
import type {
  PunchHitResult,
  OraPunch,
} from "@/utils/types/character/srGuaxinim";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** Dispara a instância de attack do punch (dano) e devolve o alvo atingido. */
  onPunchHit: (multiplier: number) => PunchHitResult;
  /** Ref preenchido com o multiplicador atual do ataque básico do srGuaxinim. */
  multiplierRef: React.RefObject<() => number>;
};

export function useSrGuaxinimOraPunch({
  player,
  setPlayer,
  onPunchHit,
  multiplierRef,
}: Props) {
  const { playSound } = useSoundEffects();

  const [punches, setPunches] = useState<OraPunch[]>([]);
  const punchesRef = useRef(punches);
  punchesRef.current = punches;

  const onPunchHitRef = useLatestRef(onPunchHit);

  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCounterRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const confirmHeldRef = useRef(false);

  const getMultiplier = useCallback(() => {
    const active = punchesRef.current.length;
    return Math.min(2, 0.2 + 0.2 * active);
  }, []);

  multiplierRef.current = getMultiplier;

  // Enquanto o botão de ataque estiver pressionado, re-arma o timer para o
  // personagem continuar em attack.svg; ao soltar, sai 300ms depois.
  const armFinalizeRef = useRef<() => void>(() => {});
  const armFinalize = useCallback(() => {
    if (finalizeTimerRef.current) clearTimeout(finalizeTimerRef.current);
    finalizeTimerRef.current = setTimeout(() => {
      finalizeTimerRef.current = null;
      if (confirmHeldRef.current) {
        armFinalizeRef.current();
        return;
      }
      setPlayer((p) =>
        p.character === "srGuaxinim" &&
        p.mode === "battle" &&
        ALL_PREDICATES.isAttackPose(p.state)
          ? { ...p, state: "idle" }
          : p,
      );
    }, PUNCH_FINALIZE_MS);
  }, [setPlayer]);
  armFinalizeRef.current = armFinalize;

  // Ao entrar na pose de ataque, arma o timer que só desarma com novos cliques.
  useEffect(() => {
    if (player.character !== "srGuaxinim" || player.state !== "attack") {
      confirmHeldRef.current = false;
      return;
    }
    armFinalize();
  }, [player.character, player.state, armFinalize]);

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current) clearTimeout(finalizeTimerRef.current);
    };
  }, []);

  const spawnPunch = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnRef.current < PUNCH_SPAWN_INTERVAL_MS) return;

    const target = onPunchHitRef.current?.(getMultiplier());
    if (!target) return;

    lastSpawnRef.current = now;

    // Localizações diferentes ao redor do personagem, sempre respeitando a
    // distância mínima (50px) dos punches já existentes.
    let sx = player.x;
    let sy = player.y;
    for (let attempt = 0; attempt < 24; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 35;
      const cx = player.x + Math.cos(angle) * radius;
      const cy = player.y + Math.sin(angle) * radius;
      if (
        punchesRef.current.every(
          (p) => Math.hypot(p.x - cx, p.y - cy) >= PUNCH_MIN_DISTANCE_MS,
        )
      ) {
        sx = cx;
        sy = cy;
        break;
      }
    }

    const id = idCounterRef.current++;
    setPunches((prev) => [
      ...prev,
      {
        id,
        x: sx,
        y: sy,
        targetX: target.x + (Math.random() - 0.5) * PUNCH_TARGET_JITTER,
        targetY: target.y + (Math.random() - 0.5) * PUNCH_TARGET_JITTER,
        born: now,
      },
    ]);

    // Punch em summon não passa pelo applyBasicHit (sem som de ataque).
    if (!target.isMain) playSound("ORA");
    armFinalize();
  }, [
    armFinalize,
    getMultiplier,
    onPunchHitRef,
    player.x,
    player.y,
    playSound,
  ]);

  const oraPress = useCallback(() => {
    if (player.character !== "srGuaxinim") return;
    confirmHeldRef.current = true;
    if (!ALL_PREDICATES.isAttackPose(player.state)) {
      armFinalize();
      return;
    }
    spawnPunch();
  }, [player.character, player.state, spawnPunch, armFinalize]);

  const oraRelease = useCallback(() => {
    confirmHeldRef.current = false;
    armFinalize();
  }, [armFinalize]);

  // Movimento em direção ao alvo + vida de 1s + separação mínima de 50px.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setPunches((prev) => {
        let changed = false;
        const next: OraPunch[] = [];
        for (const p of prev) {
          if (now - p.born >= PUNCH_LIFETIME_MS) {
            changed = true;
            continue;
          }
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 2) {
            next.push({ ...p });
          } else {
            changed = true;
            const step = Math.min(dist, dist * PUNCH_MOVE_FACTOR);
            next.push({
              ...p,
              x: p.x + (dx / dist) * step,
              y: p.y + (dy / dist) * step,
            });
          }
        }

        if (next.length > 1) {
          for (let i = 0; i < next.length - 1; i++) {
            for (let j = i + 1; j < next.length; j++) {
              const a = next[i]!;
              const b = next[j]!;
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0 && dist < PUNCH_MIN_DISTANCE_MS) {
                const push = (PUNCH_MIN_DISTANCE_MS - dist) / 2;
                const ux = dx / dist;
                const uy = dy / dist;
                a.x -= ux * push;
                a.y -= uy * push;
                b.x += ux * push;
                b.y += uy * push;
                changed = true;
              }
            }
          }
        }

        return changed ? next : prev;
      });
    }, PUNCH_MOVE_TICK_MS);

    return () => clearInterval(id);
  }, []);

  const punchesVisual = punches.map((p) => ({ id: p.id, x: p.x, y: p.y }));

  return {
    oraPress,
    oraRelease,
    punches: punchesVisual,
    getMultiplier,
  };
}
