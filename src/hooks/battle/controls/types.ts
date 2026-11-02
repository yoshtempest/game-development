export type Props = {
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
