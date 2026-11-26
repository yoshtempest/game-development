import { DefaultNpcAttack } from "@/services/npc/npcAttack";

/**
 * Mahoraga ataca com o melee padrão (persegue e bate) de propósito: o
 * diferencial dele na issue #444 é ser **tanque**, não ter padrão de ataque
 * elaborado. A identidade de luta mora na adaptação a dano
 * (`gameRules/battle/mahoragaAdaptation.ts`), aplicada no `useSystem`.
 *
 * Decisão para revisar: golpes próprios (ex.: espada de extermínio) podem
 * entrar aqui depois sem mexer na adaptação.
 */
export class MahoragaAttack extends DefaultNpcAttack {}
