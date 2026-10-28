import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";

import {
  NPC_CLASS_HITBOX_BONUS,
  NPC_CLASS_VERTICAL_BONUS,
} from "@/gameRules/battle/range/config";
import { getTime, type TimeEffect } from "@/gameRules/battle/time";
import { planBabidiAttack } from "@/gameRules/battle/characters/babidi/babidiAttack";
import { getPortalExitDirection } from "@/gameRules/battle/characters/babidi/babidiPortal";
import { BabidiEnergyConstants } from "@/data/characters/babidi";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { ProjectileConstants } from "@/data/projectile";

import type {
  BabidiEnergyProjectile,
  BabidiPortalWarpFn,
  BabidiTarget,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Props = {
  PLAYER_SIZE: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  npcClass: NPCClass;
  summons: SummonedNpc[];
  /** Colisão do projétil com um alvo: resolve o dano básico (main ou summon). */
  onProjectileHit: (target: BabidiTarget) => void;
  /** Portais do babidi: faz o projétil de energia atravessar de um ao outro. */
  portalWarpRef?: React.RefObject<BabidiPortalWarpFn | null>;
};

/**
 * Ataque básico do babidi: dispara o projétil `energyAttack.svg` a cada golpe.
 *
 * O press consome o cooldown e gera o projétil; o dano só acontece na colisão
 * (via `onProjectileHit`, preenchido pelo `usePlayerBattleActions`). A variante
 * do sprite de ataque (`leftHandAttack`/`rightHandAttack`/`bothSidesAttack`)
 * sai do `planBabidiAttack` e é exposta para o render do player.
 */
export function useBabidiEnergyAttack({
  PLAYER_SIZE,
  timeRef,
  npc,
  npcClass,
  summons,
  onProjectileHit,
  portalWarpRef,
}: Props) {
  const [projectiles, setProjectiles] = useState<BabidiEnergyProjectile[]>([]);
  const [attackVariant, setAttackVariant] =
    useState<BabidiAttackVariant>("right");

  const onProjectileHitRef = useLatestRef(onProjectileHit);
  const npcRef = useLatestRef(npc);
  const npcClassRef = useLatestRef(npcClass);
  const summonsRef = useLatestRef(summons);
  const playerSizeRef = useLatestRef(PLAYER_SIZE);

  // Mão do próximo golpe de uma mão só: alterna a cada disparo
  // (left → right → left …), como pede a sequência das poses.
  const handRef = useRef<"left" | "right">("right");

  const fire = useCallback(
    (player: Player, targets: BabidiTarget[]): boolean => {
      const hand = handRef.current;
      handRef.current = hand === "left" ? "right" : "left";

      const spriteHeight = playerSizeRef.current / PLAYER_SPRITE_DIVISOR;
      const spawnY =
        player.y - spriteHeight * BabidiEnergyConstants.HAND_HEIGHT_RATIO;

      const plan = planBabidiAttack({
        player,
        targets,
        hand,
        offsetX: BabidiEnergyConstants.SPAWN_OFFSET_X,
        spawnY,
      });

      setAttackVariant(plan.variant);

      const now = Date.now();
      setProjectiles((prev) => [
        ...prev,
        ...plan.shots.map((shot, index) => ({
          id: `babidi-energy-${now}-${index}`,
          x: shot.spawnX,
          y: shot.spawnY,
          dirX: shot.dirX,
          dirY: 0,
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
      const collisionTargets: (BabidiTarget & {
        radiusX: number;
        radiusY: number;
      })[] = [
        {
          id: "main",
          x: npcRef.current.x,
          y: npcRef.current.y,
          radiusX:
            BabidiEnergyConstants.HIT_RANGE_X +
            (NPC_CLASS_HITBOX_BONUS[npcClassRef.current] ?? 0),
          radiusY:
            BabidiEnergyConstants.VERTICAL_TOLERANCE +
            (NPC_CLASS_VERTICAL_BONUS[npcClassRef.current] ?? 0),
        },
        ...summonsRef.current
          .filter((summon) => summon.hp > 0 && !summon.isDying)
          .map((summon) => ({
            id: summon.id,
            x: summon.x,
            y: summon.y,
            radiusX: BabidiEnergyConstants.HIT_RANGE_X,
            radiusY: BabidiEnergyConstants.VERTICAL_TOLERANCE,
          })),
      ];

      const hits: BabidiTarget[] = [];

      const next = projectiles
        .map((p) => {
          // Regra de time da batalha: projétil congelado (hitstop, Killer
          // Queen, Expansão de Domínio, O Mais Honrado) não avança nem colide.
          const time = getTime(timeRef.current, "projectile", p.id);
          if (time.speed === 0) return p;

          let x =
            p.x + p.dirX * BabidiEnergyConstants.SPEED_PER_TICK * time.speed;
          let y =
            p.y + p.dirY * BabidiEnergyConstants.SPEED_PER_TICK * time.speed;
          let dirX = p.dirX;
          let dirY = p.dirY;

          // Portais do babidi: cruza a zona e reaparece no par. Quem sai decide
          // a nova direção — frontal mantém o rumo, terrestre cospe para cima e
          // aéreo para baixo (`getPortalExitDirection`); a colisão passa a valer
          // já na saída.
          const warp = portalWarpRef?.current;
          if (warp) {
            const dest = warp(p.id, x, y);
            if (dest) {
              x = dest.x;
              y = dest.y;
              const exit = getPortalExitDirection(dest.kind, p.dirX, p.dirY);
              dirX = exit.dirX;
              dirY = exit.dirY;
            }
          }

          if (
            x < -BabidiEnergyConstants.OFFSCREEN_MARGIN ||
            x >
              ProjectileConstants.MAP_WIDTH +
                BabidiEnergyConstants.OFFSCREEN_MARGIN ||
            y < -BabidiEnergyConstants.OFFSCREEN_MARGIN ||
            y >
              ProjectileConstants.MAP_HEIGHT +
                BabidiEnergyConstants.OFFSCREEN_MARGIN
          ) {
            return null;
          }

          for (const target of collisionTargets) {
            if (
              Math.abs(x - target.x) <= target.radiusX &&
              Math.abs(y - target.y) <= target.radiusY
            ) {
              hits.push({ id: target.id, x: target.x, y: target.y });
              return null; // o projétil some no primeiro alvo atingido
            }
          }

          return { ...p, x, y, dirX, dirY };
        })
        .filter((p): p is BabidiEnergyProjectile => p !== null);

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
    portalWarpRef,
  ]);

  return { projectiles, attackVariant, fire };
}
