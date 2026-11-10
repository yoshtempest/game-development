import { useRef } from "react";
import type { CSSProperties } from "react";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { GAME_VIEWPORT_WIDTH_RATIO } from "@/data/grid";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";

type Params = {
  background?: string;
  /** Fundo da cutscene, que sobrepõe o fundo da batalha quando presente. */
  cutsceneBackground: string | null;
};

/**
 * Geometria da batalha: tamanho da tela/container, posição inicial do fundo e
 * escalas do mapa. Alimenta o `useBattleCamera` e os overlays da cena.
 */
export function useBattleViewport({ background, cutsceneBackground }: Params) {
  const { width: screenWidth, height: screenHeight } = getViewportSize();
  const containerWidth = screenWidth * GAME_VIEWPORT_WIDTH_RATIO;
  const containerHeight = screenHeight;

  const initialBgPosRef = useRef({
    x: (BATTLE_SPAWN.player.x / ProjectileConstants.MAP_WIDTH) * 100,
    y: (BATTLE_SPAWN.player.y / ProjectileConstants.MAP_HEIGHT) * 100,
  });

  const battleScaleX = screenWidth / ProjectileConstants.MAP_WIDTH;
  const battleScaleY = screenHeight / ProjectileConstants.MAP_HEIGHT;

  // Expansão de Domínio: o fundo da batalha permanece o original — quem cobre
  // a cena é o overlay `background.svg` (DomainExpansionBackground), surgindo
  // sendo renderizado de baixo para cima durante a habilidade inteira.
  const effectiveBackground = cutsceneBackground ?? background;

  return {
    screenWidth,
    screenHeight,
    containerWidth,
    containerHeight,
    initialBgPosRef,
    battleScaleX,
    battleScaleY,
    effectiveBackground,
  };
}

type BackgroundStyleParams = {
  effectiveBackground?: string;
  zoom: number;
  adjustedBgX: number;
  adjustedBgY: number;
  shake: { x: number; y: number };
};

/** Estilo do fundo da cena combinando zoom, parallax e shake da câmera. */
export function getBattleBackgroundStyle({
  effectiveBackground,
  zoom,
  adjustedBgX,
  adjustedBgY,
  shake,
}: BackgroundStyleParams): CSSProperties | undefined {
  if (!effectiveBackground) return undefined;

  return {
    backgroundImage: `url(${effectiveBackground})`,
    backgroundSize: `calc(150% * ${zoom})`,
    backgroundPosition: `calc(${adjustedBgX}% + ${shake.x}px) calc(${adjustedBgY}% + ${shake.y}px)`,
  };
}
