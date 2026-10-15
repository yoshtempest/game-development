import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import { MainNpc } from "./MainNpc";
import { NpcProjectile } from "./NpcProjectile";
import { GroundPaper } from "./GroundPaper";
import { StuckPapers } from "./StuckPapers";
import { Laser } from "./Laser";
import { Coffin } from "./Coffin";
import { Summon } from "./Summon";
import { Ally } from "./Ally";
import { Pet } from "./Pet";
import { Player } from "./Player";
import { EmanuelClone } from "./EmanuelClone";
import { GenkiDama } from "./GenkiDama";
import { VastolordLaser } from "./VastolordLaser";
import { GranReyCero } from "./GranReyCero";
import { KillerQueen } from "./KillerQueen";
import { Bomb } from "./Bomb";
import { ExtraPunch } from "./ExtraPunch";
import { SpecialProjectile } from "./SpecialProjectile";
import { EnergyProjectile } from "./EnergyProjectile";
import { LootBag } from "./LootBag";
import { BlinkAfterimage } from "@/components/Game/Battle/Effects/Natsuki/BlinkAfterimage";
import { DeiseDashAfterimage } from "@/components/Game/Battle/Effects/DeiseDashAfterimage";
import { AtomicEffects } from "@/components/Game/Battle/Effects/Marshadow/Atomic";
import { DomainExpansionEffects } from "@/components/Game/Battle/Effects/DomainExpansion";
import { MugetsuDisintegration } from "@/components/Game/Battle/Effects/Marshadow/MugetsuDisintegration";
import { RiquelmeSphere } from "@/components/Game/Battle/Entities/RiquelmeSphere";
import { LucauaPortals } from "@/components/Game/Battle/Entities/LucauaPortals";
import type { BattleEntitiesBattle, MainNpcState } from "./types";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { CoffinState } from "@/hooks/battle/summon/useCoffinAnimation";
import type { KillerQueenOverlay } from "@/utils/types/character/srGuaxinim";
import type { ExtraPunchVisual } from "@/utils/types/character/srGuaxinim";
import type { BattleLootBag } from "@/utils/types/battle/loot";
import type { BlinkVisual } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import type { EmanuelCloneVisual } from "@/utils/types/character/emanuel";
import type { GenkiDamaVisual } from "@/utils/types/character/emanuel";
import type { VastolordLaserBeam } from "@/gameRules/battle/vastolordLaser";
import type { GranReyCeroEffect } from "@/gameRules/battle/granReyCero";
import type { CutInEnemieOverlay } from "@/utils/types/battle/cutInEnemie";
import type { AtomicExplosion, AtomicCut } from "@/utils/types/battle/atomic";
import type {
  MugetsuSweep,
  MugetsuBlink,
  MugetsuDisintegrationTarget,
} from "@/utils/types/battle/mugetsu";
import type {
  LucauaAttackVariant,
  LucauaEnergyProjectile,
  LucauaPortal,
  LucauaPortalGhost,
  LucauaShieldSide,
  LucauaShieldSides,
} from "@/utils/types/character/lucaua";

type Props = {
  npc: MainNpcState;
  player: Player;
  battle: BattleEntitiesBattle;
  npcType: string;
  summons: SummonedNpc[];
  allies: SummonedNpc[];
  coffins: CoffinState[];
  pet: PetState;
  lootBags?: BattleLootBag[];
  npcClass?: NPCClass;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
  grabFlipped?: boolean;
  isAlfa?: boolean;
  playerProjectile?: PlayerSpecialProjectile | null;
  killerQueen?: KillerQueenOverlay | null;
  bombTargets?: BombTarget[];
  killerQueenSprite?: (sprite: KillerQueenOverlay["sprite"]) => string;
  bombSprite?: string;
  explosionSprite?: string;
  extraPunches?: ExtraPunchVisual[];
  extraPunchSprite?: string;
  weapon?: LucasWeapon;
  /** Pasta de sprites do marcelo durante a Forma Vastolord. */
  playerForm?: "vastolordForm";
  /** Quadro da transformação do marcelo (0=screamOne … 3=transformated) ou null. */
  transformationFrame?: number | null;
  /** Estado da coreografia do blink do riquelme (silhuetas de origem/destino). */
  blinkVisual?: BlinkVisual | null;
  /** Cópia de silhueta do Emanuel durante o hold da instância. */
  emanuelClone?: EmanuelCloneVisual | null;
  /** Esfera da Genki Dama do Emanuel (preparando ou voando). */
  genkiDamaVisual?: GenkiDamaVisual | null;
  /** Feixe do Laser da Forma Vastolord do marcelo. */
  vastolordLaser?: VastolordLaserBeam | null;
  granReyCeroEffect?: GranReyCeroEffect | null;
  /** CutInEnemie do marcelo sobrepondo o NPC atingido. */
  cutInEnemie?: CutInEnemieOverlay | null;
  /** NPC em sangramento (bloodIcon acima da imagem). */
  npcBleeding?: boolean;
  /** Durante o specialBackground: jogador troca para o sprite preAtomic.svg. */
  preAtomic?: boolean;
  /** Vitória/derrota: jogador troca para expressions/<tipo>.svg (battleOutro). */
  outroExpression?: "victory" | "defeat" | null;
  /** Halo.svg acima do jogador durante preparing/finalizating do "I Am Atomic". */
  atomicHalo?: boolean;
  /** Flash no sprite do jogador na explosão do "I Am Atomic". */
  atomicFlash?: boolean;
  /** Explosão centrada no alvo (inimigo de maior vida máxima). */
  atomicExplosion?: AtomicExplosion | null;
  /** CutInEnemie sobre cada inimigo atingido dentro do raio. */
  atomicCuts?: AtomicCut[];
  /** Varredura do mugetsuEffect da Expansão de Domínio do marcelo. */
  mugetsuSweep?: MugetsuSweep | null;
  /** Blink do teleporte da Expansão de Domínio. */
  mugetsuBlink?: MugetsuBlink;
  /** Alvos sendo desintegrados em pó pela varredura. */
  disintegrating?: MugetsuDisintegrationTarget[];
  /** Projéteis de energia do ataque básico do lucaua. */
  lucauaEnergyProjectiles?: LucauaEnergyProjectile[];
  /** Pose de mão do sprite do ataque básico do lucaua. */
  lucauaAttackVariant?: LucauaAttackVariant;
  /** Nonces dos shields de bloqueio do lucaua por lado (`0` = inativo). */
  lucauaShieldSides?: LucauaShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onLucauaShieldEnd?: (side: LucauaShieldSide, nonce: number) => void;
  /** Portais fincados no mapa (Energia Dimensional do lucaua). */
  lucauaPortals?: LucauaPortal[];
  /** Fantasma do posicionamento do portal (antes de soltar o botão). */
  lucauaPortalGhost?: LucauaPortalGhost | null;
  /** Player no "voo do portal" (override de sprite pós-teletransporte). */
  lucauaPortalLanding?: boolean;
  /** Furo no sprite do NPC quando a purple o mata (junto com `isDying`). */
  purpleHole?: boolean;
};

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
  emanuelClone = null,
  genkiDamaVisual = null,
  vastolordLaser = null,
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
  lucauaEnergyProjectiles = [],
  lucauaAttackVariant,
  lucauaShieldSides,
  onLucauaShieldEnd,
  lucauaPortals = [],
  lucauaPortalGhost = null,
  lucauaPortalLanding = false,
  sphere = null,
  purpleHole = false,
}: Props & {
  sphere?: import("@/utils/types/character/riquelme").RiquelmeSphere | null;
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
      <MainNpc
        x={npc.x}
        y={npc.y}
        TILE_SIZE={TILE_SIZE}
        npcType={npcType}
        state={npc.state}
        direction={npc.direction}
        battle={battle}
        isHidden={activeBombIds.has("main")}
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

      <Ally allies={allies} TILE_SIZE={TILE_SIZE} />

      <Pet pet={pet} TILE_SIZE={TILE_SIZE} />

      <LucauaPortals
        portals={lucauaPortals}
        ghost={lucauaPortalGhost}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

      <Player
        player={player}
        PLAYER_SIZE={PLAYER_SIZE}
        weapon={weapon}
        grabFlipped={grabFlipped}
        form={playerForm}
        transformationFrame={transformationFrame}
        blinkVisual={blinkVisual}
        teleportSprite={emanuelClone != null}
        preAtomic={preAtomic}
        outroExpression={outroExpression}
        atomicHalo={atomicHalo}
        atomicFlash={atomicFlash}
        mugetsuBlink={mugetsuBlink}
        lucauaAttackVariant={lucauaAttackVariant}
        lucauaShieldSides={lucauaShieldSides}
        onLucauaShieldEnd={onLucauaShieldEnd}
        lucauaPortalLanding={lucauaPortalLanding}
      />

      <EnergyProjectile
        projectiles={lucauaEnergyProjectiles}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />

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

      {blinkVisual && player.character === "riquelme" && (
        <BlinkAfterimage
          visual={blinkVisual}
          PLAYER_SIZE={PLAYER_SIZE}
          character={player.character}
        />
      )}

      {emanuelClone && player.character === "emanuel" && (
        <EmanuelClone clone={emanuelClone} PLAYER_SIZE={PLAYER_SIZE} />
      )}

      {genkiDamaVisual && player.character === "emanuel" && (
        <GenkiDama
          visual={genkiDamaVisual}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {vastolordLaser && player.character === "marcelo" && (
        <VastolordLaser
          beam={vastolordLaser}
          PLAYER_SIZE={PLAYER_SIZE}
          battleScaleX={battleScaleX}
          battleScaleY={battleScaleY}
        />
      )}

      {granReyCeroEffect && player.character === "marcelo" && (
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

      {lootBags.map((bag) => (
        <LootBag
          key={bag.id}
          bag={bag}
          TILE_SIZE={TILE_SIZE}
          npcClass={npcClass}
        />
      ))}

      <RiquelmeSphere
        sphere={sphere ?? null}
        battleScaleX={battleScaleX}
        battleScaleY={battleScaleY}
      />
    </>
  );
}
