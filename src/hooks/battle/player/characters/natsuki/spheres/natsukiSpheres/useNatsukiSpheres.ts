import type { Props } from "./types";
import { useEffect } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { sphereEnergyCost } from "@/gameRules/battle/cursedEnergy";
import {
  BLUE_SPHERE_DRAIN_INTERVAL_MS,
  SPHERE_TICK_MS,
} from "@/data/characters/natsuki/natsuki";

import type { NatsukiSphereFocus } from "@/utils/types/character/natsuki";

import { useBlueSphere } from "@/hooks/battle/player/characters/natsuki/spheres/blueSphere/useBlueSphere";
import { usePurpleSphere } from "@/hooks/battle/player/characters/natsuki/spheres/purpleSphere/usePurpleSphere";
import { useRedSphere } from "@/hooks/battle/player/characters/natsuki/spheres/redSphere/useRedSphere";
import { useSphereCore } from "@/hooks/battle/player/characters/natsuki/spheres/sphereCore/useSphereCore";
import type { SphereBattle } from "@/hooks/battle/player/characters/natsuki/spheres/types";

/**
 * Esferas do natsuki (habilidades "blue"/"red"/"purple").
 *
 * As três compartilham a sequência de Setup (`habilities/Setup/`): `one.svg`
 * (cast) → `two.svg` (deslocamento) → `three.svg` (entrada em campo). Durante o
 * Setup o mundo congela (`freezeWorldSpec`) e o player fica travado; a esfera
 * surge na cabeça com blink e escala 0.1→1, desliza para a frente e então entra
 * em campo.
 *
 * Este hook é a composição: o ciclo comum (estado, Setup, dissipação, cast)
 * mora no `useSphereCore` e o que é de uma esfera só mora no hook dela —
 * `useBlueSphere` (persistente e controlada pelo joystick), `useRedSphere`
 * (arremesso que empurra) e `usePurpleSphere` (fusão que atravessa tudo). Aqui
 * fica apenas o tick que despacha cada fase para o seu dono e a API da cena.
 *
 * Com o menu aberto o tick e o dreno da blue param: a esfera fica congelada na
 * tela (o núcleo devolve o tempo parado ao início da fase) e a blue não gasta
 * energia — sem isso o dreno esvaziava a barra dentro do menu e a dissipava.
 */
export function useNatsukiSpheres({
  player,
  setPlayer,
  battle,
  npc,
  summons,
  setSummons,
  playerClass,
  progress,
  giveSummonRewards,
  battleManaRef,
  freezeActionsUntilRef,
  timeRef,
  refs,
  playSound,
  startSpecialIntro,
  onUsed,
  isPausedRef,
  isMenuOpenRef,
  disabledRef,
  battleEndedRef,
  specialDamageRatio,
  playerProjectileRef,
}: Props) {
  const core = useSphereCore({
    player,
    setPlayer,
    freezeActionsUntilRef,
    timeRef,
    playSound,
    startSpecialIntro,
    onUsed,
    battleManaRef,
    isPausedRef,
    disabledRef,
    battleEndedRef,
  });

  /** Contexto de combate (dano/summons) compartilhado pelas três esferas. */
  const sphereBattle: SphereBattle = {
    battle,
    npc,
    summons,
    setSummons,
    player,
    playerClass,
    progress,
    giveSummonRewards,
    specialDamageRatio,
    refs,
  };

  const blue = useBlueSphere({
    core,
    battle: sphereBattle,
    battleManaRef,
    playSound,
  });
  const red = useRedSphere({ core, battle: sphereBattle });
  const purple = usePurpleSphere({
    core,
    battle: sphereBattle,
    playerProjectileRef,
  });

  /**
   * Tick principal (16ms): cada fase é despachada para o dono dela. O Setup
   * (`spawning` → `moving`) e a dissipação são comuns às três e ficam no
   * núcleo; quem a esfera vira em campo depende da variante.
   */
  function tick() {
    if (isMenuOpenRef.current) return;

    const s = core.sphereRef.current;
    if (!s) return;

    if (core.shouldCancelRef.current()) {
      core.finish();
      return;
    }

    const now = Date.now();

    switch (s.phase) {
      // ── Fases de uma esfera só ──────────────────────────────
      case "junction":
        purple.tickJunction(s);
        return;

      case "controlled":
      case "parked":
        blue.tick(s);
        return;

      case "firing":
        if (s.variant === "purple") purple.tickFire(s, now);
        else red.tickFire(s, now);
        return;

      // ── Fases comuns às três (núcleo) ───────────────────────
      case "spawning":
      case "moving": {
        if (!core.tickSetup(s)) return;
        // Setup acabou: a esfera entra em campo pela regra da sua variante.
        if (s.variant === "blue") blue.enterControl();
        else if (s.variant === "purple") purple.enterFire();
        else red.enterFire();
        return;
      }

      case "dismissing":
        core.tickDismiss(s);
        return;
    }
  }

  const tickRef = useLatestRef(tick);
  const drainRef = useLatestRef(blue.drain);

  useEffect(() => {
    const id = setInterval(() => tickRef.current(), SPHERE_TICK_MS);
    return () => clearInterval(id);
  }, [tickRef]);

  /**
   * Dreno da blue em campo. Respeita a mesma pausa da batalha que o tick e a
   * regeneração do O Abençoado (`useStatusDots`): com o menu aberto (ou
   * qualquer outra pausa — intro, diálogo, rewind, câmera congelada) a esfera
   * fica parada, então não pode continuar consumindo energia amaldiçoada.
   */
  useEffect(() => {
    const id = setInterval(() => {
      if (isPausedRef.current || isMenuOpenRef.current) return;
      drainRef.current();
    }, BLUE_SPHERE_DRAIN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [drainRef, isPausedRef, isMenuOpenRef]);

  const sphere = core.sphere;
  const sphereFocus: NatsukiSphereFocus =
    sphere?.phase === "controlled" ? { x: sphere.x, y: sphere.y } : null;
  const castActive =
    sphere?.phase === "junction" ||
    sphere?.phase === "spawning" ||
    sphere?.phase === "moving";

  /**
   * O saldo cobre o custo de arremesso da esfera (red 10% / purple 25% da
   * energia MÁXIMA)? É o que desabilita o botão antes do clique; o `startCast`
   * reconfere e gasta de verdade. A blue não entra: o custo dela é o dreno.
   */
  function canAfford(variant: "red" | "purple") {
    const mana = battleManaRef.current;
    if (!mana) return false;
    return mana.playerMana >= sphereEnergyCost(variant, mana.playerMaxMana);
  }

  return {
    sphere,
    sphereFocus,
    castActive,
    purpleHole: purple.hole,
    bluePress: blue.press,
    blueUsable: blue.usable,
    redPress: red.press,
    redUsable: red.usable && canAfford("red"),
    purplePress: purple.press,
    purpleUsable: purple.usable && canAfford("purple"),
  };
}
