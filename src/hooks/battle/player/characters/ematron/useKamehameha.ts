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
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { clampX } from "@/gameRules/movement/clampX";
import { combatService } from "@/services/combat";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { getAbilityDamageType } from "@/data/characters/abilities";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { SoundId } from "@/utils/audio/soundId";
import type { NPCBattleState, SummonedNpc } from "@/utils/types/npc/npc";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";
import { ProjectileConstants } from "@/data/projectile";
import {
  EMANUEL_KAMEHAMEHA_DAMAGE_RATIO,
  EMANUEL_KAMEHAMEHA_DURATION_MS,
  EMANUEL_KAMEHAMEHA_FADE_MS,
  EMANUEL_KAMEHAMEHA_PUSH_PX,
  EMANUEL_KAMEHAMEHA_BEAM_HEIGHT,
  EMANUEL_KAMEHAMEHA_STARTUP_MS,
  EMANUEL_KAMEHAMEHA_TICK_MS,
  EMANUEL_KAMEHAMEHA_CHARGING_MS,
} from "@/data/characters/emanuel/emanuel";
import {
  kamehamehaTop,
  type KamehamehaEffect,
} from "@/gameRules/battle/characters/emanuel/kamehameha";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** PLAYER_SIZE do layout — ancora o feixe na imagem renderizada do personagem. */
  PLAYER_SIZE: number;
  /** Personagem do jogador (stats usadas para o dano base do feixe). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos (também sofrem dano e empurrão do Kamehameha). */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o Kamehameha é físico e não pode ignorá-las. */
  npcArmor: DamageArmor;
  /** O feixe é habilidade ativa: paga só o vampirismo universal. */
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
  isMenuOpenRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a habilidade. */
  onUsed?: () => void;
};

/** Natureza do feixe pelo registro de habilidades (o GameData e o hook concordam). */
const KAMEHAMEHA_DAMAGE_KIND = getAbilityDamageType("kamehameha");

/** Chave do NPC principal no acumulador de apresentação (summons usam o id). */
const MAIN_TARGET_KEY = "main-npc";

type KamehamehaApi = {
  effect: KamehamehaEffect | null;
  press: () => void;
  usable: boolean;
};

/**
 * Kamehameha do Emanuel: press dispara a carga — o personagem troca para o
 * sprite `chargingKamehameha.svg` e fica travado (2.8s); ao fim da carga ele
 * troca para o sprite `kamehameha.svg` e o `kamehamehaEffect` (2s) parte em
 * direção da face, causando 1% do dano base a cada 20ms e empurrando o inimigo,
 * com animação constante. Enquanto está no sprite de carga/disparo o player não
 * pode agir (freeze) e o efeito termina devolvendo o estado ao idle.
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
}: Props): KamehamehaApi {
  const { stopSound } = useSoundEffects();
  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shotStartRef = useRef(0);
  const rawAccRef = useRef(0);
  const shownAccRef = useRef(new Map<string, number>());

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
    character: "emanuel",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  const clearTimers = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startupTimerRef.current != null) {
      clearTimeout(startupTimerRef.current);
      startupTimerRef.current = null;
    }
    if (fadeTimerRef.current != null) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (tickTimerRef.current != null) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  /** Encerra o feixe (fim do efeito ou cancelamento) e restaura o idle. */
  const finish = useCallback(() => {
    activeRef.current = false;
    stopSoundRef.current("kamehameha");
    clearTimers();
    rawAccRef.current = 0;
    shownAccRef.current.clear();
    shotStartRef.current = 0;

    // Animação de saída: transiciona para 'ending' e depois limpa.
    setEffect((prev) => (prev ? { ...prev, phase: "ending" } : null));
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      setEffect(null);
      setPlayerRef.current((p) =>
        p.mode !== "battle" || !ALL_PREDICATES.isKamehameha(p.state)
          ? p
          : { ...p, state: "idle" },
      );
      freezeActionsUntilRef.current = Date.now();
    }, EMANUEL_KAMEHAMEHA_FADE_MS);
  }, [clearTimers, freezeActionsUntilRef, setPlayerRef, stopSoundRef]);

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
      if (Date.now() - shotStartRef.current >= EMANUEL_KAMEHAMEHA_DURATION_MS) {
        finishRef.current();
        return;
      }

      // ── Bruto do tick ──
      //
      // `rawAccRef` carrega a FRAÇÃO entre ticks: com dano base baixo o
      // incremento é menor que 1 e não pode ser jogado fora a cada tick.
      const rawTick =
        rawAccRef.current + baseDamageRef.current * EMANUEL_KAMEHAMEHA_DAMAGE_RATIO;
      rawAccRef.current = 0;

      const top = kamehamehaTop(effectData.y);
      const bottom = top + EMANUEL_KAMEHAMEHA_BEAM_HEIGHT;

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

      // NPC principal: dano + empurrão para longe do jogador (clampado).
      const mainNpc = npcRef.current;
      if (mainNpc.y >= top && mainNpc.y <= bottom) {
        const dir = mainNpc.x >= playerRef.current.x ? 1 : -1;
        const inBlast =
          mainNpc.x >= effectData.fromX && mainNpc.x <= effectData.toX;
        if (inBlast) {
          const dmg = atLeastMinDamage(
            combatService.applyArmor(
              rawTick,
              KAMEHAMEHA_DAMAGE_KIND,
              npcArmorRef.current,
            ),
          );
          setNpcHP((hp) => Math.max(0, hp - dmg));
          applyVampirism({
            damage: dmg,
            source: "other",
            vampirism,
            playerMaxHp,
            setPlayerHP,
          });
          reportTick(MAIN_TARGET_KEY, dmg, mainNpc.x, mainNpc.y, "npc");
          mainNpc.updateNpc({
            x: clampX(mainNpc.x + dir * EMANUEL_KAMEHAMEHA_PUSH_PX),
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
          s.x < effectData.fromX ||
          s.x > effectData.toX
        ) {
          return s;
        }
        changed = true;
        const dmg = atLeastMinDamage(
          combatService.applyArmor(rawTick, KAMEHAMEHA_DAMAGE_KIND, s.armor),
        );
        const newHp = Math.max(0, s.hp - dmg);
        applyVampirism({
          damage: dmg,
          source: "other",
          vampirism,
          playerMaxHp,
          setPlayerHP,
        });
        reportTick(s.id, dmg, s.x, s.y, "summon");
        if (newHp <= 0) {
          killed = true;
          return null;
        }
        const dir = s.x >= playerRef.current.x ? 1 : -1;
        return {
          ...s,
          hp: newHp,
          x: clampX(s.x + dir * EMANUEL_KAMEHAMEHA_PUSH_PX),
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
    },
    [
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
    ],
  ),
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
      phase: "starting",
    });
    setPlayerRef.current((pp) =>
      pp.mode !== "battle" ? pp : { ...pp, state: "kamehameha" },
    );
    // Define o freeze para a fase de efeito (2s), substituindo o freeze da carga
    freezeActionsUntilRef.current = Date.now() + EMANUEL_KAMEHAMEHA_DURATION_MS;
    // O som do feixe fica em loop enquanto o kamehameha estiver ativo (começa
    // no press, para no finish).

    // Transição de 'starting' para 'active' após a animação de entrada.
    startupTimerRef.current = setTimeout(() => {
      startupTimerRef.current = null;
      setEffect((prev) => (prev ? { ...prev, phase: "active" } : null));
    }, EMANUEL_KAMEHAMEHA_STARTUP_MS);

    clearTimers();
    tickTimerRef.current = setInterval(
      tickRef.current,
      EMANUEL_KAMEHAMEHA_TICK_MS,
    );
  }, [
    clearTimers,
    finishRef,
    freezeActionsUntilRef,
    playerRef,
    setPlayerRef,
    shouldCancelRef,
    tickRef,
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

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fireRef.current();
    }, EMANUEL_KAMEHAMEHA_CHARGING_MS);
  }, [
    fireRef,
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

  return {
    effect,
    press,
    usable: usableRef.current,
  };
}
