import { useState } from "react";

import {
  advancePetTrail,
  createPetTrail,
  type PetTrail,
  type TrailPoint,
} from "@/gameRules/movement/petFollow";

/**
 * Rastro do pet seguidor derivado da posição do jogador.
 *
 * O avanço acontece durante o render (padrão "estado derivado da prop
 * anterior" do React), não num effect: com effect o pet ficaria um frame
 * atrás do jogador e a transição CSS dos dois começaria dessincronizada.
 * `advancePetTrail` devolve a mesma referência quando nada mudou, então o
 * `setTrail` só roda quando o jogador de fato andou/girou.
 *
 * A cena de exploração remonta por `key={scene.id}`, então o rastro nasce de
 * novo a cada troca de cena — o pet reaparece junto ao jogador no spawn.
 */
export function usePetFollower(point: TrailPoint): PetTrail {
  const [trail, setTrail] = useState<PetTrail>(() => createPetTrail(point));
  const next = advancePetTrail(trail, point);
  if (next !== trail) setTrail(next);
  return next;
}
