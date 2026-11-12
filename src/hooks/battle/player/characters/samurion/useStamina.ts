import { useEffect, useRef } from "react";

import type { BattleManaApi } from "@/contexts/BattleManaContext";
import { useLatestRef } from "@/hooks/useLatestRef";

import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";

import {
  SAMUEL_STAMINA_ATTACK_COST,
  SAMUEL_STAMINA_BURST_MOVE_COST,
  SAMUEL_STAMINA_PX_PER_POINT,
  SAMUEL_STAMINA_REGEN_PER_TICK,
  SAMUEL_STAMINA_TICK_MS,
} from "@/data/characters/samurion/stamina";

type Props = {
  player: Player;
  battleManaRef: React.RefObject<BattleManaApi | null>;
  isEndingRef: React.RefObject<boolean>;
  isMenuRef?: React.RefObject<boolean>;
  isPausedRef?: React.RefObject<boolean>;
};

/**
 * Gasta até `amount` sem reprovar. `consumeMana` recusa quando falta saldo —
 * certo para habilidade, errado para andar/bater: o Samuel não deixa de se mover
 * por estar cansado, a barra só encosta no zero.
 */
function drainStamina(mana: BattleManaApi | null, amount: number): void {
  if (!mana || amount <= 0) return;
  const spend = Math.min(amount, mana.playerMana);
  if (spend > 0) mana.consumeMana(spend);
}

/** Golpe básico no chão ou no ar: o que conta como "ataque" para a stamina. */
function isStaminaStrike(state: PlayerState): boolean {
  return (
    ALL_PREDICATES.isBasicStrike(state) || ALL_PREDICATES.isAirMelee(state)
  );
}

/** Pulo ou dash: movimento explosivo, cobrado por uso e não por distância. */
function isStaminaBurstMove(state: PlayerState): boolean {
  return state === "jump" || ALL_PREDICATES.isDashing(state);
}

/**
 * Stamina do Samuel (`samurion`, issues #459/#329).
 *
 * Observa o player em vez de instrumentar cada caminho de ação: a stamina é
 * cobrada na **entrada** de um estado de golpe ou de pulo/dash (transição de
 * estado, não por frame — segurar o golpe não drena a barra) e por distância
 * andada, amostrada a cada tick (a fração acumula até virar ponto inteiro, para
 * o pool continuar inteiro como o resto do jogo espera). No tick em que ele não andou nem está
 * golpeando, a stamina regenera. Assim nenhum hook de movimento/ataque precisa
 * saber que existe stamina, e o regen genérico de mana (`useManaRegenTick`)
 * fica desligado para ele em `useSystem`.
 */
export function useSamuelStamina({
  player,
  battleManaRef,
  isEndingRef,
  isMenuRef,
  isPausedRef,
}: Props): void {
  const enabled = player.character === "samurion";
  const playerXRef = useLatestRef(player.x);
  const playerStateRef = useLatestRef(player.state);
  const lastXRef = useRef(player.x);
  const pendingDrainRef = useRef(0);
  const prevStateRef = useRef<PlayerState>(player.state);

  useEffect(() => {
    const prev = prevStateRef.current;
    const next = player.state;
    prevStateRef.current = next;
    if (!enabled || prev === next) return;
    if (isStaminaStrike(next) && !isStaminaStrike(prev)) {
      drainStamina(battleManaRef.current, SAMUEL_STAMINA_ATTACK_COST);
      return;
    }
    if (isStaminaBurstMove(next) && !isStaminaBurstMove(prev)) {
      drainStamina(battleManaRef.current, SAMUEL_STAMINA_BURST_MOVE_COST);
    }
  }, [enabled, player.state, battleManaRef]);

  useEffect(() => {
    if (!enabled) return;
    lastXRef.current = playerXRef.current;
    const id = setInterval(() => {
      const x = playerXRef.current;
      const distance = Math.abs(x - lastXRef.current);
      lastXRef.current = x;
      if (isEndingRef.current || isMenuRef?.current || isPausedRef?.current)
        return;
      const mana = battleManaRef.current;
      if (distance > 0) {
        pendingDrainRef.current += distance / SAMUEL_STAMINA_PX_PER_POINT;
        const whole = Math.floor(pendingDrainRef.current);
        pendingDrainRef.current -= whole;
        drainStamina(mana, whole);
        return;
      }
      if (isStaminaStrike(playerStateRef.current)) return;
      mana?.restoreMana(SAMUEL_STAMINA_REGEN_PER_TICK);
    }, SAMUEL_STAMINA_TICK_MS);
    return () => clearInterval(id);
  }, [
    enabled,
    battleManaRef,
    isEndingRef,
    isMenuRef,
    isPausedRef,
    playerXRef,
    playerStateRef,
  ]);
}
