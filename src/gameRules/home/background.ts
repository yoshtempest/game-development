import {
  CHAPTER_ORDER,
  CHAPTER_START_FLAGS,
  HOME_BACKGROUND_FILES,
} from "@/data/chapters";
import type { ChapterId } from "@/data/chapters";
import { sceneBackgrounds } from "@/data/scene/background";
import { cenariosPath } from "@/utils/paths";

/** Fundo usado no prólogo e sempre que a arte do capítulo não existe. */
export const DEFAULT_HOME_BACKGROUND: string = sceneBackgrounds.Home;

/**
 * Resolve o capítulo em que o jogador está a partir das flags do save.
 *
 * Percorre `CHAPTER_ORDER` e devolve o último capítulo cuja flag de início já
 * foi gravada; `null` significa prólogo (o jogador ainda não entrou no
 * capítulo 1).
 */
export function getCurrentChapter(
  hasFlag: (flagId: FlagId) => boolean,
): ChapterId | null {
  let current: ChapterId | null = null;
  for (const chapter of CHAPTER_ORDER) {
    if (hasFlag(CHAPTER_START_FLAGS[chapter])) current = chapter;
  }
  return current;
}

/**
 * Caminho do fundo da Home para o capítulo informado.
 *
 * Pura: só consulta `HOME_BACKGROUND_FILES`. Prólogo ou capítulo sem entrada
 * caem no fundo padrão, para a Home nunca ficar sem imagem enquanto a arte de
 * um capítulo não existe. A falha de carregamento de um arquivo registrado
 * mas ausente em `public/` é tratada por quem renderiza
 * (`useImageWithFallback`), com `DEFAULT_HOME_BACKGROUND` como fallback.
 */
export function getHomeBackgroundForChapter(chapter: ChapterId | null): string {
  if (chapter === null) return DEFAULT_HOME_BACKGROUND;
  const file = HOME_BACKGROUND_FILES[chapter];
  return file ? cenariosPath(`/home/${file}`) : DEFAULT_HOME_BACKGROUND;
}
