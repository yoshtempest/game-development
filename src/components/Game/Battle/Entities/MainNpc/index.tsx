import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import type { MainNpcProps } from "./types";

export function MainNpc({
  x,
  y,
  TILE_SIZE,
  npcType,
  state,
  direction,
  battle,
  isHidden,
  isUnderground,
  isAlfa,
  cutInEnemie = null,
  npcBleeding = false,
  purpleHole = false,
  babidiPortalCross = null,
}: MainNpcProps) {
  return (
    <NPCBattle
      x={x}
      y={y}
      TILE_SIZE={TILE_SIZE}
      npcType={npcType}
      state={state}
      direction={direction}
      piercings={battle.piercings}
      isExploding={battle.isExploding}
      isHidden={isHidden}
      isUnderground={isUnderground}
      npcPhase={battle.npcPhase}
      isDying={battle.isNpcDying}
      isAlfa={isAlfa}
      cutInEnemie={cutInEnemie}
      npcBleeding={npcBleeding}
      purpleHole={purpleHole}
      babidiPortalCross={babidiPortalCross}
    />
  );
}
