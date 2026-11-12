/**
 * Sprite de uma postura do combo básico (issue #376): mesmo diretório do
 * `attack.svg` já resolvido pelo `resolveBattleSprite`, trocando só o nome do
 * arquivo (`attack1.svg`, `attack2.svg`, `attack3.svg`).
 *
 * Deriva do caminho do ataque em vez de montar um caminho novo porque cada
 * personagem guarda o golpe em pasta diferente (`attack/`, `attacks/`,
 * `<arma>/attack/`, `default/attack/`…) e essa decisão já mora no resolver.
 */
export function basicComboSpritePath(attackSrc: string, file: string): string {
  const slash = attackSrc.lastIndexOf("/");
  const dot = attackSrc.lastIndexOf(".");
  const extension = dot > slash ? attackSrc.slice(dot) : ".svg";
  return `${attackSrc.slice(0, slash + 1)}${file}${extension}`;
}
