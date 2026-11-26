import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  createActiveAbility,
  domainBurstAbility,
} from "@/data/characters/abilityFactories";
import {
  SAMUEL_WEAPONS,
  SAMUEL_WEAPON_LABELS,
} from "@/data/characters/samurion/grimoire";
import { SAMUEL_GRIMOIRE_STAMINA_COST } from "@/data/characters/samurion/stamina";

/**
 * Grimório de 5 folhas: troca a arma do Samuel na sequência fixa. O custo é em
 * stamina — `getEnergyName("samurion")` — e a descrição monta a ordem a partir
 * do registro para não divergir de `nextSamuelWeapon`.
 */
const grimoireAbility = createActiveAbility({
  id: "grimoire",
  name: "Grimório de 5 Folhas",
  description: `Abre o grimório e troca para a próxima arma: ${SAMUEL_WEAPONS.map((w) => SAMUEL_WEAPON_LABELS[w]).join(" → ")}.`,
  cost: SAMUEL_GRIMOIRE_STAMINA_COST,
});

export const SAMUEL_ACTIVE_ABILITIES: ActiveAbility[] = [
  grimoireAbility,
  domainBurstAbility("samurion"),
];
