/**
 * Tempo (ms) que o sprite `pushed.svg` fica na tela depois de um empurrão.
 *
 * O knockback do jogo é instantâneo (o `x` salta de uma vez), então não existe
 * "duração física" para seguir: este é o tempo visual da pose, curto o bastante
 * para não esconder o próximo estado da IA (ataque, pulo) que volte a seguir.
 */
export const NPC_PUSHED_SPRITE_MS = 350;

/**
 * NPCs que **já têm** o sprite de empurrado (issue #244).
 *
 * Caminho esperado do arquivo: `public/assets/npcs/<categoria>/<npcType>/pushed.svg`
 * (a categoria vem de `NPC_CATEGORY`, resolvida por `npcPath`). Bosses com
 * fase própria de sprite (ex.: `deise`, `slimita`, `maurao` na fase 2) leem
 * `<npcType>/phase2/pushed.svg` pelo mesmo `getSpritePath`.
 *
 * É opt-in de propósito: sem o arquivo, trocar o `src` geraria um 404 a cada
 * golpe e o fallback genérico do `NPCBattle` cairia em `default.svg`, que não é
 * o sprite que o NPC estava mostrando. Adicione o `npcType` aqui só depois de
 * colocar o SVG na pasta.
 */
export const NPC_PUSHED_SPRITES: ReadonlySet<NpcType> = new Set<NpcType>([]);

/**
 * Indica se o NPC tem sprite de empurrado registrado.
 *
 * Recebe `string` porque o renderer (`NPCBattle`) é compartilhado com pet,
 * aliado e summon, que chegam com o tipo já alargado.
 *
 * @param npcType - Tipo do NPC renderizado.
 * @returns `true` quando `pushed.svg` existe para esse NPC.
 */
export function hasPushedSprite(npcType: string): boolean {
  return (NPC_PUSHED_SPRITES as ReadonlySet<string>).has(npcType);
}
