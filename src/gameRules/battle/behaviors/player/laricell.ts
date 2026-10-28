import type { BattleBehavior } from "@/utils/types/player/behavior";
import { gainSpecial } from "@/gameRules/battle/special";

export const laricellBehavior: BattleBehavior = {
  onBasicHit: ({
    damage,
    setNpcHP,
    setStacks,
    setDelicia,
    HITS_TO_SPECIAL,
    spawnPiercing,
  }) => {
    setNpcHP((hp: number) => Math.max(0, hp - damage));
    setStacks((s: number) => s + 1);
    setDelicia((d: number) => gainSpecial(d, HITS_TO_SPECIAL));
    spawnPiercing?.();
  },

  // O special não mexe mais na carga: a barra virou recurso da Expansão de
  // Domínio, e o especial tem cooldown próprio (botão na tela).
  onSpecialHit: ({ damage, setNpcHP, setStacks, triggerExplosion }) => {
    setNpcHP((hp: number) => Math.max(0, hp - damage));
    triggerExplosion?.();
    setStacks(0);
  },

  reset: ({ setStacks, setDelicia }) => {
    setStacks(0);
    setDelicia(0);
  },
};
