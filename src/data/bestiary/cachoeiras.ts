import { createBestiary } from "@/utils/bestiary/createBestiary";

export const cachoeirasData = createBestiary({
  /* ── Cachoeiras ── */
  madame: {
    name: "Madame",
    description:
      "Uma aranha gigante do tamanho de um cão de caça. Ela tece teias nas árvores das Cachoeiras.",
    location: "Cachoeiras",
    attacks: ["Teia Pegajosa", "Picada Venenosa", "Patas Cortantes"],
  },
});
