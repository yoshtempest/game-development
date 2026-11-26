import { createMaterials } from "@/utils/items/createMaterial";

/**
 * Iscas de pesca (issues #138 e #146).
 *
 * São materiais (não consumíveis do menu) porque o gasto acontece no
 * arremesso da vara, não ao clicar no item da mochila — o efeito de cada uma
 * (natureza e qualidade) vive em `data/professions/baits.ts`, para que a
 * tabela de itens continue só com apresentação.
 *
 * Sprites esperados em `public/assets/items/baits/<id>.svg`.
 */
export const BAITS = createMaterials("baits", {
  bait_worm: {
    name: "Isca de Minhoca",
    description:
      "Isca de batalha simples. Sempre fisga um monstro, quase nunca um forte.",
  },
  bait_shrimp: {
    name: "Isca de Camarão",
    description:
      "Isca de batalha melhorada. Atrai monstros um pouco mais perigosos.",
  },
  bait_glowing: {
    name: "Isca Luminosa",
    description:
      "Isca de batalha que brilha no fundo da água. Monstros fortes notam.",
  },
  bait_abyssal: {
    name: "Isca Abissal",
    description:
      "A melhor isca de batalha. Dizem que até o Leviathan sobe por ela.",
  },
  bait_bread: {
    name: "Isca de Miolo de Pão",
    description: "Isca de recurso. Monstro nenhum se interessa: só vem peixe.",
  },
});
