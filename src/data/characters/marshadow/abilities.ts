import type { ActiveAbility } from "@/utils/types/player/abilities";

import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { createActiveAbility } from "@/data/characters/abilityFactories";
import { ATOMIC_COOLDOWN_MS } from "./marshadow";
import {
  GRAN_REY_CERO_AOE_RADIUS,
  GRAN_REY_CERO_COOLDOWN_MS,
} from "./granReyCero";

export const MARSHADOW_ACTIVE_ABILITIES: ActiveAbility[] = [
  createActiveAbility({
    id: "vastolordLaser",
    name: "Laser Vastolord",
    description:
      "Feixe que cruza o mapa causando dano contínuo e empurrando o inimigo. Só existe na Forma Vastolord, e cada inimigo derrotado na forma rende +1 disparo.",
    requires: "Forma Vastolord ativa",
    damageType: "magical",
  }),
  createActiveAbility({
    id: "iAmAtomic",
    name: "I Am Atomic",
    description:
      "Explosão centrada no inimigo com maior vida máxima, causando dano mágico em todos os inimigos num raio de 300px (2x no alvo).",
    cooldownMs: ATOMIC_COOLDOWN_MS,
    damageType: "magical",
  }),
  createActiveAbility({
    id: "domainExpansion",
    name: DOMAIN_EXPANSIONS.marshadow.name,
    description: DOMAIN_EXPANSIONS.marshadow.description,
    // Sem uso hoje, e é proposital: a Expansão de Domínio é um *execute*
    // (`setNpcHP(0)`), então não existe conta de dano para a armadura
    // reduzir. A declaração existe para fixar a semântica da habilidade caso
    // ela um dia vire dano verdadeiro proporcional — e para deixar explícito
    // que nada aqui deve ser lido como "o Domínio passa pelo funil".
    // Nenhum golpe do jogo usa `"true"` ainda; a mecânica está pronta.
    damageType: "true",
  }),
  createActiveAbility({
    id: "granReyCero",
    name: "Gran Rey Cero",
    description: `Lâmina que percorre grande distância na direção de mira. Ao encostar, para e rasteja, causando dano contínuo e empurrando todo inimigo num raio de ${GRAN_REY_CERO_AOE_RADIUS}px da ponta.`,
    cooldownMs: GRAN_REY_CERO_COOLDOWN_MS,
    damageType: "physical",
  }),
];
