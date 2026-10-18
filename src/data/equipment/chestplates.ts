import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { armorStats } from "./curves";

/**
 * Coletes/armaduras — 3 itens por rank (guardião/robusto/ágil). Sets por
 * rank: aprendiz (r1), reforcado (r5), cruzado (r4), obsidiana (r8) e
 * lendário/divino/transcendente nos ranks de topo.
 */
export const CHESTPLATES = createEquipmentList("chestplate", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "chestplate_colete_couro",
    name: "Colete de Couro",
    rank: 1,
    stats: armorStats("chestplate", 1, "guardiao"),
  },
  {
    id: "chestplate_regata_baiano",
    name: "Regata do Baiano",
    rank: 1,
    stats: armorStats("chestplate", 1, "robusto"),
  },
  {
    id: "chestplate_tunica_aprendiz",
    name: "Túnica do Aprendiz",
    rank: 1,
    stats: armorStats("chestplate", 1, "agil"),
    set: "aprendiz",
  },
  // ── Rank 2 · Capenga ──
  {
    id: "chestplate_placas_lata",
    name: "Placas de Lata",
    rank: 2,
    stats: armorStats("chestplate", 2, "guardiao"),
  },
  {
    id: "chestplate_colete_lona",
    name: "Colete de Lona",
    rank: 2,
    stats: armorStats("chestplate", 2, "robusto"),
  },
  {
    id: "chestplate_colete_mercenario",
    name: "Colete do Mercenário",
    rank: 2,
    stats: armorStats("chestplate", 2, "agil"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "chestplate_armadura_aco",
    name: "Armadura de Aço",
    rank: 3,
    stats: armorStats("chestplate", 3, "guardiao"),
  },
  {
    id: "chestplate_peitoral_couro",
    name: "Peitoral de Couro",
    rank: 3,
    stats: armorStats("chestplate", 3, "robusto"),
    set: "sentinela",
  },
  {
    id: "chestplate_colete_escamas",
    name: "Colete de Escamas",
    rank: 3,
    stats: armorStats("chestplate", 3, "agil"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "chestplate_peitoral_cruzado",
    name: "Peitoral do Cruzado",
    rank: 4,
    stats: armorStats("chestplate", 4, "guardiao"),
    set: "cruzado",
  },
  {
    id: "chestplate_cota_malha",
    name: "Cota de Malha",
    rank: 4,
    stats: armorStats("chestplate", 4, "robusto"),
  },
  {
    id: "chestplate_cota_leve",
    name: "Cota Leve",
    rank: 4,
    stats: armorStats("chestplate", 4, "agil"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "chestplate_peitoral_reforcado",
    name: "Peitoral Reforçado",
    rank: 5,
    stats: armorStats("chestplate", 5, "guardiao"),
    set: "reforcado",
  },
  {
    id: "chestplate_placas_batalha",
    name: "Placas de Batalha",
    rank: 5,
    stats: armorStats("chestplate", 5, "robusto"),
  },
  {
    id: "chestplate_colete_trovao",
    name: "Colete da Tempestade",
    rank: 5,
    stats: armorStats("chestplate", 5, "agil"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "chestplate_cota_prata",
    name: "Cota de Prata",
    rank: 6,
    stats: armorStats("chestplate", 6, "guardiao"),
  },
  {
    id: "chestplate_placas_jade",
    name: "Placas de Jade",
    rank: 6,
    stats: armorStats("chestplate", 6, "robusto"),
  },
  {
    id: "chestplate_colete_lobo",
    name: "Colete do Lobo",
    rank: 6,
    stats: armorStats("chestplate", 6, "agil"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "chestplate_camisa_insider",
    name: "Camisa da Insider",
    rank: 7,
    stats: armorStats("chestplate", 7, "guardiao"),
  },
  {
    id: "chestplate_placas_comandante",
    name: "Placas do Comandante",
    rank: 7,
    stats: armorStats("chestplate", 7, "robusto"),
  },
  {
    id: "chestplate_camisa_fantasma",
    name: "Camisa Fantasma",
    rank: 7,
    stats: armorStats("chestplate", 7, "agil"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "chestplate_peitoral_obsidiana",
    name: "Peitoral de Obsidiana",
    rank: 8,
    stats: armorStats("chestplate", 8, "guardiao"),
    set: "obsidiana",
  },
  {
    id: "chestplate_placas_grifo",
    name: "Placas do Grifo",
    rank: 8,
    stats: armorStats("chestplate", 8, "robusto"),
  },
  {
    id: "chestplate_colete_manticora",
    name: "Colete da Manticora",
    rank: 8,
    stats: armorStats("chestplate", 8, "agil"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "chestplate_armadura_lendaria",
    name: "Armadura Lendária",
    rank: 9,
    stats: armorStats("chestplate", 9, "guardiao"),
    set: "lendario",
  },
  {
    id: "chestplate_armadura_dragao",
    name: "Armadura do Dragão",
    rank: 9,
    stats: armorStats("chestplate", 9, "robusto"),
  },
  {
    id: "chestplate_placas_colosso",
    name: "Placas do Colosso",
    rank: 9,
    stats: armorStats("chestplate", 9, "agil"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "chestplate_peitoral_transcendente",
    name: "Peitoral Transcendente",
    rank: 0,
    stats: armorStats("chestplate", 0, "guardiao"),
  },
  {
    id: "chestplate_armadura_astral",
    name: "Armadura Astral",
    rank: 0,
    stats: armorStats("chestplate", 0, "robusto"),
  },
  {
    id: "chestplate_camisa_dimensional",
    name: "Camisa Dimensional",
    rank: 0,
    stats: armorStats("chestplate", 0, "agil"),
  },
  // ── Rank EX · Divino ──
  {
    id: "chestplate_peitoral_divino",
    name: "Peitoral Divino",
    rank: "EX",
    stats: armorStats("chestplate", "EX", "guardiao"),
    set: "divino",
  },
  {
    id: "chestplate_placas_celestiais",
    name: "Placas Celestiais",
    rank: "EX",
    stats: armorStats("chestplate", "EX", "robusto"),
  },
  {
    id: "chestplate_cota_angelical",
    name: "Cota Angelical",
    rank: "EX",
    stats: armorStats("chestplate", "EX", "agil"),
  },
]);
