/**
 * Cut-in de golpe do marcelo e o status de sangramento que ele aplica.
 *
 * Mora em `data/` (e não em `useMarceloCutInEnemie.ts`) porque o sprite do
 * cut-in e o ícone de sangue são desenhados por `src/components/`, que não
 * deve importar nada de `src/hooks/`.
 */

import { FIVE_THOUSAND_MS, TWO_HUNDRED_MS } from "@/data/ms";
import { playerPath, statusIconPath } from "@/utils/paths";

/** CutInEnemie aparece por 1s sobre o NPC atingido. */
export const MARCELO_CUT_IN_DURATION_MS = TWO_HUNDRED_MS;
/** Duração do sangramento aplicado pelo CutInEnemie do marcelo. */
export const MARCELO_BLEED_DURATION_MS = FIVE_THOUSAND_MS;

/** Sprite de strike do marcelo (forma padrão) sobrepondo o inimigo. */
export const MARCELO_CUT_IN_ENEMIE_SRC = playerPath(
  "/marcelo/inFight/default/attacks/cutInEnemie.svg",
);
/** Ícone de sangrado exibido acima do NPC em status de sangramento. */
export const BLOOD_ICON_SRC = statusIconPath("bloodIcon.svg");
