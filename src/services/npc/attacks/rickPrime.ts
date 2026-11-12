import { DefaultNpcAttack } from "@/services/npc/npcAttack";

/**
 * Rick Prime luta com o ataque padrão (persegue e dá melee) até ganhar um
 * kit próprio — a luta existe para fechar o ciclo de diálogos da issue #442,
 * não para balancear um chefe novo.
 */
export class RickPrimeAttack extends DefaultNpcAttack {}
