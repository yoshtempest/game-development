import { createBestiary } from "@/utils/bestiary/createBestiary";

export const bocainaData = createBestiary({
    /* ── Bocaina ── */
    lupita: {
        name: "Lupita",
        description:
        "A líder da matilha de Bocaina. Uma loba gigante com cicatrizes de inúmeras batalhas.",
        location: "Bocaina",
        attacks: ["Uivo Aterrorizante", "Mordida Sanguinária", "Garra Cortante"],
    },
    duque: {
        name: "Cachorro de Natsuki",
        description:
        "O cão de guarda de Natsuki, um dos moradores mais excêntricos de Bocaina. Fiel e mortal.",
        location: "Bocaina",
        attacks: ["Latido Intimidador", "Investida Protetora"],
    },
    baiano: {
        name: "Baiano",
        description:
        "Um capoeirista habilidoso que defende Bocaina com seus movimentos acrobáticos.",
        location: "Bocaina",
        attacks: ["Rasteira", "Chute de Capoeira", "Ginga"],
    },
    spiritMotocycler: {
        name: "Motoqueiro Fantasma",
        description:
        "A lenda de Bocaina — um motoqueiro que morreu em um acidente e agora assombra as estradas.",
        location: "Bocaina",
        attacks: ["Atropelamento Fantasma", "Escapamento Flamejante"],
    },
    tim: {
        name: "Tim",
        description:
        "Um assassino ágil que pula e faz acrobacias com duas facas de sashimi. Cultista de Baal.",
        location: "Bocaina",
        attacks: ["Facada Acrobática", "Salto Mortal", "Chuva de Lâminas"],
    },
    muyMacho: {
        name: "Muy Macho",
        description:
        "Um lutador de luta livre mexicano que perdeu o rumo. Agora vagueia por Bocaina em busca de oponentes.",
        location: "Bocaina",
        attacks: ["Máscara Voadora", "Queda Livre", "Abraço de Urso"],
  },
    figurantOfBaalCult: {
        name: "Figurante do Culto de Baal",
        description:
        "Membros rasos do culto a Baal. Vestem mantos negros e repetem mantras sem entender o significado.",
        location: "Bocaina",
        attacks: ["Golpe de Adaga", "Maldição Menor"],
    },
    baal: {
        name: "Baal",
        description:
        "O líder do culto das Cachoeiras. Dizem que ele fez um pacto com um demônio ancestral.",
        location: "Bocaina",
        attacks: ["Chama Negra", "Invocar Seguidores", "Olhar do Abismo"],
    },
})