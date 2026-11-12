import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { ONE_THOUSAND_MS, THREE_THOUSAND_MS } from "@/data/ms";
import type { MarshadowBattleForm } from "@/utils/paths";
import { useSettings } from "@/hooks/settings/useSetting";
import { usePlayerActions } from "@/contexts/PlayerContext";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";

export const SPECIAL_INTRO_DURATION = ONE_THOUSAND_MS;
export const DOMAIN_EXPANSION_INTRO_DURATION = THREE_THOUSAND_MS;
export const SPECIAL_INTRO_TIME_SCALE = 0.1;

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
 *
 * Enquanto o intro está na tela o `specialIntroLockRef` fica armado e o
 * jogador não anda, pula, dá dash nem ataca — vale para TODA habilidade, sem
 * cada uma precisar estender o `freezeActionsUntilRef` por conta própria. O
 * lock é solto ANTES do `onActivate`: a ativação confere o `canUse` (player
 * `idle`, sem lock) e precisa encontrá-lo livre. Como o timer do intro é
 * pausável, o lock acompanha a pausa sem prazo de parede para deslocar.
 */
export function useSpecialIntro({
  setTimeScale,
  resetTimeScale,
  isMenuOpen,
}: Props) {
  const { showAbilityIntro } = useSettings();
  const { specialIntroLockRef } = usePlayerActions();
  const [specialIntro, setSpecialIntro] = useState<{
    character: string;
    ability?: string;
    form?: MarshadowBattleForm;
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
      form?: MarshadowBattleForm,
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
      specialIntroLockRef.current = true;
      onActivateRef.current = onActivate;
      onCancelRef.current = onCancel ?? null;
      setSpecialIntro({ character, ability, form });
      setTimeScale(SPECIAL_INTRO_TIME_SCALE);

      timers.clear();
      timers.schedule(() => {
        activeRef.current = false;
        specialIntroLockRef.current = false;

        const activate = onActivateRef.current;
        onActivateRef.current = null;
        onCancelRef.current = null;

        setSpecialIntro(null);
        resetTimeScale();
        activate?.();
      }, SPECIAL_INTRO_DURATION);

      return true;
    },
    [
      setTimeScale,
      resetTimeScale,
      showAbilityIntro,
      specialIntroLockRef,
      timers,
    ],
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
    specialIntroLockRef.current = false;

    timers.clear();

    const onCancel = onCancelRef.current;
    onActivateRef.current = null;
    onCancelRef.current = null;

    setSpecialIntro(null);
    resetTimeScale();
    onCancel?.();
  }, [resetTimeScale, specialIntroLockRef, timers]);

  useEffect(() => {
    // Os timers pendentes são limpos pelo próprio `usePausableTimers` na
    // desmontagem; aqui sobra só desarmar as referências da habilidade.
    return () => {
      onActivateRef.current = null;
      onCancelRef.current = null;
      specialIntroLockRef.current = false;
      resetTimeScale();
    };
  }, [resetTimeScale, specialIntroLockRef]);

  return {
    specialIntroActive: specialIntro !== null,
    specialIntroCharacter: specialIntro?.character ?? null,
    specialIntroAbility: specialIntro?.ability ?? null,
    specialIntroForm: specialIntro?.form ?? null,
    startSpecialIntro,
    cancelSpecialIntro,
  };
}
