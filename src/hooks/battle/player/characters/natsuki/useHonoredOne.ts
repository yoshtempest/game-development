import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  HONORED_ONE_DURATION_MS,
  HONORED_ONE_RISE_MS,
  HONORED_ONE_TIME_COOLDOWN,
  HONORED_ONE_TIME_ID,
  HONORED_ONE_TIME_SPEED,
} from "@/gameRules/battle/cursedEnergy";
import {
  applyTime,
  clearTime,
  slowWorldSpec,
  PLAYER_SPHERE_TIME_ID,
} from "@/gameRules/battle/time";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";

type Props = {
  enabled: boolean;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  refs: ReturnType<typeof useBattleRefs>;
  /** O player não é `TimeKind`: o gate de ação dele é este lock. */
  freezeActionsUntilRef: RefObject<number>;
  resetTimeScale: () => void;
  battleManaRef: RefObject<BattleManaApi | null>;
  honoredRiseStartRef: RefObject<number>;
  honoredRiseStartYRef: RefObject<number>;
  honoredFallRef: RefObject<boolean>;
  /** Callback opcional chamado quando o jogador pula a animação. */
  onSkip?: () => void;
};

export function useHonoredOne({
  enabled,
  player,
  setPlayer,
  playSound,
  refs,
  freezeActionsUntilRef,
  resetTimeScale,
  battleManaRef,
  honoredRiseStartRef,
  honoredRiseStartYRef,
  honoredFallRef,
  onSkip,
}: Props) {
  const honoredOneUsedRef = useRef(false);
  const honoredOneActiveRef = useRef(false);
  const [honoredOneActive, setHonoredOneActive] = useState(false);
  /** True do gatilho até o pouso: a coreografia tomou o controle do personagem. */
  const [honoredSequence, setHonoredSequence] = useState(false);
  /** Regeneração passiva de energia amaldiçoada (10/s) valendo pelo resto da batalha. */
  const [honoredRegenActive, setHonoredRegenActive] = useState(false);
  const honoredOneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Durante a sequência, os inimigos recuam até ficarem a >=300px em x. */
  const honoredFleeRef = useRef(false);

  const onSkipRef = useLatestRef(onSkip);

  const activateHonoredOne = useCallback(() => {
    honoredOneActiveRef.current = true;
    setHonoredOneActive(true);
  }, []);

  const resetHonoredOne = useCallback(() => {
    honoredOneUsedRef.current = false;
    honoredOneActiveRef.current = false;
    setHonoredOneActive(false);
    setHonoredSequence(false);
    setHonoredRegenActive(false);
    honoredRiseStartRef.current = 0;
    honoredFleeRef.current = false;
    honoredFallRef.current = false;
    if (honoredOneTimerRef.current) {
      clearTimeout(honoredOneTimerRef.current);
      honoredOneTimerRef.current = null;
    }
  }, [honoredRiseStartRef, honoredFleeRef, honoredFallRef, honoredOneTimerRef]);

  /** Pula a animação do "O Abençoado": termina a sequência imediatamente. */
  const skipHonoredOne = useCallback(() => {
    if (!honoredSequence) return;
    if (honoredOneTimerRef.current) {
      clearTimeout(honoredOneTimerRef.current);
      honoredOneTimerRef.current = null;
    }
    honoredFallRef.current = false;
    honoredFleeRef.current = false;
    setHonoredSequence(false);
    setHonoredRegenActive(false);
    honoredRiseStartRef.current = 0;
    refs.timeRef.current = clearTime(refs.timeRef.current, HONORED_ONE_TIME_ID);
    freezeActionsUntilRef.current = Date.now();
    setPlayer((p) => ({ ...p, state: "idle" }));
    onSkipRef.current?.();
  }, [
    honoredSequence,
    refs,
    freezeActionsUntilRef,
    setPlayer,
    honoredFallRef,
    honoredRiseStartRef,
    onSkipRef,
  ]);

  /**
   * Passiva O Abençoado do riquelme: o primeiro golpe letal em uma batalha não
   * mata — o personagem sobrevive com 1 de vida. A batalha congela (NPCs,
   * projéteis, controles e fluxo) e o sprite troca para mostHonored.svg com a
   * seguinte coreografia:
   * 1. ~~5s: o riquelme sobe 400px em y girando ~90° enquanto os inimigos
   *    próximos recuam até ficarem a >=300px em x;
   * 2. a rotação volta a 0° e ele cai do alto com falling.svg;
   * 3. ao aterrissar vira idleCrounched.svg e só então a batalha volta ao
   *    normal — a energia amaldiçoada regenera 100%/1s e o botão de conversão
   *    vira o blink.
   */
  const surviveLethalHitRef = useLatestRef(() => {
    if (!enabled || honoredOneUsedRef.current) return false;
    honoredOneUsedRef.current = true;

    honoredRiseStartRef.current = Date.now();
    honoredRiseStartYRef.current = player.y;
    honoredFleeRef.current = true;
    setHonoredRegenActive(true);
    setHonoredSequence(true);
    // TEMP-DEBUG honored-regen
    console.log(
      "[honored-regen] sequence start: setHonoredRegenActive(true), mana=",
      battleManaRef.current?.playerMana,
    );
    setPlayer((p) => ({ ...p, state: "mostHonored", velY: 0 }));
    // Regra de time: o mundo inteiro sai do time normal, **exceto a esfera do
    // riquelme** — ela é a única coisa que continua em 1x enquanto ele sobe. O
    // player fica de fora do `TimeKind`, então o lock de ação dele é escrito à
    // mão (é o mesmo ref que câmera/vastolord/etc já usam).
    refs.timeRef.current = applyTime(
      refs.timeRef.current,
      slowWorldSpec(
        HONORED_ONE_TIME_ID,
        HONORED_ONE_DURATION_MS,
        {
          speed: HONORED_ONE_TIME_SPEED,
          cooldown: HONORED_ONE_TIME_COOLDOWN,
        },
        [PLAYER_SPHERE_TIME_ID],
      ),
    );
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + HONORED_ONE_DURATION_MS,
    );
    playSound("honoredOne");

    if (honoredOneTimerRef.current) {
      clearTimeout(honoredOneTimerRef.current);
    }

    // Fim da fase de subida/rotação: o riquelme cai do alto; a física cuida da
    // queda e o pouso em `idleCrounched` destrava a batalha (ver efeito abaixo).
    honoredOneTimerRef.current = setTimeout(() => {
      honoredOneTimerRef.current = null;
      honoredFallRef.current = true;
      setPlayer((p) => ({
        ...p,
        state: "falling",
        velY: 2,
        y: Math.max(0, p.y + 2),
      }));
    }, HONORED_ONE_RISE_MS);

    return true;
  });

  /**
   * Fim da coreografia honored-one: ao aterrissar (estado `idleCrounched`
   * vindo da queda), a batalha volta ao normal de uma vez.
   */
  useEffect(() => {
    if (!honoredFallRef.current) return;
    if (player.state !== "idleCrounched") return;

    honoredFallRef.current = false;
    honoredRiseStartRef.current = 0;
    honoredFleeRef.current = false;
    setHonoredSequence(false);
    refs.timeRef.current = clearTime(refs.timeRef.current, HONORED_ONE_TIME_ID);
    // A sequência acabou no pouso: o slow e o lock do player valem só até
    // aqui, senão o riquelme ficaria travado no resto dos ~7.3s do efeito.
    freezeActionsUntilRef.current = Date.now();
    activateHonoredOne();
  }, [
    player.state,
    honoredFallRef,
    honoredRiseStartRef,
    honoredFleeRef,
    refs,
    freezeActionsUntilRef,
    activateHonoredOne,
  ]);

  useEffect(() => {
    return () => {
      if (honoredOneTimerRef.current) {
        clearTimeout(honoredOneTimerRef.current);
        honoredOneTimerRef.current = null;
      }
      honoredRiseStartRef.current = 0;
      honoredFleeRef.current = false;
      honoredFallRef.current = false;
      resetTimeScale();
    };
  }, [resetTimeScale, honoredRiseStartRef, honoredFleeRef, honoredFallRef]);

  return {
    honoredOneUsedRef,
    honoredOneActiveRef,
    honoredOneActive,
    honoredSequence,
    setHonoredOneActive,
    honoredRegenActive,
    setHonoredRegenActive,
    honoredOneTimerRef,
    honoredFleeRef,
    activateHonoredOne,
    resetHonoredOne,
    surviveLethalHitRef,
    skipHonoredOne,
  };
}
