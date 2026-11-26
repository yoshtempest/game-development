import { useRef, useEffect } from "react";
import styles from "@/components/Game/Navbar/ExploreNavbar/Player/styles.module.css";
import { CHARACTERS } from "@/data/characters/list";
import { CHARACTERS as CHARACTER_OPTIONS } from "@/data/options/characters";

type PlayerRewardsProps = {
  rewards: RewardProgress[];
  selectedRewardIndex: number;
  onClaim: (rewardId: string) => void;
};

function charLabel(char: string): string {
  const opt = CHARACTER_OPTIONS.find((c) => c.image === char);
  return opt?.name ?? char;
}

export function PlayerRewards({
  rewards,
  selectedRewardIndex,
  onClaim,
}: PlayerRewardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedRewardIndex]);

  const globalRewards = rewards.filter((r) => !r.charId);
  const totalRewards = globalRewards.length;

  return (
    <div ref={scrollRef} className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recompensas</div>
        {globalRewards.length === 0 && (
          <div className="statRow">
            <span className="statLabel">Nenhuma recompensa disponível</span>
          </div>
        )}
        {globalRewards.map((r, idx) => (
          <div
            key={r.id}
            ref={idx === selectedRewardIndex ? selectedRef : undefined}
            className={`${styles.questRow} ${
              idx === selectedRewardIndex ? styles.rewardRowSelected : ""
            }`}
          >
            <div className={styles.questInfo}>
              <span className={styles.questLabel}>{r.label}</span>
              <span className={styles.questProgress}>
                {r.current.toFixed(0)}/{r.requirement}
              </span>
            </div>
            <div className={styles.questAction}>
              <span className={styles.questValue}>+{r.reward} HyperCoins</span>
              <button
                className={r.canClaim ? styles.claimBtn : styles.claimBtnDone}
                disabled={!r.canClaim}
                onClick={() => onClaim(r.id)}
              >
                {r.canClaim ? "Receber" : "OK"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {CHARACTERS.map((char) => {
        const charRewards = rewards.filter((r) => r.charId === char);
        if (charRewards.length === 0) return null;

        const startIdx =
          totalRewards +
          rewards.filter(
            (r) =>
              r.charId &&
              CHARACTERS.indexOf(r.charId) < CHARACTERS.indexOf(char),
          ).length;

        return (
          <div key={char} className={styles.charRewardSection}>
            <div className={styles.charRewardHeader}>{charLabel(char)}</div>
            {charRewards.map((r, i) => {
              const globalIdx = startIdx + i;
              return (
                <div
                  key={r.id}
                  ref={
                    globalIdx === selectedRewardIndex ? selectedRef : undefined
                  }
                  className={`${styles.questRow} ${
                    globalIdx === selectedRewardIndex
                      ? styles.rewardRowSelected
                      : ""
                  }`}
                >
                  <div className={styles.questInfo}>
                    <span className={styles.questLabel}>{r.label}</span>
                    <span className={styles.questProgress}>
                      {r.current.toFixed(0)}/{r.requirement}
                    </span>
                  </div>
                  <div className={styles.questAction}>
                    <span className={styles.questValue}>
                      +{r.reward} HyperCoins
                    </span>
                    <button
                      className={
                        r.canClaim ? styles.claimBtn : styles.claimBtnDone
                      }
                      disabled={!r.canClaim}
                      onClick={() => onClaim(r.id)}
                    >
                      {r.canClaim ? "Receber" : "OK"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
