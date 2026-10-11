import type { CHARACTERS } from "@/data/characters/list";
import { EMANUEL_COMBO_WINDOW_MS } from "@/data/characters/emanuel/emanuel";
import type { CharacterPassive } from "./types";
import type { CharacterPassiveKind } from "./types";

const NOT_IMPLEMENTED: CharacterPassiveKind = { kind: "notImplemented" };

export const CHARACTER_PASSIVES: Record<
  (typeof CHARACTERS)[number],
  CharacterPassive[]
> = {
  marcelo: [
    {
      characterId: "marcelo",
      id: "vastolordForm",
      name: "Forma Vastolord",
      description:
        "Ao morrer, desperta a Forma Vastolord por 10s, recuperando 100% do HP e multiplicando dano e armadura por 4. Se o inimigo não for derrotado a tempo, perde a batalha.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "vastolordForm", durationMs: 10_000 },
    },
    // {
    //   characterId: "marcelo",
    //   id: "clearCut",
    //   name: "Corte Limpo",
    //   description:
    //     "Pode recortar qualquer projétil em 2 separando suas direções, desviando o ataque.",
    //   unlockedAtLevel: 1,
    //   oncePerBattle: true,
    //   effect: { kind: "clearCut" },
    // }
  ],
  eduarda: [
    {
      characterId: "eduarda",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  lucas: [
    {
      characterId: "lucas",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  samuel: [
    {
      characterId: "samuel",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  artur: [
    {
      characterId: "artur",
      id: "rewindTime",
      name: "Retrocesso Temporal",
      description:
        "Uma vez por batalha, ao morrer, retrocede 10s no tempo antes da morte, restaurando a vida e o estado da batalha.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "rewindTime", rewindMs: 10_000 },
    },
  ],
  mayra: [
    {
      characterId: "mayra",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  lucaua: [
    {
      characterId: "lucaua",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  riquelme: [
    {
      characterId: "riquelme",
      id: "cursedEnergy",
      name: "Energia Amaldiçoada",
      description:
        "Não usa mana: a energia amaldiçoada não regenera com o tempo e não existem poções dela. Ganha 1 de energia amaldiçoada a cada 5 de dano causado.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: { kind: "cursedEnergy" },
    },
    {
      characterId: "riquelme",
      id: "honoredOne",
      name: "O Mais Honrado",
      description:
        "Uma vez por batalha, ao sofrer um golpe que seria letal, sobrevive com 1 de vida. Após isso, a regeração de energia amaldiçoada passa a ocorrer e em alta velocidade.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "honoredOne" },
    },
  ],
  larissa: [
    {
      characterId: "larissa",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  camilly: [
    {
      characterId: "camilly",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  emanuel: [
    {
      characterId: "emanuel",
      id: "combo",
      name: "Combo",
      description:
        "Ataques básicos consecutivos executam o combo: soco, gancho, chute baixo e finalizador aéreo. A cada golpe o Emanuel avança em direção ao inimigo e o empurra para trás. Pressionar atacar de novo dentro de 300ms encadeia o próximo golpe com dano crescente (1x até 1.5x). Parar por mais de 300ms volta ao primeiro golpe.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: { kind: "combo", windowMs: EMANUEL_COMBO_WINDOW_MS },
    },
  ],
  levi: [
    {
      characterId: "levi",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
};
