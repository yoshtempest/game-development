import type { BattleBarrier, NpcBlind } from "@/utils/types/battle/npcControl";

/** Barreira ainda de pé em `now`. `null` é o caso comum (nenhuma parede). */
export function isBarrierActive(
  barrier: BattleBarrier | null,
  now: number,
): barrier is BattleBarrier {
  return barrier !== null && barrier.until > now;
}

/**
 * Posição final do NPC respeitando a barreira: quem está de um lado não passa
 * para o outro no mesmo tick. A borda usada é a do lado em que o NPC já
 * estava, então o NPC encosta na parede em vez de "teleportar" para a outra
 * face. Sem barreira ativa devolve `toX` intacto.
 */
export function clampToBarrier(
  fromX: number,
  toX: number,
  barrier: BattleBarrier | null,
  now: number,
): number {
  if (!isBarrierActive(barrier, now)) return toX;
  const left = barrier.x - barrier.halfWidth;
  const right = barrier.x + barrier.halfWidth;
  if (fromX <= barrier.x) return Math.min(toX, left);
  return Math.max(toX, right);
}

/**
 * O projétil está dentro da faixa da barreira — é lá que ele se parte. Usa a
 * faixa inteira (e não só a linha central) porque um projétil rápido anda
 * mais que 1px por tick e atravessaria uma linha sem nunca "tocar" nela.
 */
export function isInsideBarrier(
  x: number,
  barrier: BattleBarrier | null,
  now: number,
): boolean {
  if (!isBarrierActive(barrier, now)) return false;
  return Math.abs(x - barrier.x) <= barrier.halfWidth;
}

/**
 * Sorteia se o golpe do NPC cego erra. `random` é injetado para que a regra
 * continue pura (e testável) — a IA passa `Math.random`.
 */
export function rollBlindMiss(
  blind: NpcBlind | null,
  now: number,
  random: () => number,
): boolean {
  if (!blind || blind.until <= now) return false;
  return random() < blind.missChance;
}
