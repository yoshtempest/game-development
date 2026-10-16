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
import { ProjectileConstants } from "@/data/projectile";
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
import {
  VASTOLORD_LASER_DAMAGE_RATIO,
  VASTOLORD_LASER_DURATION_MS,
  VASTOLORD_LASER_PUSH_PX,
  VASTOLORD_LASER_BEAM_HEIGHT,
  VASTOLORD_LASER_START_STACKS,
  VASTOLORD_LASER_TICK_MS,
} from "@/data/characters/marcelo/marshadowLaser";
import {
  vastolordLaserTop,
  type VastolordLaserBeam,
} from "@/gameRules/battle/characters/marcelo/vastolordLaser";

type Props = {
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  /** PLAYER_SIZE do layout — ancora o feixe na imagem renderizada do personagem. */
  PLAYER_SIZE: number;
  /** Forma Vastolord ativa (o botão só aparece/liga dentro dela). */
  vastolordActive: boolean;
  /** Personagem do jogador (stats usadas para o dano base do feixe). */
  char: { stats: { strength: number } };
  playerClass: PlayerClass;
  /** NPC principal (x/y lidos via latestRef; updateNpc aplica o empurrão). */
  npc: {
    x: number;
    y: number;
    updateNpc: (partial: Partial<NPCBattleState>) => void;
  };
  /** Summons inimigos (também sofrem dano e empurrão do feixe). */
  summons: SummonedNpc[];
  setSummons: Dispatch<SetStateAction<SummonedNpc[]>>;
  setNpcHP: Dispatch<SetStateAction<number>>;
  /** Colunas do NPC principal: o feixe é físico e não pode ignorá-las. */
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
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** specialIntro: abre o background da habilidade (vastolordForm/habilities/laser/...). */
  startSpecialIntro: (
    character: string,
    onActivate: () => void,
    ability?: string,
    form?: MarceloBattleForm,
  ) => boolean;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press arma a habilidade (carga da Expansão de Domínio). */
  onUsed?: () => void;
};

/** Natureza do feixe pelo registro de habilidades (o GameData e o hook concordam). */
const LASER_DAMAGE_KIND = getAbilityDamageType("vastolordLaser");

/** Chave do NPC principal no acumulador de apresentação (summons usam o id). */
const MAIN_TARGET_KEY = "main-npc";

type VastolordLaserApi = {
  beam: VastolordLaserBeam | null;
  press: () => void;
  usable: boolean;
  /** Stacks de Laser disponíveis na Forma Vastolord (cada kill adiciona +1). */
  stacks: number;
  /** +1 stack ao derrotar um inimigo (incluindo minions) na forma. */
  addCharge: () => void;
};

/**
 * Laser da Forma Vastolord do marcelo (uma vez por forma): o `press` consome o
 * stack e abre o `SpecialIntro` (background `vastolordForm/habilities/laser/`
 * por 1s em slow-motion, com o personagem travado); ao fim do intro o
 * personagem troca para o sprite `laser.svg` e um feixe (`vastolordLaser.svg`)
 * sai até a ponta do mapa na direção que ele mira, por 3s, centralizado na
 * imagem do personagem (centro do feixe alinhado ao centro vertical do sprite
 * renderizado). A cada 20ms, todo inimigo dentro da faixa do feixe sofre 1% do
 * dano base do personagem e é empurrado 10px para longe do jogador (parando
 * nas bordas via BATTLE_LIMITS). O jogador fica travado no disparo durante os
 * 3s; a habilidade só pode ser usada UMA vez por forma.
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
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    character: "marcelo",
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
    shotStartRef.current = 0;
    setBeam(null);
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isLaser(p.state)
        ? p
        : { ...p, state: "idle" },
    );
  }, [clearTimer, setPlayer, stopSound]);

  const finishRef = useLatestRef(finish);

  /** +1 stack de Laser por inimigo derrotado durante a Forma Vastolord. */
  const addCharge = useCallback(() => {
    setLaserStacks((s) => s + 1);
  }, []);

  const tickRef = useLatestRef(
    useCallback(() => {
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

      // NPC principal: dano + empurrão para longe do jogador (clampado).
      const mainNpc = npcRef.current;
      if (
        mainNpc.y >= top &&
        mainNpc.y <= bottom &&
        mainNpc.x >= fromX &&
        mainNpc.x <= toX
      ) {
        const dmg = atLeastMinDamage(
          combatService.applyArmor(
            rawTick,
            LASER_DAMAGE_KIND,
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
          s.x < fromX ||
          s.x > toX
        ) {
          return s;
        }
        changed = true;
        const dmg = atLeastMinDamage(
          combatService.applyArmor(rawTick, LASER_DAMAGE_KIND, s.armor),
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
      return;
    }
    rawAccRef.current = 0;
    shownAccRef.current.clear();
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
    });
    setPlayer((pp) => (pp.mode !== "battle" ? pp : { ...pp, state: "laser" }));
    // O som do feixe fica em loop enquanto o laser estiver ativo.
    playSound("laser", true);

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
        "marcelo",
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
