import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";

import {
  NPC_CLASS_HITBOX_BONUS,
  NPC_CLASS_VERTICAL_BONUS,
} from "@/gameRules/battle/range/config";
import { getTime } from "@/gameRules/battle/time";
import { planBabidiAttack } from "@/gameRules/battle/characters/babidi/babidiAttack";
import { BabidiEnergyConstants } from "@/data/characters/babidi";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { ProjectileConstants } from "@/data/projectile";

import type {
  BabidiEnergyProjectile,
  BabidiTarget,
} from "@/utils/types/character/babidi";
import type {
  BabidiAttackProjectileSprite,
  BabidiAttackVariant,
} from "@/utils/types/character/babidi/attack";

/**
 * Ataque básico do babidi: dispara o projétil de energia a cada golpe,
 * alternando o sprite entre `yellowDog` e `blueDog`.
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

  // Sprite do projétil: alterna a cada golpe (yellowDog → blueDog → …). Todos os
  // disparos de um mesmo golpe (ex.: bothSidesAttack) usam a mesma cor.
  const projectileSpriteRef = useRef<BabidiAttackProjectileSprite>("yellowDog");

  const fire = useCallback(
    (player: Player, targets: BabidiTarget[]): boolean => {
      const hand = handRef.current;
      handRef.current = hand === "left" ? "right" : "left";

      const sprite = projectileSpriteRef.current;
      projectileSpriteRef.current =
        sprite === "yellowDog" ? "blueDog" : "yellowDog";

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
          sprite,
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

          const x =
            p.x + p.dirX * BabidiEnergyConstants.SPEED_PER_TICK * time.speed;
          const y =
            p.y + p.dirY * BabidiEnergyConstants.SPEED_PER_TICK * time.speed;
          const dirX = p.dirX;
          const dirY = p.dirY;

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
  ]);

  return { projectiles, attackVariant, fire };
}
