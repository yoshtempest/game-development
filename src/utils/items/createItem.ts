/**
 * Generic function to create items from a record.
 *
 * @param items - Record where keys are item IDs and values are item properties
 * @returns Object with item IDs as keys and items with resolved IDs
 *
 * @example
 * ```ts
 * const POTIONS = createItems({
 *   potion_health: { name: "Poção de Vida", heal: 50 },
 *   potion_mana: { name: "Poção de Mana", restoreMana: 30 },
 * });
 * ```
 */
export function createItems<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [id, { id, ...item }]),
  ) as {
    [K in keyof T]: T[K] & { id: K };
  };
}

/**
 * Helper to create consumable items (potions, energetics, foods).
 *
 * @param items - Record of consumable item properties
 * @returns Typed consumable items record
 *
 * @example
 * ```ts
 * const POTIONS = createPotions({
 *   small: { name: "Pocão Pequeno", heal: 20, mana: 10 },
 * });
 * ```
 */
export function createPotions<
  T extends Record<string, Record<string, unknown>>,
>(items: T) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "consumable" };
  };
}

/**
 * Helper to create food items.
 *
 * @param items - Record of food item properties
 * @returns Typed food items record
 *
 * @example
 * ```ts
 * const FOODS = createFoods({
 *   queijo_cabra: { name: "Queijo de Cabra", recoverHunger: 30 },
 * });
 * ```
 */
export function createFoods<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "consumable" };
  };
}

/**
 * Helper to create equipment items.
 *
 * @param items - Record of equipment item properties
 * @returns Typed equipment items record
 *
 * @example
 * ```ts
 * const SWORD = createEquipment({
 *   wooden_sword: { name: "Espada de Madeira", rank: "common", attack: 10 },
 * });
 * ```
 */
export function createEquipment<
  T extends Record<string, Record<string, unknown>>,
>(items: T) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "equipable" };
  };
}

/**
 * Helper to create key items (keys, cards, maps).
 *
 * @param items - Record of key item properties
 * @returns Typed key items record
 *
 * @example
 * ```ts
 * const KEYS = createKeys({
 *   bronze_key: { name: "Chave de Bronze", opens: "bronze_door" },
 * });
 * ```
 */
export function createKeys<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "keyitem" };
  };
}

/**
 * Helper to create currency items (coins, gems, etc.).
 *
 * @param items - Record of currency item properties
 * @returns Typed currency items record
 *
 * @example
 * ```ts
 * const COINS = createCoins({
 *   copper: { name: "Cobre", value: 1 },
 * });
 * ```
 */
export function createCoins<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "currency" };
  };
}

/**
 * Helper to create map/teleport items.
 *
 * @param items - Record of map item properties
 * @returns Typed map items record
 *
 * @example
 * ```ts
 * const MAPS = createMaps({
 *   town_map: { name: "Mapa da Cidade", area: "town" },
 * });
 * ```
 */
export function createMaps<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "mapitem" };
  };
}

/**
 * Helper to create card items.
 *
 * @param items - Record of card item properties
 * @returns Typed card items record
 *
 * @example
 * ```ts
 * const CARDS = createCards({
 *   rare_card: { name: "Carta Rara", effect: "draw2" },
 * });
 * ```
 */
export function createCards<T extends Record<string, Record<string, unknown>>>(
  items: T,
) {
  return createItems(items) as {
    [K in keyof T]: T[K] & { id: K; category: "battleitem" };
  };
}
