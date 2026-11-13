import { useState } from "react";
import type { CSSProperties } from "react";

import { playerAbilityPath } from "@/utils/paths";
import type { LaricellVisual } from "@/hooks/battle/player/characters/laricell/types";

import styles from "./styles.module.css";

type Props = {
  visual: LaricellVisual | null;
  npc: { x: number; y: number };
  player: { x: number; y: number };
  battleScaleX: number;
  battleScaleY: number;
};

type SpriteProps = {
  ability: string;
  file: string;
  className: string | undefined;
  style: CSSProperties;
};

/**
 * Sprite de habilidade com fallback em CSS: enquanto a arte não existe em
 * `public/` (issue #517 — os sprites ainda não foram entregues), o `onError`
 * esconde a imagem e o efeito continua visível pela própria forma da `div`
 * (gradiente do módulo CSS). Quando o arquivo chegar no caminho esperado, ele
 * aparece sem mudança de código e o `hasArt` desliga o gradiente de fallback.
 */
function AbilitySprite({ ability, file, className, style }: SpriteProps) {
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={[className, loaded ? styles.hasArt : undefined]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {!missing && (
        <img
          loading="lazy"
          decoding="async"
          src={playerAbilityPath("laricell", ability, file)}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setMissing(true)}
        />
      )}
    </div>
  );
}

/**
 * Efeitos das habilidades da Laricell na arena: Parede de Gelo, Brincos
 * Explosivos (pavio → explosão), nuvem da Bomba de Fumaça sobre o NPC, aura
 * da Forma Vampira e o flash da Mordida. É só apresentação — o efeito de jogo
 * (bloqueio, erro, dano, cura) já foi resolvido nos hooks.
 */
export function LaricellEffects({
  visual,
  npc,
  player,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!visual) return null;
  const at = (x: number, y: number): CSSProperties => ({
    left: x * battleScaleX,
    top: y * battleScaleY,
  });

  return (
    <>
      {visual.wall && (
        <AbilitySprite
          ability="iceWall"
          file="wall.svg"
          className={styles.iceWall}
          style={at(visual.wall.x, player.y)}
        />
      )}
      {visual.earrings && (
        <AbilitySprite
          key={`${visual.earrings.id}-${visual.earrings.phase}`}
          ability="explodingEarrings"
          file={
            visual.earrings.phase === "fuse" ? "earrings.svg" : "explosion.svg"
          }
          className={
            visual.earrings.phase === "fuse"
              ? styles.earrings
              : styles.earringsExplosion
          }
          style={at(visual.earrings.x, visual.earrings.y)}
        />
      )}
      {visual.smokeActive && (
        <AbilitySprite
          ability="smokeBomb"
          file="smoke.svg"
          className={styles.smoke}
          style={at(npc.x, npc.y)}
        />
      )}
      {visual.vampireActive && (
        <AbilitySprite
          ability="vampireForm"
          file="aura.svg"
          className={styles.vampireAura}
          style={at(player.x, player.y)}
        />
      )}
      {visual.bite && (
        <AbilitySprite
          ability="vampireBite"
          file="bite.svg"
          className={styles.bite}
          style={at(visual.bite.x, visual.bite.y)}
        />
      )}
    </>
  );
}
