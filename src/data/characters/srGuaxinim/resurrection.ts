import {
  ONE_THOUSAND_FIVE_HUNDRED_MS,
  FOUR_HUNDRED_MS,
  EIGHT_HUNDRED_MS,
  ONE_THOUSAND_MS,
} from "@/data/ms";
import type { RewindResurrectionPhase } from "@/utils/types/battle/rewind";

/**
 * Ordem das fases da cinemática do "Retrocesso Temporal" (#284). Substitui o
 * antigo replay frame a frame: a volta no tempo agora acontece de uma vez, no
 * fim do `flash`.
 */
export const REWIND_RESURRECTION_PHASES: readonly RewindResurrectionPhase[] = [
  "launch",
  "portal",
  "void",
  "flash",
];

/**
 * Duração de cada fase. Decisão para revisar: valores escolhidos para a
 * cinemática inteira caber em ~3,7s (a issue não define tempos).
 */
export const REWIND_RESURRECTION_PHASE_MS: Record<
  RewindResurrectionPhase,
  number
> = {
  launch: EIGHT_HUNDRED_MS,
  portal: ONE_THOUSAND_MS,
  void: ONE_THOUSAND_FIVE_HUNDRED_MS,
  flash: FOUR_HUNDRED_MS,
};

/**
 * Altura (em px do mapa de batalha) que o personagem sobe no arremesso até a
 * boca do portal. Decisão para revisar.
 */
export const REWIND_RESURRECTION_LAUNCH_HEIGHT = 220;

/**
 * Pasta da cinemática em `inFight/habilities/` (resolvida por
 * `playerAbilityPath`) e os nomes dos arquivos. Enquanto a arte não existir o
 * componente cai num fallback em CSS (gradiente sob o `background-image`), então
 * a mecânica funciona sem ela.
 */
export const REWIND_RESURRECTION_ABILITY_FOLDER = "rewindPortal";
export const REWIND_RESURRECTION_FILES = {
  portal: "portal.svg",
  galaxy: "galaxy.svg",
} as const;

/** Sprite do personagem durante a cinemática (`inFight/<file>`), já existente. */
export const REWIND_RESURRECTION_PLAYER_SPRITE = "returningInTime.svg";
