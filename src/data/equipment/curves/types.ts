/**
 * Contrato das curvas de equipamento: os perfis ("flavors") que cada função de
 * `stats/` aceita e os slots que leem `ARMOR_CURVE`. Viver num arquivo próprio
 * evita que cada função redeclare as mesmas unions — quem importa uma função
 * de stats importa o perfil daqui.
 */

/** Os quatro slots que leem `ARMOR_CURVE` (um por pasta de equipamento). */
export type ArmorSlot = "helmet" | "chestplate" | "pants" | "boots";

/** Perfil de peça de armadura: `guardiao` (armadura cheia), `robusto` (~80% + vida), `agil` (~60% + meia vida + técnica). */
export type ArmorFlavor = "guardiao" | "robusto" | "agil";

/** Perfil de acessório: `guerreiro` (força+técnica+armadura cheia), `arcano` (espírito), `nomade` (só defesa e cooldown). */
export type AccessoryFlavor = "guerreiro" | "arcano" | "nomade";

/** Perfil de lâmina: `aco` (força+técnica), `sangue` (vampirismo+dano verdadeiro), `cortante` (dano verdadeiro+% vida máxima). */
export type BladeFlavor = "aco" | "sangue" | "cortante";

/** Perfil de arco: `longo` (técnica+força), `pontaria` (+dano verdadeiro), `perfurante` (+% vida máxima). */
export type BowFlavor = "longo" | "pontaria" | "perfurante";

/** Perfil de cetro: `runico` (espírito+escudo), `real` (espírito+força+vampirismo), `ancestral` (escudo+dano verdadeiro/% vida). */
export type StaffFlavor = "runico" | "real" | "ancestral";

/** Perfil de livro: `erudito` (espírito+cooldown), `selo` (espírito+escudo), `profecia` (espírito+dano verdadeiro/% vida). */
export type BookFlavor = "erudito" | "selo" | "profecia";
