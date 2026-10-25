import { createBestiary } from "@/utils/bestiary/createBestiary";

const _baseBestiaryData = createBestiary({
  /* ── Jomasio ── */
  jhowsimar: {
    name: "Jhowsimar",
    description:
      "Um lutador de rua enigmático que protege os becos do Jomásio. Ninguém sabe sua verdadeira origem.",
    location: "Jomasio",
    attacks: ["Agarro", "E te Jooj"],
  },
  hungryDeath: {
    name: "Morto de Fome",
    description:
      "Um zumbi faminto que vagueia pelas ruas do Jomásio em busca de carne fresca. Dizem que era um estudante que passou tempo demais sem comer.",
    location: "Jomasio",
    attacks: ["Agarrão Faminto", "Mordida Cheia de Fome"],
  },
  vandinhaFragment: {
    name: "Fragmento de Vandinha",
    description:
      "Uma versão fragmentada de Vandinha, espalhada por Jomasio. Cada fragmento guarda um pedaço de seu poder.",
    location: "Jomasio",
    attacks: ["Soco", "Olha o prato"],
  },
  goat: {
    name: "Bode",
    description:
      "Um bode demoníaco que aparece nos arredores do Jomásio. Seus olhos brilham vermelho sob a lua cheia.",
    location: "Jomasio",
    attacks: ["Chifrada Infernal", "Cabeçada"],
  },
  piupiu: {
    name: "Piupiu",
    description:
      "Um pombo enorme e agressivo que domina os telhados do Jomásio. Não se deixe enganar pelo tamanho — ele é mais perigoso do que parece.",
    location: "Jomasio",
    attacks: ["Bicada Certeira", "Revoada de Penas"],
  },
  rice: {
    name: "Arroz",
    description:
      "Um saco de arroz ambulante que ganhou vida após um experimento culinário dar errado. Gruda mais do que parece.",
    location: "Jomasio",
    attacks: ["Grudada", "Chuva de Grãos"],
  },
  deise: {
    name: "Deise",
    description:
      "Uma guerreira implacável devota ao culto do rei dragão. Empunha lâminas gêmeas e jura lealdade ao dragão.",
    location: "Jomasio",
    attacks: ["Lançamento de colher", "Invocação do Mal", "Empurrão Frenético"],
  },
  slimita: {
    name: "Slimita",
    description:
      "Uma criatura pegajosa e elástica que habita os esgotos do Jomásio. Ela pode se esticar e achatar para esmagar suas vítimas.",
    location: "Jomasio",
    attacks: ["Salto Pegajoso", "Cospe arma", "Esmagamento"],
  },
  maugrelo: {
    name: "Maugrelo",
    description:
      "O irmão mais novo de Maurão. Magro mas traiçoeiro, ataca com golpes rápidos e venenosos.",
    location: "Jomasio",
    attacks: [
      "Um tapa na... Careca",
      "Nunca vi uma pessoa BURRA assim",
      "Papéis explosivos",
      "Laser",
    ],
  },
  hungryKing: {
    name: "Rei Faminto",
    description:
      "O governante dos mortos de fome, um ser colossal que consome tudo em seu caminho. Líder do culto ao rei dragão.",
    location: "Jomasio",
    attacks: ["Hulk Smash", "Explosão energética", "Invocação do Mal"],
  },
  srGuaxinim: {
    name: "Sr. Guaxinim",
    description:
      "Um guaxinim inteligente que comanda uma gangue de animais nas ruas do Jomásio. Não subestime sua astúcia.",
    location: "Jomasio",
    attacks: ["Garras Afiadas", "Investida Sorrateira"],
  },
  neimito: {
    name: "Neimito",
    description:
      "Um jovem prodígio das artes marciais que busca provar seu valor. Seus movimentos são rápidos e imprevisíveis.",
    location: "Jomasio",
    attacks: ["Chute Voador", "Sequência Rápida"],
  },
  maurao: {
    name: "Maurão",
    description:
      "Um brutamonte que aterroriza os arredores do Jomásio. Corpo enorme e pouca paciência.",
    location: "Jomasio",
    attacks: [
      "Olha a faca",
      "Pensa rápido",
      "Roda Roda Vira, Solta a Roda e Vem",
    ],
  },
  denis: {
    name: "Denis",
    description:
      "Um ex-guarda-costas que enlouqueceu após um incidente trágico. Sua força bestial é lendária.",
    location: "Jomasio",
    attacks: ["Soco Brutal", "Agarrão"],
  },
  planetarySisters: {
    name: "Irmãs Planetárias",
    description:
      "Três irmãs que controlam forças celestiais. Juntas, são um dos maiores desafios do Jomásio.",
    location: "Jomasio",
    attacks: ["Fúria Solar", "Maré Lunar", "Tempestade Estelar"],
  },
  manim: {
    name: "Manim",
    description:
      "Um ser misterioso que fala por enigmas. Sua forma física é tão enganosa quanto suas palavras.",
    location: "Jomasio",
    attacks: ["Ilusão", "Toque Dimensional"],
  },
  trueVandinha: {
    name: "Verdadeira Vandinha",
    description:
      "A forma completa de Vandinha. Dizem que ela é a guardiã de um segredo ancestral escondido em Jomasio.",
    location: "Jomasio",
    attacks: ["Dança das Sombras", "Grito Penetrante", "Noite Eterna"],
  },

  /* ── Bocaina ── */
  hungryDog: {
    name: "Cachorro Faminto",
    description:
      "Cães abandonados que se uniram em matilhas famintas. Atacam qualquer um que entre em seu território.",
    location: "Bocaina",
    attacks: ["Mordida Canina", "Ataque em Matilha"],
  },
  lupita: {
    name: "Lupita",
    description:
      "A líder da matilha de Bocaina. Uma loba gigante com cicatrizes de inúmeras batalhas.",
    location: "Bocaina",
    attacks: ["Uivo Aterrorizante", "Mordida Sanguinária", "Garra Cortante"],
  },
  duque: {
    name: "Cachorro de Natsuki",
    description:
      "O cão de guarda de Natsuki, um dos moradores mais excêntricos de Bocaina. Fiel e mortal.",
    location: "Bocaina",
    attacks: ["Latido Intimidador", "Investida Protetora"],
  },
  baiano: {
    name: "Baiano",
    description:
      "Um capoeirista habilidoso que defende Bocaina com seus movimentos acrobáticos.",
    location: "Bocaina",
    attacks: ["Rasteira", "Chute de Capoeira", "Ginga"],
  },
  spiritMotocycler: {
    name: "Motoqueiro Fantasma",
    description:
      "A lenda de Bocaina — um motoqueiro que morreu em um acidente e agora assombra as estradas.",
    location: "Bocaina",
    attacks: ["Atropelamento Fantasma", "Escapamento Flamejante"],
  },
  tim: {
    name: "Tim",
    description:
      "Um assassino ágil que pula e faz acrobacias com duas facas de sashimi. Cultista de Baal.",
    location: "Bocaina",
    attacks: ["Facada Acrobática", "Salto Mortal", "Chuva de Lâminas"],
  },
  muyMacho: {
    name: "Muy Macho",
    description:
      "Um lutador de luta livre mexicano que perdeu o rumo. Agora vagueia por Bocaina em busca de oponentes.",
    location: "Bocaina",
    attacks: ["Máscara Voadora", "Queda Livre", "Abraço de Urso"],
  },

  /* ── Lagoa Grande ── */
  hungryFish: {
    name: "Peixe Faminto",
    description:
      "Peixes mutantes que cresceram demais após se alimentarem de rejeitos químicos na Lagoa Grande.",
    location: "Lagoa Grande",
    attacks: ["Mordida Aquática", "Caudada"],
  },
  hungryCow: {
    name: "Vaca Faminta",
    description:
      "Gado enlouquecido que pasta nas margens da Lagoa Grande. Seus olhos vermelhos não enganam.",
    location: "Lagoa Grande",
    attacks: ["Coice", "Investida"],
  },
  fischer: {
    name: "Fischer",
    description:
      "Um pescador solitário que passou tempo demais no sol. Sua sanidade já foi embora há muito tempo.",
    location: "Lagoa Grande",
    attacks: ["Rede Enroscante", "Anzol Envenenado"],
  },
  leviathan: {
    name: "Leviathan",
    description:
      "A criatura lendária que habita as profundezas do Rio Ness em Lagoa Grande. Poucos viram e sobreviveram.",
    location: "Lagoa Grande",
    attacks: ["Cauda Torrencial", "Mergulho Abissal", "Jato d'Água"],
  },

  /* ── Cachoeiras ── */
  figurantOfBaalCult: {
    name: "Figurante do Culto de Baal",
    description:
      "Membros rasos do culto a Baal. Vestem mantos negros e repetem mantras sem entender o significado.",
    location: "Cachoeiras",
    attacks: ["Golpe de Adaga", "Maldição Menor"],
  },
  baal: {
    name: "Baal",
    description:
      "O líder do culto das Cachoeiras. Dizem que ele fez um pacto com um demônio ancestral.",
    location: "Cachoeiras",
    attacks: ["Chama Negra", "Invocar Seguidores", "Olhar do Abismo"],
  },
  madame: {
    name: "Madame",
    description:
      "Uma aranha gigante do tamanho de um cão de caça. Ela tece teias nas árvores das Cachoeiras.",
    location: "Cachoeiras",
    attacks: ["Teia Pegajosa", "Picada Venenosa", "Patas Cortantes"],
  },

  /* ── Barragem ── */
  figurantOfMobyDickCult: {
    name: "Figurante do Culto de Moby Dick",
    description:
      "Seguidores fanáticos que cultuam a baleia branca. Usam arpões e cantos hipnóticos.",
    location: "Barragem",
    attacks: ["Arpoada", "Canto Hipnótico"],
  },
  crocodile: {
    name: "Crocodilo",
    description:
      "Crocodilos da Barragem — predadores de emboscada que atacam rápido e arrastam para a água.",
    location: "Barragem",
    attacks: ["Boca de Aço", "Caudaço", "Rolagem Mortal"],
  },
  elitCrocodile: {
    name: "Crocodilo de Elite",
    description:
      "Crocodilos maiores e mais espertos que guardam os acessos mais profundos da Barragem.",
    location: "Barragem",
    attacks: ["Boca de Aço", "Caudaço", "Rolagem Mortal", "Escudo de Escamas"],
  },
  mobyDick: {
    name: "Moby Dick",
    description:
      "A lendária baleia branca que aterroriza a Barragem. Dizem que é imortal.",
    location: "Barragem",
    attacks: ["Jato Colossal", "Cauda do Juízo", "Mergulho Profundo"],
  },
  yangKai: {
    name: "Yang Kai",
    description:
      "Um cultivador misterioso que apareceu na Barragem. Seu poder é de outro mundo.",
    location: "Barragem",
    attacks: ["Corte de Qi", "Palma da Montanha", "Explosão Espiritual"],
  },

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

const _baseBestiary = _baseBestiaryData;

// ── Variantes alfa ──────────────────────────────────────────
const _alfaEntries: Record<string, (typeof _baseBestiary)[string]> = {};
for (const [key, value] of Object.entries(_baseBestiary)) {
  _alfaEntries[`${key}_alfa`] = {
    ...value,
    npcType: `${key}_alfa`,
    name: `ALFA ${value.name}`,
    description: `Versão alfa de ${value.name}. Uma variante mais poderosa e rara, encontrada em encontros aleatórios.`,
  };
}

export const BESTIARY_DATA: Record<string, (typeof _baseBestiary)[string]> = {
  ..._baseBestiary,
  ..._alfaEntries,
};
export const BESTIARY_NPC_ORDER: string[] = Object.keys(BESTIARY_DATA);
