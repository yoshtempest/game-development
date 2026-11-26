export type DefeatMenuSelection = "retry" | "flee";

export type Props = {
  isOpen: boolean;
  title?: string;
  onContinue: () => void;
  onBack: () => void;
  progress: number;
  elapsed: number;
  bestTime: number;
  showRetry?: boolean;
};

export const OTHER: Record<DefeatMenuSelection, DefeatMenuSelection> = {
  retry: "flee",
  flee: "retry",
};