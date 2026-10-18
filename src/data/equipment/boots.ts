import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { armorStats } from "./curves";

/**
 * Botas — 3 itens por rank (guardião/robusto/ágil). Sets por rank: andarilho
 * (r2), sentinela (r3), paladino (r6), rei (r7) e lendário (r9).
 */
export const BOOTS = createEquipmentList("boots", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "boots_sandalias_humildade",
    name: "Sandálias da Humildade",
    rank: 1,
    stats: armorStats("boots", 1, "guardiao"),
  },
  {
    id: "boots_chinelos_babidi",
    name: "Chinelos de Babidi",
    rank: 1,
    stats: armorStats("boots", 1, "robusto"),
  },
  {
    id: "boots_sapatos_pano",
    name: "Sapatos de Pano",
    rank: 1,
    stats: armorStats("boots", 1, "agil"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "boots_botas_andarilho",
    name: "Botas do Andarilho",
    rank: 2,
    stats: armorStats("boots", 2, "guardiao"),
    set: "andarilho",
  },
  {
    id: "boots_botas_velhas",
    name: "Botas Velhas",
    rank: 2,
    stats: armorStats("boots", 2, "robusto"),
  },
  {
    id: "boots_sapatos_fugitivo",
    name: "Sapatos do Fugitivo",
    rank: 2,
    stats: armorStats("boots", 2, "agil"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "boots_botas_couro",
    name: "Botas de Couro",
    rank: 3,
    stats: armorStats("boots", 3, "guardiao"),
  },
  {
    id: "boots_botas_pesadas",
    name: "Botas Pesadas",
    rank: 3,
    stats: armorStats("boots", 3, "robusto"),
  },
  {
    id: "boots_grevas_sentinela",
    name: "Grevas da Sentinela",
    rank: 3,
    stats: armorStats("boots", 3, "agil"),
    set: "sentinela",
  },
  // ── Rank 4 · Modesto ──
  {
    id: "boots_botas_bronze",
    name: "Botas de Bronze",
    rank: 4,
    stats: armorStats("boots", 4, "guardiao"),
  },
  {
    id: "boots_grevas_malha",
    name: "Grevas de Malha",
    rank: 4,
    stats: armorStats("boots", 4, "robusto"),
  },
  {
    id: "boots_sapatos_mensageiro",
    name: "Sapatos do Mensageiro",
    rank: 4,
    stats: armorStats("boots", 4, "agil"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "boots_botas_epicas",
    name: "Botas Épicas",
    rank: 5,
    stats: armorStats("boots", 5, "guardiao"),
  },
  {
    id: "boots_botas_batalha",
    name: "Botas de Batalha",
    rank: 5,
    stats: armorStats("boots", 5, "robusto"),
  },
  {
    id: "boots_botas_ligeiras",
    name: "Botas Ligeiras",
    rank: 5,
    stats: armorStats("boots", 5, "agil"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "boots_botas_paladino",
    name: "Botas do Paladino",
    rank: 6,
    stats: armorStats("boots", 6, "guardiao"),
    set: "paladino",
  },
  {
    id: "boots_grevas_jade",
    name: "Grevas de Jade",
    rank: 6,
    stats: armorStats("boots", 6, "robusto"),
  },
  {
    id: "boots_botas_corvo",
    name: "Botas do Corvo",
    rank: 6,
    stats: armorStats("boots", 6, "agil"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "boots_grevas_rei",
    name: "Grevas do Rei",
    rank: 7,
    stats: armorStats("boots", 7, "guardiao"),
    set: "rei",
  },
  {
    id: "boots_botas_comandante",
    name: "Botas do Comandante",
    rank: 7,
    stats: armorStats("boots", 7, "robusto"),
  },
  {
    id: "boots_botas_explorador",
    name: "Botas do Explorador",
    rank: 7,
    stats: armorStats("boots", 7, "agil"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "boots_grevas_obsidiana",
    name: "Grevas de Obsidiana",
    rank: 8,
    stats: armorStats("boots", 8, "guardiao"),
  },
  {
    id: "boots_botas_grifo",
    name: "Botas do Grifo",
    rank: 8,
    stats: armorStats("boots", 8, "robusto"),
  },
  {
    id: "boots_botas_pegaso",
    name: "Botas do Pégaso",
    rank: 8,
    stats: armorStats("boots", 8, "agil"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "boots_botas_lendarias",
    name: "Botas Lendárias",
    rank: 9,
    stats: armorStats("boots", 9, "guardiao"),
    set: "lendario",
  },
  {
    id: "boots_botas_draconicas",
    name: "Botas Dracônicas",
    rank: 9,
    stats: armorStats("boots", 9, "robusto"),
  },
  {
    id: "boots_botas_relampago",
    name: "Botas do Relâmpago",
    rank: 9,
    stats: armorStats("boots", 9, "agil"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "boots_botas_transcendentes",
    name: "Botas Transcendentes",
    rank: 0,
    stats: armorStats("boots", 0, "guardiao"),
  },
  {
    id: "boots_botas_astrais",
    name: "Botas Astrais",
    rank: 0,
    stats: armorStats("boots", 0, "robusto"),
  },
  {
    id: "boots_sapatos_dimensionais",
    name: "Sapatos Dimensionais",
    rank: 0,
    stats: armorStats("boots", 0, "agil"),
  },
  // ── Rank EX · Divino ──
  {
    id: "boots_botas_divinas",
    name: "Botas Divinas",
    rank: "EX",
    stats: armorStats("boots", "EX", "guardiao"),
  },
  {
    id: "boots_grevas_seraficas",
    name: "Grevas Seráficas",
    rank: "EX",
    stats: armorStats("boots", "EX", "robusto"),
  },
  {
    id: "boots_sapatos_nuvem",
    name: "Sapatos de Nuvem",
    rank: "EX",
    stats: armorStats("boots", "EX", "agil"),
  },
]);
