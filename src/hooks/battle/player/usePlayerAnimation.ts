import { useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  animationFlow,
  getAbilityFlowOverride,
} from "@/data/battle/animationFlow";
import { EMATRON_AIR_LAUNCH_MS } from "@/data/characters/ematron";
import { logPlay } from "@/utils/replay/audioEventLog";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { FIVE_HUNDRED_MS } from "@/data/ms";
import { PLAYER_JUMP_FORCE } from "@/gameRules/movement/constants";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import type { EmatronComboApi } from "@/hooks/battle/player/characters/ematron/useCombo";

const STUN_BASE_DURATION = FIVE_HUNDRED_MS;

export function usePlayerAnimation(
  player: Player,
  setPlayer: React.Dispatch<React.SetStateAction<Player>>,
  battleTenacityRef?: React.RefObject<number>,
  canRun?: boolean,
  timeScaleRef?: React.RefObject<number>,
  ematronCombo?: EmatronComboApi,
  natsukiPunchRef?: React.RefObject<boolean>,
) {
  const tenacityRef = useLatestRef(battleTenacityRef);
  const canRunRef = useLatestRef(canRun);
  const timeScaleInternalRef = useLatestRef(timeScaleRef);
  const ematronComboRef = useLatestRef(ematronCombo);
  const { playSound } = useSoundEffects();

  // Sequência aérea do combo do ematron: o windup aéreo em `jump` é replicado
  // em `airGrab` após um breve impulso (o dano já foi aplicado no press).
  useEffect(() => {
    if (
      player.state !== "jump" ||
      player.character !== "ematron" ||
      player.mode !== "battle"
    )
      return;
    const combo = ematronComboRef.current;
    if (!combo?.airActiveRef.current) return;

    const timer = setTimeout(() => {
      combo.airActiveRef.current = false;
      setPlayer((p) =>
        p.state === "jump" && p.character === "ematron"
          ? { ...p, state: "airGrab" }
          : p,
      );
    }, EMATRON_AIR_LAUNCH_MS);

    return () => clearTimeout(timer);
  }, [player.state, player.character, player.mode, setPlayer, ematronComboRef]);

  useEffect(() => {
    if (ALL_PREDICATES.isLanding(player.state)) return;

    const defaultStep = animationFlow[player.state];
    if (!defaultStep) return;

    const override = getAbilityFlowOverride(player.character);
    let step = defaultStep;

    // Combo do ematron: o windup `preAttack` resolve para o golpe atual do
    // combo (punch/hook/lowKick) em vez do `attack` genérico.
    const comboStep =
      player.character === "ematron" && player.mode === "battle"
        ? ematronComboRef.current?.steps[
            ematronComboRef.current.stepIndexRef.current
          ]
        : undefined;
    if (
      comboStep &&
      player.state === "preAttack" &&
      comboStep.windupState !== "jump"
    ) {
      step = { ...defaultStep, next: comboStep.state };
    }

    // Natsuki: o básico intercala kick/attack/punch sob o mesmo windup
    // `preAttack` (mesmo mecanismo do combo do ematron) — o press marca em
    // `natsukiPunchRef` quando este windup termina em `punch`.
    const isNatsukiPunch =
      player.character === "natsuki" &&
      player.state === "preAttack" &&
      natsukiPunchRef?.current === true;
    if (isNatsukiPunch) {
      step = { ...defaultStep, next: "punch" };
    }

    if (override) {
      if (player.state === "preAbility") {
        if (player.character === "marshadow") {
          playSound("atomic");
          logPlay("atomic");
        }

        if (player.character === "natsuki") {
          playSound("hollowPurple");
          logPlay("hollowPurple");
        }
        step = { ...defaultStep, ...override.preAbility };
      } else if (player.state === "preAbility2") {
        step = { ...defaultStep, ...override.preAbility2 };
      } else if (player.state === "ability" && override.ability) {
        step = { ...defaultStep, ...override.ability };
      }
    }

    let gameDuration = step.duration;
    // O ataque do srGuaxinim não auto-avança: o hold (ORA) em useSrGuaxinimOraPunch é o
    // único responsável por sair da pose de ataque (300ms após o último click).
    if (
      player.state === "attack" &&
      player.character === "srGuaxinim" &&
      player.mode === "battle"
    ) {
      return;
    }
    if (player.state === "stun" && tenacityRef.current?.current != null) {
      gameDuration = Math.round(
        STUN_BASE_DURATION * (1 - tenacityRef.current.current),
      );
    }

    const scale = timeScaleInternalRef.current?.current ?? 1;
    const realDuration = Math.round(gameDuration / scale);

    const timer = setTimeout(() => {
      const wantsToRun = ALL_PREDICATES.isRunState(step.next);
      if (wantsToRun && canRunRef != null && !canRunRef.current) return;

      // Consome a marca do punch do natsuki no fim do windup `preAttack`; um
      // windup interrompido (sem timeout) deixa o flag para o próximo press,
      // que sempre resorteia.
      if (isNatsukiPunch && natsukiPunchRef) natsukiPunchRef.current = false;

      setPlayer((p) => {
        // Fim de um golpe do combo do ematron (punch/hook/lowKick): se houve
        // press durante o golpe (buffer), encadeia o próximo step em vez de
        // voltar ao idle — cada sprite cumpre sua duração no animationFlow.
        if (
          p.character === "ematron" &&
          p.mode === "battle" &&
          ALL_PREDICATES.isGroundCombo(p.state)
        ) {
          const combo = ematronComboRef.current;
          const queuedIndex = combo?.queuedStepIndexRef.current;
          if (combo && queuedIndex != null) {
            const queuedStep = combo.steps[queuedIndex];
            combo.queuedStepIndexRef.current = null;
            if (queuedStep?.windupState === "jump") {
              combo.airActiveRef.current = true;
              return { ...p, velY: PLAYER_JUMP_FORCE, state: "jump" };
            }
            // Ground steps: preAttack (punch/hook) ou lowKick direto no sprite.
            combo.airActiveRef.current = false;
            return { ...p, state: queuedStep?.windupState ?? "preAttack" };
          }
        }
        return { ...p, state: step.next };
      });
    }, realDuration);

    return () => clearTimeout(timer);
  }, [
    player.state,
    player.character,
    player.mode,
    setPlayer,
    playSound,
    tenacityRef,
    canRun,
    canRunRef,
    timeScaleInternalRef,
    ematronComboRef,
    natsukiPunchRef,
  ]);
}
