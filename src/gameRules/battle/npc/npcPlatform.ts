import type { BattleObstacle } from "@/utils/types/maps/battle";
import { getGroundAtX, getLandingY } from "@/gameRules/battle/obstacles";
import { NPC_GRAVITY, NPC_JUMP_FORCE } from "@/gameRules/movement/constants";

/**
 * `getGroundAtX`/`getLandingY` foram escritos para o player, cujo `x` é a
 * borda esquerda do sprite (os pés ocupam `x+10..x+30`). O `x` do NPC é o
 * centro (ver `collides` em `npcPosition`), então desloca-se 20px para os pés
 * dos dois caírem na mesma faixa — sem duplicar a regra de pouso.
 */
const NPC_FEET_OFFSET = 20;

/**
 * Diferença mínima de altura para o NPC considerar que o alvo está "em cima"
 * (ou "embaixo"). Abaixo disso é ruído do pouso e o NPC ficaria pulando sem
 * parar.
 */
export const NPC_PLATFORM_HEIGHT_MARGIN = 20;

/**
 * Distância horizontal até o alvo em que o NPC decide subir/descer de
 * plataforma. Larga o suficiente para pular da borda, curta o bastante para
 * ele não pular no meio da arena quando o player ainda está longe.
 */
export const NPC_PLATFORM_REACH = 90;

export type NpcVerticalInput = {
  x: number;
  y: number;
  velY: number;
  /** O movimento horizontal deste tick foi barrado por um sólido (pedra). */
  blocked: boolean;
  targetX: number;
  targetY: number;
  /** Falso quando o NPC está enraizado: só cai, não decide pular. */
  canJump: boolean;
  obstacles: BattleObstacle[];
};

export type NpcVerticalResult = {
  y: number;
  velY: number;
};

/**
 * Indica se os pés do NPC estão apoiados no topo de uma plataforma vazada
 * (`platform`), a única que dá para atravessar descendo — pedra (`wall`) é
 * sólida e o NPC só sai dela andando pela borda.
 */
function isOnPassThrough(
  feetX: number,
  y: number,
  obstacles: BattleObstacle[],
): boolean {
  return obstacles.some(
    (ob) =>
      ob.type === "platform" &&
      ob.y === y &&
      feetX + 30 > ob.x &&
      feetX + 10 < ob.x + ob.width,
  );
}

/**
 * Um tick da física vertical do NPC em mapa com obstáculos — a "IA de
 * plataforma" das issues #311/#63. Regra pura (sem React) para a conta ser a
 * mesma em todo NPC terrestre e não depender de cada `attacks/<npc>.ts`:
 *
 * - **No chão**: pula quando uma pedra barrou o passo (passa por cima) ou
 *   quando o alvo está acima e perto (sobe onde o player se refugiou — o
 *   melee mede distância euclidiana, então sem isso o NPC nunca alcançaria
 *   quem estivesse em cima de algo).
 * - **Em plataforma vazada** com o alvo abaixo e perto: desce atravessando o
 *   piso. `getLandingY` só pousa quem cruza o topo vindo de cima, então basta
 *   começar a queda 1px abaixo do topo.
 * - **No ar**: gravidade e pouso pelo mesmo `getLandingY` do player, que
 *   devolve o chão da arena quando não há obstáculo embaixo — sair andando da
 *   borda de uma plataforma vira queda naturalmente.
 *
 * Args:
 *   input: posição, velocidade vertical, alvo e obstáculos do tick.
 *
 * @returns A nova altura dos pés e a velocidade vertical a guardar para o
 *   próximo tick.
 */
export function stepNpcVertical(input: NpcVerticalInput): NpcVerticalResult {
  const { x, y, velY, blocked, targetX, targetY, canJump, obstacles } = input;
  const feetX = x - NPC_FEET_OFFSET;
  const ground = getGroundAtX(y, feetX, obstacles);

  if (velY === 0 && y >= ground) {
    if (!canJump) return { y: ground, velY: 0 };

    const near = Math.abs(targetX - x) <= NPC_PLATFORM_REACH;
    const targetAbove = targetY < y - NPC_PLATFORM_HEIGHT_MARGIN;
    if (blocked || (near && targetAbove)) {
      return { y: y + NPC_JUMP_FORCE, velY: NPC_JUMP_FORCE };
    }

    const targetBelow = targetY > y + NPC_PLATFORM_HEIGHT_MARGIN;
    if (near && targetBelow && isOnPassThrough(feetX, y, obstacles)) {
      return { y: y + 1, velY: NPC_GRAVITY };
    }
    return { y: ground, velY: 0 };
  }

  const nextVelY = velY + NPC_GRAVITY;
  const nextY = y + nextVelY;
  const landingY = getLandingY(y, nextY, feetX, obstacles);
  if (nextY >= landingY) return { y: landingY, velY: 0 };
  return { y: nextY, velY: nextVelY };
}
