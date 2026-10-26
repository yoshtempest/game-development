import { createBestiary } from "@/utils/bestiary/createBestiary";

export const tanqueDosCravosData = createBestiary({
  /* ── Tanque dos Crávos ── */
  figurantOfDragonKingCult: {
    name: "Figurante do Culto do Rei Dragão",
    description:
      "Devotos do Rei Dragão. Usam escamas de dragão como armadura e cospem fogo fraco.",
    location: "Tanque dos Crávos",
    attacks: ["Sopro Rasteiro", "Lança de Escama"],
  },
  necromancer: {
    name: "Necromante",
    description:
      "Um feiticeiro sombrio que comanda mortos-vivos. Ele espreita nas catacumbas sob Jomasio.",
    location: "Tanque dos Crávos",
    attacks: ["Invocar Mortos", "Bola de Fogo Negra", "Maldição Arcana"],
  },
  ains: {
    name: "Ains",
    description:
      "Um ser de poder incomparável. Dizem que veio de outro mundo — um verdadeiro OVERLORD.",
    location: "Tanque dos Crávos",
    attacks: ["Magia Negra", "Toque da Morte", "Dominação"],
  },
  dragonKing: {
    name: "Rei Dragão",
    description:
      "O lendário Rei Dragão que governa o Tanque dos Crávos. A criatura mais poderosa já vista.",
    location: "Tanque dos Crávos",
    attacks: ["Hálito de Fogo", "Asa Cortante", "Fúria do Dragão Rei"],
  },

  /* ── Lagoa do Canto ── */
  hungryPig: {
    name: "Porco Faminto",
    description:
      "Porcos selvagens que reviram a terra em busca de comida. Agressivos quando provocados.",
    location: "Lagoa do Canto",
    attacks: ["Chifrada", "Pisoteio"],
  },
  technoblade: {
    name: "Technoblade",
    description:
      "Uma lenda viva. O guerreiro mais temido de todos os tempos. Ele nunca morre.",
    location: "Lagoa do Canto",
    attacks: ["Lâmina da Lenda", "Grito de Guerra", "Golpe do Herói"],
  },
});
