export type Props = {
  player: Player;
  PLAYER_SIZE: number;
  onFire?: () => void;
  timeScaleRef: React.RefObject<number>;
  setTimeScale: (scale: number) => void;
};
