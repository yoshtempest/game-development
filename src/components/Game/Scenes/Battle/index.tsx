import { BattleHUD } from "@/components/Game/Battle/HUD";
import { GameMap } from "@/components/Game/Map/Game";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleNet } from "@/hooks/battle/useBattleNet";
import { useOnlineBattle } from "@/hooks/battle/useOnlineBattle";
import Talking from "@/components/Game/Interactions/Talking";
import { useTrueVandinhaCutscene } from "@/hooks/battle/useTrueVandinhaCutscene";
import type { TrueVandinhaCutsceneApi } from "@/hooks/battle/useTrueVandinhaCutscene";
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
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useBattleAudio } from "@/hooks/battle/useBattleAudio";
import {
  useBattleViewport,
  getBattleBackgroundStyle,
} from "@/hooks/battle/useBattleViewport";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useTitles } from "@/contexts/TitleContext";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { TrainingOverlay } from "@/components/Game/Battle/Overlay/Training";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { SigiloSelector } from "@/components/Game/Battle/SigiloSelector";
import { BabidiMachineGama } from "@/components/Game/Battle/Entities/Babidi/MachineGama";
import { RemoteResultOverlay } from "@/components/Game/Battle/Overlay/RemoteResult";
import { ConnectionOverlay } from "@/components/Game/Battle/Overlay/Connection";
import { OnlineBattleOverlay } from "@/components/Game/Battle/Overlay/OnlineBattle";
import { CoopSpectatorOverlay } from "@/components/Game/Battle/Overlay/CoopSpectator";
import { PvpMatchOverlay } from "@/components/Game/Battle/Overlay/PvpMatch";
import {
  usePvpOpponentStats,
  usePvpProxy,
} from "@/hooks/battle/pvp/usePvpProxy";
import { usePvpMatch } from "@/hooks/battle/pvp/usePvpMatch";
import { CHARACTERS } from "@/data/characters/list";
import { DrikaSigiloOverlay } from "@/components/Game/Battle/Overlay/DrikaSigilo";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import { playerAbilityPath } from "@/utils/paths";

import type { Props } from "./types";
import type { BattleCoop, NpcHitIntent } from "@/hooks/battle/coop/types";

const MemoBattleEntities = memo(BattleEntities);
const MemoBattleHUD = memo(BattleHUD);

export function BattleScene(props: Props) {
  const {
    npcType,
    className,
    background,
    map,
    isAlfa = false,
    battleLeaderId,
    isPvp = false,
    pvpOpponentId,
    pvpSide = "left",
    pvpBestOf = 1,
  } = props;

  // A cutscene da TrueVandinha fornece o `dialogueOpen` que o `useBattleScene`
  // consome como entrada, mas só conhece `player`/`npc`/`battle` depois que a
  // API da cena é montada — daí o ref preenchido logo após o destructure.
  const cutsceneApiRef = useRef<TrueVandinhaCutsceneApi | null>(null);
  const {
    flash: tvFlash,
    background: tvBackground,
    dialogueOpen: tvDialogueOpen,
    cutsceneOpen: tvCutsceneOpen,
    cutscene: tvCutscene,
  } = useTrueVandinhaCutscene({ npcType, apiRef: cutsceneApiRef });

  const { titlesData } = useTitles();

  // progresso de títulos no início da batalha (capturado uma única vez)
  const titleProgressSnapshotRef = useRef(titlesData.progress);

  const { TILE_SIZE, PLAYER_SIZE, MAP_COLS, MAP_ROWS } = useGameLayout();

  // A camada de rede precisa existir ANTES de `useBattleScene`: a IA do NPC no
  // líder enxerga o parceiro como alvo, e o guest precisa saber que não tem
  // autoridade já no primeiro tick.
  const online = useOnline();
  const battleNet = useBattleNet({ battleLeaderId, isPvp, pvpOpponentId });
  const battleSocketSend = battleNet.send;

  const sendNpcHit = useCallback(
    (hit: NpcHitIntent) => {
      battleSocketSend({ type: "battleNpcHit", ...hit });
    },
    [battleSocketSend],
  );

  // Contrato da cena com a IA: só o líder simula; o guest espelha o NPC e
  // resolve localmente os golpes endereçados a ele.
  const coopActive =
    online.connected && !isPvp && (props.playerCount ?? 1) > 1;
  const pvpOpponent = usePvpOpponentStats(isPvp ? battleNet.remotePlayer : null);
  const pvpDownRef = useRef<() => void>(() => {});
  const coop = useMemo<BattleCoop>(
    () => ({
      active: coopActive,
      authoritative: !battleNet.isGuest && !isPvp,
      localPlayerId: online.playerId,
      remoteTarget: battleNet.remoteTarget,
      remoteAlive: battleNet.remoteAlive,
      sendNpcHit,
      pvp: isPvp,
      pvpSide,
      pvpOpponent,
      pvpDownRef,
    }),
    [
      isPvp,
      pvpSide,
      pvpOpponent,
      coopActive,
      battleNet.isGuest,
      battleNet.remoteTarget,
      battleNet.remoteAlive,
      online.playerId,
      sendNpcHit,
    ],
  );

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
    coopSpectator,
    runCoopDefeat,
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
    coop,
  });

  cutsceneApiRef.current = { player, npc, battle };

  let controlsDisabled = _controlsDisabled;

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
    battleLeaderId,
    isPvp,
    net: battleNet,
    coopActive,
    runCoopDefeat,
  });

  const {
    isBattleHost,
    isBattleGuest,
    battleSocketConnected,
    battleSocketReconnecting,
    remotePlayerState,
    interpRemotePlayer,
    guestHasSnapshot,
    remoteResult,
    remoteRewards,
    handleRetrySync,
    handleContinueSync,
    showVictory,
    showDefeat,
    remoteBattleSnapshot,
    interpolatedRemoteSnapshot,
  } = onlineBattle;

  // ── Duelo PvP ──────────────────────────────────────────────────────────
  // Cada jogador controla o próprio avatar; o NPC local é o proxy do oponente.
  const pvpOpponentLabel =
    battleNet.remotePlayer?.name ??
    online.room?.players.find((p) => p.id === pvpOpponentId)?.name ??
    "Oponente";
  const pvpMatch = usePvpMatch({
    enabled: isPvp,
    bestOf: pvpBestOf,
    playerId: online.playerId,
    opponentId: pvpOpponentId ?? null,
    opponentSeen: battleNet.remotePlayer != null,
    opponentFresh: battleNet.remoteFresh,
    resetRound: handleRetry,
    onLeave: () => void navigate(-1),
    send: battleSocketSend,
    subscribe: battleNet.subscribe,
  });
  pvpDownRef.current = pvpMatch.reportLocalDown;

  usePvpProxy({
    enabled: isPvp,
    playerId: online.playerId,
    opponentId: pvpOpponentId ?? null,
    remote: battleNet.remotePlayer,
    interp: battleNet.interpRemotePlayer,
    npc,
    battle,
    playerX: player.x,
    acceptingDamage: pvpMatch.phase === "fighting",
    send: battleSocketSend,
    subscribe: battleNet.subscribe,
  });

  // A intro "jogador × NPC" mostraria o dummy que ocupa o slot do oponente.
  const skipIntroRef = useLatestRef(skipIntro);
  useEffect(() => {
    if (isPvp) skipIntroRef.current();
  }, [isPvp, skipIntroRef]);

  if (isPvp && pvpMatch.phase !== "fighting") {
    controlsDisabled = true;
  }
  // Espectador do co-op: caído, sem agir até a dupla vencer ou cair.
  if (coopSpectator) {
    controlsDisabled = true;
  }

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

  const {
    screenWidth,
    containerWidth,
    containerHeight,
    initialBgPosRef,
    battleScaleX,
    battleScaleY,
    effectiveBackground,
  } = useBattleViewport({ background, cutsceneBackground: tvBackground });

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

  const { worldOffsetX, worldOffsetY, zoom, shake, adjustedBgX, adjustedBgY } =
    camera;

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

  const { isBattleNavOpen } = useBattleNavbar();

  useBattleAudio({
    src: props.audioSrc,
    showIntro,
    showVictory,
    showDefeat,
    showHighlight,
    isBattleNavOpen,
  });

  // Grupos de props memoizados: estabilizam a identidade dos objetos passados aos
  // filhos pesados, evitando re-render quando apenas estado não relacionado muda.
  const battleEntitiesProps = useMemo(
    () => ({
      hideMainNpc: isPvp,
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
      isPvp,
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

  const opponentName = pvpOpponentLabel;
  const opponentCharacterRaw = battleNet.remotePlayer?.character;
  const opponentCharacter = CHARACTERS.find((c) => c === opponentCharacterRaw);
  const opponentLevel = battleNet.remotePlayer?.level ?? 1;
  const opponentMaxHp = pvpOpponent?.maxHp;
  const hudOpponent = useMemo(
    () =>
      isPvp && opponentCharacter && opponentMaxHp
        ? {
            name: opponentName,
            character: opponentCharacter,
            level: opponentLevel,
            maxHp: opponentMaxHp,
          }
        : null,
    [isPvp, opponentName, opponentCharacter, opponentLevel, opponentMaxHp],
  );

  const battleHudProps = useMemo(
    () => ({
      opponent: hudOpponent,
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
      hudOpponent,
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

  // Quem é o "outro" jogador: no PvP é o oponente do convite; no co-op de
  // guilda é quem iniciou a batalha (o líder), não necessariamente o host.
  const remotePlayerId = isPvp ? pvpOpponentId : battleLeaderId;
  const remoteCharacter =
    online.room?.players.find((p) => p.id === remotePlayerId)?.character ??
    online.room?.players.find((p) => p.id !== online.playerId)?.character ??
    "drika";

  // Líder do co-op e os dois lados do duelo recebem o estado do outro jogador
  // direto (`battlePlayerState`); o guest do co-op o lê do snapshot do líder.
  const secondPlayer =
    isBattleHost || isPvp
    ? remotePlayerState
      ? {
          ...remotePlayerState,
          x: interpRemotePlayer?.x ?? remotePlayerState.x,
          y: interpRemotePlayer?.y ?? remotePlayerState.y,
        }
      : null
    : interpolatedRemoteSnapshot?.player
      ? {
          x: interpolatedRemoteSnapshot.player.x,
          y: interpolatedRemoteSnapshot.player.y,
          hp: remoteBattleSnapshot?.player?.hp ?? 0,
          state: interpolatedRemoteSnapshot.player.state,
          direction: interpolatedRemoteSnapshot.player.direction,
          character:
            interpolatedRemoteSnapshot.player.character ?? remoteCharacter,
        }
      : null;

  return (
    <div
      className={`Master ${className ?? ""}`}
      style={getBattleBackgroundStyle({
        effectiveBackground,
        zoom,
        adjustedBgX,
        adjustedBgY,
        shake,
      })}
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
              direction={(secondPlayer.direction as Direction) ?? "down"}
            />
          )}

          <DrikaSigiloOverlay
            character={player.character}
            playerX={player.x}
            playerY={player.y}
            pentagramVisible={pentagramVisible}
            selectedArmIcon={selectedArmIcon}
          />

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
        xpReward={
          isBattleGuest ? (remoteRewards?.xpReward ?? xpReward) : xpReward
        }
        lastRewards={
          isBattleGuest
            ? ((remoteRewards?.lastRewards as typeof lastRewards) ??
              lastRewards)
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

      <CoopSpectatorOverlay
        visible={coopSpectator && !showVictory && !showDefeat}
      />

      <ConnectionOverlay
        visible={!isBattleHost && !battleSocketConnected}
        reconnecting={battleSocketReconnecting}
      />

      <OnlineBattleOverlay
        isBattleGuest={isBattleGuest}
        guestHasSnapshot={guestHasSnapshot}
      />

      {isPvp && (
        <PvpMatchOverlay match={pvpMatch} opponentName={pvpOpponentLabel} />
      )}

      {props.children}
    </div>
  );
}
