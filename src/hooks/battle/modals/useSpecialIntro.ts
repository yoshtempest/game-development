import { useCallback, useEffect, useRef, useState } from "react";
import { ONE_THOUSAND_MS, THREE_THOUSAND_MS } from "@/data/ms";
import type { MarceloBattleForm } from "@/utils/paths";
import { useSettings } from "@/hooks/settings/useSetting";
import { usePausableTimers } from "@/hooks/battle/utilities/usePausableTimers";

export const SPECIAL_INTRO_DURATION = ONE_THOUSAND_MS;
export const DOMAIN_EXPANSION_INTRO_DURATION = THREE_THOUSAND_MS;
export const SPECIAL_INTRO_TIME_SCALE = 0.1;

type Props = {
  setTimeScale: (scale: number) => void;
  resetTimeScale: () => void;
  /**
   * Menu da batalha aberto: o timer do intro congela com o tempo restante e
   * continua de onde parou no unpause (o overlay acompanha via `battlePaused`).
   */
  isMenuOpen: boolean;
};

/**
 * Animação de abertura do special: durante `SPECIAL_INTRO_DURATION` o tempo
 * da batalha fica em `SPECIAL_INTRO_TIME_SCALE` e o overlay do personagem é
 * exibido. Ao final, o tempo volta ao normal e a ação do special é ativada.
 * A duração casa com a animação CSS do SpecialIntro (fade-in 2s + fade-out
 * rápido), que roda em tempo real independente do time scale.
 *
 * A configuração `showAbilityIntro` (Config › Batalha) desliga a animação
 * inteira: nada de overlay nem de slow-motion, e a ação é ativada na hora. O
 * lock de 1s que a animação impõe também não pode ficar — o jogador ficaria
 * parado sem ver nada.
 *
 * `startSpecialIntro` devolve se ele assumiu a ativação. `false` significa que
 * já existe um intro em andamento e o `onActivate` passado nunca roda: quem
 * consome precisa executar a ação por conta própria, senão a habilidade some
 * junto com o recurso que ela consumiu no `press`.
 *
 * `cancelSpecialIntro` descarta a ativação pendente e o overlay sem executar o
 * `onActivate` — é a saída para uma tomada de controle que precisa se sobrepor
 * à habilidade em preparo (ex.: O Abençoado). O `onCancel` opcional avisa a
 * habilidade para ela desarmar o próprio estado, já que o `onActivate` não roda.
 */
export function useSpecialIntro({
  setTimeScale,
  resetTimeScale,
  isMenuOpen,
}: Props) {
  const { showAbilityIntro } = useSettings();
  const [specialIntro, setSpecialIntro] = useState<{
    character: string;
    ability?: string;
    form?: MarceloBattleForm;
  } | null>(null);
  const activeRef = useRef(false);
  const onActivateRef = useRef<(() => void) | null>(null);
  const onCancelRef = useRef<(() => void) | null>(null);

  const timers = usePausableTimers(isMenuOpen);

  const startSpecialIntro = useCallback(
    (
      character: string,
      onActivate: () => void,
      ability?: string,
      form?: MarceloBattleForm,
      onCancel?: () => void,
    ) => {
      // Intro desligado na config: a ação sai imediatamente, sem overlay e
      // sem slow-motion (a habilidade já trava o player por conta própria).
      if (!showAbilityIntro) {
        onActivate();
        return true;
      }

      if (activeRef.current) return false;

      activeRef.current = true;
      onActivateRef.current = onActivate;
      onCancelRef.current = onCancel ?? null;
      setSpecialIntro({ character, ability, form });
      setTimeScale(SPECIAL_INTRO_TIME_SCALE);

      timers.clear();
      timers.schedule(() => {
        activeRef.current = false;

        const activate = onActivateRef.current;
        onActivateRef.current = null;
        onCancelRef.current = null;

        setSpecialIntro(null);
        resetTimeScale();
        activate?.();
      }, SPECIAL_INTRO_DURATION);

      return true;
    },
    [setTimeScale, resetTimeScale, showAbilityIntro, timers],
  );

  /**
   * Descarta o intro pendente SEM ativar a habilidade: o overlay some, o tempo
   * volta ao normal e o `onCancel` da habilidade desarma o estado dela. É o que
   * permite uma tomada de controle (O Abençoado) se sobrepor a um cast/preparo.
   *
   * Não faz nada quando não há intro em andamento — chamar no gatilho da
   * tomada de controle é seguro em qualquer caso.
   */
  const cancelSpecialIntro = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;

    timers.clear();

    const onCancel = onCancelRef.current;
    onActivateRef.current = null;
    onCancelRef.current = null;

    setSpecialIntro(null);
    resetTimeScale();
    onCancel?.();
  }, [resetTimeScale, timers]);

  useEffect(() => {
    // Os timers pendentes são limpos pelo próprio `usePausableTimers` na
    // desmontagem; aqui sobra só desarmar as referências da habilidade.
    return () => {
      onActivateRef.current = null;
      onCancelRef.current = null;
      resetTimeScale();
    };
  }, [resetTimeScale]);

  return {
    specialIntroActive: specialIntro !== null,
    specialIntroCharacter: specialIntro?.character ?? null,
    specialIntroAbility: specialIntro?.ability ?? null,
    specialIntroForm: specialIntro?.form ?? null,
    startSpecialIntro,
    cancelSpecialIntro,
  };
}
