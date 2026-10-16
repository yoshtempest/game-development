import { useEffect, useState, useRef, useCallback } from "react";
import { getNpcAttack } from "@/services/npc";
import { useProjectile } from "./useProjectile";
import { isParryPress } from "@/hooks/battle/npc/isParryPress";
import {
  getNpcDirection,
  getNpcState,
  applyObstacleCollision,
} from "@/gameRules/battle/npc/npcPosition";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { logPlay, logStop } from "@/utils/replay/audioEventLog";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";

import {
  HONORED_ONE_FLEE_DISTANCE,
  HONORED_ONE_FLEE_STEP,
} from "@/gameRules/battle/cursedEnergy";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { ProjectileHitDamageFn } from "@/utils/types/battle/projectileHit";
import { ProjectileHpConstants } from "@/data/projectile";
import { useProximityLoopSound } from "./useProximityLoopSound";
import { getTime, NPC_TIME_ID, type TimeEffect } from "@/gameRules/battle/time";

import { clampX } from "@/gameRules/movement/clampX";
import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { LucauaPortalWarpFn } from "@/utils/types/character/lucaua/lucaua";
type Props = {
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerDirection: Direction;
  playerCharacter: string;
  npcClass: NPCClass;
  /** Projétil acertou: o `Projectile.damageType` diz a natureza do dano. */
  onProjectileHit: (damageKind?: DamageKind) => void;
  /** Soco acertou: o segundo argumento diz a natureza do dano. */
  onMeleeHit: (multiplier?: number, damageKind?: DamageKind) => void;
  isPaused?: boolean;
  npcType: string;
  npcPhaseRef: React.RefObject<number>;
  onSummon?: (npcType: string) => void;
  onPullPlayer?: (x: number) => void;
  isAlfa?: boolean;
  onSummonFromRight?: (npcType: string) => void;
  onDragPlayer?: (npcX: number, npcY: number) => void;
  obstacles?: BattleObstacle[];
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  rootedUntilRef?: React.RefObject<number>;
  honoredFleeRef?: React.RefObject<boolean>;
  npcHpRef?: React.RefObject<number>;
  npcMaxHpRef?: React.RefObject<number>;
  npcBlockedRef?: React.RefObject<boolean>;
  onGrabPlayer?: (flipped: boolean) => void;
  onThrowStart?: (npcX: number, npcDirection: "left" | "right") => void;
  onThrowPlayer?: (damageMultiplier: number) => void;
  onPushPlayer?: (npcX: number) => void;
  onRamPushPlayer?: (direction: "left" | "right", toX: number) => void;
  lastBlockPressRef?: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onGroundPaperHit?: () => void;
  onPaperExplode?: () => void;
  onArmorBuff?: (x: number, y: number) => void;
  onLaserHit?: () => void;
  onProjectileMiss?: (x: number) => void;
  onStuckPaperExplode?: () => void;
  onApplyDebuff?: (status: NewPlayerStatus) => void;
  /** Hit da burst do hungryKing (fase 2): 10% do dano base + push de 50px. */
  onBurstHit?: (pushDir: number) => void;
  /** Esfera do Riquelme no estado atual (para colisão com projéteis inimigos). */
  playerProjectileRef?: React.RefObject<PlayerSpecialProjectile | null>;
  /** Vida dos projéteis destrutíveis, indexada pela natureza do seu dano. */
  projectileHpRef?: React.RefObject<Record<DamageKind, number>>;
  /** Damage numbers do jogador acertando projéteis inimigos. */
  spawnDamageRef?: React.RefObject<SpawnDamageFn>;
  /** Token de 1 instância de dano por golpe — projéteis só levam 1 por ataque. */
  playerCooldownRef?: React.RefObject<boolean>;
  /** Dano real do golpe ativo (básico ou special) aplicado nos projéteis. */
  playerHitDamageRef?: React.RefObject<ProjectileHitDamageFn>;
  /** Portais do lucaua: faz o projétil do NPC atravessar de um portal ao outro. */
  portalWarpRef?: React.RefObject<LucauaPortalWarpFn | null>;
  /** Timestamp até onde os projéteis ficam congelados (Killer Queen). */
};

export function useNpcAI({
  playerX,
  playerY,
  playerState,
  playerDirection,
  playerCharacter,
  npcClass,
  onMeleeHit,
  onProjectileHit,
  isPaused,
  npcType,
  npcPhaseRef,
  onSummon,
  onPullPlayer,
  isAlfa,
  onSummonFromRight,
  onDragPlayer,
  obstacles,
  timeRef,
  npcStaggerRef,
  rootedUntilRef,
  honoredFleeRef,
  npcHpRef,
  npcMaxHpRef,
  npcBlockedRef,
  onGrabPlayer,
  onThrowStart,
  onThrowPlayer,
  onPushPlayer,
  onRamPushPlayer,
  lastBlockPressRef,
  lastAttackPressRef,
  onGroundPaperHit,
  onPaperExplode,
  onArmorBuff,
  onLaserHit,
  onProjectileMiss,
  onStuckPaperExplode,
  onApplyDebuff,
  onBurstHit,
  playerProjectileRef,
  projectileHpRef,
  spawnDamageRef,
  playerCooldownRef,
  playerHitDamageRef,
  portalWarpRef,
}: Props) {
  const [npc, setNpc] = useState<NPCBattleState>({
    x: BATTLE_SPAWN.npc.x,
    y: BATTLE_SPAWN.npc.y,
    state: "walk",
    direction: "left",
  });

  const npcRef = useLatestRef(npc);

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [forceIdle, setForceIdle] = useState(false);

  const activeProjectile = projectiles[0] ?? null;
  const projectileRef = useLatestRef(activeProjectile);
  const setProjectile = useCallback(
    (p: Projectile | null) => {
      if (p == null) {
        setProjectiles([]);
        return;
      }
      // A vida sai da natureza do projétil: um disparo mágico não custa o
      // mesmo número de golpes que um físico contra a mesma armadura.
      const hp =
        projectileHpRef?.current?.[p.damageType ?? "physical"] ??
        ProjectileHpConstants.DEFAULT_HP;
      setProjectiles((prev) => [...prev, { ...p, hp, maxHp: hp }]);
    },
    [projectileHpRef],
  );
  const playerXRef = useLatestRef(playerX);
  const playerYRef = useLatestRef(playerY);
  const playerStateRef = useLatestRef(playerState);
  const playerDirectionRef = useLatestRef(playerDirection);
  const forceIdleRef = useLatestRef(forceIdle);
  const isPausedRef = useLatestRef(isPaused);
  const npcTypeRef = useLatestRef(npcType);
  const onProjectileHitRef = useLatestRef(onProjectileHit);
  const onMeleeHitRef = useLatestRef(onMeleeHit);
  const onSummonRef = useLatestRef(onSummon);
  const onPullPlayerRef = useLatestRef(onPullPlayer);
  const isAlfaRef = useLatestRef(isAlfa);
  const onSummonFromRightRef = useLatestRef(onSummonFromRight);
  const onDragPlayerRef = useLatestRef(onDragPlayer);
  const lastAttackRef = useRef(0);
  const summonTimerRef = useRef(0);
  const obstaclesRef = useLatestRef(obstacles ?? []);

  const { playSound, stopSound } = useSoundEffects();
  const loggedPlaySound = useCallback(
    (sound: Parameters<typeof playSound>[0], loop?: boolean) => {
      logPlay(sound, loop);
      playSound(sound, loop);
    },
    [playSound],
  );
  const onGrabPlayerRef = useLatestRef(onGrabPlayer);
  const onThrowStartRef = useLatestRef(onThrowStart);
  const onThrowPlayerRef = useLatestRef(onThrowPlayer);
  const onPushPlayerRef = useLatestRef(onPushPlayer);
  const onRamPushPlayerRef = useLatestRef(onRamPushPlayer);

  const onProjectileDestroyed = useCallback(() => {
    playSound("smash");
    logPlay("smash");
  }, [playSound]);
  const onGroundPaperHitRef = useLatestRef(onGroundPaperHit);
  const onPaperExplodeRef = useLatestRef(onPaperExplode);
  const onArmorBuffRef = useLatestRef(onArmorBuff);
  const onLaserHitRef = useLatestRef(onLaserHit);
  const onProjectileMissRef = useLatestRef(onProjectileMiss);
  const onStuckPaperExplodeRef = useLatestRef(onStuckPaperExplode);
  const onApplyDebuffRef = useLatestRef(onApplyDebuff);
  const onBurstHitRef = useLatestRef(onBurstHit);

  const { update: updateProximitySound } = useProximityLoopSound(
    npcTypeRef,
    playerXRef,
    playerYRef,
    playSound,
    stopSound,
  );

  const { strikeProjectiles } = useProjectile(
    projectiles,
    setProjectiles,
    playerX,
    playerY,
    playerState,
    playerDirection,
    npc.x,
    npc.y,
    (damageKind) => {
      if (npcTypeRef.current === "vandinhaFragment") {
        playSound("breakDish");
        logPlay("breakDish");
      }
      if (npcTypeRef.current === "maurao") {
        playSound("knifeCut");
        logPlay("knifeCut");
      }
      onProjectileHit(damageKind);
    },
    timeRef,
    onPullPlayer,
    (x: number) => {
      const maugrelo = npcRef.current.ai?.maugrelo;
      if (!maugrelo) return;
      if (maugrelo.landedPapers.length >= 3) return;
      maugrelo.landedPapers.push({
        id: maugrelo.paperIdCounter++,
        x,
        y: 535,
        sprite: "paper",
        createdAt: Date.now(),
      });
      onProjectileMissRef.current?.(x);
    },
    () => {
      const maugrelo = npcRef.current.ai?.maugrelo;
      if (!maugrelo) return;
      if (maugrelo.stuckPapers.length >= 3) return;
      maugrelo.stuckPapers.push({
        id: maugrelo.paperIdCounter++,
        stuckAt: Date.now(),
      });
      playSound("paperPreExplode");
      logPlay("paperPreExplode");
    },
    playerCharacter,
    npcClass,
    (pushDir: number) => onBurstHitRef.current?.(pushDir),
    playerProjectileRef,
    onProjectileDestroyed,
    spawnDamageRef,
    playerCooldownRef,
    playerHitDamageRef,
    portalWarpRef,
  );

  const resetNpc = (stateOverride?: NPCBattleState["state"]) => {
    setNpc({
      x: BATTLE_SPAWN.npc.x,
      y: BATTLE_SPAWN.npc.y,
      state: stateOverride ?? "walk",
      direction: "left",
      hidden: false,
    });

    setProjectile(null);
    lastAttackRef.current = 0;
  };

  useEffect(() => {
    // O `execute` dos ataques tem efeitos colaterais (som, projéteis, hits) e
    // muta `state`/`ai` no próprio objeto do NPC. Rodar isso dentro do updater
    // faria o React reexecutar os efeitos duas vezes em StrictMode; o tick
    // inteiro roda aqui fora, contra o snapshot da ref, e o commit no fim
    // devolve o mesmo objeto quando nada animou — sem isso a batalha
    // re-renderiza a 50 Hz mesmo com o NPC parado.
    const commit = (
      base: NPCBattleState,
      next: NPCBattleState,
      force?: boolean,
    ) => {
      if (
        !force &&
        next.x === base.x &&
        next.y === base.y &&
        next.direction === base.direction &&
        next.state === base.state &&
        next.hidden === base.hidden
      ) {
        return;
      }
      setNpc(next);
    };

    const interval = setInterval(() => {
      const n = npcRef.current;

      // Passiva "O Abençoado": inimigos próximos recuam até ficarem a
      // HONORED_ONE_FLEE_DISTANCE de distância em x (roda mesmo com o AI
      // pausado/hitstop, já que a batalha está congelada).
      if (honoredFleeRef?.current) {
        const distanceX = Math.abs(n.x - playerXRef.current);
        if (distanceX < HONORED_ONE_FLEE_DISTANCE) {
          const step = Math.min(
            HONORED_ONE_FLEE_DISTANCE - distanceX,
            HONORED_ONE_FLEE_STEP,
          );
          const awayDir = n.x >= playerXRef.current ? 1 : -1;
          const nextX = clampX(n.x + awayDir * step);
          const collision = applyObstacleCollision(
            n.x,
            n.y,
            nextX,
            n.y,
            obstaclesRef.current,
          );
          commit(n, {
            ...n,
            x: clampX(collision.x),
            y: collision.y,
            direction: getNpcDirection(nextX, playerXRef.current),
            state: n.state === "block" ? "block" : "walk",
          });
        }
        return;
      }

      if (isPausedRef.current) return;
      const npcTime = getTime(timeRef.current, "npc", NPC_TIME_ID);
      if (npcTime.speed === 0) return;

      if (npcBlockedRef?.current) {
        commit(n, { ...n, state: "block" });
        return;
      }

      if (npcStaggerRef.current > Date.now()) {
        commit(n, {
          ...n,
          direction: getNpcDirection(n.x, playerXRef.current),
        });
        return;
      }

      const attack = getNpcAttack(npcTypeRef.current);

      const targetX = playerXRef.current;
      const targetY = playerYRef.current;

      // Snapshot antes do `execute`: os ataques mutam `state`/`ai` no próprio
      // objeto, então a comparação do commit precisa dos valores originais.
      const animBase: NPCBattleState = { ...n };

      const result = attack.execute({
        npc: n,
        playerX: playerXRef.current,
        playerY: playerYRef.current,
        playerState: playerStateRef.current,
        playerDirection: playerDirectionRef.current,
        targetX,
        targetY,
        npcPhase: npcPhaseRef.current,
        projectile: projectileRef.current,
        setProjectile,
        lastAttackRef,
        onProjectileHit: onProjectileHitRef.current,
        onMeleeHit: onMeleeHitRef.current,
        setForceIdle,
        onSummon: onSummonRef.current,
        onPullPlayer: onPullPlayerRef.current,
        isAlfa: isAlfaRef.current,
        onSummonFromRight: (npcType) => onSummonFromRightRef.current?.(npcType),
        onDragPlayer: (npcX, npcY) => onDragPlayerRef.current?.(npcX, npcY),
        summonTimerRef,
        playSound: loggedPlaySound,
        npcHp: npcHpRef?.current ?? 0,
        npcMaxHp: npcMaxHpRef?.current ?? 1,
        onGrabPlayer: (flipped) => onGrabPlayerRef.current?.(flipped),
        onThrowStart: (x, d) => onThrowStartRef.current?.(x, d),
        onThrowPlayer: (mult) => onThrowPlayerRef.current?.(mult),
        onPushPlayer: (x) => onPushPlayerRef.current?.(x),
        onRamPushPlayer: (direction, toX) =>
          onRamPushPlayerRef.current?.(direction, toX),
        isPlayerParrying: () =>
          isParryPress(lastBlockPressRef, lastAttackPressRef),
        onGroundPaperHit: onGroundPaperHitRef.current,
        onPaperExplode: onPaperExplodeRef.current,
        onArmorBuff: onArmorBuffRef.current,
        onLaserHit: onLaserHitRef.current,
        onStuckPaperExplode: onStuckPaperExplodeRef.current,
        onApplyDebuff: onApplyDebuffRef.current,
      });

      const rooted = (rootedUntilRef?.current ?? 0) > Date.now();
      // Regra de time: o `execute` de cada NPC devolve a posição final do
      // tick. Escalar o delta aqui (em vez de editar os 20 `chasePlayer`)
      // faz o slow-movement valer para todo comportamento — perseguir,
      // dash, investida — sem que cada um precise saber da regra.
      const scaledX = n.x + (result.x - n.x) * npcTime.speed;
      const nextX = rooted ? n.x : scaledX;
      const nextY = result.y ?? n.y;
      const direction =
        result.direction ?? getNpcDirection(nextX, playerXRef.current);
      const distanceX = Math.abs(n.x - playerXRef.current);

      updateProximitySound(n.x, n.y);

      const collision = applyObstacleCollision(
        n.x,
        n.y,
        nextX,
        nextY,
        obstaclesRef.current,
      );

      const next: NPCBattleState = {
        ...n,
        x: clampX(collision.x),
        y: collision.y,
        direction,
        hidden: result.hidden ?? n.hidden,
        state: result.state ?? getNpcState(distanceX, forceIdleRef.current),
      };

      // `ai` é uma bolsa mutável em place (papéis do maugrelo, fases…):
      // sem re-render os arrays derivados ficariam defasados. NPCs com `ai`
      // seguem sempre commitando; os demais só re-renderizam quando o tick
      // mudou algo animado.
      commit(animBase, next, n.ai != null);
    }, 20);

    return () => {
      clearInterval(interval);
      stopSound("jhowsimarVemCa");
      logStop("jhowsimarVemCa");
    };
  }, [
    timeRef,
    npcStaggerRef,
    rootedUntilRef,
    honoredFleeRef,
    npcPhaseRef,
    npcBlockedRef,
    npcHpRef,
    npcMaxHpRef,
    playSound,
    loggedPlaySound,
    stopSound,
    updateProximitySound,
    forceIdleRef,
    isPausedRef,
    npcTypeRef,
    npcRef,
    obstaclesRef,
    onGrabPlayerRef,
    onMeleeHitRef,
    onProjectileHitRef,
    onPullPlayerRef,
    onSummonRef,
    isAlfaRef,
    onSummonFromRightRef,
    onDragPlayerRef,
    onThrowPlayerRef,
    onThrowStartRef,
    onPushPlayerRef,
    onRamPushPlayerRef,
    lastBlockPressRef,
    lastAttackPressRef,
    onGroundPaperHitRef,
    onPaperExplodeRef,
    onArmorBuffRef,
    onLaserHitRef,
    onStuckPaperExplodeRef,
    onApplyDebuffRef,
    playerXRef,
    playerYRef,
    playerStateRef,
    playerDirectionRef,
    projectileRef,
    setProjectile,
  ]);

  const updateNpc = (partial: Partial<NPCBattleState>) => {
    setNpc((n) => ({
      ...n,
      ...partial,
      x: partial.x != null ? clampX(partial.x) : n.x,
    }));
  };

  const groundPapers = [
    ...(npc.ai?.maugrelo?.groundPapers ?? []),
    ...(npc.ai?.maugrelo?.landedPapers ?? []),
  ];
  const stuckPapers = npc.ai?.maugrelo?.stuckPapers ?? [];
  const flyingPaper = npc.ai?.maugrelo?.flyingPaper ?? null;
  const laser = npc.ai?.maugrelo?.laser ?? null;

  return {
    ...npc,
    projectile: activeProjectile,
    projectiles,
    groundPapers,
    stuckPapers,
    flyingPaper,
    laser,
    resetNpc,
    updateNpc,
    setNpc,
    setProjectiles,
    strikeProjectiles,
  };
}
