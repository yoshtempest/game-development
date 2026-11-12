import { defineDialogue } from "@/data/dialogues/defineDialogue";

/**
 * Fala padrão do Gato Falante, sem a Rapariga por perto.
 *
 * O falante `gatoFalante` ainda não tem `base` em `SPEAKERS`: sem sprite no
 * repo, o diálogo mostra só o nome em vez de uma imagem quebrada.
 */
export const talkingCatDefaultDialogue = defineDialogue([
  ["gatoFalante", "Miau. Quer dizer... olá, humano."],
  ["protagonista", "Um gato que fala?!"],
  ["gatoFalante", "Um humano que escuta. Cada dia uma surpresa."],
]);

/**
 * Interação especial da issue #454: com a Rapariga equipada, os dois gatos se
 * reconhecem e a conversa muda.
 */
export const talkingCatRaparigaDialogue = defineDialogue([
  ["gatoFalante", "Espera... esse cheiro... Rapariga?!"],
  {
    who: "rapariga",
    pose: "happy",
    message: "Tio Bigodes! Quanto tempo ~nya",
  },
  [
    "gatoFalante",
    "Achei que você tinha sumido atrás de um prato de comida na cafeteria.",
  ],
  {
    who: "rapariga",
    pose: "good",
    message: "E sumi! Mas esse humano me alimenta direitinho ~nya",
  },
  ["protagonista", "Vocês se conhecem?"],
  [
    "gatoFalante",
    "Todo gato conhece todo gato. Cuide bem dela, humano, ou vai se ver com o clã inteiro.",
  ],
]);

/**
 * Escolhe a conversa do Gato Falante pelo pet equipado. Recebe só o booleano
 * para continuar dado puro: quem monta a cena resolve o pet (`pet_rapariga`)
 * pelo contexto de equipamento.
 */
export function getTalkingCatDialogue(hasRaparigaEquipped: boolean) {
  return hasRaparigaEquipped
    ? talkingCatRaparigaDialogue
    : talkingCatDefaultDialogue;
}
