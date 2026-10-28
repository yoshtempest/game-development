/**
 * Opções do `playerHit` para golpes que não são o ataque básico do personagem
 * (habilidades, dano contínuo de efeito em campo).
 */
export type BasicHitOptions = {
  /**
   * Rende +1 de carga da Expansão de Domínio, como todo golpe básico? O dano
   * contínuo da esfera azul do natsuki passa `false`: a esfera já pagou os +5
   * do uso da habilidade e, ferindo de 100ms em 100ms, encheria a barra sozinha.
   * Ausente = rende (o comportamento de todo golpe).
   */
  grantCharge?: boolean;
};
