import type { ComboMove } from "@/utils/types/battle/comboMoves";

const BASE_COMBOS: ComboMove[] = [
  {
    id: "basicAttack",
    name: "Ataque Básico",
    sequence: ["Z"],
    states: ["attack"],
    description: "Ataque rápido com dano moderado.",
    situation: "Use para construir a barra e manter pressão.",
  },
  {
    id: "fallingAttack",
    name: "Golpe Aéreo",
    sequence: ["↑", "Z"],
    states: ["falling", "fallingAttack"],
    description: "Golpe ao cair. causa 1.2× de dano.",
    situation: "Use ao cair de um pulo para acertar o inimigo de surpresa.",
  },
  {
    id: "blockAttack",
    name: "Contra-Ataque",
    sequence: ["X", "Z"],
    states: ["blocked", "blockAttack"],
    description:
      "Ataque rápido saindo da defesa. causa 0.7× de dano e empurra o inimigo.",
    situation: "Use ao bloquear para criar espaço e revidar.",
  },
];

const CHAR_COMBOS: Partial<Record<CharacterId, ComboMove[]>> = {};

export function getComboMoves(characterId: CharacterId): ComboMove[] {
  return [...BASE_COMBOS, ...(CHAR_COMBOS[characterId] ?? [])];
}
