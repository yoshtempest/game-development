import { TWO_THOUSAND_MS } from "@/data/ms";

export const CHARGE_TIME = TWO_THOUSAND_MS;

export type ChargeParticle = {
  id: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  offsetX: number;
  offsetY: number;
};
