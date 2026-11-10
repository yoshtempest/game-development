import { BattleHUD } from "@/components/Game/Battle/HUD";
import { GameMap } from "@/components/Game/Map/Game";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useOnline } from "@/contexts/OnlineContext";
import { useOnlineBattle } from "@/hooks/battle/useOnlineBattle";
import { useCutscene } from "@/hooks/interaction/cutscene/useCutscene";
import Talking from "@/components/Game/Interactions/Talking";
import { trueVandinhaBattleDialogue } from "@/data/dialogues/trueVandinhaBattle/one";
import { useGameLayout } from "@/hooks/game/useGameLayout";
import { useBattleScene } from "@/hooks/battle/main/battleScene/useScene";
import { useBattleCamera } from "@/hooks/battle/camera/useBattleCamera";
import { BattleBackground } from "./components/Background";
import { BattleAbilities } from "./components/Abilities";
import { BattleModals } from "./components/Modals";
import { BattleEntities } from "@/components/Game/Battle/Entities";
import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import type { CharacterId } from "@/data/characters/list";
import { BattleMap } from "@/components/Game/Map/Battle";
import { DamageNumbers } from "@/components/Game/Battle/Effects/DamageNumbers";
import { LootPickup } from "@/components/Game/Battle/Effects/LootPickup";
import { ComboDisplay } from "@/components/Game/Battle/Effects/ComboDisplay";
import { StatusEffects } from "@/components/Game/Battle/Effects/StatusEffects";
import { BattleIntro } from "@/components/Game/Battle/Modal/Intro";
import { ChargeParticles } from "@/components/Game/Battle/Effects/ChargeParticles";
import { KokusenAnimation } from "@/components/Game/Battle/Effects/Natsuki/KokusenAnimation";
import { DivergentFistAnimation } from "@/components/Game/Battle/Effects/Natsuki/DivergentFistAnimation";
import { BlackFlashAnimation } from "@/components/Game/Battle/Effects/Natsuki/BlackFlashAnimation";
import { VastolordTimer } from "@/components/Game/Battle/Effects/Marshadow/VastolordTimer";
import { SkipAnimationButton } from "@/components/Game/Battle/SkipAnimationButton";
import { SpecialIntro } from "@/components/Game/Battle/Effects/SpecialIntro";
import { DomainExpansionIntro } from "@/components/Game/Battle/Effects/Domain/DomainExpansionIntro";
import { DomainExpansionBackground } from "@/components/Game/Battle/Effects/Domain/DomainExpansionBackground";
import { DomainBurstOverlay } from "@/components/Game/Battle/Effects/Domain/DomainBurstOverlay";
import { AlfaAbility } from "@/components/Game/Battle/Effects/Ability/AlfaAbility";
import { JumpIndicator } from "@/components/Game/Battle/Jump/indicator";
import { JumpDangerZone } from "@/components/Game/Battle/Jump/dangerZone";
import { ComboAction } from "@/components/Game/Battle/Buttons/ComboAction";
import { useGameAudio } from "@/hooks/game/useGameAudio";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useTitles } from "@/contexts/TitleContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { TrainingOverlay } from "@/components/Game/Battle/TrainingOverlay";
import { ProjectileConstants } from "@/data/projectile";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { SigiloSelector } from "@/components/Game/Battle/SigiloSelector";
import { BabidiMachineGama } from "@/components/Game/Battle/Entities/Babidi/MachineGama";
import { RemoteResultOverlay } from "@/components/Game/Battle/RemoteResultOverlay";
import { ConnectionOverlay } from "@/components/Game/Battle/ConnectionOverlay";
import { OnlineBattleOverlay } from "@/components/Game/Battle/OnlineBattleOverlay";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import {
  npcPath,
  playerAbilityPath,
  playerPath,
} from "@/utils/paths";
import { GAME_VIEWPORT_WIDTH_RATIO } from "@/data/grid";
import { getViewportSize } from "@/utils/viewport";

import type { Props } from "./types";

const MemoBattleEntities = memo(BattleEntities);
const MemoBattleHUD = memo(BattleHUD);

export function BattleScene(props: Props) {
  const { npcType, className, background, map, isAlfa = false } = props;

  const isTrueVandinha = npcType === "trueVandinha";

  // Estado da cutscene da TrueVandinha.
  const [tvCutsceneOpen, setTvCutsceneOpen] = useState(false);
  const [tvFlash, setTvFlash] = useState(false);
  const [tvBackground, setTvBackground] = useState<string | null>(null);
  const [tvDialogueOpen, setTvDialogueOpen] = useState(false);
  const tvTriggeredRef = useRef(false);
  const tvPhase2Ref = useRef(false);

  const tvCutscene = useCutscene({
    dialogue: trueVandinhaBattleDialogue,
    autoStart: false,
    onFinish: () => {
      setTvCutsceneOpen(false);
      setTvDialogueOpen(false);
    },
  });

  const { stopAll } = useSoundEffects();
  const { titlesData } = useTitles();

  // progresso de títulos no início da batalha (capturado uma única vez)
  const titleProgressSnapshotRef = useRef(titlesData.progress);

  const { TILE_SIZE, PLAYER_SIZE, MAP_COLS, MAP_ROWS } = useGameLayout();

  const {
    player,
    npc,
    battle,
    npcStats,
    npcLevel,
    summons,
    allies,
    coffins,
    pet,
    petSkill,
    xpReward,
    lastRewards,
    showVictory: _showVictory,
    showDefeat: _showDefeat,
    showOutro,
    showClear,
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
    training: isTraining,
    controlsDisabled: _controlsDisabled,
    battlePaused,
    showRetry,
    playerProjectile,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
    extraPunches,
    extraPunchSprite,
    yvelWeapon,
    switchWeapon,
    drikaArm,
    sigiloPhase,
    sigiloOpen,
    pentagramVisible,
    selectedArmIcon,
    openSigilo,
    closeSigilo,
    selectSigiloArm,
    convertCursedEnergy,
    blink,
    blinkVisual,
    divergentFistActive,
    activateDivergentFist,
    divergentFistFrame,
    honoredOneActive,
    honoredSequence,
    skipHonoredOne,
    skipVastolordTransform,
    kokusenActive,
    kokusenFrame,
    blackFlashActive,
    blackFlashVariant,
    cameraFocus,
    triggerAbilityCameraFocus,
    vastolordActive,
    vastolordRemainingMs,
    vastolordTransformationFrame: transformationFrame,
    specialIntroActive,
    specialIntroCharacter,
    lootBags,
    lootNotifications,
    npcClass,
    ematronClone,
    babidiClones,
    hakai,
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
    specialIntroAbility,
    specialIntroForm,
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
    babidiMachineGama,
    babidiMachineGamaControl,
    babidiMachineGamaSelfDestruct,
    babidiMachineGamaShield,
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
    babidiEnergyProjectiles,
    babidiMissileProjectiles,
    fishingNet,
    fishingNetPress,
    fishingNetUsable,
    fishingNetRemaining,
    babidiBombDrop,
    babidiBombDropPress,
    babidiBombDropUsable,
    babidiBombDropRemaining,
    babidiAttackVariant,
    babidiShieldSides,
    onBabidiShieldEnd,
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
  } = useBattleScene({
    ...props,
    isAlfa,
    PLAYER_SIZE,
    dialogueOpen: tvDialogueOpen,
  });

  let controlsDisabled = _controlsDisabled;

  const online = useOnline();

  const onlineBattle = useOnlineBattle({
    player,
    npc,
    battle,
    handleRetry,
    handleContinue,
    showVictoryBase: _showVictory,
    showDefeatBase: _showDefeat,
    xpReward,
    lastRewards,
  });

  const {
    isBattleHost,
    isBattleGuest,
    battleSocketConnected,
    battleSocketReconnecting,
    remotePlayerState,
    interpRemotePlayer,
    guestHasSnapshot,
    opponentHP,
    opponentMaxHP,
    remoteResult,
    remoteRewards,
    handleRetrySync,
    handleContinueSync,
    showVictory,
    showDefeat,
    remoteBattleSnapshot,
    interpolatedRemoteSnapshot,
  } = onlineBattle;

  if (isBattleGuest) {
    controlsDisabled = true;
  }

  // Cutscene da TrueVandinha: ao se aproximar na 1ª fase, dispara fall + flash +
  // diálogo + transição para a 2ª fase.
  useEffect(() => {
    if (!isTrueVandinha) return;
    if (tvTriggeredRef.current) return;
    if ((battle.npcPhase ?? 1) !== 1) return;
    const dist = Math.abs(npc.x - player.x);
    if (dist > 90) return;

    tvTriggeredRef.current = true;
    // Bloqueia a IA e o lifecycle (que, para boss de 1ª fase, avançaria de
    // fase sozinho ao zerar o HP). A cutscene assume o controle a partir daqui.
    battle.isEnding.current = true;
    npc.updateNpc({ state: "fall" });
    battle.setNpcHP(0);

    // Pausa a batalha imediatamente para a IA não sobrescrever o sprite.
    setTvDialogueOpen(true);

    setTvFlash(true);
    window.setTimeout(() => setTvFlash(false), 500);

    window.setTimeout(() => {
      setTvBackground(npcPath("/trueVandinha/shenLong.svg"));
      npc.updateNpc({ state: "giveMeMyPower" });
      setTvCutsceneOpen(true);
      tvCutscene.start();
    }, 500);
  }, [isTrueVandinha, npc.x, player.x, npc, battle, tvCutscene]);

  useEffect(() => {
    if (!isTrueVandinha) return;
    if (!tvCutsceneOpen) return;
    if (tvPhase2Ref.current) return;
    // Terceiro diálogo (índice 2): "Muito bem, seu desejo..."
    if (tvCutscene.index !== 2) return;

    tvPhase2Ref.current = true;
    battle.setNpcPhase(2);
    battle.setNpcHP(battle.npcMaxHp);
    battle.isEnding.current = false;
    npc.updateNpc({ state: "giveMeMyPower" });
  }, [isTrueVandinha, tvCutsceneOpen, tvCutscene.index, battle, npc]);
  // Domínio do personagem atual: nome/cor/efeito saem de DOMAIN_EXPANSIONS e
  // alimentam o botão universal e o overlay do burst.
  const domainConfig = DOMAIN_EXPANSIONS[player.character];
  // A intro é o `background.svg` (SpecialIntro) e o preenchimento é o
  // `expansion.svg` (DomainExpansionBackground) — só quem tem `hasBackgroundArt`.
  const domainExpansionArt = domainConfig.hasBackgroundArt
    ? playerAbilityPath(player.character, "domainExpansion", "expansion.svg")
    : undefined;

  // Especial do alfa: enquanto ele usa a habilidade (ex: special dig do
  // hungryDog, quando a gauge enche), o overlay `alfa/background.svg` aparece.
  const alfaDigActive =
    isAlfa && npcType === "hungryDog" && npc.ai?.hungryDog?.phase === "dig";

  // Com o resultado definido, o sprite do jogador na arena troca para o mesmo
  // retrato do BattleOutro (`expressions/victory|defeat.svg`) e permanece
  // assim até o retry/ida embora — o modal do outro continua intacto. Treino
  // não monta o BattleOutro, então não troca (mesma condição do render).
  const outroExpression: "victory" | "defeat" | null = isTraining
    ? null
    : showDefeat
      ? "defeat"
      : showVictory
        ? "victory"
        : null;

  const { setBattleCollision } = usePlayerActions();

  const { width: screenWidth, height: screenHeight } = getViewportSize();
  const containerWidth = screenWidth * GAME_VIEWPORT_WIDTH_RATIO;
  const containerHeight = screenHeight;

  const initialBgPosRef = useRef({
    x: (BATTLE_SPAWN.player.x / ProjectileConstants.MAP_WIDTH) * 100,
    y: (BATTLE_SPAWN.player.y / ProjectileConstants.MAP_HEIGHT) * 100,
  });

  const groundShakeActive = npc.projectiles.some(
    (p) =>
      p.variant === "ground" &&
      p.detonatesOnHit === true &&
      !p.impacted &&
      (p.dirX > 0 ? p.x < player.x : p.x > player.x),
  );

  const camera = useBattleCamera({
    containerWidth,
    containerHeight,
    screenWidth,
    initialBgPosRef,
    player,
    npc: npc as unknown as {
      x: number;
      y: number;
      projectiles: Array<{
        variant?: string;
        detonatesOnHit?: boolean;
        impacted?: boolean;
        dirX: number;
        x: number;
      }>;
    },
    cameraFocus,
    sphereFocus,
    mugetsuSweep,
    domainExpansionActive,
    damageNumbers: battle.damageNumbers,
    groundShakeActive,
    castActive,
    transformationFrame,
  });

  const { worldOffsetX, worldOffsetY, zoom, shake, adjustedBgX, adjustedBgY } = camera;

  const battleScaleX = screenWidth / ProjectileConstants.MAP_WIDTH;
  const battleScaleY = screenHeight / ProjectileConstants.MAP_HEIGHT;

  // Expansão de Domínio: o fundo da batalha permanece o original — quem cobre
  // a cena é o overlay `background.svg` (DomainExpansionBackground), surgindo
  // sendo renderizado de baixo para cima durante a habilidade inteira.
  const effectiveBackground = tvBackground ?? background;

  const damageTargets = [
    {
      x: player.x,
      y: player.y,
      h: PLAYER_SIZE / PLAYER_SPRITE_DIVISOR,
    },
    {
      x: npc.x,
      y: npc.y,
      h: TILE_SIZE * getBossSizeMultiplier(npcType, battle.npcPhase, isAlfa),
    },
    ...summons.map((s) => ({
      x: s.x,
      y: s.y,
      h: TILE_SIZE * getBossSizeMultiplier(s.npcType),
    })),
  ];


  useEffect(() => {
    setBattleCollision({
      map: map ?? null,
      TILE_SIZE,
    });
  }, [map, TILE_SIZE, setBattleCollision]);

  useEffect(() => {
    return () => {
      setBattleCollision({ map: null, TILE_SIZE: 0 });
    };
  }, [setBattleCollision]);

  const battleAudio = useGameAudio({
    src: props.audioSrc,
    loop: true,
    volume: 0.5,
  });
  const battleAudioRef = useLatestRef(battleAudio);
  const { isBattleNavOpen } = useBattleNavbar();

  useEffect(() => {
    const shouldPlay =
      !showIntro &&
      !showVictory &&
      !showDefeat &&
      !showHighlight &&
      !isBattleNavOpen;

    if (shouldPlay && !battleAudioRef.current.isPlaying()) {
      void battleAudioRef.current.play();
    } else if (!shouldPlay && battleAudioRef.current.isPlaying()) {
      battleAudioRef.current.pause();
    }

    if (showVictory || showDefeat) {
      stopAll();
    }
  }, [
    showIntro,
    showVictory,
    showDefeat,
    showHighlight,
    isBattleNavOpen,
    stopAll,
    battleAudioRef,
  ]);

  // Grupos de props memoizados: estabilizam a identidade dos objetos passados aos
  // filhos pesados, evitando re-render quando apenas estado não relacionado muda.
  const battleEntitiesProps = useMemo(
    () => ({
      npc,
      player,
      battle,
      npcType,
      summons,
      allies,
      coffins,
      pet,
      TILE_SIZE,
      PLAYER_SIZE,
      grabFlipped,
      isAlfa,
      playerProjectile,
      killerQueen,
      bombTargets,
      killerQueenSprite,
      bombSprite,
      explosionSprite,
      extraPunches,
      extraPunchSprite,
      weapon: player.character === "drika" ? drikaArm : yvelWeapon,
      sigiloPhase: player.character === "drika" ? sigiloPhase : undefined,
      playerForm: vastolordActive ? ("vastolordForm" as const) : undefined,
      transformationFrame,
      blinkVisual,
      lootBags,
      npcClass,
      ematronClone,
      babidiClones,
      genkiDamaVisual,
      vastolordLaser,
      kamehameha,
      granReyCeroEffect,
      cutInEnemie: battle.cutInEnemie,
      npcBleeding: battle.npcBleeding,
      preAtomic: specialIntroActive,
      outroExpression,
      atomicHalo,
      atomicExplosion,
      atomicCuts,
      atomicFlash,
      mugetsuSweep,
      mugetsuBlink,
      disintegrating,
      babidiEnergyProjectiles,
      babidiMissileProjectiles,
      fishingNet,
      babidiBombDrop,
      babidiAttackVariant,
      babidiMachineGamaControl,
      babidiShieldSides,
      onBabidiShieldEnd,
      sphere,
      purpleHole,
      hakai,
    }),
    [
      npc,
      player,
      battle,
      npcType,
      summons,
      allies,
      coffins,
      pet,
      TILE_SIZE,
      PLAYER_SIZE,
      grabFlipped,
      isAlfa,
      playerProjectile,
      killerQueen,
      bombTargets,
      killerQueenSprite,
      bombSprite,
      explosionSprite,
      extraPunches,
      extraPunchSprite,
      yvelWeapon,
      drikaArm,
      sigiloPhase,
      vastolordActive,
      transformationFrame,
      blinkVisual,
      lootBags,
      npcClass,
      ematronClone,
      babidiClones,
      genkiDamaVisual,
      vastolordLaser,
      kamehameha,
      granReyCeroEffect,
      specialIntroActive,
      outroExpression,
      atomicHalo,
      atomicExplosion,
      atomicCuts,
      atomicFlash,
      mugetsuSweep,
      mugetsuBlink,
      disintegrating,
      babidiEnergyProjectiles,
      babidiMissileProjectiles,
      fishingNet,
      babidiBombDrop,
      babidiAttackVariant,
      babidiMachineGamaControl,
      babidiShieldSides,
      onBabidiShieldEnd,
      sphere,
      purpleHole,
      hakai,
    ],
  );

  const battleHudProps = useMemo(
    () => ({
      battle,
      npcStats,
      npcType,
      npcLevel,
      summons,
      allies,
      isAlfa,
      playerForm: vastolordActive ? ("vastolordForm" as const) : undefined,
      machineGamaShield: babidiMachineGamaShield,
      machineGamaShieldMax: battle.playerMaxHp * 10,
      npcSpecialGauge:
        isAlfa && npcType === "hungryDog"
          ? npc.ai?.hungryDog?.specialGauge
          : undefined,
    }),
    [
      battle,
      npcStats,
      npcType,
      npcLevel,
      summons,
      allies,
      isAlfa,
      vastolordActive,
      babidiMachineGamaShield,
      npc,
    ],
  );

  const secondPlayer = isBattleHost
    ? (remotePlayerState
        ? { ...remotePlayerState, x: interpRemotePlayer?.x ?? remotePlayerState.x, y: interpRemotePlayer?.y ?? remotePlayerState.y }
        : null)
    : interpolatedRemoteSnapshot?.player
      ? {
          x: interpolatedRemoteSnapshot.player.x,
          y: interpolatedRemoteSnapshot.player.y,
          hp: remoteBattleSnapshot?.player?.hp ?? 0,
          state: interpolatedRemoteSnapshot.player.state,
          character:
            online.room?.players.find((p) => p.id !== online.playerId)
              ?.character ?? "drika",
        }
      : null;

  return (
    <div
      className={`Master ${className ?? ""}`}
      style={
        effectiveBackground
          ? {
              backgroundImage: `url(${effectiveBackground})`,
              backgroundSize: `calc(150% * ${zoom})`,
              backgroundPosition: `calc(${adjustedBgX}% + ${shake.x}px) calc(${adjustedBgY}% + ${shake.y}px)`,
            }
          : undefined
      }
    >
      <BattleBackground
        effectiveBackground={effectiveBackground}
        zoom={zoom}
        adjustedBgX={adjustedBgX}
        adjustedBgY={adjustedBgY}
        shake={shake}
        tvFlash={tvFlash}
      />
      {/* Preenchimento do domínio: PRIMEIRO filho do `.Master`, para pintar
          como o `backgroundImage` da batalha — acima do fundo, abaixo de todo
          o resto (HUD do jogador e do NPC, ComboDisplay, SceneMap, intros) por
          ordem de DOM + z-index 0. Posicionado com `inset: 0`. A quebra do
          vidro (quando sobra inimigo) também mora aqui. */}
      <DomainExpansionBackground
        active={domainBackgroundActive}
        src={domainExpansionArt}
        shattering={domainShattering}
        paused={battlePaused}
      />

      <MemoBattleHUD {...battleHudProps} />
      <ComboDisplay
        count={comboCount}
        rank={comboRank}
        progress={comboProgress}
        nextRank={nextRank}
      />
      <StatusEffects />
      {showIntro && !isTraining && (
        <BattleIntro
          playerCharacter={player.character}
          npcType={npcType}
          introAudioSrc={props.introAudioSrc}
          onSkip={skipIntro}
          onFlee={() => navigate(-1)}
          isAlfa={isAlfa}
        />
      )}

      <DomainBurstOverlay
        active={domainBurstActive}
        name={domainConfig.name}
        accent={domainConfig.accent}
        paused={battlePaused}
      />

      {/* Renderizado antes do `.SceneMap`: fica acima do fundo da batalha,
          mas abaixo do jogador/NPCs (que são filhos do SceneMap). A Expansão
          de Domínio é especial: ela tem intro própria (varredura) e o
          SpecialIntro fica restrito às habilidades normais. */}
      {specialIntroAbility === "domainExpansion" ? (
        <DomainExpansionIntro
          active={specialIntroActive}
          character={specialIntroCharacter}
          paused={battlePaused}
        />
      ) : (
        <SpecialIntro
          active={specialIntroActive}
          character={specialIntroCharacter}
          ability={specialIntroAbility}
          form={specialIntroForm}
          paused={battlePaused}
        />
      )}

      <AlfaAbility active={alfaDigActive} npcType={npcType} />

      <div className="SceneMap">
        <GameMap
          TILE_SIZE={TILE_SIZE}
          cols={MAP_COLS}
          rows={MAP_ROWS}
          cameraX={worldOffsetX + shake.x}
          cameraY={worldOffsetY + shake.y}
          zoom={zoom}
          focusX={camera.focus.x}
          focusY={camera.focus.y}
        >
          {map && <BattleMap map={map} />}

          {npcType === "slimita" &&
            (battle.npcPhase ?? 1) >= 2 &&
            npc.jumpLandingX != null && (
              <JumpDangerZone landingX={npc.jumpLandingX} />
            )}

          <MemoBattleEntities {...battleEntitiesProps} />

          {online.connected && secondPlayer && (
            <PlayerBattle
              character={(secondPlayer.character as CharacterId) ?? "drika"}
              x={secondPlayer.x}
              y={secondPlayer.y}
              PLAYER_SIZE={PLAYER_SIZE}
              state={(secondPlayer.state as PlayerState) ?? "idle"}
              direction="down"
            />
          )}

          {player.character === "drika" && pentagramVisible && (
            <>
              <style>{`@keyframes sigiloFadeIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>
              <img
                src={playerPath("/drika/inFight/habilities/sigilo/pentagram.svg")}
                alt="pentagram"
                style={{
                  position: "absolute",
                  left: player.x,
                  top: player.y,
                  transform: "translate(-50%, -50%)",
                  animation: "sigiloFadeIn 0.3s ease forwards",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            </>
          )}

          {player.character === "drika" && selectedArmIcon && (
            <img
              src={playerPath(`/drika/inFight/arms/${selectedArmIcon}`)}
              alt="selected arm"
              style={{
                position: "absolute",
                left: player.x,
                top: player.y - 40,
                transform: "translate(-50%, -100%)",
                pointerEvents: "none",
                zIndex: 6,
              }}
            />
          )}

          <ChargeParticles
            particles={charge.particles}
            playerX={player.x}
            playerY={player.y}
            chargeReady={charge.chargeReady}
            isCharging={charge.isCharging}
          />

          {npc.jumpLandingX != null &&
            !(npcType === "slimita" && (battle.npcPhase ?? 1) >= 2) && (
              <JumpIndicator landingX={npc.jumpLandingX} />
            )}

          <DamageNumbers
            numbers={battle.damageNumbers}
            scaleX={battleScaleX}
            scaleY={battleScaleY}
            targets={damageTargets}
          />

          <LootPickup
            notifications={lootNotifications}
            scaleX={battleScaleX}
            scaleY={battleScaleY}
          />

          <KokusenAnimation
            active={kokusenActive}
            frame={kokusenFrame}
            npcX={npc.x}
            npcY={npc.y}
            npcHeight={
              TILE_SIZE *
              getBossSizeMultiplier(npcType, battle.npcPhase, isAlfa)
            }
          />

          <DivergentFistAnimation
            frame={divergentFistFrame}
            npcX={npc.x}
            npcY={npc.y}
            npcHeight={
              TILE_SIZE *
              getBossSizeMultiplier(npcType, battle.npcPhase, isAlfa)
            }
          />

          <BlackFlashAnimation
            active={blackFlashActive}
            variant={blackFlashVariant}
            playerX={player.x}
            playerY={player.y}
          />

          {vastolordActive && (
            <>
              <VastolordTimer remainingMs={vastolordRemainingMs} />
              {transformationFrame != null && (
                <SkipAnimationButton
                  onSkip={skipVastolordTransform}
                  label="transformação Vastolord"
                />
              )}
            </>
          )}
          {honoredSequence && (
            <SkipAnimationButton
              onSkip={skipHonoredOne}
              label="O mais honrado"
            />
          )}
        </GameMap>
      </div>
      <BattleModals
        showClear={showClear}
        isTraining={isTraining ?? false}
        showOutro={showOutro}
        handleCloseOutro={handleCloseOutro}
        playerCharacter={player.character}
        showHighlight={showHighlight}
        highlightData={highlightData}
        handleCloseHighlight={handleCloseHighlight}
        showVictory={showVictory}
        npcType={npcType}
        npcLevel={npcLevel}
        xpReward={isBattleGuest ? (remoteRewards?.xpReward ?? xpReward) : xpReward}
        lastRewards={
          isBattleGuest
            ? ((remoteRewards?.lastRewards as typeof lastRewards) ?? lastRewards)
            : lastRewards
        }
        handleContinue={handleContinueSync}
        skipVictoryDelay={skipVictoryDelay}
        victoryElapsed={victoryElapsed}
        bestTime={bestTime}
        getReplayData={getReplayData}
        isAlfa={isAlfa}
        titleProgressSnapshot={titleProgressSnapshotRef.current}
        showDefeat={showDefeat}
        handleRetry={handleRetrySync}
        navigate={navigate}
        defeatProgress={defeatProgress}
        defeatElapsed={defeatElapsed}
        showRetry={showRetry}
      />

      <ComboAction />

      <BattleAbilities
        scene={{
          player,
          battle,
          triggerAbilityCameraFocus,
          petSkill,
          pet,
          switchWeapon,
          yvelWeapon,
          openSigilo,
          sphere,
          bluePress,
          blueUsable,
          redPress,
          redUsable,
          purplePress,
          purpleUsable,
          activateDivergentFist,
          divergentFistActive,
          blink,
          convertCursedEnergy,
          honoredOneActive,
          atomicPress,
          atomicUsable,
          atomicRemaining,
          granReyCeroPress,
          granReyCeroUsable,
          granReyCeroRemaining,
          vastolordActive,
          vastolordLaserPress,
          vastolordLaserUsable,
          vastolordLaserStacks,
          activeAbilityPress,
          activeAbilityUsable,
          activeAbilityRemaining,
          babidiBombDropPress,
          babidiBombDropUsable,
          babidiBombDropRemaining,
          fishingNetPress,
          fishingNetUsable,
          fishingNetRemaining,
          babidiMachineGamaControl,
          babidiMachineGamaSelfDestruct,
          domainExpansionPress,
          domainExpansionUsable,
          clonePress,
          cloneRelease,
          cloneUsable,
          kiChargePress,
          kiChargeRelease,
          kiChargeUsable,
          genkiDamaPress,
          genkiDamaRelease,
          genkiDamaUsable,
          kamehamehaPress,
          kamehamehaUsable,
        }}
        controlsDisabled={controlsDisabled}
        isBattleNavOpen={isBattleNavOpen}
      />

      <BabidiMachineGama machineGama={babidiMachineGama} />
      {isTraining && <TrainingOverlay onLeave={() => navigate(-1)} />}

      {tvCutsceneOpen && tvCutscene.dialogue && (
        <Talking
          name={tvCutscene.dialogue.name}
          message={tvCutscene.dialogue.message}
          src={tvCutscene.dialogue.src}
          soundSrc={tvCutscene.dialogue.soundSrc}
          onNext={tvCutscene.next}
        />
      )}

      <SigiloSelector
        open={!!sigiloOpen}
        currentArm={drikaArm}
        onSelect={(arm) => selectSigiloArm?.(arm)}
        onClose={() => closeSigilo?.()}
      />

      <RemoteResultOverlay
        visible={!isBattleHost && !!remoteResult}
        result={remoteResult}
      />

      <ConnectionOverlay
        visible={!isBattleHost && !battleSocketConnected}
        reconnecting={battleSocketReconnecting}
      />

      <OnlineBattleOverlay
        onlineConnected={online.connected}
        opponentHP={opponentHP}
        opponentMaxHP={opponentMaxHP}
        isBattleGuest={isBattleGuest}
        guestHasSnapshot={guestHasSnapshot}
      />

      {props.children}
    </div>
  );
}
