import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { bowStats } from "@/data/equipment/curves";

/**
 * Arcos (arma de técnica) — 3 itens por rank (perfis longo/pontaria/
 * perfurante de `bowStats`). Antes só existiam dois arcos de rank 3.
 */
export const BOWS = createEquipmentList("weapon", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "weapon_arco_galho",
    name: "Arco de Galho",
    rank: 1,
    stats: bowStats(1, "longo"),
  },
  {
    id: "weapon_besta_madeira",
    name: "Besta de Madeira",
    rank: 1,
    stats: bowStats(1, "longo"),
  },
  {
    id: "weapon_arco_curto",
    name: "Arco Curto",
    rank: 1,
    stats: bowStats(1, "pontaria"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "weapon_arco_freixo",
    name: "Arco de Freixo",
    rank: 2,
    stats: bowStats(2, "longo"),
  },
  {
    id: "weapon_besta_velha",
    name: "Besta Velha",
    rank: 2,
    stats: bowStats(2, "longo"),
  },
  {
    id: "weapon_arco_torto",
    name: "Arco Torto",
    rank: 2,
    stats: bowStats(2, "pontaria"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "weapon_arco_preciso",
    name: "Arco Preciso",
    rank: 3,
    stats: bowStats(3, "longo"),
  },
  {
    id: "weapon_artemis",
    name: "Artemis",
    rank: 3,
    stats: bowStats(3, "pontaria"),
  },
  {
    id: "weapon_besta_cacador",
    name: "Besta do Caçador",
    rank: 3,
    stats: bowStats(3, "perfurante"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "weapon_arco_guerra",
    name: "Arco de Guerra",
    rank: 4,
    stats: bowStats(4, "longo"),
  },
  {
    id: "weapon_arco_ebano",
    name: "Arco de Ébano",
    rank: 4,
    stats: bowStats(4, "pontaria"),
  },
  {
    id: "weapon_besta_pesada",
    name: "Besta Pesada",
    rank: 4,
    stats: bowStats(4, "perfurante"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "weapon_arco_arqueiro",
    name: "Arco do Arqueiro",
    rank: 5,
    stats: bowStats(5, "longo"),
  },
  {
    id: "weapon_besta_epica",
    name: "Besta Épica",
    rank: 5,
    stats: bowStats(5, "pontaria"),
  },
  {
    id: "weapon_arco_longo",
    name: "Arco de Cerco",
    rank: 5,
    stats: bowStats(5, "perfurante"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "weapon_arco_prata",
    name: "Arco de Prata",
    rank: 6,
    stats: bowStats(6, "longo"),
  },
  {
    id: "weapon_besta_mithril",
    name: "Besta de Mithril",
    rank: 6,
    stats: bowStats(6, "pontaria"),
  },
  {
    id: "weapon_arco_lobo",
    name: "Arco do Lobo",
    rank: 6,
    stats: bowStats(6, "perfurante"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "weapon_arco_ceremonial",
    name: "Arco Cerimonial",
    rank: 7,
    stats: bowStats(7, "longo"),
  },
  {
    id: "weapon_arco_negro",
    name: "Arco Negro",
    rank: 7,
    stats: bowStats(7, "pontaria"),
  },
  {
    id: "weapon_arco_perfurante",
    name: "Arco do Caçador de Reis",
    rank: 7,
    stats: bowStats(7, "perfurante"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "weapon_arco_grifo",
    name: "Arco do Grifo",
    rank: 8,
    stats: bowStats(8, "longo"),
  },
  {
    id: "weapon_besta_obsidiana",
    name: "Besta de Obsidiana",
    rank: 8,
    stats: bowStats(8, "pontaria"),
  },
  {
    id: "weapon_besta_mitica",
    name: "Besta Mítica",
    rank: 8,
    stats: bowStats(8, "perfurante"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "weapon_arco_lendario",
    name: "Arco Lendário",
    rank: 9,
    stats: bowStats(9, "longo"),
  },
  {
    id: "weapon_arco_celestial",
    name: "Arco Celestial",
    rank: 9,
    stats: bowStats(9, "pontaria"),
  },
  {
    id: "weapon_besta_dragao",
    name: "Besta do Dragão",
    rank: 9,
    stats: bowStats(9, "perfurante"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "weapon_arco_transcendente",
    name: "Arco Transcendente",
    rank: 0,
    stats: bowStats(0, "longo"),
  },
  {
    id: "weapon_besta_vazio",
    name: "Besta do Vazio",
    rank: 0,
    stats: bowStats(0, "pontaria"),
  },
  {
    id: "weapon_arco_astral",
    name: "Arco Astral",
    rank: 0,
    stats: bowStats(0, "perfurante"),
  },
  // ── Rank EX · Divino ──
  {
    id: "weapon_arco_divino",
    name: "Arco Divino",
    rank: "EX",
    stats: bowStats("EX", "longo"),
  },
  {
    id: "weapon_besta_deuses",
    name: "Besta dos Deuses",
    rank: "EX",
    stats: bowStats("EX", "pontaria"),
  },
  {
    id: "weapon_arco_angelical",
    name: "Arco Angelical",
    rank: "EX",
    stats: bowStats("EX", "perfurante"),
  },
]);
