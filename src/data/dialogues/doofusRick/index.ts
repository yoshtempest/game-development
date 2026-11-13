import { defineDialogue } from "@/data/dialogues/defineDialogue";

/**
 * Conversa com o Doofus Rick (issue #445). Ele termina prometendo mostrar um
 * portal, mas a sala branca com os portais por nível ainda não existe — por
 * isso o diálogo para no "Olha aqui ó" sem navegar para lugar nenhum.
 */
export const doofusRickDialogue = defineDialogue([
  [
    "doofusRick",
    "Psiu! O conselho dos vilões está influenciando outros mundos... e eu tô aqui numa missão pra encontrar algum deles e arrancar informações.",
  ],
  ["protagonista", "Outros mundos? Que mundos são esses?"],
  ["doofusRick", "Mundos, ué! Um monte deles, cada um mais estranho que o outro."],
  [
    "protagonista",
    "Eu duvido que esses outros mundos realmente existam, tu deve tá é chapado.",
  ],
  ["doofusRick", "É sério cara, eu tô te falando, confia."],
  ["protagonista", "Só acredito vendo."],
  ["doofusRick", "Eu tô em uma missão secreta, não posso lhe mostrar não cara."],
  ["protagonista", "Você tá tirando com a minha cara né."],
  ["doofusRick", "Quer saber? Olha aqui ó."],
]);
