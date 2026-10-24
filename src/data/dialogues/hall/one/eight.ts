import { defineDialogue } from "@/data/dialogues/defineDialogue";

export const AfterPcRoomEightDialogue = defineDialogue([
  ["protagonista", "Eu vi coisas que gostaria de desver..."],
  ["remedinha", "Quem?"],
  ["protagonista", "Eu ué"],
  {
    who: "remedinha",
    pose: "happy",
    message: "Te perguntou? Otário kkkkkkkk",
  },
  ["protagonista", "Tá chato já"],
  ["remedinha", "Nunca fica chato"],
  ["protagonista", "..."],
  [
    "remedinha",
    "Vou passar uma missão aqui, se quiser prosseguir na história tem que fazer",
  ],
  ["protagonista", "Diga"],
  [
    "remedinha",
    "Eu quero que você se infiltre no conselho dos brodi para obter informações, lá você vai encontrar outras pessoas como você",
  ],
  ["protagonista", "Vambora então"],
]);
