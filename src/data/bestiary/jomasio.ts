import { createBestiary } from "@/utils/bestiary/createBestiary";
import { getNpcAlfaData } from "./npcAlfas";
import type { NpcLocation } from "@/utils/types/player/bestiary";

function createNpcData(
  npcType: string,
  data: {
    name: string;
    description: string;
    location: NpcLocation;
    attacks: string[];
  },
) {
  const alfa = getNpcAlfaData(npcType);

  return {
    ...data,
    ...(alfa && {
      isAlfa: true,
      baseNpcType: alfa.baseNpcType,
    }),
  };
}

export const jomasioData = createBestiary({
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
  edson: createNpcData("edson", {
    name: "Edson",
    description:
      "Versão evoluída de um Morto de Fome, passou tanta fome e regrediu tanto seu próprio QI, que subiu de nível.",
    location: "Jomasio",
    attacks: ["Agarrão Faminto", "Mordida Cheia de Fome"],
  }),
  hungryDog: {
    name: "Cachorro Faminto",
    description:
      "Cães abandonados que se uniram em matilhas famintas. Atacam qualquer um que entre em seu território.",
    location: "Jomasio",
    attacks: ["Mordida Canina", "Ataque em Matilha"],
  },
  blackMouth: createNpcData("blackMouth", {
    name: "Boca Preta",
    description:
      "Um pequeno cão que antes gerava alegria ao povo, agora se transformou em um monstro terrível, que pena...",
    location: "Jomasio",
    attacks: ["Mordida Canina", "Ataque em Matilha"],
  }),
  vandinhaFragment: {
    name: "Fragmento de Vandinha",
    description:
      "Uma versão fragmentada de Vandinha, espalhada por Jomasio. Cada fragmento guarda um pedaço de seu poder.",
    location: "Jomasio",
    attacks: ["Soco", "Olha o prato"],
  },
  wandinha: createNpcData("wandinha", {
    name: "Vandinha Dark Era",
    description:
      "Uma versão do que já foi Vandinha em seus tempos góticos",
    location: "Jomasio",
    attacks: ["Tiro de Guarda Chuva", "Escuridão", "Voar"],
  }),
  goat: {
    name: "Bode",
    description:
      "Um bode demoníaco que aparece nos arredores do Jomásio. Seus olhos brilham vermelho sob a lua cheia.",
    location: "Jomasio",
    attacks: ["Chifrada Infernal", "Cabeçada"],
  },
  kingGoat: createNpcData("kingGoat", {
    name: "Rei Bodão",
    description:
      "O GOAT, ele reuniu tanto rancor por ser morto e ninguem sequer querer devorá-lo, que ele reencarnou como o rei",
    location: "Jomasio",
    attacks: ["Chifrada Infernal", "Cabeçada", "Berro"],
  }),
  piupiu: {
    name: "Piupiu",
    description:
      "Um pombo enorme e agressivo que domina os telhados do Jomásio. Não se deixe enganar pelo tamanho — ele é mais perigoso do que parece.",
    location: "Jomasio",
    attacks: ["Bicada Certeira", "Revoada de Penas"],
  },
  kingPiu: createNpcData("kingPiu", {
    name: "Rei Piu",
    description:
      "O Galo, aquele que governa todos os pintos, tomou forma humana para poder manipular outros humanos.",
    location: "Jomasio",
    attacks: ["Bicada Certeira", "Revoada de Penas"],
  }),
  rice: {
    name: "Arroz",
    description:
      "Um saco de arroz ambulante que ganhou vida após um experimento culinário dar errado. Gruda mais do que parece.",
    location: "Jomasio",
    attacks: ["Grudada", "Chuva de Grãos"],
  },
  friedRice: createNpcData("friedRice", {
    name: "Arroz Frito",
    description:
      "Após vários experimentos químicos na cozinha, ele foi um dos poucos sucessos, criando consciência própria e um poder avassalador.",
    location: "Jomasio",
    attacks: ["Grudada", "Chuva de Grãos"],
  }),
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
})