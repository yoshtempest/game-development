import { useCallback, useState } from "react";

import { BABIDI_CHARACTER } from "@/gameRules/battle/babidiBlock";

import type {
  LucauaShieldSide,
  LucauaShieldSides,
} from "@/utils/types/character/lucaua";

/** Nenhum shield ativo: os dois nonces em zero. */
const NO_SHIELD: LucauaShieldSides = { left: 0, right: 0 };

/**
 * Estado dos shields de bloqueio do lucaua (`inFight/shield.svg`).
 *
 * O valor de cada lado é um nonce: `0` = inativo, `> 0` = ativo. Cada golpe
 * bloqueado incrementa o nonce do lado atacado, o que remonta o `LucauaShield`
 * (via `key`) e reexecuta a animação de surgimento — o "blink" nunca fica preso
 * no primeiro golpe. O componente avisa de volta (`end`) quando termina o
 * fade-out, para o lado sair do estado sem depender de o jogador soltar o block.
 */
export function useLucauaShield(character: CharacterId) {
  const [sides, setSides] = useState<LucauaShieldSides>(NO_SHIELD);

  const register = useCallback(
    (side?: LucauaShieldSide) => {
      // Só o Babidi Block tem shield; para os demais o lado é ignorado.
      if (character !== BABIDI_CHARACTER || !side) return;
      setSides((prev) => ({ ...prev, [side]: prev[side] + 1 }));
    },
    [character],
  );

  const end = useCallback((side: LucauaShieldSide, nonce: number) => {
    // O nonce evita que o timeout de um shield antigo apague o novo: se outro
    // golpe já reacendeu o lado, `prev[side]` não bate e nada acontece.
    setSides((prev) => (prev[side] === nonce ? { ...prev, [side]: 0 } : prev));
  }, []);

  return { sides, register, end };
}
