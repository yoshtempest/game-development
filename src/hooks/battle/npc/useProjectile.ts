import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import {
  PLAYER_BASIC_COOLDOWN,
  PLAYER_SPECIAL_COOLDOWN,
} from "@/data/cooldowns";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { resetCooldownRef } from "@/utils/battle/cooldown";
import { getProjectileCenter } from "@/gameRules/npc/projectile/projectileDamage";
import { getPortalExitDirection } from "@/gameRules/battle/lucauaPortal";
import { useLatestRef } from "@/hooks/useLatestRef";
import { applyPlayerStrike } from "./apply/applyPlayerStrike";
import { handleGroundProjectile } from "./handle/handleGroundProjectile";
import { handleLinearProjectile } from "./handle/handleLinearProjectile";
import { handleCut } from "./handle/handleCut";
import { handleRain } from "./handle/handleRain";
import type {
  ProjectileHitDamageFn,
  ProjectileHitResolveOptions,
  ProjectileStrike,
} from "@/utils/types/battle/projectileHit";
import { getTime, type TimeEffect } from "@/gameRules/battle/time";
import type { DamageKind } from "@/utils/types/battle/damageKind";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import type { LucauaPortalWarpFn } from "@/utils/types/character/lucaua";

export function useProjectile(
  projectiles: Projectile[],
  setProjectiles: Dispatch<SetStateAction<Projectile[]>>,
  playerX: number,
  playerY: number,
  playerState: PlayerState,
  _playerDirection: Direction,
  _npcX: number,
  _npcY: number,
  onHit: (damageKind?: DamageKind) => void,
  timeRef: React.RefObject<TimeEffect[]>,
  onPullPlayer?: (x: number) => void,
  onMiss?: (x: number) => void,
  onStick?: () => void,
  playerCharacter?: string,
  npcClass: NPCClass = "common",
  onBurstHit?: (pushDir: number) => void,
  playerProjectileRef?: React.RefObject<PlayerSpecialProjectile | null>,
  onProjectileDestroyed?: () => void,
  spawnDamageRef?: React.RefObject<SpawnDamageFn>,
  playerCooldownRef?: React.RefObject<boolean>,
  playerHitDamageRef?: React.RefObject<ProjectileHitDamageFn>,
  portalWarpRef?: React.RefObject<LucauaPortalWarpFn | null>,
) {
  const onHitRef = useLatestRef(onHit);
  const onPullPlayerRef = useLatestRef(onPullPlayer);
  const onMissRef = useLatestRef(onMiss);
  const onStickRef = useLatestRef(onStick);
  const onBurstHitRef = useLatestRef(onBurstHit);
  const onProjectileDestroyedRef = useLatestRef(onProjectileDestroyed);
  const playerXRef = useLatestRef(playerX);
  const playerYRef = useLatestRef(playerY);
  const playerStateRef = useLatestRef(playerState);
  const playerCharacterRef = useLatestRef(playerCharacter);
  const playerDirectionRef = useLatestRef(_playerDirection);
  const npcClassRef = useLatestRef(npcClass);
  const npcXRef = useLatestRef(_npcX);
  const npcYRef = useLatestRef(_npcY);

  const destroy = useCallback(() => {
    onProjectileDestroyedRef.current?.();
  }, [onProjectileDestroyedRef]);

  // 1 instância de dano por golpe: `playerCooldown` é o mesmo token que o
  // `handlePlayerHit` consome ao acertar NPC/summon. Sem este claim o loop
  // de 20ms causaria dano a cada tick enquanto o estado é de golpe (hold do
  // artur = dezenas de instâncias e projétil destruído na hora).
  const claimToken = useCallback(
    (state: PlayerState) => {
      if (playerCooldownRef?.current === false) return false;
      if (playerCooldownRef) {
        resetCooldownRef(
          ALL_PREDICATES.isSpecialStrike(state)
            ? PLAYER_SPECIAL_COOLDOWN
            : PLAYER_BASIC_COOLDOWN,
          playerCooldownRef,
        );
      }
      return true;
    },
    [playerCooldownRef],
  );

  const resolveHit = useCallback(
    (playerState: PlayerState, options?: ProjectileHitResolveOptions) =>
      playerHitDamageRef?.current?.(playerState, options) ?? null,
    [playerHitDamageRef],
  );

  const spawnDamage = useCallback(
    (damage: number, x: number, y: number, type: DamageType) => {
      spawnDamageRef?.current?.(damage, x, y, type);
    },
    [spawnDamageRef],
  );

  const strike = useMemo(
    () => ({ claimToken, resolveHit, spawnDamage }),
    [claimToken, resolveHit, spawnDamage],
  );

  /**
   * Golpe de área já disparado contra projéteis instanciados (explosão do
   * Killer Queen): aplica o dano real do special, mostra o damage number e
   * destroi o projétil quando o dano zera o HP.
   *
   * Não consome o token de cooldown: a explosão é UMA instância radial, já
   * paga pelo special ao abrir — o token existe para segurar o loop de 20ms,
   * não para limitar quantos alvos o mesmo golpe pode atingir.
   */
  const strikeProjectiles = useCallback(
    (strikes: ProjectileStrike[]) => {
      if (strikes.length === 0) return;
      const multiplierById = new Map(strikes.map((s) => [s.id, s.multiplier]));
      const state = playerStateRef.current;
      // Uma resolução para a explosão inteira: o valor base é o mesmo para
      // todos os projéteis atingidos (o crítico é sorteado uma vez).
      const base = resolveHit(state, { bypassCharge: true });
      if (!base || base.damage <= 0) return;

      setProjectiles((prev) =>
        prev.flatMap((p) => {
          const multiplier = multiplierById.get(p.id);
          if (multiplier === undefined) return [p];
          const hit =
            multiplier === 1
              ? base
              : {
                  ...base,
                  damage: atLeastMinDamage(base.damage * multiplier),
                };
          const struck = applyPlayerStrike(p, {
            playerState: state,
            resolveHit: () => hit,
            spawnDamage,
            point: getProjectileCenter(p),
            onDestroyed: destroy,
          });
          return struck.hit
            ? struck.projectile
              ? [struck.projectile]
              : []
            : [p];
        }),
      );
    },
    [destroy, playerStateRef, resolveHit, setProjectiles, spawnDamage],
  );

  useEffect(() => {
    const count = projectiles.length;
    if (count === 0) return;

    const interval = setInterval(() => {
      const misses: number[] = [];
      let stick = false;

      // Esfera do Riquelme em voo (phase "fire") destrói projéteis no caminho.
      const sphere =
        playerProjectileRef?.current?.phase === "fire"
          ? playerProjectileRef.current
          : undefined;

      const next = projectiles
        .map((p) => {
          // Regra de time da batalha: projétil congelado (hitstop, Killer
          // Queen, Expansão de Domínio, O Mais Honrado) não se move, não
          // colide com o jogador e não toma dano. O id só importa para o
          // `exempt` do efeito.
          const time = getTime(timeRef.current, "projectile", p.id);
          if (time.speed === 0) return p;
          switch (p.variant) {
            case "common":
              return handleLinearProjectile(p, {
                playerX: playerXRef.current,
                playerY: playerYRef.current,
                playerState: playerStateRef.current,
                playerCharacter: playerCharacterRef.current,
                playerDirection: playerDirectionRef.current,
                npcClass: npcClassRef.current,
                sphere,
                onDestroyed: destroy,
                ...strike,
                onHit: onHitRef.current,
                onMiss: (x) => {
                  misses.push(x);
                },
                onStick: () => {
                  stick = true;
                },
                speedScale: time.speed,
              });
            case "pull":
              return handleLinearProjectile(p, {
                playerX: playerXRef.current,
                playerY: playerYRef.current,
                playerState: playerStateRef.current,
                playerCharacter: playerCharacterRef.current,
                playerDirection: playerDirectionRef.current,
                npcClass: npcClassRef.current,
                sphere,
                onDestroyed: destroy,
                ...strike,
                onHit: onHitRef.current,
                onPullPlayer: onPullPlayerRef.current,
                speedScale: time.speed,
              });
            case "cut":
              return handleCut(p, {
                npcX: npcXRef.current,
                npcY: npcYRef.current,
                onDestroyed: destroy,
              });
            case "rain":
              return handleRain(
                p,
                playerXRef.current,
                playerYRef.current,
                playerStateRef.current,
                onHitRef.current,
                destroy,
                strike,
                time.speed,
              );
            case "ground":
              return handleGroundProjectile(p, {
                playerX: playerXRef.current,
                playerY: playerYRef.current,
                playerState: playerStateRef.current,
                playerCharacter: playerCharacterRef.current,
                npcClass: npcClassRef.current,
                sphere,
                onDestroyed: destroy,
                ...strike,
                onHit: onHitRef.current,
                onBurstHit: onBurstHitRef.current,
                speedScale: time.speed,
              });
          }
        })
        .filter((p): p is Projectile => p !== null);

      if (stick) onStickRef.current?.();
      for (const x of misses) onMissRef.current?.(x);

      // Portais do lucaua: o projétil que cruza a zona reaparece no outro portal
      // (o deslocamento leva o **centro** ao destino) e o portal de saída decide
      // a nova direção. Só `common`/`pull` têm rumo próprio para obedecer —
      // `ground`, `rain` e `cut` seguem o movimento deles e só mudam de posição.
      const warp = portalWarpRef?.current;
      const moved =
        warp == null
          ? next
          : next.map((p) => {
              const center = getProjectileCenter(p);
              const dest = warp(p.id, center.x, center.y);
              if (!dest) return p;
              const exit =
                p.variant === "common" || p.variant === "pull"
                  ? getPortalExitDirection(dest.kind, p.dirX, p.dirY)
                  : null;
              return {
                ...p,
                x: p.x + (dest.x - center.x),
                y: p.y + (dest.y - center.y),
                ...(exit ? { dirX: exit.dirX, dirY: exit.dirY } : {}),
              };
            });

      setProjectiles(moved);
    }, 20);

    return () => clearInterval(interval);
  }, [
    projectiles,
    setProjectiles,
    timeRef,
    onHitRef,
    onPullPlayerRef,
    onMissRef,
    onStickRef,
    onBurstHitRef,
    playerXRef,
    playerYRef,
    playerStateRef,
    playerCharacterRef,
    playerDirectionRef,
    npcClassRef,
    npcXRef,
    npcYRef,
    playerProjectileRef,
    portalWarpRef,
    strike,
    destroy,
  ]);

  return { strikeProjectiles };
}
