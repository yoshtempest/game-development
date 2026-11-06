import { GameMap } from "@/components/Game/Map";
import { BattleMap } from "@/components/Game/Map/Battle";
import { BattleEntities } from "@/components/Game/Battle/Entities";
import { JumpDangerZone } from "@/components/Game/Battle/Jump/dangerZone";

type Props = {
  TILE_SIZE: number;
  MAP_COLS: number;
  MAP_ROWS: number;
  cameraX: number;
  cameraY: number;
  zoom: number;
  map?: any;
  npcType: string;
  npc: any;
  player: any;
  battle: any;
  summons: any;
  allies: any;
  coffins: any;
  pet: any;
  PLAYER_SIZE: number;
  grabFlipped: boolean;
  isAlfa: boolean;
  playerProjectile: any;
  killerQueen: any;
  bombTargets: any;
  killerQueenSprite: any;
  bombSprite: any;
  explosionSprite: any;
  extraPunches: any;
  extraPunchSprite: any;
  weapon: any;
  playerForm: any;
  transformationFrame: number | null;
  blinkVisual: any;
  ematronClone: any;
  babidiClones: any;
  hakai: boolean;
  babidiAttackVariant: any;
  babidiMachineGamaControl: boolean;
  babidiShieldSides: any;
  onBabidiShieldEnd: any;
  sphere: any;
  purpleHole: boolean;
  npcBleeding: boolean;
  cutInEnemie: any;
  preAtomic: boolean;
  outroExpression: any;
  atomicHalo: boolean;
  atomicFlash: boolean;
  mugetsuSweep: any;
  disintegrating: any;
  domainExpansionActive: boolean;
  babidiEnergyProjectiles: any;
  babidiMissileProjectiles: any;
  fishingNet: any;
  babidiBombDrop: any;
  babidiShieldSidesProp?: any;
};

export function BattleWorld(props: Props) {
  const {
    TILE_SIZE,
    MAP_COLS,
    MAP_ROWS,
    cameraX,
    cameraY,
    zoom,
    map,
    npcType,
    npc,
    player,
    battle,
    summons,
    allies,
    coffins,
    pet,
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
    weapon,
    playerForm,
    transformationFrame,
    blinkVisual,
    ematronClone,
    babidiClones,
    hakai,
    babidiAttackVariant,
    babidiMachineGamaControl,
    babidiShieldSides,
    onBabidiShieldEnd,
    sphere,
    purpleHole,
    npcBleeding,
    cutInEnemie,
    preAtomic,
    outroExpression,
    atomicHalo,
    atomicFlash,
    mugetsuSweep,
    disintegrating,
    domainExpansionActive,
    babidiEnergyProjectiles,
    babidiMissileProjectiles,
    fishingNet,
    babidiBombDrop,
  } = props;

  return (
    <GameMap
      TILE_SIZE={TILE_SIZE}
      cols={MAP_COLS}
      rows={MAP_ROWS}
      cameraX={cameraX}
      cameraY={cameraY}
      zoom={zoom}
      focusX={0}
      focusY={0}
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
        weapon={weapon}
        playerForm={playerForm}
        transformationFrame={transformationFrame}
        blinkVisual={blinkVisual}
        ematronClone={ematronClone}
        babidiClones={babidiClones}
        hakai={hakai}
        babidiAttackVariant={babidiAttackVariant}
        babidiMachineGamaControl={babidiMachineGamaControl}
        babidiShieldSides={babidiShieldSides}
        onBabidiShieldEnd={onBabidiShieldEnd}
        sphere={sphere}
        purpleHole={purpleHole}
        npcBleeding={npcBleeding}
        cutInEnemie={cutInEnemie}
        preAtomic={preAtomic}
        outroExpression={outroExpression}
        atomicHalo={atomicHalo}
        atomicFlash={atomicFlash}
        mugetsuSweep={mugetsuSweep}
        disintegrating={disintegrating}
        domainExpansionActive={domainExpansionActive}
        babidiEnergyProjectiles={babidiEnergyProjectiles}
        babidiMissileProjectiles={babidiMissileProjectiles}
        fishingNet={fishingNet}
        babidiBombDrop={babidiBombDrop}
      />
    </GameMap>
  );
}