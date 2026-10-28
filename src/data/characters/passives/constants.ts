import type { CHARACTERS } from "@/data/characters/list";
import { EMATRON_COMBO_WINDOW_MS } from "@/data/characters/ematron";
import type { CharacterPassive } from "./types";
import type { CharacterPassiveKind } from "./types";

const NOT_IMPLEMENTED: CharacterPassiveKind = { kind: "notImplemented" };

export const CHARACTER_PASSIVES: Record<
  (typeof CHARACTERS)[number],
  CharacterPassive[]
> = {
  marshadow: [
    {
      characterId: "marshadow",
      id: "vastolordForm",
      name: "Forma Vastolord",
      description:
        "Ao morrer, desperta a Forma Vastolord por 10s, recuperando 100% do HP e multiplicando dano e armadura por 4. O grito da transformação empurra os inimigos próximos (até 200px, quanto mais perto mais longe) e, enquanto a forma dura, 10% de todo o dano causado vira cura. Se o inimigo não for derrotado a tempo, perde a batalha.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "vastolordForm", durationMs: 10_000 },
    },
    // {
    //   characterId: "marshadow",
    //   id: "clearCut",
    //   name: "Corte Limpo",
    //   description:
    //     "Pode recortar qualquer projétil em 2 separando suas direções, desviando o ataque.",
    //   unlockedAtLevel: 1,
    //   oncePerBattle: true,
    //   effect: { kind: "clearCut" },
    // }
  ],
  drika: [
    {
      characterId: "drika",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  yvel: [
    {
      characterId: "yvel",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  samurion: [
    {
      characterId: "samurion",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  srGuaxinim: [
    {
      characterId: "srGuaxinim",
      id: "rewindTime",
      name: "Retrocesso Temporal",
      description:
        "Uma vez por batalha, ao morrer, retrocede 10s no tempo antes da morte, restaurando a vida e o estado da batalha.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "rewindTime", rewindMs: 10_000 },
    },
  ],
  yra: [
    {
      characterId: "yra",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  babidi: [
    {
      characterId: "babidi",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  natsuki: [
    {
      characterId: "natsuki",
      id: "cursedEnergy",
      name: "Energia Amaldiçoada",
      description:
        "Não usa mana: a energia amaldiçoada não regenera com o tempo e não existem poções dela. Ganha 1 de energia amaldiçoada a cada 5 de dano causado.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: { kind: "cursedEnergy" },
    },
    {
      characterId: "natsuki",
      id: "honoredOne",
      name: "O Mais Honrado",
      description:
        "Uma vez por batalha, ao sofrer um golpe que seria letal, sobrevive com 1 de vida. Após isso, a regeração de energia amaldiçoada passa a ocorrer e em alta velocidade.",
      unlockedAtLevel: 1,
      oncePerBattle: true,
      effect: { kind: "honoredOne" },
    },
  ],
  laricell: [
    {
      characterId: "laricell",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  camyKaze: [
    {
      characterId: "camyKaze",
      id: "notImplemented",
      name: "Passiva (a definir)",
      description: "Passiva do personagem ainda não definida.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: NOT_IMPLEMENTED,
    },
  ],
  ematron: [
    {
      characterId: "ematron",
      id: "combo",
      name: "Combo",
      description:
        "Ataques básicos consecutivos executam o combo: soco, gancho, chute baixo e finalizador aéreo. A cada golpe o Ematron avança em direção ao inimigo e o empurra para trás. Pressionar atacar de novo dentro de 300ms encadeia o próximo golpe com dano crescente (1x até 1.5x). Parar por mais de 300ms volta ao primeiro golpe.",
      unlockedAtLevel: 1,
      oncePerBattle: false,
      effect: { kind: "combo", windowMs: EMATRON_COMBO_WINDOW_MS },
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
