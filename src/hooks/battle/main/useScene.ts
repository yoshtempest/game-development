import { useEffect, useMemo, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useNavigate, useLocation } from "react-router";
import { useBattleMana } from "@/contexts/BattleManaContext";
import { useBattleLoot } from "@/hooks/battle/loot/useBattleLoot";
import { useLootNotifications } from "@/hooks/battle/loot/useLootNotifications";
import { useBattleRefs } from "@/hooks/battle/utilities/useRefs";
import { useBattleOutro } from "@/hooks/battle/modals/useOutro";
import { useBattleStageSetup } from "@/hooks/battle/useBattleStageSetup";
import { useBattleCombat } from "@/hooks/battle/main/useBattleCombat";
import { useBattlePresentation } from "@/hooks/battle/utilities/useBattlePresentation";
import { VASTOLORD_TRANSFORM_MS } from "@/hooks/battle/player/characters/marshadow/useVastolordForm";
import { useBattleRecording } from "@/hooks/battle/recording/useBattleRecording";
import { useRewind } from "@/hooks/battle/rewind/useRewind";
import { useBattleSnapshots } from "@/hooks/battle/time/useBattleSnapshots";
import { useHonoredOne } from "@/hooks/battle/player/characters/natsuki/useHonoredOne";
import { useDefeatFlow } from "@/hooks/battle/defeat/useDefeatFlow";
import {
  useCameraSequence,
  CAMERA_FOCUS_MS,
  type CameraFocus,
} from "@/hooks/battle/effects/useCameraSequence";
import { buildBattleSceneApi } from "@/hooks/battle/utilities/buildBattleSceneApi";
import { getCharacterPassive } from "@/data/characters/passives";
import { aggregateRewards } from "@/gameRules/battle/loot/buildLootBags";
import { CHARACTERS } from "@/data/characters/list";
import { saveGame } from "@/services/save/saveService";
import { loadBestTime, saveBestTime } from "@/utils/bestTime";
import { recordWin } from "@/utils/rewards";
import { computeElapsedBattleTime } from "@/hooks/battle/time/computeElapsedBattleTime";
import { INVOCATION_MS } from "@/services/npc/attacks/hungryKing/state";
import type { BattleMapConfig } from "@/utils/types/maps/battle";
import type { LootBagContents } from "@/utils/types/battle/loot";

type Props = {
  npcType: string;
  redirectTo?: string;
  audioSrc: string;
  onVictory?: () => void;
  map?: BattleMapConfig;
  background?: string;
  training?: boolean;
  isAlfa?: boolean;
  npcLevel?: number;
  PLAYER_SIZE: number;
};

export function useBattleScene({
  npcType,
  redirectTo,
  audioSrc,
  onVictory,
  map,
  background,
  training,
  isAlfa = false,
  npcLevel: npcLevelProp,
  PLAYER_SIZE,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const setup = useBattleStageSetup({
    npcType,
    npcLevelProp,
    isAlfa,
  });

  const {
    player,
    setPlayer,
    setMode,
    resetBattleState,
    difficulty,
    forcePunchRef,
    resetTimeScale,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
    freezeActionsUntilRef,
    progress,
    reduceHunger,
    setBattleHP,
    setBattleMana,
    playerLevel,
    showHighlightEnabled,
    isNavOpen,
    navScreen,
    isBattleNavOpen,
    handleDefeat,
    addBattleTime,
    playSound,
    spawnVictoryTombstone,
    clearPendingTombstoneSpawn,
    npcPhase,
    setNpcPhase,
    battleStartRef,
    prevModeRef,
    pauseStartRef,
    pauseDurationRef,
    rewindFrames,
    setRewindFrames,
    victoryElapsed,
    setVictoryElapsed,
    bestTime,
    setBestTime,
    showIntro,
    skipIntro,
    npcData,
    npcLevel,
    npcStats,
    xpReward,
    grantLootBag,
    prepareBattleLoot,
    summons,
    setSummons,
    summonNpc,
    clearSummons,
    clearAllies,
    clearCoffins,
    coffinStartedRef,
    onSummonWrapperRef,
    summonsBleedUntilRef,
    progressDailyWeekly,
    charProgress,
    missingXp,
    getReplayDataRef,
    allies,
    coffins,
  } = setup;

  const {
    showVictory,
    triggerVictory,
    showDefeat,
    setShowDefeat,
    showOutro,
    showHighlight,
    highlightData,
    handleCloseHighlight,
    skipVictoryDelay,
    lastRewards,
    setLastRewards,
    handleCloseOutro,
    handleContinue,
  } = useBattleOutro({
    redirectTo,
    onVictory,
    getReplayData: () => getReplayDataRef.current(),
    showHighlightEnabled,
  });

  const refs = useBattleRefs();

  const battleMana = useBattleMana();
  const battleManaRef = useLatestRef(battleMana);

  const isConfigOpen = isNavOpen && navScreen === "config";
  const isMenuOpen = isNavOpen || isBattleNavOpen;
  const isMenuOpenRef = useLatestRef(isMenuOpen);
  const honoredOneEnabled =
    getCharacterPassive(player.character, "honoredOne") != null && !training;

  const {
    honoredOneActiveRef,
    honoredOneActive,
    honoredRegenActive,
    honoredFleeRef,
    surviveLethalHitRef,
    resetHonoredOne,
  } = useHonoredOne({
    enabled: honoredOneEnabled,
    player,
    setPlayer,
    playSound,
    refs,
    freezeActionsUntilRef,
    resetTimeScale,
    battleManaRef,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
  });

  const isPausedRef = useRef(false);
  const lootActiveRef = useRef(false);

  const vastolordEndingRef = useRef<{ current: boolean }>({ current: false });
  const runDefeatRef = useRef<() => void>(() => {});

  const cursedEnergyParams =
    getCharacterPassive(player.character, "cursedEnergy") != null;

  const {
    kokusenActive,
    kokusenFrame,
    onKokusenRef,
    blackFlashActive,
    blackFlashVariant,
    onBlackFlashRef,
    blinkVisual,
    triggerBlink,
    clearBlink,
    divergentFistActive,
    setDivergentFistActive,
    divergentFistRef,
    divergentFistFrame,
    clearDivergentFist,
    onDivergentFistConsumedRef,
    vastolordActive,
    vastolordRemainingMs,
    transformationFrame,
    triggerVastolord,
    resetVastolord,
    extendVastolord,
    vastolordUsedRef,
    vastolordActiveRef,
    vastolordMultiplierRef,
  } = useBattlePresentation({
    setup,
    audioSrc,
    training,
    isPausedRef,
    vastolordEndingRef,
    runDefeatRef,
  });

  const extendVastolordRef = useLatestRef(extendVastolord);

  // Fase 2 do hungryKing: a câmera foca o rei exatamente durante a invocação
  // (os hungryDeaths spawnam ao redor dele); depois desfoca para o jogador.
  const cameraFocusMs =
    npcType === "hungryKing" && npcPhase === 2
      ? INVOCATION_MS
      : CAMERA_FOCUS_MS;

  const cameraFocus = useCameraSequence({
    npcPhase,
    vastolordActive,
    enabled: rewindFrames == null && !showVictory && !showDefeat,
    focusMs: cameraFocusMs,
  });

  // Enquanto a câmera está focada (troca de fase do boss / transformação
  // vastolord), o jogador fica travado: movimento, ataque e ações são
  // bloqueados por `freezeActionsUntilRef` (lido no useBattleMovement e nos
  // handlers de ataque). O ataque já é bloqueado por `isPaused`, mas o
  // movimento só respeita o freeze — este efeito cobre esse gap. Usamos
  // `Math.max` para nunca encurtar um freeze já ativo (ex.: os 4s da
  // transformação vastolord começam antes do foco da câmera).
  useEffect(() => {
    if (!cameraFocus.isFrozen) return;
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + cameraFocusMs,
    );
  }, [cameraFocus.isFrozen, freezeActionsUntilRef, cameraFocusMs]);

  const isPaused =
    showVictory ||
    showDefeat ||
    showIntro ||
    showOutro != null ||
    showHighlight ||
    rewindFrames != null ||
    isConfigOpen ||
    isBattleNavOpen ||
    cameraFocus.isFrozen ||
    transformationFrame != null;
  isPausedRef.current = isPaused;

  const performRewindRef = useRef<() => boolean>(() => false);

  /**
   * Passiva Forma Vastolord do marcelo: em vez de perder a batalha, revive com
   * 100% de HP e entra na forma por 10s (uma vez por batalha). A morte dispara
   * a animação de transformação (4s de `transformating/*`) com o som dedicado;
   * durante ela o jogador fica travado (`freezeActionsUntilRef`) e a batalha
   * pausada (`transformationFrame != null` no isPaused).
   */
  const tryVastolordRevivalRef = useLatestRef(() => {
    if (!getCharacterPassive(player.character, "vastolordForm")) return false;
    if (vastolordUsedRef.current || vastolordActiveRef.current) return false;

    vastolordUsedRef.current = true;
    battle.isEnding.current = false;
    battle.setPlayerHP(battle.playerMaxHp);
    setPlayer((p) => ({ ...p, state: "idle" }));
    playSound("vastolordTransformation");
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + VASTOLORD_TRANSFORM_MS,
    );
    triggerVastolord();
    return true;
  });

  const battleLootContentsRef = useRef<LootBagContents[]>([]);

  const onPlayerDeathRef = useLatestRef(() => {
    if (rewindFrames != null) {
      battle.isEnding.current = true;
      return;
    }

    if (training) {
      battle.resetBattle();
      return;
    }

    if (performRewindRef.current()) {
      playSound("returningTime");
      battle.isEnding.current = true;
      return;
    }

    if (tryVastolordRevivalRef.current()) {
      return;
    }

    const isHardMode = difficulty === "hard" || difficulty === "insano";
    const allOthersDefeated = CHARACTERS.filter(
      (c) => c !== player.character,
    ).every((c) => progress[c]?.battleHP === 0);

    if (isHardMode && allOthersDefeated) {
      for (const c of CHARACTERS) {
        setBattleHP(c, 1);
        setBattleMana(c, null);
      }
      setMode("explore");
      void navigate(-1);
      return;
    }

    runDefeatRef.current();
  });

  const onNpcDeathRef = useLatestRef(() => {
    if (training) {
      battle.setNpcHP(battle.npcMaxHp);
      return;
    }
    setBattleHP(player.character, battle.playerHP);
    const mana = battleManaRef.current;
    if (mana) {
      setBattleMana(
        player.character,
        mana.playerMana >= mana.playerMaxMana ? null : mana.playerMana,
      );
    }
    reduceHunger(player.character, 5);
    recordWin(player.character);

    progressDailyWeekly("win_battle", 1);
    progressDailyWeekly("kill_any", 1);

    const npcClass = killCounter.npcDataRef.current.class;
    if (npcClass === "common") progressDailyWeekly("kill_common", 1);
    else if (npcClass === "rare") progressDailyWeekly("kill_rare", 1);
    else if (npcClass === "epic") progressDailyWeekly("kill_epic", 1);
    else if (npcClass === "boss") progressDailyWeekly("kill_boss", 1);

    const d = saveDataRef.current;
    saveGame({
      lastRoute: location.pathname,
      inventory: d.items,
      quests: d.quests,
      playerClass: d.playerClass,
      character: d.character,
    });
    const elapsed = computeElapsedBattleTime(
      battleStartRef,
      prevModeRef,
      pauseStartRef,
      pauseDurationRef,
    );
    setVictoryElapsed(elapsed);
    addBattleTime(player.character, Math.floor(elapsed / 1000));
    saveBestTime(npcType, elapsed);
    setBestTime(loadBestTime(npcType));
    spawnVictoryTombstone(npcType);
    killCounter.handleNpcDeath(
      killCounter.npcTypeRef.current,
      killCounter.npcDataRef.current.class,
      isAlfa,
    );

    const lootContents = prepareBattleLoot();
    battleLootContentsRef.current = lootContents;
    lootActiveRef.current = true;
    startBattleLoot(lootContents, npc.x, npc.y);
  });

  const combat = useBattleCombat({
    setup,
    refs,
    npcType,
    isAlfa,
    training: training ?? false,
    obstacles: map?.obstacles,
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
    cursedEnergyEnabled: cursedEnergyParams,
    onKokusenRef,
    onBlackFlashRef,
    onDivergentFistConsumedRef,
    triggerBlink,
    divergentFistActive,
    divergentFistRef,
    setDivergentFistActive,
  });

  const {
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
    comboProgress,
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
    activeAbilityPress,
    activeAbilityUsable,
    activeAbilityRemaining,
    specialIntroAbility,
    mugetsuSweep,
    domainExpansionActive,
    mugetsuBlink,
    disintegrating,
    domainExpansionPress,
    domainExpansionUsable,
    domainBurstActive,
    domainBackgroundActive,
    domainShattering,
    granReyCeroEffect,
    granReyCeroPress,
    granReyCeroUsable,
    granReyCeroRemaining,
    lucauaEnergyProjectiles,
    lucauaAttackVariant,
    lucauaShieldSides,
    onLucauaShieldEnd,
    lucauaPortals,
    lucauaPortalGhost,
    lucauaPortalSelection,
    lucauaPortalLanding,
    lucauaPortalFocus,
    lucauaPortalClick,
    lucauaPortalPick,
    lucauaPortalUsable,
    lucauaPortalCount,
    lucauaPortalCost,
    lucauaPortalMaxPortals,
    sphere,
    sphereFocus,
    castActive,
    purpleHole,
    bluePress,
    blueUsable,
    redPress,
    redUsable,
    purplePress,
    purpleUsable,
  } = combat;

  vastolordEndingRef.current = battle.isEnding;

  // Invocação do hungryKing na entrada da fase 2. A câmera está focada nele
  // (e a IA pausada), então a invocação é disparada aqui, no início do foco:
  // o rei entra na pose "pitch" e os hungryDeaths surgem ao redor dele.
  const hungryKingInvokeRef = useRef(false);
  useEffect(() => {
    if (npcPhase === 1) {
      hungryKingInvokeRef.current = false;
      return;
    }
    if (npcType !== "hungryKing" || npcPhase !== 2) return;
    if (!cameraFocus.isFrozen || hungryKingInvokeRef.current) return;
    hungryKingInvokeRef.current = true;

    npc.updateNpc({ state: "pitch" });

    // Ajusta a IA antes de desfocar: knownPhase evita o handlePhaseChange
    // resetar hasSummoned; summonEndTime encerra a pose "pitch" na hora.
    const hkAi = npc.ai?.hungryKing;
    if (hkAi) {
      hkAi.knownPhase = 2;
      hkAi.hasSummoned = true;
      hkAi.summonEndTime = Date.now() + INVOCATION_MS;
    }

    onSummonWrapperRef.current("hungryDeath");
  }, [cameraFocus.isFrozen, npcPhase, npcType, npc, onSummonWrapperRef]);

  const {
    notifications: lootNotifications,
    spawnLootNotification,
    clearNotifications: clearLootNotifications,
  } = useLootNotifications();

  const {
    bags: lootBags,
    isActive: lootActive,
    start: startBattleLoot,
  } = useBattleLoot({
    playerX: player.x,
    playerY: player.y,
    pet: battle.pet,
    setPet: battle.setPet,
    isPausedRef,
    onCollect: grantLootBag,
    onNotify: spawnLootNotification,
    onDone: () => {
      lootActiveRef.current = false;
      setLastRewards(aggregateRewards(battleLootContentsRef.current, xpReward));
      triggerVictory();
    },
    playSound,
  });

  const {
    playerSnapshotRef,
    npcSnapshotRef,
    battleSnapshotRef,
    petSnapshotRef,
    comboSnapshotRef,
    comboActionRef,
    damageNumbersSnapshotRef,
    summonsSnapshotRef,
    npcProjectilesSnapshotRef,
  } = useBattleSnapshots({
    player,
    npc,
    battle,
    comboCount,
    comboRank,
    comboProgress,
    nextRank,
    summons,
    controlsDisabled,
  });

  const {
    isRecording,
    startRecording,
    stopRecording,
    getReplayData,
    getReplayWindow,
  } = useBattleRecording({
    playerRef: playerSnapshotRef,
    npcRef: npcSnapshotRef,
    battleRef: battleSnapshotRef,
    damageNumbersRef: damageNumbersSnapshotRef,
    summonsRef: summonsSnapshotRef,
    petRef: petSnapshotRef,
    comboRef: comboSnapshotRef,
    comboActionRef,
    npcType: training ? "__training" : npcType,
    npcLevel,
    npcClass: npcData.class,
    playerCharacter: player.character,
    playerLevel,
    background: background ?? "",
    audioSrc,
  });

  const wasIntroActiveRef = useRef(showIntro);

  useEffect(() => {
    getReplayDataRef.current = getReplayData;
  }, [getReplayData, getReplayDataRef]);

  useEffect(() => {
    if (wasIntroActiveRef.current && !showIntro) {
      startRecording();
    }
    wasIntroActiveRef.current = showIntro;
  }, [showIntro, startRecording]);

  useEffect(() => {
    if ((showVictory || showDefeat) && isRecording) {
      stopRecording();
    }
  }, [showVictory, showDefeat, isRecording, stopRecording]);

  const { reset: resetRewind } = useRewind({
    character: player.character,
    rewindFrames,
    setRewindFrames,
    performRewindRef,
    setPlayer,
    setNpcPhase,
    setSummons,
    playerSnapshotRef,
    npcSnapshotRef,
    battleSnapshotRef,
    npcProjectilesSnapshotRef,
    summonsSnapshotRef,
    battle,
    npc,
    resetCombo,
    getReplayWindow,
  });

  const defeatProgress: number = useMemo(() => {
    if (showDefeat) {
      const totalPhases = npcData.class === "boss" ? 2 : 1;
      const currentPhase = battle.npcPhase ?? 1;
      const completedPhases = Math.max(0, currentPhase - 1);
      const hpProgress =
        battle.npcMaxHp > 0
          ? (battle.npcMaxHp - battle.npcHP) / battle.npcMaxHp
          : 0;
      const raw = (completedPhases + hpProgress) / totalPhases;
      return Math.min(1, Math.max(0, raw));
    }
    return 0;
  }, [
    showDefeat,
    battle.npcHP,
    battle.npcMaxHp,
    battle.npcPhase,
    npcData.class,
  ]);

  const { handleRetry, defeatElapsed } = useDefeatFlow({
    player,
    setBattleHP,
    setBattleMana,
    handleDefeat,
    clearPendingTombstoneSpawn,
    setShowDefeat,
    addBattleTime,
    battleStartRef,
    prevModeRef,
    pauseStartRef,
    pauseDurationRef,
    runDefeatRef,
    resetRewind,
    charge,
    startRecording,
    resetVastolord,
    vastolordUsedRef,
    resetHonoredOne,
    resetTimeScale,
    clearBlink,
    clearDivergentFist,
    divergentFistRef,
    setDivergentFistActive,
    forcePunchRef,
    clearSummons,
    clearAllies,
    clearCoffins,
    coffinStartedRef,
    npcRootedUntilRef,
    rootedSummonsUntilRef,
    summonsBleedUntilRef,
    npcEnchantUntilRef,
    isAlfa,
    summonNpc,
    npcType,
    battle,
    npc,
    resetBattleState,
    resetCombo,
    grabbedTimerRef,
    setIsGrabbed,
  });

  // Intro do alfa hungryDog: câmera foca no alfa enquanto ele invoca (2s),
  // sem congelar a batalha (a animação é dirigida pela IA do NPC).
  const alfaIntroFocus: CameraFocus | null =
    isAlfa && npcType === "hungryDog" && npc.ai?.hungryDog?.phase === "intro"
      ? { entity: "npc", zoom: 1 }
      : null;

  return buildBattleSceneApi({
    player,
    npc,
    battle,
    npcStats,
    npcLevel,
    npcClass: npcData.class,
    summons,
    allies,
    coffins,
    pet: battle.pet,
    petSkill: battle.petSkill,
    charProgress,
    missingXp,
    xpReward,
    lastRewards,
    showVictory,
    showDefeat,
    showOutro,
    showHighlight,
    highlightData,
    handleCloseHighlight,
    handleCloseOutro,
    handleRetry,
    handleContinue,
    navigate,
    showIntro,
    skipIntro,
    skipVictoryDelay,
    comboCount,
    comboRank,
    comboProgress,
    nextRank,
    charge,
    defeatElapsed,
    victoryElapsed,
    bestTime,
    defeatProgress,
    grabFlipped,
    getReplayData,
    isRecording,
    training,
    controlsDisabled,
    showRetry: true,
    playerProjectile,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
    extraPunches,
    extraPunchSprite,
    lucasWeapon,
    switchWeapon: handleWeaponSwitch,
    convertCursedEnergy: handleCursedEnergyConversion,
    blink: handleBlink,
    blinkVisual,
    divergentFistActive,
    activateDivergentFist: handleActivateDivergentFist,
    divergentFistFrame,
    honoredOneActive,
    kokusenActive,
    kokusenFrame,
    blackFlashActive,
    blackFlashVariant,
    cameraFocus: cameraFocus.focus ?? alfaIntroFocus,
    vastolordActive,
    vastolordRemainingMs,
    vastolordTransformationFrame: transformationFrame,
    specialIntroActive,
    specialIntroCharacter,
    specialIntroForm,
    lootBags,
    lootActive,
    lootNotifications,
    clearLootNotifications,
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
    specialIntroAbility,
    atomicHalo,
    atomicExplosion,
    atomicCuts,
    atomicFlash,
    atomicPress,
    atomicUsable,
    atomicRemaining,
    activeAbilityPress,
    activeAbilityUsable,
    activeAbilityRemaining,
    mugetsuSweep,
    domainExpansionActive,
    mugetsuBlink,
    disintegrating,
    domainExpansionPress,
    domainExpansionUsable,
    domainBurstActive,
    domainBackgroundActive,
    domainShattering,
    granReyCeroEffect,
    granReyCeroPress,
    granReyCeroUsable,
    granReyCeroRemaining,
    lucauaEnergyProjectiles,
    lucauaAttackVariant,
    lucauaShieldSides,
    onLucauaShieldEnd,
    lucauaPortals,
    lucauaPortalGhost,
    lucauaPortalSelection,
    lucauaPortalLanding,
    lucauaPortalFocus,
    lucauaPortalClick,
    lucauaPortalPick,
    lucauaPortalUsable,
    lucauaPortalCount,
    lucauaPortalCost,
    lucauaPortalMaxPortals,
    sphere,
    sphereFocus,
    castActive,
    purpleHole,
    bluePress,
    blueUsable,
    redPress,
    redUsable,
    purplePress,
    purpleUsable,
  });
}
