import type { RewindSnapshot } from "@/utils/types/battle/rewind";

export const REWIND_INTERVAL_MS = 200;
export const REWIND_BUFFER_MS = 12_000;

export type RewindSnap = { at: number; snap: RewindSnapshot };

export function findRewindTarget(
  snapshots: RewindSnap[],
  now: number,
  targetMs: number,
): RewindSnapshot | null {
  const target = now - targetMs;
  let closest: RewindSnap | null = null;
  for (const entry of snapshots) {
    if (entry.at > now) continue;
    if (
      closest == null ||
      Math.abs(entry.at - target) < Math.abs(closest.at - target)
    ) {
      closest = entry;
    }
  }
  return closest ? closest.snap : null;
}

export function pruneRewindSnapshots(
  snapshots: RewindSnap[],
  cutoff: number,
): RewindSnap[] {
  return snapshots.filter((entry) => entry.snap.at >= cutoff);
}
