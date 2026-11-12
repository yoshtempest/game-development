/**
 * Stamina do Samuel (`samurion`).
 *
 * O Samuel não usa mana: o pool de energia da batalha (`BattleManaContext`) é
 * reaproveitado como stamina, com nome próprio (`getEnergyName`) e regras
 * próprias — tudo que ele faz gasta stamina (ataque, movimento, troca de arma
 * pelo grimório) e ela volta sozinha, rápido, enquanto ele está parado. Reusar
 * o mesmo pool mantém barra, poções e o save de `battleMana` funcionando sem
 * um segundo recurso paralelo.
 *
 * Todos os números abaixo são valor inicial de balanceamento — decisão para
 * revisar em playtest.
 */

/** Intervalo do tick de stamina (regeneração e dreno de movimento), em ms. */
export const SAMUEL_STAMINA_TICK_MS = 100;

/** Stamina recuperada por tick parado: 1 a cada 100ms, como pede a issue #329. */
export const SAMUEL_STAMINA_REGEN_PER_TICK = 1;

/**
 * Pixels andados por ponto de stamina gasto. Andar a 30ms/step rende ~10px por
 * step, então ~1 ponto a cada 2 steps: andar sem parar esvazia a barra em
 * poucos segundos, mas uma reposição curta já devolve o fôlego.
 */
export const SAMUEL_STAMINA_PX_PER_POINT = 20;

/** Custo de cada golpe básico (inclui golpe aéreo). */
export const SAMUEL_STAMINA_ATTACK_COST = 5;

/** Custo de cada pulo/dash — movimento explosivo custa mais que andar. */
export const SAMUEL_STAMINA_BURST_MOVE_COST = 3;

/** Custo de abrir o grimório de 5 folhas e trocar de arma. */
export const SAMUEL_GRIMOIRE_STAMINA_COST = 20;
