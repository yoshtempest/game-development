import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { SPECIAL_INTRO_DURATION } from "@/hooks/battle/modals/useSpecialIntro";
import { useSettings } from "@/hooks/settings/useSetting";
import type { MarceloBattleForm } from "@/utils/paths";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { clampX } from "@/gameRules/movement/clampX";
import { combatService } from "@/services/combat";
import { getAbilityDamageType } from "@/data/characters/abilities";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { SoundId } from "@/utils/audio/soundId";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";

import {
  GRAN_REY_CERO_COOLDOWN_MS,
  GRAN_REY_CERO_DAMAGE_RATIO,
  GRAN_REY_CERO_FADE_OUT_MS,
  GRAN_REY_CERO_LOCK_WINDOW_MS,
  GRAN_REY_CERO_MAX_TICKS,
  GRAN_REY_CERO_PUSH_PX,
  GRAN_REY_CERO_TICK_MS,
  GRAN_REY_CERO_TRAVEL_MS,
} from "@/data/characters/marcelo/granReyCero";
import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import {
  granReyCeroDistance,
  granReyCeroHits,
  type GranReyCeroEffect,
} from "@/gameRules/battle/characters/marcelo/granReyCero";

/** Natureza do corte pelo registro de habilidades (o GameData e o hook concordam). */
const GRAN_REY_CERO_DAMAGE_KIND = getAbilityDamageType("granReyCero");

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** Personagem do jogador (stats usadas para o dano base do corte). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos: também são cortados e empurrados. */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o corte é físico e não pode ignorá-las. */
  npcArmor: DamageArmor;
  /** O corte é habilidade ativa: paga só o vampirismo universal. */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: Dispatch<SetStateAction<number>>;
  giveSummonRewards: (npcClass: NPCClass) => void;
  spawnDamageNumber: (
    value: number,
    x: number,
    y: number,
    type: DamageType,
  ) => void;
  /** Registra dano causado pelo player (combo/energia amaldiçoada/passivas). */
  registerHitRef: RefObject<(damage: number) => void>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (habilities/granReyCero/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarceloBattleForm,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press arma a habilidade (carga da Expansão de Domínio). */
  onUsed?: () => void;
  /**
   * Redução de cooldown BRUTA (pontos percentuais), já somada de Técnica,
   * equipamento e título. O hook passa pela curva em `applyCooldownReduction`,
   * então nenhum caminho precisa saber a fórmula — e trocar a curva não toca
   * nenhum destes hooks.
   */
  cooldownReduction: number;
};

type GranReyCeroApi = {
  effect: GranReyCeroEffect | null;
  press: () => void;
  usable: boolean;
  /** Segundos restantes de recarga (para o rótulo do botão). */
  remaining: number;
};

/**
 * "Gran Rey Cero" do marcelo: o `press` abre o `SpecialIntro` (background
 * `habilities/granReyCero/` por 1s em slow-motion, com o personagem travado) e,
 * ao fim do intro, a lâmina nasce no personagem e corre 500px na direção em que
 * ele mira, com orçamento de 2s. Ao encostar num inimigo ela para de correr e
 * passa a rastejar devagar, aplicando 5% do dano base a cada 200ms em TODO
 * inimigo num raio de 50px da ponta de corte (não só no alvo: quem a lâmina
 * atravessa também sangra) e empurrando 5px para longe do jogador. As 10
 * instâncias fecham a lâmina; se ela perder o alvo antes, o orçamento de 2s
 * volta a correr e ela retoma o caminho até o fim.
 *
 * O movimento é por quadro (`requestAnimationFrame`) e não por `setInterval`
 * como o laser: aqui a posição precisa ser contínua, e o dano continua
 * atrelado a um acumulador de 200ms dentro do mesmo quadro.
 */
export function useGranReyCero({
  player,
  setPlayer,
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
  battleEndedRef,
  disabledRef,
  startSpecialIntro,
  playSound,
  onUsed,
  cooldownReduction,
}: Props): GranReyCeroApi {
  const { stopSound } = useSoundEffects();
  const { showAbilityIntro } = useSettings();
  const [effect, setEffect] = useState<GranReyCeroEffect | null>(null);
  const [remaining, setRemaining] = useState(0);

  const activeRef = useRef(false);
  const readyAtRef = useRef(0);
  const cooldownReductionRef = useLatestRef(cooldownReduction);
  const onUsedRef = useLatestRef(onUsed);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tempo acumulado correndo (sem alvo) e rastejando (com alvo), em ms. */
  const travelMsRef = useRef(0);
  const creepMsRef = useRef(0);
  /** Acumulador do tick de dano e contador de instâncias já aplicadas. */
  const tickAccRef = useRef(0);
  const ticksRef = useRef(0);
  /** Dano fracionário que ainda não virou inteiro. */
  const accRef = useRef(0);
  /** Origem/direção do corte, fixadas no disparo. */
  const originXRef = useRef(0);
  const tipYRef = useRef(0);
  const dirXRef = useRef(1);

  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const summonsRef = useLatestRef(summons);
  const effectRef = useLatestRef(effect);

  const baseDamage = useMemo(
    () => combatService.calculatePlayerDamage(char.stats.strength, playerClass),
    [char.stats.strength, playerClass],
  );
  const baseDamageRef = useLatestRef(baseDamage);
  const npcArmorRef = useLatestRef(npcArmor);

  const { usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "marcelo",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () => readyAtRef.current <= Date.now() && !activeRef.current,
  });

  const clearTimers = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (fadeTimerRef.current != null) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  /** Encerra a lâmina e restaura o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    stopSound("getsugaTenshou");
    clearTimers();
    travelMsRef.current = 0;
    creepMsRef.current = 0;
    tickAccRef.current = 0;
    ticksRef.current = 0;
    accRef.current = 0;
    setEffect(null);
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isGranReyCero(p.state)
        ? p
        : { ...p, state: "idle" },
    );
  }, [clearTimers, setPlayer, stopSound]);

  const finishRef = useLatestRef(finish);

  /**
   * Fase final: a lâmina para de machucar e de se mexer, e o fade-out roda
   * sozinho até o `finish`. Precisa existir separada do `finish` porque o
   * `finish` já derruba o estado do player (a sprite some junto com a lâmina).
   */
  const beginFade = useCallback(() => {
    if (fadeTimerRef.current != null) return;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const blade = effectRef.current;
    if (blade) {
      setEffect({ ...blade, fading: true });
    }
    fadeTimerRef.current = setTimeout(
      () => finishRef.current(),
      GRAN_REY_CERO_FADE_OUT_MS,
    );
  }, [effectRef, finishRef]);

  const beginFadeRef = useLatestRef(beginFade);

  /** Uma instância de dano: 5% do base em todo inimigo no raio, + empurrão. */
  const applyTick = useCallback(() => {
    const blade = effectRef.current;
    if (!blade || blade.fading) return;

    accRef.current += baseDamageRef.current * GRAN_REY_CERO_DAMAGE_RATIO;
    const applied = Math.floor(accRef.current);
    if (applied < 1) return;
    accRef.current -= applied;

    const push = blade.dirX * GRAN_REY_CERO_PUSH_PX;

    // NPC principal.
    const mainNpc = npcRef.current;
    if (granReyCeroHits(blade.tipX, blade.tipY, mainNpc.x, mainNpc.y)) {
      // O corte passa pela mesma redução das outras habilidades: o dano bruto
      // acima é só o acumulador do tick.
      const dmg = combatService.applyArmor(
        applied,
        GRAN_REY_CERO_DAMAGE_KIND,
        npcArmorRef.current,
      );
      setNpcHP((hp) => Math.max(0, hp - dmg));
      spawnDamageNumber(dmg, mainNpc.x, mainNpc.y, "npc");
      registerHitRef.current?.(dmg);
      applyVampirism({
        damage: dmg,
        source: "other",
        vampirism,
        playerMaxHp,
        setPlayerHP,
      });
      mainNpc.updateNpc({ x: clampX(mainNpc.x + push) });
    }

    // Summons: mesmo corte/empurrão; kill vira recompensa rare.
    let changed = false;
    let killed = false;
    const nextSummons = summonsRef.current.map((s) => {
      if (s.isDying || !granReyCeroHits(blade.tipX, blade.tipY, s.x, s.y)) {
        return s;
      }
      changed = true;
      const dmg = combatService.applyArmor(
        applied,
        GRAN_REY_CERO_DAMAGE_KIND,
        s.armor,
      );
      const newHp = Math.max(0, s.hp - dmg);
      spawnDamageNumber(dmg, s.x, s.y, "summon");
      registerHitRef.current?.(dmg);
      applyVampirism({
        damage: dmg,
        source: "other",
        vampirism,
        playerMaxHp,
        setPlayerHP,
      });
      if (newHp <= 0) {
        killed = true;
        return null;
      }
      return { ...s, hp: newHp, x: clampX(s.x + push) };
    });
    if (changed) {
      setSummons(nextSummons.filter((s): s is SummonedNpc => s != null));
    }
    if (killed) {
      giveSummonRewards("rare");
    }
  }, [
    baseDamageRef,
    effectRef,
    giveSummonRewards,
    npcArmorRef,
    npcRef,
    playerMaxHp,
    registerHitRef,
    setNpcHP,
    setPlayerHP,
    setSummons,
    spawnDamageNumber,
    summonsRef,
    vampirism,
  ]);

  const applyTickRef = useLatestRef(applyTick);

  /** Há inimigo perto da ponta de corte? Decide entre correr e rastejar. */
  const hasTarget = useCallback(() => {
    const blade = effectRef.current;
    if (!blade) return false;
    const mainNpc = npcRef.current;
    if (granReyCeroHits(blade.tipX, blade.tipY, mainNpc.x, mainNpc.y)) {
      return true;
    }
    return summonsRef.current.some(
      (s) => !s.isDying && granReyCeroHits(blade.tipX, blade.tipY, s.x, s.y),
    );
  }, [effectRef, npcRef, summonsRef]);

  const hasTargetRef = useLatestRef(hasTarget);

  /**
   * Ponteiro estável para o quadro atual. A função de quadro precisa reentrar
   * em si mesma (`requestAnimationFrame`) mas ainda ler os callbacks mais
   * recentes, então ela lê deste ref em vez de se referenciar direto — o que
   * tornaria a dependência circular. O ref nasce como no-op e é reescrito a
   * cada render, que é o mesmo truque do `useLatestRef`.
   */
  const frameRef = useLatestRef<() => void>(() => {});

  const frame = useCallback(() => {
    if (shouldCancelRef.current()) {
      finishRef.current();
      return;
    }

    const now = Date.now();
    const dt = now - lastFrameRef.current;
    lastFrameRef.current = now;

    const locked = hasTargetRef.current();

    // O orçamento de 2s só corre enquanto não há alvo; encostado, o tempo
    // vira rastejo. É isso que faz a lâmina "colar" no inimigo.
    if (locked) {
      creepMsRef.current += dt;
    } else {
      travelMsRef.current += dt;
      // Sem alvo não há dano: zera o acumulador para as instâncias
      // continuarem de 200 em 200 quando o corte voltar a encostar.
      tickAccRef.current = 0;
    }

    const distance = granReyCeroDistance(
      travelMsRef.current,
      creepMsRef.current,
    );
    const dirX = dirXRef.current;
    setEffect({
      tipX: originXRef.current + dirX * distance,
      tipY: tipYRef.current,
      dirX,
      fading: false,
    });

    if (locked) {
      tickAccRef.current += dt;
      if (tickAccRef.current >= GRAN_REY_CERO_TICK_MS) {
        tickAccRef.current -= GRAN_REY_CERO_TICK_MS;
        applyTickRef.current();
        ticksRef.current += 1;
        if (ticksRef.current >= GRAN_REY_CERO_MAX_TICKS) {
          beginFadeRef.current();
          return;
        }
      }
    } else if (travelMsRef.current >= GRAN_REY_CERO_TRAVEL_MS) {
      // Percurso cumprido sem alvo: a lâmina some ao chegar no fim.
      beginFadeRef.current();
      return;
    }

    // A trava de ação é reempurrada a cada quadro porque a duração total é
    // variável (2s de corrida + até 2s de rastejo) e não cabe num único
    // `freezeActionsUntil` calculado no disparo.
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      now + GRAN_REY_CERO_LOCK_WINDOW_MS,
    );

    rafRef.current = requestAnimationFrame(frameRef.current);
  }, [
    applyTickRef,
    beginFadeRef,
    finishRef,
    freezeActionsUntilRef,
    frameRef,
    hasTargetRef,
    shouldCancelRef,
  ]);

  frameRef.current = frame;

  /** Lança a lâmina: fixas origem/direção, troca o sprite e inicia o quadro. */
  const fire = useCallback(() => {
    // O intro (1s) terminou em pausa/fim de batalha: o cooldown já foi gasto no
    // `press`, mas a lâmina não sai.
    if (shouldCancelRef.current()) {
      activeRef.current = false;
      return;
    }

    const p = playerRef.current;
    // Direção do corte = direção de mira.
    const dirX = p.battleDirection === "left" ? -1 : 1;
    dirXRef.current = dirX;
    originXRef.current = p.x;
    tipYRef.current = p.y;
    travelMsRef.current = 0;
    creepMsRef.current = 0;
    tickAccRef.current = 0;
    ticksRef.current = 0;
    accRef.current = 0;
    lastFrameRef.current = Date.now();

    setEffect({ tipX: p.x, tipY: p.y, dirX, fading: false });
    setPlayer((pp) =>
      pp.mode !== "battle" ? pp : { ...pp, state: "granReyCero" },
    );
    playSound("getsugaTenshou");

    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + GRAN_REY_CERO_LOCK_WINDOW_MS,
    );

    clearTimers();
    rafRef.current = requestAnimationFrame(frameRef.current);
  }, [
    clearTimers,
    frameRef,
    freezeActionsUntilRef,
    playSound,
    playerRef,
    setPlayer,
    shouldCancelRef,
  ]);

  const fireRef = useLatestRef(fire);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    onUsedRef.current?.();
    activeRef.current = true;
    // O cooldown começa no `press`: o intro (1s em slow-motion) já é parte do
    // custo da habilidade, mesmo com a lâmina saindo depois.
    const cooldownMs = applyCooldownReduction(
      GRAN_REY_CERO_COOLDOWN_MS,
      cooldownReductionRef.current,
    );
    readyAtRef.current = Date.now() + cooldownMs;
    setRemaining(cooldownMs / 1000);
    // O lock do intro segura o personagem antes da lâmina (senão ele andaria
    // ou viraria de lado durante o slow-motion e o corte sairia na direção
    // errada). Com o intro desligado na config não há nada para segurar: a
    // lâmina sai na hora e o próprio `fire` trava o player durante o corte.
    if (showAbilityIntro) {
      freezeActionsUntilRef.current = Math.max(
        freezeActionsUntilRef.current,
        Date.now() + SPECIAL_INTRO_DURATION,
      );
    }

    // O specialIntro (1s) mostra o background da habilidade; a lâmina entra
    // logo depois. Se já houver um intro em andamento o callback não roda,
    // então o corte acontece na hora.
    if (!startSpecialIntro("marcelo", () => fireRef.current(), "granReyCero")) {
      fireRef.current();
    }
  }, [
    fireRef,
    cooldownReductionRef,
    freezeActionsUntilRef,
    onUsedRef,
    showAbilityIntro,
    startSpecialIntro,
    usableRef,
  ]);

  // Tick do cooldown restante do botão (20s). Com o menu de batalha aberto o
  // cooldown congela: a batalha pausada não regenera habilidade.
  const cooldownTick = useCooldownPauseTick({ readyAtRef, isPausedRef });

  useEffect(() => {
    const id = setInterval(() => {
      if (!cooldownTick()) return;
      setRemaining(Math.max(0, (readyAtRef.current - Date.now()) / 1000));
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [cooldownTick]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopSound("getsugaTenshou");
      activeRef.current = false;
    };
  }, [clearTimers, stopSound]);

  return { effect, press, usable: usableRef.current, remaining };
}
