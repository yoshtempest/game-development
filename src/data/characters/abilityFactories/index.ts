import type { CharacterId } from "@/data/characters/list";
import type { ActiveAbility } from "@/utils/types/player/abilities";

import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import {
  KILLER_QUEEN_COOLDOWN_MS,
} from "@/data/characters/srGuaxinim/srGuaxinim";
import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/laricell/laricell";
import { YVEL_WEAPONS } from "@/data/characters/yvel/yvelWeapons";
import { BabidiBombDropConstants } from "@/data/characters/babidi";
import {
  BLINK_ENERGY_COST,
  CURSED_ENERGY_HEAL_RATIO,
  DIVERGENT_FIST_COST,
  PURPLE_SPHERE_ENERGY_PERCENT,
  RED_SPHERE_ENERGY_PERCENT,
} from "@/gameRules/battle/cursedEnergy";
import { YVEL_WEAPON_SWITCH_MANA_COST } from "@/gameRules/battle/mana";

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
 * Killer Queen do SrGuaxinim: o special dele virou habilidade própria. A coreografia
 * (marcação, bombas e explosão, sem parar o tempo desde a #521) vive em `useSrGuaxinimKillerQueen`; aqui ficam só
 * nome, descrição e cooldown, como em qualquer ativa.
 */
export function killerQueenAbility(): ActiveAbility {
  return createActiveAbility({
    id: "killerQueen",
    name: "Killer Queen",
    description: `Invoca a Killer Queen, que marca cada inimigo e projétil destrutível com uma bomba e detona todos em área — o tempo não para e você pode se mover enquanto ela trabalha. Cooldown de ${KILLER_QUEEN_COOLDOWN_MS / 1000}s.`,
    cooldownMs: KILLER_QUEEN_COOLDOWN_MS,
  });
}

/**
 * Explosão de Stacks da Laricell: o dano é `stacks * 5` (ver
 * `calculateSpecialHitDamage`) e o efeito/visual continuam no `laricellBehavior`;
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
 * (`domainBurst`) porque o efeito é outro — o `domainExpansion` do marshadow é um
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
 * Expansão de Domínio do natsuki (`kind: "muryokusho"`): o dreno é 0,2% da vida
 * MÁXIMA direto no HP, a cada 50ms — não passa pelo funil de armadura, então
 * `"true"` fixa a semântica (o mesmo caso do `domainExpansion` do marshadow).
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

export function hakaiAbility(characterId: CharacterId): ActiveAbility {
  const def = DOMAIN_EXPANSIONS[characterId];
  return createActiveAbility({
    id: "hakai",
    name: def.name,
    description: def.description,
    damageType: "true",
  });
}

/** Sigilo da Drika: troca o braço em uso, pagando 5% da vida atual. */
export function sigiloAbility(): ActiveAbility {
  return createActiveAbility({
    id: "sigilo",
    name: "Sigilo",
    description:
      "Troca o braço em uso, pagando 5% da vida atual. Escolha entre 4 braços.",
  });
}

/** Troca de arma do Yvel: cada arma tem alcance e sprite próprios. */
export function weaponSwitchAbility(): ActiveAbility {
  return createActiveAbility({
    id: "weaponSwitch",
    name: "Trocar Arma",
    description: `Troca a arma aleatoriamente entre ${YVEL_WEAPONS.length} armas, cada uma com seu próprio alcance.`,
    cost: YVEL_WEAPON_SWITCH_MANA_COST,
  });
}

/** Punho Divergente do Natsuki: garante duas instâncias no próximo soco. */
export function divergentFistAbility(): ActiveAbility {
  return createActiveAbility({
    id: "divergentFist",
    name: "Punho Divergente",
    description:
      "O próximo golpe passa a ser um soco com 100% de chance de causar 2 instâncias de dano.",
    cost: DIVERGENT_FIST_COST,
  });
}

/** Blink do Natsuki: teleporte curto, some enquanto O Abençoado está ativo. */
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

/** Conversão de Energia do Natsuki: energia amaldiçoada vira vida. */
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

/**
 * Energia Dimensional do Babidi: um portal aéreo abre acima do inimigo
 * principal e uma bomba cai de lá, explodindo no alvo. A mecânica antiga de
 * dois portais + teletransporte está arquivada em `src/legacy/babidiPortals`.
 */
export function dimensionalPortalAbility(): ActiveAbility {
  return createActiveAbility({
    id: "dimensionalPortal",
    name: "Energia Dimensional",
    description: `Abre um portal aéreo sobre o inimigo principal e derruba uma bomba que explode no alvo. Custa ${BabidiBombDropConstants.COST_RATIO * 100}% da energia máxima e tem ${BabidiBombDropConstants.COOLDOWN_MS / 1000}s de recarga.`,
    cooldownMs: BabidiBombDropConstants.COOLDOWN_MS,
    damageType: "magical",
  });
}
