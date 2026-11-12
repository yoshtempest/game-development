import { CONTENT_PACKS } from "@/data/content/packs";

export const DIFFICULTY: NpcDifficulty[] = ["easy", "medium", "hard"];
export const COLUMN_COUNT = 5;
export const BOTTOM_COUNT = 5;
// 5 linhas na aba "batalha": 2 toggles + intro de habilidade + treino + card.
export const BATTLE_COUNT = 5;
/** Linhas da aba "conteúdo": um pacote por linha + "Baixar tudo" no fim. */
export const CONTENT_COUNT = CONTENT_PACKS.length + 1;

export function getColumnMaxIndex(column: number): number {
  if (column === 0) return 1; // card único de dificuldade (cicla com ◀/▶ ou ↑/↓)
  if (column === 1) return 1; // card único de velocidade de diálogo (cicla com ◀/▶ ou ↑/↓)
  if (column === 2) return BOTTOM_COUNT;
  return 1;
}

/**
 * Colunas do `VolumeSection`. Ficam nomeadas porque o componente é
 * compartilhado entre a config de exploração (onde são as colunas 3 e 4 da
 * grade) e a tela de configurações da batalha, que só tem as duas.
 */
export const SFX_COLUMN = 3;
export const BGM_COLUMN = 4;

/** Passo de volume por toque/seta, igual nas duas telas de configuração. */
export const VOLUME_STEP = 10;
