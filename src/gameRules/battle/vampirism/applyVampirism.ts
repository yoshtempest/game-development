/**
 * Vampirismo — regra única de cura por dano causado.
 *
 * São dois modelos, e a diferença é *quais golpes pagam*:
 *
 * - `vampirism` (normal): só o ATAQUE BÁSICO. Special, dash e habilidades não
 *   contam, porque são golpes escolhidos, não o bico do personagem;
 * - `universalVampirism`: qualquer dano que o PRÓPRIO jogador cause — básico,
 *   special, dash, habilidades ativas e a reflexão de dano.
 *
 * Nenhum dos dois paga por dano de terceiro: os ticks de DoT (bleed, burn,
 * poison), o dano dos pets e o dos aliados não são golpes do jogador, e deixar
 * o vampirismo curando passivamente por estar perto de um alvo sangrando
 * esvaziaria o custo de qualquer build agressiva.
 *
 * Todo caminho de dano do jogador passa por `applyVampirism`. Um caminho que
 * calcula a cura por conta própria é bug — foi assim que o dash e as
 * habilidades contínuas (Gran Rey Cero, Laser Vastolord) ficaram sem cura.
 */

/** De onde veio o dano que está sendo convertido em cura. */
export type VampirismSource = "basic" | "other";

/** Os dois percentuais, já somados de equipamento. */
export type VampirismStats = {
  vampirism: number;
  universalVampirism: number;
};

export type ApplyVampirismParams = {
  /** Dano efetivamente calculado no golpe (não o HP restante do alvo). */
  damage: number;
  source: VampirismSource;
  vampirism: VampirismStats;
  playerMaxHp: number;
  /**
   * Só a forma de updater é exigida, e não `Dispatch<SetStateAction<number>>`:
   * a gameRule não deve saber que HP mora em `useState`, e assim o mesmo
   * formato serve para os hooks que guardam o setter num ref.
   */
  setPlayerHP: (updater: (hp: number) => number) => void;
};

/** Percentual que este golpe rende: o normal só entra no ataque básico. */
export function getVampirismPercent(
  source: VampirismSource,
  vampirism: VampirismStats,
): number {
  const normal = source === "basic" ? vampirism.vampirism : 0;
  return normal + vampirism.universalVampirism;
}

/**
 * Converte o dano em cura e aplica no HP respeitando o teto. Devolve quanto
 * curou, para o chamador que precisar (número de cura, efeitos colaterais).
 */
export function applyVampirism({
  damage,
  source,
  vampirism,
  playerMaxHp,
  setPlayerHP,
}: ApplyVampirismParams): number {
  if (damage <= 0) return 0;
  const percent = getVampirismPercent(source, vampirism);
  if (percent <= 0) return 0;

  const heal = Math.round((damage * percent) / 100);
  if (heal <= 0) return 0;

  setPlayerHP((hp) => Math.min(playerMaxHp, hp + heal));
  return heal;
}
