import type { DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Habilidades dos personagens, na visão do menu de Status.
 *
 * Regra:
 * - `kind` discrimina ativa (botão na tela de batalha) de passiva (efeito
 *   automático, sem botão). Toda habilidade é uma das duas.
 * - Um personagem **pode não ter nenhuma habilidade** — o registro de ativas
 *   é `Partial` e as passivas que ainda não foram implementadas são
 *   filtradas, então a lista final é legitimately vazia para alguns
 *   personagens (ver `CHARACTER_ACTIVE_ABILITIES`).
 */

export type ActiveAbility = {
  kind: "active";
  id: string;
  name: string;
  description: string;
  /**
   * Custo por uso em energia (`getEnergyName(character)` — Mana, Energia
   * Amaldiçoada ou Ki). Habilidades de custo variável (instância, Genki Dama,
   * conversão) deixam vazio e explicam a regra na descrição.
   */
  cost?: number;
  cooldownMs?: number;
  /** O botão só passa a existir a partir deste nível. */
  unlockedAtLevel?: number;
  /** O botão só existe enquanto esta condição valer (ex.: Forma Vastolord). */
  requires?: string;
  /**
   * Natureza do dano: qual coluna de armadura do alvo ela fura. Ausente = o
   * golpe é físico, que é o caso do ataque básico e da maioria das
   * habilidades. Declarar `magical` faz o dano cair na armadura mágica;
   * `true` ignora as duas.
   */
  damageType?: DamageKind;
  /**
   * Foco de câmera aplicado quando a habilidade é usada. Ausente = a habilidade
   * não move a câmera (a maioria das habilidades). Quando presente, a câmera
   * foca `entity` com zoom `zoom` por `durationMs` (default: 3000ms).
   */
  cameraFocus?: AbilityCameraFocus;
};

export type AbilityCameraFocus = {
  /** Entidade que recebe o foco. */
  entity: "player" | "npc";
  /** Fator de zoom (1 = padrão, >1 = aproxima). */
  zoom: number;
  /** Duração do foco em ms. Ausente = CAMERA_FOCUS_MS. */
  durationMs?: number;
};

export type PassiveAbility = {
  kind: "passive";
  id: string;
  name: string;
  description: string;
  unlockedAtLevel: number;
  oncePerBattle: boolean;
};

export type CharacterAbility = ActiveAbility | PassiveAbility;
