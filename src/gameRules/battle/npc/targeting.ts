/**
 * Alvo único da IA do NPC. No co-op existem dois jogadores na arena, mas cada
 * golpe do NPC escolhe **um** alvo (a exceção são os golpes de área, tratados
 * fora daqui).
 */
export type NpcTarget = {
  id: string;
  x: number;
  y: number;
  state: PlayerState;
  direction: Direction;
  character: string;
  /** Jogador dono deste cliente (o único que a IA pode acertar sem socket). */
  isLocal: boolean;
  /** Morto/espectador não recebe aggro. */
  alive: boolean;
};

/**
 * Distância usada para aggro. O NPC se move em x (arena side-view), então a
 * distância horizontal é a que manda; y entra só como desempate para não
 * trocar de alvo quando alguém pula.
 */
function aggroDistance(npcX: number, target: NpcTarget): number {
  return Math.abs(npcX - target.x) + Math.abs(target.y) * 0.05;
}

/**
 * Escolhe o jogador mais próximo com histerese. Sem a margem, dois jogadores
 * lado a lado fariam o NPC trocar de alvo a cada tick (e o sprite vibrar).
 * `currentId` permanece enquanto o mais próximo não for pelo menos
 * `switchMarginPx` melhor.
 */
export function pickNpcTarget(
  npcX: number,
  targets: readonly NpcTarget[],
  currentId: string | null,
  switchMarginPx = 80,
): NpcTarget | null {
  const alive = targets.filter((target) => target.alive);
  if (alive.length === 0) return null;

  let nearest = alive[0];
  if (!nearest) return null;
  let nearestDistance = aggroDistance(npcX, nearest);

  for (let i = 1; i < alive.length; i += 1) {
    const candidate = alive[i];
    if (!candidate) continue;
    const distance = aggroDistance(npcX, candidate);
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  const current = currentId
    ? alive.find((target) => target.id === currentId)
    : undefined;
  if (!current) return nearest;
  if (current.id === nearest.id) return current;

  const currentDistance = aggroDistance(npcX, current);
  return nearestDistance + switchMarginPx < currentDistance ? nearest : current;
}
