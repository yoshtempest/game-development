import { useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { petStarsFromEnhance } from "@/data/characters/pets/petProgress";
import { useEquipment } from "@/contexts/EquipmentContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useQuests } from "@/contexts/QuestContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useTitles } from "@/contexts/TitleContext";
import { usePlayTimeActions } from "@/contexts/PlayTimeContext";
import { useSettings } from "@/hooks/settings/useSetting";
import { useTombstones } from "@/contexts/TombstoneContext";
import { useNpcSetup } from "@/hooks/battle/npc/useSetup";
import { getNpcLevel } from "@/data/npc";
import { useBattleRewards } from "@/hooks/battle/rewards/useRewards";
import { useSummons } from "@/hooks/battle/summon/useSummons";
import { useAllies } from "@/hooks/battle/summon/useAllies";
import { useCoffinAnimation } from "@/hooks/battle/summon/useCoffinAnimation";
import { getPetSkillDefinition } from "@/data/characters/pets/petSkills";
import { getEquipmentStatsBonus } from "@/gameRules/battle/equipment";
import { combatService } from "@/services/combat";
import { loadBestTime } from "@/utils/bestTime";
import { buildSummonWrapper } from "@/gameRules/battle/petSkill/buildSummonWrapper";
import { useBattleInfo } from "@/contexts/BattleInfoContext";
import { useBattleIntro } from "@/hooks/battle/modals/useIntro";
import type { ReplayData, ReplayFrame } from "@/utils/types/replay";

type Props = {
  npcType: string;
  npcLevelProp?: number;
  isAlfa: boolean;
};

export function useBattleStageSetup({ npcType, npcLevelProp, isAlfa }: Props) {
  const {
    player,
    setPlayer,
    setMode,
    attack,
    startAbility,
    resetBattleState,
    difficulty,
    playerClass,
    setPlayerState,
    lastBlockPressRef,
    lastAttackPressRef,
    battleTenacityRef,
    freezeActionsUntilRef,
    forcePunchRef,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    setTimeScale,
    resetTimeScale,
    timeScaleRef,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
  } = usePlayer();

  const {
    progress,
    reduceHunger,
    getXPToNextLevel,
    setBattleHP,
    setBattleMana,
  } = useCharacterProgress();
  const playerLevel = progress[player.character]?.level ?? 1;
  const { getPetProgress } = usePetProgress();
  const { getEquippedInfo } = useEquipment();
  const { showHighlight: showHighlightEnabled } = useSettings();
  const petInfo = getEquippedInfo(player.character, "pet");
  const petStars = petInfo ? petStarsFromEnhance(petInfo.enhance) : 1;
  const petLevel = petInfo ? getPetProgress(petInfo.id, petStars).level : 1;
  const petId = petInfo?.id ?? null;
  const petSkillDef = petId ? getPetSkillDefinition(petId) : null;
  const { items: inventoryItems, closeInventory } = useInventory();
  const { quests, progressDailyWeekly } = useQuests();
  const { closeNavbar } = useNavbar();
  const {
    handleDefeat,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDamageDealt,
    incrementDodgeCounter,
  } = useTitles();

  const { addBattleTime } = usePlayTimeActions();

  const { playSound } = useSoundEffects();
  const { spawnVictoryTombstone, clearPendingTombstoneSpawn } = useTombstones();

  const [npcPhase, setNpcPhase] = useState(1);
  const [npcArmorBonus, setNpcArmorBonus] = useState(0);
  const npcPhaseRef = useLatestRef(npcPhase);
  const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);

  const battleStartRef = useRef(Date.now());
  const savedPlayerHPRef = useRef(progress[player.character]?.battleHP ?? null);
  const [rewindFrames, setRewindFrames] = useState<ReplayFrame[] | null>(null);
  const [victoryElapsed, setVictoryElapsed] = useState(0);
  const [bestTime, setBestTime] = useState(loadBestTime(npcType));

  const prevModeRef = useRef(player.mode);
  const pauseStartRef = useRef(0);
  const pauseDurationRef = useRef(0);

  useEffect(() => {
    if (prevModeRef.current !== "menu" && player.mode === "menu") {
      pauseStartRef.current = Date.now();
    } else if (prevModeRef.current === "menu" && player.mode !== "menu") {
      pauseDurationRef.current += Date.now() - pauseStartRef.current;
    }
    prevModeRef.current = player.mode;
  }, [player.mode]);

  const { showIntro, skipIntro } = useBattleIntro();

  const { npcData, npcLevel, npcStats } = useNpcSetup(
    npcType,
    difficulty,
    npcLevelProp ?? getNpcLevel(npcType),
    isAlfa ? 2 : 1,
  );

  const battleInfoCtx = useBattleInfo();
  const battleInfoCtxRef = useLatestRef(battleInfoCtx);

  useEffect(() => {
    const battleInfo = battleInfoCtxRef.current;
    battleInfo?.setBattleInfo({
      npcType,
      npcLevel,
      npcClass: npcData.class,
      npcHp: npcStats.hp,
      npcDamage: npcStats.damage,
      npcArmor: npcStats.armor,
    });
    return () => {
      battleInfo?.clearBattleInfo();
    };
  }, [
    npcType,
    npcLevel,
    npcData.class,
    npcStats.hp,
    npcStats.damage,
    npcStats.armor,
    battleInfoCtxRef,
  ]);

  const equipmentBonus = getEquipmentStatsBonus(player.character);
  const totalLuck =
    progress[player.character].stats.luck + (equipmentBonus.luck ?? 0);
  const luckBonus = combatService.getLuckBonus(totalLuck);

  const { xpReward, prepareBattleLoot, grantLootBag, giveSummonRewards } =
    useBattleRewards({
      npcClass: npcData.class,
      npcLevel,
      npcType,
      luckBonus,
      isAlfa,
    });

  const { summons, setSummons, summonNpc, clearSummons, updateNpcPosition } =
    useSummons({
      npcLevel,
      difficulty,
      playerX: player.x,
      playerGroundY: player.groundY,
    });

  const summonsBleedUntilRef = useRef<Record<string, number>>({});

  const { allies, setAllies, summonAlly, clearAllies } = useAllies({
    npcLevel,
    difficulty,
    playerX: player.x,
    playerGroundY: player.groundY,
  });

  const {
    coffins,
    beginSequence: beginCoffinSequence,
    clearCoffins,
  } = useCoffinAnimation();

  const coffinStartedRef = useRef(false);
  const summonNpcRef = useLatestRef(summonNpc);

  const alfaSummonsSpawnedRef = useRef(false);
  useEffect(() => {
    // O alfa hungryDog usa o cenário "invocação": os aliados surgem correndo
    // pela direita durante a intro (2s), então não spawna summons no início.
    if (!isAlfa || npcType === "hungryDog" || alfaSummonsSpawnedRef.current)
      return;
    alfaSummonsSpawnedRef.current = true;
    summonNpc(npcType);
    summonNpc(npcType);
  }, [isAlfa, npcType, summonNpc]);

  const onSummonWrapperRef = useLatestRef(
    buildSummonWrapper({
      npcType,
      npcPhaseRef,
      coffinStartedRef,
      playSound,
      beginCoffinSequence,
      player,
      summonNpcRef,
    }),
  );

  const charProgress = progress[player.character];
  const xpNeeded = getXPToNextLevel(charProgress.level);
  const missingXp = xpNeeded - charProgress.xp;

  const getReplayDataRef = useLatestRef<() => ReplayData | null>(() => null);

  return {
    player,
    setPlayer,
    setMode,
    attack,
    startAbility,
    resetBattleState,
    difficulty,
    playerClass,
    setPlayerState,
    lastBlockPressRef,
    lastAttackPressRef,
    battleTenacityRef,
    freezeActionsUntilRef,
    forcePunchRef,
    ematronComboMultiplierRef,
    ematronComboActiveRef,
    ematronComboAirActiveRef,
    ematronComboStepIndexRef,
    setTimeScale,
    resetTimeScale,
    timeScaleRef,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    progress,
    reduceHunger,
    setBattleHP,
    setBattleMana,
    playerLevel,
    getEquippedInfo,
    showHighlightEnabled,
    petStars,
    petLevel,
    petId,
    petSkillDef,
    inventoryItems,
    closeInventory,
    quests,
    progressDailyWeekly,
    closeNavbar,
    handleDefeat,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDamageDealt,
    incrementDodgeCounter,
    addBattleTime,
    playSound,
    spawnVictoryTombstone,
    clearPendingTombstoneSpawn,
    npcPhase,
    setNpcPhase,
    npcArmorBonus,
    setNpcArmorBonus,
    npcPhaseRef,
    isPhaseTransitioning,
    setIsPhaseTransitioning,
    battleStartRef,
    savedPlayerHPRef,
    rewindFrames,
    setRewindFrames,
    victoryElapsed,
    setVictoryElapsed,
    bestTime,
    setBestTime,
    prevModeRef,
    pauseStartRef,
    pauseDurationRef,
    showIntro,
    skipIntro,
    npcData,
    npcLevel,
    npcStats,
    xpReward,
    prepareBattleLoot,
    grantLootBag,
    giveSummonRewards,
    summons,
    setSummons,
    summonNpc,
    clearSummons,
    updateNpcPosition,
    summonsBleedUntilRef,
    allies,
    setAllies,
    summonAlly,
    clearAllies,
    coffins,
    beginCoffinSequence,
    clearCoffins,
    coffinStartedRef,
    summonNpcRef,
    onSummonWrapperRef,
    charProgress,
    missingXp,
    getReplayDataRef,
  };
}
