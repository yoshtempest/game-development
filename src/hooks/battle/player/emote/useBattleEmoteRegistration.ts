import { useEffect, useMemo } from "react";

import {
  useBattleEmote,
  type BattleEmoteHandler,
} from "@/contexts/BattleEmoteContext";

/**
 * Publica o emote da cena de batalha para o menu flutuante de animações.
 *
 * O objeto registrado só muda quando `available`/`usable`/`trigger` mudam —
 * `trigger` é estável (`useCallback`) e os dois booleanos mudam pouco, então a
 * cena não provoca re-render do menu a cada frame do player.
 */
export function useBattleEmoteRegistration(handler: BattleEmoteHandler): void {
  const { register } = useBattleEmote();
  const registration = useMemo(
    () => ({
      available: handler.available,
      usable: handler.usable,
      trigger: handler.trigger,
    }),
    [handler.available, handler.usable, handler.trigger],
  );

  useEffect(() => register(registration), [register, registration]);
}
