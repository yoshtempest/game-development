import { npcPath, playerPath } from "@/utils/paths";

import { createQuests } from "@/utils/quest/createQuest";

function battleQuest(
  name: string,
  image: string,
  description: string,
  rewards: number,
) {
  return {
    name,
    image,
    description,
    type: "history" as const,
    rewardsType: "coin" as const,
    rewards,
    counter: 1,
    progress: 0,
    completed: false,
  };
}

export const BATTLE_QUESTS = createQuests({
  x1_jhowsimar: battleQuest(
    "Vem pro fight",
    npcPath("/jhowsimar/right.svg"),
    "Tire o X1 com Jhow Simar para ganhar seu bolsa delicia",
    250,
  ),
  x1_crocodile: battleQuest(
    "Você não é peixe para mim",
    npcPath("/crocodile/default.svg"),
    "Tu não é peixe",
    250,
  ),
  x1_elit_crocodile: battleQuest(
    "Você não é peixe para mim",
    npcPath("/elitCrocodile/default.svg"),
    "Tu não é peixe",
    500,
  ),
  x1_muy_macho: battleQuest(
    "Eu era valente, macho",
    npcPath("/muyMacho/default.svg"),
    "E muito macho",
    500,
  ),
  x1_fischer: battleQuest(
    "Esses peixes são meus",
    npcPath("/fischer/default.svg"),
    "Essa zona aqui é minha, suma",
    250,
  ),
  x1_hungry: battleQuest(
    "Larga meu almoço!",
    npcPath("/hungryDeath/right.svg"),
    "Não deixe o morto de fome comer o mouse",
    100,
  ),
  x1_hungry_dog: battleQuest(
    "Hmmm, canela deliciosa",
    npcPath("/hungryDog/walk.svg"),
    "Que canela saborosa",
    100,
  ),
  x1_hungry_fish: battleQuest(
    "Poluição tá no ponto",
    npcPath("/hungryFish/walk.svg"),
    "Rapaz, essa poluição tá me matando",
    100,
  ),
  x1_hungry_pig: battleQuest(
    "Era para me engordarem antes de matar...",
    npcPath("/hungryPig/walk.svg"),
    "Hoje eu tô só o osso",
    100,
  ),
  x1_deise: battleQuest(
    "Tá achando que é quem? o Protagonista?",
    npcPath("/deise/right.svg"),
    "Quebre a expansão de domínio incompleta de Deise",
    1000,
  ),
  x1_lupita: battleQuest(
    "Hoof, Ruf",
    npcPath("/lupita/default.svg"),
    "Você não faz parte da minha alcateia!",
    1000,
  ),
  x1_vandinha: battleQuest(
    "Você bateu nos meus meninos!",
    npcPath("/vandinhaFragment/right.svg"),
    "Sobreviva a luta com um fragmento contendo 1% do poder de Vandinha",
    500,
  ),
  x1_natsuki_dog: battleQuest(
    "Duque",
    npcPath("/duque/default.svg"),
    "Estive observando a luta esse tempo todo, esperando minha vez",
    1000,
  ),
  x1_tim: battleQuest(
    "Carne nova no pedaço",
    npcPath("/tim/right.svg"),
    "Todo dia entra humano e sai picanha",
    1000,
  ),
  x1_baiano: battleQuest(
    "Sinta o meu suor másculo",
    npcPath("/baiano/right.svg"),
    "Absorva os esteróides",
    500,
  ),
  x1_spirit_motocycler: battleQuest(
    "JUAN DERSON, O CAMINHÃO",
    npcPath("/spiritMotocycler/walk.svg"),
    "Uma vez eu dormi enquanto dirigia e...",
    1000,
  ),
  x1_slimita: battleQuest(
    "O Jailson é só meu!",
    npcPath("/slimita/right.svg"),
    "O jailson é só meu, se quer ele terá que passar por mim primeiro!",
    1000,
  ),
  x1_hungry_king: battleQuest(
    "Não tire nosso lorde de nós",
    npcPath("/hungryKing/default.svg"),
    "Nosso lorde Samurion nos adora, você não pode levar ele embora!",
    1000,
  ),
  x1_maugrelo: battleQuest(
    "O Peru é meu",
    npcPath("/maugrelo/right.svg"),
    "Você não vai tirar o Peru de mim, vamos lutar pelo Peru!",
    1000,
  ),
  x1_neimito: battleQuest(
    "Você não vai tirar ele do meu Genjutsu, certo?",
    npcPath("/neimito/right.svg"),
    "Ematron, não acredite nele! Eu sou de fato o menino Ney",
    1000,
  ),
  x1_planetary_sisters: battleQuest(
    "Num da para passar!",
    npcPath("/system/default.svg"),
    "Tire esses planetas da frente",
    1000,
  ),
  x1_maura: battleQuest(
    "Quem é essa doida?",
    npcPath("/system/default.svg"),
    "Ela é muito perigosa, dá para sentir a insanidade daqui",
    1000,
  ),
  x1_srGuaxinim: battleQuest(
    "Que a ira de Baal caia sobre você!",
    playerPath("/srGuaxinim/default.svg"),
    "Baal está furioso!",
    500,
  ),
  x1_manim: battleQuest(
    "Isso é problema minha gente",
    npcPath("/manim/right.svg"),
    "Você não vai fugir, tá bom?",
    1000,
  ),
  x1_denis: battleQuest(
    "Tu é um mané mesmo",
    npcPath("/manim/right.svg"),
    "Malandro é malandro, Denis é mané",
    1000,
  ),
  x1_leviathan: battleQuest(
    "Estou de boa na lagoa",
    npcPath("/leviathan/walk.svg"),
    "Saí daqui mano",
    1000,
  ),
  x1_true_vandinha: battleQuest(
    "Fugir? Nos seus sonhos!",
    npcPath("/trueVandinha/right.svg"),
    "Sinta o poder de minha forma final!",
    10000,
  ),
  x1_mobydick: battleQuest(
    "Derrote a Moby Dick ancestral",
    npcPath("/mobyDick/walk.svg"),
    "Humano, desapareça de minha frente",
    10000,
  ),
  x1_technoblade: battleQuest(
    "Technoblade nunca perde",
    npcPath("/technoblade/right.svg"),
    "Senti saudades desse sentimento de lutar",
    10000,
  ),
  x1_madame: battleQuest(
    "Certamente estou invisível",
    npcPath("/madame/default.svg"),
    "Sinto... uma vontade de comer desgraçada",
    10000,
  ),
  x1_baal: battleQuest(
    "Estou furioso",
    npcPath("/baal/default.svg"),
    "VOU ACABAR COM A TUA RAÇA, HUMANO MISERÁVEL!",
    10000,
  ),
});
