import { defineDialogue } from "@/data/dialogues/defineDialogue";

export const raparigaDialogue = defineDialogue([
  { who: "rapariga", pose: "good", message: "Que comida boa ~nya" },
  ["protagonista", "Se você tá dizendo então tá né", "crossArms"],
  {
    who: "rapariga",
    pose: "good",
    message: "Você tem mais dessa delícia aqui para me dar? ~nya",
  },
  {
    who: "rapariga",
    pose: "happy",
    message: "Obrigadaa!, pode contar comigo se precisar ~nya",
  },
]);
