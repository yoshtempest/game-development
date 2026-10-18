import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { bagBonusSlots } from "./curves";

/**
 * Mochilas — 3 por rank, sem status de combate (só espaço de inventário,
 * vindo de `bagBonusSlots`). Rank 9 em diante é infinito: espaço não é poder
 * de combate, então os ranks de topo são variações cosméticas.
 */
export const BAGS = createEquipmentList("bag", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "bag_bolsa_pano",
    name: "Bolsa de Pano",
    rank: 1,
    stats: {},
    bonusSlots: bagBonusSlots(1),
  },
  {
    id: "bag_bolsa_sisal",
    name: "Bolsa de Sisal",
    rank: 1,
    stats: {},
    bonusSlots: bagBonusSlots(1),
  },
  {
    id: "bag_mochila_trapos",
    name: "Mochila de Trapos",
    rank: 1,
    stats: {},
    bonusSlots: bagBonusSlots(1),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "bag_mochila_lona",
    name: "Mochila de Lona",
    rank: 2,
    stats: {},
    bonusSlots: bagBonusSlots(2),
  },
  {
    id: "bag_bolsa_rachada",
    name: "Bolsa Rachada",
    rank: 2,
    stats: {},
    bonusSlots: bagBonusSlots(2),
  },
  {
    id: "bag_sacola_capenga",
    name: "Sacola Capenga",
    rank: 2,
    stats: {},
    bonusSlots: bagBonusSlots(2),
  },
  // ── Rank 3 · Básico ──
  {
    id: "bag_mochila_couro",
    name: "Mochila de Couro",
    rank: 3,
    stats: {},
    bonusSlots: bagBonusSlots(3),
  },
  {
    id: "bag_bolsa_fibra",
    name: "Bolsa de Fibra",
    rank: 3,
    stats: {},
    bonusSlots: bagBonusSlots(3),
  },
  {
    id: "bag_mochila_viajante",
    name: "Mochila do Viajante",
    rank: 3,
    stats: {},
    bonusSlots: bagBonusSlots(3),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "bag_mochila_nylon",
    name: "Mochila de Nylon",
    rank: 4,
    stats: {},
    bonusSlots: bagBonusSlots(4),
  },
  {
    id: "bag_bolsa_couro_cru",
    name: "Bolsa de Couro Cru",
    rank: 4,
    stats: {},
    bonusSlots: bagBonusSlots(4),
  },
  {
    id: "bag_alforje_cavalo",
    name: "Alforje de Cavalo",
    rank: 4,
    stats: {},
    bonusSlots: bagBonusSlots(4),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "bag_mochila_reforcada",
    name: "Mochila Reforçada",
    rank: 5,
    stats: {},
    bonusSlots: bagBonusSlots(5),
  },
  {
    id: "bag_mochila_nobre",
    name: "Mochila de Couro Nobre",
    rank: 5,
    stats: {},
    bonusSlots: bagBonusSlots(5),
  },
  {
    id: "bag_mochila_expedicao",
    name: "Mochila Expedicionária",
    rank: 5,
    stats: {},
    bonusSlots: bagBonusSlots(5),
  },
  // ── Rank 6 · Superior ──
  {
    id: "bag_mochila_cavalheiro",
    name: "Mochila do Cavalheiro",
    rank: 6,
    stats: {},
    bonusSlots: bagBonusSlots(6),
  },
  {
    id: "bag_bolsa_seda",
    name: "Bolsa de Seda",
    rank: 6,
    stats: {},
    bonusSlots: bagBonusSlots(6),
  },
  {
    id: "bag_mochila_prata",
    name: "Mochila de Prata",
    rank: 6,
    stats: {},
    bonusSlots: bagBonusSlots(6),
  },
  // ── Rank 7 · Elite ──
  {
    id: "bag_mochila_rei",
    name: "Mochila do Rei",
    rank: 7,
    stats: {},
    bonusSlots: bagBonusSlots(7),
  },
  {
    id: "bag_bolsa_comandante",
    name: "Bolsa do Comandante",
    rank: 7,
    stats: {},
    bonusSlots: bagBonusSlots(7),
  },
  {
    id: "bag_mochila_oficial",
    name: "Mochila do Oficial",
    rank: 7,
    stats: {},
    bonusSlots: bagBonusSlots(7),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "bag_mochila_sombria",
    name: "Mochila Sombria",
    rank: 8,
    stats: {},
    bonusSlots: bagBonusSlots(8),
  },
  {
    id: "bag_bolsa_obsidiana",
    name: "Bolsa de Obsidiana",
    rank: 8,
    stats: {},
    bonusSlots: bagBonusSlots(8),
  },
  {
    id: "bag_mochila_mitica",
    name: "Mochila Mítica",
    rank: 8,
    stats: {},
    bonusSlots: bagBonusSlots(8),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "bag_distorce_espaco",
    name: "Distorce Espaço-Tempo",
    rank: 9,
    stats: {},
    bonusSlots: bagBonusSlots(9),
  },
  {
    id: "bag_mochila_dimensional",
    name: "Mochila Dimensional",
    rank: 9,
    stats: {},
    bonusSlots: bagBonusSlots(9),
  },
  {
    id: "bag_mochila_estelar",
    name: "Mochila Estelar",
    rank: 9,
    stats: {},
    bonusSlots: bagBonusSlots(9),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "bag_mochila_transcendente",
    name: "Mochila Transcendente",
    rank: 0,
    stats: {},
    bonusSlots: bagBonusSlots(0),
  },
  {
    id: "bag_bolsa_vazio",
    name: "Bolsa do Vazio",
    rank: 0,
    stats: {},
    bonusSlots: bagBonusSlots(0),
  },
  {
    id: "bag_mochila_astral",
    name: "Mochila Astral",
    rank: 0,
    stats: {},
    bonusSlots: bagBonusSlots(0),
  },
  // ── Rank EX · Divino ──
  {
    id: "bag_mochila_divina",
    name: "Mochila Divina",
    rank: "EX",
    stats: {},
    bonusSlots: bagBonusSlots("EX"),
  },
  {
    id: "bag_bolsa_serafica",
    name: "Bolsa Seráfica",
    rank: "EX",
    stats: {},
    bonusSlots: bagBonusSlots("EX"),
  },
  {
    id: "bag_mochila_paraiso",
    name: "Mochila do Paraíso",
    rank: "EX",
    stats: {},
    bonusSlots: bagBonusSlots("EX"),
  },
]);
