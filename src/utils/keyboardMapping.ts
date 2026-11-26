export const KEYBOARD_ACTIONS = {
  up: ["ArrowUp", "w", "W", " "] as const,
  down: ["ArrowDown", "s", "S"] as const,
  left: ["ArrowLeft", "a", "A"] as const,
  right: ["ArrowRight", "d", "D"] as const,

  confirm: ["l", "L", "Enter"] as const,
  cancel: ["b", "B", "x", "X", "Delete"] as const,

  open: ["g", "G", "Tab"] as const,

  config: ["Escape"] as const,
  inventory: ["i", "I"] as const,
  quests: ["q", "Q"] as const,
  professions: ["p", "P"] as const,
  titles: ["t", "T"] as const,
  equipment: ["e", "E"] as const,
  mountPet: ["r", "R"] as const,

  battleDown: ["Shift"] as const,
} as const;
