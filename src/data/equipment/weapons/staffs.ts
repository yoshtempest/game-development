import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { staffStats } from "@/data/equipment/curves/curves";

/**
 * Cajados (arma de espírito + escudo) — 3 itens por rank (perfis
 * runico/real/ancestral de `staffStats`). A linha "Cajado ..." mantém
 * `class: "arma"` como nos dados antigos.
 *
 * Os outliers antigos (Varinha das Varinhas e Cajado de odin, com
 * espírito 30 e dano verdadeiro 10) foram rebalanceados para a curva.
 */
export const STAFFS = createEquipmentList("weapon", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "weapon_cajado_aprendiz",
    name: "Cajado do Aprendiz",
    rank: 1,
    class: "arma",
    stats: staffStats(1, "runico"),
  },
  {
    id: "weapon_varinha_pinho",
    name: "Varinha de Pinho",
    rank: 1,
    stats: staffStats(1, "runico"),
  },
  {
    id: "weapon_cajado_torto",
    name: "Cajado Torto",
    rank: 1,
    stats: staffStats(1, "real"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "weapon_cajado_pedra",
    name: "Cajado de Pedra",
    rank: 2,
    stats: staffStats(2, "runico"),
  },
  {
    id: "weapon_cajado_betula",
    name: "Cajado de Bétula",
    rank: 2,
    stats: staffStats(2, "real"),
  },
  {
    id: "weapon_varinha_osso",
    name: "Varinha de Osso",
    rank: 2,
    stats: staffStats(2, "ancestral"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "weapon_cajado_runas",
    name: "Cajado de Runas",
    rank: 3,
    class: "arma",
    stats: staffStats(3, "runico"),
  },
  {
    id: "weapon_cajado_mago",
    name: "Cajado do Mago",
    rank: 3,
    class: "arma",
    stats: staffStats(3, "runico"),
  },
  {
    id: "weapon_cajado_viajante",
    name: "Cajado do Viajante",
    rank: 3,
    stats: staffStats(3, "real"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "weapon_cajado_bronze",
    name: "Cajado de Bronze",
    rank: 4,
    stats: staffStats(4, "runico"),
  },
  {
    id: "weapon_cetro_guerra",
    name: "Cetro de Guerra",
    rank: 4,
    stats: staffStats(4, "real"),
  },
  {
    id: "weapon_cajado_antigos",
    name: "Cajado dos Antigos",
    rank: 4,
    stats: staffStats(4, "ancestral"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "weapon_cajado_arquimago",
    name: "Cajado do Arquimago",
    rank: 5,
    class: "arma",
    stats: staffStats(5, "ancestral"),
  },
  {
    id: "weapon_cajado_runico",
    name: "Cajado Rúnico",
    rank: 5,
    stats: staffStats(5, "runico"),
  },
  {
    id: "weapon_cajado_rei",
    name: "Cajado do Rei",
    rank: 5,
    stats: staffStats(5, "real"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "weapon_cajado_prata",
    name: "Cajado de Prata",
    rank: 6,
    stats: staffStats(6, "runico"),
  },
  {
    id: "weapon_cetro_jade",
    name: "Cetro de Jade",
    rank: 6,
    stats: staffStats(6, "real"),
  },
  {
    id: "weapon_varinha_espiritos",
    name: "Varinha dos Espíritos",
    rank: 6,
    stats: staffStats(6, "ancestral"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "weapon_cetro_real",
    name: "Cetro Real",
    rank: 7,
    stats: staffStats(7, "real"),
  },
  {
    id: "weapon_cajado_mago_mestre",
    name: "Cajado do Mago Mestre",
    rank: 7,
    class: "arma",
    stats: staffStats(7, "ancestral"),
  },
  {
    id: "weapon_cajado_arcano",
    name: "Cajado Arcano",
    rank: 7,
    stats: staffStats(7, "runico"),
  },
  // ── Rank 8 · Mítico ──
  // Id antigo duplicado (`weapon_cetro_real` também no rank 7) renomeado para
  // `weapon_cetro_grande`: o Map por id mantinha só uma das duas versões.
  {
    id: "weapon_cetro_grande",
    name: "Cetro Grande",
    rank: 8,
    stats: staffStats(8, "real"),
  },
  {
    id: "weapon_cajado_obsidiana",
    name: "Cajado de Obsidiana",
    rank: 8,
    stats: staffStats(8, "runico"),
  },
  {
    id: "weapon_varinha_mitica",
    name: "Varinha Mítica",
    rank: 8,
    stats: staffStats(8, "ancestral"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "weapon_cajado_real_arquimago",
    name: "Cajado Real do Arquimago",
    rank: 9,
    class: "arma",
    stats: staffStats(9, "ancestral"),
  },
  {
    id: "weapon_elder_wand",
    name: "Varinha das Varinhas",
    rank: 9,
    stats: staffStats(9, "ancestral"),
  },
  {
    id: "weapon_odin_stuff",
    name: "Cajado de odin",
    rank: 9,
    stats: staffStats(9, "ancestral"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "weapon_cajado_transcendente",
    name: "Cajado Transcendente",
    rank: 0,
    stats: staffStats(0, "runico"),
  },
  {
    id: "weapon_cetro_vazio",
    name: "Cetro do Vazio",
    rank: 0,
    stats: staffStats(0, "real"),
  },
  {
    id: "weapon_varinha_astral",
    name: "Varinha Astral",
    rank: 0,
    stats: staffStats(0, "ancestral"),
  },
  // ── Rank EX · Divino ──
  {
    id: "weapon_cajado_divino",
    name: "Cajado Divino",
    rank: "EX",
    stats: staffStats("EX", "runico"),
  },
  {
    id: "weapon_cetro_deuses",
    name: "Cetro dos Deuses",
    rank: "EX",
    stats: staffStats("EX", "real"),
  },
  {
    id: "weapon_varinha_arcanjos",
    name: "Varinha dos Arcanjos",
    rank: "EX",
    stats: staffStats("EX", "ancestral"),
  },
]);
