export type Props = {
  setTimeScale: (scale: number) => void;
  resetTimeScale: () => void;
  /**
   * Menu da batalha aberto: o timer do intro congela com o tempo restante e
   * continua de onde parou no unpause (o overlay acompanha via `battlePaused`).
   */
  isMenuOpen: boolean;
};
