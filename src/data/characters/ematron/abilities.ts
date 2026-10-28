import type { ActiveAbility } from "@/utils/types/player/abilities";
import {
  createActiveAbility,
  hakaiAbility,
} from "@/data/characters/abilityFactories";
import {
  EMATRON_CLONE_MAX_COST,
  EMATRON_KI_CHARGE_PER_TICK,
  EMATRON_KI_CHARGE_TICK_MS,
  EMATRON_KAMEHAMEHA_CHARGING_MS,
  GENKI_DAMA_INITIAL_COST,
  GENKI_DAMA_MAX_DAMAGE_MULTIPLIER,
} from ".";

export const EMATRON_ACTIVE_ABILITIES: ActiveAbility[] = [
  createActiveAbility({
    id: "clone",
    name: "Instância",
    description: `Segure para criar a cópia fantasma e mova pela arena; solte para teleportar até ela. O custo é proporcional à distância percorrida, até ${EMATRON_CLONE_MAX_COST} de Ki.`,
  }),
  createActiveAbility({
    id: "kiCharge",
    name: "Carga de Ki",
    description: `Segure para recarregar +${EMATRON_KI_CHARGE_PER_TICK} de Ki a cada ${EMATRON_KI_CHARGE_TICK_MS}ms. O personagem fica parado e não pode agir enquanto segura.`,
  }),
  createActiveAbility({
    id: "genkiDama",
    name: "Genki Dama",
    description: `Segure para flutuar e reunir energia na esfera (cresce a cada segundo); solte para arremessar. Custa ${GENKI_DAMA_INITIAL_COST} de Ki na largada mais dreno contínuo. Dano máximo: ${GENKI_DAMA_MAX_DAMAGE_MULTIPLIER}x o ataque básico.`,
    damageType: "magical",
  }),
  createActiveAbility({
    id: "kamehameha",
    name: "Kamehameha",
    description: `Carregue por ${EMATRON_KAMEHAMEHA_CHARGING_MS / 1000}s no sprite de carga e o feixe dispara: o efeito causa dano mágico contínuo e empurra o inimigo por 2s. O personagem fica travado durante a carga e o disparo.`,
    damageType: "magical",
  }),
  hakaiAbility("ematron"),
];
