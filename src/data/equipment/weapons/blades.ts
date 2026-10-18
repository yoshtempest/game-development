import { createEquipmentList } from "@/utils/equipment/createEquipmentList";
import { bladeStats } from "@/data/equipment/curves";

/**
 * Lâminas (arma de força) — 3 itens por rank (perfis aco/sangue/cortante
 * de `bladeStats`). Rank 9 tem 18 itens históricos redistribuídos entre os
 * três perfis (antes eram todos idênticos). Set transcendente (r0) mora
 * numa lâmina.
 */
export const BLADES = createEquipmentList("weapon", [
  // ── Rank 1 · Mequetrefe ──
  {
    id: "weapon_espada_ferro",
    name: "Espada de Ferro",
    rank: 1,
    stats: bladeStats(1, "aco"),
  },
  {
    id: "weapon_caneta_azul",
    name: "Caneta Azul",
    rank: 1,
    stats: bladeStats(1, "aco"),
  },
  {
    id: "weapon_bengala_juju",
    name: "Bengala de Juju",
    rank: 1,
    stats: bladeStats(1, "aco"),
  },
  // ── Rank 2 · Capenga ──
  {
    id: "weapon_faca_enferrujada",
    name: "Faca Enferrujada",
    rank: 2,
    stats: bladeStats(2, "aco"),
  },
  {
    id: "weapon_espada_curta",
    name: "Espada Curta",
    rank: 2,
    stats: bladeStats(2, "aco"),
  },
  {
    id: "weapon_lanca_torta",
    name: "Lança Torta",
    rank: 2,
    stats: bladeStats(2, "aco"),
  },
  // ── Rank 3 · Básico ──
  {
    id: "weapon_espada_aco",
    name: "Espada de Aço",
    rank: 3,
    stats: bladeStats(3, "aco"),
  },
  {
    id: "weapon_adaga_pesada",
    name: "Adaga Pesada",
    rank: 3,
    stats: bladeStats(3, "aco"),
  },
  {
    id: "weapon_machado_lenhador",
    name: "Machado de Lenhador",
    rank: 3,
    stats: bladeStats(3, "aco"),
  },
  // ── Rank 4 · Modesto ──
  {
    id: "weapon_espada_mercenario",
    name: "Espada do Mercenário",
    rank: 4,
    stats: bladeStats(4, "aco"),
  },
  {
    id: "weapon_cutelo_sanguinario",
    name: "Cutelo Sanguinário",
    rank: 4,
    stats: bladeStats(4, "sangue"),
  },
  {
    id: "weapon_lamina_cortante",
    name: "Lâmina Cortante",
    rank: 4,
    stats: bladeStats(4, "cortante"),
  },
  // ── Rank 5 · Excepcional ──
  {
    id: "weapon_espada_rei",
    name: "Espada do Rei",
    rank: 5,
    stats: bladeStats(5, "sangue"),
  },
  {
    id: "weapon_espada_batalha",
    name: "Espada de Batalha",
    rank: 5,
    stats: bladeStats(5, "aco"),
  },
  {
    id: "weapon_tizona",
    name: "Tizona",
    rank: 5,
    stats: bladeStats(5, "cortante"),
  },
  // ── Rank 6 · Superior ──
  {
    id: "weapon_espada_prata",
    name: "Espada de Prata",
    rank: 6,
    stats: bladeStats(6, "aco"),
  },
  {
    id: "weapon_machado_guerra",
    name: "Machado de Guerra",
    rank: 6,
    stats: bladeStats(6, "sangue"),
  },
  {
    id: "weapon_espada_curva",
    name: "Espada Curva",
    rank: 6,
    stats: bladeStats(6, "cortante"),
  },
  // ── Rank 7 · Elite ──
  {
    id: "weapon_espada_longa",
    name: "Espada Longa",
    rank: 7,
    stats: bladeStats(7, "aco"),
  },
  {
    id: "weapon_machado_berserker",
    name: "Machado do Berserker",
    rank: 7,
    stats: bladeStats(7, "sangue"),
  },
  {
    id: "weapon_chapolim_hammer",
    name: "Marreta do Chapolim",
    rank: 7,
    stats: bladeStats(7, "cortante"),
  },
  // ── Rank 8 · Mítico ──
  {
    id: "weapon_espada_samurai",
    name: "Espada do Samurai",
    rank: 8,
    stats: bladeStats(8, "aco"),
  },
  {
    id: "weapon_zanpaku",
    name: "Zanpaku",
    rank: 8,
    stats: bladeStats(8, "sangue"),
  },
  {
    id: "weapon_claymore",
    name: "Claymore",
    rank: 8,
    stats: bladeStats(8, "cortante"),
  },
  // ── Rank 9 · Lendário ──
  {
    id: "weapon_excalibur",
    name: "Excalibur",
    rank: 9,
    stats: bladeStats(9, "aco"),
  },
  {
    id: "weapon_caliburn",
    name: "Caliburn",
    rank: 9,
    stats: bladeStats(9, "aco"),
  },
  {
    id: "weapon_keyblade",
    name: "Keyblade",
    rank: 9,
    stats: bladeStats(9, "aco"),
  },
  {
    id: "weapon_nichirin",
    name: "Nichirin",
    rank: 9,
    stats: bladeStats(9, "aco"),
  },
  {
    id: "weapon_wado_ichimonji",
    name: "Wado Ichimonji",
    rank: 9,
    stats: bladeStats(9, "aco"),
  },
  { id: "weapon_enma", name: "Enma", rank: 9, stats: bladeStats(9, "aco") },
  {
    id: "weapon_zangetsu",
    name: "Zangetsu",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_muramasa",
    name: "Muramasa",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_gunblade",
    name: "Gunblade",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_chaos_sword",
    name: "Lâminas do Caos",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_thor_hammer",
    name: "Martelo do Thor",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_leviathan_axe",
    name: "Machado Leviatã",
    rank: 9,
    stats: bladeStats(9, "sangue"),
  },
  {
    id: "weapon_buster_sword",
    name: "Buster Sword",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  {
    id: "weapon_death_scythe",
    name: "Foice da Morte",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  {
    id: "weapon_dragon_slayer",
    name: "Dragon Slayer",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  {
    id: "weapon_tessaiga",
    name: "Tessaiga",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  {
    id: "weapon_dark_repulser",
    name: "Dark Repulser",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  {
    id: "weapon_escanor_axe",
    name: "Machado do Sol",
    rank: 9,
    stats: bladeStats(9, "cortante"),
  },
  // ── Rank 0 · Transcendente ──
  {
    id: "weapon_lamina_transcendente",
    name: "Lâmina Transcendente",
    rank: 0,
    stats: bladeStats(0, "aco"),
    set: "transcendente",
  },
  {
    id: "weapon_machado_abismo",
    name: "Machado do Abismo",
    rank: 0,
    stats: bladeStats(0, "sangue"),
  },
  {
    id: "weapon_lamina_vazio",
    name: "Lâmina do Vazio",
    rank: 0,
    stats: bladeStats(0, "cortante"),
  },
  // ── Rank EX · Divino ──
  {
    id: "weapon_lamina_divina",
    name: "Lâmina Divina",
    rank: "EX",
    stats: bladeStats("EX", "aco"),
  },
  {
    id: "weapon_foice_deuses",
    name: "Foice dos Deuses",
    rank: "EX",
    stats: bladeStats("EX", "sangue"),
  },
  {
    id: "weapon_lamina_juizo",
    name: "Lâmina do Juízo",
    rank: "EX",
    stats: bladeStats("EX", "cortante"),
  },
]);
