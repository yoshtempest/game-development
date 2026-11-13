/**
 * Idiomas oferecidos no menu de config. O jogo só tem texto em português:
 * "en" não troca nenhuma string, só libera a página para o tradutor do
 * navegador ("Traduzir esta página"), que é quem faz a tradução.
 */
export type GameLanguage = "pt" | "en";

export const LANGUAGE_LABEL: Record<GameLanguage, string> = {
  pt: "Português",
  en: "English",
};

/**
 * Idioma do conteúdo publicado em `<html lang>`. Fica `pt-BR` nas duas
 * escolhas de propósito: o navegador só oferece tradução quando o idioma
 * declarado da página difere do idioma do usuário — declarar `en` faria o
 * Chrome achar que a página já está em inglês e esconder a oferta.
 */
export const CONTENT_LANG = "pt-BR";

/** Lê o valor persistido; qualquer coisa fora da lista volta ao português. */
export function parseGameLanguage(raw: string | null): GameLanguage {
  return raw === "en" ? "en" : "pt";
}
