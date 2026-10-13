import type { CharacterId } from "@/data/characters/list";

/**
 * Expansão de Domínio por personagem — nome, descrição, cor e qual efeito a
 * habilidade roda.
 *
 * Todo personagem tem o botão (é a barra da Expansão que é universal, não a
 * habilidade em si). `kind` escolhe o efeito:
 *
 * - `mugetsu`: o execute bespoke do marcelo (varre o mapa, 100% da vida
 *   máxima) — ver `useDomainExpansion`.
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
  kind: "mugetsu" | "burst";
  /**
   * Tem background próprio em `abilities/domainExpansion/background.svg`.
   * Só o marcelo tem arte: os demais ficam com a cor do `accent`.
   */
  hasBackgroundArt?: boolean;
};

export const DOMAIN_EXPANSIONS: Record<CharacterId, DomainExpansionDefinition> =
  {
    marcelo: {
      name: "Expansão de Domínio",
      description:
        "Teleporta para a ponta mais próxima do mapa e varre tudo, matando todos os inimigos instantaneamente (100% da vida máxima). Consome as 40 cargas da barra.",
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
    },
    riquelme: {
      name: "Muryōkūsho",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#3b82f6",
      kind: "burst",
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
      kind: "burst",
    },
    levi: {
      name: "Fauce do Draco",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial. Consome as 40 cargas da barra.",
      accent: "#52525b",
      kind: "burst",
    },
  };
