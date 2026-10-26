import { createBestiary } from "@/utils/bestiary/createBestiary";

export const barragemData = createBestiary({
  /* ── Barragem ── */
  figurantOfMobyDickCult: {
    name: "Figurante do Culto de Moby Dick",
    description:
      "Seguidores fanáticos que cultuam a baleia branca. Usam arpões e cantos hipnóticos.",
    location: "Barragem",
    attacks: ["Arpoada", "Canto Hipnótico"],
  },
  crocodile: {
    name: "Crocodilo",
    description:
      "Crocodilos da Barragem — predadores de emboscada que atacam rápido e arrastam para a água.",
    location: "Barragem",
    attacks: ["Boca de Aço", "Caudaço", "Rolagem Mortal"],
  },
  elitCrocodile: {
    name: "Crocodilo de Elite",
    description:
      "Crocodilos maiores e mais espertos que guardam os acessos mais profundos da Barragem.",
    location: "Barragem",
    attacks: ["Boca de Aço", "Caudaço", "Rolagem Mortal", "Escudo de Escamas"],
  },
  mobyDick: {
    name: "Moby Dick",
    description:
      "A lendária baleia branca que aterroriza a Barragem. Dizem que é imortal.",
    location: "Barragem",
    attacks: ["Jato Colossal", "Cauda do Juízo", "Mergulho Profundo"],
  },
  yangKai: {
    name: "Yang Kai",
    description:
      "Um cultivador misterioso que apareceu na Barragem. Seu poder é de outro mundo.",
    location: "Barragem",
    attacks: ["Corte de Qi", "Palma da Montanha", "Explosão Espiritual"],
  },
});
