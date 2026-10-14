import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { ONE_THOUSAND_MS, SIX_HUNDRED_MS } from "@/data/ms";
import type { SoundId } from "@/utils/audio/soundId";

/** Lock de ação do player durante o flash do domínio. */
export const DOMAIN_BURST_LOCK_MS = SIX_HUNDRED_MS;
/** Duração do overlay visual do domínio. */
export const DOMAIN_BURST_MS = ONE_THOUSAND_MS;
/** Dano especial no NPC principal (fator × proporção especial/básico). */
export const DOMAIN_BURST_MAIN_MULTIPLIER = 2;
/** Dano especial em cada summon (fator × proporção especial/básico). */
export const DOMAIN_BURST_SUMMON_MULTIPLIER = 1;

type Props = {
  player: Player;
  /** Dono da habilidade: todos os personagens (o marcelo usa o mugetsu). */
  character: Player["character"];
  /** Carga atual/máxima da barra da Expansão (o uso consome tudo). */
  charges: number;
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** Aplica o dano em todos os inimigos (implementado no useBattleCombat). */
  onBurst: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};

type DomainBurstApi = {
  /** Overlay ativo (o nome/cor do domínio é montado pela Scene). */
  active: boolean;
  press: () => void;
  usable: boolean;
};

/**
 * Efeito base da Expansão de Domínio (`kind: "burst"` em `DOMAIN_EXPANSIONS`):
 * consome as 40 cargas da barra, trava o player por um instante, abre o
 * overlay do domínio e dispara `onBurst` (dano especial em todos os
 * inimigos da arena) imediatamente. Sem cutin/intro de propósito: os outros
 * 11 personagens não têm arte em `abilities/<skill>/background.svg`.
 */
export function useDomainExpansionBurst({
  player,
  character,
  charges,
  chargesMax,
  setDelicia,
  freezeActionsUntilRef,
  isPausedRef,
  battleEndedRef,
  disabledRef,
  onBurst,
  // playSound,
}: Props): DomainBurstApi {
  const [active, setActive] = useState(false);

  const activeRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);
  const onBurstRef = useLatestRef(onBurst);

  const { usable, usableRef } = useSkillGuard({
    player,
    character,
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
  });

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    clearTimers();
    setActive(false);
  }, [clearTimers]);

  const cleanupRef = useLatestRef(cleanup);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    activeRef.current = true;
    // O custo é a barra inteira: as 40 cargas somem no uso (sem cooldown).
    setDeliciaRef.current(0);
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + DOMAIN_BURST_LOCK_MS,
    );
    setActive(true);
    // playSound("explosion");
    onBurstRef.current();

    timersRef.current = [
      setTimeout(() => cleanupRef.current(), DOMAIN_BURST_MS),
    ];
  }, [
    cleanupRef,
    freezeActionsUntilRef,
    onBurstRef,
    // playSound,
    setDeliciaRef,
    usableRef,
  ]);

  useEffect(() => {
    return () => {
      clearTimers();
      activeRef.current = false;
    };
  }, [clearTimers]);

  return {
    active,
    press,
    usable,
  };
}
