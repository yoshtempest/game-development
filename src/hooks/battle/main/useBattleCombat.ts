import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGrabThrow } from "@/hooks/battle/throw/useGrabThrow";
import { useThrowAnimation } from "@/hooks/battle/throw/useThrowAnimation";
import { useSpecialIntro } from "@/hooks/battle/modals/useSpecialIntro";
import { useNpcAI } from "@/hooks/battle/npc/useAi";
import { useBattleSystem } from "@/hooks/battle/main/useSystem";
import { useNpcTargeting } from "@/hooks/battle/npc/useNpcTargeting";
import { usePlayerBattleActions } from "@/hooks/battle/player/usePlayerActions";
import { useLucauaEnergyAttack } from "@/hooks/battle/player/characters/lucaua/useLucauaEnergyAttack";
import { useLucauaShield } from "@/hooks/battle/player/characters/lucaua/useLucauaShield";
import { useSummonAI } from "@/hooks/battle/summon/useAi";
import { useAllyAI } from "@/hooks/battle/summon/useAllyAI";
import { useBattleControls } from "@/hooks/battle/useControls";
import { useComboSystem } from "@/hooks/battle/effects/useComboSystem";
import { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import { useBattleKillCounter } from "@/hooks/battle/death/useKillCounter";
import { useChargeAttack } from "@/hooks/battle/charge/useAttack";
import { usePhaseTransition } from "@/hooks/battle/death/usePhaseTransition";
import { usePlayerSpecialProjectile } from "@/hooks/battle/player/usePlayerSpecialProjectile";
import { useLucasWeaponSwitch } from "@/hooks/battle/player/characters/yvel/useLucasWeaponSwitch";
import { useBattleSync } from "@/hooks/battle/useSync";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useStatCallbacks } from "@/hooks/battle/effects/useStatCallbacks";
import { useActiveSkills } from "@/hooks/battle/utilities/useActiveSkills";
import { useStatusDots } from "@/hooks/battle/effects/useStatusDots";
import { useTrainingEffects } from "@/hooks/battle/effects/useTrainingEffects";
import { useArturBattle } from "@/hooks/battle/player/characters/srGuaxinim/useArturBattle";
import { useEmanuelClone } from "@/hooks/battle/player/characters/ematron/useEmanuelClone";
import { useEmanuelKiCharge } from "@/hooks/battle/player/characters/ematron/useEmanuelKiCharge";
import { useEmanuelGenkiDama } from "@/hooks/battle/player/characters/ematron/useEmanuelGenkiDama";
import { useVastolordLaser } from "@/hooks/battle/player/characters/marshadow/useVastolordLaser";
import { useGranReyCero } from "@/hooks/battle/player/characters/marshadow/useGranReyCero";
import { useRiquelmeSpheres } from "@/hooks/battle/player/characters/riquelme/useRiquelmeSpheres";
import { useRiquelmeDomainExpansion } from "@/hooks/battle/player/characters/riquelme/useRiquelmeDomainExpansion";
import type { AtomicBoomPayload } from "@/utils/types/battle/atomic";
import {
  useAtomic,
  ATOMIC_TARGET_MULTIPLIER,
  ATOMIC_AREA_MULTIPLIER,
} from "@/hooks/battle/player/characters/marshadow/useAtomic";
import { useDomainExpansion } from "@/hooks/battle/player/characters/marshadow/useDomainExpansion";
import {
  DOMAIN_BURST_MAIN_MULTIPLIER,
  DOMAIN_BURST_SUMMON_MULTIPLIER,
  useDomainExpansionBurst,
} from "@/hooks/battle/utilities/useDomainExpansionBurst";
import {
  VASTOLORD_DAMAGE_EXTEND_MS,
  VASTOLORD_DAMAGE_EXTEND_RATIO,
  VASTOLORD_KILL_EXTEND_MS,
} from "@/hooks/battle/player/characters/marshadow/useVastolordForm";
import { getAbilityDamageType } from "@/data/characters/abilities";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import type { DamageKind } from "@/utils/types/battle/damageKind";
import { combatService } from "@/services/combat";
import { getProjectileDestructionHpByKind } from "@/gameRules/npc/projectile/projectileHp";
import { ProjectileHpConstants } from "@/data/projectile";
import {
  NPC_BLOCK_HOLD_MS,
  NPC_BLOCK_MIN_PCT,
} from "@/hooks/battle/npc/useBlocking";
import { damageSummon } from "@/gameRules/battle/damageSummon";
import { gainAbilityCharge } from "@/gameRules/battle/special";
import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import {
  getWeaponEnchantment,
  rollEnchantmentProc,
} from "@/gameRules/battle/equipment";
import {
  ENCHANTMENT_DURATION_MS,
  type Enchantment,
} from "@/data/equipment/enchantments";
import { CHARGE_ATTACK_MIN_LEVEL } from "@/data/battle/charge";
import { KILLER_QUEEN_COOLDOWN_MS } from "@/data/characters/artur/srGuaxinim";
import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/larissa/larissa";
import { LUCAS_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";
import { cursedEnergyFromDamage } from "@/gameRules/battle/cursedEnergy";
import { PET_ROOT_DURATION_MS } from "@/data/characters/pets/petSkills";
import { TWO_HUNDRED_MS } from "@/data/ms";
import { runPetSkill } from "@/gameRules/battle/petSkill/petSkill";
import { applyPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import {
  BATTLE_LIMITS,
  BLOCK_ATTACK_PUSH_DISTANCE,
} from "@/gameRules/movement/constants";
import { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import { INTRO_MS } from "@/services/npc/attacks/hungryDog/state";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import { clampX } from "@/gameRules/movement/clampX";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import type { LucauaTarget } from "@/utils/types/character/lucaua";

type Props = {
  setup: ReturnType<typeof useBattleStageSetup>;
  refs: ReturnType<typeof useBattleRefs>;
  npcType: string;
  isAlfa: boolean;
  training: boolean;
  obstacles?: BattleObstacle[];
  PLAYER_SIZE: number;
  lootActiveRef: RefObject<boolean>;
  onPlayerDeathRef: RefObject<() => void>;
  onNpcDeathRef: RefObject<() => void>;
  battleManaRef: RefObject<BattleManaApi | null>;
  isPausedRef: RefObject<boolean>;
  isMenuOpenRef: RefObject<boolean>;
  honoredOneActiveRef: RefObject<boolean>;
  honoredFleeRef: RefObject<boolean>;
  surviveLethalHitRef: RefObject<() => boolean>;
  honoredRegenActive: boolean;
  vastolordMultiplierRef: RefObject<() => number>;
  vastolordActive: boolean;
  /** Aumenta a duração restante da Forma Vastolord (passiva do marcelo). */
  extendVastolordRef: RefObject<(ms: number) => void>;
  cursedEnergyEnabled: boolean;
  onKokusenRef: RefObject<() => void>;
  onBlackFlashRef: RefObject<() => void>;
  onDivergentFistConsumedRef: RefObject<() => void>;
  triggerBlink: ReturnType<typeof useBlinkAnimation>["triggerBlink"];
  divergentFistActive: boolean;
  divergentFistRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useBattleCombat({
  setup,
  refs,
  npcType,
  isAlfa,
  training,
  obstacles,
  PLAYER_SIZE,
  lootActiveRef,
  onPlayerDeathRef,
  onNpcDeathRef,
  battleManaRef,
  isPausedRef,
  isMenuOpenRef,
  honoredOneActiveRef,
  honoredFleeRef,
  surviveLethalHitRef,
  honoredRegenActive,
  vastolordMultiplierRef,
  vastolordActive,
  extendVastolordRef,
  cursedEnergyEnabled,
  onKokusenRef,
  onBlackFlashRef,
  onDivergentFistConsumedRef,
  triggerBlink,
  divergentFistActive,
  divergentFistRef,
  setDivergentFistActive,
}: Props) {
  const {
    player,
    setPlayer,
    setMode,
    attack,
    special,
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
    emanuelComboMultiplierRef,
    emanuelComboActiveRef,
    emanuelComboAirActiveRef,
    emanuelComboStepIndexRef,
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

  const { weapon: lucasWeapon, switchWeapon } = useLucasWeaponSwitch({
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
  } = useGrabThrow({
    setPlayer,
    npcThrowAttackRef: refs.npcThrowAttackRef,
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
  const rootedSummonsUntilRef = useRef<Record<string, number>>({});
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
    dragEndAtRef.current = Date.now() + ALFA_DRAG_MS;
    dragHitDoneRef.current = false;
    setIsDragging(true);
  }, []);
  const dragBattleRef = useRef<ReturnType<typeof useBattleSystem> | null>(null);

  // Esfera do Riquelme em voo — consumida pelo useProjectile para colisões.
  const playerProjectileRef = useRef<PlayerSpecialProjectile | null>(null);

  // Vida de projéteis NPC destrutíveis (1/3 do dano que causariam), uma por
  // natureza de dano — usa ref porque o battle (fonte de totalArmor) só existe
  // depois do useNpcAI.
  const projectileHpRef = useRef<Record<DamageKind, number>>({
    physical: ProjectileHpConstants.DEFAULT_HP,
    magical: ProjectileHpConstants.DEFAULT_HP,
    true: ProjectileHpConstants.DEFAULT_HP,
  });

  const npc = useNpcAI({
    playerX: player.x,
    playerY: player.y,
    playerState: player.state,
    playerDirection: player.battleDirection,
    playerCharacter: player.character,
    npcClass: npcData.class,
    npcType,
    npcPhaseRef,
    onProjectileHit: (damageKind) =>
      refs.npcRangedAttackRef.current(damageKind),
    onMeleeHit: (multiplier, damageKind) =>
      refs.npcMeleeAttackRef.current(multiplier, damageKind),
    isPaused:
      isPausedRef.current || isPhaseTransitioning || lootActiveRef.current,
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
        const direction = npcX > p.x ? -1 : 1;
        const pushToX = clampX(p.x + direction * 200);
        return {
          ...p,
          pullFromX: p.x,
          pullToX: pushToX,
          pullStartTime: Date.now(),
        };
      }),
    onRamPushPlayer: (direction: "left" | "right", toX: number) =>
      setPlayer((p) => {
        if (p.mode !== "battle") return p;
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
    onLaserHit: () => {
      battle.npcFixedHit(1);
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
  }, [isDragging, isMenuOpenRef, setPlayer, npcRef]);

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

  const lucauaShield = useLucauaShield(player.character);

  const {
    onBlockRef,
    onDamageTakenRef,
    onDodgeRef,
    onDamageDealtRef,
    onAttackRef,
    onSpecialRef,
  } = useStatCallbacks({
    playerCharacter: player.character,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    onBlockSide: lucauaShield.register,
  });

  const executePetSkillRef = useRef<() => void>(() => {});

  // Preenchido pelo useArturOraPunch com o multiplicador atual (escala ORA).
  const arturOraMultiplierRef = useRef<() => number>(() => 1);

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
    onBeforeNpcHitRef: targeting.onBeforeNpcHitRef,
    onBlockRef,
    onDamageTakenRef,
    onDodgeRef,
    onDamageDealtRef,
    onAttackRef,
    onSpecialRef,
    onKokusenRef,
    onBlackFlashRef,
    onCriticalPushRef,
    arturOraMultiplierRef,
    vastolordMultiplierRef,
    vastolordActive,
    divergentFistRef,
    onDivergentFistConsumedRef,
    petId,
    onPetSkillRef: executePetSkillRef,
    isMenuRef: isMenuOpenRef,
    isPausedRef,
    savedPlayerHP: savedPlayerHPRef.current,
    npcStatMultiplier: isAlfa ? 2 : 1,
    npcArmorBonus,
    weapon: lucasWeapon,
    surviveLethalHitRef,
  });

  // Vida dos projéteis destrutíveis = 1/3 do dano que causariam no jogador.
  // Uma vida por natureza: o projétil lê a própria no `setProjectile`.
  projectileHpRef.current = getProjectileDestructionHpByKind({
    npcDamage: npcStats.damage,
    playerClass,
    totalArmor: battle.totalArmor,
    npcType,
    playerCharacter: player.character,
  });

  // Usar habilidade ativa rende +5 cargas da Expansão de Domínio. Os hooks
  // chamam de dentro do press (depois dos guards), para não farmar carga
  // apertando botão em estado inválido.
  const onAbilityUsed = useCallback(() => {
    battle.setDelicia((d) => gainAbilityCharge(d, battle.hitsToSpecial));
  }, [battle]);

  const handleWeaponSwitch = useCallback(() => {
    const mana = battleManaRef.current;
    if (mana && !mana.consumeMana(LUCAS_WEAPON_SWITCH_MANA_COST)) return;
    if (!switchWeapon()) return;
    // Troca de arma é habilidade do Lucas: concede carga da Expansão.
    onAbilityUsed();
  }, [battleManaRef, onAbilityUsed, switchWeapon]);

  const {
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
  } = useActiveSkills({
    cursedEnergyEnabled,
    battle,
    battleManaRef,
    player,
    honoredOneActiveRef,
    setPlayer,
    playSound,
    triggerBlink,
    divergentFistActive,
    divergentFistRef,
    forcePunchRef,
    setDivergentFistActive,
  });

  executePetSkillRef.current = () => {
    if (!petSkillDef || battle.isEnding.current) return;
    runPetSkill(petSkillDef, {
      petLevel,
      petStars,
      playerLevel,
      groundY: player.groundY,
      beginCoffinSequence,
      npcType,
      playerX: player.x,
      playerY: player.y,
      battle,
      spawnDamageRef: refs.spawnDamageRef,
      npc,
      summonAlly,
      triggerJumpAttack: battle.triggerJumpAttack,
      triggerTeleportBite: battle.triggerTeleportBite,
      applyNpcBleed: battle.applyNpcBleed,
      summons,
      setSummons,
      summonsBleedUntilRef,
      npcRootedUntilRef,
      rootedSummonsUntilRef,
      rootDurationMs: PET_ROOT_DURATION_MS,
      playSound,
    });
  };

  const {
    comboCount,
    comboRank,
    progress: comboProgressValue,
    nextRank,
    registerHit,
    resetCombo,
  } = useComboSystem({ npcMaxHp: battle.npcMaxHp });
  const weaponInfo = getEquippedInfo(player.character, "weapon");
  const weaponEnchantment = weaponInfo
    ? getWeaponEnchantment(weaponInfo.id)
    : null;
  const weaponEnchantmentRef = useLatestRef(weaponEnchantment);

  /** Fim de cada status aplicado pelo encantamento da arma no NPC. */
  const npcEnchantUntilRef = useRef<Record<Enchantment, number>>({
    burn: 0,
    freeze: 0,
    poison: 0,
    bleed: 0,
  });

  // Passiva da Forma Vastolord: a cada 10% do dano base causado a qualquer
  // inimigo, a duração da forma aumenta 0.1s. Dano é acumulado num ref e
  // convertido em extensões (com sobra) dentro de registerHit.
  const vastolordBaseDamage = useMemo(
    () =>
      combatService.calculatePlayerDamage(
        battle.char.stats.strength,
        playerClass,
      ),
    [battle.char, playerClass],
  );
  const vastolordDamageAccumulatorRef = useRef(0);

  refs.registerHitRef.current = (damage: number) => {
    registerHit(damage);

    if (vastolordActive) {
      vastolordDamageAccumulatorRef.current += damage;
      const threshold = vastolordBaseDamage * VASTOLORD_DAMAGE_EXTEND_RATIO;
      if (threshold >= 1) {
        while (vastolordDamageAccumulatorRef.current >= threshold) {
          vastolordDamageAccumulatorRef.current -= threshold;
          extendVastolordRef.current(VASTOLORD_DAMAGE_EXTEND_MS);
        }
      }
    }

    if (cursedEnergyEnabled) {
      battleManaRef.current?.restoreMana(cursedEnergyFromDamage(damage));
    }

    const enchantment = weaponEnchantmentRef.current;
    if (!rollEnchantmentProc(enchantment) || !enchantment) return;

    const until = Date.now() + ENCHANTMENT_DURATION_MS[enchantment];
    npcEnchantUntilRef.current[enchantment] = until;

    if (enchantment === "freeze") {
      refs.npcStaggerRef.current = Math.max(refs.npcStaggerRef.current, until);
    }

    refs.spawnDamageRef.current?.(0, npc.x, npc.y, enchantment);
  };
  refs.spawnDamageRef.current = battle.spawnDamageNumber;
  dragBattleRef.current = battle;

  // Lucaua: o básico é um projétil de energia. O press dispara via `fireRef`
  // (preenchido pelo hook criado logo abaixo) e a colisão resolve o dano via
  // `onHitRef` (preenchido pelo usePlayerBattleActions com playerHit/damageSummon).
  const lucauaFireRef = useRef<
    ((player: Player, targets: LucauaTarget[]) => boolean) | null
  >(null);
  const lucauaOnHitRef = useRef<((target: LucauaTarget) => void) | null>(null);

  const { handlePlayerHit, handleSpecialHit, handleExtraPunch, hitTargetList } =
    usePlayerBattleActions({
      player,
      npc,
      summons,
      setSummons,
      npcHP: battle.npcHP,
      npcClass: npcData.class,
      playerClass,
      weapon: lucasWeapon,
      progress,
      npcLevel,
      battle,
      giveSummonRewards,
      spawnDamageRef: refs.spawnDamageRef,
      registerHitRef: refs.registerHitRef,
      setPlayerHP: battle.setPlayerHP,
      playerHP: battle.playerHP,
      playerMaxHp: battle.playerMaxHp,
      vampirism: battle.vampirism,
      onNpcPush: (targetX) =>
        npc.updateNpc({
          x: clampX(targetX),
        }),
      onComboAdvance: (forwardDistance, targetX) =>
        setPlayer((p) => {
          if (p.mode !== "battle" || forwardDistance <= 0) return p;
          const direction = targetX >= p.x ? 1 : -1;
          const stepToX = clampX(p.x + direction * forwardDistance);
          const toX =
            direction === 1
              ? Math.min(stepToX, targetX)
              : Math.max(stepToX, targetX);
          if (toX === p.x) return p;
          return {
            ...p,
            pullFromX: p.x,
            pullToX: toX,
            pullStartTime: Date.now(),
          };
        }),
      emanuelComboMultiplierRef,
      emanuelComboActiveRef,
      emanuelComboAirActiveRef,
      emanuelComboStepIndexRef,
      lucauaFireRef,
      lucauaOnHitRef,
    });

  const lucauaEnergy = useLucauaEnergyAttack({
    PLAYER_SIZE,
    timeRef: refs.timeRef,
    npc: { x: npc.x, y: npc.y },
    npcClass: npcData.class,
    summons,
    onProjectileHit: (target) => lucauaOnHitRef.current?.(target),
  });
  lucauaFireRef.current = lucauaEnergy.fire;

  const freezeSummonsUntilRef = useRef(0);

  useSummonAI({
    summons,
    setSummons,
    isPaused: isPausedRef.current || lootActiveRef.current,
    playerX: player.x,
    playerY: player.y,
    playerClass,
    playerCharacter: player.character,
    npcLevel,
    difficulty,
    damagePlayer: battle.damagePlayer,
    spawnDamageRef: refs.spawnDamageRef,
    timeRef: refs.timeRef,
    freezeUntilRef: freezeSummonsUntilRef,
    rootedSummonsUntilRef,
    honoredFleeRef,
    onSummonKilled: () => {
      if (vastolordActive) {
        extendVastolordRef.current(VASTOLORD_KILL_EXTEND_MS);
        addVastolordLaserChargeRef.current();
      }
    },
  });

  useAllyAI({
    allies,
    setAllies,
    enemySummons: summons,
    setEnemySummons: setSummons,
    isPaused: isPausedRef.current,
    isEnding: battle.isEnding.current,
    enemyNpc: { x: npc.x, y: npc.y, npcType },
    npcHp: battle.npcHP,
    npcArmor: battle.npcArmor,
    setNpcHP: battle.setNpcHP,
    npcLevel,
    difficulty,
    spawnDamageRef: refs.spawnDamageRef,
    timeRef: refs.timeRef,
  });

  const {
    oraPress,
    oraRelease,
    extraPunches,
    extraPunchSprite,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
  } = useArturBattle({
    player,
    setPlayer,
    npc,
    summons,
    onPunchHit: handleExtraPunch,
    onAreaDamage: (explosions, allEnemies) => {
      for (const enemy of allEnemies) {
        const count = explosions.filter(
          (c) => Math.hypot(enemy.x - c.x, enemy.y - c.y) <= 200,
        ).length;
        if (count > 0) {
          // `true` = bypassCharge: a explosão é a cauda do special que já
          // consumiu a delícia, então cobra-la aqui matava todo o dano de área.
          hitTargetList(
            [{ id: enemy.id, x: enemy.x, y: enemy.y }],
            count,
            true,
            true,
          );
        }
      }
    },
    arturOraMultiplierRef,
    refs,
    freezeActionsUntilRef,
    onBombProjectiles: (strikes) => {
      npc.strikeProjectiles(strikes);
    },
  });

  const npcMaxHpRef = useLatestRef(battle.npcMaxHp);
  const setNpcHPRef = useLatestRef(battle.setNpcHP);
  const isEndingRef = useLatestRef(battle.isEnding);

  useStatusDots({
    honoredRegenActive,
    battleManaRef,
    isEndingRef,
    isPausedRef,
    summonsBleedUntilRef,
    setSummons,
    summons,
    setNpcHP: battle.setNpcHP,
    npcX: npc.x,
    npcY: npc.y,
    spawnDamageRef: refs.spawnDamageRef,
    npcEnchantUntilRef,
  });

  usePhaseTransition({
    npcPhase: battle.npcPhase,
    player,
    setPlayer,
    npc,
    clearSummons,
    clearAllies,
    setIsPhaseTransitioning,
  });

  const charge = useChargeAttack({
    player,
    setPlayer,
    npcX: npc.x,
    npcY: npc.y,
    npcType,
    npcArmor: battle.npcArmor,
    npcClass: npcData.class,
    char: battle.char,
    playerClass,
    critRate: battle.critRate,
    titleDamageBonus: battle.titleDamageBonus,
    elementDamageBonus: battle.elementDamageBonus,
    setNpcHP: battle.setNpcHP,
    playerCooldown: battle.playerCooldown,
    isEnding: battle.isEnding,
    timeRef: refs.timeRef,
    spawnDamageRef: refs.spawnDamageRef,
    registerHitRef: refs.registerHitRef,
    setPlayerState,
    summons,
    setSummons,
    setDelicia: battle.setDelicia,
    hitsToSpecial: battle.hitsToSpecial,
    setPlayerHP: battle.setPlayerHP,
    playerHP: battle.playerHP,
    playerMaxHp: battle.playerMaxHp,
    vampirism: battle.vampirism,
    weapon: lucasWeapon,
    vastolordMultiplierRef,
  });

  useBattleSync({
    battle,
    npcAiHpRef: targeting.npcAiHpRef,
    npc,
    updateNpcPosition,
    npcType,
    npcMaxHpRef,
    setNpcHPRef,
    isEndingRef,
    isPausedRef,
    resetBattleNavbarRef,
    setNpcPhase,
    setModeRef,
    closeInventoryRef,
    closeNavbarRef,
    refs,
    charge,
    player,
    halfHealReduction: battle.halfHealReduction,
    battleNpcRangedHit: battle.npcRangedHit,
    battleNpcMeleeHit: battle.npcMeleeHit,
    battleNpcBurstHit: battle.npcBurstHit,
    battleNpcThrowHit: battle.npcThrowHit,
  });

  useThrowAnimation({ setPlayer, setIsThrown, isMenuRef: isMenuOpenRef });

  const { playerProjectile } = usePlayerSpecialProjectile({
    player,
    PLAYER_SIZE,
    onFire: handleSpecialHit,
    timeScaleRef,
    setTimeScale,
  });

  useEffect(() => {
    playerProjectileRef.current = playerProjectile;
  }, [playerProjectile]);

  const {
    specialIntroActive,
    specialIntroCharacter,
    specialIntroAbility,
    specialIntroForm,
    startSpecialIntro,
  } = useSpecialIntro({ setTimeScale, resetTimeScale });

  // Artur não usa o charge (segurar onConfirm = ORA ORA). Os demais mantêm.
  const canCharge =
    player.character !== "artur" && playerLevel >= CHARGE_ATTACK_MIN_LEVEL;

  const controlsDisabled =
    isPausedRef.current ||
    isPhaseTransitioning ||
    isThrown ||
    alfaIntroActive ||
    isDragging;

  // ── Habilidades ativas do Artur e da Larissa ──────────────────────────
  // O "special" universal saiu do jogo: só Artur (Killer Queen) e Larissa
  // (Explosão de Stacks) têm habilidade própria, cada uma com o seu botão e
  // cooldown. Por baixo elas reaproveitam o pipeline do golpe especial (os
  // estados `preSpecial`/`special` e o `handleSpecialHit`), que continua
  // existindo para a mecânica das esferas do Riquelme — mas nenhum personagem
  // ganha mais um "special" genérico.

  const activateArturKillerQueen = useCallback(() => {
    // O Artur não dá o golpe no press: `useArturKillerQueen` dispara quando o
    // estado entra em `preSpecial`.
    special();
  }, [special]);

  const activateLarissaExplosion = useCallback(() => {
    // A Larissa dá o golpe na hora (dano `stacks * 5` + explosão), como fazia
    // o special antigo quando não havia override de fluxo.
    special();
    handleSpecialHit();
  }, [special, handleSpecialHit]);

  const [activeAbilityRemaining, setActiveAbilityRemaining] = useState(0);
  const activeAbilityReadyAtRef = useRef(0);

  const openActiveAbility = useCallback(() => {
    if (freezeActionsUntilRef.current > Date.now()) return;
    if (isGrabbedRef.current && grabFlippedRef.current) return;
    if (activeAbilityReadyAtRef.current > Date.now()) return;

    const activate =
      player.character === "artur"
        ? activateArturKillerQueen
        : player.character === "larissa"
          ? activateLarissaExplosion
          : null;
    if (!activate) return;

    // `startSpecialIntro` devolve false só quando já existe um intro em
    // andamento (nesse caso o onActivate nunca roda): o cooldown não arma,
    // senão a habilidade sumiria junto com o cooldown pago.
    const started = startSpecialIntro(player.character, activate);
    if (!started) return;
    const cooldownMs = applyCooldownReduction(
      player.character === "artur"
        ? KILLER_QUEEN_COOLDOWN_MS
        : STACK_EXPLOSION_COOLDOWN_MS,
      battle.char.stats.cooldownReduction,
    );
    activeAbilityReadyAtRef.current = Date.now() + cooldownMs;
    setActiveAbilityRemaining(cooldownMs / 1000);
    // Habilidade ativa usada: a barra da Expansão de Domínio rende +5.
    battle.setDelicia((d) => gainAbilityCharge(d, battle.hitsToSpecial));
  }, [
    freezeActionsUntilRef,
    isGrabbedRef,
    grabFlippedRef,
    startSpecialIntro,
    player.character,
    activateArturKillerQueen,
    activateLarissaExplosion,
    battle,
  ]);

  // Tick do cooldown restante do botão de habilidade ativa (mesmo intervalo
  // dos cooldowns do marcelo).
  useEffect(() => {
    const id = setInterval(() => {
      setActiveAbilityRemaining(
        Math.max(0, (activeAbilityReadyAtRef.current - Date.now()) / 1000),
      );
    }, TWO_HUNDRED_MS);
    return () => clearInterval(id);
  }, []);

  useBattleControls({
    attack: () => {
      if (freezeActionsUntilRef.current > Date.now()) return;
      if (isGrabbedRef.current && grabFlippedRef.current) return;
      attack();
      oraPress();
    },
    blockStart: () => {
      if (freezeActionsUntilRef.current > Date.now()) return;
      if (player.state !== "blocked") {
        lastBlockPressRef.current = Date.now();
      }
      setPlayer((p) => {
        if (p.state === "jump" || p.state === "blockAttack") return p;
        return { ...p, state: "blocked" };
      });
    },
    blockEnd: () =>
      setPlayer((p) => {
        if (p.state !== "blocked") return p;
        return { ...p, state: "idle" };
      }),
    handlePlayerHit: () => {
      if (freezeActionsUntilRef.current > Date.now()) return;
      handlePlayerHit();
    },
    disabled: controlsDisabled,
    playerState: player.state,
    onChargePress: canCharge
      ? () => {
          if (freezeActionsUntilRef.current > Date.now()) return;
          charge.startCharge();
        }
      : undefined,
    onChargeRelease: canCharge
      ? () => {
          if (freezeActionsUntilRef.current > Date.now()) return;
          charge.releaseCharge();
        }
      : undefined,
    onChargeCancel: canCharge
      ? () => {
          if (freezeActionsUntilRef.current > Date.now()) return;
          charge.cancelCharge();
        }
      : undefined,
    onComboRelease: oraRelease,
  });

  useTrainingEffects({
    training,
    npcMaxHp: battle.npcMaxHp,
    setNpcHP: battle.setNpcHP,
    isPausedRef,
  });

  useEffect(() => {
    battleTenacityRef.current = battle.tenacityReduction;
  }, [battle.tenacityReduction, battleTenacityRef]);

  const cloneDisabledRef = useLatestRef(controlsDisabled);

  const {
    cloneVisual: emanuelClone,
    press: clonePress,
    release: cloneRelease,
    canUse: cloneUsable,
  } = useEmanuelClone({
    player,
    setPlayer,
    battleManaRef,
    obstacles,
    freezeActionsUntilRef,
    setTimeScale,
    resetTimeScale,
    playSound,
    onUsed: onAbilityUsed,
    isPausedRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
  });

  const {
    press: kiChargePress,
    release: kiChargeRelease,
    canUse: kiChargeUsable,
  } = useEmanuelKiCharge({
    player,
    setPlayer,
    battleManaRef,
    freezeActionsUntilRef,
    isPausedRef,
    playSound,
    onUsed: onAbilityUsed,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
  });

  const handleGenkiDamaExplode = useCallback(
    (x: number, y: number, radius: number, multiplier: number) => {
      if (battle.isEnding.current) return;

      const genkiDamaDamageKind = getAbilityDamageType("genkiDama");

      if (Math.hypot(npc.x - x, npc.y - y) <= radius) {
        battle.playerHit(multiplier, true, true, genkiDamaDamageKind);
      }

      for (const summon of summons) {
        if (Math.hypot(summon.x - x, summon.y - y) > radius) continue;
        damageSummon({
          target: { id: summon.id, x: summon.x, y: summon.y },
          multiplier,
          // Habilidade ativa (Genki Dama): só o vampirismo universal paga.
          source: "other",
          damageKind: genkiDamaDamageKind,
          player,
          playerClass,
          progress,
          playerHP: battle.playerHP,
          playerMaxHp: battle.playerMaxHp,
          vampirism: battle.vampirism,
          summons,
          setSummons,
          giveSummonRewards,
          spawnDamageRef: refs.spawnDamageRef,
          registerHitRef: refs.registerHitRef,
          setPlayerHP: battle.setPlayerHP,
          deliciaSetter: battle.setDelicia,
          hitsToSpecial: battle.hitsToSpecial,
        });
      }
    },
    [
      battle,
      npc.x,
      npc.y,
      player,
      playerClass,
      progress,
      refs,
      setSummons,
      summons,
      giveSummonRewards,
    ],
  );

  const handleGenkiDamaExplodeRef = useLatestRef(handleGenkiDamaExplode);

  const {
    genkiDamaVisual,
    press: genkiDamaPress,
    release: genkiDamaRelease,
    canUse: genkiDamaUsable,
  } = useEmanuelGenkiDama({
    player,
    setPlayer,
    battleManaRef,
    freezeActionsUntilRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    npc,
    onExplode: (x, y, radius, multiplier) =>
      handleGenkiDamaExplodeRef.current(x, y, radius, multiplier),
    playSound,
    onUsed: onAbilityUsed,
    isPausedRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
  });

  const {
    beam: vastolordLaser,
    press: vastolordLaserPress,
    usable: vastolordLaserUsable,
    stacks: vastolordLaserStacks,
    addCharge: addVastolordLaserCharge,
  } = useVastolordLaser({
    player,
    setPlayer,
    PLAYER_SIZE,
    vastolordActive,
    char: battle.char,
    playerClass,
    npc,
    summons,
    setSummons,
    setNpcHP: battle.setNpcHP,
    npcArmor: battle.npcArmor,
    vampirism: battle.vampirism,
    playerMaxHp: battle.playerMaxHp,
    setPlayerHP: battle.setPlayerHP,
    giveSummonRewards,
    spawnDamageNumber: battle.spawnDamageNumber,
    registerHitRef: refs.registerHitRef,
    freezeActionsUntilRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    onUsed: onAbilityUsed,
  });

  addVastolordLaserChargeRef.current = addVastolordLaserCharge;

  // "I Am Atomic" do marcelo -------------------------------------------------
  // Proporção especial/básico: a explosão deve causar "2x o dano de especial".
  // O playerHit aplica o multiplicador sobre o dano básico (full pipeline:
  // crítico/armadura/elemento), então fatorá-lo pela proporção produz o dano
  // equivalente ao de um especial (sem consumir delícia/cooldown). A mesma
  // proporção alimenta a Expansão de Domínio (burst) dos demais personagens.
  const specialDamageRatio = useMemo(() => {
    const special = combatService.calculateSpecialDamage(
      battle.char.stats.spirit,
      playerClass,
    );
    const basic = combatService.calculatePlayerDamage(
      battle.char.stats.strength,
      playerClass,
    );
    return basic > 0 ? special / basic : 1;
  }, [battle.char.stats.spirit, battle.char.stats.strength, playerClass]);

  const handleAtomicBoom = useCallback(
    (payload: AtomicBoomPayload) => {
      if (battle.isEnding.current) return;

      const { targetId, hitMain, hitSummonIds } = payload;

      // NPC principal: dano especial — 2x se for o alvo (maior vida máxima).
      if (hitMain) {
        const factor =
          targetId === "main"
            ? ATOMIC_TARGET_MULTIPLIER
            : ATOMIC_AREA_MULTIPLIER;
        battle.playerHit(
          factor * specialDamageRatio,
          true,
          true,
          getAbilityDamageType("iAmAtomic"),
        );
      }

      for (const summon of summons) {
        if (!hitSummonIds.includes(summon.id)) continue;
        const factor =
          targetId === summon.id
            ? ATOMIC_TARGET_MULTIPLIER
            : ATOMIC_AREA_MULTIPLIER;
        damageSummon({
          target: { id: summon.id, x: summon.x, y: summon.y },
          multiplier: factor * specialDamageRatio,
          // Habilidade ativa: só o vampirismo universal paga.
          source: "other",
          damageKind: getAbilityDamageType("iAmAtomic"),
          player,
          playerClass,
          progress,
          playerHP: battle.playerHP,
          playerMaxHp: battle.playerMaxHp,
          vampirism: battle.vampirism,
          summons,
          setSummons,
          giveSummonRewards,
          spawnDamageRef: refs.spawnDamageRef,
          registerHitRef: refs.registerHitRef,
          setPlayerHP: battle.setPlayerHP,
          deliciaSetter: battle.setDelicia,
          hitsToSpecial: battle.hitsToSpecial,
        });
      }
    },
    [
      specialDamageRatio,
      battle,
      giveSummonRewards,
      player,
      playerClass,
      progress,
      refs,
      setSummons,
      summons,
    ],
  );

  const handleAtomicBoomRef = useLatestRef(handleAtomicBoom);
  const marceloCutInTriggerLatest = useLatestRef(battle.marceloCutInTrigger);

  const {
    halo: atomicHalo,
    explosion: atomicExplosion,
    cuts: atomicCuts,
    flash: atomicFlash,
    press: atomicPress,
    usable: atomicUsable,
    remaining: atomicRemaining,
  } = useAtomic({
    player,
    setPlayer,
    npc,
    npcType,
    npcMaxHp: battle.npcMaxHp,
    npcHp: battle.npcHP,
    summons,
    startSpecialIntro,
    onBoom: handleAtomicBoomRef.current,
    onNpcCutInRef: marceloCutInTriggerLatest,
    freezeActionsUntilRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    playSound,
    onUsed: onAbilityUsed,
    cooldownReduction: battle.char.stats.cooldownReduction,
  });

  // Expansão de Domínio do marcelo -------------------------------------------
  // Causa 100% da vida máxima de tudo que o mugetsuEffect toca. A vitória só é
  // disparada quando a varredura chega na outra ponta do mapa — por isso o
  // isEnding fica setado pelo hook durante a varredura (bloqueando o lifecycle)
  // e o desfecho é resolvido aqui no fim. Num boss de duas fases, matar a fase
  // 1 não encerra a luta: a fase 2 começa e a batalha continua.
  const handleDomainExpansionKill = useCallback(() => {
    if (vastolordActive) {
      extendVastolordRef.current(VASTOLORD_KILL_EXTEND_MS);
      addVastolordLaserChargeRef.current();
    }

    if (npcData.class === "boss" && battle.npcPhase === 1) {
      // Destrava o lifecycle (o hook setou o isEnding no início da varredura) e
      // avança para a fase 2, reposicionando os personagens no `usePhaseTransition`.
      battle.isEnding.current = false;
      setNpcPhase(2);
      battle.setNpcHP(battle.npcMaxHp);
      npc.updateNpc({ hidden: false });
      return;
    }

    onNpcDeathRef.current();
  }, [
    addVastolordLaserChargeRef,
    battle,
    extendVastolordRef,
    npc,
    npcData.class,
    onNpcDeathRef,
    setNpcPhase,
    vastolordActive,
  ]);

  const {
    mugetsuSweep,
    domainExpansionActive,
    shattering: domainExpansionShattering,
    mugetsuBlink,
    disintegrating,
    press: domainExpansionPress,
    usable: domainExpansionUsable,
  } = useDomainExpansion({
    player,
    setPlayer,
    npc,
    mainNpcType: npcType,
    mainNpcPhase: battle.npcPhase,
    mainNpcIsBoss: npcData.class === "boss",
    isAlfa,
    summons,
    setSummons,
    vampirism: battle.vampirism,
    playerMaxHp: battle.playerMaxHp,
    setPlayerHP: battle.setPlayerHP,
    projectiles: npc.projectiles,
    setProjectiles: npc.setProjectiles,
    setNpcHP: battle.setNpcHP,
    npcMaxHp: battle.npcMaxHp,
    giveSummonRewards,
    spawnDamageNumber: battle.spawnDamageNumber,
    registerHitRef: refs.registerHitRef,
    freezeActionsUntilRef,
    timeRef: refs.timeRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    onNpcKilled: handleDomainExpansionKill,
    playSound,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
    setDelicia: battle.setDelicia,
  });

  // Expansão de Domínio (burst) dos demais 11 personagens ---------------------
  // O uso consome as 40 cargas e causa dano especial em TODOS os inimigos da
  // arena de uma vez. Sem cutin de intro de propósito: a arte em
  // `habilities/<skill>/background.svg` só existe para o marcelo.
  const handleDomainBurst = useCallback(() => {
    if (battle.isEnding.current) return;

    const burstKind = getAbilityDamageType("domainBurst");

    battle.playerHit(
      DOMAIN_BURST_MAIN_MULTIPLIER * specialDamageRatio,
      true,
      true,
      burstKind,
    );

    for (const summon of summons) {
      damageSummon({
        target: { id: summon.id, x: summon.x, y: summon.y },
        multiplier: DOMAIN_BURST_SUMMON_MULTIPLIER * specialDamageRatio,
        // Habilidade ativa: só o vampirismo universal paga.
        source: "other",
        damageKind: burstKind,
        player,
        playerClass,
        progress,
        playerHP: battle.playerHP,
        playerMaxHp: battle.playerMaxHp,
        vampirism: battle.vampirism,
        summons,
        setSummons,
        giveSummonRewards,
        spawnDamageRef: refs.spawnDamageRef,
        registerHitRef: refs.registerHitRef,
        setPlayerHP: battle.setPlayerHP,
        deliciaSetter: battle.setDelicia,
        hitsToSpecial: battle.hitsToSpecial,
      });
    }
  }, [
    battle,
    giveSummonRewards,
    player,
    playerClass,
    progress,
    refs,
    setSummons,
    specialDamageRatio,
    summons,
  ]);

  const domainConfig = DOMAIN_EXPANSIONS[player.character];
  const {
    active: domainBurstActive,
    press: domainBurstPress,
    usable: domainBurstUsable,
  } = useDomainExpansionBurst({
    player,
    character: player.character,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
    setDelicia: battle.setDelicia,
    freezeActionsUntilRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    onBurst: handleDomainBurst,
    playSound,
  });

  // Expansão de Domínio do riquelme (Muryōkūsho) ------------------------------
  // Domínio próprio: congela o mundo, segura a pose `rioiki.svg` por 5s e
  // drena 1% da vida MÁXIMA de todos os inimigos a cada 100ms. No fim, se
  // alguém sobreviveu, o `expansion.svg` estilhaça e desce.
  const {
    active: riquelmeDomainActive,
    shattering: riquelmeDomainShattering,
    press: riquelmeDomainPress,
    usable: riquelmeDomainUsable,
  } = useRiquelmeDomainExpansion({
    player,
    setPlayer,
    npc,
    npcHP: battle.npcHP,
    npcMaxHp: battle.npcMaxHp,
    setNpcHP: battle.setNpcHP,
    summons,
    setSummons,
    spawnDamageNumber: battle.spawnDamageNumber,
    freezeActionsUntilRef,
    battleManaRef,
    timeRef: refs.timeRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
    setDelicia: battle.setDelicia,
  });

  // Preenchimento (`expansion.svg`) e quebra do vidro são um só para toda
  // Expansão de Domínio: o marcelo mostra durante a varredura, o riquelme
  // durante os 5s do dreno.
  const domainBackgroundActive = domainExpansionActive || riquelmeDomainActive;
  const domainShattering =
    domainExpansionShattering || riquelmeDomainShattering;

  // "Gran Rey Cero" do marcelo ------------------------------------------------
  // Lâmina de 500px que corre por quadro; disponível na forma normal (os
  // sprites ficam em `habilities/granReyCero/`, fora da pasta vastolordForm).
  const {
    effect: granReyCeroEffect,
    press: granReyCeroPress,
    usable: granReyCeroUsable,
    remaining: granReyCeroRemaining,
  } = useGranReyCero({
    player,
    setPlayer,
    char: battle.char,
    playerClass,
    npc,
    summons,
    setSummons,
    setNpcHP: battle.setNpcHP,
    npcArmor: battle.npcArmor,
    vampirism: battle.vampirism,
    playerMaxHp: battle.playerMaxHp,
    setPlayerHP: battle.setPlayerHP,
    giveSummonRewards,
    spawnDamageNumber: battle.spawnDamageNumber,
    registerHitRef: refs.registerHitRef,
    freezeActionsUntilRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    onUsed: onAbilityUsed,
    cooldownReduction: battle.char.stats.cooldownReduction,
  });

  // Esferas do riquelme (blue/red) ---------------------------------------------
  const riquelmeSpheres = useRiquelmeSpheres({
    player,
    setPlayer,
    battle,
    npc,
    summons,
    setSummons,
    playerClass,
    progress,
    giveSummonRewards,
    battleManaRef,
    freezeActionsUntilRef,
    timeRef: refs.timeRef,
    refs,
    playSound,
    startSpecialIntro,
    onUsed: onAbilityUsed,
    isPausedRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
    specialDamageRatio,
    playerProjectileRef,
  });

  return {
    ...riquelmeSpheres,
    battle,
    npc,
    charge,
    lucasWeapon,
    switchWeapon: handleWeaponSwitch,
    grabFlipped,
    grabbedTimerRef,
    setIsGrabbed,
    killCounter,
    saveDataRef,
    npcRootedUntilRef,
    rootedSummonsUntilRef,
    npcEnchantUntilRef,
    controlsDisabled,
    comboCount,
    comboRank,
    comboProgress: comboProgressValue,
    nextRank,
    resetCombo,
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
    playerProjectile,
    specialIntroActive,
    specialIntroCharacter,
    specialIntroForm,
    extraPunches,
    extraPunchSprite,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
    emanuelClone,
    clonePress,
    cloneRelease,
    cloneUsable,
    kiChargePress,
    kiChargeRelease,
    kiChargeUsable,
    genkiDamaVisual,
    genkiDamaPress,
    genkiDamaRelease,
    genkiDamaUsable,
    vastolordLaser,
    vastolordLaserPress,
    vastolordLaserUsable,
    vastolordLaserStacks,
    atomicHalo,
    atomicExplosion,
    atomicCuts,
    atomicFlash,
    atomicPress,
    atomicUsable,
    atomicRemaining,
    activeAbilityPress: openActiveAbility,
    activeAbilityUsable: activeAbilityRemaining <= 0,
    activeAbilityRemaining,
    specialIntroAbility,
    mugetsuSweep,
    domainExpansionActive,
    mugetsuBlink,
    // Mesmo par de props para os três efeitos: o marcelo usa o mugetsu
    // (cutin + varredura), o riquelme a Muryōkūsho (dreno contínuo) e os demais
    // o burst (dano em área).
    domainExpansionPress:
      domainConfig.kind === "mugetsu"
        ? domainExpansionPress
        : domainConfig.kind === "muryokusho"
          ? riquelmeDomainPress
          : domainBurstPress,
    domainExpansionUsable:
      domainConfig.kind === "mugetsu"
        ? domainExpansionUsable
        : domainConfig.kind === "muryokusho"
          ? riquelmeDomainUsable
          : domainBurstUsable,
    domainBurstActive,
    domainBackgroundActive,
    domainShattering,
    granReyCeroEffect,
    granReyCeroPress,
    granReyCeroUsable,
    granReyCeroRemaining,
    disintegrating,
    lucauaEnergyProjectiles: lucauaEnergy.projectiles,
    lucauaAttackVariant: lucauaEnergy.attackVariant,
    lucauaShieldSides: lucauaShield.sides,
    onLucauaShieldEnd: lucauaShield.end,
  };
}
