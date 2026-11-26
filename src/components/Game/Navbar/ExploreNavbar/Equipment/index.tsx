import styles from "./styles.module.css";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

type Props = {
  isActive: boolean;
  onFocusTabs: () => void;
};

export function Equipment({ isActive, onFocusTabs }: Props) {
  return (
    <div className={styles.layout}>
      <LeftPanel isActive={isActive} onFocusTabs={onFocusTabs} />
      <RightPanel isActive={isActive} onFocusTabs={onFocusTabs} />
    </div>
  );
}
