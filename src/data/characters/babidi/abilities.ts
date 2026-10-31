import type { ActiveAbility } from "@/utils/types/player/abilities";
import { createActiveAbility } from "@/data/characters/abilityFactories";
import {
  dimensionalPortalAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";

export const BABIDI_ACTIVE_ABILITIES: ActiveAbility[] = [
  dimensionalPortalAbility(),
  createActiveAbility({
    id: "fishingNet",
    name: "Rede de Pesca",
    description:
      "Lança uma rede de pesca gigante acima do inimigo principal: ele fica imobilizado por 5s. A rede tem HP igual à vida máxima do personagem; os inimigos podem atacá-la e, ao zerar o HP, ela se desfaz, liberando o inimigo. Quanto menor a vida da rede, menor sua opacidade.",
    cooldownMs: 20000,
  }),
  domainBurstAbility("babidi"),
];
