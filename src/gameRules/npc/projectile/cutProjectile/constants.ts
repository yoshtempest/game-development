/**
 * Constantes do corte de projétil.
 *
 * Fica em módulo próprio (e não no barrel `index.ts`) para que
 * `shouldCutProjectile.ts` possa ler a constante sem abrir ciclo em runtime com
 * o barrel que o re-exporta.
 */

/** boolean marcado como "marshadow" (characterId "marshadow"). */
export const MARSHADOW_CHARACTER_ID = "marshadow";
