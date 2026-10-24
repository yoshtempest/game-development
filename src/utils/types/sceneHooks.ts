export type InteractionHandler = (
  tile: number,
  x: number,
  y: number,
) => boolean;

export type SetPlayerMode = (mode: PlayerMode) => void;

export type DialogueSystem = {
  isOpen: boolean;
  next: () => void;
  skip: () => void;
  start: (dialogues?: Dialogue[], onFinish?: () => void) => void;
  nextSoundSrc?: string;
};

export type ScenePosition = {
  x: number;
  y: number;
  direction: Direction;
  height?: number;
};

export type Controls = {
  onConfirm: () => boolean;
};
