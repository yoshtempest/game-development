import { defineDialogue } from "../defineDialogue";

export type SceneMemoryWalkTarget = {
  x: number;
  y: number;
  direction: Direction;
};

export const SCENE_MEMORY_WALKS: Record<string, SceneMemoryWalkTarget> = {
  "/jomasioentrance/one": { x: 7, y: 8, direction: "up" },
};

export const SCENE_MEMORIES: Record<string, Dialogue[]> = {
  "/jomasioentrance/one": defineDialogue([
    ["protagonista", "Já deu a hora de voltar naquele maldito lugar pra purificar a fome."],
    ["protagonista", "O Seth Jorjão... quem diria que eu ia pisar nesse presídio-escola de novo."],
    ["protagonista", "Mas se é aqui que essa fome se cura, então bora."],
  ]),

  "/hall/one": defineDialogue([
    ["protagonista", "O corredor do Jorjão... foi por aqui que eu vivi 2 anos de minha vida.. milhares de vezes que fui e voltei nesse corredor.. sem nada pra fazer..."],
  ]),

  "/hall/center-one": defineDialogue([
    ["protagonista", "O meio do corredor... era o ponto de encontro antes de todo mundo se mandar pra sala."],
  ]),

  "/hall/center-front": defineDialogue([
    ["protagonista", "A passagem para o conselho.. Lembro de sempre cortar caminho por aqui quando a fila da merenda estava enorme"],
  ]),

  "/hall/thirdclass": defineDialogue([
    ["protagonista", "A sala do terceiro ano... nunca gostei desse lugar."],
  ]),

  "/brodiclass/one": defineDialogue([
    ["protagonista", "A sala do Brodi... As risadas do fundão nunca saíram da minha cabeça... Tu gosta? Quantos por cento?"],
  ]),

  "/library/one": defineDialogue([
    ["protagonista", "A biblioteca... a gente falava que ia ler, mas era só pra mexer no celular ou dormir no silêncio."],
  ]),

  "/library/two": defineDialogue([
    ["protagonista", "Essa parte escondida da biblioteca... se eu não me engano, alguém já tentou se esconder da diretora por aqui.. HAHAHA, foi hilário"],
  ]),

  "/pcroom/one": defineDialogue([
    ["protagonista", "A sala dos computadores... estudar era a última opção quando o pessoal colocava as músicas."],
  ]),

  "/director/two": defineDialogue([
    ["protagonista", "A diretoria... só de sentir o ar daqui, meu corpo já lembra do cansaço."],
  ]),

  "/footballcourt/one": defineDialogue([
    ["protagonista", "O campinho... aqui valia muito mais do que qualquer aula."],
  ]),

  "/cantina/one": defineDialogue([
    ["protagonista", "O pátio... nunca entendi por que fazer 6 filas sendo que o pessoal da porta sempre entrava na cantina e pegava primeiro..."],
    ["protagonista", "Entrada somente para funcionários, HA, que piada sem graça. Ninguém respeitava as regras.."],
  ]),

  "/cafeteria/one": defineDialogue([
    ["protagonista", "A cantina... o cheiro de bode me faz lembrar das discussões por causa da comida."],
  ]),
};