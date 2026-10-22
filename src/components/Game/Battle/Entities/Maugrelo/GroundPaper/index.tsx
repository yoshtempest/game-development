import { useEffect, useRef } from "react";
import { npcPathProjectile } from "@/utils/paths";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import type {
  GroundPaper as GroundPaperState,
  FlyingPaper,
} from "@/services/npc/attacks/maugrelo/state";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  papers: GroundPaperState[];
  flyingPaper: FlyingPaper | null;
};

export function GroundPaper({
  papers,
  flyingPaper,
  battleScaleX,
  battleScaleY,
}: Props) {
  const { playSound } = useSoundEffects();

  const explodedPaperIdsRef = useRef<Set<number>>(new Set());
  const armedPaperIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const gp of papers) {
      if (gp.armedAt != null && !armedPaperIdsRef.current.has(gp.id)) {
        armedPaperIdsRef.current.add(gp.id);
        playSound("groundPaperPreExplode");
      }
    }
    const renderedPaperIds = new Set(papers.map((gp) => gp.id));
    for (const id of armedPaperIdsRef.current) {
      if (!renderedPaperIds.has(id)) armedPaperIdsRef.current.delete(id);
    }
  }, [papers, playSound]);

  useEffect(() => {
    // paper virou explosion.svg -> explosion.mp3 (uma vez por paper)
    for (const gp of papers) {
      if (
        gp.sprite === "explosion" &&
        !explodedPaperIdsRef.current.has(gp.id)
      ) {
        explodedPaperIdsRef.current.add(gp.id);
        playSound("explosion");
      }
    }
    const renderedPaperIds = new Set(papers.map((gp) => gp.id));
    for (const id of explodedPaperIdsRef.current) {
      if (!renderedPaperIds.has(id)) explodedPaperIdsRef.current.delete(id);
    }
  }, [papers, playSound]);

  return (
    <>
      {flyingPaper && (
        <img
          src={npcPathProjectile("/paper.svg")}
          style={{
            position: "absolute",
            left: flyingPaper.x * battleScaleX,
            top: flyingPaper.y * battleScaleY,
            width: 60,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      )}

      {papers.map((gp) => (
        <img
          key={gp.id}
          className={
            gp.sprite === "paper" && gp.armedAt != null ? styles.blink : ""
          }
          src={
            gp.sprite === "explosion"
              ? npcPathProjectile("/explosion.svg")
              : npcPathProjectile("/paper.svg")
          }
          style={{
            position: "absolute",
            left: gp.x * battleScaleX,
            top: gp.y * battleScaleY,
            width: 60,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
