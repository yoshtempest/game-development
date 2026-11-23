/**
 * Opções do `playerHit`: ajustes de golpes que não são o básico puro
 * (habilidades, dano contínuo de efeito em campo) e dos passos do combo básico.
 */
export type BasicHitOptions = {
  /**
   * Rende +1 de carga da Expansão de Domínio, como todo golpe básico? O dano
   * contínuo da esfera azul do natsuki passa `false`: a esfera já pagou os +5
   * do uso da habilidade e, ferindo de 100ms em 100ms, encheria a barra sozinha.
   * Ausente = rende (o comportamento de todo golpe).
   */
  grantCharge?: boolean;
  /**
   * Pontos percentuais somados ao `critRate` só neste golpe (o 3º golpe do
   * combo básico tem mais chance de crítico). Ausente = 0.
   */
  critBonus?: number;
  /**
   * Chamado depois que o golpe passou pelo prelúdio (cegueira, bloqueio,
   * confusão) e o dano foi aplicado no NPC principal. É o gancho para debuff
   * que só pode pegar quando o golpe conecta de fato — por isso não é
   * disparado em golpe bloqueado ou fora de alcance.
   */
  onLanded?: () => void;
};
