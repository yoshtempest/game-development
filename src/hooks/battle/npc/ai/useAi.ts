import type { Props } from "./types";
import { useEffect, useState, useRef, useCallback } from "react";
import { getNpcAttack } from "@/services/npc";
import { useProjectile } from "@/hooks/battle/npc/useProjectile";
import { isParryPress } from "@/hooks/battle/npc/isParryPress";
import {
  getNpcDirection,
  getNpcState,
  applyObstacleCollision,
} from "@/gameRules/battle/npc/npcPosition";
import type { NPCBattleState } from "@/utils/types/npc/npc";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { logPlay, logStop } from "@/utils/replay/audioEventLog";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";

import {
  HONORED_ONE_FLEE_DISTANCE,
  HONORED_ONE_FLEE_STEP,
} from "@/gameRules/battle/cursedEnergy";
import { ProjectileHpConstants } from "@/data/projectile";
import { useProximityLoopSound } from "@/hooks/battle/npc/useProximityLoopSound";
import { getTime, NPC_TIME_ID } from "@/gameRules/battle/time";

import { clampX } from "@/gameRules/movement/clampX";
import {
  pickNpcTarget,
  type NpcTarget,
} from "@/gameRules/battle/npc/targeting";
import type { NpcHitIntent } from "@/hooks/battle/coop/types";
import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";

/**
 * Mesmo alvo = mesmo id e mesmas propriedades visíveis. Usado para não
 * re-renderizar o hook a cada tick quando o alvo não mudou de posição/estado.
 */
function isSameTarget(a: NpcTarget | null, b: NpcTarget | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.x === b.x &&
    a.y === b.y &&
    a.state === b.state &&
    a.direction === b.direction &&
    a.character === b.character &&
    a.isLocal === b.isLocal &&
    a.alive === b.alive
  );
}

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
  fishingNetRef,
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
  targets,
  localAliveRef,
  npcAuthority = true,
  onRemoteHit,
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

  // ── Alvo do co-op ────────────────────────────────────────────────────────
  // `targets` muda a 10–20 Hz; o alvo escolhido é guardado em state para o
  // `useProjectile` (que precisa da posição do alvo) e em ref para os
  // callbacks de golpe decidirem se o hit é local ou remoto.
  const [activeTarget, setActiveTarget] = useState<NpcTarget | null>(null);
  const targetsRef = useLatestRef(targets ?? []);
  const currentTargetRef = useRef<NpcTarget | null>(null);
  const onRemoteHitRef = useLatestRef(onRemoteHit);
  const npcAuthorityRef = useLatestRef(npcAuthority);

  // O alvo local pode cair sem a lista de `targets` ser reconstruída no mesmo
  // render; o ref de vida é a fonte mais nova para descartar o aggro.
  const getEffectiveTargets = useCallback((): NpcTarget[] => {
    const list = targetsRef.current;
    const localAlive = localAliveRef?.current;
    if (localAlive == null) return list;
    return list.map((target) =>
      target.isLocal && target.alive !== localAlive
        ? { ...target, alive: localAlive }
        : target,
    );
  }, [localAliveRef, targetsRef]);

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

  // ── Roteamento de golpes (co-op) ─────────────────────────────────────────
  // A IA é autoritativa no líder. Se o alvo selecionado é o jogador remoto, o
  // golpe vira uma intenção enviada ao cliente dono; o líder não aplica nada
  // localmente. Golpes de área são a exceção: acertam todos os vivos.
  const routeSingle = useCallback(
    (hit: Omit<NpcHitIntent, "to">) => {
      const target = currentTargetRef.current;
      if (!target || target.isLocal) return false;
      onRemoteHitRef.current?.({ ...hit, to: target.id });
      return true;
    },
    [onRemoteHitRef],
  );

  const routeArea = useCallback(
    (hit: Omit<NpcHitIntent, "to">) => {
      const list = getEffectiveTargets();
      if (list.length === 0) return true;
      let localAlive = false;
      for (const target of list) {
        if (target.isLocal) {
          localAlive = target.alive;
          continue;
        }
        if (target.alive) {
          onRemoteHitRef.current?.({ ...hit, to: target.id, area: true });
        }
      }
      return localAlive;
    },
    [getEffectiveTargets, onRemoteHitRef],
  );

  const handleMeleeHit = useCallback(
    (multiplier?: number, damageKind?: DamageKind) => {
      if (routeSingle({ source: "melee", multiplier, damageKind })) return;
      onMeleeHitRef.current?.(multiplier, damageKind);
    },
    [routeSingle, onMeleeHitRef],
  );

  const handleProjectileHit = useCallback(
    (damageKind?: DamageKind) => {
      if (routeSingle({ source: "ranged", damageKind })) return;
      onProjectileHitRef.current?.(damageKind);
    },
    [routeSingle, onProjectileHitRef],
  );

  const handlePullPlayer = useCallback(
    (x: number) => {
      if (routeSingle({ source: "pull", npcX: x })) return;
      onPullPlayerRef.current?.(x);
    },
    [routeSingle, onPullPlayerRef],
  );

  const handlePushPlayer = useCallback(
    (x: number) => {
      if (routeSingle({ source: "push", npcX: x })) return;
      onPushPlayerRef.current?.(x);
    },
    [routeSingle, onPushPlayerRef],
  );

  const handleRamPushPlayer = useCallback(
    (direction: "left" | "right", toX: number) => {
      if (routeSingle({ source: "ram", direction, toX })) return;
      onRamPushPlayerRef.current?.(direction, toX);
    },
    [routeSingle, onRamPushPlayerRef],
  );

  const handleGrabPlayer = useCallback(
    (flipped: boolean) => {
      if (routeSingle({ source: "grab", flipped })) return;
      onGrabPlayerRef.current?.(flipped);
    },
    [routeSingle, onGrabPlayerRef],
  );

  const handleThrowStart = useCallback(
    (npcX: number, direction: "left" | "right") => {
      if (routeSingle({ source: "throwStart", npcX, direction })) return;
      onThrowStartRef.current?.(npcX, direction);
    },
    [routeSingle, onThrowStartRef],
  );

  const handleThrowPlayer = useCallback(
    (multiplier: number) => {
      if (routeSingle({ source: "throw", multiplier })) return;
      onThrowPlayerRef.current?.(multiplier);
    },
    [routeSingle, onThrowPlayerRef],
  );

  const handleDragPlayer = useCallback(
    (npcX: number, npcY: number) => {
      if (routeSingle({ source: "drag", npcX, npcY, amount: 1 })) return;
      onDragPlayerRef.current?.(npcX, npcY);
    },
    [routeSingle, onDragPlayerRef],
  );

  const handleBurstHit = useCallback(
    (pushDir: number) => {
      if (!routeArea({ source: "burst", pushDir })) return;
      onBurstHitRef.current?.(pushDir);
    },
    [routeArea, onBurstHitRef],
  );

  const handleGroundPaperHit = useCallback(() => {
    if (!routeArea({ source: "throw", multiplier: 2 })) return;
    onGroundPaperHitRef.current?.();
  }, [routeArea, onGroundPaperHitRef]);

  const handleStuckPaperExplode = useCallback(() => {
    if (!routeArea({ source: "unblockable", amount: 2 })) return;
    onStuckPaperExplodeRef.current?.();
  }, [routeArea, onStuckPaperExplodeRef]);

  const handleLaserHit = useCallback(
    (npcX?: number) => {
      if (!routeArea({ source: "laser", amount: 1, npcX })) return;
      onLaserHitRef.current?.(npcX);
    },
    [routeArea, onLaserHitRef],
  );

  const handleApplyDebuff = useCallback(
    (status: NewPlayerStatus) => {
      if (routeSingle({ source: "status", status })) return;
      onApplyDebuffRef.current?.(status);
    },
    [routeSingle, onApplyDebuffRef],
  );

  const { update: updateProximitySound } = useProximityLoopSound(
    npcTypeRef,
    playerXRef,
    playerYRef,
    playSound,
    stopSound,
  );

  // O projétil persegue o alvo escolhido pela IA, não necessariamente o
  // jogador local. `enabled` desliga a simulação no guest.
  const projectileTarget = activeTarget;
  const { strikeProjectiles } = useProjectile(
    projectiles,
    setProjectiles,
    projectileTarget?.x ?? playerX,
    projectileTarget?.y ?? playerY,
    projectileTarget?.state ?? playerState,
    projectileTarget?.direction ?? playerDirection,
    npc.x,
    npc.y,
    (damageKind, status) => {
      if (npcTypeRef.current === "vandinhaFragment") {
        playSound("breakDish");
        logPlay("breakDish");
      }
      if (npcTypeRef.current === "maurao") {
        playSound("knifeCut");
        logPlay("knifeCut");
      }
      handleProjectileHit(damageKind);
      if (status) handleApplyDebuff(status);
    },
    timeRef,
    handlePullPlayer,
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
    projectileTarget?.character ?? playerCharacter,
    npcClass,
    handleBurstHit,
    playerProjectileRef,
    onProjectileDestroyed,
    spawnDamageRef,
    playerCooldownRef,
    playerHitDamageRef,
    npcAuthority,
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

      // ── Se não há autoridade (guest do co-op), NPC não toma decisões.
      // O guest apenas espelha o NPC do líder via snapshot.
      if (!npcAuthorityRef.current) {
        // Apenas atualiza posição baseada no snapshot do líder, sem IA.
        return;
      }

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

      // ── Escolha do alvo ─────────────────────────────────────────────────
      // Com dois jogadores, o NPC persegue o mais próximo (com histerese). O
      // estado escolhido alimenta o projétil e os wrappers de golpe; a ref é
      // lida de forma síncrona no mesmo tick.
      //
      // Preso pela fishingNet, o NPC ataca a rede (efeito local de quem
      // lançou): o golpe continua local para não ser roteado ao parceiro.
      const net = fishingNetRef?.current ?? null;
      const caught = (rootedUntilRef?.current ?? 0) > Date.now() && !!net;
      const candidates = getEffectiveTargets();
      const localTarget = candidates.find((target) => target.isLocal) ?? null;
      const selected = caught
        ? localTarget
        : candidates.length > 0
          ? pickNpcTarget(n.x, candidates, currentTargetRef.current?.id ?? null)
          : null;
      currentTargetRef.current = selected;
      setActiveTarget((previous) =>
        isSameTarget(previous, selected) ? previous : selected,
      );

      const attack = getNpcAttack(npcTypeRef.current);

      const targetX =
        caught && net ? net.x : (selected?.x ?? playerXRef.current);
      const targetY =
        caught && net ? net.y : (selected?.y ?? playerYRef.current);
      const targetState =
        caught && net
          ? playerStateRef.current
          : (selected?.state ?? playerStateRef.current);
      const targetDirection =
        caught && net
          ? playerDirectionRef.current
          : (selected?.direction ?? playerDirectionRef.current);

      // Snapshot antes do `execute`: os ataques mutam `state`/`ai` no próprio
      // objeto, então a comparação do commit precisa dos valores originais.
      const animBase: NPCBattleState = { ...n };

      const result = attack.execute({
        npc: n,
        playerX: targetX,
        playerY: targetY,
        playerState: targetState,
        playerDirection: targetDirection,
        targetX,
        targetY,
        npcPhase: npcPhaseRef.current,
        projectile: projectileRef.current,
        setProjectile,
        lastAttackRef,
        onProjectileHit: handleProjectileHit,
        onMeleeHit: handleMeleeHit,
        setForceIdle,
        onSummon: onSummonRef.current,
        onPullPlayer: handlePullPlayer,
        isAlfa: isAlfaRef.current,
        onSummonFromRight: (npcType) => onSummonFromRightRef.current?.(npcType),
        onDragPlayer: handleDragPlayer,
        summonTimerRef,
        playSound: loggedPlaySound,
        npcHp: npcHpRef?.current ?? 0,
        npcMaxHp: npcMaxHpRef?.current ?? 1,
        onGrabPlayer: handleGrabPlayer,
        onThrowStart: handleThrowStart,
        onThrowPlayer: handleThrowPlayer,
        onPushPlayer: handlePushPlayer,
        onRamPushPlayer: handleRamPushPlayer,
        isPlayerParrying: () =>
          isParryPress(lastBlockPressRef, lastAttackPressRef),
        onGroundPaperHit: handleGroundPaperHit,
        onPaperExplode: onPaperExplodeRef.current,
        onArmorBuff: onArmorBuffRef.current,
        onLaserHit: handleLaserHit,
        onStuckPaperExplode: handleStuckPaperExplode,
        onApplyDebuff: handleApplyDebuff,
      });

      const rooted = (rootedUntilRef?.current ?? 0) > Date.now();
      // Regra de time: o `execute` de cada NPC devolve a posição final do
      // tick. Escalar o delta aqui (em vez de editar os 20 `chasePlayer`)
      // faz o slow-movement valer para todo comportamento — perseguir,
      // dash, investida — sem que cada um precise saber da regra.
      const scaledX = n.x + (result.x - n.x) * npcTime.speed;
      const nextX = rooted ? n.x : scaledX;
      const nextY = result.y ?? n.y;
      const direction = result.direction ?? getNpcDirection(nextX, targetX);
      const distanceX = Math.abs(n.x - targetX);

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
    fishingNetRef,
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
    onSummonRef,
    isAlfaRef,
    onSummonFromRightRef,
    lastBlockPressRef,
    lastAttackPressRef,
    onPaperExplodeRef,
    onArmorBuffRef,
    playerXRef,
    playerYRef,
    playerStateRef,
    playerDirectionRef,
    projectileRef,
    setProjectile,
    npcAuthorityRef,
    currentTargetRef,
    getEffectiveTargets,
    handleProjectileHit,
    handleMeleeHit,
    handlePullPlayer,
    handlePushPlayer,
    handleRamPushPlayer,
    handleGrabPlayer,
    handleThrowStart,
    handleThrowPlayer,
    handleDragPlayer,
    handleBurstHit,
    handleGroundPaperHit,
    handleStuckPaperExplode,
    handleLaserHit,
    handleApplyDebuff,
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
