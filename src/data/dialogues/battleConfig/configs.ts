import { soundEffectPath } from "@/utils/paths";

import { defineDialogue } from "@/data/dialogues/defineDialogue";

export const battleConfigDialogue = defineDialogue([
  ["janelaSistema", "As chances são de ${chance} e ai, você perderia?"],
  {
    who: "protagonista",
    message: "Nah i'd win.",
    expression: "victory",
    soundSrc: soundEffectPath("player/characters/riquelme/nahIdWin.mp3"),
  },
]);
