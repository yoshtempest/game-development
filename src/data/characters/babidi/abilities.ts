import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  createActiveAbility,
  dimensionalPortalAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";
import {
  BabidiFishingNetConstants,
  BabidiToxicFormConstants,
} from "@/data/characters/babidi";

export const BABIDI_ACTIVE_ABILITIES: ActiveAbility[] = [
  dimensionalPortalAbility(),
  createActiveAbility({
    id: "fishingNet",
    name: "Rede de Pesca",
    description: `Lança uma rede de pesca gigante acima do inimigo principal: ele fica imobilizado por ${BabidiFishingNetConstants.ROOT_MS / 1000}s. A rede é inquebrável, não tem barra de vida e custa ${BabidiFishingNetConstants.COST_RATIO * 100}% da energia máxima. Cooldown de ${BabidiFishingNetConstants.COOLDOWN_MS / 1000}s.`,
    cooldownMs: BabidiFishingNetConstants.COOLDOWN_MS,
  }),
  createActiveAbility({
    id: "toxicForm",
    name: "Modo Tóxico",
    description: `Babidi fica verde, derretido e raivoso por ${BabidiToxicFormConstants.DURATION_MS / 1000}s: cada ataque básico que acerta o inimigo principal tem ${BabidiToxicFormConstants.POISON_CHANCE * 100}% de chance de envenená-lo por ${BabidiToxicFormConstants.POISON_DURATION_MS / 1000}s. Custa ${BabidiToxicFormConstants.COST_RATIO * 100}% da energia máxima. Cooldown de ${BabidiToxicFormConstants.COOLDOWN_MS / 1000}s.`,
    cooldownMs: BabidiToxicFormConstants.COOLDOWN_MS,
  }),
  domainBurstAbility("babidi"),
  createActiveAbility({
    id: "machineGamaSelfDestruct",
    name: "Autodestruição",
    description:
      "Autodestrói o Machine Gama, causando dano em área ao redor dele.",
  }),
];
