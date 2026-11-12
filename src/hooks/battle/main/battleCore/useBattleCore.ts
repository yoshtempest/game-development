import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useBattleKillCounter } from "@/hooks/battle/death/useKillCounter";
import { useNpcTargeting } from "@/hooks/battle/npc/useNpcTargeting";
import { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import { LaricellVampireConstants } from "@/data/characters/laricell/laricell";
import type { BattleBarrier, NpcBlind } from "@/utils/types/battle/npcControl";
import { useGrabThrow } from "@/hooks/battle/throw/useGrabThrow";
import { useBabidiShield } from "@/hooks/battle/player/characters/babidi/useShield";
import { useYvelWeaponSwitch } from "@/hooks/battle/player/characters/yvel/useYvelWeaponSwitch";
import { useCooldownPauseTick } from "@/hooks/battle/utilities/useCooldowns";
import {
  BATTLE_LIMITS,
  BLOCK_ATTACK_PUSH_DISTANCE,
} from "@/gameRules/movement/constants";
import {
  NPC_BLOCK_HOLD_MS,
  NPC_BLOCK_MIN_PCT,
} from "@/hooks/battle/npc/blocking/useBlocking";
import { INTRO_MS } from "@/services/npc/attacks/hungryDog/state";
import { clampX } from "@/gameRules/movement/clampX";
import { applyPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import { ProjectileHpConstants } from "@/data/projectile";
import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { NpcTarget } from "@/gameRules/battle/npc/targeting";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import { VASTOLORD_KILL_EXTEND_MS } from "@/hooks/battle/player/characters/marshadow/vastolordForm/useVastolordForm";
import type { BattleCombatProps } from "./types";

/**
 * Núcleo da batalha (`useBattleCore`): a base sobre a qual o restante do
 * combate (efeitos visuais, habilidades, controles, API da cena) se monta.
 *
 * Ordem de inicialização preserva a do `useBattleCombat` original:
 *
 * ```
 * useBattleNavbar → useBattleKillCounter → useGrabThrow → useBattleSystem
 * → useNpcAI
 * ```
 *
 * A dependência circular da base é resolvida com refs: a IA é montada antes do
 * sistema de batalha existir, então os handlers de golpe (melee/ranged/burst/
 * throw/laser/…) chegam via refs que o próprio core preenche com o resultado do
 * `useBattleSystem`, e os handlers que precisam do `battle` em si são closures
 * sobre o binding, lidas de forma síncrona depois via `useLatestRef` dentro da
 * IA. Mantém a ordem atual de montagem sem reescrever o ciclo de vida.
 */
export function useBattleCore({
  setup,
  refs,
  npcType,
  isAlfa,
  training,
  obstacles,
  lootActiveRef,
  onPlayerDeathRef,
  onNpcDeathRef,
  battleManaRef,
  isPausedRef,
  isMenuOpenRef,
  isMenuOpen,
  honoredOneActiveRef,
  honoredFleeRef,
  surviveLethalHitRef,
  honoredSequence,
  honoredRegenActive,
  babidiPassiveActive = false,
  vastolordMultiplierRef,
  vastolordActive,
  transformationFrame,
  extendVastolordRef,
  cursedEnergyEnabled,
  onKokusenRef,
  onBlackFlashRef,
  onDivergentFistConsumedRef,
  triggerBlink,
  divergentFistActive,
  divergentFistRef,
  setDivergentFistActive,
  coop,
}: BattleCombatProps) {
  const {
    player,
    setPlayer,
    setMode,
    attack,
    startAbility,
    difficulty,
    playerClass,
    setPlayerState,
    lastBlockPressRef,
    lastAttackPressRef,
    battleTenacityRef,
    freezeActionsUntilRef,
    forcePunchRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    setTimeScale,
    resetTimeScale,
    timeScaleRef,
    progress,
    playerLevel,
    getEquippedInfo,
    playSound,
    npcData,
    npcLevel,
    npcStats,
    npcStatMultiplier,
    npcPhaseRef,
    setNpcPhase,
    npcArmorBonus,
    setNpcArmorBonus,
    isPhaseTransitioning,
    setIsPhaseTransitioning,
    savedPlayerHPRef,
    summons,
    setSummons,
    clearSummons,
    summonNpcRef,
    updateNpcPosition,
    summonsBleedUntilRef,
    allies,
    setAllies,
    summonAlly,
    clearAllies,
    beginCoffinSequence,
    onSummonWrapperRef,
    petId,
    petSkillDef,
    petLevel,
    petStars,
    closeInventory,
    closeNavbar,
    giveSummonRewards,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    inventoryItems,
    quests,
  } = setup;

  const { weapon: yvelWeapon, switchWeapon } = useYvelWeaponSwitch({
    character: player.character,
    timeRef: refs.timeRef,
  });

  const {
    isGrabbedRef,
    grabFlipped,
    grabFlippedRef,
    isThrown,
    setIsThrown,
    grabbedTimerRef,
    setIsGrabbed,
    onGrabPlayer,
    onThrowStart,
    onThrowPlayer,
    releasePlayer,
  } = useGrabThrow({
    setPlayer,
    npcThrowAttackRef: refs.npcThrowAttackRef,
    displacementLockedRef: honoredFleeRef,
  });

  const targeting = useNpcTargeting();

  const setModeRef = useLatestRef(setMode);
  const closeInventoryRef = useLatestRef(closeInventory);
  const closeNavbarRef = useLatestRef(closeNavbar);

  const { resetBattleNavbar } = useBattleNavbar();
  const resetBattleNavbarRef = useLatestRef(resetBattleNavbar);

  const saveDataRef = useLatestRef({
    items: inventoryItems,
    quests,
    character: player.character,
    playerClass,
  });

  const killCounter = useBattleKillCounter();
  if (!training) {
    killCounter.npcTypeRef.current = npcType;
    killCounter.npcDataRef.current = npcData;
  }

  const npcRootedUntilRef = useRef(0);

  // ── Controle de NPC da Laricell (issue #517) ─────────────────────────────
  // Moram no core porque a IA (montada aqui) lê a parede e a cegueira a cada
  // tick, e o vampirismo da Forma Vampira entra no `useBattleSystem`, também
  // montado aqui; quem escreve nelas é o `useLaricellAbilities`, no combat.
  const barrierRef = useRef<BattleBarrier | null>(null);
  const npcBlindRef = useRef<NpcBlind | null>(null);
  const [laricellVampireActive, setLaricellVampireActive] = useState(false);
  const rootedSummonsUntilRef = useRef<Record<string, number>>({});

  const [fishingNet, setFishingNet] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const fishingNetRef = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const fishingNetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fishingNetPushTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [fishingNetRemaining, setFishingNetRemaining] = useState(0);
  const fishingNetReadyAtRef = useRef(0);
  const machineGamaShieldRef = useRef(0);
  const machineGamaBreakRef = useRef<() => void>(() => {});

  useEffect(() => {
    return () => {
      if (fishingNetTimerRef.current) {
        clearTimeout(fishingNetTimerRef.current);
        fishingNetTimerRef.current = null;
      }
      if (fishingNetPushTimerRef.current) {
        clearInterval(fishingNetPushTimerRef.current);
        fishingNetPushTimerRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    fishingNetRef.current = fishingNet;
  }, [fishingNet]);

  const fishingNetCooldownTick = useCooldownPauseTick({
    readyAtRef: fishingNetReadyAtRef,
    isPausedRef,
  });

  /** +1 stack de VastolordLaser ao derrotar um inimigo com a forma ativa. */
  const addVastolordLaserChargeRef = useRef<() => void>(() => {});

  targeting.npcAiHpRef.current = npcStats.hp;
  targeting.npcAiMaxHpRef.current = npcStats.hp;

  // ── Alfa intro (hungryDog): jogador travado enquanto o alfa invoca. ──────
  const alfaIntroFiredRef = useRef(false);

  // ── Special dig do alfa: o jogador é arrastado em x e y junto ao pulo. ──
  const ALFA_DRAG_MS = 500;
  const [isDragging, setIsDragging] = useState(false);
  const dragEndAtRef = useRef(0);
  const dragHitDoneRef = useRef(false);
  const onDragPlayer = useCallback(() => {
    if (honoredFleeRef.current) return;
    dragEndAtRef.current = Date.now() + ALFA_DRAG_MS;
    dragHitDoneRef.current = false;
    setIsDragging(true);
  }, [honoredFleeRef]);
  const dragBattleRef = useRef<ReturnType<typeof useBattleSystem> | null>(null);

  // Esfera do Natsuki em voo — consumida pelo useProjectile para colisões.
  const playerProjectileRef = useRef<PlayerSpecialProjectile | null>(null);

  // Vida de projéteis NPC destrutíveis (1/3 do dano que causariam), uma por
  // natureza de dano — usa ref porque o battle (fonte de totalArmor) só existe
  // depois do useNpcAI.
  const projectileHpRef = useRef<Record<DamageKind, number>>({
    physical: ProjectileHpConstants.DEFAULT_HP,
    magical: ProjectileHpConstants.DEFAULT_HP,
    true: ProjectileHpConstants.DEFAULT_HP,
  });

  // ── Alvos do co-op ───────────────────────────────────────────────────────
  // A IA escolhe um alvo por golpe (área é a exceção, roteada à parte). A lista
  // sempre tem o jogador local; o líder acrescenta o parceiro vindo da rede.
  // `localAliveRef` é preenchido logo depois do `useBattleSystem`, mas já
  // existe aqui para a IA descartar o aggro assim que o HP local zera.
  const localAliveRef = useRef(true);
  const coopRemoteTarget = coop?.remoteTarget ?? null;
  const coopLocalPlayerId = coop?.localPlayerId;

  const npcTargets = useMemo<NpcTarget[]>(() => {
    const list: NpcTarget[] = [
      {
        id: coopLocalPlayerId ?? "local",
        x: player.x,
        y: player.y,
        state: player.state,
        direction: player.battleDirection,
        character: player.character,
        isLocal: true,
        alive: true,
      },
    ];
    if (coopRemoteTarget) list.push(coopRemoteTarget);
    return list;
  }, [
    coopLocalPlayerId,
    coopRemoteTarget,
    player.x,
    player.y,
    player.state,
    player.battleDirection,
    player.character,
  ]);

  const npc = useNpcAI({
    playerX: player.x,
    playerY: player.y,
    playerState: player.state,
    playerDirection: player.battleDirection,
    playerCharacter: player.character,
    npcClass: npcData.class,
    npcType,
    npcPhaseRef,
    targets: npcTargets,
    localAliveRef,
    npcAuthority: coop?.authoritative ?? true,
    onRemoteHit: coop?.sendNpcHit,
    onProjectileHit: (damageKind) =>
      refs.npcRangedAttackRef.current(damageKind),
    onMeleeHit: (multiplier, damageKind) => {
      if (npcType === "trueVandinha" && (npcPhaseRef.current ?? 1) === 1) {
        return;
      }
      refs.npcMeleeAttackRef.current(multiplier, damageKind);
    },
    isPaused:
      isPausedRef.current ||
      isPhaseTransitioning ||
      lootActiveRef.current ||
      babidiPassiveActive,
    onSummon: onSummonWrapperRef.current,
    onBurstHit: (pushDir: number) => refs.npcBurstAttackRef.current(pushDir),
    playerProjectileRef,
    projectileHpRef,
    spawnDamageRef: refs.spawnDamageRef,
    playerCooldownRef: refs.playerCooldown,
    playerHitDamageRef: refs.playerHitDamageRef,
    isAlfa,
    onSummonFromRight: (summonType: string) =>
      summonNpcRef.current(summonType, BATTLE_LIMITS.maxX + 600),
    onDragPlayer,
    onPullPlayer: (npcX: number) =>
      setPlayer((p) => {
        if (honoredFleeRef.current) return p;
        const direction = npcX > p.x ? 1 : -1;
        const pullToX = clampX(p.x + direction * 200);
        return {
          ...p,
          pullFromX: p.x,
          pullToX,
          pullStartTime: Date.now(),
        };
      }),
    onPushPlayer: (npcX: number) =>
      setPlayer((p) => {
        if (honoredFleeRef.current) return p;
        if (npcType === "trueVandinha") {
          const direction = npcX > p.x ? -1 : 1;
          const pushToX = clampX(p.x + direction * 100);
          window.setTimeout(() => {
            setPlayer((pp) =>
              pp.pullStartTime === 0
                ? { ...pp, state: pp.state === "blocked" ? "idle" : pp.state }
                : pp,
            );
          }, 500);
          return {
            ...p,
            state: "blocked",
            pullFromX: p.x,
            pullToX: pushToX,
            pullStartTime: Date.now(),
            pullDuration: 500,
          };
        }
        const direction = npcX > p.x ? -1 : 1;
        const pushToX = clampX(p.x + direction * 200);
        return {
          ...p,
          pullFromX: p.x,
          pullToX: pushToX,
          pullStartTime: Date.now(),
          pullDuration: 300,
        };
      }),
    onRamPushPlayer: (direction: "left" | "right", toX: number) =>
      setPlayer((p) => {
        if (p.mode !== "battle" || honoredFleeRef.current) return p;
        const x = clampX(toX);
        return { ...p, x, battleDirection: direction };
      }),
    lastBlockPressRef,
    lastAttackPressRef,
    onGroundPaperHit: () => battle.npcThrowHit(2),
    onPaperExplode: () => {},
    onArmorBuff: (x: number, y: number) => {
      playSound("shieldStack");
      setNpcArmorBonus((b) => b + 1);
      refs.spawnDamageRef.current?.(1, x, y, "armor");
    },
    onLaserHit: (npcX?: number) => {
      battle.npcFixedHit(1);
      // Empurrão contínuo e suave do laser (regra dos lasers): o jogador é
      // afastado do NPC gerador a cada tick de dano.
      if (npcX != null) {
        setPlayer((p) => {
          if (p.mode !== "battle" || honoredFleeRef.current) return p;
          const direction = npcX > p.x ? -1 : 1;
          const pushToX = clampX(p.x + direction * 5);
          return { ...p, x: pushToX };
        });
      }
    },
    onStuckPaperExplode: () => {
      battle.npcUnblockableHit(2);
      playSound("explosion");
    },
    onApplyDebuff: (status: NewPlayerStatus) => {
      setPlayer((p) => applyPlayerStatus(p, status));
    },
    obstacles,
    timeRef: refs.timeRef,
    npcStaggerRef: refs.npcStaggerRef,
    rootedUntilRef: npcRootedUntilRef,
    fishingNetRef: fishingNetRef,
    barrierRef,
    npcBlindRef,
    honoredFleeRef,
    npcHpRef: targeting.npcAiHpRef,
    npcMaxHpRef: targeting.npcAiMaxHpRef,
    npcBlockedRef: targeting.npcBlockedRef,
    onGrabPlayer,
    onThrowStart,
    onThrowPlayer,
  });

  // Segue o NPC durante o arrasto (x e y) enquanto o alfa foge.
  const npcRef = useLatestRef(npc);

  // Intro do alfa hungryDog: o jogador fica travado (movimento + ações)
  // enquanto o alfa invoca. A IA do NPC continua rodando (é quem anima).
  const alfaIntroActive =
    isAlfa && npcType === "hungryDog" && npc.ai?.hungryDog?.phase === "intro";

  useEffect(() => {
    if (!alfaIntroActive || alfaIntroFiredRef.current) return;
    alfaIntroFiredRef.current = true;
    freezeActionsUntilRef.current = Date.now() + INTRO_MS + 150;
  }, [alfaIntroActive, freezeActionsUntilRef]);

  useEffect(() => {
    if (!isDragging) return;

    const interval = setInterval(() => {
      if (isMenuOpenRef.current) return;

      if (Date.now() >= dragEndAtRef.current) {
        setIsDragging(false);
        setPlayer((p) => ({ ...p, y: p.groundY, state: "idle" }));
        return;
      }

      if (!dragHitDoneRef.current) {
        dragHitDoneRef.current = true;
        dragBattleRef.current?.npcFixedHit(1);
      }

      if (honoredFleeRef.current) {
        setIsDragging(false);
        return;
      }

      const n = npcRef.current;
      const fromX = n.x - 8;
      const toX = clampX(fromX);
      setPlayer((p) => ({
        ...p,
        x: toX,
        y: n.y + 4,
        state: "fallen",
        battleDirection: n.x >= p.x ? "right" : "left",
      }));
    }, 16);

    return () => clearInterval(interval);
  }, [isDragging, isMenuOpenRef, setPlayer, npcRef, honoredFleeRef]);

  const onCriticalPushRef = useLatestRef(() => {
    const dir = player.battleDirection === "right" ? 1 : -1;

    npc.updateNpc({
      x: clampX(npc.x + dir * BLOCK_ATTACK_PUSH_DISTANCE),
    });

    setSummons((prev) =>
      prev
        .filter((s) => !s.isDying)
        .map((s) => ({
          ...s,
          x: clampX(s.x + dir * BLOCK_ATTACK_PUSH_DISTANCE),
        })),
    );
  });

  targeting.onBeforeNpcHitRef.current = (getDamage) => {
    if (npcType !== "piupiu") return { blocked: false };
    const distanceX = Math.abs(npc.x - player.x);
    const distanceY = Math.abs(npc.y - player.y);
    if (distanceX > 50 || distanceY > 150) return { blocked: false };

    const gauge = battle.npcBlockGauge;
    const limit = battle.npcBlockLimit;
    if (limit <= 0 || gauge < limit * NPC_BLOCK_MIN_PCT) {
      return { blocked: false };
    }

    const dmg = getDamage();

    if (dmg <= gauge) {
      battle.setNpcBlockGauge((g) => Math.max(0, g - dmg));
      targeting.npcBlockedRef.current = true;
      npc.updateNpc({ state: "block" });
      refs.spawnDamageRef.current?.(0, npc.x, npc.y, "blocked");
      clearTimeout(targeting.npcBlockTimerRef.current);
      targeting.npcBlockTimerRef.current = setTimeout(() => {
        targeting.npcBlockedRef.current = false;
      }, NPC_BLOCK_HOLD_MS);
      return { blocked: true, remainingDamage: 0 };
    }

    const remaining = dmg - gauge;
    battle.setNpcBlockGauge(0);
    targeting.npcBlockedRef.current = false;
    npc.updateNpc({ state: "hit" });
    refs.spawnDamageRef.current?.(remaining, npc.x, npc.y, "npc");
    return { blocked: true, remainingDamage: remaining };
  };

  const babidiShield = useBabidiShield(player.character);

  const executePetSkillRef = useRef<() => void>(() => {});

  // Preenchido pelo useSrGuaxinimOraPunch com o multiplicador atual (escala ORA).
  const srGuaxinimOraMultiplierRef = useRef<() => number>(() => 1);

  // O gatilho de O Abençoado vive no funil de dano (useSystem/useExternal), que
  // só conhece o `surviveLethalHitRef`. Envolvemos ele para, no mesmo instante
  // em que a passiva salva o player, descartar qualquer habilidade que esteja
  // sendo PREPARADA (intro pendente) — a coreografia não pode ser sobrescrita
  // por um cast que terminaria depois dela. O `cancelSpecialIntro` real é
  // preenchido mais abaixo, junto do `useSpecialIntro`. Pelo mesmo motivo, se
  // quem salvou foi O Abençoado (`honoredFleeRef` ligado no gatilho), o
  // agarrão/arremesso/arrasto em curso é solto: todos eles reescrevem o estado
  // do player para `fallen` e cancelariam a coreografia. Enquanto a sequência
  // dura, os handlers de puxão/empurrão/investida/laser/arrasto do NPC também
  // ignoram o player (mesmo `honoredFleeRef`).
  const cancelSpecialIntroRef = useRef<() => void>(() => {});
  const honoredLethalRef = useLatestRef(() => {
    const survived = surviveLethalHitRef.current?.() ?? false;
    if (survived) cancelSpecialIntroRef.current();
    if (survived && honoredFleeRef.current) {
      releasePlayer();
      setIsDragging(false);
    }
    return survived;
  });

  const battle = useBattleSystem({
    playerX: player.x,
    playerY: player.y,
    npcX: npc.x,
    npcY: npc.y,
    playerState: player.state,
    npcLevel,
    npcClass: npcData.class,
    npcType,
    difficulty,
    onPlayerDeath: () => onPlayerDeathRef.current(),
    onNpcDeath: () => {
      if (vastolordActive) {
        extendVastolordRef.current(VASTOLORD_KILL_EXTEND_MS);
        addVastolordLaserChargeRef.current();
      }
      onNpcDeathRef.current();
    },
    timeRef: refs.timeRef,
    npcStaggerRef: refs.npcStaggerRef,
    playerCooldown: refs.playerCooldown,
    playerHitDamageRef: refs.playerHitDamageRef,
    registerHitRef: refs.registerHitRef,
    setPlayer,
    lastBlockPressRef,
    lastAttackPressRef,
    npcPhaseRef,
    machineGamaShieldRef,
    onMachineGamaBreak: () => machineGamaBreakRef.current(),
    onBeforeNpcHitRef: targeting.onBeforeNpcHitRef,
    // Os callbacks de estatística moram no bag compartilhado: as refs
    // precisam existir no primeiro render, mas quem as preenche é o
    // `useBattleCombatActions` (que sabe das stats), montado depois do core.
    onBlockRef: refs.onBlockRef,
    onDamageTakenRef: refs.onDamageTakenRef,
    onDodgeRef: refs.onDodgeRef,
    onDamageDealtRef: refs.onDamageDealtRef,
    onAttackRef: refs.onAttackRef,
    onSpecialRef: refs.onSpecialRef,
    onKokusenRef,
    onBlackFlashRef,
    onCriticalPushRef,
    srGuaxinimOraMultiplierRef,
    vastolordMultiplierRef,
    vastolordActive,
    bonusUniversalVampirism: laricellVampireActive
      ? LaricellVampireConstants.UNIVERSAL_VAMPIRISM
      : 0,
    divergentFistRef,
    onDivergentFistConsumedRef,
    petId,
    onPetSkillRef: executePetSkillRef,
    isMenuRef: isMenuOpenRef,
    isPausedRef,
    savedPlayerHP: savedPlayerHPRef.current,
    npcStatMultiplier,
    npcArmorBonus,
    npcOverride: coop?.pvp ? coop.pvpOpponent : null,
    weapon: yvelWeapon,
    surviveLethalHitRef: honoredLethalRef,
  });

  // O alvo local só existe enquanto o jogador está de pé. A IA lê esse ref a
  // cada tick para não continuar perseguindo um corpo caído no co-op.
  localAliveRef.current = battle.playerHP > 0;

  return {
    battle,
    npc,
    targeting,
    alfaIntroActive,
    machineGamaBreakRef,
    lastBlockPressRef,
    isGrabbedRef,
    grabFlipped,
    grabFlippedRef,
    isThrown,
    setIsThrown,
    grabbedTimerRef,
    setIsGrabbed,
    onGrabPlayer,
    onThrowStart,
    onThrowPlayer,
    killCounter,
    resetBattleNavbarRef,
    saveDataRef,
    npcRootedUntilRef,
    barrierRef,
    npcBlindRef,
    laricellVampireActive,
    setLaricellVampireActive,
    rootedSummonsUntilRef,
    refs,
    setModeRef,
    closeInventoryRef,
    closeNavbarRef,
    localAliveRef,
    npcTargets,
    player,
    setPlayer,
    playSound,
    attack,
    startAbility,
    difficulty,
    playerClass,
    setPlayerState,
    progress,
    playerLevel,
    getEquippedInfo,
    npcData,
    npcLevel,
    npcStats,
    npcStatMultiplier,
    npcPhaseRef,
    setNpcPhase,
    npcArmorBonus,
    setNpcArmorBonus,
    isPhaseTransitioning,
    setIsPhaseTransitioning,
    savedPlayerHPRef,
    summons,
    setSummons,
    clearSummons,
    summonNpcRef,
    updateNpcPosition,
    summonsBleedUntilRef,
    allies,
    setAllies,
    summonAlly,
    clearAllies,
    beginCoffinSequence,
    onSummonWrapperRef,
    petId,
    petSkillDef,
    petLevel,
    petStars,
    closeInventory,
    closeNavbar,
    giveSummonRewards,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    inventoryItems,
    quests,
    setFishingNet,
    setFishingNetRemaining,
    battleTenacityRef,
    freezeActionsUntilRef,
    forcePunchRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    setTimeScale,
    resetTimeScale,
    timeScaleRef,
    battleManaRef: battleManaRef,
    isPausedRef,
    isMenuOpenRef,
    isMenuOpen,
    lootActiveRef,
    onPlayerDeathRef,
    onNpcDeathRef,
    honoredOneActiveRef,
    honoredFleeRef,
    surviveLethalHitRef,
    honoredSequence,
    honoredRegenActive,
    vastolordMultiplierRef,
    vastolordActive,
    transformationFrame,
    extendVastolordRef,
    cursedEnergyEnabled: cursedEnergyEnabled,
    onKokusenRef,
    onBlackFlashRef,
    onDivergentFistConsumedRef,
    triggerBlink: triggerBlink,
    divergentFistActive,
    divergentFistRef,
    setDivergentFistActive,
    coop,
    yvelWeapon,
    switchWeapon,
    babidiShield,
    onBlockRef: refs.onBlockRef,
    onDamageTakenRef: refs.onDamageTakenRef,
    onDodgeRef: refs.onDodgeRef,
    onDamageDealtRef: refs.onDamageDealtRef,
    onAttackRef: refs.onAttackRef,
    onSpecialRef: refs.onSpecialRef,
    machineGamaShieldRef,
    executePetSkillRef,
    srGuaxinimOraMultiplierRef,
    cancelSpecialIntroRef,
    honoredLethalRef,
    onCriticalPushRef,
    fishingNet,
    fishingNetRef,
    fishingNetTimerRef,
    fishingNetPushTimerRef,
    fishingNetRemaining,
    fishingNetReadyAtRef,
    fishingNetCooldownTick,
    addVastolordLaserChargeRef,
    alfaIntroFiredRef,
    isDragging,
    setIsDragging,
    dragEndAtRef,
    dragHitDoneRef,
    onDragPlayer,
    dragBattleRef,
    playerProjectileRef,
    projectileHpRef,
  };
}
