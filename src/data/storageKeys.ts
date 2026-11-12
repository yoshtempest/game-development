export const SFX_KEY = "game_sfx_volume";
export const BGM_KEY = "game_bgm_volume";
export const TOKEN_KEY = "jomasio_token";
export const FLAGS_KEY = "flags";
export const CHARACTER_PROGRESS_KEY = "characters_progress";
export const TITLES_KEY = "titles_data";
export const INVENTORY_KEY = "jomasio_inventory";
export const QUESTS_KEY = "jomasio_quests";
export const DIALOGUE_SPEED_KEY = "dialogue_speed";
export const COINS_KEY = "coins";
export const HYPER_COINS_KEY = "hyperCoins";
export const CHARACTER_KEY = "character";
export const PLAYER_CLASS_KEY = "player_class";
export const LIBRARY_RETURN_KEY = "library_return_position";
export const CAFETERIA_RETURN_KEY = "cafeteria_return_position";
export const DAILY_QUEST_DATE_KEY = "dailyQuestDate";
export const WEEKLY_QUEST_DATE_KEY = "weeklyQuestDate";
export const SHOW_QUEST_INDICATOR_KEY = "showQuestIndicator";
export const BESTIARY_KEY = "bestiary";
export const DAILY_CHEST_KEY = "daily_chest_last_open";
export const REWARDS_KEY = "rewards";
export const CLASS_KILLS_KEY = "npc_class_kills";
export const DEATHS_KEY = "deaths";
export const STREAK_KEY = "streak_stats";
export const BLOCKS_KEY = "blocks";
export const BATTLE_STATS_KEY = "battle_stats";
export const DAILY_REWARD_KEY = "daily_reward_last_claim";
export const MONTHLY_PASS_KEY = "monthly_pass";
export const PET_PROGRESS_KEY = "pet_progress";
export const PROFESSION_PROGRESS_KEY = "profession_progress";
export const TOMBSTONES_KEY = "tombstones";
export const JESO_FOOD_KEY = "jeso_food_last_delivery";
export const CHAR_UNLOCK_DATES_KEY = "char_unlock_dates";
export const DIFFICULTY_KEY = "difficulty";
export const VISITED_LOCATIONS_KEY = "visitedLocations";
export const SCENE_MEMORIES_KEY = "scene_memories_seen";
export const SHOW_COMBO_ACTION_KEY = "showComboAction";
export const SHOW_HIGHLIGHT_KEY = "showHighlight";
export const SHOW_ABILITY_INTRO_KEY = "showAbilityIntro";
export const SHARED_XP_KEY = "sharedXp";
export const REDEEMED_CARDS_KEY = "redeemed_cards";
export const GROUND_ITEMS_KEY = "ground_items";
export const FOOTBALLCOURT_DOGS_KEY = "footballcourt_dog_spots";
/** Sala online da aba (sessionStorage): sobrevive a reload, não a outra aba. */
export const ONLINE_ROOM_SESSION_KEY = "jomasio_online_room_id";
/** Parceiro de guilda da aba (sessionStorage), par do `ONLINE_ROOM_SESSION_KEY`. */
export const ONLINE_GUILD_SESSION_KEY = "jomasio_online_guild_id";
/**
 * Opt-in de notificações locais do PWA. Global (fora do slot): é preferência do
 * aparelho, não do save — a permissão do navegador também é por origem.
 */
export const NOTIFICATIONS_ENABLED_KEY = "jomasio_notifications_enabled";
/** Último instante (epoch ms) em que o jogo esteve visível; base do lembrete. */
export const LAST_PLAYED_KEY = "jomasio_last_played_at";
/** Último lembrete disparado (epoch ms), para não repetir a cada checagem. */
export const LAST_REMINDER_KEY = "jomasio_last_reminder_at";
