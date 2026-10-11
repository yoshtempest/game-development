import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";

import {
  NPC_CLASS_HITBOX_BONUS,
  NPC_CLASS_VERTICAL_BONUS,
} from "@/gameRules/battle/rangeConfig";
import { getTime, type TimeEffect } from "@/gameRules/battle/time";
import { planLucauaAttack } from "@/gameRules/battle/lucauaAttack";
import { LucauaEnergyConstants } from "@/data/characters/lucaua/lucaua";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { ProjectileConstants } from "@/data/projectile";

import type {
  LucauaAttackVariant,
  LucauaEnergyProjectile,
  LucauaTarget,
} from "@/utils/types/character/lucaua";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  PLAYER_SIZE: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  npcClass: NPCClass;
  summons: SummonedNpc[];
  /** Colisão do projétil com um alvo: resolve o dano básico (main ou summon). */
  onProjectileHit: (target: LucauaTarget) => void;
};

/**
 * Ataque básico do lucaua: dispara o projétil `energyAttack.svg` a cada golpe.
 *
 * O press consome o cooldown e gera o projétil; o dano só acontece na colisão
 * (via `onProjectileHit`, preenchido pelo `usePlayerBattleActions`). A variante
 * do sprite de ataque (`leftHandAttack`/`rightHandAttack`/`bothSidesAttack`)
 * sai do `planLucauaAttack` e é exposta para o render do player.
 */
export function useLucauaEnergyAttack({
  PLAYER_SIZE,
  timeRef,
  npc,
  npcClass,
  summons,
  onProjectileHit,
}: Props) {
  const [projectiles, setProjectiles] = useState<LucauaEnergyProjectile[]>([]);
  const [attackVariant, setAttackVariant] = useState<LucauaAttackVariant>(
    "right",
  );

  const onProjectileHitRef = useLatestRef(onProjectileHit);
  const npcRef = useLatestRef(npc);
  const npcClassRef = useLatestRef(npcClass);
  const summonsRef = useLatestRef(summons);
  const playerSizeRef = useLatestRef(PLAYER_SIZE);

  // Mão do próximo golpe de uma mão só: alterna a cada disparo
  // (left → right → left …), como pede a sequência das poses.
  const handRef = useRef<"left" | "right">("right");

  const fire = useCallback(
    (player: Player, targets: LucauaTarget[]): boolean => {
      const hand = handRef.current;
      handRef.current = hand === "left" ? "right" : "left";

      const spriteHeight = playerSizeRef.current / PLAYER_SPRITE_DIVISOR;
      const spawnY =
        player.y - spriteHeight * LucauaEnergyConstants.HAND_HEIGHT_RATIO;

      const plan = planLucauaAttack({
        player,
        targets,
        hand,
        offsetX: LucauaEnergyConstants.SPAWN_OFFSET_X,
        spawnY,
      });

      setAttackVariant(plan.variant);

      const now = Date.now();
      setProjectiles((prev) => [
        ...prev,
        ...plan.shots.map((shot, index) => ({
          id: `lucaua-energy-${now}-${index}`,
          x: shot.spawnX,
          y: shot.spawnY,
          dirX: shot.dirX,
        })),
      ]);

      return true;
    },
    [playerSizeRef],
  );

  useEffect(() => {
    if (projectiles.length === 0) return;

    const interval = setInterval(() => {
      // Hitboxes do tick atual: o NPC principal soma a classe (mesma geometria
      // do melee); summons usam a base. Reconstruímos a cada tick porque NPC e
      // summons se movem fora deste effect.
      const collisionTargets: (LucauaTarget & {
        radiusX: number;
        radiusY: number;
      })[] = [
        {
          id: "main",
          x: npcRef.current.x,
          y: npcRef.current.y,
          radiusX:
            LucauaEnergyConstants.HIT_RANGE_X +
            (NPC_CLASS_HITBOX_BONUS[npcClassRef.current] ?? 0),
          radiusY:
            LucauaEnergyConstants.VERTICAL_TOLERANCE +
            (NPC_CLASS_VERTICAL_BONUS[npcClassRef.current] ?? 0),
        },
        ...summonsRef.current
          .filter((summon) => summon.hp > 0 && !summon.isDying)
          .map((summon) => ({
            id: summon.id,
            x: summon.x,
            y: summon.y,
            radiusX: LucauaEnergyConstants.HIT_RANGE_X,
            radiusY: LucauaEnergyConstants.VERTICAL_TOLERANCE,
          })),
      ];

      const hits: LucauaTarget[] = [];

      const next = projectiles
        .map((p) => {
          // Regra de time da batalha: projétil congelado (hitstop, Killer
          // Queen, Expansão de Domínio, O Mais Honrado) não avança nem colide.
          const time = getTime(timeRef.current, "projectile", p.id);
          if (time.speed === 0) return p;

          const x =
            p.x + p.dirX * LucauaEnergyConstants.SPEED_PER_TICK * time.speed;

          if (
            x < -LucauaEnergyConstants.OFFSCREEN_MARGIN ||
            x >
              ProjectileConstants.MAP_WIDTH +
                LucauaEnergyConstants.OFFSCREEN_MARGIN
          ) {
            return null;
          }

          for (const target of collisionTargets) {
            if (
              Math.abs(x - target.x) <= target.radiusX &&
              Math.abs(p.y - target.y) <= target.radiusY
            ) {
              hits.push({ id: target.id, x: target.x, y: target.y });
              return null; // o projétil some no primeiro alvo atingido
            }
          }

          return { ...p, x };
        })
        .filter((p): p is LucauaEnergyProjectile => p !== null);

      // Callbacks fora do state updater: acertar dali era golpe proibido (o
      // dano dispara som/navegação). Mesmo padrão do loop de projéteis do NPC.
      if (hits.length > 0) {
        for (const hit of hits) onProjectileHitRef.current(hit);
      }
      setProjectiles(next);
    }, 20);

    return () => clearInterval(interval);
  }, [
    projectiles,
    npcRef,
    npcClassRef,
    summonsRef,
    timeRef,
    onProjectileHitRef,
  ]);

  return { projectiles, attackVariant, fire };
}