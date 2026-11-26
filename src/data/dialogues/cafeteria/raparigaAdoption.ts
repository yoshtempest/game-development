import { defineDialogue } from "@/data/dialogues/defineDialogue";

/**
 * Cutscene de adoção da Rapariga (issue #476). Roda só na primeira vez que o
 * pet é desbloqueado, emendada no diálogo da cafeteria e antes do modal de
 * unlock — repetir a cena a cada prato extra banalizaria o momento.
 *
 * Os gatos "saem de debaixo das mesas" só pela fala: cada um tem retrato
 * esperado em `public/assets/npc/cats/<gato>/default.svg` (ver `SPEAKERS`).
 * Enquanto o sprite não existir, o balão aparece sem retrato.
 */
export const raparigaAdoptionCutscene = defineDialogue([
  {
    who: "rapariga",
    pose: "happy",
    message: "Galera, nosso novo dono decidiu nos adotar! ~nya",
  },
  ["protagonista", "Galera...?", "why"],
  ["gatoSchrodinger", "Opa, esse é nosso novo dono? Ou não é? Ou os dois?"],
  ["gatoDeBotas", "Ao seu dispor, señor! *tira o chapéu*"],
  ["garfield", "Ele tem lasanha? Se não tiver, eu volto a dormir."],
  ["tom", "*olha para os lados procurando um rato*"],
  ["meowth", "Meowth, é isso aí! Mais um pra equipe!"],
  ["protagonista", "De onde saiu esse tanto de gato?!", "ops"],
  {
    who: "rapariga",
    pose: "good",
    message: "De debaixo das mesas, ué. Agora somos uma família ~nya",
  },
]);
