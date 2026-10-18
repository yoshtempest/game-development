import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { bookStats } from "@/data/equipment/curves";

/**
 * Livros (arma de espírito + cooldown) — 3 itens por rank (perfis
 * erudito/selo/profecia de `bookStats`). Antes existia só o Livro do
 * Mestre; agora é a linha de arma completa para conjuradores. O Códice
 * Divino (EX) é a peça de arma do set divino.
 */
export const BOOKS = createEquipmentList("weapon", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "weapon_livro_mestre",
    name: "Livro do Mestre",
    rank: 1,
    stats: bookStats(1, "erudito"),
  },
  {
    id: "weapon_caderno_feiticos",
    name: "Caderno de Feitiços",
    rank: 1,
    stats: bookStats(1, "erudito"),
  },
  {
    id: "weapon_livro_selos",
    name: "Livro de Selos",
    rank: 1,
    stats: bookStats(1, "selo"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "weapon_grimorio_velho",
    name: "Grimório Velho",
    rank: 2,
    stats: bookStats(2, "erudito"),
  },
  {
    id: "weapon_tombo_selos",
    name: "Tombo de Selos",
    rank: 2,
    stats: bookStats(2, "selo"),
  },
  {
    id: "weapon_profecia_rasgada",
    name: "Profecia Rasgada",
    rank: 2,
    stats: bookStats(2, "profecia"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "weapon_grimorio_runas",
    name: "Grimório de Runas",
    rank: 3,
    stats: bookStats(3, "erudito"),
  },
  {
    id: "weapon_livro_selado",
    name: "Livro Selado",
    rank: 3,
    stats: bookStats(3, "selo"),
  },
  {
    id: "weapon_livro_profecia",
    name: "Livro da Profecia",
    rank: 3,
    stats: bookStats(3, "profecia"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "weapon_codice_antigo",
    name: "Códice Antigo",
    rank: 4,
    stats: bookStats(4, "erudito"),
  },
  {
    id: "weapon_tomo_selos",
    name: "Tomo dos Selos",
    rank: 4,
    stats: bookStats(4, "selo"),
  },
  {
    id: "weapon_oraculo_menor",
    name: "Oráculo Menor",
    rank: 4,
    stats: bookStats(4, "profecia"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "weapon_grimorio_mago",
    name: "Grimório do Mago",
    rank: 5,
    stats: bookStats(5, "erudito"),
  },
  {
    id: "weapon_tomo_arquimago",
    name: "Tomo do Arquimago",
    rank: 5,
    stats: bookStats(5, "selo"),
  },
  {
    id: "weapon_livro_visoes",
    name: "Livro das Visões",
    rank: 5,
    stats: bookStats(5, "profecia"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "weapon_codice_arcano",
    name: "Códice Arcano",
    rank: 6,
    stats: bookStats(6, "erudito"),
  },
  {
    id: "weapon_livro_pedra",
    name: "Livro de Pedra",
    rank: 6,
    stats: bookStats(6, "selo"),
  },
  {
    id: "weapon_livro_profecias",
    name: "Livro das Profecias",
    rank: 6,
    stats: bookStats(6, "profecia"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "weapon_tomo_mestre",
    name: "Tomo do Mestre",
    rank: 7,
    stats: bookStats(7, "erudito"),
  },
  {
    id: "weapon_codice_selado",
    name: "Códice Selado",
    rank: 7,
    stats: bookStats(7, "selo"),
  },
  {
    id: "weapon_profecia_rei",
    name: "Profecia do Rei",
    rank: 7,
    stats: bookStats(7, "profecia"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "weapon_codice_mitico",
    name: "Códice Mítico",
    rank: 8,
    stats: bookStats(8, "erudito"),
  },
  {
    id: "weapon_tomo_obsidiana",
    name: "Tomo de Obsidiana",
    rank: 8,
    stats: bookStats(8, "selo"),
  },
  {
    id: "weapon_oraculo_mitico",
    name: "Oráculo Mítico",
    rank: 8,
    stats: bookStats(8, "profecia"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "weapon_grimorio_lendario",
    name: "Grimório Lendário",
    rank: 9,
    stats: bookStats(9, "erudito"),
  },
  {
    id: "weapon_codice_lendario",
    name: "Códice Lendário",
    rank: 9,
    stats: bookStats(9, "selo"),
  },
  {
    id: "weapon_profecia_lendaria",
    name: "Profecia Lendária",
    rank: 9,
    stats: bookStats(9, "profecia"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "weapon_codice_transcendente",
    name: "Códice Transcendente",
    rank: 0,
    stats: bookStats(0, "erudito"),
  },
  {
    id: "weapon_tomo_vazio",
    name: "Tomo do Vazio",
    rank: 0,
    stats: bookStats(0, "selo"),
  },
  {
    id: "weapon_oraculo_transcendente",
    name: "Oráculo Transcendente",
    rank: 0,
    stats: bookStats(0, "profecia"),
  },
  // ── Rank EX · Divino ──
  {
    id: "weapon_codice_divino",
    name: "Códice Divino",
    rank: "EX",
    stats: bookStats("EX", "erudito"),
    set: "divino",
  },
  {
    id: "weapon_livro_deuses",
    name: "Livro dos Deuses",
    rank: "EX",
    stats: bookStats("EX", "selo"),
  },
  {
    id: "weapon_profecia_divina",
    name: "Profecia Divina",
    rank: "EX",
    stats: bookStats("EX", "profecia"),
  },
]);
