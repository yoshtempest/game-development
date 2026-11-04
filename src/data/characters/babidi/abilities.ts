import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  createActiveAbility,
  dimensionalPortalAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";
import { BabidiFishingNetConstants } from "@/data/characters/babidi";

export const BABIDI_ACTIVE_ABILITIES: ActiveAbility[] = [
  dimensionalPortalAbility(),
  createActiveAbility({
    id: "fishingNet",
    name: "Rede de Pesca",
    description: `Lança uma rede de pesca gigante acima do inimigo principal: ele fica imobilizado por ${BabidiFishingNetConstants.ROOT_MS / 1000}s. A rede é inquebrável, não tem barra de vida e custa ${BabidiFishingNetConstants.COST_RATIO * 100}% da energia máxima. Cooldown de ${BabidiFishingNetConstants.COOLDOWN_MS / 1000}s.`,
    cooldownMs: BabidiFishingNetConstants.COOLDOWN_MS,
  }),
  domainBurstAbility("babidi"),
];
