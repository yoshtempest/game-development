import { npcPath, playerPath } from "@/utils/paths";

import { createQuests } from "@/utils/quest/createQuest";

function historyQuest(
  name: string,
  image: string,
  description: string,
  rewards: number,
  counter: number = 1,
) {
  return {
    name,
    image,
    description,
    rewardsType: "xp" as const,
    rewards,
    type: "history" as const,
    counter,
    progress: 0,
    completed: false,
  };
}

export const HISTORY_QUESTS = createQuests({
  jomasio_investigate: historyQuest(
    "Investigação do SETH Jorjão",
    npcPath("/duqueC/default.svg"),
    "Investigue a falta de comida no SETH Jorjão",
    1000,
  ),
  director_escape: historyQuest(
    "Fuja da diretoria",
    npcPath("/system/default.svg"),
    "Procure uma forma de sair da diretoria",
    10,
  ),
  explore_jorjao: historyQuest(
    "Foi uma delicia",
    npcPath("/jhowsimar/default.svg"),
    "Vá na sala dos pcs para superar o 'dúvido' de Jhow Simar",
    10,
  ),
  kill_goats: historyQuest(
    "Elimine 10 bodes",
    npcPath("/goat/walk.svg"),
    "Mate os bodes e purifique um pouco o ambiente",
    40,
    10,
  ),
  save_ematron: historyQuest(
    "Salve Ematron",
    npcPath("/brothers/default.svg"),
    "Lute com Neimito para salvar Ematron de seu Genjutsu Infinito",
    50,
    10,
  ),
  like_peru: historyQuest(
    "Você gosta do Peru",
    npcPath("/peruFather/right.svg"),
    "Meu filho é um peruzao, cuide bem dele",
    50,
    10,
  ),
  search_packaging: historyQuest(
    "Entrega suspeita",
    npcPath("/remedinha/default.svg"),
    "Vá na biblioteca e traga a embalagem suspeita para Remedinha.",
    10,
  ),
  letter_delivery: historyQuest(
    "Entrega de aura",
    npcPath("/reincardion/right.svg"),
    "Entregue a carta de muita aura para Remedinha",
    10,
  ),
  go_cafeteria: historyQuest(
    "Ir em busca do linguição",
    npcPath("/remedinha/default.svg"),
    "Vá ao no refeitório e adquira sua recompensa (linguição)",
    10,
  ),
  return_to_remedinha: historyQuest(
    "Conte a fofoca do dia",
    npcPath("/remedinha/default.svg"),
    "Volte e reporte a Remedinha sobre o ocorrido no refeitório",
    10,
  ),
  encounter_secret_passages: historyQuest(
    "Procure as passagens",
    npcPath("/remedinha/default.svg"),
    "Vague pelos locais que podem ter documentos e procure por passagens secretas",
    40,
  ),
  denis_sausage: historyQuest(
    "Me dê o linguição",
    npcPath("/denis/default.svg"),
    "Entregue seu linguição para Denis",
    10,
  ),
  encounter_deise: historyQuest(
    "Nunca me encontre",
    npcPath("/deise/right.svg"),
    "Vá ao Tanque dos Cravos",
    1000,
  ),
  help_jailson: historyQuest(
    "Ajude Jailson, ele está em perigo!",
    npcPath("/remedinha/default.svg"),
    "Tem uma feiosa dando em cima dele, vá lá e ajude ele a se livrar dela",
    40,
  ),
  go_to_hell: historyQuest(
    "Encontre Negão do Ferro Velho",
    npcPath("/remedinha/default.svg"),
    "Vá aos corredores escuros em busca de falar com o Negão",
    40,
  ),
  go_to_brodiclass: historyQuest(
    "Vá a sala dos brodi",
    npcPath("/remedinha/default.svg"),
    "Junte-se ao conselho dos manos como espião e obtenha informações",
    40,
  ),
  save_samurion: historyQuest(
    "Ajude Samurion",
    npcPath("/brothers/default.svg"),
    "Estão enchendo o saco dele, ajuda o homi lá",
    50,
    10,
  ),
  go_to_pandemony: historyQuest(
    "Salve Maura da Loucura",
    playerPath("/laricell/default.svg"),
    "Encontre Maura no Corredor do Pandemônio",
    40,
  ),
  cancel_mobydick_ressurrection: historyQuest(
    "Impeça o culto",
    npcPath("/brothers/default.svg"),
    "Pare a ressurreição da baleia ancestral",
    1000,
  ),
  cancel_dragonking_ressurrection: historyQuest(
    "Impeça o culto",
    npcPath("/brothers/default.svg"),
    "Pare a ressurreição do dragão fundador",
    1000,
  ),
  cancel_baal_invocation: historyQuest(
    "Impeça a invocação de Baal",
    npcPath("/brothers/default.svg"),
    "Salve o mundo",
    1000,
  ),
});
