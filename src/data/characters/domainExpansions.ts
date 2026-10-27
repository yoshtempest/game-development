import type { CharacterId } from "@/data/characters/list";
import { ONE_THOUSAND_FIVE_HUNDRED_MS } from "@/data/ms";

/**
 * Expansão de Domínio por personagem — nome, descrição, cor e qual efeito a
 * habilidade roda.
 *
 * Todo personagem tem o botão (é a barra da Expansão que é universal, não a
 * habilidade em si). `kind` escolhe o efeito:
 *
 * - `mugetsu`: o execute bespoke do marcelo (varre o mapa, 100% da vida
 *   máxima) — ver `useDomainExpansion`.
 * - `muryokusho`: o domínio bespoke do riquelme — congela o mundo, segura a
 *   pose `rioiki.svg` por 5s e drena 0,2% da vida MÁXIMA dos inimigos a cada
 *   50ms — ver `useRiquelmeDomainExpansion`.
 * - `burst`: o efeito base universal — explosão de dano especial em todos os
 *   inimigos da arena, mesmo multiplicador para todos — ver
 *   `useDomainExpansionBurst`.
 */
export type DomainExpansionDefinition = {
  /** Rótulo do botão e do menu de Status. */
  name: string;
  description: string;
  /** Cor do efeito (borda, rótulo e brilho do botão). */
  accent: string;
  kind: "mugetsu" | "muryokusho" | "hakai" | "burst";
  /**
   * Tem a arte do domínio em `abilities/domainExpansion/`: a intro
   * (`background.svg`) no `SpecialIntro` e o preenchimento (`expansion.svg`)
   * no `DomainExpansionBackground`. Os demais ficam com a cor do `accent`.
   */
  hasBackgroundArt?: boolean;
};

/**
 * Duração da saída do `expansion.svg` quando algum inimigo sobrevive ao
 * domínio: o vidro estilhaça, depois desce e sai do campo de visão (o
 * `DomainExpansionBackground` roda a mesma duração em CSS). Vale para TODAS
 * as Expansões de Domínio.
 */
export const DOMAIN_SHATTER_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;

export const DOMAIN_EXPANSIONS: Record<CharacterId, DomainExpansionDefinition> =
  {
    marcelo: {
      name: "Expansão de Domínio",
      description:
        "Teleporta para a ponta mais próxima do mapa e varre tudo, causando 100% da vida máxima a quem atravessa. Boss com duas fases segue para a fase seguinte. Consome as 40 cargas da barra.",
      accent: "#8b5cf6",
      kind: "mugetsu",
      hasBackgroundArt: true,
    },
    eduarda: {
      name: "Tribunal Sem Fim",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#f59e0b",
      kind: "burst",
    },
    lucas: {
      name: "Ringue Infinito",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#f97316",
      kind: "burst",
    },
    samuel: {
      name: "Poço dos Gigantes",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#a16207",
      kind: "burst",
    },
    artur: {
      name: "Abismo Carmesim",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#ef4444",
      kind: "burst",
      hasBackgroundArt: true,
    },
    mayra: {
      name: "Maré Abissal",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#06b6d4",
      kind: "burst",
    },
    lucaua: {
      name: "Engrenagem Etérea",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#d946ef",
      kind: "burst",
      hasBackgroundArt: true,
    },
    riquelme: {
      name: "Muryōkūsho",
      description:
        "Expande um domínio que congela o mundo e drena 0,2% da vida máxima de todos os inimigos a cada 50ms, por 5s. Consome as 40 cargas da barra.",
      accent: "#3b82f6",
      kind: "muryokusho",
      hasBackgroundArt: true,
    },
    larissa: {
      name: "Campo Fulminante",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#eab308",
      kind: "burst",
    },
    camilly: {
      name: "Horizonte Rubro",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#ec4899",
      kind: "burst",
    },
    emanuel: {
      name: "Ciclone Fulgurante",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#14b8a6",
      kind: "hakai",
      hasBackgroundArt: true,
    },
    levi: {
      name: "Fauce do Draco",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#52525b",
      kind: "burst",
    },
  };
