import { useRef, useState } from "react";
import { getViewportSize } from "@/utils/viewport";
import {
  getBossSizeMultiplier,
  getNpcSpriteYOffset,
  getSpritePath,
} from "@/utils/npc/getSpritePath";
import { ProjectileConstants } from "@/data/projectile";
import type {
  MugetsuDisintegrationTarget,
  MugetsuSweep,
} from "@/utils/types/battle/mugetsu";
import styles from "./styles.module.css";

type TargetProps = {
  target: MugetsuDisintegrationTarget;
  sweep: MugetsuSweep | null;
  TILE_SIZE: number;
};

/**
 * Corte de um alvo tocado pela varredura do mugetsu.
 *
 * O sprite é partido em duas metades (esquerda/direita): a frente da varredura
 * cruzando o centro do alvo é o corte, e a partir dali cada metade desliza para
 * o seu lado girando para fora do plano (`perspective` + `rotateY`) — o vão que
 * abre no meio, com a fatia do sprite parada ao fundo, é a espessura do corte
 * (o 2.5D que o jogo 2D não tem). As duas desvanecem até sumir.
 *
 * O retângulo do wrapper é o mesmo do sprite do alvo na cena (que fica `hidden`
 * durante a varredura), então o corte cai exatamente em cima de onde ele estava.
 */
export function MugetsuTargetDisintegration({
  target,
  sweep,
  TILE_SIZE,
}: TargetProps) {
  const idleTriedRef = useRef(false);
  const [src, setSrc] = useState(() =>
    getSpritePath(target.npcType, target.state, target.npcPhase, target.isAlfa),
  );

  // Antes do corte as metades ficam em repouso e reconstroem o sprite inteiro;
  // a varredura já ter acabado (`sweep` null) também corta — o alvo só entra na
  // lista depois de tocado.
  const frontX = sweep?.x ?? null;
  const cut =
    frontX == null ||
    (target.direction === "right" ? frontX >= target.x : frontX <= target.x);

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;
  const sizeMultiplier = getBossSizeMultiplier(
    target.npcType,
    target.npcPhase,
    target.isAlfa,
  );
  const yOffset = getNpcSpriteYOffset(target.npcType);
  const w = TILE_SIZE * sizeMultiplier;

  /** Sprite ausente na fase do NPC cai no idle.svg (mesma regra da cena). */
  function handleSpriteError() {
    if (idleTriedRef.current) return;
    idleTriedRef.current = true;
    setSrc(
      getSpritePath(target.npcType, "idle", target.npcPhase, target.isAlfa),
    );
  }

  return (
    <div
      className={`${styles.wrapper} ${cut ? styles.cut : ""}`}
      style={{
        left: target.x * scaleX,
        top: target.y * scaleY,
        width: w,
        height: w,
        transform: `translate(-50%, calc(-100% + ${yOffset * 100}%))`,
      }}
    >
      {/* Espessura do corte: a fatia central do sprite em silhueta preta fica
          parada enquanto as metades giram para fora — é o fundo do corte que o
          vão revela. */}
      <img
        className={styles.core}
        src={src}
        alt=""
        draggable={false}
        onError={handleSpriteError}
      />
      <div className={`${styles.half} ${styles.left}`}>
        <img
          className={styles.sprite}
          src={src}
          alt=""
          draggable={false}
          onError={handleSpriteError}
        />
      </div>
      <div className={`${styles.half} ${styles.right}`}>
        <img
          className={styles.sprite}
          src={src}
          alt=""
          draggable={false}
          onError={handleSpriteError}
        />
      </div>
    </div>
  );
}
