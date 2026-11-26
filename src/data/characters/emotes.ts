import type { CharacterId } from "@/data/characters/list";

/**
 * Personagens com emote/taunt em batalha. A lista é explícita porque o emote
 * só existe para quem tem os sprites `idle2.svg` e `idle3.svg` na pasta
 * `inFight/idle/` (natsuki em `natsuki/inFight/idle/`, marshadow em
 * `marshadow/inFight/default/idle/`): liberar o botão para outro personagem
 * sem esses arquivos renderizaria imagem quebrada (404).
 */
export const EMOTE_CHARACTERS: ReadonlySet<CharacterId> = new Set<CharacterId>(
  ["natsuki", "marshadow"],
);

/** Indica se o personagem tem os sprites do emote. */
export function hasEmote(character: CharacterId): boolean {
  return EMOTE_CHARACTERS.has(character);
}
