import type { GameLanguage } from "@/data/settings/language";
import { CONTENT_LANG } from "@/data/settings/language";

const NOTRANSLATE_META_NAME = "google";

/**
 * Aplica a escolha de idioma ao documento. Em português a página é marcada
 * como não traduzível (`translate="no"` + `<meta name="google"
 * content="notranslate">`): tradução automática reescreve os nós de texto que
 * o React controla e pode quebrar a renderização, então só acontece quando o
 * jogador pede. Em inglês as duas marcas saem e o navegador volta a oferecer
 * "Traduzir esta página".
 *
 * Chamado no boot (`main.tsx`) e a cada troca no menu, porque o `index.html`
 * nasce bloqueado e a escolha persistida precisa valer antes do primeiro
 * render.
 */
export function applyDocumentLanguage(
  language: GameLanguage,
  doc: Document = document,
): void {
  const html = doc.documentElement;
  html.lang = CONTENT_LANG;

  const existing = doc.head.querySelector<HTMLMetaElement>(
    `meta[name="${NOTRANSLATE_META_NAME}"]`,
  );

  if (language === "en") {
    html.removeAttribute("translate");
    existing?.remove();
    return;
  }

  html.setAttribute("translate", "no");
  if (existing) {
    existing.content = "notranslate";
    return;
  }
  const meta = doc.createElement("meta");
  meta.name = NOTRANSLATE_META_NAME;
  meta.content = "notranslate";
  doc.head.appendChild(meta);
}
