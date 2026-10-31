export type GenericButtonProps = {
  /** Dono da habilidade — o id sozinho não basta (`domainBurst` é compartilhado). */
  characterId: CharacterId;
  /** Id da ativa em `<char>/abilities.ts` (ex.: `killerQueen`, `blueSphere`). */
  abilityId: string;
  /** `standard` = clique com cooldown; `hold` = segurar/soltar com pointer capture. */
  behavior?: "standard" | "hold";
  /** Rótulo curto quando o nome do dado não cabe no botão (ex.: "EXPLOSÃO"). */
  label?: string;
  /** Cor da borda, rótulo e brilho. Ausente = accent do tema. */
  accent?: string;
  /** Arte de fundo opcional (path já resolvido por `asset()` no consumidor). */
  background?: string;
  ready?: boolean;
  remaining?: number;
  disabled?: boolean;
  /** `hold` cheio (ex.: Ki no máximo): pinta o botão de verde. */
  full?: boolean;
  /** Valor exibido no `hold` (energia atual). */
  energy?: number;
  onClick?: () => void;
  onPress?: () => void;
  onRelease?: () => void;
  className?: string;
};