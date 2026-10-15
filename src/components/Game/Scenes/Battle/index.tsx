import { BattleHUD } from "@/components/Game/Battle/HUD";
import { PetSkillButton } from "@/components/Game/Battle/Buttons/PetSkill";
import { WeaponSwitchButton } from "@/components/Game/Battle/Buttons/WeaponSwitch";
import { CursedEnergyButton } from "@/components/Game/Battle/Buttons/Natsuki/CursedEnergy";
import { BlinkButton } from "@/components/Game/Battle/Buttons/Natsuki/Blink";
import { DivergentFistButton } from "@/components/Game/Battle/Buttons/Natsuki/DivergentFist";
import { SphereJunction } from "@/components/Game/Battle/Buttons/Natsuki/SphereJunction";
import { EmanuelCloneButton } from "@/components/Game/Battle/Buttons/Ematron/Clone";
import { EmanuelKiChargeButton } from "@/components/Game/Battle/Buttons/Ematron/KiCharge";
import { EmanuelGenkiDamaButton } from "@/components/Game/Battle/Buttons/Ematron/GenkiDama";
import { VastolordLaserButton } from "@/components/Game/Battle/Buttons/Marshadow/VastolordLaser";
import { AtomicButton } from "@/components/Game/Battle/Buttons/Marshadow/Atomic";
import { KillerQueenButton } from "@/components/Game/Battle/Buttons/Artur/KillerQueen";
import { StackExplosionButton } from "@/components/Game/Battle/Buttons/Larissa/StackExplosion";
import { LucauaPortalsButton } from "@/components/Game/Battle/Buttons/Lucaua/Portals";
import { PortalSelect } from "@/components/Game/Battle/Modal/PortalSelect";
import { DomainExpansionButton } from "@/components/Game/Battle/Buttons/DomainExpansion";
import { GranReyCeroButton } from "@/components/Game/Battle/Buttons/Marshadow/GranReyCero";
import { GameMap } from "@/components/Game/Map/Game";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameLayout } from "@/hooks/game/useGameLayout";
import { useBattleScene } from "@/hooks/battle/main/useScene";
import { BattleEntities } from "@/components/Game/Battle/Entities";
import { BattleMap } from "@/components/Game/Map/Battle";
import { DamageNumbers } from "@/components/Game/Battle/Effects/DamageNumbers";
import { LootPickup } from "@/components/Game/Battle/Effects/LootPickup";
import { ComboDisplay } from "@/components/Game/Battle/Effects/ComboDisplay";
import { StatusEffects } from "@/components/Game/Battle/Effects/StatusEffects";
import { VictoryModal } from "@/components/Game/Battle/Modal/Victory";
import { DefeatModal } from "@/components/Game/Battle/Modal/Defeat";
import { BattleIntro } from "@/components/Game/Battle/Modal/Intro";
import { BattleOutro } from "@/components/Game/Battle/Modal/Outro";
import { BattleHighlight } from "@/components/Game/Battle/Modal/Highlight";
import { ChargeParticles } from "@/components/Game/Battle/Effects/ChargeParticles";
import { KokusenAnimation } from "@/components/Game/Battle/Effects/Natsuki/KokusenAnimation";
import { DivergentFistAnimation } from "@/components/Game/Battle/Effects/Natsuki/DivergentFistAnimation";
import { BlackFlashAnimation } from "@/components/Game/Battle/Effects/Natsuki/BlackFlashAnimation";
import { VastolordTimer } from "@/components/Game/Battle/Effects/Marshadow/VastolordTimer";
import { SpecialIntro } from "@/components/Game/Battle/Effects/SpecialIntro";
import { DomainExpansionBackground } from "@/components/Game/Battle/Effects/DomainExpansionBackground";
import { DomainBurstOverlay } from "@/components/Game/Battle/Effects/DomainBurstOverlay";
import { AlfaAbility } from "@/components/Game/Battle/Effects/AlfaAbility";
import { JumpIndicator } from "@/components/Game/Battle/Jump/indicator";
import { JumpDangerZone } from "@/components/Game/Battle/Jump/dangerZone";
import { ComboAction } from "@/components/Game/Battle/Buttons/ComboAction";
import { useGameAudio } from "@/hooks/game/useGameAudio";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { useTitles } from "@/contexts/TitleContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useBattleMana } from "@/contexts/BattleManaContext";
import { useCameraShake } from "@/hooks/battle/effects/useCameraShake";
import { LUCAS_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import {
  CURSED_ENERGY_HEAL_RATIO,
  BLINK_ENERGY_COST,
  DIVERGENT_FIST_COST,
} from "@/gameRules/battle/cursedEnergy";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { BattleMapConfig } from "@/utils/types/maps/battle";
import { TrainingOverlay } from "@/components/Game/Battle/TrainingOverlay";
import { ProjectileConstants } from "@/data/projectile";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import { npcPath, playerAbilityBackgroundPath, playerAbilityPath } from "@/utils/paths";
import { GAME_VIEWPORT_WIDTH_RATIO } from "@/data/grid";
import { getViewportSize } from "@/utils/viewport";

type Props = {
  npcType: string;
  redirectTo?: string;
  victoryDescription: string;
  className?: string;
  background?: string;
  audioSrc: string;
  introAudioSrc?: string;
  onVictory?: () => void;
  map?: BattleMapConfig;
  training?: boolean;
  isAlfa?: boolean;
  npcLevel?: number;
  children?: ReactNode;
};

export function BattleScene(props: Props) {
  const { npcType, className, background, map, isAlfa = false } = props;
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
    training: isTraining,
    controlsDisabled,
    showRetry,
    playerProjectile,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
    extraPunches,
    extraPunchSprite,
    lucasWeapon,
    switchWeapon,
    convertCursedEnergy,
    blink,
    blinkVisual,
    divergentFistActive,
    activateDivergentFist,
    divergentFistFrame,
    honoredOneActive,
    kokusenActive,
    kokusenFrame,
    blackFlashActive,
    blackFlashVariant,
    cameraFocus,
    vastolordActive,
    vastolordRemainingMs,
    vastolordTransformationFrame,
    specialIntroActive,
    specialIntroCharacter,
    lootBags,
    lootNotifications,
    npcClass,
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
  } = useBattleScene({ ...props, isAlfa, PLAYER_SIZE });

  // Domínio do personagem atual: nome/cor/efeito saem de DOMAIN_EXPANSIONS e
  // alimentam o botão universal e o overlay do burst.
  const domainConfig = DOMAIN_EXPANSIONS[player.character];
  // A intro é o `background.svg` (SpecialIntro) e o preenchimento é o
  // `expansion.svg` (DomainExpansionBackground) — só quem tem `hasBackgroundArt`.
  const domainBackground = domainConfig.hasBackgroundArt
    ? playerAbilityBackgroundPath(player.character, "domainExpansion")
    : undefined;
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

  const maxOffsetX = screenWidth - containerWidth;
  const bgXMin = initialBgPosRef.current.x;
  const bgXMax =
    initialBgPosRef.current.x + (maxOffsetX * 200) / containerWidth;

  const focusEntity = cameraFocus?.entity === "npc" ? npc : player;

  // Durante a Expansão de Domínio a câmera acompanha a frente do mugetsuEffect
  // (e não o jogador) enquanto ele varre o mapa de uma ponta à outra. O Y fica
  // ancorado no chão (y do jogador): centralizar no meio do mapa subiria a
  // câmera de mais e esconderia o jogador, que está em BATTLE_SPAWN.player.y.
  const focus = mugetsuSweep
    ? { x: mugetsuSweep.x, y: player.y }
    : lucauaPortalFocus
      ? { x: lucauaPortalFocus.x, y: lucauaPortalFocus.y }
      : sphereFocus
        ? { x: sphereFocus.x, y: sphereFocus.y }
        : { x: focusEntity.x, y: focusEntity.y };

  const targetBgX = Math.max(
    bgXMin,
    Math.min((focus.x / ProjectileConstants.MAP_WIDTH) * 100, bgXMax),
  );
  const targetBgY = Math.max(
    0,
    Math.min((focus.y / ProjectileConstants.MAP_HEIGHT) * 100, 100),
  );

  const [bgPosX, setBgPosX] = useState(targetBgX);
  const [bgPosY, setBgPosY] = useState(targetBgY);

  const bgTargetRef = useRef({ x: targetBgX, y: targetBgY });
  bgTargetRef.current.x = targetBgX;
  bgTargetRef.current.y = targetBgY;

  const worldOffsetX =
    (containerWidth * 0.5 * (bgPosX - initialBgPosRef.current.x)) / 100;
  const worldOffsetY =
    (containerHeight * 0.5 * (bgPosY - initialBgPosRef.current.y)) / 100;

  const baseZoom =
    lucauaPortalFocus || sphereFocus ? 1 : (cameraFocus?.zoom ?? 1);
  // Expansão de Domínio: leve zoomOut de 1.4x enquanto a habilidade está ativa
  // — o mugetsuEffect é gigante em altura e o zoom revela mais do mapa.
  const domainZoom = domainExpansionActive ? 1 / 1.4 : 1;
  const zoomTarget = baseZoom * domainZoom;

  const [zoom, setZoom] = useState(zoomTarget);
  const zoomTargetRef = useRef(zoomTarget);
  zoomTargetRef.current = zoomTarget;

  useEffect(() => {
    const diff = Math.abs(zoom - zoomTargetRef.current);
    if (diff < 0.001) {
      if (zoom !== zoomTargetRef.current) {
        setZoom(zoomTargetRef.current);
      }
      return;
    }

    const id = requestAnimationFrame(() => {
      setZoom((prev) => {
        const t = zoomTargetRef.current;
        const next = prev + (t - prev) * 0.12;
        return Math.abs(next - t) < 0.001 ? t : next;
      });
    });

    return () => cancelAnimationFrame(id);
  }, [zoom, zoomTarget]);

  const focusX = focus.x;
  const focusY = focus.y;

  // Tremor enquanto um projétil terrestre que detona (a burst do hungryKing)
  // atravessa a arena na direção do jogador.
  const groundShakeActive = npc.projectiles.some(
    (p) =>
      p.variant === "ground" &&
      p.detonatesOnHit === true &&
      !p.impacted &&
      (p.dirX > 0 ? p.x < player.x : p.x > player.x),
  );

  const shake = useCameraShake(battle.damageNumbers, groundShakeActive, castActive);

  const bgBaseW = containerWidth * 1.5;
  const bgBaseH = containerHeight * 1.5;
  const focusScreenX = focusX - (worldOffsetX + shake.x);
  const focusScreenY = focusY - (worldOffsetY + shake.y);

  const denomX = containerWidth - zoom * bgBaseW;
  const denomY = containerHeight - zoom * bgBaseH;
  const adjustedBgX =
    denomX === 0
      ? bgPosX
      : (zoom * (containerWidth - bgBaseW) * bgPosX +
          100 * (1 - zoom) * focusScreenX) /
        denomX;
  const adjustedBgY =
    denomY === 0
      ? bgPosY
      : (zoom * (containerHeight - bgBaseH) * bgPosY +
          100 * (1 - zoom) * focusScreenY) /
        denomY;

  const battleScaleX = screenWidth / ProjectileConstants.MAP_WIDTH;
  const battleScaleY = screenHeight / ProjectileConstants.MAP_HEIGHT;

  // Expansão de Domínio: o fundo da batalha permanece o original — quem cobre
  // a cena é o overlay `background.svg` (DomainExpansionBackground), surgindo
  // sendo renderizado de baixo para cima durante a habilidade inteira.
  const effectiveBackground = background;

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
    const dx = Math.abs(bgPosX - bgTargetRef.current.x);
    const dy = Math.abs(bgPosY - bgTargetRef.current.y);
    if (dx < 0.5 && dy < 0.5) {
      if (
        bgPosX !== bgTargetRef.current.x ||
        bgPosY !== bgTargetRef.current.y
      ) {
        setBgPosX(bgTargetRef.current.x);
        setBgPosY(bgTargetRef.current.y);
      }
      return;
    }

    const id = requestAnimationFrame(() => {
      setBgPosX((prev) => {
        const t = bgTargetRef.current.x;
        const next = prev + (t - prev) * 0.1;
        return Math.abs(next - t) < 0.5 ? t : next;
      });
      setBgPosY((prev) => {
        const t = bgTargetRef.current.y;
        const next = prev + (t - prev) * 0.1;
        return Math.abs(next - t) < 0.5 ? t : next;
      });
    });

    return () => cancelAnimationFrame(id);
  }, [bgPosX, bgPosY, targetBgX, targetBgY]);

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
  const battleMana = useBattleMana();

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
      {/* Preenchimento do domínio: PRIMEIRO filho do `.Master`, para pintar
          como o `backgroundImage` da batalha — acima do fundo, abaixo de todo
          o resto (HUD do jogador e do NPC, ComboDisplay, SceneMap, intros) por
          ordem de DOM + z-index 0. Posicionado com `inset: 0`. A quebra do
          vidro (quando sobra inimigo) também mora aqui. */}
      <DomainExpansionBackground
        active={domainBackgroundActive}
        src={domainExpansionArt}
        shattering={domainShattering}
      />
      <BattleHUD
        battle={battle}
        npcStats={npcStats}
        npcType={npcType}
        npcLevel={npcLevel}
        summons={summons}
        allies={allies}
        isAlfa={isAlfa}
        playerForm={vastolordActive ? "vastolordForm" : undefined}
        npcSpecialGauge={
          isAlfa && npcType === "hungryDog"
            ? npc.ai?.hungryDog?.specialGauge
            : undefined
        }
      />
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
      />

      {/* Renderizado antes do `.SceneMap`: fica acima do fundo da batalha,
          mas abaixo do jogador/NPCs (que são filhos do SceneMap). */}
      <SpecialIntro
        active={specialIntroActive}
        character={specialIntroCharacter}
        ability={specialIntroAbility}
        form={specialIntroForm}
      />

      <AlfaAbility active={alfaDigActive} npcType={npcType} />

      <div className="SceneMap">
        <GameMap
          TILE_SIZE={TILE_SIZE}
          cols={MAP_COLS}
          rows={MAP_ROWS}
          cameraX={worldOffsetX + shake.x}
          cameraY={worldOffsetY + shake.y}
          zoom={zoom}
          focusX={focusX}
          focusY={focusY}
        >
          {map && <BattleMap map={map} />}

          {npcType === "slimita" &&
            (battle.npcPhase ?? 1) >= 2 &&
            npc.jumpLandingX != null && (
              <JumpDangerZone landingX={npc.jumpLandingX} />
            )}

          <BattleEntities
            npc={npc}
            player={player}
            battle={battle}
            npcType={npcType}
            summons={summons}
            allies={allies}
            coffins={coffins}
            pet={pet}
            TILE_SIZE={TILE_SIZE}
            PLAYER_SIZE={PLAYER_SIZE}
            grabFlipped={grabFlipped}
            isAlfa={isAlfa}
            playerProjectile={playerProjectile}
            killerQueen={killerQueen}
            bombTargets={bombTargets}
            killerQueenSprite={killerQueenSprite}
            bombSprite={bombSprite}
            explosionSprite={explosionSprite}
            extraPunches={extraPunches}
            extraPunchSprite={extraPunchSprite}
            weapon={lucasWeapon}
            playerForm={vastolordActive ? "vastolordForm" : undefined}
            transformationFrame={vastolordTransformationFrame}
            blinkVisual={blinkVisual}
            lootBags={lootBags}
            npcClass={npcClass}
            emanuelClone={emanuelClone}
            genkiDamaVisual={genkiDamaVisual}
            vastolordLaser={vastolordLaser}
            granReyCeroEffect={granReyCeroEffect}
            cutInEnemie={battle.cutInEnemie}
            npcBleeding={battle.npcBleeding}
            preAtomic={specialIntroActive}
            outroExpression={outroExpression}
            atomicHalo={atomicHalo}
            atomicExplosion={atomicExplosion}
            atomicCuts={atomicCuts}
            atomicFlash={atomicFlash}
            mugetsuSweep={mugetsuSweep}
            mugetsuBlink={mugetsuBlink}
            disintegrating={disintegrating}
            lucauaEnergyProjectiles={lucauaEnergyProjectiles}
            lucauaAttackVariant={lucauaAttackVariant}
            lucauaShieldSides={lucauaShieldSides}
            onLucauaShieldEnd={onLucauaShieldEnd}
            lucauaPortals={lucauaPortals}
            lucauaPortalGhost={lucauaPortalGhost}
            lucauaPortalLanding={lucauaPortalLanding}
            sphere={sphere}
            purpleHole={purpleHole}
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
            <VastolordTimer remainingMs={vastolordRemainingMs} />
          )}
        </GameMap>
      </div>
      {showOutro && !isTraining && (
        <BattleOutro
          character={player.character}
          type={showOutro}
          onNext={handleCloseOutro}
        />
      )}

      {!showOutro && showHighlight && highlightData && !isTraining && (
        <BattleHighlight
          replay={highlightData}
          onClose={handleCloseHighlight}
        />
      )}

      {!showOutro && !showHighlight && showVictory && !isTraining && (
        <VictoryModal
          isOpen={showVictory}
          character={player.character}
          enemyType={npcType}
          enemyLevel={npcLevel}
          xpReward={xpReward}
          rewards={lastRewards}
          onContinue={handleContinue}
          skipDelay={skipVictoryDelay}
          elapsed={victoryElapsed}
          bestTime={bestTime}
          getReplayData={getReplayData}
          isAlfa={isAlfa}
          titleProgressSnapshot={titleProgressSnapshotRef.current}
        />
      )}

      {!showOutro && !showHighlight && showDefeat && !isTraining && (
        <DefeatModal
          isOpen={showDefeat}
          onContinue={handleRetry}
          onBack={() => navigate(-1)}
          progress={defeatProgress}
          elapsed={defeatElapsed}
          bestTime={bestTime}
          showRetry={showRetry}
        />
      )}

      {lucauaPortalSelection !== null && (
        <PortalSelect index={lucauaPortalSelection} onPick={lucauaPortalPick} />
      )}

      <ComboAction />

      <div className="abilityButtons">
        {petSkill && pet && (
          <PetSkillButton
            imageUrl={npcPath(`/${petSkill.definition.npcType}/face.svg`)}
            skillName={petSkill.definition.skill.name}
            ready={petSkill.ready}
            remaining={petSkill.remaining}
            cooldownMs={petSkill.definition.skill.cooldownMs}
            disabled={controlsDisabled}
            onClick={petSkill.trigger}
          />
        )}

        {player.character === "lucas" && (
          <WeaponSwitchButton
            weapon={lucasWeapon}
            disabled={
              controlsDisabled ||
              (battleMana != null &&
                battleMana.playerMana < LUCAS_WEAPON_SWITCH_MANA_COST)
            }
            onClick={switchWeapon}
          />
        )}

        {player.character === "riquelme" && (
          <>
            <SphereJunction
              blueActive={
                sphere?.variant === "blue" && sphere.phase !== "dismissing"
              }
              blueDisabled={controlsDisabled || !blueUsable}
              redDisabled={controlsDisabled || !redUsable}
              purpleActive={sphere?.variant === "purple"}
              purpleDisabled={controlsDisabled || !purpleUsable}
              onBlue={bluePress}
              onRed={redPress}
              onPurple={purplePress}
            />
            <DivergentFistButton
              energy={battleMana?.playerMana ?? 0}
              active={divergentFistActive}
              disabled={
                controlsDisabled ||
                (battleMana?.playerMana ?? 0) < DIVERGENT_FIST_COST
              }
              onClick={activateDivergentFist}
            />
          </>
        )}

        {player.character === "riquelme" &&
          (honoredOneActive ? (
            <BlinkButton
              energy={battleMana?.playerMana ?? 0}
              disabled={
                controlsDisabled ||
                ALL_PREDICATES.isRiquelmeDomain(player.state) ||
                (battleMana?.playerMana ?? 0) < BLINK_ENERGY_COST
              }
              onClick={blink}
            />
          ) : (
            <CursedEnergyButton
              energy={battleMana?.playerMana ?? 0}
              energyMax={battleMana?.playerMaxMana ?? 100}
              disabled={
                controlsDisabled ||
                (battleMana?.playerMana ?? 0) < CURSED_ENERGY_HEAL_RATIO ||
                battle.playerHP >= battle.playerMaxHp
              }
              onClick={convertCursedEnergy}
            />
          ))}

        {player.character === "emanuel" && (
          <EmanuelCloneButton
            energy={battleMana?.playerMana ?? 0}
            disabled={controlsDisabled || !cloneUsable}
            onPress={clonePress}
            onRelease={cloneRelease}
          />
        )}

        {player.character === "emanuel" && (
          <EmanuelKiChargeButton
            energy={battleMana?.playerMana ?? 0}
            energyMax={battleMana?.playerMaxMana ?? 100}
            disabled={controlsDisabled || !kiChargeUsable}
            onPress={kiChargePress}
            onRelease={kiChargeRelease}
          />
        )}

        {player.character === "emanuel" && (
          <EmanuelGenkiDamaButton
            energy={battleMana?.playerMana ?? 0}
            disabled={controlsDisabled || !genkiDamaUsable}
            onPress={genkiDamaPress}
            onRelease={genkiDamaRelease}
          />
        )}

        {player.character === "marcelo" && vastolordActive && (
          <VastolordLaserButton
            charges={vastolordLaserStacks}
            disabled={!vastolordLaserUsable}
            onClick={vastolordLaserPress}
          />
        )}

        {!vastolordActive && player.character === "marcelo" && (
          <AtomicButton
            ready={atomicUsable}
            remaining={atomicRemaining}
            disabled={controlsDisabled}
            onClick={atomicPress}
          />
        )}

        {player.character === "artur" && (
          <KillerQueenButton
            ready={activeAbilityUsable}
            remaining={activeAbilityRemaining}
            disabled={controlsDisabled}
            onClick={activeAbilityPress}
          />
        )}

        {player.character === "larissa" && (
          <StackExplosionButton
            ready={activeAbilityUsable}
            remaining={activeAbilityRemaining}
            disabled={controlsDisabled}
            onClick={activeAbilityPress}
          />
        )}

        {player.character === "lucaua" && (
          <LucauaPortalsButton
            count={lucauaPortalCount}
            maxPortals={lucauaPortalMaxPortals}
            cost={lucauaPortalCost}
            disabled={controlsDisabled || !lucauaPortalUsable}
            onClick={lucauaPortalClick}
          />
        )}

        {!vastolordActive && (
          <DomainExpansionButton
            name={domainConfig.name}
            description={domainConfig.description}
            accent={domainConfig.accent}
            background={domainBackground}
            ready={domainExpansionUsable}
            disabled={controlsDisabled}
            onClick={domainExpansionPress}
          />
        )}

        {!vastolordActive && player.character === "marcelo" && (
          <GranReyCeroButton
            ready={granReyCeroUsable}
            remaining={granReyCeroRemaining}
            disabled={controlsDisabled}
            onClick={granReyCeroPress}
          />
        )}
      </div>

      {isTraining && <TrainingOverlay onLeave={() => navigate(-1)} />}

      {props.children}
    </div>
  );
}
