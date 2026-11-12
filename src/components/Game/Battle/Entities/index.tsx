import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import { MainNpc } from "./MainNpc";
import { NpcProjectile } from "./Projectiles/NpcProjectile";
import { GroundPaper } from "./Maugrelo/GroundPaper";
import { StuckPapers } from "./Maugrelo/StuckPapers";
import { Laser } from "./Maugrelo/Laser";
import { Coffin } from "./Coffin";
import { Summon } from "./Summon";
import { Ally } from "./Ally";
import { Pet } from "./Pet";
import { Player } from "./Player";
import { EmatronClone } from "./Ematron/Clone";
import { GenkiDama } from "./Ematron/GenkiDama";
import { VastolordLaser } from "./Marshadow/VastolordLaser";
import { Kamehameha } from "./Ematron/Kamehameha";
import { GranReyCero } from "./Marshadow/GranReyCero";
import { KillerQueen } from "./srGuaxinim/KillerQueen";
import { Bomb } from "./Bomb";
import { ExtraPunch } from "./srGuaxinim/ExtraPunch";
import { SpecialProjectile } from "./Projectiles/SpecialProjectile";
import { EnergyProjectile } from "./Projectiles/EnergyProjectile";
import { FishingNet } from "./Babidi/FishingNet";
import { BabidiClone } from "./Babidi/Clone";
import { MissileProjectile } from "./Projectiles/MissileProjectile";
import { LootBag } from "./LootBag";
import { BlinkAfterimage } from "@/components/Game/Battle/Effects/Natsuki/BlinkAfterimage";
import { DeiseDashAfterimage } from "@/components/Game/Battle/Effects/DeiseDashAfterimage";
import { AtomicEffects } from "@/components/Game/Battle/Effects/Marshadow/Atomic";
import { DomainExpansionEffects } from "@/components/Game/Battle/Effects/Domain/DomainExpansion";
import { MugetsuDisintegration } from "@/components/Game/Battle/Effects/Marshadow/MugetsuDisintegration";
import { NatsukiSphere } from "@/components/Game/Battle/Entities/Projectiles/NatsukiSphere";
import { BabidiBombDrop } from "./Projectiles/BabidiBombDrop";
import type { Props } from "./types";

export function BattleEntities({
  npc,
  player,
  battle,
  npcType,
  summons,
  allies = [],
  coffins,
  pet,
  lootBags = [],
  npcClass = "common",
  TILE_SIZE,
  PLAYER_SIZE,
  grabFlipped = false,
  isAlfa = false,
  playerProjectile = null,
  killerQueen = null,
  bombTargets = [],
  killerQueenSprite,
  bombSprite,
  explosionSprite,
  extraPunches = [],
  extraPunchSprite,
  weapon,
  playerForm,
  transformationFrame = null,
  blinkVisual = null,
  ematronClone = null,
  genkiDamaVisual = null,
  vastolordLaser = null,
  kamehameha = null,
  granReyCeroEffect = null,
  cutInEnemie = null,
  npcBleeding = false,
  preAtomic = false,
  outroExpression = null,
  atomicHalo = false,
  atomicFlash = false,
  atomicExplosion = null,
  atomicCuts = [],
  mugetsuSweep = null,
  mugetsuBlink = null,
  disintegrating = [],
  babidiEnergyProjectiles = [],
  babidiMissileProjectiles = [],
  fishingNet = null,
  babidiClones = [],
  babidiBombDrop = null,
  babidiAttackVariant,
  babidiMachineGamaControl = false,
  babidiShieldSides,
  onBabidiShieldEnd,
  sphere = null,
  purpleHole = false,
  hakai = false,
  sigiloPhase,
  hideMainNpc = false,
  layer = "full",
  playerNameTag,
}: Props & {
  sphere?: import("@/utils/types/character/natsuki").NatsukiSphere | null;
}) {
  const battleScaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const battleScaleY =
    getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const activeBombIds = new Set(bombTargets.map((b) => b.id));
  const bossSizeMultiplier = getBossSizeMultiplier(
    npcType,
    battle.npcPhase,
    isAlfa,
  );

  return (
    <>
      {/* Camada remota: só o jogador do outro cliente e o que ele gera. NPC,
          inimigos, projéteis do NPC e loot já existem na cena local. */}
      {layer === "full" && (
        <>
          <MainNpc
            x={npc.x}
            y={npc.y}
            TILE_SIZE={TILE_SIZE}
            npcType={npcType}
            state={npc.state}
            direction={npc.direction}
            battle={battle}
            isHidden={hideMainNpc || activeBombIds.has("main")}
            isUnderground={npc.hidden ?? false}
            isAlfa={isAlfa}
            cutInEnemie={cutInEnemie}
            npcBleeding={npcBleeding}
            purpleHole={purpleHole}
          />

          <NpcProjectile
            projectiles={npc.projectiles}
            groundY={player.y}
            hiddenIds={activeBombIds}
          />

          {npc.ai?.deise?.dashState === "dashing" && (
            <DeiseDashAfterimage
              npcX={npc.x}
              npcY={npc.y}
              direction={npc.direction}
              npcType={npcType}
              npcPhase={battle.npcPhase}
              TILE_SIZE={TILE_SIZE}
            />
          )}

          <GroundPaper
            papers={npc.groundPapers}
            flyingPaper={npc.flyingPaper}
            battleScaleX={battleScaleX}
            battleScaleY={battleScaleY}
          />

          <StuckPapers
            papers={npc.stuckPapers}
            playerX={player.x}
            playerY={player.y}
            battleScaleX={battleScaleX}
            battleScaleY={battleScaleY}
          />

          <Laser
            laser={npc.laser}
            battleScaleX={battleScaleX}
            battleScaleY={battleScaleY}
          />

          <Coffin
            coffins={coffins}
            TILE_SIZE={TILE_SIZE}
            battleScaleX={battleScaleX}
            battleScaleY={battleScaleY}
          />

          <Summon
            summons={summons}
            hiddenIds={activeBombIds}
            TILE_SIZE={TILE_SIZE}
          />
        </>
      )}

      <Ally allies={allies} TILE_SIZE={TILE_SIZE} />

      <Pet pet={pet} TILE_SIZE={TILE_SIZE} />

      <Player
        player={player}
        PLAYER_SIZE={PLAYER_SIZE}
        weapon={weapon}
        grabFlipped={grabFlipped}
        form={playerForm}
        transformationFrame={transformationFrame}
        blinkVisual={blinkVisual}
        teleportSprite={ematronClone != null}
        preAtomic={preAtomic}
        outroExpression={outroExpression}
        atomicHalo={atomicHalo}
        atomicFlash={atomicFlash}
        mugetsuBlink={mugetsuBlink}
        babidiAttackVariant={babidiAttackVariant}
        babidiMachineGamaControl={babidiMachineGamaControl}
        babidiShieldSides={babidiShieldSides}
        onBabidiShieldEnd={onBabidiShieldEnd}
        hakai={hakai}
        sigiloPhase={sigiloPhase}
        levelUpParticles={layer === "full"}
        nameTag={playerNameTag}
      />

      <EnergyProjectile
        projectiles={babidiEnergyProjectiles}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <MissileProjectile
        projectiles={babidiMissileProjectiles}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <BabidiBombDrop
        visual={babidiBombDrop}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <FishingNet
        net={fishingNet}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      {babidiClones.map((clone) => (
        <BabidiClone
          key={clone.id}
          clone={clone}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      ))}

      <AtomicEffects
        explosion={atomicExplosion}
        cuts={atomicCuts}
        TILE_SIZE={TILE_SIZE}
        mainNpcType={npcType}
        bossSizeMultiplier={bossSizeMultiplier}
      />

      {mugetsuSweep && (
        <DomainExpansionEffects
          sweep={mugetsuSweep}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {disintegrating.length > 0 && (
        <MugetsuDisintegration
          targets={disintegrating}
          sweep={mugetsuSweep}
          TILE_SIZE={TILE_SIZE}
        />
      )}

      {blinkVisual && player.character === "natsuki" && (
        <BlinkAfterimage
          visual={blinkVisual}
          PLAYER_SIZE={PLAYER_SIZE}
          character={player.character}
        />
      )}

      {ematronClone && player.character === "ematron" && (
        <EmatronClone clone={ematronClone} PLAYER_SIZE={PLAYER_SIZE} />
      )}

      {genkiDamaVisual && player.character === "ematron" && (
        <GenkiDama
          visual={genkiDamaVisual}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {vastolordLaser && player.character === "marshadow" && (
        <VastolordLaser
          beam={vastolordLaser}
          PLAYER_SIZE={PLAYER_SIZE}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {kamehameha && player.character === "ematron" && (
        <Kamehameha
          effect={kamehameha}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {granReyCeroEffect && player.character === "marshadow" && (
        <GranReyCero
          tipX={granReyCeroEffect.tipX}
          tipY={granReyCeroEffect.tipY}
          dirX={granReyCeroEffect.dirX}
          fading={granReyCeroEffect.fading}
          PLAYER_SIZE={PLAYER_SIZE}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      <KillerQueen
        killerQueen={killerQueen}
        killerQueenSprite={killerQueenSprite}
        PLAYER_SIZE={PLAYER_SIZE}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <Bomb
        bombTargets={bombTargets}
        bombSprite={bombSprite}
        explosionSprite={explosionSprite}
        PLAYER_SIZE={PLAYER_SIZE}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <ExtraPunch
        extraPunches={extraPunches}
        extraPunchSprite={extraPunchSprite}
        PLAYER_SIZE={PLAYER_SIZE}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
        isFacingLeft={player.battleDirection === "left"}
      />

      <SpecialProjectile
        playerProjectile={playerProjectile}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      {layer === "full" &&
        lootBags.map((bag) => (
          <LootBag
            key={bag.id}
            bag={bag}
            TILE_SIZE={TILE_SIZE}
            npcClass={npcClass}
          />
        ))}

      <NatsukiSphere
        sphere={sphere ?? null}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />
    </>
  );
}
