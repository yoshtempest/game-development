import { useCallback, useEffect, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { getTime, type TimeEffect } from "@/gameRules/battle/time";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";

import type { BabidiMissileProjectile } from "@/utils/types/character/babidi";
import type { BabidiTarget } from "@/utils/types/character/babidi";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  PLAYER_SIZE: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  summons: SummonedNpc[];
  onProjectileHit: (target: BabidiTarget) => void;
};

const SPEED_PER_TICK = 12;
const HIT_RADIUS = 28;
const EXPLOSION_MS = 400;
const TICK_MS = 20;

export function useBabidiMissile({
  PLAYER_SIZE,
  timeRef,
  npc,
  summons,
  onProjectileHit,
}: Props) {
  const [missiles, setMissiles] = useState<BabidiMissileProjectile[]>([]);

  const onProjectileHitRef = useLatestRef(onProjectileHit);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const playerSizeRef = useLatestRef(PLAYER_SIZE);

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
  const PORTAL_OVERLAP_THRESHOLD = 20;

  const fire = useCallback(
    (player: { x: number; y: number }): boolean => {
      const spriteHeight = playerSizeRef.current / PLAYER_SPRITE_DIVISOR;
      const spawnY = player.y - spriteHeight * 1.6;
      const spawnX = player.x;

      // Limite: até 3 mísseis simultâneos.
      // (checado no estado atual via ref não disponível; verificamos abaixo no
      // setMissiles com early return false quando já há 3 ativos)
      let allowed = true;
      setMissiles((prev) => {
        const active = prev.filter((m) => m.phase === "flying");
        if (active.length >= MAX_MISSILES) {
          allowed = false;
          return prev;
        }
        // Portal não pode ser posicionado no mesmo local de outro portal ativo.
        const overlapping = prev.some(
          (m) =>
            m.phase === "flying" &&
            Math.hypot(m.spawnX - spawnX, m.spawnY - spawnY) <
              PORTAL_OVERLAP_THRESHOLD,
        );
        if (overlapping) {
          allowed = false;
          return prev;
        }
        return prev; // não adiciona aqui; adiciona abaixo
      });

      if (!allowed) return false;

      const target = findNearestTarget(spawnX, spawnY);

      const missile: BabidiMissileProjectile = {
        id: `babidi-missile-${Date.now()}`,
        x: spawnX,
        y: spawnY,
        spawnX,
        spawnY,
        phase: "flying",
        age: 0,
        explosionRemaining: 0,
        targetId: target?.id ?? null,
        dirX: 1,
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

          const dx = target.x - m.x;
          const dy = target.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= HIT_RADIUS) {
            // hit
            onProjectileHitRef.current({ id: target.id, x: target.x, y: target.y });
            next.push({
              ...m,
              targetId,
              phase: "exploding",
              explosionRemaining: EXPLOSION_MS,
            });
            continue;
          }

          // move
          if (speed === 0) {
            next.push({ ...m, targetId });
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
          });
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [missiles.length, npcRef, summonsRef, timeRef, onProjectileHitRef]);

  return { missiles, fire };
}