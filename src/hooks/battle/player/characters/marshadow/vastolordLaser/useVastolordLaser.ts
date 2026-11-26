import type { Props, VastolordLaserApi } from "./types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { SPECIAL_INTRO_DURATION } from "@/hooks/battle/modals/specialIntro/useSpecialIntro";
import { useSettings } from "@/hooks/settings/useSetting";
import { ProjectileConstants } from "@/data/projectile";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { clampX } from "@/gameRules/movement/clampX";
import { combatService } from "@/services/combat";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { accumulateVampirism } from "@/gameRules/battle/vampirism/accumulateVampirism";
import { getAbilityDamageType } from "@/data/characters/abilities";

import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import { useMenuPause } from "@/hooks/battle/utilities/useMenuPause";
import { useMenuPauseShift } from "@/hooks/battle/utilities/useMenuPauseShift";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";
import {
  VASTOLORD_LASER_DAMAGE_RATIO,
  VASTOLORD_LASER_DURATION_MS,
  VASTOLORD_LASER_FADE_MS,
  VASTOLORD_LASER_PUSH_PX,
  VASTOLORD_LASER_BEAM_HEIGHT,
  VASTOLORD_LASER_START_STACKS,
  VASTOLORD_LASER_STARTUP_MS,
  VASTOLORD_LASER_TICK_MS,
} from "@/data/characters/marshadow/marshadowLaser";
import {
  vastolordLaserTop,
  type VastolordLaserBeam,
} from "@/gameRules/battle/characters/marshadow/vastolordLaser";

/** Natureza do feixe pelo registro de habilidades (o GameData e o hook concordam). */
const LASER_DAMAGE_KIND = getAbilityDamageType("vastolordLaser");

/** Chave do NPC principal no acumulador de apresentação (summons usam o id). */
const MAIN_TARGET_KEY = "main-npc";

/**
 * Laser da Forma Vastolord do marshadow (uma vez por forma): o `press` consome o
 * stack e abre o `SpecialIntro` (background `vastolordForm/habilities/laser/`
 * por 1s em slow-motion, com o personagem travado na pose de carga — estado
 * `preLaser`, sprite `preLaser.svg`); ao fim do intro o personagem troca para
 * o sprite de disparo (`laser`, `laser.svg`) e um feixe (`vastolordLaser.svg`)
 * sai até a ponta do mapa na direção que ele mira, por 3s, centralizado na
 * imagem do personagem (centro do feixe alinhado ao centro vertical do sprite
 * renderizado). A cada 20ms, todo inimigo dentro da faixa do feixe sofre 1% do
 * dano base do personagem e é empurrado 10px para longe do jogador (parando
 * nas bordas via BATTLE_LIMITS). O jogador fica travado no disparo durante os
 * 3s; a habilidade só pode ser usada UMA vez por forma.
 *
 * Animação em duas poses (issue #448): sem o `preLaser` o personagem ficava no
 * idle durante o intro e o feixe saía "do nada". Com o intro desligado na
 * config o `fire` roda na mesma passada do `press`, então a pose de carga é
 * sobrescrita antes de renderizar — o jogador pediu para pular a preparação.
 *
 * Pausa (menu aberto): o tick de dano não roda, entrada e fade-out são timers
 * pausáveis e o início do disparo (`shotStartRef`) recebe de volta o tempo
 * parado — sem isso os 3s do feixe venciam dentro do menu e ele sumia no
 * primeiro tick depois do unpause.
 */
export function useVastolordLaser({
  player,
  setPlayer,
  PLAYER_SIZE,
  vastolordActive,
  char,
  playerClass,
  npcArmor,
  npc,
  summons,
  setSummons,
  setNpcHP,
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
  startSpecialIntro,
  playSound,
  onUsed,
}: Props): VastolordLaserApi {
  const { stopSound } = useSoundEffects();
  const { showAbilityIntro } = useSettings();
  const [beam, setBeam] = useState<VastolordLaserBeam | null>(null);
  /** Stacks de Laser durante a forma: começa em 1, cada kill adiciona +1,
   * cada disparo consome 1. Reativo p/ o botão reabilitar após kills. */
  const [laserStacks, setLaserStacks] = useState(0);

  const activeRef = useRef(false);
  const shotStartRef = useRef(0);
  /** Dano bruto acumulado, fracionado, nunca arredondado. */
  const rawAccRef = useRef(0);
  /**
   * Dano JA mitigado acumulado POR ALVO, so para o numero/combo sairem
   * inteiros. Chaveado por id (summon) ou por `MAIN_TARGET_KEY` (chefe).
   */
  const shownAccRef = useRef(new Map<string, number>());
  /**
   * Dano mitigado ainda não convertido em cura: cada tick tira 1% do dano base,
   * pouco demais para curar sozinho (issue #398). Ver `accumulateVampirism`.
   */
  const vampDamageAccRef = useRef(0);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { isMenuOpen } = useMenuPause();
  const timers = usePausableTimers(isMenuOpen);
  useMenuPauseShift(isMenuOpen, ({ pausedMs }) => {
    if (shotStartRef.current !== 0) shotStartRef.current += pausedMs;
  });

  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const beamRef = useLatestRef(beam);
  const vastolordActiveRef = useLatestRef(vastolordActive);
  const onUsedRef = useLatestRef(onUsed);

  const baseDamage = useMemo(
    () => combatService.calculatePlayerDamage(char.stats.strength, playerClass),
    [char.stats.strength, playerClass],
  );
  const baseDamageRef = useLatestRef(baseDamage);
  const npcArmorRef = useLatestRef(npcArmor);

  const { usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "marshadow",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () => vastolordActive && laserStacks > 0,
    extraCancel: () => !vastolordActiveRef.current,
  });

  const clearTimer = useCallback(() => {
    if (tickTimerRef.current != null) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  /** Encerra o feixe (fim dos 3s ou cancelamento) e restaura o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    stopSound("laser");
    clearTimer();
    rawAccRef.current = 0;
    shownAccRef.current.clear();
    vampDamageAccRef.current = 0;
    shotStartRef.current = 0;

    // Animação de saída: transiciona para 'ending' e depois limpa.
    setBeam((prev) => (prev ? { ...prev, phase: "ending" } : null));
    timers.schedule(() => {
      setBeam(null);
      setPlayer((p) =>
        p.mode !== "battle" || !ALL_PREDICATES.isLaser(p.state)
          ? p
          : { ...p, state: "idle" },
      );
    }, VASTOLORD_LASER_FADE_MS);
  }, [clearTimer, setPlayer, stopSound, timers]);

  const finishRef = useLatestRef(finish);

  /** +1 stack de Laser por inimigo derrotado durante a Forma Vastolord. */
  const addCharge = useCallback(() => {
    setLaserStacks((s) => s + 1);
  }, []);

  const tickRef = useLatestRef(
    useCallback(() => {
      if (isMenuOpenRef.current) return;

      if (shouldCancelRef.current()) {
        finishRef.current();
        return;
      }
      if (Date.now() - shotStartRef.current >= VASTOLORD_LASER_DURATION_MS) {
        finishRef.current();
        return;
      }

      // ── Bruto do tick ──
      //
      // `rawAccRef` carrega a FRAÇÃO entre ticks: com dano base baixo o
      // incremento é menor que 1 e não pode ser jogado fora a cada tick.
      //
      // O valor do tick, porém, é local (`rawTick`) e TODOS os alvos na faixa
      // consomem o mesmo bruto. Zerar o acumulador dentro de cada ramo fazia o
      // primeiro alvo na faixa levar tudo e os demais receberem zero — o NPC
      // principal deixava os summons com `raw = 0`, e o piso de 0.01 por tick
      // explicava os 3 de dano dos minions contra os 200 do chefe.
      const rawTick =
        rawAccRef.current +
        baseDamageRef.current * VASTOLORD_LASER_DAMAGE_RATIO;
      rawAccRef.current = 0;

      const beamData = beamRef.current;
      if (!beamData) return;
      const { y: beamY, fromX, toX } = beamData;
      const top = vastolordLaserTop(beamY, PLAYER_SIZE);
      const bottom = top + VASTOLORD_LASER_BEAM_HEIGHT;
      // A faixa horizontal do feixe é sempre [min,max], independente da
      // direção em que o personagem mira (regra dos lasers).
      const blastMinX = Math.min(fromX, toX);
      const blastMaxX = Math.max(fromX, toX);

      /**
       * Fecha um tick: número de dano e combo só quando o dano MITIGADO
       * acumulado DESTE alvo vira um inteiro cheio.
       *
       * O HP já foi alterado com a fração exata acima; isto é só a
       * apresentação. Sem esse limite, `registerHit` (que faz `setComboCount`)
       * e o DOM do número de dano rodariam uma vez por tick, e o feixe geraria
       * milhares de nós em 3s.
       *
       * O acumulador é por alvo, não global: com um único acumulador o dano do
       * summon entrava na conta do chefe e o número aparecia na posição errada.
       */
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

      /**
       * Converte o dano do tick em cura pelo funil único (`applyVampirism`,
       * fonte `other` = só o universal, que a Forma Vastolord injeta), em lote
       * via `accumulateVampirism`.
       */
      const healFromBeam = (dealt: number) => {
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
      const mainNpc = npcRef.current;
      if (
        mainNpc.y >= top &&
        mainNpc.y <= bottom &&
        mainNpc.x >= blastMinX &&
        mainNpc.x <= blastMaxX
      ) {
        const dmg = atLeastMinDamage(
          combatService.applyArmor(
            rawTick,
            LASER_DAMAGE_KIND,
            npcArmorRef.current,
          ),
        );
        setNpcHP((hp) => Math.max(0, hp - dmg));
        healFromBeam(dmg);
        reportTick(MAIN_TARGET_KEY, dmg, mainNpc.x, mainNpc.y, "npc");
        const dir = mainNpc.x >= playerRef.current.x ? 1 : -1;
        mainNpc.updateNpc({
          x: clampX(mainNpc.x + dir * VASTOLORD_LASER_PUSH_PX),
        });
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
            LASER_DAMAGE_KIND,
            s.armor as DamageArmor,
          ),
        );
        const newHp = Math.max(0, s.hp - dmg);
        healFromBeam(dmg);
        reportTick(s.id, dmg, s.x, s.y, "summon");
        if (newHp <= 0) {
          killed = true;
          return null;
        }
        const dir = s.x >= playerRef.current.x ? 1 : -1;
        return {
          ...s,
          hp: newHp,
          x: clampX(s.x + dir * VASTOLORD_LASER_PUSH_PX),
        };
      });
      if (changed) {
        const alive = nextSummons.filter((s): s is SummonedNpc => s != null);
        // Poda das chaves dos summons que morreram: sem isto o Map de
        // apresentação cresce a cada kill da forma.
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
        addCharge();
      }
    }, [
      PLAYER_SIZE,
      addCharge,
      baseDamageRef,
      beamRef,
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

  /** Dispara o feixe: estado "laser", sprite, som em loop e o tick de dano. */
  const fire = useCallback(() => {
    // O intro (1s) terminou em pausa/fim de batalha ou a forma já expirou: o
    // stack foi gasto no `press`, mas o feixe não sai.
    if (shouldCancelRef.current()) {
      activeRef.current = false;
      setPlayer((pp) =>
        pp.mode !== "battle" || pp.state !== "preLaser"
          ? pp
          : { ...pp, state: "idle" },
      );
      return;
    }
    rawAccRef.current = 0;
    shownAccRef.current.clear();
    vampDamageAccRef.current = 0;
    const p = playerRef.current;
    shotStartRef.current = Date.now();
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + VASTOLORD_LASER_DURATION_MS,
    );
    // O feixe sai do personagem até a ponta do mapa na direção que ele mira.
    const isFacingLeft = p.battleDirection === "left";
    setBeam({
      fromX: isFacingLeft ? 0 : p.x,
      toX: isFacingLeft ? p.x : ProjectileConstants.MAP_WIDTH,
      y: p.y,
      facing: isFacingLeft ? "left" : "right",
      phase: "starting",
    });
    setPlayer((pp) => (pp.mode !== "battle" ? pp : { ...pp, state: "laser" }));
    // O som do feixe fica em loop enquanto o laser estiver ativo.
    playSound("laser", true);

    // Transição de 'starting' para 'active' após a animação de entrada.
    timers.schedule(() => {
      setBeam((prev) => (prev ? { ...prev, phase: "active" } : null));
    }, VASTOLORD_LASER_STARTUP_MS);

    clearTimer();
    tickTimerRef.current = setInterval(
      tickRef.current,
      VASTOLORD_LASER_TICK_MS,
    );
  }, [
    clearTimer,
    freezeActionsUntilRef,
    playSound,
    playerRef,
    setPlayer,
    shouldCancelRef,
    tickRef,
    timers,
  ]);

  const fireRef = useLatestRef(fire);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    onUsedRef.current?.();
    activeRef.current = true;
    // A stack é consumida no ato: o intro já conta como o custo, mesmo se o
    // feixe só sair um segundo depois.
    setLaserStacks((s) => Math.max(0, s - 1));
    setPlayer((pp) =>
      pp.mode !== "battle" ? pp : { ...pp, state: "preLaser" },
    );
    // O lock do intro segura o personagem antes do feixe (senão ele andaria/
    // viraria de lado durante o slow-motion e o feixe sairia na direção errada).
    // Com o intro desligado na config não há nada para segurar: o feixe sai
    // na hora e o próprio `fire` trava o player pelos 3s do feixe.
    if (showAbilityIntro) {
      freezeActionsUntilRef.current = Math.max(
        freezeActionsUntilRef.current,
        Date.now() + SPECIAL_INTRO_DURATION,
      );
    }

    // O specialIntro (1s em slow-motion) mostra o background do laser; o feixe
    // entra logo depois. Se já houver um intro em andamento o callback não
    // roda, então o disparo acontece na hora.
    if (
      !startSpecialIntro(
        "marshadow",
        () => fireRef.current(),
        "laser",
        "vastolordForm",
      )
    ) {
      fireRef.current();
    }
  }, [
    freezeActionsUntilRef,
    fireRef,
    onUsedRef,
    setPlayer,
    showAbilityIntro,
    startSpecialIntro,
    usableRef,
  ]);

  // Stacks: a forma libera VASTOLORD_LASER_START_STACKS ao entrar e zera ao sair.
  useEffect(() => {
    setLaserStacks(vastolordActive ? VASTOLORD_LASER_START_STACKS : 0);
  }, [vastolordActive]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopSound("laser");
      activeRef.current = false;
    };
  }, [clearTimer, stopSound]);

  return {
    beam,
    press,
    usable: usableRef.current,
    stacks: laserStacks,
    addCharge,
  };
}
