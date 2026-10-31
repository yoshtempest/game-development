import { slotKey } from "@/services/save/slotManager";

export type BabidiAttackMode = "withGun" | "withMissile";

const STORAGE_KEY = "babidi_attack_mode";

export function getBabidiAttackMode(): BabidiAttackMode {
  try {
    const raw = localStorage.getItem(slotKey(STORAGE_KEY));
    return raw === "withMissile" ? "withMissile" : "withGun";
  } catch {
    return "withGun";
  }
}

export function setBabidiAttackMode(mode: BabidiAttackMode): void {
  try {
    localStorage.setItem(slotKey(STORAGE_KEY), mode);
  } catch {
    // ignore
  }
}