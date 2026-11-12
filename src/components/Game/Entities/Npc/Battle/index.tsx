import { useEffect, useRef, useState } from "react";
import { npcPath, npcPathProjectile } from "@/utils/paths";
import {
  getSpritePath,
  getBossSizeMultiplier,
  getNpcSpriteYOffset,
} from "@/utils/npc/getSpritePath";
import { ProjectileConstants } from "@/data/projectile";
import { computeEntityShadow } from "@/utils/shadow/entityShadow";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { getViewportSize } from "@/utils/viewport";
import {
  MARSHADOW_CUT_IN_ENEMIE_SRC,
  BLOOD_ICON_SRC,
} from "@/data/characters/marshadow/marshadowCutIn";
import type { CutInEnemieOverlay } from "@/utils/types/battle/cutInEnemie";

type Props = {
  x: number;
  y: number;
  TILE_SIZE: number;
  npcType: string;
  state:
    | "idle"
    | "walk"
    | "default"
    | "hit"
    | "jumping"
    | "attack"
    | "pitch"
    | "inAir"
    | "airAttack"
    | "preAttack"
    | "preJump"
    | "inJump"
    | "jumpAttack"
    | "block"
    | "meleeAttack"
    | "rangedAttack"
    | "get"
    | "throw"
    | "startDash"
    | "inDash"
    | "startThrow"
    | "throwing"
    | "throwed"
    | "startSpin"
    | "inSpin"
    | "finishSpin"
    | "preMove"
    | "run"
    | "slap"
    | "push"
    | "meditating"
    | "flying"
    | "landing"
    | "laser"
    | "debuff"
    | "throwPapers"
    | "charging"
    | "invoking"
    | "dig"
    | "entering"
    | "entered"
    | "fall"
    | "giveMeMyPower"
    | "jump"
    | "falling"
    | "prePunch"
    | "punch"
    | "preKick"
    | "kick";
  direction: "left" | "right";
  piercings?: { id: number; x: number; y: number }[];
  isExploding?: boolean;
  isHidden?: boolean;
  /** Fade-out/in para o NPC underground (alfas cavando): opacity com transição. */
  isUnderground?: boolean;
  npcPhase?: number;
  isDying?: boolean;
  isAlfa?: boolean;
  /** CutInEnemie do marshadow sobrepondo o NPC (aparece por 1s no ataque). */
  cutInEnemie?: CutInEnemieOverlay | null;
  /** NPC em sangramento: mostra o bloodIcon acima da imagem. */
  npcBleeding?: boolean;
  /**
   * Furo da esfera purple: se a purple matou o NPC, o sprite perde o lado
   * central-direito no ponto do impacto (em vez de só sumir no fade).
   */
  purpleHole?: boolean;
};

export function NPCBattle({
  x,
  y,
  TILE_SIZE,
  npcType,
  state,
  direction,
  piercings = [],
  isExploding = false,
  isHidden = false,
  isUnderground = false,
  npcPhase = 1,
  isDying = false,
  isAlfa = false,
  cutInEnemie = null,
  npcBleeding = false,
  purpleHole = false,
}: Props) {
  const { playSound } = useSoundEffects();
  const prevIsExplodingRef = useRef(isExploding);

  const isHungryDeathRunning = npcType === "hungryDeath" && state === "run";
  const [runFrame, setRunFrame] = useState(0);

  useEffect(() => {
    if (!isHungryDeathRunning) {
      setRunFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setRunFrame((f) => (f + 1) % 3);
    }, 100);
    return () => clearInterval(interval);
  }, [isHungryDeathRunning]);

  useEffect(() => {
    // Troca para o sprite explosion.svg -> explosion.mp3 (uma vez por transição)
    if (isExploding && !prevIsExplodingRef.current) {
      playSound("explosion");
    }
    prevIsExplodingRef.current = isExploding;
  }, [isExploding, playSound]);

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const shadow = computeEntityShadow(
    x,
    y,
    ProjectileConstants.MAP_WIDTH,
    ProjectileConstants.MAP_HEIGHT,
  );

  const sizeMultiplier = getBossSizeMultiplier(npcType, npcPhase, isAlfa);
  const yOffset = getNpcSpriteYOffset(npcType);

  const basePath = getSpritePath(npcType, state, npcPhase, isAlfa);

  const src = isExploding
    ? npcPathProjectile("/explosion.svg")
    : isHungryDeathRunning
      ? npcPath(`/hungryDeath/run${runFrame + 1}.svg`)
      : `${basePath}`;

  // Alguns bosses não possuem o sprite resolvido (ex.: idle.svg na 2ª fase).
  // Fazemos fallback em runtime: idle.svg → default.svg → walk.svg.
  const [resolvedSrc, setResolvedSrc] = useState(src);
  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  const handleSpriteError = () => {
    setResolvedSrc((prev) => {
      // Fallback genérico: qualquer sprite ausente → default.svg → walk.svg.
      if (prev.endsWith("/walk.svg")) return prev;
      if (prev.endsWith("/default.svg")) {
        return prev.replace(/default\.svg$/, "walk.svg");
      }
      return prev.replace(/[^/]+$/, "default.svg");
    });
  };

  // ── Furo da esfera purple ─────────────────────────────────────────────────
  // Só aparece se a purple matou o NPC: em vez de sumir no fade, o sprite fica
  // visível e perde um pedaço circular no lado central-direito (o ponto do
  // impacto). O `%` do furo é no espaço LOCAL da imagem e precisa compensar o
  // `scaleX(-1)` da direita para o buraco cair sempre no lado direito da TELA.
  const showPurpleHole = purpleHole && isDying && !isExploding;
  const holeX = direction === "right" ? 28 : 72;
  const holeMask = `radial-gradient(circle at ${holeX}% 47%, transparent 0 22%, #000 23%)`;

  const groundY = 550;

  return (
    <>
      {!isHidden && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: TILE_SIZE * sizeMultiplier,
            height: TILE_SIZE * sizeMultiplier,
            left: x * scaleX,
            top: groundY * scaleY,
            transform: "translate(-50%, -100%)",
            zIndex: 8,
            pointerEvents: "none",
          }}
        >
          <img
            loading="lazy"
            decoding="async"
            src={resolvedSrc}
            style={{
              width: "100%",
              height: "100%",
              filter: "brightness(0)",
              opacity: shadow.opacity,
              transform: `scaleX(${direction === "right" ? -1 : 1}) translate(${shadow.offsetX}px, ${shadow.offsetY}px) scaleX(${shadow.scaleX}) scaleY(${shadow.scaleY}) skewX(${shadow.skewX}deg)`,
              transformOrigin: "bottom center",
            }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          width: TILE_SIZE * sizeMultiplier,
          height: TILE_SIZE * sizeMultiplier,
          left: x * scaleX,
          top: y * scaleY,
          transform: `translate(-50%, calc(-100% + ${yOffset * 100}%))`,
          zIndex: 9,
        }}
      >
        {/* 🧍 NPC (oculto quando vira alvo de bomba da killerQueen) */}
        {!isHidden && (
          <img
            loading="lazy"
            decoding="async"
            src={resolvedSrc}
            onError={handleSpriteError}
            style={{
              width: "100%",
              height: "100%",
              transform: `scaleX(${direction === "right" ? -1 : 1})`,
              position: "absolute",
              opacity: showPurpleHole ? 1 : isDying || isUnderground ? 0 : 1,
              filter: isDying ? "grayscale(100%)" : "none",
              ...(showPurpleHole
                ? {
                    maskImage: holeMask,
                    WebkitMaskImage: holeMask,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                  }
                : {}),
              transition: isUnderground
                ? "opacity 0.4s linear"
                : "opacity 1s linear, filter 1s linear",
            }}
          />
        )}

        {/* 🗡️ PIERCINGS */}
        {piercings.map((p) => (
          <img
            loading="lazy"
            decoding="async"
            key={p.id}
            src={npcPathProjectile("/piercing.svg")}
            style={{
              position: "absolute",
              width: TILE_SIZE * 0.4,
              height: TILE_SIZE * 0.4,
              left: "50%",
              top: "50%",
              transform: `translate(${p.x}px, ${p.y}px)`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ✂️ CUT-IN ENEMIE do marshadow: strike sobre o NPC (1s, ângulo aleatório) */}
        {cutInEnemie && (
          <img
            loading="lazy"
            decoding="async"
            key={cutInEnemie.key}
            src={MARSHADOW_CUT_IN_ENEMIE_SRC}
            style={{
              position: "absolute",
              width: TILE_SIZE * sizeMultiplier * 0.5,
              left: "50%",
              top: TILE_SIZE * 0.35,
              transform: `translate(-50%, -50%) rotate(${cutInEnemie.rotation}deg)`,
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        )}

        {/* 🩸 BLOOD ICON: NPC em sangramento mostra o ícone acima da imagem */}
        {npcBleeding && (
          <img
            loading="lazy"
            decoding="async"
            src={BLOOD_ICON_SRC}
            style={{
              position: "absolute",
              width: TILE_SIZE * 0.1,
              height: TILE_SIZE * 0.1,
              left: "50%",
              top: -TILE_SIZE * 0.45,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        )}
      </div>
    </>
  );
}
