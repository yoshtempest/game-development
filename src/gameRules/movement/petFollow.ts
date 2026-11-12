/**
 * Ponto do rastro do pet: tile + direção + altura. A altura viaja junto para o
 * pet subir/descer degrau no mesmo passo em que o jogador subiu/desceu.
 */
export type TrailPoint = {
  gridX: number;
  gridY: number;
  direction: Direction;
  height: number;
};

/**
 * `leader` = onde o jogador está (e para onde olha agora); `follower` = onde o
 * pet está. Quando os dois coincidem o pet fica escondido "dentro" do jogador
 * até o próximo passo — é o estado depois de spawn, teleporte e desmontar.
 */
export type PetTrail = {
  leader: TrailPoint;
  follower: TrailPoint;
};

export function createPetTrail(point: TrailPoint): PetTrail {
  return { leader: point, follower: point };
}

function samePoint(a: TrailPoint, b: TrailPoint): boolean {
  return (
    a.gridX === b.gridX &&
    a.gridY === b.gridY &&
    a.direction === b.direction &&
    a.height === b.height
  );
}

/**
 * Avança o rastro do pet seguidor (#513): a cada passo de 1 tile do jogador o
 * pet assume a posição e a direção **anteriores** do jogador. Girar no lugar
 * só atualiza a direção do líder (o pet herda a direção em que o jogador
 * estava olhando quando saiu do tile). Qualquer salto maior que 1 tile
 * (spawn, teleporte, passo duplo da montaria) não tem tile anterior
 * adjacente, então o pet reaparece no tile do jogador em vez de "voar" pela
 * tela atravessando parede.
 *
 * Devolve a mesma referência quando nada mudou, para o chamador poder usar
 * a comparação de identidade como bailout de render.
 */
export function advancePetTrail(trail: PetTrail, next: TrailPoint): PetTrail {
  if (samePoint(trail.leader, next)) return trail;

  const { leader } = trail;
  const distance =
    Math.abs(next.gridX - leader.gridX) + Math.abs(next.gridY - leader.gridY);

  if (distance === 0) return { leader: next, follower: trail.follower };
  if (distance === 1) return { leader: next, follower: leader };
  return createPetTrail(next);
}

export function isPetHidden(trail: PetTrail): boolean {
  return (
    trail.leader.gridX === trail.follower.gridX &&
    trail.leader.gridY === trail.follower.gridY
  );
}
