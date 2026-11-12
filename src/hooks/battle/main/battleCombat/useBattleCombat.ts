import { useCallback, useEffect, useRef, useState } from "react";
import { useBattleCore } from "@/hooks/battle/main/battleCore/useBattleCore";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useThrowAnimation } from "@/hooks/battle/throw/useThrowAnimation";
import { useSpecialIntro } from "@/hooks/battle/modals/specialIntro/useSpecialIntro";
import { useBabidiEnergyAttack } from "@/hooks/battle/player/characters/babidi/energyAttack/useEnergyAttack";
import { useBabidiMissile } from "@/hooks/battle/player/characters/babidi/missile/useMissile";
import { useBattleControls } from "@/hooks/battle/controls/useControls";
import { useBattleDamage } from "@/hooks/battle/main/battleDamage/useBattleDamage";
import { useBattleEntities } from "@/hooks/battle/main/battleEntities/useBattleEntities";
import { useBattleCombatActions } from "@/hooks/battle/main/battleCombatActions/useBattleCombatActions";
import { usePhaseTransition } from "@/hooks/battle/death/phaseTransition/usePhaseTransition";
import { getNpcPhaseCount } from "@/data/npc";
import { useSigilo } from "@/hooks/battle/player/characters/drika/useSigilo";
import { useBattleSync } from "@/hooks/battle/sync/useSync";
import { useStatusDots } from "@/hooks/battle/effects/statusDots/useStatusDots";
import { useTrainingEffects } from "@/hooks/battle/effects/useTrainingEffects";
import { useSrGuaxinimBattle } from "@/hooks/battle/player/characters/srGuaxinim/battle/useSrGuaxinimBattle";
import { useEmatronClone } from "@/hooks/battle/player/characters/ematron/clone/useClone";
import { useEmatronKiCharge } from "@/hooks/battle/player/characters/ematron/kiCharge/useKiCharge";
import { useEmatronGenkiDama } from "@/hooks/battle/player/characters/ematron/genkiDama/useGenkiDama";
import { useVastolordLaser } from "@/hooks/battle/player/characters/marshadow/vastolordLaser/useVastolordLaser";
import { useKamehameha } from "@/hooks/battle/player/characters/ematron/kamehameha/useKamehameha";
import { useVastolordRoar } from "@/hooks/battle/player/characters/marshadow/vastolordRoar/useVastolordRoar";
import { useGranReyCero } from "@/hooks/battle/player/characters/marshadow/granReyCero/useGranReyCero";
import { useNatsukiSpheres } from "@/hooks/battle/player/characters/natsuki/spheres/natsukiSpheres/useNatsukiSpheres";
import { useMuryokushoExpansion } from "@/hooks/battle/player/characters/natsuki/muryokushoExpansion/useMuryokushoExpansion";
import { useHakaiExpansion } from "@/hooks/battle/player/characters/ematron/hakaiExpansion/useHakaiExpansion";
import { useBabidiDomainExpansion } from "@/hooks/battle/player/characters/babidi/domainExpansion/useBabidiDomainExpansion";
import { useBabidiBombDrop } from "@/hooks/battle/player/characters/babidi/bombDrop/useBombDrop";
import { useAtomic } from "@/hooks/battle/player/characters/marshadow/atomic/useAtomic";
import { useMugetsuExpansion } from "@/hooks/battle/player/characters/marshadow/mugetsuExpansion/useMugetsuExpansion";
import { useDomainExpansionBurst } from "@/hooks/battle/utilities/domainExpansionBurst/useDomainExpansionBurst";
import { VASTOLORD_KILL_EXTEND_MS } from "@/hooks/battle/player/characters/marshadow/vastolordForm/useVastolordForm";
import { getAbilityDamageType } from "@/data/characters/abilities";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { getProjectileDestructionHpByKind } from "@/gameRules/npc/projectile/projectileHp";
import { gainAbilityCharge, gainSpecial } from "@/gameRules/battle/special";
import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import { getWeaponEnchantment } from "@/gameRules/battle/equipment";
import type { Enchantment } from "@/data/equipment/enchantments";
import { CHARGE_ATTACK_MIN_LEVEL } from "@/data/battle/charge";
import { KILLER_QUEEN_COOLDOWN_MS } from "@/data/characters/srGuaxinim/srGuaxinim";
import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/laricell/laricell";
import { YVEL_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";
import { runPetSkill } from "@/gameRules/battle/petSkill/petSkill";
import type { BabidiTarget } from "@/utils/types/character/babidi";
import type { BattleCombatProps } from "@/hooks/battle/main/battleCore/types";

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
  isMenuOpen,
  honoredOneActiveRef,
  honoredFleeRef,
  surviveLethalHitRef,
  honoredSequence,
  honoredRegenActive,
  babidiPassiveDebuff = false,
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
    battle,
    npc,
    targeting,
    isGrabbedRef,
    grabFlipped,
    grabFlippedRef,
    isThrown,
    setIsThrown,
    grabbedTimerRef,
    setIsGrabbed,
    killCounter,
    resetBattleNavbarRef,
    saveDataRef,
    npcRootedUntilRef,
    rootedSummonsUntilRef,
    setModeRef,
    closeInventoryRef,
    closeNavbarRef,
    player,
    setPlayer,
    playSound,
    attack,
    startAbility,
    difficulty,
    playerClass,
    setPlayerState,
    lastBlockPressRef,
    alfaIntroActive,
    progress,
    playerLevel,
    getEquippedInfo,
    npcData,
    npcLevel,
    npcStats,
    npcPhaseRef,
    setNpcPhase,
    isPhaseTransitioning,
    isDragging,
    setIsPhaseTransitioning,
    summons,
    setSummons,
    clearSummons,
    updateNpcPosition,
    summonsBleedUntilRef,
    allies,
    setAllies,
    summonAlly,
    clearAllies,
    beginCoffinSequence,
    petSkillDef,
    petLevel,
    petStars,
    giveSummonRewards,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    machineGamaShieldRef,
    machineGamaBreakRef,
    executePetSkillRef,
    srGuaxinimOraMultiplierRef,
    cancelSpecialIntroRef,
    fishingNet,
    setFishingNet,
    fishingNetRef,
    fishingNetTimerRef,
    fishingNetPushTimerRef,
    fishingNetRemaining,
    setFishingNetRemaining,
    fishingNetReadyAtRef,
    addVastolordLaserChargeRef,
    dragBattleRef,
    playerProjectileRef,
    projectileHpRef,
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
    yvelWeapon,
    switchWeapon,
    babidiShield,
  } = useBattleCore({
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
    isMenuOpen,
    honoredOneActiveRef,
    honoredFleeRef,
    surviveLethalHitRef,
    honoredSequence,
    honoredRegenActive,
    babidiPassiveDebuff,
    babidiPassiveActive,
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
  });

  const {
    arm: drikaArm,
    sigiloPhase,
    sigiloOpen,
    pentagramVisible,
    selectedArmIcon,
    openSigilo,
    closeSigilo,
    selectArm: selectDrikaArmRaw,
  } = useSigilo({
    character: player.character,
    playerHP: battle.playerHP,
    setPlayerHP: battle.setPlayerHP,
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
  // apertando botão em estado inválido. `times` cobre habilidades que contam
  // como mais de um uso — a esfera roxa é a fusão de duas (2× = +10).
  const onAbilityUsed = useCallback(
    (times: number = 1) => {
      battle.setDelicia((d) =>
        gainAbilityCharge(d, battle.hitsToSpecial, times),
      );
    },
    [battle],
  );

  /**
   * Habilidade utilitária usada (sem dano, uso contínuo — o teleporte da
   * Instância do ematron): rende só +1 de carga da Expansão, a mesma regra do
   * blink do natsuki (`gainSpecial`).
   */
  const onUtilityAbilityUsed = useCallback(() => {
    battle.setDelicia((d) => gainSpecial(d, battle.hitsToSpecial));
  }, [battle]);

  const handleWeaponSwitch = useCallback(() => {
    const mana = battleManaRef.current;
    if (mana && !mana.consumeMana(YVEL_WEAPON_SWITCH_MANA_COST)) return;
    if (!switchWeapon()) return;
    // Troca de arma é habilidade do Yvel: concede carga da Expansão.
    onAbilityUsed();
  }, [battleManaRef, onAbilityUsed, switchWeapon]);

  const handleSigiloSelect = useCallback(
    (arm: string) => {
      if (!selectDrikaArmRaw(arm)) return;
      onAbilityUsed();
    },
    [selectDrikaArmRaw, onAbilityUsed],
  );

  // O projétil especial dispara o golpe do player quando funde. As entidades
  // nascem antes de `usePlayerBattleActions` existir, então o alvo vai por ref.
  const onFireRef = useRef<() => void>(() => {});

  const {
    playerProjectile,
    fishingNetPress,
    fishingNetMissiles,
    rootDurationMs,
  } = useBattleEntities({
    battle,
    refs,
    npc,
    player,
    playerClass,
    npcType,
    npcLevel,
    difficulty,
    isAlfa,
    summons,
    setSummons,
    allies,
    setAllies,
    isPausedRef,
    lootActiveRef,
    honoredFleeRef,
    npcRootedUntilRef,
    rootedSummonsUntilRef,
    PLAYER_SIZE,
    timeScaleRef,
    setTimeScale,
    playerProjectileRef,
    onFireRef,
    vastolordActive,
    extendVastolordRef,
    addVastolordLaserChargeRef,
    battleManaRef,
    startAbility,
    onAbilityUsed,
    fishingNet,
    fishingNetRef,
    fishingNetTimerRef,
    fishingNetPushTimerRef,
    fishingNetReadyAtRef,
    setFishingNet,
    setFishingNetRemaining,
  });

  // Babidi: o básico é um projétil de energia. O press dispara via `fireRef`
  // (preenchido pelo hook de ataque do babidi, mais abaixo) e a colisão resolve
  // o dano via `onHitRef` (preenchido pelo usePlayerBattleActions com
  // playerHit/damageSummon).
  const babidiFireRef = useRef<
    ((player: Player, targets: BabidiTarget[]) => boolean) | null
  >(null);

  const babidiOnHitRef = useRef<((target: BabidiTarget) => void) | null>(null);
  const babidiMissileFireRef = useRef<
    ((player: { x: number; y: number }) => boolean) | null
  >(null);
  const babidiMissileFireBurstRef = useRef<
    ((player: { x: number; y: number }) => void) | null
  >(null);
  const babidiMissileOnHitRef = useRef<((target: BabidiTarget) => void) | null>(
    null,
  );

  const {
    comboCount,
    comboRank,
    comboProgress: comboProgressValue,
    nextRank,
    registerHit,
    resetCombo,
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
    handlePlayerHit,
    handleSpecialHit,
    handleExtraPunch,
    hitTargetList,
    charge,
  } = useBattleCombatActions({
    battle,
    refs,
    npc,
    player,
    setPlayer,
    playerClass,
    npcType,
    npcClass: npcData.class,
    npcLevel,
    progress,
    weapon: yvelWeapon,
    summons,
    setSummons,
    giveSummonRewards,
    setPlayerState,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    forcePunchRef,
    babidiFireRef,
    babidiOnHitRef,
    babidiMissileFireRef,
    babidiMissileOnHitRef,
    vastolordMultiplierRef,
    cursedEnergyEnabled,
    battleManaRef,
    honoredOneActiveRef,
    playSound,
    triggerBlink,
    divergentFistActive,
    divergentFistRef,
    setDivergentFistActive,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    babidiShield,
  });

  // O projétil especial (esfera do natsuki) dispara o golpe do player ao fundir.
  onFireRef.current = handleSpecialHit;

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
      triggerPetInvoke: battle.triggerPetInvoke,
      applyNpcBleed: battle.applyNpcBleed,
      summons,
      setSummons,
      summonsBleedUntilRef,
      npcRootedUntilRef,
      rootedSummonsUntilRef,
      rootDurationMs,
      playSound,
    });
  };

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

  const {
    handleGenkiDamaExplode,
    handleAtomicBoom,
    handleDomainBurst,
    specialDamageRatio,
  } = useBattleDamage({
    battle,
    registerHit,
    refs,
    npc,
    player,
    playerClass,
    progress,
    summons,
    setSummons,
    giveSummonRewards,
    battleManaRef,
    cursedEnergyEnabled,
    vastolordActive,
    extendVastolordRef,
    weaponEnchantmentRef,
    npcEnchantUntilRef,
  });

  dragBattleRef.current = battle;

  const babidiEnergy = useBabidiEnergyAttack({
    PLAYER_SIZE,
    timeRef: refs.timeRef,
    npc: { x: npc.x, y: npc.y },
    npcClass: npcData.class,
    summons,
    onProjectileHit: (target) => babidiOnHitRef.current?.(target),
  });
  babidiFireRef.current = babidiEnergy.fire;

  const babidiMissile = useBabidiMissile({
    PLAYER_SIZE,
    npcType,
    npcPhase: battle.npcPhase ?? 1,
    isAlfa,
    timeRef: refs.timeRef,
    npc: { x: npc.x, y: npc.y },
    summons,
    onProjectileHit: (target) => babidiMissileOnHitRef.current?.(target),
  });
  babidiMissileFireRef.current = (player) => babidiMissile.fire(player);
  babidiMissileFireBurstRef.current = (player) =>
    babidiMissile.fireBurst(player, 4, 35);

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
  } = useSrGuaxinimBattle({
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
    srGuaxinimOraMultiplierRef,
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
    disabled: npcType === "trueVandinha",
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

  const {
    specialIntroActive,
    specialIntroCharacter,
    specialIntroAbility,
    specialIntroForm,
    startSpecialIntro,
    cancelSpecialIntro,
  } = useSpecialIntro({ setTimeScale, resetTimeScale, isMenuOpen });

  // O gatilho de O Abençoado (definido lá em cima) cancela a intro pendente.
  cancelSpecialIntroRef.current = cancelSpecialIntro;

  // SrGuaxinim não usa o charge (segurar onConfirm = ORA ORA). Os demais mantêm.
  const canCharge =
    player.character !== "srGuaxinim" && playerLevel >= CHARGE_ATTACK_MIN_LEVEL;

  const baseControlsDisabled =
    isPausedRef.current ||
    honoredSequence ||
    isPhaseTransitioning ||
    isThrown ||
    alfaIntroActive ||
    isDragging ||
    !!player.machineGamaControl;

  const controlsDisabled = baseControlsDisabled || babidiPassiveDebuff;

  // ── Habilidades ativas do SrGuaxinim e da Laricell ──────────────────────────
  // Cada uma tem o próprio botão e cooldown e reaproveita o pipeline genérico
  // da habilidade ativa (os estados `preAbility`/`ability` e o
  // `handleSpecialHit`). O dano especial também é usado pelas esferas do
  // Natsuki, mas aquelas têm estados próprios (`sphereCast`…) — nenhum
  // personagem ganha mais uma habilidade "special" genérica.

  const activateSrGuaxinimKillerQueen = useCallback(() => {
    // O SrGuaxinim não dá o golpe no press: `useSrGuaxinimKillerQueen` dispara quando o
    // estado entra em `preAbility`.
    startAbility();
  }, [startAbility]);

  const activateLaricellExplosion = useCallback(() => {
    // A Laricell dá o golpe na hora (dano `stacks * 5` + explosão), como fazia
    // a habilidade antiga quando não havia override de fluxo.
    startAbility();
    handleSpecialHit();
  }, [startAbility, handleSpecialHit]);

  const [activeAbilityRemaining, setActiveAbilityRemaining] = useState(0);
  const activeAbilityReadyAtRef = useRef(0);

  const openActiveAbility = useCallback(() => {
    if (freezeActionsUntilRef.current > Date.now()) return;
    if (isGrabbedRef.current && grabFlippedRef.current) return;
    if (activeAbilityReadyAtRef.current > Date.now()) return;

    const activate =
      player.character === "srGuaxinim"
        ? activateSrGuaxinimKillerQueen
        : player.character === "laricell"
          ? activateLaricellExplosion
          : null;
    if (!activate) return;

    // `startSpecialIntro` devolve false só quando já existe um intro em
    // andamento (nesse caso o onActivate nunca roda): o cooldown não arma,
    // senão a habilidade sumiria junto com o cooldown pago.
    const started = startSpecialIntro(player.character, activate);
    if (!started) return;
    const cooldownMs = applyCooldownReduction(
      player.character === "srGuaxinim"
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
    activateSrGuaxinimKillerQueen,
    activateLaricellExplosion,
    battle,
  ]);

  // Tick do cooldown restante do botão de habilidade ativa (mesmo intervalo
  // dos cooldowns do marshadow). Com o menu de batalha aberto o cooldown
  // congela: a batalha pausada não regenera habilidade.
  const activeAbilityCooldownTick = useCooldownPauseTick({
    readyAtRef: activeAbilityReadyAtRef,
    isPausedRef,
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (!activeAbilityCooldownTick()) return;
      setActiveAbilityRemaining(
        Math.max(0, (activeAbilityReadyAtRef.current - Date.now()) / 1000),
      );
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [activeAbilityCooldownTick]);

  useBattleControls({
    // O debuff da passiva do babidi desabilita habilidades, mas NÃO o ataque básico.
    disabled: baseControlsDisabled,
    attack: () => {
      if (freezeActionsUntilRef.current > Date.now()) return;
      if (isGrabbedRef.current && grabFlippedRef.current) return;
      if (player.machineGamaControl) {
        babidiMissileFireBurstRef.current?.(player);
        return;
      }
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
    cloneVisual: ematronClone,
    press: clonePress,
    release: cloneRelease,
    canUse: cloneUsable,
  } = useEmatronClone({
    player,
    setPlayer,
    battleManaRef,
    obstacles,
    freezeActionsUntilRef,
    setTimeScale,
    resetTimeScale,
    playSound,
    onUsed: onUtilityAbilityUsed,
    isPausedRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
  });

  const {
    press: kiChargePress,
    release: kiChargeRelease,
    canUse: kiChargeUsable,
  } = useEmatronKiCharge({
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

  const handleGenkiDamaExplodeRef = useLatestRef(handleGenkiDamaExplode);

  const {
    genkiDamaVisual,
    press: genkiDamaPress,
    release: genkiDamaRelease,
    canUse: genkiDamaUsable,
  } = useEmatronGenkiDama({
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
    isMenuOpenRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    onUsed: onAbilityUsed,
  });

  addVastolordLaserChargeRef.current = addVastolordLaserCharge;

  const {
    effect: kamehameha,
    press: kamehamehaPress,
    usable: kamehamehaUsable,
  } = useKamehameha({
    player,
    setPlayer,
    PLAYER_SIZE,
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
    isMenuOpenRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    playSound,
    onUsed: onAbilityUsed,
  });

  // Grito da transformação: empurra os inimigos próximos para longe enquanto o
  // Vastolord está nos quadros de grito (screamOne/Two/Three).
  useVastolordRoar({
    transformationFrame,
    playerX: player.x,
    npc,
    setSummons,
  });

  // "I Am Atomic" do marshadow -------------------------------------------------
  // Proporção especial/básico: a explosão deve causar "2x o dano de especial".
  // O playerHit aplica o multiplicador sobre o dano básico (full pipeline:
  // crítico/armadura/elemento), então fatorá-lo pela proporção produz o dano
  // equivalente ao de um especial (sem consumir delícia/cooldown). A mesma
  // proporção alimenta a Expansão de Domínio (burst) dos demais personagens.
  const handleAtomicBoomRef = useLatestRef(handleAtomicBoom);
  const marshadowCutInTriggerLatest = useLatestRef(
    battle.marshadowCutInTrigger,
  );

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
    projectiles: npc.projectiles,
    startSpecialIntro,
    onBoom: handleAtomicBoomRef.current,
    onNpcCutInRef: marshadowCutInTriggerLatest,
    freezeActionsUntilRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    playSound,
    onUsed: onAbilityUsed,
    cooldownReduction: battle.char.stats.cooldownReduction,
  });

  // Expansão de Domínio do marshadow -------------------------------------------
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

    if (battle.npcPhase < getNpcPhaseCount(npcType, npcData.class)) {
      // Destrava o lifecycle (o hook setou o isEnding no início da varredura) e
      // avança para a fase 2, reposicionando os personagens no `usePhaseTransition`.
      // Atualiza TAMBÉM o npcPhase do sistema de batalha (fonte de verdade da
      // fase) e o ref correspondente — caso contrário `battle.npcPhase` segue 1
      // e a próxima varredura (fase 2) é tratada como fase 1, resetando o boss
      // com vida cheia em vez de encerrar a batalha.
      battle.isEnding.current = false;
      const nextPhase = battle.npcPhase + 1;
      battle.setNpcPhase(nextPhase);
      npcPhaseRef.current = nextPhase;
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
    npcPhaseRef,
    npcType,
    onNpcDeathRef,
    vastolordActive,
  ]);

  const {
    mugetsuSweep,
    domainExpansionActive,
    shattering: domainExpansionShattering,
    mugetsuBlink,
    disintegrating,
    press: mugetsuPress,
    usable: mugetsuUsable,
  } = useMugetsuExpansion({
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
    isMenuOpen,
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
  // `habilities/<skill>/background.svg` só existe para o marshadow.
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
    isMenuOpen,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    onBurst: handleDomainBurst,
    playSound,
  });

  // Expansão de Domínio do natsuki (Muryōkūsho) ------------------------------
  // Domínio próprio: congela o mundo, segura a pose `rioiki.svg` por 5s e
  // drena 0,2% da vida MÁXIMA de todos os inimigos a cada 50ms. No fim, se
  // alguém sobreviveu, o `expansion.svg` estilhaça e desce.
  const {
    active: natsukiDomainActive,
    shattering: natsukiDomainShattering,
    press: muryokushoPress,
    usable: muryokushoUsable,
  } = useMuryokushoExpansion({
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
    isMenuOpen,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
    setDelicia: battle.setDelicia,
  });

  const {
    active: ematronHakaiActive,
    shattering: ematronHakaiShattering,
    press: hakaiPress,
    usable: hakaiUsable,
    cloneVisual: ematronHakaiClone,
    hakai: ematronHakai,
  } = useHakaiExpansion({
    player,
    setPlayer,
    npc: { x: npc.x, y: npc.y },
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
    isMenuOpen,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
    setDelicia: battle.setDelicia,
  });

  const {
    domainExpansionActive: babidiDomainActive,
    domainExpansionShattering: babidiDomainShattering,
    press: babidiDomainPress,
    usable: babidiDomainUsable,
    machineGama: babidiMachineGama,
    machineGamaShield: babidiMachineGamaShield,
    breakMachineGama: babidiBreakMachineGama,
    machineGamaControl: babidiMachineGamaControl,
  } = useBabidiDomainExpansion({
    player,
    setPlayer,
    playerMaxHp: battle.playerMaxHp,
    shieldRef: machineGamaShieldRef,
    npc: { x: npc.x, y: npc.y },
    freezeActionsUntilRef,
    disabledRef: cloneDisabledRef,
    isPausedRef,
    battleEndedRef: battle.isEnding,
    startSpecialIntro,
    setDelicia: battle.setDelicia,
    charges: battle.delicia,
    chargesMax: battle.hitsToSpecial,
  });

  machineGamaBreakRef.current = babidiBreakMachineGama;

  const babidiMachineGamaSelfDestruct = useCallback(() => {
    if (!player.machineGamaControl) return;
    const damage = Math.floor(battle.npcMaxHp * 0.8);
    battle.setNpcHP((hp) => Math.max(0, hp - damage));
    setPlayer((p) => ({ ...p, machineGamaControl: false, state: "idle" }));
  }, [player.machineGamaControl, battle, setPlayer]);

  // Machine Gama: consumo de energia dimensional enquanto flutua.
  useEffect(() => {
    if (!player.machineGamaControl) return;
    const interval = setInterval(() => {
      battle.setDelicia((d) => {
        if (d <= 0) {
          setPlayer((p) => ({
            ...p,
            machineGamaControl: false,
            state: "falling",
          }));
          return 0;
        }
        return d - 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [player.machineGamaControl, battle, setPlayer]);

  // Domínio Machine Gama: dispara 8 mísseis (1 a cada 500ms) ao ativar.
  useEffect(() => {
    if (!babidiDomainActive) return;
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 8) {
        clearInterval(interval);
        return;
      }
      count += 1;
      babidiMissileFireRef.current?.(player);
    }, 500);
    return () => clearInterval(interval);
  }, [babidiDomainActive, player]);

  // Preenchimento (`expansion.svg`) e quebra do vidro são um só para toda
  // Expansão de Domínio: o marshadow mostra durante a varredura, o natsuki
  // durante os 5s do dreno.
  const domainBackgroundActive =
    domainExpansionActive ||
    natsukiDomainActive ||
    ematronHakaiActive ||
    babidiDomainActive;
  const domainShattering =
    domainExpansionShattering ||
    natsukiDomainShattering ||
    ematronHakaiShattering ||
    babidiDomainShattering;

  // "Gran Rey Cero" do marshadow ------------------------------------------------
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
    isMenuOpenRef,
    battleEndedRef: battle.isEnding,
    disabledRef: cloneDisabledRef,
    startSpecialIntro,
    playSound,
    onUsed: onAbilityUsed,
    cooldownReduction: battle.char.stats.cooldownReduction,
  });

  // Esferas do natsuki (blue/red) ---------------------------------------------
  const natsukiSpheres = useNatsukiSpheres({
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
    isMenuOpenRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
    specialDamageRatio,
    playerProjectileRef,
  });

  // Bomb drop do babidi (Energia Dimensional) --------------------------------
  const bombDrop = useBabidiBombDrop({
    player,
    setPlayer,
    npc: { x: npc.x, y: npc.y },
    battleManaRef,
    freezeActionsUntilRef,
    isPausedRef,
    disabledRef: cloneDisabledRef,
    battleEndedRef: battle.isEnding,
    playSound,
    onHit: () => {
      battle.playerHit(
        1,
        true,
        true,
        getAbilityDamageType("dimensionalPortal"),
      );
    },
    onUsed: onAbilityUsed,
    cooldownReduction: battle.char.stats.cooldownReduction,
  });

  const domainExpansionAbilities = {
    mugetsu: {
      press: mugetsuPress,
      usable: mugetsuUsable,
    },
    muryokusho: {
      press: muryokushoPress,
      usable: muryokushoUsable,
    },
    hakai: {
      press: hakaiPress,
      usable: hakaiUsable,
    },
    machineGama: {
      press: babidiDomainPress,
      usable: babidiDomainUsable,
    },
  } as const;

  const domainExpansionAbility =
    domainExpansionAbilities[
      domainConfig.kind as keyof typeof domainExpansionAbilities
    ];

  return {
    ...natsukiSpheres,
    babidiBombDrop: bombDrop.visual,
    babidiBombDropPress: bombDrop.press,
    babidiBombDropUsable: bombDrop.usable,
    babidiBombDropRemaining: bombDrop.remaining,
    babidiResetPortals: () => {},
    battle,
    npc,
    charge,
    yvelWeapon,
    switchWeapon: handleWeaponSwitch,
    drikaArm,
    sigiloPhase,
    sigiloOpen,
    pentagramVisible,
    selectedArmIcon,
    openSigilo,
    closeSigilo,
    selectSigiloArm: handleSigiloSelect,
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
    ematronClone: ematronHakai
      ? null
      : ematronHakaiActive
        ? ematronHakaiClone
        : ematronClone,
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
    kamehameha,
    kamehamehaPress,
    kamehamehaUsable,
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
    babidiDomainActive,
    babidiMachineGama,
    babidiMachineGamaControl,
    babidiMachineGamaSelfDestruct,
    babidiMachineGamaShield,
    mugetsuBlink,
    // Mesmo par de props para os três efeitos: o marshadow usa o mugetsu
    // (cutin + varredura), o natsuki a Muryōkūsho (dreno contínuo) e os demais
    // o burst (dano em área).
    domainExpansionPress: domainExpansionAbility?.press ?? domainBurstPress,

    domainExpansionUsable: domainExpansionAbility?.usable ?? domainBurstUsable,
    domainBurstActive,
    domainBackgroundActive,
    domainShattering,
    granReyCeroEffect,
    granReyCeroPress,
    granReyCeroUsable,
    granReyCeroRemaining,
    disintegrating,
    babidiEnergyProjectiles: babidiEnergy.projectiles,
    babidiMissileProjectiles: [
      ...babidiMissile.missiles,
      ...fishingNetMissiles,
    ],
    fishingNet,
    fishingNetPress,
    fishingNetUsable: fishingNetRemaining <= 0,
    fishingNetRemaining,
    babidiAttackVariant: babidiEnergy.attackVariant,
    babidiShieldSides: babidiShield.sides,
    onBabidiShieldEnd: babidiShield.end,
    hakai: ematronHakai,
  };
}
