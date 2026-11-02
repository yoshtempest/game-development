export type Props = {
  npcPhase: number;
  vastolordActive: boolean;
  enabled?: boolean;
  /** Duração do foco (default: CAMERA_FOCUS_MS). Some fases usam um tempo próprio. */
  focusMs?: number;
  /** Batalha terminou (vitória/derrota): foca o jogador com 1.5x até o modal. */
  battleEnded?: boolean;
  /** Modal de vitória/derrota apareceu: libera o foco de fim de batalha. */
  modalShown?: boolean;
  /** Zoom do foco de fim de batalha (default 1.5). */
  endZoom?: number;
};
