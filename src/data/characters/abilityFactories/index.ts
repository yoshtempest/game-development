import type { CharacterId } from "@/data/characters/list";
import type { ActiveAbility } from "@/utils/types/player/abilities";

import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import {
  KILLER_QUEEN_COOLDOWN_MS,
  TOTAL_FREEZE_MS,
} from "@/data/characters/artur/srGuaxinim";
import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/larissa/larissa";
import { LUCAS_WEAPONS } from "@/data/characters/lucas/lucasWeapons";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import {
  BLINK_ENERGY_COST,
  CURSED_ENERGY_HEAL_RATIO,
  DIVERGENT_FIST_COST,
  PURPLE_SPHERE_ENERGY_PERCENT,
  RED_SPHERE_ENERGY_PERCENT,
} from "@/gameRules/battle/cursedEnergy";
import { LUCAS_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";

/**
 * Fábrica genérica de habilidade ativa.
 *
 * Existe para que `kind` nunca seja escrito à mão nos registros e para que os
 * campos obrigatórios (`id`, `name`, `description`) sejam cobrados no ponto de
 * criação. Campos opcionais ficam com `ActiveAbility` — sem defaults escondidos
 * que mudariam o balanceamento de quem já existia.
 */
export function createActiveAbility(
  def: Omit<ActiveAbility, "kind">,
): ActiveAbility {
  return { kind: "active", ...def };
}

/**
 * Killer Queen do Artur: o special dele virou habilidade própria. A coreografia
 * (time-freeze, bombas e explosão) vive em `useArturKillerQueen`; aqui ficam só
 * nome, descrição e cooldown, como em qualquer ativa.
 */
export function killerQueenAbility(): ActiveAbility {
  return createActiveAbility({
    id: "killerQueen",
    name: "Killer Queen",
    description: `Congela o tempo por ${TOTAL_FREEZE_MS / 1000}s, marca cada inimigo e projétil destrutível com uma bomba e detona todos em área. Cooldown de ${KILLER_QUEEN_COOLDOWN_MS / 1000}s.`,
    cooldownMs: KILLER_QUEEN_COOLDOWN_MS,
  });
}

/**
 * Explosão de Stacks da Larissa: o dano é `stacks * 5` (ver
 * `calculateSpecialHitDamage`) e o efeito/visual continuam no `larissaBehavior`;
 * aqui ficam só nome, descrição e cooldown.
 */
export function stackExplosionAbility(): ActiveAbility {
  return createActiveAbility({
    id: "stackExplosion",
    name: "Explosão de Stacks",
    description: `Consome os stacks acumulados pelos ataques básicos numa explosão (5 de dano por stack). Cooldown de ${STACK_EXPLOSION_COOLDOWN_MS / 1000}s.`,
    cooldownMs: STACK_EXPLOSION_COOLDOWN_MS,
  });
}

/**
 * Expansão de Domínio do efeito base (`burst`): nome/descrição saem do registro
 * `DOMAIN_EXPANSIONS`, o dano é especial (mágico). O id é próprio
 * (`domainBurst`) porque o efeito é outro — o `domainExpansion` do marcelo é um
 * execute e continua declarando `damageType: "true"`.
 */
export function domainBurstAbility(characterId: CharacterId): ActiveAbility {
  const def = DOMAIN_EXPANSIONS[characterId];
  return createActiveAbility({
    id: "domainBurst",
    name: def.name,
    description: def.description,
    damageType: "magical",
  });
}

/**
 * Expansão de Domínio do riquelme (`kind: "muryokusho"`): o dreno é 0,2% da vida
 * MÁXIMA direto no HP, a cada 50ms — não passa pelo funil de armadura, então
 * `"true"` fixa a semântica (o mesmo caso do `domainExpansion` do marcelo).
 */
export function muryokushoAbility(characterId: CharacterId): ActiveAbility {
  const def = DOMAIN_EXPANSIONS[characterId];
  return createActiveAbility({
    id: "muryokusho",
    name: def.name,
    description: def.description,
    damageType: "true",
  });
}

/** Troca de arma do Lucas: cada arma tem alcance e sprite próprios. */
export function weaponSwitchAbility(): ActiveAbility {
  return createActiveAbility({
    id: "weaponSwitch",
    name: "Trocar Arma",
    description: `Troca a arma aleatoriamente entre ${LUCAS_WEAPONS.length} armas, cada uma com seu próprio alcance.`,
    cost: LUCAS_WEAPON_SWITCH_MANA_COST,
  });
}

/** Punho Divergente do Riquelme: garante duas instâncias no próximo soco. */
export function divergentFistAbility(): ActiveAbility {
  return createActiveAbility({
    id: "divergentFist",
    name: "Punho Divergente",
    description:
      "O próximo golpe passa a ser um soco com 100% de chance de causar 2 instâncias de dano.",
    cost: DIVERGENT_FIST_COST,
  });
}

/** Blink do Riquelme: teleporte curto, some enquanto O Abençoado está ativo. */
export function blinkAbility(): ActiveAbility {
  return createActiveAbility({
    id: "blink",
    name: "Blink",
    description: "Teleporte curto à frente.",
    cost: BLINK_ENERGY_COST,
    requires:
      "substitui a conversão de energia enquanto O Abençoado estiver ativo",
  });
}

/** Conversão de Energia do Riquelme: energia amaldiçoada vira vida. */
export function cursedEnergyConversionAbility(): ActiveAbility {
  return createActiveAbility({
    id: "cursedEnergyConversion",
    name: "Conversão de Energia",
    description: `Converte energia amaldiçoada em vida (${CURSED_ENERGY_HEAL_RATIO} de energia por 1 de HP).`,
    requires: "some enquanto O Abençoado estiver ativo",
  });
}

/** Esfera Azul: controlável, puxa inimigos e drena energia em campo. */
export function blueSphereAbility(): ActiveAbility {
  return createActiveAbility({
    id: "blueSphere",
    name: "Esfera Azul",
    description:
      "Invoca a esfera azul controlável: ela atrai os inimigos e causa dano mágico contínuo, consumindo energia amaldiçoada enquanto está em campo. Aperte de novo para parar a esfera e, mais uma vez, para dissipá-la.",
    damageType: "magical",
  });
}

/** Esfera Vermelha: arremesso que empurra os inimigos. */
export function redSphereAbility(): ActiveAbility {
  return createActiveAbility({
    id: "redSphere",
    name: "Esfera Vermelha",
    description: `Invoca e arremessa a esfera vermelha nos inimigos, causando dano mágico e empurrando-os. Custa ${RED_SPHERE_ENERGY_PERCENT}% da energia amaldiçoada máxima.`,
    damageType: "magical",
  });
}

/**
 * Esfera Roxa: fusão das esferas azul/vermelha (arraste um botão sobre o outro).
 * Não tem botão próprio, mas existe no registro para o funil de dano e o menu de
 * Status lerem a mesma `damageType`.
 */
export function purpleSphereAbility(): ActiveAbility {
  return createActiveAbility({
    id: "purpleSphere",
    name: "Esfera Roxa",
    description: `Fusão das esferas azul e vermelha: atravessa todos os inimigos no caminho (2x o dano da esfera vermelha), destrói projéteis e é indestrutível. Custa ${PURPLE_SPHERE_ENERGY_PERCENT}% da energia amaldiçoada máxima.`,
    damageType: "magical",
  });
}

/** Portal Dimensional do Lucaua: cria até dois portais ligados entre si. */
export function dimensionalPortalAbility(): ActiveAbility {
  return createActiveAbility({
    id: "dimensionalPortal",
    name: "Energia Dimensional",
    description: `Clique para escolher o tipo (chão/frontal/aéreo), posicione com o joystick e confirme para fincar. Cada portal custa ${LucauaPortalConstants.COST_RATIO * 100}% da energia máxima e até ${LucauaPortalConstants.MAX_PORTALS} ficam no mapa — quem entra num sai no outro. Com os dois em campo, clicar o botão desfaz o último e devolve a energia.`,
  });
}
