import { useEffect, useRef, useState } from "react";
import { getViewportSize } from "@/utils/viewport";
import {
  getBossSizeMultiplier,
  getNpcSpriteYOffset,
  getSpritePath,
} from "@/utils/npc/getSpritePath";
import { ProjectileConstants } from "@/data/projectile";
import { DOMAIN_EXPANSION_DISINTEGRATION_MS } from "@/data/characters/marcelo/marshadowDomainExpansion";
import type {
  MugetsuDisintegrationTarget,
  MugetsuSweep,
} from "@/utils/types/battle/mugetsu";
import { cellRand } from "@/components/Game/Battle/Effects/Marshadow/MugetsuDisintegration/cellRand";
import { getSilhouetteMask } from "./silhouetteMask";

const GRID_COLS = 12;
const GRID_ROWS = 12;

/** PRNG determinístico por célula: mesmo destino de pó em todos os frames. */

type TargetProps = {
  target: MugetsuDisintegrationTarget;
  sweep: MugetsuSweep | null;
  TILE_SIZE: number;
};

/**
 * Desintegração de um alvo tocado pela varredura (3s): o sprite é renderizado
 * num canvas e picotado numa grade de pixels (só nas células com desenho do
 * sprite — a silhueta); conforme o mugetsuEffect passa, os pixels viram pretos;
 * quando o alvo é engolido por inteiro, os pixels saem voando (vento da
 * varredura + subida) e somem como pó.
 */
export function MugetsuTargetDisintegration({
  target,
  sweep,
  TILE_SIZE,
}: TargetProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dustStartRef = useRef<number | null>(null);
  const idleTriedRef = useRef(false);
  const rafRef = useRef(0);
  /**
   * Células do sprite com pixel visível (undefined = ainda não lida → nenhum
   * quadradinho, null = indisponível → grade cheia). Recalculado quando o
   * sprite muda.
   */
  const maskRef = useRef<Uint8Array | null | undefined>(undefined);
  const sweepRef = useRef(sweep);
  sweepRef.current = sweep;

  const [src, setSrc] = useState(() =>
    getSpritePath(target.npcType, target.state, target.npcPhase, target.isAlfa),
  );

  useEffect(() => {
    maskRef.current = undefined;
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
    const sizeMultiplier = getBossSizeMultiplier(
      target.npcType,
      target.npcPhase,
      target.isAlfa,
    );
    const w = TILE_SIZE * sizeMultiplier;
    const canvasSize = w * 8;
    const margin = (canvasSize - w) / 2;

    canvas.width = Math.round(canvasSize * dpr);
    canvas.height = Math.round(canvasSize * dpr);
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const logicWidth = w / scaleX;
    const cellW = w / GRID_COLS;
    const cellH = w / GRID_ROWS;
    const wind = target.direction === "right" ? 1 : -1;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const now = Date.now();
      const elapsed = now - target.startedAt;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      if (elapsed < 0 || elapsed >= DOMAIN_EXPANSION_DISINTEGRATION_MS) return;

      // Sprite original inteiro por baixo (células ainda não cobertas).
      const img = imageRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, margin, margin, w, w);
        if (maskRef.current === undefined) {
          maskRef.current = getSilhouetteMask(img, GRID_COLS, GRID_ROWS);
        }
      }
      const mask = maskRef.current;

      // Máscara ainda não lida (sprite carregando): sem quadradinho nenhum.
      // Cair na grade aqui pintaria de preto o fundo transparente do sprite,
      // que é exatamente o que a silhueta existe para evitar.
      if (mask === undefined) return;

      const frontX = sweepRef.current?.x ?? null;
      const left = target.x - logicWidth / 2;
      const right = target.x + logicWidth / 2;

      const fullyEngulfed =
        frontX == null
          ? true
          : target.direction === "right"
            ? frontX >= right
            : frontX <= left;

      if (!fullyEngulfed) {
        dustStartRef.current = null;
      } else if (dustStartRef.current == null) {
        dustStartRef.current = now;
      }

      const dustAt = dustStartRef.current;
      const dustRemaining =
        dustAt == null
          ? 0
          : Math.max(
              0,
              DOMAIN_EXPANSION_DISINTEGRATION_MS - (dustAt - target.startedAt),
            );

      for (let col = 0; col < GRID_COLS; col++) {
        for (let row = 0; row < GRID_ROWS; row++) {
          // Fora da silhueta do sprite: nada a picotar (fundo transparente).
          if (mask && !mask[row * GRID_COLS + col]) continue;
          const cellCenterX = left + ((col + 0.5) / GRID_COLS) * logicWidth;
          const covered =
            frontX == null
              ? true
              : target.direction === "right"
                ? frontX >= cellCenterX
                : frontX <= cellCenterX;
          if (!covered) continue;

          const x = margin + col * cellW;
          const y = margin + row * cellH;

          if (dustAt == null) {
            // Célula escurecida: a passagem do mugetsuEffect deixou o pixel preto.
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#000000";
            ctx.fillRect(x, y, cellW, cellH);
            ctx.globalAlpha = 1;
            continue;
          }

          // Pó: o pixel preto sai voando (vento + subida) e desvanece.
          const delay = cellRand(target.id, col, row, "delay") * 180;
          const t = now - dustAt - delay;
          if (t <= 0) {
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#000000";
            ctx.fillRect(x, y, cellW, cellH);
            ctx.globalAlpha = 1;
            continue;
          }

          const k = Math.min(1, t / Math.max(1, dustRemaining));
          const speed = cellRand(target.id, col, row, "speed");
          const rise = cellRand(target.id, col, row, "rise");
          // Velocidade proporcional ao tamanho do sprite: o pó voa até ~3.5w
          // sem passar da margem do canvas (que é w * 8).
          const ax = (wind * ((0.4 + speed * 0.7) * w)) / 1000;
          const ay = -(((0.3 + rise * 0.6) * w) / 1000);
          const driftX = ax * (t / 1000);
          const driftY = ay * (t / 1000);
          const shrink = 1 - 0.35 * k;

          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - k * k);
          ctx.fillStyle = "#000000";
          ctx.fillRect(
            x + driftX + (cellW * (1 - shrink)) / 2,
            y + driftY + (cellH * (1 - shrink)) / 2,
            cellW * shrink,
            cellH * shrink,
          );
          ctx.restore();
        }
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [src, target, TILE_SIZE]);

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;
  const sizeMultiplier = getBossSizeMultiplier(
    target.npcType,
    target.npcPhase,
    target.isAlfa,
  );
  const yOffset = getNpcSpriteYOffset(target.npcType);
  const w = TILE_SIZE * sizeMultiplier;
  const canvasSize = w * 8;
  const margin = (canvasSize - w) / 2;
  const spriteScreenX = target.x * scaleX;
  const spriteScreenY = target.y * scaleY;

  return (
    <div
      style={{
        position: "absolute",
        left: spriteScreenX - w / 2 - margin,
        top: spriteScreenY - w + yOffset * w - margin,
        width: canvasSize,
        height: canvasSize,
        zIndex: 9,
        pointerEvents: "none",
      }}
    >
      {/* Canvas maior que o sprite: o pó tem espaço para voar e desvanecer. */}
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      {/* Carregador (e fallback idle) do sprite do alvo. */}
      <img
        ref={imageRef}
        src={src}
        alt=""
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onError={() => {
          if (idleTriedRef.current) return;
          idleTriedRef.current = true;
          setSrc(
            getSpritePath(
              target.npcType,
              "idle",
              target.npcPhase,
              target.isAlfa,
            ),
          );
        }}
        style={{
          // Não usar `display: none`: browsers podem adiar a decodificação de
          // imagem não renderizada, e a máscara de silhueta é lida dela. Sem
          // pixels lidos a grade cai inteira e o picotado invade o fundo
          // transparente do sprite.
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
