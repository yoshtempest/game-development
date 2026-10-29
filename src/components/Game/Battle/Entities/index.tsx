import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import { getPortalCross } from "@/gameRules/battle/characters/babidi/babidiPortal";
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
import { EmatronClone } from "./Ematron/EmatronClone";
import { GenkiDama } from "./Ematron/GenkiDama";
import { VastolordLaser } from "./VastolordLaser";
import { Kamehameha } from "./Kamehameha";
import { GranReyCero } from "./GranReyCero";
import { KillerQueen } from "./srGuaxinim/KillerQueen";
import { Bomb } from "./Bomb";
import { ExtraPunch } from "./srGuaxinim/ExtraPunch";
import { SpecialProjectile } from "./Projectiles/SpecialProjectile";
import { EnergyProjectile } from "./Projectiles/EnergyProjectile";
import { LootBag } from "./LootBag";
import { BlinkAfterimage } from "@/components/Game/Battle/Effects/Natsuki/BlinkAfterimage";
import { DeiseDashAfterimage } from "@/components/Game/Battle/Effects/DeiseDashAfterimage";
import { AtomicEffects } from "@/components/Game/Battle/Effects/Marshadow/Atomic";
import { DomainExpansionEffects } from "@/components/Game/Battle/Effects/Domain/DomainExpansion";
import { MugetsuDisintegration } from "@/components/Game/Battle/Effects/Marshadow/MugetsuDisintegration";
import { NatsukiSphere } from "@/components/Game/Battle/Entities/Projectiles/NatsukiSphere";
import { BabidiPortals } from "@/components/Game/Battle/Entities/BabidiPortals";
import type { BattleEntitiesBattle, MainNpcState } from "./types";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { PetState } from "@/hooks/battle/player/pets/usePet";
import type { CoffinState } from "@/hooks/battle/summon/useCoffinAnimation";
import type { KillerQueenOverlay } from "@/utils/types/character/srGuaxinim";
import type { ExtraPunchVisual } from "@/utils/types/character/srGuaxinim";
import type { BattleLootBag } from "@/utils/types/battle/loot";
import type { BlinkVisual } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";
import type { EmatronCloneVisual } from "@/utils/types/character/ematron";
import type { GenkiDamaVisual } from "@/utils/types/character/ematron";
import type { VastolordLaserBeam } from "@/gameRules/battle/characters/marshadow/vastolordLaser";
import type { KamehamehaEffect } from "@/gameRules/battle/characters/ematron/kamehameha";
import type { GranReyCeroEffect } from "@/gameRules/battle/characters/marshadow/granReyCero";
import type { CutInEnemieOverlay } from "@/utils/types/battle/cutInEnemie";
import type { AtomicExplosion, AtomicCut } from "@/utils/types/battle/atomic";
import type {
  MugetsuSweep,
  MugetsuBlink,
  MugetsuDisintegrationTarget,
} from "@/utils/types/battle/mugetsu";
import type {
  BabidiEnergyProjectile,
  BabidiPortal,
  BabidiPortalGhost,
  BabidiShieldSide,
  BabidiShieldSides,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

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
  weapon?: YvelWeapon;
  /** Pasta de sprites do marshadow durante a Forma Vastolord. */
  playerForm?: "vastolordForm";
  /** Quadro da transformação do marshadow (0=screamOne … 3=transformated) ou null. */
  transformationFrame?: number | null;
  /** Estado da coreografia do blink do natsuki (silhuetas de origem/destino). */
  blinkVisual?: BlinkVisual | null;
  /** Cópia de silhueta do Ematron durante o hold da instância. */
  ematronClone?: EmatronCloneVisual | null;
  /** Esfera da Genki Dama do Ematron (preparando ou voando). */
  genkiDamaVisual?: GenkiDamaVisual | null;
  /** Feixe do Laser da Forma Vastolord do marshadow. */
  vastolordLaser?: VastolordLaserBeam | null;
  /** Feixe de Kamehameha do ematron (em curso, ou null). */
  kamehameha?: KamehamehaEffect | null;
  granReyCeroEffect?: GranReyCeroEffect | null;
  /** CutInEnemie do marshadow sobrepondo o NPC atingido. */
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
  /** Varredura do mugetsuEffect da Expansão de Domínio do marshadow. */
  mugetsuSweep?: MugetsuSweep | null;
  /** Blink do teleporte da Expansão de Domínio. */
  mugetsuBlink?: MugetsuBlink;
  /** Alvos sendo desintegrados em pó pela varredura. */
  disintegrating?: MugetsuDisintegrationTarget[];
  /** Projéteis de energia do ataque básico do babidi. */
  babidiEnergyProjectiles?: BabidiEnergyProjectile[];
  /** Pose de mão do sprite do ataque básico do babidi. */
  babidiAttackVariant?: BabidiAttackVariant;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides?: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd?: (side: BabidiShieldSide, nonce: number) => void;
  /** Portais fincados no mapa (Energia Dimensional do babidi). */
  babidiPortals?: BabidiPortal[];
  /** Fantasma do posicionamento do portal (antes de soltar o botão). */
  babidiPortalGhost?: BabidiPortalGhost | null;
  /** Player no "voo do portal" (override de sprite pós-teletransporte). */
  babidiPortalLanding?: boolean;
  /** Furo no sprite do NPC quando a purple o mata (junto com `isDying`). */
  purpleHole?: boolean;
  hakai?: boolean;
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
  babidiAttackVariant,
  babidiShieldSides,
  onBabidiShieldEnd,
  babidiPortals = [],
  babidiPortalGhost = null,
  babidiPortalLanding = false,
  sphere = null,
  purpleHole = false,
  hakai = false,
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

  // Travessia em andamento pelos portais terrestres: a parte do sprite que já
  // passou da linha de um portal tem de reaparecer saindo do par (o hook só
  // mexe na posição — o recorte é reconstruído aqui a partir dela).
  const playerPortalCross = getPortalCross(babidiPortals, player.x, player.y);
  const npcPortalCross = getPortalCross(babidiPortals, npc.x, npc.y);

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
        babidiPortalCross={npcPortalCross}
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
        babidiPortals={babidiPortals}
      />

      <Ally
        allies={allies}
        TILE_SIZE={TILE_SIZE}
        babidiPortals={babidiPortals}
      />

      <Pet pet={pet} TILE_SIZE={TILE_SIZE} babidiPortals={babidiPortals} />

      <BabidiPortals
        portals={babidiPortals}
        ghost={babidiPortalGhost}
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
        teleportSprite={ematronClone != null}
        preAtomic={preAtomic}
        outroExpression={outroExpression}
        atomicHalo={atomicHalo}
        atomicFlash={atomicFlash}
        mugetsuBlink={mugetsuBlink}
        babidiAttackVariant={babidiAttackVariant}
        babidiShieldSides={babidiShieldSides}
        onBabidiShieldEnd={onBabidiShieldEnd}
        babidiPortalLanding={babidiPortalLanding}
        babidiPortalCross={playerPortalCross}
        hakai={hakai}
      />

      <EnergyProjectile
        projectiles={babidiEnergyProjectiles}
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

      {lootBags.map((bag) => (
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
