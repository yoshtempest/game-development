import {
  EIGHT_HUNDRED_MS,
  FIVE_THOUSAND_MS,
  FOUR_THOUSAND_MS,
  TEN_THOUSAND_MS,
  TWENTY_THOUSAND_MS,
} from "@/data/ms";

/** Cooldown do botão da Explosão de Stacks (o antigo cooldown do special). */
export const STACK_EXPLOSION_COOLDOWN_MS = TWENTY_THOUSAND_MS;

// ── A1 — Parede de Gelo ─────────────────────────────────────────────────────

/**
 * Parede de Gelo (issue #517, "parede de gelo que nem no FF"): uma barreira
 * vertical erguida à frente da Laricell que nenhum NPC atravessa e que
 * destrói todo projétil inimigo que tocar nela. Os números são o default da
 * primeira versão — decisão para revisar no balanceamento.
 */
export const LaricellIceWallConstants = {
  /** Quanto tempo a parede fica de pé. */
  DURATION_MS: FOUR_THOUSAND_MS,
  COOLDOWN_MS: 15_000,
  /** Distância (px lógicos) entre a Laricell e o centro da parede. */
  OFFSET_PX: 110,
  /** Meia largura da parede: a faixa que bloqueia passo e projétil. */
  HALF_WIDTH_PX: 24,
} as const;

// ── A2 — Brincos Explosivos ─────────────────────────────────────────────────

/**
 * Brincos Explosivos: a Laricell arremessa os brincos no inimigo e eles
 * detonam depois de um pavio curto, em área. O pavio é o que diferencia a
 * habilidade de um golpe direto — o inimigo pode sair do raio.
 */
export const LaricellEarringsConstants = {
  FUSE_MS: EIGHT_HUNDRED_MS,
  RADIUS_PX: 170,
  /** Multiplicador sobre o dano do golpe (mágico, ver `abilities.ts`). */
  MULTIPLIER: 1.6,
  COOLDOWN_MS: 12_000,
} as const;

// ── A3 — Bomba de Fumaça ────────────────────────────────────────────────────

/**
 * Bomba de Fumaça: cega os inimigos — enquanto dura, cada golpe do NPC
 * (melee ou projétil) tem `MISS_CHANCE` de errar a Laricell.
 */
export const LaricellSmokeConstants = {
  DURATION_MS: FIVE_THOUSAND_MS,
  MISS_CHANCE: 0.6,
  COOLDOWN_MS: 18_000,
} as const;

// ── A4 — Forma Vampira ──────────────────────────────────────────────────────

/**
 * Forma Vampira: a linhagem desperta. Durante a forma, todo dano causado pela
 * Laricell cura (`UNIVERSAL_VAMPIRISM`%, somado ao do equipamento no mesmo
 * funil da Forma Vastolord) e as habilidades A1–A3 dão lugar à Mordida.
 */
export const LaricellVampireConstants = {
  DURATION_MS: TEN_THOUSAND_MS + FIVE_THOUSAND_MS,
  COOLDOWN_MS: 45_000,
  /** Percentual de vampirismo universal somado enquanto a forma dura. */
  UNIVERSAL_VAMPIRISM: 25,
} as const;

/**
 * Mordida (só na Forma Vampira): golpe mágico de curto alcance. A cura vem do
 * vampirismo da forma, que já paga sobre qualquer dano da Laricell.
 */
export const LaricellBiteConstants = {
  RADIUS_PX: 140,
  MULTIPLIER: 2,
  COOLDOWN_MS: 4_000,
} as const;
