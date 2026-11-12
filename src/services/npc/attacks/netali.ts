import { DefaultNpcAttack } from "@/services/npc/npcAttack";

/**
 * Netali, a irmã planetária que grita "VERB TO BE". Ela só existe em batalha
 * como companheira da Marquesa (`BATTLE_COMPANIONS`), então quem move e faz
 * ela atacar é a IA de summons (`useSummonAI`) — o grito que confunde está em
 * `SUMMON_SHOUTS`. Este registro existe porque todo `NpcType` precisa de um
 * ataque; ele só roda se a Netali um dia virar NPC principal de uma batalha.
 */
export class NetaliAttack extends DefaultNpcAttack {
  constructor() {
    super("netali");
  }
}
