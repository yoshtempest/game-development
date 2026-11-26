import { useEffect, useState } from "react";

/**
 * Devolve `src` só depois de confirmar que a imagem carrega; enquanto carrega
 * ou se falhar, devolve `fallback`.
 *
 * Existe porque `background-image` em CSS não dispara `onError`: um arquivo
 * registrado mas ainda ausente em `public/` deixaria a tela sem fundo. O
 * pré-carregamento via `Image` detecta a falha e mantém o fundo padrão. Os
 * handlers são desligados no cleanup para uma troca rápida de `src` não
 * aplicar o resultado de uma imagem antiga.
 */
export function useImageWithFallback(src: string, fallback: string): string {
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (src === fallback) return;
    const image = new Image();
    image.onload = () => setLoaded(src);
    image.onerror = () => setLoaded(null);
    image.src = src;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [src, fallback]);

  return loaded === src ? src : fallback;
}
