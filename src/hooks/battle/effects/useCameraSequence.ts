import { useCallback, useEffect, useRef, useState } from "react";
import { THREE_THOUSAND_MS } from "@/data/ms";
import type { AbilityCameraFocus } from "@/utils/types/player/abilities";

export type CameraFocus = {
  entity: "npc" | "player";
  zoom: number;
} | null;

export type CameraFocusSpec = AbilityCameraFocus;

type Props = {
  npcPhase: number;
  vastolordActive: boolean;
  enabled?: boolean;
  /** Duração do foco (default: CAMERA_FOCUS_MS). Some fases usam um tempo próprio. */
  focusMs?: number;
};

export const CAMERA_FOCUS_MS = THREE_THOUSAND_MS;
const TRANSFORM_ZOOM = 1.2;

/**
 * Sequência de foco da câmera durante a batalha:
 * - Quando o boss entra em outra fase, a câmera acompanha o boss e a batalha
 *   congela por `focusMs`; ao fim, a câmera volta para o jogador.
 * - Quando o jogador se transforma (ex: marshadow -> vastolord), o mesmo foco
 *   acontece com um leve zoom de `TRANSFORM_ZOOM`.
 */
export function useCameraSequence({
  npcPhase,
  vastolordActive,
  enabled = true,
  focusMs = CAMERA_FOCUS_MS,
}: Props) {
  const [focus, setFocus] = useState<CameraFocus>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevNpcPhaseRef = useRef(npcPhase);
  const prevVastolordRef = useRef(vastolordActive);

  const scheduleEnd = useCallback(
    (duration: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setFocus(null);
      }, duration);
    },
    [],
  );

  const triggerFocus = useCallback(
    (spec: CameraFocusSpec) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFocus({ entity: spec.entity, zoom: spec.zoom });
      scheduleEnd(spec.durationMs ?? focusMs);
    },
    [focusMs, scheduleEnd],
  );

  useEffect(() => {
    if (!enabled) {
      prevNpcPhaseRef.current = npcPhase;
      prevVastolordRef.current = vastolordActive;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setFocus(null);
      }
      return;
    }

    if (npcPhase > prevNpcPhaseRef.current && npcPhase > 1) {
      prevNpcPhaseRef.current = npcPhase;
      setFocus({ entity: "npc", zoom: 1 });
      scheduleEnd(focusMs);
      return;
    }
    prevNpcPhaseRef.current = npcPhase;

    if (vastolordActive && !prevVastolordRef.current) {
      prevVastolordRef.current = vastolordActive;
      setFocus({ entity: "player", zoom: TRANSFORM_ZOOM });
      scheduleEnd(focusMs);
      return;
    }
    prevVastolordRef.current = vastolordActive;
  }, [npcPhase, vastolordActive, enabled, focusMs, scheduleEnd]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Funções de consulta (detectar se aplicará foco, quanto e em quem) a partir
  // de uma spec — expostas para que a camada de habilidades possa decidir.
  const willApplyFocus = useCallback((spec: CameraFocusSpec | null) => spec !== null, []);
  const getFocusAmount = useCallback(
    (spec: CameraFocusSpec | null) => spec?.zoom ?? null,
    [],
  );
  const getFocusEntity = useCallback(
    (spec: CameraFocusSpec | null) => spec?.entity ?? null,
    [],
  );

  return {
    focus,
    isFrozen: focus != null,
    triggerFocus,
    willApplyFocus,
    getFocusAmount,
    getFocusEntity,
  } as const;
}
