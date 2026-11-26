import { ProgressBar } from "@/components/Game/ProgressBar";
import styles from "@/components/Game/Navbar/ExploreNavbar/Player/styles.module.css";

type Mission = {
  id: string;
  label: string;
  progress: number;
  requirement: number;
  reward: number;
  completed: boolean;
  canClaim: boolean;
  claimed: boolean;
};

type Props = {
  currentMonth: string;
  completedCount: number;
  passTotal: number;
  passPct: number;
  missions: Mission[];
  onClaimMission: (id: string) => void;
};

export function MonthlyPassSection({
  currentMonth,
  completedCount,
  passTotal,
  passPct,
  missions,
  onClaimMission,
}: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        Passe Mensal — {formatMonth(currentMonth)}
      </div>
      <div className="statRow">
        <span className="statLabel">Progresso</span>
        <span className="statValue">
          {completedCount}/{passTotal} ({passPct}%)
        </span>
      </div>
      <ProgressBar
        value={passPct}
        max={100}
        className="barOuter"
        color="var(--accent-color)"
        animationId="monthly-pass-progress"
      />
      {missions.map((m) => (
        <div key={m.id} className={styles.questRow}>
          <div className={styles.questInfo}>
            <span className={styles.questLabel}>{m.label}</span>
            <span className={styles.questProgress}>
              {m.completed ? "Completa" : `${m.progress.toFixed(0)}/${m.requirement}`}
            </span>
          </div>
          <div className={styles.questAction}>
            <span className={styles.questValue}>+{m.reward}</span>
            <button
              className={m.canClaim ? styles.claimBtn : styles.claimBtnDone}
              disabled={!m.canClaim}
              onClick={() => onClaimMission(m.id)}
            >
              {m.claimed ? "OK" : m.completed ? "Receber" : "—"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${months[(m ?? 1) - 1] ?? ""} ${y}`;
}
