import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";

/** Personagem do jogador que carrega o Babidi Block. */
export const BABIDI_CHARACTER = "lucaua";

/** Fração do dano bloqueado que volta para o inimigo. */
export const BABIDI_BLOCK_REFLECT_PERCENT = 5;

/** Ganho no multiplicador de reflexo por nível de vantagem sobre o inimigo. */
export const BABIDI_REFLECT_BONUS_PER_LEVEL = 0.1;

/** Diferença de nível acima da qual o bloqueio mata o inimigo na hora. */
export const BABIDI_INSTAKILL_LEVEL_GAP = 20;

export type BabidiBlockReflect = {
  damage: number;
  isInstakill: boolean;
};

type BabidiBlockParams = {
  character: CharacterId;
  playerLevel: number;
  npcLevel: number;
  blockedDamage: number;
  npcHp: number;
};

/**
 * Dano que volta para o inimigo quando Babidi bloqueia um ataque.
 *
 * São 5% do dano que ele sofreria, multiplicado pela vantagem de nível dele
 * sobre o inimigo (+10% por nível). Passando de 20 níveis de vantagem o
 * bloqueio mata: o reflexo vale a vida restante do inimigo, para o número de
 * dano na tela ser o golpe que de fato o derrubou.
 *
 * Devolve null quando não é o Babidi, quando não houve dano bloqueado ou
 * quando o reflexo arredonda para zero — nesses casos nada é aplicado.
 */
export function getBabidiBlockReflect({
  character,
  playerLevel,
  npcLevel,
  blockedDamage,
  npcHp,
}: BabidiBlockParams): BabidiBlockReflect | null {
  if (character !== BABIDI_CHARACTER) return null;
  if (blockedDamage <= 0) return null;

  const levelGap = playerLevel - npcLevel;

  if (levelGap > BABIDI_INSTAKILL_LEVEL_GAP) {
    return { damage: Math.max(0, npcHp), isInstakill: true };
  }

  const multiplier = 1 + Math.max(0, levelGap) * BABIDI_REFLECT_BONUS_PER_LEVEL;
  // Piso como no resto do jogo: o reflexo que arredondava para 0 apagava o
  // golpe. `blockedDamage > 0` ja garante que ha o que refletir, entao aqui
  // nunca e "nao refletiu", e sempre "refletiu pouco".
  const damage = atLeastMinDamage(
    ((blockedDamage * BABIDI_BLOCK_REFLECT_PERCENT) / 100) * multiplier,
  );

  return { damage, isInstakill: false };
}
