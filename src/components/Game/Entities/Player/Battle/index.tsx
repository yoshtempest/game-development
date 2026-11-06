import styles from "./styles.module.css";
import type { PlayerBattleProps } from "./types";
import { useBattleSprite } from "./hooks/useBattleSprite";
import { useHonoredRotation } from "./hooks/useHonoredRotation";
import { useSrGuaxinimSeeingSound } from "./hooks/useSrGuaxinimSeeingSound";
import { getPlayerDimensions } from "./utils/getPlayerDimensions";
import { getPlayerTransform } from "./utils/getPlayerTransform";
import { getBlinkConfig } from "./utils/getBlink";
import { ChargingKiEffect } from "./ChargingKiEffect";
import { BattleSprite } from "./BattleSprite";
import { AtomicHalo } from "./AtomicHalo";
import { BabidiShield } from "./BabidiShield";
import { LevelUpParticles } from "@/components/Game/LevelUpParticles";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { ProjectileConstants } from "@/data/projectile";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { computeEntityShadow } from "@/utils/shadow/entityShadow";

import type { BabidiShieldSides } from "@/utils/types/character/babidi";

/** Nenhum shield do babidi ativo, usado quando a prop não vem. */
const NO_BABIDI_SHIELD: BabidiShieldSides = { left: 0, right: 0 };

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
    babidiAttackVariant,
    babidiMachineGamaControl = false,
    babidiShieldSides = NO_BABIDI_SHIELD,
    onBabidiShieldEnd,
    hakai = false,
  } = props;

  const isChargingKi = character === "ematron" && state === "chargingKi";

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
    babidiAttackVariant,
    babidiMachineGamaControl,
    hakai,
  });

  const isMostHonored = state === "mostHonored";

  const rotationDeg = useHonoredRotation(isMostHonored);

  useSrGuaxinimSeeingSound(src);

  const dimensions = getPlayerDimensions(PLAYER_SIZE);

  const blink = getBlinkConfig(blinkSilhouette);

  const transform = getPlayerTransform({
    direction,
    rotationDeg,
    showFlipped,
    isCrouching,
    isFallen,
  });

  const shadow = computeEntityShadow(
    x,
    y,
    ProjectileConstants.MAP_WIDTH,
    ProjectileConstants.MAP_HEIGHT,
  );

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

  const sprite = (
    <BattleSprite
      src={src}
      className={spriteClassName}
      blinkDuration={blink.duration}
      transform={transform}
      transformOrigin={transformOrigin}
      onError={handleSpriteError}
      isIdle={state === "idle"}
    />
  );

  const groundY = BATTLE_SPAWN.player.y;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: dimensions.width,
          height: dimensions.height,
          left: x * dimensions.scaleX,
          top: groundY * dimensions.scaleY,
          transform: "translate(-50%, -100%)",
          zIndex: 9,
          pointerEvents: "none",
        }}
      >
        <img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            filter: "brightness(0)",
            opacity: shadow.opacity,
            transform: `scaleX(${direction === "left" ? -1 : 1}) translate(${shadow.offsetX}px, ${shadow.offsetY}px) scaleX(${shadow.scaleX}) scaleY(${shadow.scaleY}) skewX(${shadow.skewX}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      </div>
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

        {sprite}

        {/* Bloqueio do babidi: um shield por lado atacado, remontado a cada golpe
            (nonce) para repetir o blink. O `key` por lado+nonce é o que garante
            que dois lados coexistam sem que um roube a animação do outro. */}
        {onBabidiShieldEnd && babidiShieldSides.left > 0 && (
          <BabidiShield
            key={`babidi-shield-left-${babidiShieldSides.left}`}
            side="left"
            nonce={babidiShieldSides.left}
            onEnd={onBabidiShieldEnd}
          />
        )}

        {onBabidiShieldEnd && babidiShieldSides.right > 0 && (
          <BabidiShield
            key={`babidi-shield-right-${babidiShieldSides.right}`}
            side="right"
            nonce={babidiShieldSides.right}
            onEnd={onBabidiShieldEnd}
          />
        )}

        {atomicHalo && character === "marshadow" && <AtomicHalo />}

        {levelUpParticles && (
          <LevelUpParticles
            character={character}
            size={Math.round(dimensions.height)}
          />
        )}
      </div>
    </>
  );
}
