import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { armorStats } from "./curves/curves";

/**
 * Capacetes — 3 itens por rank (perfis guardião/robusto/ágil de
 * `armorStats`). Sets por rank: aprendiz (r1), reforcado (r5), paladino (r6),
 * rei (r7) e obsidiana (r8); r9 em diante têm set em outros slots.
 */
export const HELMETS = createEquipmentList("helmet", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "helmet_touca_algodao",
    name: "Touca de Algodão",
    rank: 1,
    stats: armorStats("helmet", 1, "guardiao"),
    set: "aprendiz",
  },
  {
    id: "helmet_chapeu_cendeiro",
    name: "Chapéu de Cendeiro",
    rank: 1,
    stats: armorStats("helmet", 1, "robusto"),
  },
  {
    id: "helmet_faixa_cabeca",
    name: "Faixa de Cabeça",
    rank: 1,
    stats: armorStats("helmet", 1, "agil"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "helmet_capacete_vigia",
    name: "Capacete de Vigia",
    rank: 2,
    stats: armorStats("helmet", 2, "guardiao"),
  },
  {
    id: "helmet_touca_rachada",
    name: "Touca Rachada",
    rank: 2,
    stats: armorStats("helmet", 2, "robusto"),
  },
  {
    id: "helmet_bandana_cinza",
    name: "Bandana Cinza",
    rank: 2,
    stats: armorStats("helmet", 2, "agil"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "helmet_capacete_ferro",
    name: "Capacete de Ferro",
    rank: 3,
    stats: armorStats("helmet", 3, "guardiao"),
  },
  {
    id: "helmet_yvel_glasses",
    name: "Yvel glasses",
    rank: 3,
    stats: armorStats("helmet", 3, "robusto"),
  },
  {
    id: "helmet_mascara_pano",
    name: "Máscara da Sentinela",
    rank: 3,
    stats: armorStats("helmet", 3, "agil"),
    set: "sentinela",
  },
  // ── Rank 4 · Modesto ──
  {
    id: "helmet_capacete_bronze",
    name: "Capacete de Bronze",
    rank: 4,
    stats: armorStats("helmet", 4, "guardiao"),
  },
  {
    id: "helmet_morriao_couro",
    name: "Morrião de Couro",
    rank: 4,
    stats: armorStats("helmet", 4, "robusto"),
  },
  {
    id: "helmet_chapeu_cacador",
    name: "Chapéu do Caçador",
    rank: 4,
    stats: armorStats("helmet", 4, "agil"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "helmet_elmo_reforcado",
    name: "Elmo Reforçado",
    rank: 5,
    stats: armorStats("helmet", 5, "guardiao"),
    set: "reforcado",
  },
  {
    id: "helmet_coroa_arcana",
    name: "Coroa Arcana",
    rank: 5,
    stats: armorStats("helmet", 5, "robusto"),
  },
  {
    id: "helmet_capacete_reluzente",
    name: "Capacete Reluzente",
    rank: 5,
    stats: armorStats("helmet", 5, "agil"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "helmet_elmo_paladino",
    name: "Elmo do Paladino",
    rank: 6,
    stats: armorStats("helmet", 6, "guardiao"),
    set: "paladino",
  },
  {
    id: "helmet_capacete_comandante",
    name: "Capacete de Comandante",
    rank: 6,
    stats: armorStats("helmet", 6, "robusto"),
  },
  {
    id: "helmet_mascara_espectral",
    name: "Máscara Espectral",
    rank: 6,
    stats: armorStats("helmet", 6, "agil"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "helmet_elmo_negro",
    name: "Elmo Negro",
    rank: 7,
    stats: armorStats("helmet", 7, "guardiao"),
  },
  {
    id: "helmet_coroa_rei",
    name: "Coroa do Rei",
    rank: 7,
    stats: armorStats("helmet", 7, "robusto"),
    set: "rei",
  },
  {
    id: "helmet_visor_elite",
    name: "Visor de Elite",
    rank: 7,
    stats: armorStats("helmet", 7, "agil"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "helmet_elmo_obsidiana",
    name: "Elmo de Obsidiana",
    rank: 8,
    stats: armorStats("helmet", 8, "guardiao"),
    set: "obsidiana",
  },
  {
    id: "helmet_coroa_basilisco",
    name: "Coroa do Basilisco",
    rank: 8,
    stats: armorStats("helmet", 8, "robusto"),
  },
  {
    id: "helmet_mascara_quimera",
    name: "Máscara Quimera",
    rank: 8,
    stats: armorStats("helmet", 8, "agil"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "helmet_elmo_draconico",
    name: "Elmo Dracônico",
    rank: 9,
    stats: armorStats("helmet", 9, "guardiao"),
  },
  {
    id: "helmet_tapa_olho_surica",
    name: "Tapa olho de Surica",
    rank: 9,
    stats: armorStats("helmet", 9, "robusto"),
  },
  {
    id: "helmet_mascara_fenix",
    name: "Máscara do Fênix",
    rank: 9,
    stats: armorStats("helmet", 9, "agil"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "helmet_elmo_transcendente",
    name: "Elmo Transcendente",
    rank: 0,
    stats: armorStats("helmet", 0, "guardiao"),
  },
  {
    id: "helmet_coroa_astral",
    name: "Coroa Astral",
    rank: 0,
    stats: armorStats("helmet", 0, "robusto"),
  },
  {
    id: "helmet_mascara_dimensional",
    name: "Máscara Dimensional",
    rank: 0,
    stats: armorStats("helmet", 0, "agil"),
  },
  // ── Rank EX · Divino ──
  {
    id: "helmet_capacete_serafico",
    name: "Capacete Seráfico",
    rank: "EX",
    stats: armorStats("helmet", "EX", "guardiao"),
  },
  {
    id: "helmet_coroa_divina",
    name: "Coroa Divina",
    rank: "EX",
    stats: armorStats("helmet", "EX", "robusto"),
  },
  {
    id: "helmet_halo_luz",
    name: "Halo de Luz",
    rank: "EX",
    stats: armorStats("helmet", "EX", "agil"),
  },
]);
