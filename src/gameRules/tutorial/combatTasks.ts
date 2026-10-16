export type Task =
  "moveLeft" | "moveRight" | "jump" | "attack" | "crounch" | "block" | "done";

export const TASKS: Task[] = [
  "moveLeft",
  "moveRight",
  "jump",
  "attack",
  "crounch",
  "block",
  "done",
];

export const TASK_ORDER: Record<Task, number> = {
  moveLeft: 1,
  moveRight: 2,
  jump: 3,
  attack: 4,
  crounch: 5,
  block: 6,
  done: 7,
};

export interface TaskInstruction {
  text: string;
}

export const TASK_INSTRUCTIONS: Record<Task, TaskInstruction> = {
  moveLeft: {
    text: "Pressione A ou ← para se mover para esquerda, vá para a borda do mapa",
  },
  moveRight: {
    text: "Pressione D ou → para se mover para direita",
  },
  jump: {
    text: "Pressione W ou ↑ para pular",
  },
  attack: {
    text: "Faça o L para atacar",
  },
  crounch: {
    text: "Pressione S ou ↓ para agachar e desviar de projéteis",
  },
  block: {
    text: "Pressione B para bloquear ataques",
  },
  done: {
    text: "Parabéns! Fim do tutorial, te vejo por ai",
  },
};

export type TaskStatus = "pending" | "active" | "done";

export function getTaskStatus(task: Task, currentTask: Task): TaskStatus {
  const order = TASK_ORDER[task];
  const current = TASK_ORDER[currentTask];
  if (order < current) return "done";
  if (order === current) return "active";
  return "pending";
}
