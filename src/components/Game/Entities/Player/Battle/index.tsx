import styles from "./styles.module.css";
import type { PlayerBattleProps } from "./types";
import { useBattleSprite } from "./hooks/useBattleSprite";
import { useHonoredRotation } from "./hooks/useHonoredRotation";
import { useArturSeeingSound } from "./hooks/useArturSeeingSound";
import { getPlayerDimensions } from "./utils/getPlayerDimensions";
import { getPlayerTransform } from "./utils/getPlayerTransform";
import { getBlinkConfig } from "./utils/getBlink";
import { ChargingKiEffect } from "./ChargingKiEffect";
import { BattleSprite } from "./BattleSprite";
import { AtomicHalo } from "./AtomicHalo";
import { LucauaShield } from "./LucauaShield";
import { LevelUpParticles } from "@/components/Game/LevelUpParticles";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";

import type { LucauaShieldSides } from "@/utils/types/character/lucaua";

/** Nenhum shield do lucaua ativo, usado quando a prop não vem. */
const NO_LUCAUA_SHIELD: LucauaShieldSides = { left: 0, right: 0 };

export function PlayerBattle(props: PlayerBattleProps) {
  const {
    x,
    y,
    PLAYER_SIZE,
    state,
    direction,
    character,
    weapon,
    grabbedUntil = 0,
    grabFlipped = false,
    form,
    transformationFrame = null,
    blinkSilhouette = null,
    teleportSprite = false,
    preAtomic = false,
    outroExpression = null,
    atomicHalo = false,
    atomicFlash = false,
    mugetsuBlink = null,
    levelUpParticles = false,
    lucauaAttackVariant,
    lucauaShieldSides = NO_LUCAUA_SHIELD,
    onLucauaShieldEnd,
    lucauaPortalLanding = false,
  } = props;

  const isChargingKi = character === "emanuel" && state === "chargingKi";

  const isCrouching = ALL_PREDICATES.isCrouched(state);

  const isFallen = state === "fallen";

  const isGrabbed = Date.now() < grabbedUntil && !isFallen && !isCrouching;

  const showFlipped = isGrabbed && grabFlipped;

  const { src, handleSpriteError } = useBattleSprite({
    character,
    state,
    weapon,
    form,
    transformationFrame,
    teleportSprite,
    preAtomic,
    outroExpression,
    lucauaAttackVariant,
    lucauaPortalLanding,
  });

  const isMostHonored = state === "mostHonored";

  const rotationDeg = useHonoredRotation(isMostHonored);

  useArturSeeingSound(src);

  const dimensions = getPlayerDimensions(PLAYER_SIZE);

  const blink = getBlinkConfig(blinkSilhouette);

  const transform = getPlayerTransform({
    direction,
    rotationDeg,
    showFlipped,
    isCrouching,
    isFallen,
  });

  const transformOrigin =
    isCrouching || showFlipped || isMostHonored ? "bottom center" : undefined;

  const spriteClassName = [
    blink.className,
    atomicFlash ? styles.atomicFlash : "",
    mugetsuBlink === "out" ? styles.mugetsuBlinkOut : "",
    mugetsuBlink === "in" ? styles.mugetsuBlinkIn : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      style={{
        position: "absolute",
        width: dimensions.width,
        height: dimensions.height,
        left: x * dimensions.scaleX,
        top: y * dimensions.scaleY,
        transform: "translate(-50%, -100%)",
        zIndex: 10,
        overflow: "visible",
      }}
    >
      {isChargingKi && (
        <ChargingKiEffect
          width={dimensions.chargingEffectWidth}
          height={dimensions.chargingEffectHeight}
        />
      )}

      <BattleSprite
        src={src}
        className={spriteClassName}
        blinkDuration={blink.duration}
        transform={transform}
        transformOrigin={transformOrigin}
        onError={handleSpriteError}
      />

      {/* Bloqueio do lucaua: um shield por lado atacado, remontado a cada golpe
          (nonce) para repetir o blink. O `key` por lado+nonce é o que garante
          que dois lados coexistam sem que um roube a animação do outro. */}
      {onLucauaShieldEnd && lucauaShieldSides.left > 0 && (
        <LucauaShield
          key={`lucaua-shield-left-${lucauaShieldSides.left}`}
          side="left"
          nonce={lucauaShieldSides.left}
          onEnd={onLucauaShieldEnd}
        />
      )}

      {onLucauaShieldEnd && lucauaShieldSides.right > 0 && (
        <LucauaShield
          key={`lucaua-shield-right-${lucauaShieldSides.right}`}
          side="right"
          nonce={lucauaShieldSides.right}
          onEnd={onLucauaShieldEnd}
        />
      )}

      {atomicHalo && character === "marcelo" && <AtomicHalo />}

      {levelUpParticles && (
        <LevelUpParticles
          character={character}
          size={Math.round(dimensions.height)}
        />
      )}
    </div>
  );
}
