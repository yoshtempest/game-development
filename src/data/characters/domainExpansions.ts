import type { CharacterId } from "@/data/characters/list";
import { ONE_THOUSAND_FIVE_HUNDRED_MS } from "@/data/ms";

/**
 * Expansão de Domínio por personagem — nome, descrição, cor e qual efeito a
 * habilidade roda.
 *
 * Todo personagem tem o botão (é a barra da Expansão que é universal, não a
 * habilidade em si). `kind` escolhe o efeito:
 *
 * - `mugetsu`: o execute bespoke do marshadow (varre o mapa, 100% da vida
 *   máxima) — ver `useDomainExpansion`.
 * - `muryokusho`: o domínio bespoke do natsuki — congela o mundo, segura a
 *   pose `rioiki.svg` por 5s e drena 0,2% da vida MÁXIMA dos inimigos a cada
 *   50ms — ver `useNatsukiDomainExpansion`.
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
  kind: "mugetsu" | "muryokusho" | "hakai" | "burst" | "machineGama";
  /**
   * Tem a arte do domínio em `abilities/domainExpansion/`: a intro
   * (`background.svg`) no `SpecialIntro` e o preenchimento (`expansion.svg`)
   * no `DomainExpansionBackground`. Os demais ficam com a cor do `accent`.
   */
  hasBackgroundArt?: boolean;
  /**
   * Só para `kind: "burst"`: fator do dano especial no NPC principal. Ausente
   * cai no `DOMAIN_BURST_MAIN_MULTIPLIER` universal — é o que mantém os 11
   * domínios genéricos com o mesmo peso. Existe para variantes de forma (ex.:
   * Vastolord) que reaproveitam o burst mas precisam bater mais forte.
   */
  burstMainMultiplier?: number;
  /** Só para `kind: "burst"`: fator do dano especial em cada summon. */
  burstSummonMultiplier?: number;
};

/**
 * Formas que trocam a Expansão de Domínio do personagem enquanto estão ativas.
 * Hoje só a Forma Vastolord do marshadow (#498); forma nova entra na union e
 * em `DOMAIN_EXPANSION_FORM_VARIANTS`.
 */
export type DomainExpansionForm = "vastolord";

/**
 * Duração da saída do `expansion.svg` quando algum inimigo sobrevive ao
 * domínio: o vidro estilhaça, depois desce e sai do campo de visão (o
 * `DomainExpansionBackground` roda a mesma duração em CSS). Vale para TODAS
 * as Expansões de Domínio.
 */
export const DOMAIN_SHATTER_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;

export const DOMAIN_EXPANSIONS: Record<CharacterId, DomainExpansionDefinition> =
  {
    marshadow: {
      name: "Mugetsu",
      description:
        "Teleporta para a ponta mais próxima do mapa e varre tudo, causando 100% da vida máxima a quem atravessa.",
      accent: "#8b5cf6",
      kind: "mugetsu",
      hasBackgroundArt: true,
    },
    drika: {
      name: "Tribunal Sem Fim",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#f59e0b",
      kind: "burst",
    },
    yvel: {
      name: "Ringue Infinito",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#f97316",
      kind: "burst",
    },
    samurion: {
      name: "Poço dos Gigantes",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#a16207",
      kind: "burst",
    },
    srGuaxinim: {
      name: "Abismo Carmesim",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#ef4444",
      kind: "burst",
      hasBackgroundArt: true,
    },
    yra: {
      name: "Maré Abissal",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#06b6d4",
      kind: "burst",
    },
    babidi: {
      name: "Machine Gama",
      description:
        "Invoca a Machine Gama: o jogador assume a entidade, que dispara mísseis teleguiados ao inimigo.",
      accent: "#d946ef",
      kind: "machineGama",
      hasBackgroundArt: true,
    },
    natsuki: {
      name: "Muryōkūsho",
      description:
        "Expande um domínio que congela o mundo e drena 0,2% da vida máxima de todos os inimigos a cada 50ms, por 5s.",
      accent: "#3b82f6",
      kind: "muryokusho",
      hasBackgroundArt: true,
    },
    laricell: {
      name: "Campo Fulminante",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#eab308",
      kind: "burst",
    },
    camyKaze: {
      name: "Horizonte Rubro",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#ec4899",
      kind: "burst",
    },
    ematron: {
      name: "Hakai",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#14b8a6",
      kind: "hakai",
      hasBackgroundArt: true,
    },
    levi: {
      name: "Explosão Galática",
      description:
        "Expande um domínio sobre a arena inteira: uma explosão de energia atinge todos os inimigos, causando dano especial.",
      accent: "#52525b",
      kind: "burst",
    },
  };

/**
 * Fator do dano especial do domínio da Forma Vastolord no NPC principal.
 *
 * Decisão para revisar (#498): 3x a proporção especial/básico (o burst
 * genérico usa 2x). O multiplicador da forma (x4) já entra pelo funil de dano,
 * então o golpe fica forte sem virar o execute do Mugetsu — que segue
 * indisponível na forma justamente por apagar a luta de uma vez.
 */
export const VASTOLORD_DOMAIN_MAIN_MULTIPLIER = 3;
/** Fator do domínio Vastolord em cada summon (o burst genérico usa 1x). */
export const VASTOLORD_DOMAIN_SUMMON_MULTIPLIER = 2;

/**
 * Domínios alternativos por forma. A forma vence o domínio base enquanto
 * estiver ativa; personagem/forma sem entrada cai em `DOMAIN_EXPANSIONS`.
 *
 * A Forma Vastolord reaproveita o burst universal (cargas, lock, overlay e o
 * funil `handleDomainBurst`) em vez de um hook próprio: o domínio herda de
 * graça o vampirismo, a extensão por abate e a armadura do alvo, que o funil
 * já aplica.
 */
export const DOMAIN_EXPANSION_FORM_VARIANTS: Partial<
  Record<
    CharacterId,
    Partial<Record<DomainExpansionForm, DomainExpansionDefinition>>
  >
> = {
  marshadow: {
    vastolord: {
      name: "Hueco Mundo",
      description:
        "Só na Forma Vastolord: o deserto sem lua engole a arena e uma onda de reiatsu atinge todos os inimigos, causando dano especial pesado.",
      accent: "#dc2626",
      kind: "burst",
      burstMainMultiplier: VASTOLORD_DOMAIN_MAIN_MULTIPLIER,
      burstSummonMultiplier: VASTOLORD_DOMAIN_SUMMON_MULTIPLIER,
    },
  },
};

/**
 * Resolve o domínio em uso: a variante da forma ativa, se houver, senão o
 * domínio base do personagem. Ponto único para botão, overlay e efeito — se
 * um deles ler `DOMAIN_EXPANSIONS` direto, o botão mostra um domínio e o
 * golpe roda outro.
 */
export function getDomainExpansion(
  character: CharacterId,
  form: DomainExpansionForm | null,
): DomainExpansionDefinition {
  if (form) {
    const variant = DOMAIN_EXPANSION_FORM_VARIANTS[character]?.[form];
    if (variant) return variant;
  }
  return DOMAIN_EXPANSIONS[character];
}
