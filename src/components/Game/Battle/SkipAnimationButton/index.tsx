import { useCallback } from "react";
import { SkipBack } from "lucide-react";
import styles from "./styles.module.css";

type Props = {
  onSkip: () => void;
  label: string;
};

export function SkipAnimationButton({ onSkip, label }: Props) {
  const handleClick = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <button
      className={styles.skipButton}
      onClick={handleClick}
      aria-label={`Pular ${label}`}
    >
      <SkipBack size={20} />
      <span>Pular {label}</span>
    </button>
  );
}
