import { useRef, useCallback, useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { PLAYER_CHARGE_DASH_COOLDOWN } from "@/data/cooldowns";
import { isPlayerInRange } from "@/gameRules/battle/range";
import { LUCAS_WEAPON_RANGES } from "@/data/characters/lucas/lucasWeapons";
import {
  DASH_DURATION,
  DASH_INTERVAL,
  DASH_STEP,
  BATTLE_LIMITS,
} from "@/gameRules/movement/constants";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import { getCharacterElementTypes } from "@/data/types/characterElementTypes";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import { combatService } from "@/services/combat";
import { applyVampirism } from "@/gameRules/battle/vampirism/applyVampirism";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { applyHitstop, type TimeEffect } from "@/gameRules/battle/time";

import { clampX } from "@/gameRules/movement/clampX";
type Props = {
  player: Player;
  npcX: number;
  npcY: number;
  npcType: string;
  npcArmor: DamageArmor;
  npcClass: NPCClass;
  char: { level: number; stats: { strength: number } };
  playerClass: PlayerClass;
  critRate: number;
  titleDamageBonus: number;
  elementDamageBonus: number;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  playerCooldown: React.RefObject<boolean>;
  timeRef: React.RefObject<TimeEffect[]>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  registerHitRef: React.RefObject<(damage: number) => void>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setPlayerState: (state: PlayerState) => void;
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  setDelicia: React.Dispatch<React.SetStateAction<number>>;
  hitsToSpecial: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  weapon?: LucasWeapon;
  /** Multiplicador da Forma Vastolord aplicado no dano do dash. */
  vastolordMultiplierRef?: React.RefObject<() => number>;
};

export function useChargeDash(props: Props) {
  const {
    char,
    playerClass,
    critRate,
    titleDamageBonus,
    elementDamageBonus,
    npcArmor,
    npcClass,
    playerCooldown,
    timeRef,
    spawnDamageRef,
    registerHitRef,
    setPlayer,
    setPlayerState,
    setNpcHP,
    hitsToSpecial,
    setSummons,
    vastolordMultiplierRef,
  } = props;

  const dashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hitTargetsRef = useRef(new Set<string>());

  const npcXRef = useLatestRef(props.npcX);
  const npcYRef = useLatestRef(props.npcY);
  const npcElementTypesRef = useLatestRef(getNpcElementTypes(props.npcType));
  const summonsRef = useLatestRef(props.summons);
  const setDeliciaRef = useLatestRef(props.setDelicia);
  const setPlayerHPRef = useLatestRef(props.setPlayerHP);
  const playerMaxHpRef = useLatestRef(props.playerMaxHp);
  const playerHpRef = useLatestRef(props.playerHP);
  const dashCharRef = useLatestRef(props.char);
  const vampirismRef = useLatestRef(props.vampirism);
  const weaponRef = useLatestRef(props.weapon);
  const wasCritRef = useRef(false);

  const cleanup = useCallback(() => {
    if (dashIntervalRef.current) {
      clearInterval(dashIntervalRef.current);
      dashIntervalRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  function execute(player: Player) {
    cleanup();
    hitTargetsRef.current = new Set();

    const dir = player.battleDirection;
    const steps = Math.round(DASH_DURATION / DASH_INTERVAL);
    let stepCount = 0;
    const dashY = player.y;
    const dashCharacter = player.character;

    const buildDashTargets = () => {
      const targets: { id: string; x: number; y: number }[] = [];

      if (npcXRef.current && npcYRef.current) {
        targets.push({
          id: "main",
          x: npcXRef.current,
          y: npcYRef.current,
        });
      }

      for (const summon of summonsRef.current) {
        if (summon.hp > 0 && !summon.isDying) {
          targets.push({ id: summon.id, x: summon.x, y: summon.y });
        }
      }

      return targets;
    };

    const applyDashHit = (
      target: { id: string; x: number; y: number },
      critDmg: number,
      critType: DamageType,
    ) => {
      hitTargetsRef.current.add(target.id);
      setDeliciaRef.current((d) => Math.min(d + 1, hitsToSpecial));

      if (target.id === "main") {
        // Mesma tipagem do funil de melee (`computeHitDamage`): dash não pode
        // ser o único golpe que ignora a tabela elemental.
        const elementMultiplier = combatService.getElementMultiplier(
          getCharacterElementTypes(dashCharacter),
          npcElementTypesRef.current,
        );
        const vastolordMult = vastolordMultiplierRef?.current?.() ?? 1;
        const dmg = atLeastMinDamage(
          combatService.calculateDamageToNpc(critDmg, "physical", npcArmor) *
            elementMultiplier *
            elementDamageBonus *
            vastolordMult,
        );
        setNpcHP((hp) => Math.max(0, hp - dmg));
        // O dash é golpe de carga, não o ataque básico: paga só o universal.
        applyVampirism({
          damage: dmg,
          source: "other",
          vampirism: vampirismRef.current,
          playerMaxHp: playerMaxHpRef.current,
          setPlayerHP: setPlayerHPRef.current,
        });
        spawnDamageRef.current?.(
          dmg,
          target.x,
          target.y,
          critType === "crit" ? "crit" : "charge",
        );
        registerHitRef.current?.(dmg);
        timeRef.current = applyHitstop(timeRef.current, 80);
        playerCooldown.current = false;
        setTimeout(() => {
          playerCooldown.current = true;
        }, PLAYER_CHARGE_DASH_COOLDOWN);
      } else {
        const summon = summonsRef.current.find((s) => s.id === target.id);
        const elementMultiplier = combatService.getElementMultiplier(
          getCharacterElementTypes(dashCharacter),
          summon ? getNpcElementTypes(summon.npcType) : [],
        );
        const summonDmg = atLeastMinDamage(
          critDmg *
            elementMultiplier *
            elementDamageBonus *
            (vastolordMultiplierRef?.current?.() ?? 1),
        );
        spawnDamageRef.current?.(
          summonDmg,
          target.x,
          target.y,
          critType === "crit" ? "crit" : "charge",
        );
        registerHitRef.current?.(summonDmg);
        timeRef.current = applyHitstop(timeRef.current, 80);

        applyVampirism({
          damage: summonDmg,
          source: "other",
          vampirism: vampirismRef.current,
          playerMaxHp: playerMaxHpRef.current,
          setPlayerHP: setPlayerHPRef.current,
        });

        setSummons((prev) =>
          prev.map((s) =>
            s.id === target.id
              ? { ...s, hp: Math.max(0, s.hp - summonDmg) }
              : s,
          ),
        );
      }
    };

    setPlayerState("dash");

    dashIntervalRef.current = setInterval(() => {
      stepCount++;

      setPlayer((p) => {
        const step = dir === "left" ? -DASH_STEP : DASH_STEP;
        const newX = clampX(p.x + step);

        const rawDmg = combatService.calculatePlayerDamage(
          char.stats.strength,
          playerClass,
          titleDamageBonus,
        );
        const berserkRaw =
          dashCharacter === "samuel" && dashCharRef.current.level >= 20
            ? rawDmg *
              combatService.getBerserkMultiplier(
                playerHpRef.current,
                playerMaxHpRef.current,
              )
            : rawDmg;
        const chargeDmg = berserkRaw * 1.5;
        const { damage: critDmg, type: critType } = combatService.rollCrit(
          chargeDmg,
          critRate,
        );
        if (critType === "crit") wasCritRef.current = true;

        const targets = buildDashTargets();

        for (const target of targets) {
          if (hitTargetsRef.current.has(target.id)) continue;

          if (
            isPlayerInRange(
              newX,
              dashY,
              target.x,
              target.y,
              "idle",
              dashCharacter,
              false,
              false,
              target.id === "main" ? npcClass : "common",
              dashCharacter === "lucas" && weaponRef.current
                ? LUCAS_WEAPON_RANGES[weaponRef.current]
                : undefined,
            )
          ) {
            applyDashHit(target, critDmg, critType);
          }
        }

        if (
          stepCount >= steps ||
          newX <= BATTLE_LIMITS.minX ||
          newX >= BATTLE_LIMITS.maxX
        ) {
          if (dashIntervalRef.current) {
            clearInterval(dashIntervalRef.current);
            dashIntervalRef.current = null;
          }
          return { ...p, x: newX, state: wasCritRef.current ? "crit" : "idle" };
        }

        return { ...p, x: newX, state: "dash" as const };
      });
    }, DASH_INTERVAL);
  }

  return { execute };
}
