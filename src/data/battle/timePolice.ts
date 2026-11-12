/**
 * Easter egg da Polícia do Tempo (issue #294): no Retrocesso Temporal do
 * Artur (`srGuaxinim`), a patrulha temporal pode aparecer durante o fundo
 * galáctico só para observar quem está mexendo na linha do tempo.
 */

/** Chance por retrocesso — 1%, como pede a issue. */
export const TIME_POLICE_SPAWN_CHANCE = 0.01;

/** São sempre três policiais. */
export const TIME_POLICE_COUNT = 3;

/**
 * Nível exibido acima de cada policial. É só rótulo: eles não entram no
 * combate (não são `NpcType`, não têm ataque nem HP), então não existe
 * conta de dano que o nível alimente.
 */
export const TIME_POLICE_LEVEL = 99;

/** Nome exibido na placa dos policiais. */
export const TIME_POLICE_NAME = "Polícia do Tempo";

/** Sprite esperado de cada policial, relativo a `public/assets/npcs/`. */
export const TIME_POLICE_SPRITE = "timePolice/idle.svg";

/**
 * Fundo galáctico do retrocesso, relativo a
 * `public/assets/player/srGuaxinim/inFight/habilities/`.
 */
export const REWIND_GALAXY_BACKGROUND = "rewindTime/background.svg";
