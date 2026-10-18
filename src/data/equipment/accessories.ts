import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { accessoryStats } from "./curves";

/**
 * Acessórios — 3 itens por rank (perfis guerreiro/arcano/nomade de
 * `accessoryStats`). Sets por rank: andarilho (r2), cruzado (r4), paladino
 * (r6), rei (r7), obsidiana (r8), lendário (r9), transcendente (r0) e
 * divino (EX).
 */
export const ACCESSORIES = createEquipmentList("accessory", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "accessory_anel_latao",
    name: "Anel de Latão",
    rank: 1,
    stats: accessoryStats(1, "guerreiro"),
  },
  {
    id: "accessory_pingente_mago",
    name: "Pingente do Mago",
    rank: 1,
    stats: accessoryStats(1, "arcano"),
  },
  {
    id: "accessory_colar_osso",
    name: "Colar de Osso",
    rank: 1,
    stats: accessoryStats(1, "nomade"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "accessory_anel_bronze",
    name: "Anel de Bronze",
    rank: 2,
    stats: accessoryStats(2, "guerreiro"),
  },
  {
    id: "accessory_colar_andarilho",
    name: "Colar do Andarilho",
    rank: 2,
    stats: accessoryStats(2, "arcano"),
    set: "andarilho",
  },
  {
    id: "accessory_amuleto_rachado",
    name: "Amuleto Rachado",
    rank: 2,
    stats: accessoryStats(2, "nomade"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "accessory_anel_prata",
    name: "Anel de Prata",
    rank: 3,
    stats: accessoryStats(3, "guerreiro"),
  },
  {
    id: "accessory_anel_mago",
    name: "Anel do Mago",
    rank: 3,
    stats: accessoryStats(3, "arcano"),
  },
  {
    id: "accessory_pingente_arquimago",
    name: "Pingente do Arquimago",
    rank: 3,
    stats: accessoryStats(3, "arcano"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "accessory_amuleto_cruzado",
    name: "Amuleto do Cruzado",
    rank: 4,
    stats: accessoryStats(4, "guerreiro"),
    set: "cruzado",
  },
  {
    id: "accessory_colar_cristal",
    name: "Colar de Cristal",
    rank: 4,
    stats: accessoryStats(4, "arcano"),
  },
  {
    id: "accessory_anel_pedra",
    name: "Anel de Pedra",
    rank: 4,
    stats: accessoryStats(4, "nomade"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "accessory_anel_ouro",
    name: "Anel de Ouro",
    rank: 5,
    stats: accessoryStats(5, "guerreiro"),
  },
  {
    id: "accessory_pingente_ouro",
    name: "Pingente de Ouro",
    rank: 5,
    stats: accessoryStats(5, "arcano"),
  },
  {
    id: "accessory_anel_safira",
    name: "Anel de Safira",
    rank: 5,
    stats: accessoryStats(5, "nomade"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "accessory_anel_paladino",
    name: "Anel do Paladino",
    rank: 6,
    stats: accessoryStats(6, "guerreiro"),
    set: "paladino",
  },
  {
    id: "accessory_pingente_jade",
    name: "Pingente de Jade",
    rank: 6,
    stats: accessoryStats(6, "arcano"),
  },
  {
    id: "accessory_colar_prata",
    name: "Colar de Prata",
    rank: 6,
    stats: accessoryStats(6, "nomade"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "accessory_anel_rei",
    name: "Anel do Rei",
    rank: 7,
    stats: accessoryStats(7, "guerreiro"),
    set: "rei",
  },
  {
    id: "accessory_anel_arquimago",
    name: "Anel do Arquimago",
    rank: 7,
    stats: accessoryStats(7, "arcano"),
  },
  {
    id: "accessory_amuleto_titanio",
    name: "Amuleto de Titânio",
    rank: 7,
    stats: accessoryStats(7, "nomade"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "accessory_anel_mithril",
    name: "Anel de Mithril",
    rank: 8,
    stats: accessoryStats(8, "guerreiro"),
  },
  {
    id: "accessory_amuleto_obsidiana",
    name: "Amuleto de Obsidiana",
    rank: 8,
    stats: accessoryStats(8, "arcano"),
    set: "obsidiana",
  },
  {
    id: "accessory_amuleto_sombrio",
    name: "Amuleto Sombrio",
    rank: 8,
    stats: accessoryStats(8, "nomade"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "accessory_anel_lendario",
    name: "Anel Lendário",
    rank: 9,
    stats: accessoryStats(9, "guerreiro"),
    set: "lendario",
  },
  {
    id: "accessory_pingente_real",
    name: "Pingente Real do Arquimago",
    rank: 9,
    stats: accessoryStats(9, "arcano"),
  },
  {
    id: "accessory_amuleto_dragao",
    name: "Amuleto do Dragão",
    rank: 9,
    stats: accessoryStats(9, "nomade"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "accessory_anel_transcendente",
    name: "Anel Transcendente",
    rank: 0,
    stats: accessoryStats(0, "guerreiro"),
    set: "transcendente",
  },
  {
    id: "accessory_pingente_astral",
    name: "Pingente Astral",
    rank: 0,
    stats: accessoryStats(0, "arcano"),
  },
  {
    id: "accessory_amuleto_vazio",
    name: "Amuleto do Vazio",
    rank: 0,
    stats: accessoryStats(0, "nomade"),
  },
  // ── Rank EX · Divino ──
  {
    id: "accessory_anel_divino",
    name: "Anel Divino",
    rank: "EX",
    stats: accessoryStats("EX", "guerreiro"),
  },
  {
    id: "accessory_pingente_serafico",
    name: "Pingente Seráfico",
    rank: "EX",
    stats: accessoryStats("EX", "arcano"),
  },
  {
    id: "accessory_amuleto_paraiso",
    name: "Amuleto do Paraíso",
    rank: "EX",
    stats: accessoryStats("EX", "nomade"),
  },
]);
