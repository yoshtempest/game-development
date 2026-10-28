import { useEffect } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { getComboAction } from "@/data/battle/comboActions";

/**
 * Layer de input da batalha base.
 *
 * Não tem `onOpen`: o special saiu de `g`/Tab e virou botão de habilidade, e
 * o open agora abre a BattleNavbar (tratado em `useGameKeyboard`/`GameButtons`
 * fora da layer). Layers empurradas por cima (clone do ematron, baú) podem
 * ter `onOpen` próprio — a checagem vem antes do fallback de batalha.
 */
type Props = {
  attack: () => void;
  blockStart: () => void;
  blockEnd: () => void;
  handlePlayerHit: () => void;
  disabled: boolean;
  playerState: PlayerState;
  onChargePress?: () => void;
  onChargeRelease?: () => void;
  onChargeCancel?: () => void;
  /** Chamado no onConfirmRelease quando não há charge (ex.: hold do srGuaxinim). */
  onComboRelease?: () => void;
};

const HOLD_DISCRIMINATOR = 150;

export function useBattleControls({
  attack,
  blockStart,
  blockEnd,
  handlePlayerHit,
  disabled,
  playerState,
  onChargePress,
  onChargeRelease,
  onChargeCancel,
  onComboRelease,
}: Props) {
  const { pushControls } = useGameControls();

  const attackRef = useLatestRef(attack);
  const blockStartRef = useLatestRef(blockStart);
  const blockEndRef = useLatestRef(blockEnd);
  const playerHitRef = useLatestRef(handlePlayerHit);
  const chargePressRef = useLatestRef(onChargePress ?? (() => {}));
  const chargeReleaseRef = useLatestRef(onChargeRelease ?? (() => {}));
  const chargeCancelRef = useLatestRef(onChargeCancel ?? (() => {}));
  const comboReleaseRef = useLatestRef(onComboRelease ?? (() => {}));

  const hasChargeRef = useLatestRef(!!onChargePress);

  const playerStateRef = useLatestRef(playerState);

  const pushControlsRef = useLatestRef(pushControls);

  useEffect(() => {
    if (disabled) return;

    const hasCharge = hasChargeRef.current;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let isHoldingCharge = false;

    const controls = {
      onConfirm: () => {
        // Nos estados de combo o confirm vira ataque direto, nunca carga.
        const isComboState = getComboAction(playerStateRef.current) !== null;
        if (hasCharge && !isComboState) {
          if (holdTimer || isHoldingCharge) return;
          holdTimer = setTimeout(() => {
            chargePressRef.current();
            holdTimer = null;
            isHoldingCharge = true;
          }, HOLD_DISCRIMINATOR);
        } else {
          attackRef.current();
          playerHitRef.current();
        }
      },

      onConfirmRelease: hasCharge
        ? () => {
            if (holdTimer) {
              clearTimeout(holdTimer);
              holdTimer = null;
              attackRef.current();
              playerHitRef.current();
              return;
            }
            isHoldingCharge = false;
            chargeReleaseRef.current();
          }
        : () => {
            comboReleaseRef.current();
          },

      onCancel: () => {
        blockStartRef.current();
      },

      onCancelRelease: () => {
        blockEndRef.current();
      },

      onUp: hasCharge
        ? () => {
            chargeCancelRef.current();
          }
        : undefined,

      onDown: hasCharge
        ? () => {
            chargeCancelRef.current();
          }
        : undefined,

      onLeft: hasCharge
        ? () => {
            chargeCancelRef.current();
          }
        : undefined,

      onRight: hasCharge
        ? () => {
            chargeCancelRef.current();
          }
        : undefined,
    };

    const remove = pushControlsRef.current(controls);

    return () => {
      if (holdTimer) clearTimeout(holdTimer);
      remove();
    };
  }, [
    disabled,
    hasChargeRef,
    playerStateRef,
    pushControlsRef,
    attackRef,
    blockEndRef,
    blockStartRef,
    chargeCancelRef,
    chargePressRef,
    chargeReleaseRef,
    comboReleaseRef,
    playerHitRef,
  ]);
}
