import type { Props } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSoundEffects } from "@/contexts/SoundEffectsContext";

import { useLatestRef } from "@/hooks/useLatestRef";

import { getProjectileCenter } from "@/gameRules/npc/projectile/projectileDamage";
import { isProjectileId } from "@/gameRules/npc/projectile/projectileId";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";

import {
  DEFAULT_OVERLAY,
  BEHIND_X_OFFSET,
  SPAWN_X_OFFSET,
  KILLER_QUEEN_SPRITE_FILE,
} from "@/data/characters/srGuaxinim/srGuaxinim";

import {
  playerPathSrGuaxinimHabilities,
  npcPathProjectile,
} from "@/utils/paths";
import type {
  KillerQueenOverlay,
  EnemyTarget,
} from "@/utils/types/character/srGuaxinim";

/**
 * Resolve a posição atual de um alvo marcado. Desde a #521 a Killer Queen não
 * congela mais o tempo, então inimigos e projéteis continuam andando durante a
 * coreografia: a bomba acompanha o alvo vivo e só cai no último ponto
 * conhecido quando ele já saiu de cena (projétil que acertou, summon morto).
 */
function resolveLivePosition(
  target: EnemyTarget,
  enemies: EnemyTarget[],
  projectiles: Projectile[],
): EnemyTarget {
  if (isProjectileId(target.id)) {
    const live = projectiles.find((p) => p.id === target.id);
    return live ? { id: target.id, ...getProjectileCenter(live) } : target;
  }
  return enemies.find((e) => e.id === target.id) ?? target;
}

/**
 * Killer Queen do SrGuaxinim: o stand aparece atrás de cada inimigo e projétil
 * destrutível, marca com uma bomba e detona tudo no final.
 *
 * Desde a #521 o tempo **não** para: o mundo continua agindo e o jogador pode
 * se mover (e correr) enquanto o stand trabalha. Por isso nada aqui escreve em
 * `timeRef` nem no `freezeActionsUntilRef`, e as posições (alvo, bomba e o
 * próprio player no retorno do stand) são lidas ao vivo por ref em cada passo,
 * não de um snapshot do início. No fim o `idle` só é forçado se o player ainda
 * estiver na pose da habilidade — quem saiu andando não é puxado de volta.
 */
export function useSrGuaxinimKillerQueen({
  player,
  setPlayer,
  enemies,
  projectiles,
  onBombProjectiles,
  onAreaDamage,
}: Props) {
  const [killerQueen, setKillerQueen] =
    useState<KillerQueenOverlay>(DEFAULT_OVERLAY);
  const [bombTargets, setBombTargets] = useState<BombTarget[]>([]);

  const { playSound } = useSoundEffects();

  const runningRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const onAreaDamageRef = useLatestRef(onAreaDamage);
  const onBombProjectilesRef = useLatestRef(onBombProjectiles);
  const enemiesRef = useLatestRef(enemies);
  const projectilesRef = useLatestRef(projectiles);
  const playerRef = useLatestRef(player);

  useEffect(() => {
    const isSrGuaxinim = player.character === "srGuaxinim";
    const isActive = ALL_PREDICATES.isAbilityTrigger(player.state);

    if (!isSrGuaxinim || !isActive || runningRef.current) return;

    runningRef.current = true;

    const timers = timersRef.current;
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const playerSide = () => {
      const p = playerRef.current;
      const isRight = p.battleDirection === "right";
      return {
        x: p.x + (isRight ? SPAWN_X_OFFSET : -SPAWN_X_OFFSET),
        y: p.y,
        flip: !isRight,
      };
    };
    const live = (t: EnemyTarget) =>
      resolveLivePosition(t, enemiesRef.current, projectilesRef.current);
    const behind = (e: EnemyTarget) => {
      const px = playerRef.current.x;
      return {
        x: e.x >= px ? e.x + BEHIND_X_OFFSET : e.x - BEHIND_X_OFFSET,
        flip: e.x >= px,
      };
    };

    const targets: EnemyTarget[] = [
      ...enemiesRef.current,
      ...projectilesRef.current
        .filter((p) => !p.indestructible)
        .map((p) => ({ id: p.id, ...getProjectileCenter(p) })),
    ];

    void (async () => {
      try {
        const start = playerSide();
        setKillerQueen({
          active: true,
          x: start.x,
          y: start.y,
          sprite: "idle",
          opacity: 0,
          flip: start.flip,
        });
        await delay(30);
        setKillerQueen((q) => ({ ...q, opacity: 1 }));
        await delay(350);
        setKillerQueen((q) => ({ ...q, opacity: 0 }));

        const bombed: BombTarget[] = [];
        const bombedProjectileIds: string[] = [];
        for (const target of targets) {
          await delay(260);
          const enemy = live(target);
          const spot = behind(enemy);
          setKillerQueen({
            active: true,
            x: spot.x,
            y: enemy.y,
            sprite: "idle",
            opacity: 1,
            flip: spot.flip,
          });
          playSound("blink");
          await delay(280);
          setKillerQueen((q) => ({ ...q, sprite: "touch" }));
          await delay(200);

          const touched = live(target);
          bombed.push({
            id: target.id,
            x: touched.x,
            y: touched.y,
            phase: "bomb",
          });
          if (isProjectileId(target.id)) bombedProjectileIds.push(target.id);
          setBombTargets([...bombed]);
          setKillerQueen((q) => ({ ...q, opacity: 0 }));
          await delay(250);
        }

        const end = playerSide();
        setKillerQueen({
          active: true,
          x: end.x,
          y: end.y,
          sprite: "prePalm",
          opacity: 0,
          flip: end.flip,
        });
        await delay(30);
        setKillerQueen((q) => ({ ...q, opacity: 1 }));
        await delay(250);
        setKillerQueen((q) => ({ ...q, sprite: "palm" }));
        await delay(150);

        const detonated: BombTarget[] = bombed.map((b) => ({
          ...b,
          ...live(b),
          phase: "explosion",
        }));
        setBombTargets(detonated);
        onBombProjectilesRef.current(
          bombedProjectileIds.map((id) => {
            const target = detonated.find((t) => t.id === id);
            const count = Math.max(
              1,
              detonated.filter(
                (b) =>
                  target != null &&
                  Math.hypot(target.x - b.x, target.y - b.y) <= 200,
              ).length,
            );
            return { id, multiplier: count };
          }),
        );
        onAreaDamageRef.current(
          detonated
            .filter((b) => !isProjectileId(b.id))
            .map((b) => ({ x: b.x, y: b.y })),
          enemiesRef.current,
        );

        await delay(450);

        setKillerQueen((q) => ({ ...q, opacity: 0 }));
        await delay(250);
        setBombTargets([]);
        setKillerQueen(DEFAULT_OVERLAY);
        setPlayer((p) =>
          ALL_PREDICATES.isAbilityTrigger(p.state)
            ? { ...p, state: "idle" }
            : p,
        );
      } finally {
        runningRef.current = false;
        timersRef.current = [];
      }
    })();
  }, [
    player.character,
    player.state,
    setPlayer,
    playSound,
    enemiesRef,
    projectilesRef,
    playerRef,
    onAreaDamageRef,
    onBombProjectilesRef,
  ]);

  useEffect(() => {
    const timers = timersRef;
    return () => {
      for (const t of timers.current) window.clearTimeout(t);
    };
  }, []);

  const liveBombTargets = useMemo<BombTarget[]>(
    () =>
      bombTargets.length === 0
        ? bombTargets
        : bombTargets.map((b) =>
            b.phase === "bomb"
              ? { ...b, ...resolveLivePosition(b, enemies, projectiles) }
              : b,
          ),
    [bombTargets, enemies, projectiles],
  );

  return {
    killerQueen,
    bombTargets: liveBombTargets,
    killerQueenSprite: (sprite: KillerQueenOverlay["sprite"]) =>
      playerPathSrGuaxinimHabilities(
        `/bitesTheDust/${KILLER_QUEEN_SPRITE_FILE[sprite]}.svg`,
      ),
    bombSprite: npcPathProjectile("/bomb.svg"),
    explosionSprite: npcPathProjectile("/explosion.svg"),
  };
}
