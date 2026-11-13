import type { SyntheticEvent } from "react";

/**
 * `onError` para ícone que ainda não foi desenhado em `public/`: esconde a
 * imagem em vez de mostrar o ícone quebrado do navegador. Usa `visibility`
 * (não `display`) para preservar o espaço e manter os rótulos alinhados.
 */
export function hideBrokenImage(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.visibility = "hidden";
}
