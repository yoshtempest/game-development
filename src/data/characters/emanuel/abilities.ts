import type { ActiveAbility } from "@/utils/types/player/abilities";
import { createActiveAbility, domainBurstAbility } from "../abilityFactories";
import {
  EMANUEL_CLONE_MAX_COST,
  EMANUEL_KI_CHARGE_PER_TICK,
  EMANUEL_KI_CHARGE_TICK_MS,
  EMANUEL_KAMEHAMEHA_CHARGING_MS,
  GENKI_DAMA_INITIAL_COST,
  GENKI_DAMA_MAX_DAMAGE_MULTIPLIER,
} from "./emanuel";

export const EMANUEL_ACTIVE_ABILITIES: ActiveAbility[] = [
  createActiveAbility({
    id: "clone",
    name: "Instância",
    description: `Segure para criar a cópia fantasma e mova pela arena; solte para teleportar até ela. O custo é proporcional à distância percorrida, até ${EMANUEL_CLONE_MAX_COST} de Ki.`,
  }),
  createActiveAbility({
    id: "kiCharge",
    name: "Carga de Ki",
    description: `Segure para recarregar +${EMANUEL_KI_CHARGE_PER_TICK} de Ki a cada ${EMANUEL_KI_CHARGE_TICK_MS}ms. O personagem fica parado e não pode agir enquanto segura.`,
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
    description: `Carregue por ${EMANUEL_KAMEHAMEHA_CHARGING_MS / 1000}s no sprite de carga e o feixe dispara: o efeito causa dano mágico contínuo e empurra o inimigo por 2s. O personagem fica travado durante a carga e o disparo.`,
    damageType: "magical",
  }),
  domainBurstAbility("emanuel"),
];
