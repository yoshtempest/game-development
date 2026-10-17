import type { ReplayData } from "@/utils/types/replay";
import { migratePlayerState } from "@/data/battle/animationFlow";
import { saveCompressed, loadCompressed } from "@/services/save/storageService";
import { slotKey } from "@/services/save/slotManager";

const MAX_REPLAYS = 10;
const REPLAYS_KEY = "replays";

function getReplaysKey(): string {
  return slotKey(REPLAYS_KEY);
}

/**
 * Replays gravados antes do rename dos estados `special` → `ability` guardam o
 * nome antigo dentro dos frames; traduz na leitura para continuarem tocando.
 */
function migrateReplay(replay: ReplayData): ReplayData {
  return {
    ...replay,
    frames: replay.frames.map((frame) => ({
      ...frame,
      ps: migratePlayerState(frame.ps),
      comboAction: frame.comboAction
        ? migratePlayerState(frame.comboAction)
        : frame.comboAction,
    })),
  };
}

export function loadReplays(): ReplayData[] {
  const replays = loadCompressed<ReplayData[]>(getReplaysKey()) ?? [];
  return replays.map(migrateReplay);
}

export function saveReplay(replay: ReplayData): boolean {
  const replays = loadReplays();
  if (replays.length >= MAX_REPLAYS) return false;
  replays.push(replay);
  saveCompressed(getReplaysKey(), replays);
  return true;
}

export function deleteReplay(id: string): void {
  const replays = loadReplays().filter((r) => r.id !== id);
  saveCompressed(getReplaysKey(), replays);
}

export function getReplayById(id: string): ReplayData | null {
  return loadReplays().find((r) => r.id === id) ?? null;
}

export { MAX_REPLAYS };
