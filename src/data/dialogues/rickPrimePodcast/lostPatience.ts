import { defineDialogue } from "@/data/dialogues/defineDialogue";

/**
 * Última fala do Rick Prime: tocada quando todos os episódios do podcast já
 * foram ouvidos. O `onFinish` desse diálogo é que leva o jogador à batalha.
 */
export const rickPrimeLostPatienceDialogue = defineDialogue([
  ["rickPrime", "Você de novo?! Eu já falei tudo que tinha pra falar."],
  ["protagonista", "Eu só queria conversar mais um pouco..."],
  [
    "rickPrime",
    "Acabou a minha paciência. Se não vai me deixar em paz, vou te apagar desta dimensão!",
  ],
]);
