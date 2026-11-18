import { PlayerBattle } from "@/components/Game/Entities/Player/Battle";
import { getActivePlayerStatusApplications } from "@/gameRules/battle/status/statusEffects";
import type { Props } from "./types";


export function Player({
  player,
  PLAYER_SIZE,
  weapon,
  grabFlipped = false,
  form,
  transformationFrame = null,
  blinkVisual = null,
  teleportSprite = false,
  preAtomic = false,
  outroExpression = null,
  atomicHalo = false,
  atomicFlash = false,
  mugetsuBlink = null,
  babidiAttackVariant,
  babidiMachineGamaControl = false,
  babidiShieldSides,
  onBabidiShieldEnd,
  hakai = false,
  sigiloPhase,
  levelUpParticles = true,
  nameTag,
}: Props) {
  const blinkSilhouette =
    player.character === "natsuki" && blinkVisual
      ? blinkVisual.teleported
        ? "white"
        : "black"
      : null;

  const activeStatuses = getActivePlayerStatusApplications(player);

  return (
    <PlayerBattle
      activeStatuses={activeStatuses}
      character={player.character}
      x={player.x}
      y={player.y}
      PLAYER_SIZE={PLAYER_SIZE}
      state={player.state}
      direction={player.battleDirection}
      weapon={weapon}
      grabbedUntil={player.grabbedUntil}
      grabFlipped={grabFlipped}
      form={form}
      transformationFrame={transformationFrame}
      blinkSilhouette={blinkSilhouette}
      teleportSprite={teleportSprite}
      preAtomic={preAtomic}
      outroExpression={outroExpression}
      atomicHalo={atomicHalo}
      atomicFlash={atomicFlash}
      mugetsuBlink={mugetsuBlink}
      babidiAttackVariant={babidiAttackVariant}
      babidiMachineGamaControl={babidiMachineGamaControl}
      babidiShieldSides={babidiShieldSides}
      onBabidiShieldEnd={onBabidiShieldEnd}
      levelUpParticles={levelUpParticles}
      nameTag={nameTag}
      hakai={hakai}
      sigiloPhase={sigiloPhase}
    />
  );
}
