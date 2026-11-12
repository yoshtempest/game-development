/**
 * Marcos de nível do personagem (issue #485). Fonte única dos números: a
 * battle, o menu de Status e os gates legados (fúria do Samurion, ataque
 * carregado) leem daqui em vez de repetir literal no código.
 *
 * A tabela completa da issue é: nv.1 → habilidade 1, nv.5 → habilidade 2,
 * nv.10 → habilidade 3, nv.15 → passiva, nv.20 → sistema mercantil, nv.25 →
 * despertar, nv.40 → missão de melhoria, nv.50 → Expansão de Domínio, nv.60 e
 * nv.75 → passivas, nv.100 → transcender. Só os marcos que já têm sistema por
 * trás viram constante; os demais entram quando o sistema existir, para não
 * deixar número solto sem consumidor.
 */

/**
 * Nível em que cada slot de habilidade ativa (na ordem do registro
 * `<personagem>/abilities.ts`) é liberado. Personagem com mais ativas que
 * slots repete o último nível: a issue fala em 3 habilidades, mas Natsuki e
 * Ematron já nasceram com mais, e cortar habilidade existente seria regressão.
 */
export const ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS = [1, 5, 10] as const;

/** Nível em que a Expansão de Domínio (qualquer variante) é liberada. */
export const DOMAIN_EXPANSION_UNLOCK_LEVEL = 50;

/**
 * Ids de habilidade que são a Expansão de Domínio de algum personagem. O id
 * varia porque o efeito varia (burst, execute do Marshadow, Muryokusho do
 * Natsuki, Hakai do Ematron), mas o marco de nível é o mesmo.
 */
export const DOMAIN_EXPANSION_ABILITY_IDS: ReadonlySet<string> = new Set([
  "domainBurst",
  "domainExpansion",
  "muryokusho",
  "hakai",
]);

/** Nível a partir do qual o ataque carregado é liberado. */
export const CHARGE_ATTACK_MIN_LEVEL = 15;

/** Nível a partir do qual a fúria (berserk) do Samurion passa a valer. */
export const SAMURION_BERSERK_MIN_LEVEL = 20;
