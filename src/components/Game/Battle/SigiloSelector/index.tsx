import { DRIKA_ARMS, DRIKA_ARM_ICONS, DRIKA_ARM_LABELS } from "@/data/characters/drika/drikaArms";
import { playerPath } from "@/utils/paths";

type Props = {
  open: boolean;
  currentArm?: string;
  onSelect: (arm: string) => void;
  onClose: () => void;
};

export function SigiloSelector({ open, currentArm, onSelect, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        zIndex: 100000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          background: "#1a1a2e",
          borderRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {DRIKA_ARMS.map((arm) => (
          <button
            key={arm}
            type="button"
            disabled={arm === currentArm}
            onClick={() => onSelect(arm)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: arm === currentArm ? 0.4 : 1,
              cursor: arm === currentArm ? "default" : "pointer",
            }}
          >
            <img
              src={playerPath(`/drika/inFight/arms/${DRIKA_ARM_ICONS[arm]}`)}
              alt={DRIKA_ARM_LABELS[arm]}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
            />
            <span>{DRIKA_ARM_LABELS[arm]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}