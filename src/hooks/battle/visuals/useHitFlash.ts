import { useState } from "react";

/**
 * Fase da piscada de dano. `0` = sem piscada; `1` e `2` são a **mesma**
 * animação com nomes diferentes: alternar entre elas reinicia o CSS quando um
 * golpe chega com a piscada anterior ainda rodando (trocar só a classe para o
 * mesmo `animation-name` não reinicia nada).
 */
export type HitFlashPhase = 0 | 1 | 2;

/**
 * Piscada vermelha do sprite quando a entidade perde HP (issue #244).
 *
 * Deriva o gatilho da própria queda de `hp` em vez de um evento de dano: todo
 * caminho de dano (básico, special, habilidade, pet, sangramento, summon)
 * termina mexendo no HP, então nenhum funil precisa avisar a UI. A comparação
 * com o HP anterior é feita durante o render (padrão "ajustar estado ao mudar
 * prop" do React), sem effect nem timer — o fim da piscada vem do
 * `onAnimationEnd` do sprite.
 *
 * @param hp - HP atual; `undefined` desliga a piscada (entidade sem HP na UI).
 * @returns A fase atual e o handler que encerra a piscada.
 */
export function useHitFlash(hp: number | undefined) {
  const [prevHp, setPrevHp] = useState(hp);
  const [phase, setPhase] = useState<HitFlashPhase>(0);

  if (hp !== prevHp) {
    setPrevHp(hp);
    if (hp !== undefined && prevHp !== undefined && hp < prevHp) {
      setPhase(phase === 1 ? 2 : 1);
    }
  }

  function endFlash() {
    setPhase(0);
  }

  return { phase, endFlash };
}
