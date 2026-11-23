import { TWO_THOUSAND_MS, THREE_THOUSAND_MS } from "@/data/ms";
import type { CharacterId } from "@/data/characters/list";

/**
 * Janela entre dois presses para o combo básico seguir para a próxima postura
 * (issue #376). Passou disso, o próximo básico volta para a 1ª postura.
 */
export const BASIC_COMBO_WINDOW_MS = TWO_THOUSAND_MS;

/**
 * Uma instância do combo básico de 3 golpes.
 *
 * - `sprite`: nome do arquivo (sem extensão) que substitui o `attack.svg` do
 *   personagem enquanto esta postura está em exibição. Enquanto o asset não
 *   existir, o sprite cai no `attack.svg` atual (ver `useBattleSprite`).
 * - `multiplier`: aplicado sobre o dano básico pelo mesmo funil do `playerHit`.
 * - `critBonus`: pontos percentuais somados ao `critRate` do player só neste
 *   golpe (o `critRate` é em %, ver `CombatService.rollCrit`).
 * - `bleedMs`: debuff de sangramento aplicado ao NPC principal quando o golpe
 *   conecta (0 = sem debuff).
 */
export type BasicComboStep = {
  sprite: "attack1" | "attack2" | "attack3";
  multiplier: number;
  critBonus: number;
  bleedMs: number;
};

/**
 * Golpe leve → golpe leve em outra postura → golpe pesado com mais crítico e
 * debuff. Os dois leves mantêm o dano 1x para não mexer no balanceamento do
 * básico de quem só dá um golpe por janela; o ganho do combo fica no 3º golpe.
 */
export const BASIC_COMBO_STEPS = [
  { sprite: "attack1", multiplier: 1, critBonus: 0, bleedMs: 0 },
  { sprite: "attack2", multiplier: 1, critBonus: 0, bleedMs: 0 },
  {
    sprite: "attack3",
    multiplier: 1.3,
    critBonus: 15,
    bleedMs: THREE_THOUSAND_MS,
  },
] as const satisfies readonly BasicComboStep[];

/**
 * Personagens cujo básico já é outra mecânica e por isso ficam fora do combo
 * genérico: ematron (combo próprio de 4 golpes, `EMATRON_COMBO_STEPS`),
 * babidi (o básico é projétil), natsuki (sorteia kick/attack/punch) e
 * srGuaxinim (o dano do básico escala pelos punches do ORA, que só valem com
 * multiplicador 1).
 */
export const BASIC_COMBO_EXCLUDED_CHARACTERS: ReadonlySet<CharacterId> =
  new Set<CharacterId>(["ematron", "babidi", "natsuki", "srGuaxinim"]);
