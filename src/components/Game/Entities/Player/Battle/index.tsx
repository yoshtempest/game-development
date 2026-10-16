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
    lucauaPortalCross = null,
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

  const sprite = (
    <BattleSprite
      src={src}
      className={spriteClassName}
      blinkDuration={blink.duration}
      transform={transform}
      transformOrigin={transformOrigin}
      onError={handleSpriteError}
    />
  );

  // ── Portal terrestre: sprite dividido entre os dois portais ───────────────
  // Enquanto o corpo afunda na linha do portal de origem, a parte que já passou
  // some daqui e reaparece saindo do portal par. O corte é medido na mesma
  // escala do render (`scaleY`), então o pedaço "de dentro" casa com a arte.
  const inside = lucauaPortalCross
    ? Math.min(
        Math.max(lucauaPortalCross.depth * dimensions.scaleY, 0),
        dimensions.height,
      )
    : 0;
  const sourceMask = lucauaPortalCross
    ? `linear-gradient(to top, transparent 0 ${inside}px, #000 ${inside}px)`
    : undefined;
  const destMask = lucauaPortalCross
    ? `linear-gradient(to bottom, transparent 0 ${dimensions.height - inside}px, #000 ${dimensions.height - inside}px)`
    : undefined;

  return (
    <>
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
          maskImage: sourceMask,
          WebkitMaskImage: sourceMask,
          maskRepeat: "no-repeat",
        }}
      >
        {isChargingKi && (
          <ChargingKiEffect
            width={dimensions.chargingEffectWidth}
            height={dimensions.chargingEffectHeight}
          />
        )}

        {sprite}

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

      {/* Portal par: só o pedaço que está "dentro" da origem, saindo do destino.
          Fora do container mascarado para o corte da origem não vazá-lo também. */}
      {lucauaPortalCross && inside > 0 && (
        <div
          style={{
            position: "absolute",
            width: dimensions.width,
            height: dimensions.height,
            left: lucauaPortalCross.destX * dimensions.scaleX,
            top: lucauaPortalCross.destY * dimensions.scaleY,
            transform: "translate(-50%, -100%)",
            zIndex: 10,
            overflow: "visible",
            maskImage: destMask,
            WebkitMaskImage: destMask,
            maskRepeat: "no-repeat",
            pointerEvents: "none",
          }}
        >
          {sprite}
        </div>
      )}
    </>
  );
}
