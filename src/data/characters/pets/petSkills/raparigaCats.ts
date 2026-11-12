import { npcPathPets } from "@/utils/paths/npc/npcPathPets";

import type { DamageKind } from "@/utils/types/battle/damageKind";

/**
 * O que o gato faz no instante em que a Rapariga o invoca. Cada variante passa
 * pelo mesmo funil que os outros pets já usam (`calcPetDamage` para dano,
 * `setPlayerHP`/`setPlayerShield` para suporte), então armadura e tipagem
 * elemental continuam valendo sem um caminho de dano novo.
 *
 * - `damage`: golpe único; `bleedMs` opcional aplica sangramento no NPC.
 * - `gamble`: o gato de Schrödinger — com chance `chance` o golpe acontece com
 *   `multiplier`, senão o gato "estava morto" e nada acontece.
 * - `heal` / `healPercent` / `shield`: suporte direto ao jogador.
 */
export type RaparigaCatEffect =
  | {
      kind: "damage";
      multiplier: number;
      damageType?: DamageKind;
      bleedMs?: number;
    }
  | {
      kind: "gamble";
      chance: number;
      multiplier: number;
      damageType?: DamageKind;
    }
  | { kind: "heal"; amount: number }
  | { kind: "healPercent"; percent: number }
  | { kind: "shield"; amount: number };

export type RaparigaCat = {
  name: string;
  description: string;
  /**
   * Só o nome do arquivo: a pasta (`pets/rapariga/cats/`) mora em
   * `raparigaCatSprite`, como manda a regra de assets do projeto.
   */
  sprite: string;
  effect: RaparigaCatEffect;
};

/**
 * Gatos que a Rapariga pode invocar (issue #477). A chave é o id estável do
 * gato — é ela que nomeia o sprite e que um save/replay futuro guardaria.
 */
export const RAPARIGA_CATS = {
  schrodinger: {
    name: "Gato de Schrödinger",
    description:
      "Está vivo e morto ao mesmo tempo: 50% de chance de um golpe devastador, 50% de não fazer nada.",
    sprite: "schrodinger.svg",
    effect: {
      kind: "gamble",
      chance: 0.5,
      multiplier: 3,
      damageType: "magical",
    },
  },
  boots: {
    name: "Gato de Botas",
    description: "Pequeno e teimoso: concede um escudo de 7 pontos.",
    sprite: "boots.svg",
    effect: { kind: "shield", amount: 7 },
  },
  garfield: {
    name: "Garfield",
    description: "Divide a lasanha: recupera 30 de vida.",
    sprite: "garfield.svg",
    effect: { kind: "heal", amount: 30 },
  },
  tom: {
    name: "Tom",
    description:
      "Persegue o inimigo como se fosse o Jerry: golpe físico forte.",
    sprite: "tom.svg",
    effect: { kind: "damage", multiplier: 1.4 },
  },
  meowth: {
    name: "Meowth",
    description: "Dia de Pagamento: arremessa moedas com dano mágico.",
    sprite: "meowth.svg",
    effect: { kind: "damage", multiplier: 1.2, damageType: "magical" },
  },
  helloKitty: {
    name: "Hello Kitty",
    description: "Fofura cura: recupera 15% da vida máxima.",
    sprite: "helloKitty.svg",
    effect: { kind: "healPercent", percent: 15 },
  },
  nyanCat: {
    name: "Nyan Cat",
    description: "Atravessa o inimigo num arco-íris: dano mágico alto.",
    sprite: "nyanCat.svg",
    effect: { kind: "damage", multiplier: 1.6, damageType: "magical" },
  },
  manekiNeko: {
    name: "Maneki-Neko",
    description: "Gato da sorte: concede um escudo de 20 pontos.",
    sprite: "manekiNeko.svg",
    effect: { kind: "shield", amount: 20 },
  },
  witchCat: {
    name: "Gato Preto de Bruxo",
    description: "Lança uma maldição: dano mágico e sangramento por 3s.",
    sprite: "witchCat.svg",
    effect: {
      kind: "damage",
      multiplier: 1,
      damageType: "magical",
      bleedMs: 3000,
    },
  },
} as const satisfies Record<string, RaparigaCat>;

export type RaparigaCatId = keyof typeof RAPARIGA_CATS;

export const RAPARIGA_CAT_IDS = Object.keys(RAPARIGA_CATS) as RaparigaCatId[];

/**
 * Sorteia o gato da invocação. `random` é injetável para que regra e replay
 * possam fixar o resultado; o default é `Math.random`.
 */
export function pickRaparigaCat(
  random: () => number = Math.random,
): RaparigaCatId {
  const index = Math.floor(random() * RAPARIGA_CAT_IDS.length);
  return (
    RAPARIGA_CAT_IDS[Math.min(index, RAPARIGA_CAT_IDS.length - 1)] ?? "garfield"
  );
}

/**
 * Caminho esperado do sprite do gato. O arquivo ainda não existe no repo —
 * quem renderiza precisa tratar a falha de carregamento (`onError`).
 */
export function raparigaCatSprite(id: RaparigaCatId): string {
  return npcPathPets(`rapariga/cats/${RAPARIGA_CATS[id].sprite}`);
}
