/**
 * Cut-in de golpe do marshadow e o status de sangramento que ele aplica.
 *
 * Mora em `data/` (e não em `useMarshadowCutInEnemie.ts`) porque o sprite do
 * cut-in e o ícone de sangue são desenhados por `src/components/`, que não
 * deve importar nada de `src/hooks/`.
 */

import { FIVE_THOUSAND_MS, TWO_HUNDRED_MS } from "@/data/ms";
import { playerPath, statusIconPath } from "@/utils/paths";

/** CutInEnemie aparece por 1s sobre o NPC atingido. */
export const MARSHADOW_CUT_IN_DURATION_MS = TWO_HUNDRED_MS;
/** Duração do sangramento aplicado pelo CutInEnemie do marshadow. */
export const MARSHADOW_BLEED_DURATION_MS = FIVE_THOUSAND_MS;

/** Sprite de strike do marshadow (forma padrão) sobrepondo o inimigo. */
export const MARSHADOW_CUT_IN_ENEMIE_SRC = playerPath(
  "/marshadow/inFight/default/attacks/cutInEnemie.svg",
);
/** Ícone de sangrado exibido acima do NPC em status de sangramento. */
export const BLOOD_ICON_SRC = statusIconPath("bloodIcon.svg");
