import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { armorStats } from "./curves/curves";

/**
 * Calças/grevas — 3 itens por rank (guardião/robusto/ágil). Sets por rank:
 * aprendiz (r1), andarilho (r2), cruzado (r4), reforcado (r5), rei (r7),
 * lendário (r9), transcendente (r0) e divino (EX).
 */
export const PANTS = createEquipmentList("pants", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "pants_calcas_aprendiz",
    name: "Calças do Aprendiz",
    rank: 1,
    stats: armorStats("pants", 1, "guardiao"),
    set: "aprendiz",
  },
  {
    id: "pants_calcas_remendadas",
    name: "Calças Remendadas",
    rank: 1,
    stats: armorStats("pants", 1, "robusto"),
  },
  {
    id: "pants_calcas_palha",
    name: "Calças de Palha",
    rank: 1,
    stats: armorStats("pants", 1, "agil"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "pants_calcas_couro",
    name: "Calças de Couro",
    rank: 2,
    stats: armorStats("pants", 2, "guardiao"),
  },
  {
    id: "pants_calcas_andarilho",
    name: "Calças do Andarilho",
    rank: 2,
    stats: armorStats("pants", 2, "robusto"),
    set: "andarilho",
  },
  {
    id: "pants_calcas_bandoleiro",
    name: "Calças do Bandoleiro",
    rank: 2,
    stats: armorStats("pants", 2, "agil"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "pants_grevas_ferro",
    name: "Grevas de Ferro",
    rank: 3,
    stats: armorStats("pants", 3, "guardiao"),
  },
  {
    id: "pants_calcas_malha",
    name: "Calças de Malha",
    rank: 3,
    stats: armorStats("pants", 3, "robusto"),
  },
  {
    id: "pants_calcas_escudeiro",
    name: "Calças do Escudeiro",
    rank: 3,
    stats: armorStats("pants", 3, "agil"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "pants_calcas_cruzado",
    name: "Calças do Cruzado",
    rank: 4,
    stats: armorStats("pants", 4, "guardiao"),
    set: "cruzado",
  },
  {
    id: "pants_grevas_bronze",
    name: "Grevas de Bronze",
    rank: 4,
    stats: armorStats("pants", 4, "robusto"),
  },
  {
    id: "pants_calcas_esgrimista",
    name: "Calças do Esgrimista",
    rank: 4,
    stats: armorStats("pants", 4, "agil"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "pants_calcas_reforcadas",
    name: "Calças Reforçadas",
    rank: 5,
    stats: armorStats("pants", 5, "guardiao"),
    set: "reforcado",
  },
  {
    id: "pants_grevas_batalha",
    name: "Grevas de Batalha",
    rank: 5,
    stats: armorStats("pants", 5, "robusto"),
  },
  {
    id: "pants_calcas_acrobata",
    name: "Calças do Acrobata",
    rank: 5,
    stats: armorStats("pants", 5, "agil"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "pants_grevas_prata",
    name: "Grevas de Prata",
    rank: 6,
    stats: armorStats("pants", 6, "guardiao"),
  },
  {
    id: "pants_calcas_jade",
    name: "Calças de Jade",
    rank: 6,
    stats: armorStats("pants", 6, "robusto"),
  },
  {
    id: "pants_calcas_lobo",
    name: "Calças do Lobo",
    rank: 6,
    stats: armorStats("pants", 6, "agil"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "pants_grevas_negras",
    name: "Grevas Negras",
    rank: 7,
    stats: armorStats("pants", 7, "guardiao"),
  },
  {
    id: "pants_calca_rei",
    name: "Calça do Rei",
    rank: 7,
    stats: armorStats("pants", 7, "robusto"),
    set: "rei",
  },
  {
    id: "pants_calcas_batedor",
    name: "Calças do Batedor",
    rank: 7,
    stats: armorStats("pants", 7, "agil"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "pants_grevas_obsidiana",
    name: "Grevas de Obsidiana",
    rank: 8,
    stats: armorStats("pants", 8, "guardiao"),
  },
  {
    id: "pants_calcas_hidra",
    name: "Calças da Hidra",
    rank: 8,
    stats: armorStats("pants", 8, "robusto"),
  },
  {
    id: "pants_calcas_etereas",
    name: "Calças Etéreas",
    rank: 8,
    stats: armorStats("pants", 8, "agil"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "pants_calcas_lendarias",
    name: "Calças Lendárias",
    rank: 9,
    stats: armorStats("pants", 9, "guardiao"),
    set: "lendario",
  },
  {
    id: "pants_calcas_tita",
    name: "Calças de Titã",
    rank: 9,
    stats: armorStats("pants", 9, "robusto"),
  },
  {
    id: "pants_grevas_falcao",
    name: "Grevas do Falcão",
    rank: 9,
    stats: armorStats("pants", 9, "agil"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "pants_calcas_transcendentes",
    name: "Calças Transcendentes",
    rank: 0,
    stats: armorStats("pants", 0, "guardiao"),
    set: "transcendente",
  },
  {
    id: "pants_grevas_astrais",
    name: "Grevas Astrais",
    rank: 0,
    stats: armorStats("pants", 0, "robusto"),
  },
  {
    id: "pants_calcas_vazio",
    name: "Calças do Vazio",
    rank: 0,
    stats: armorStats("pants", 0, "agil"),
  },
  // ── Rank EX · Divino ──
  {
    id: "pants_calcas_divinas",
    name: "Calças Divinas",
    rank: "EX",
    stats: armorStats("pants", "EX", "guardiao"),
    set: "divino",
  },
  {
    id: "pants_grevas_luz",
    name: "Grevas de Luz",
    rank: "EX",
    stats: armorStats("pants", "EX", "robusto"),
  },
  {
    id: "pants_calcas_graca",
    name: "Calças da Graça",
    rank: "EX",
    stats: armorStats("pants", "EX", "agil"),
  },
]);
