import { useCallback, useEffect, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { getTime, type TimeEffect } from "@/gameRules/battle/time";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";

import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";

import type { BabidiMissileProjectile } from "@/utils/types/character/babidi";
import type { BabidiTarget } from "@/utils/types/character/babidi";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  PLAYER_SIZE: number;
  npcType: string;
  npcPhase: number;
  isAlfa: boolean;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  summons: SummonedNpc[];
  onProjectileHit: (target: BabidiTarget) => void;
};

const SPEED_PER_TICK = 12;
const HIT_RADIUS = 10;
const EXPLOSION_MS = 400;
const TICK_MS = 20;

export function useBabidiMissile({
  PLAYER_SIZE,
  npcType,
  npcPhase,
  isAlfa,
  timeRef,
  npc,
  summons,
  onProjectileHit,
}: Props) {
  const { playSound } = useSoundEffects();
  const playSoundRef = useLatestRef(playSound);
  const [missiles, setMissiles] = useState<BabidiMissileProjectile[]>([]);

  const onProjectileHitRef = useLatestRef(onProjectileHit);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const playerSizeRef = useLatestRef(PLAYER_SIZE);
  const npcTypeRef = useLatestRef(npcType);
  const npcPhaseRef = useLatestRef(npcPhase);
  const isAlfaRef = useLatestRef(isAlfa);

  const findNearestTarget = useCallback(
    (x: number, y: number): BabidiTarget | null => {
      const targets: BabidiTarget[] = [
        { id: "main", x: npcRef.current.x, y: npcRef.current.y },
        ...summonsRef.current
          .filter((s) => s.hp > 0 && !s.isDying)
          .map((s) => ({ id: s.id, x: s.x, y: s.y })),
      ];
      if (targets.length === 0) return null;
      let best = targets[0]!;
      let bestDist = Infinity;
      for (const t of targets) {
        const d = Math.hypot(t.x - x, t.y - y);
        if (d < bestDist) {
          bestDist = d;
          best = t;
        }
      }
      return best;
    },
    [npcRef, summonsRef],
  );

  const MAX_MISSILES = 3;
  const PORTAL_MIN_DISTANCE = 50;

  const fire = useCallback(
    (player: { x: number; y: number }): boolean => {
      const spriteHeight = playerSizeRef.current / PLAYER_SPRITE_DIVISOR;
      const baseSpawnY = player.y - spriteHeight * 1.6;
      const baseSpawnX = player.x;

      let allowed = true;
      let finalSpawnX = baseSpawnX;
      let finalSpawnY = baseSpawnY;

      setMissiles((prev) => {
        const active = prev.filter((m) => m.phase === "flying");
        if (active.length >= MAX_MISSILES) {
          allowed = false;
          return prev;
        }
        // Encontra uma posição livre para o portal: mínimo de 50px de
        // distância (euclidiana) em relação a qualquer portal ativo. Tenta
        // offsets em triângulo para distribuir até 3 portais.
        const offsets = [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: -25, y: 43 },
          { x: 25, y: -43 },
          { x: -50, y: 0 },
          { x: 0, y: 50 },
        ];
        let found = false;
        for (const off of offsets) {
          const cx = baseSpawnX + off.x;
          const cy = baseSpawnY + off.y;
          const overlapping = active.some(
            (m) =>
              Math.hypot(m.spawnX - cx, m.spawnY - cy) < PORTAL_MIN_DISTANCE,
          );
          if (!overlapping) {
            finalSpawnX = cx;
            finalSpawnY = cy;
            found = true;
            break;
          }
        }
        if (!found) {
          allowed = false;
          return prev;
        }
        return prev;
      });

      if (!allowed) return false;

      const target = findNearestTarget(finalSpawnX, finalSpawnY);

      const aims: Array<"feet" | "center" | "top"> = ["feet", "center", "top"];
      const aim = aims[Math.floor(Math.random() * aims.length)]!;

      const missile: BabidiMissileProjectile = {
        id: `babidi-missile-${Date.now()}`,
        x: finalSpawnX,
        y: finalSpawnY,
        spawnX: finalSpawnX,
        spawnY: finalSpawnY,
        phase: "flying",
        age: 0,
        explosionRemaining: 0,
        targetId: target?.id ?? null,
        dirX: 1,
        angle: 0,
        aim,
      };

      setMissiles((prev) => [...prev, missile]);
      return true;
    },
    [playerSizeRef, findNearestTarget],
  );

  useEffect(() => {
    if (missiles.length === 0) return;

    const interval = setInterval(() => {
      setMissiles((prev) => {
        const aliveSummons = summonsRef.current.filter(
          (s) => s.hp > 0 && !s.isDying,
        );
        const next: BabidiMissileProjectile[] = [];

        for (const m of prev) {
          const time = getTime(timeRef.current, "projectile", m.id);
          const speed = time.speed;

          if (m.phase === "exploding") {
            const remaining = m.explosionRemaining - TICK_MS;
            if (remaining > 0) {
              next.push({ ...m, explosionRemaining: remaining });
            }
            // else remove
            continue;
          }

          // flying
          // update target if dead
          let targetId = m.targetId;
          let target: BabidiTarget | null = null;
          const targets: BabidiTarget[] = [
            { id: "main", x: npcRef.current.x, y: npcRef.current.y },
            ...aliveSummons.map((s) => ({ id: s.id, x: s.x, y: s.y })),
          ];
          if (targetId) {
            target = targets.find((t) => t.id === targetId) ?? null;
          }
          if (!target && targets.length > 0) {
            // find nearest
            let best = targets[0]!;
            let bestDist = Infinity;
            for (const t of targets) {
              const d = Math.hypot(t.x - m.x, t.y - m.y);
              if (d < bestDist) {
                bestDist = d;
                best = t;
              }
            }
            target = best;
            targetId = best.id;
          }

          if (!target) {
            // no target: remove
            continue;
          }

          // Altura da sprite do alvo (para mirar pés/centro/topo).
          let height = 0;
          if (target.id === "main") {
            height =
              getBossSizeMultiplier(
                npcTypeRef.current,
                npcPhaseRef.current,
                isAlfaRef.current,
              ) *
              (playerSizeRef.current / 1.4);
          } else {
            const summon = aliveSummons.find((s) => s.id === target.id);
            if (summon) {
              height =
                getBossSizeMultiplier(summon.npcType) *
                (playerSizeRef.current / 1.4);
            }
          }

          // Ponto de mira vertical conforme o aim escolhido.
          let aimOffset = 0;
          if (m.aim === "center") aimOffset = -height / 2;
          else if (m.aim === "top") aimOffset = -height;
          // feet: 0

          const targetX = target.x;
          const targetY = target.y + aimOffset;

          const dx = targetX - m.x;
          const dy = targetY - m.y;
          const dist = Math.hypot(dx, dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          if (dist <= HIT_RADIUS) {
            // hit: atinge o ponto de mira da sprite do inimigo
            onProjectileHitRef.current({ id: target.id, x: target.x, y: target.y });
            playSoundRef.current("explosion");
            next.push({
              ...m,
              targetId,
              phase: "exploding",
              explosionRemaining: EXPLOSION_MS,
              angle,
            });
            continue;
          }

          // move
          if (speed === 0) {
            next.push({ ...m, targetId, angle });
            continue;
          }
          const step = (SPEED_PER_TICK * speed) / (dist || 1);
          const newX = m.x + dx * step;
          const newY = m.y + dy * step;
          next.push({
            ...m,
            x: newX,
            y: newY,
            targetId,
            dirX: dx >= 0 ? 1 : -1,
            angle,
          });
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [missiles.length, npcRef, summonsRef, timeRef, onProjectileHitRef, isAlfaRef, npcPhaseRef, npcTypeRef, playSoundRef, playerSizeRef]);

  return { missiles, fire };
}