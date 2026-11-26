import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { clampX } from "@/gameRules/movement/clampX";
import { combatService } from "@/services/combat";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { accumulateVampirism } from "@/gameRules/battle/vampirism/accumulateVampirism";

import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import { useMenuPause } from "@/hooks/battle/utilities/useMenuPause";
import { useMenuPauseShift } from "@/hooks/battle/utilities/useMenuPauseShift";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";
import { ProjectileConstants } from "@/data/projectile";
import {
  EMATRON_KAMEHAMEHA_DAMAGE_RATIO,
  EMATRON_KAMEHAMEHA_DURATION_MS,
  EMATRON_KAMEHAMEHA_FADE_MS,
  EMATRON_KAMEHAMEHA_PUSH_PX,
  EMATRON_KAMEHAMEHA_BEAM_HEIGHT,
  EMATRON_KAMEHAMEHA_STARTUP_MS,
  EMATRON_KAMEHAMEHA_TICK_MS,
  EMATRON_KAMEHAMEHA_CHARGING_MS,
} from "@/data/characters/ematron";
import {
  kamehamehaTop,
  type KamehamehaEffect,
} from "@/gameRules/battle/characters/ematron/kamehameha";
import {
  type KamehamehaApi,
  type KamehamehaProps,
  KAMEHAMEHA_DAMAGE_KIND,
  MAIN_TARGET_KEY,
} from "./constants";

/**
 * Kamehameha do Ematron: press dispara a carga — o personagem troca para o
 * sprite `chargingKamehameha.svg` e fica travado (2.8s); ao fim da carga ele
 * troca para o sprite `kamehameha.svg` e o `kamehamehaEffect` (2s) parte em
 * direção da face, causando 1% do dano base a cada 20ms e empurrando o inimigo,
 * com animação constante. Enquanto está no sprite de carga/disparo o player não
 * pode agir (freeze) e o efeito termina devolvendo o estado ao idle.
 *
 * Pausa (menu aberto): carga, entrada e fade-out são timers pausáveis, o tick
 * de dano não roda e o início do disparo (`shotStartRef`) recebe de volta o
 * tempo parado — sem isso os 2s do feixe venciam dentro do menu e ele sumia no
 * primeiro tick depois do unpause.
 */
export function useKamehameha({
  player,
  setPlayer,
  char,
  playerClass,
  npc,
  summons,
  setSummons,
  setNpcHP,
  npcArmor,
  vampirism,
  playerMaxHp,
  setPlayerHP,
  giveSummonRewards,
  spawnDamageNumber,
  registerHitRef,
  freezeActionsUntilRef,
  isPausedRef,
  isMenuOpenRef,
  battleEndedRef,
  disabledRef,
  playSound,
  onUsed,
}: KamehamehaProps): KamehamehaApi {
  const { stopSound } = useSoundEffects();
  const activeRef = useRef(false);
  const { isMenuOpen } = useMenuPause();
  const timers = usePausableTimers(isMenuOpen);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shotStartRef = useRef(0);
  const rawAccRef = useRef(0);
  const shownAccRef = useRef(new Map<string, number>());
  /**
   * Dano mitigado ainda não convertido em cura. Cada tick tira 1% do
   * dano base, pouco demais para curar sozinho com o arredondamento por tick. Ver
   * `accumulateVampirism` (issue #398).
   */
  const vampDamageAccRef = useRef(0);

  useMenuPauseShift(isMenuOpen, ({ pausedMs }) => {
    if (shotStartRef.current !== 0) shotStartRef.current += pausedMs;
  });

  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const effectRef = useLatestRef<KamehamehaEffect | null>(null);
  const onUsedRef = useLatestRef(onUsed);
  const playSoundRef = useLatestRef(playSound);
  const stopSoundRef = useLatestRef(stopSound);
  const setPlayerRef = useLatestRef(setPlayer);

  const baseDamage = useMemo(
    () => combatService.calculatePlayerDamage(char.stats.strength, playerClass),
    [char.stats.strength, playerClass],
  );
  const baseDamageRef = useLatestRef(baseDamage);
  const npcArmorRef = useLatestRef(npcArmor);

  const { usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "ematron",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  const clearTimers = useCallback(() => {
    timers.clear();
    if (tickTimerRef.current != null) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, [timers]);

  /** Encerra o feixe (fim do efeito ou cancelamento) e restaura o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    stopSoundRef.current("kamehameha");
    clearTimers();
    rawAccRef.current = 0;
    shownAccRef.current.clear();
    vampDamageAccRef.current = 0;
    shotStartRef.current = 0;

    // Animação de saída: transiciona para 'ending' e depois limpa.
    setEffect((prev) => (prev ? { ...prev, phase: "ending" } : null));
    timers.schedule(() => {
      setEffect(null);
      setPlayerRef.current((p) =>
        p.mode !== "battle" || !ALL_PREDICATES.isKamehameha(p.state)
          ? p
          : { ...p, state: "idle" },
      );
      freezeActionsUntilRef.current = Date.now();
    }, EMATRON_KAMEHAMEHA_FADE_MS);
  }, [clearTimers, freezeActionsUntilRef, setPlayerRef, stopSoundRef, timers]);

  const finishRef = useLatestRef(finish);

  const tickRef = useLatestRef(
    useCallback(() => {
      // Pausa o tick do feixe enquanto o menu estiver aberto: evita que o
      // kamehameha complete e desapareça durante a pausa.
      if (isMenuOpenRef.current) return;
      if (shouldCancelRef.current()) {
        finishRef.current();
        return;
      }
      const effectData = effectRef.current;
      if (!effectData) return;
      if (Date.now() - shotStartRef.current >= EMATRON_KAMEHAMEHA_DURATION_MS) {
        finishRef.current();
        return;
      }

      // ── Bruto do tick ──
      //
      // `rawAccRef` carrega a FRAÇÃO entre ticks: com dano base baixo o
      // incremento é menor que 1 e não pode ser jogado fora a cada tick.
      const rawTick =
        rawAccRef.current +
        baseDamageRef.current * EMATRON_KAMEHAMEHA_DAMAGE_RATIO;
      rawAccRef.current = 0;

      const top = kamehamehaTop(effectData.y);
      const bottom = top + EMATRON_KAMEHAMEHA_BEAM_HEIGHT;

      const reportTick = (
        key: string,
        dealt: number,
        x: number,
        y: number,
        type: DamageType,
      ) => {
        const acc = (shownAccRef.current.get(key) ?? 0) + dealt;
        const whole = Math.floor(acc);
        if (whole < 1) {
          shownAccRef.current.set(key, acc);
          return;
        }
        shownAccRef.current.set(key, acc - whole);
        spawnDamageNumber(whole, x, y, type);
        registerHitRef.current?.(whole);
      };

      /** Cura em lote pelo funil único: ver `vampDamageAccRef`. */
      const healFromHit = (dealt: number) => {
        vampDamageAccRef.current = accumulateVampirism({
          pending: vampDamageAccRef.current,
          damage: dealt,
          source: "other",
          vampirism,
          playerMaxHp,
          setPlayerHP,
        });
      };

      // NPC principal: dano + empurrão para longe do jogador (clampado).
      // O feixe pode ir do personagem até a borda em qualquer direção, então a
      // faixa horizontal é sempre [min(fromX,toX), max(fromX,toX)] — a ordem
      // dos extremos não pode decidir quem sofre dano (regra dos lasers).
      const mainNpc = npcRef.current;
      const blastMinX = Math.min(effectData.fromX, effectData.toX);
      const blastMaxX = Math.max(effectData.fromX, effectData.toX);
      if (mainNpc.y >= top && mainNpc.y <= bottom) {
        const dir = mainNpc.x >= playerRef.current.x ? 1 : -1;
        const inBlast = mainNpc.x >= blastMinX && mainNpc.x <= blastMaxX;
        if (inBlast) {
          const dmg = atLeastMinDamage(
            combatService.applyArmor(
              rawTick,
              KAMEHAMEHA_DAMAGE_KIND,
              npcArmorRef.current,
            ),
          );
          setNpcHP((hp) => Math.max(0, hp - dmg));
          healFromHit(dmg);
          reportTick(MAIN_TARGET_KEY, dmg, mainNpc.x, mainNpc.y, "npc");
          mainNpc.updateNpc({
            x: clampX(mainNpc.x + dir * EMATRON_KAMEHAMEHA_PUSH_PX),
          });
        }
      }

      // Summons inimigos: mesmo dano/empurrão; kill vira recompensa rare.
      let changed = false;
      let killed = false;
      const nextSummons = summonsRef.current.map((s) => {
        if (
          s.isDying ||
          s.y < top ||
          s.y > bottom ||
          s.x < blastMinX ||
          s.x > blastMaxX
        ) {
          return s;
        }
        changed = true;
        const dmg = atLeastMinDamage(
          combatService.applyArmor(
            rawTick,
            KAMEHAMEHA_DAMAGE_KIND,
            s.armor as DamageArmor,
          ),
        );
        const newHp = Math.max(0, s.hp - dmg);
        healFromHit(dmg);
        reportTick(s.id, dmg, s.x, s.y, "summon");
        if (newHp <= 0) {
          killed = true;
          return null;
        }
        const dir = s.x >= playerRef.current.x ? 1 : -1;
        return {
          ...s,
          hp: newHp,
          x: clampX(s.x + dir * EMATRON_KAMEHAMEHA_PUSH_PX),
        };
      });
      if (changed) {
        const alive = nextSummons.filter((s): s is SummonedNpc => s != null);
        const aliveIds = new Set(alive.map((s) => s.id));
        for (const key of shownAccRef.current.keys()) {
          if (key !== MAIN_TARGET_KEY && !aliveIds.has(key)) {
            shownAccRef.current.delete(key);
          }
        }
        setSummons(alive);
      }
      if (killed) {
        giveSummonRewards("rare");
      }
    }, [
      baseDamageRef,
      effectRef,
      finishRef,
      giveSummonRewards,
      isMenuOpenRef,
      npcArmorRef,
      npcRef,
      playerMaxHp,
      playerRef,
      registerHitRef,
      setNpcHP,
      setPlayerHP,
      setSummons,
      shouldCancelRef,
      spawnDamageNumber,
      summonsRef,
      vampirism,
    ]),
  );

  const fire = useCallback(() => {
    if (shouldCancelRef.current()) {
      finishRef.current();
      return;
    }
    const p = playerRef.current;
    const isFacingLeft = p.battleDirection === "left";
    // O feixe sempre surge do personagem na direção que ele olha.
    // - facing right: do player para a direita (MAP_WIDTH)
    // - facing left: do player para a esquerda (0)
    // Garante-se que o feixe emerge do personagem, não da borda da tela.
    shotStartRef.current = Date.now();
    setEffect({
      fromX: p.x,
      toX: isFacingLeft ? 0 : ProjectileConstants.MAP_WIDTH,
      y: p.y,
      facing: isFacingLeft ? "left" : "right",
      phase: "starting",
    });
    setPlayerRef.current((pp) =>
      pp.mode !== "battle" ? pp : { ...pp, state: "kamehameha" },
    );
    // Define o freeze para a fase de efeito (2s), substituindo o freeze da carga
    freezeActionsUntilRef.current = Date.now() + EMATRON_KAMEHAMEHA_DURATION_MS;
    // O som do feixe fica em loop enquanto o kamehameha estiver ativo (começa
    // no press, para no finish).

    clearTimers();

    // Transição de 'starting' para 'active' após a animação de entrada.
    timers.schedule(() => {
      setEffect((prev) => (prev ? { ...prev, phase: "active" } : null));
    }, EMATRON_KAMEHAMEHA_STARTUP_MS);

    tickTimerRef.current = setInterval(
      tickRef.current,
      EMATRON_KAMEHAMEHA_TICK_MS,
    );
  }, [
    clearTimers,
    finishRef,
    freezeActionsUntilRef,
    playerRef,
    setPlayerRef,
    shouldCancelRef,
    tickRef,
    timers,
  ]);

  const fireRef = useLatestRef(fire);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;
    playSoundRef.current("kamehameha", true);

    onUsedRef.current?.();
    activeRef.current = true;
    // O lock segura o personagem antes do disparo: o player fica imóvel no
    // sprite `chargingKamehameha.svg` pelos 2.8s da carga e travado no sprite
    // `kamehameha.svg` pelos 2s do efeito.
    freezeActionsUntilRef.current = Infinity;

    setPlayerRef.current((p) =>
      p.mode !== "battle" ? p : { ...p, state: "chargingKamehameha" },
    );

    timers.schedule(() => fireRef.current(), EMATRON_KAMEHAMEHA_CHARGING_MS);
  }, [
    fireRef,
    timers,
    freezeActionsUntilRef,
    onUsedRef,
    playSoundRef,
    setPlayerRef,
    usableRef,
  ]);

  useEffect(() => {
    const stopSound = stopSoundRef.current;
    return () => {
      clearTimers();
      stopSound("kamehameha");
      activeRef.current = false;
    };
  }, [clearTimers, stopSoundRef]);

  const [effect, setEffect] = useState<KamehamehaEffect | null>(null);

  // Mantém o ref sincronizado com o estado (a ref foi criada antes do state
  // por causa da ordem dos hooks); sem isso o tick não enxerga o feixe e o
  // Kamehameha não causa dano nem desaparece após a duração.
  effectRef.current = effect;

  return {
    effect,
    press,
    usable: usableRef.current,
  };
}
