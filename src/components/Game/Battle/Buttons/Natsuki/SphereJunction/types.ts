export type SphereJunctionProps = {
  blueActive: boolean;
  blueDisabled: boolean;
  redDisabled: boolean;
  /** Fusão em curso (a purple está em campo): mostra só o botão roxo. */
  purpleActive: boolean;
  purpleDisabled: boolean;
  onBlue: () => void;
  onRed: () => void;
  /** Soltou uma esfera sobre a outra: funde em purple. */
  onPurple: () => void;
};

export type Drag = {
  node: HTMLElement;
  other: HTMLElement | null;
  startX: number;
  startY: number;
  moved: boolean;
  pointerId: number;
};