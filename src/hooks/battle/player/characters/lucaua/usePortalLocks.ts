import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
    type TimeEffect,
    ALL_TIME_KINDS,
    applyTime,
    clearTime
} from "@/gameRules/battle/time";
import type { TravelLockSpec } from "@/utils/types/character/lucaua/portals";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import { useStableCallback } from "@/hooks/useStableCallback";

/** Id do efeito de time do congelamento — único por habilidade. */
export const PORTAL_TIME_ID = "lucaua-portals";

type Props = {
  timeRef: RefObject<TimeEffect[]>;
  freezeActionsUntilRef: RefObject<number>;
};

/**
 * Travas da habilidade de portais, com dois níveis:
 *
 * - `engageLocks` (fluxo de colocação / voo do portal): congela o mundo
 *   inteiro (`ALL_TIME_KINDS`) e trava as ações do player.
 * - `engageTravelLocks` (travessia): congela **só** as classes que têm alguém
 *   atravessando — o resto do mundo segue batendo enquanto a entidade é
 *   renderizada no outro portal. O player só tem as ações travadas quando é
 *   ele quem está caindo.
 *
 * O player não é `TimeKind`, então as ações dele são travadas por fora, no
 * `freezeActionsUntilRef` (gate do `useSkillGuard`), com o valor anterior
 * salvo para restaurar na soltura.
 */
export function usePortalLocks({
    timeRef,
    freezeActionsUntilRef,
}: Props) {

    // Se o player está travado por nós e o valor salvo para restaurar depois.
    const playerLockRef = useRef(false);
    const savedFreezeRef = useRef(0);

    // ── Travas ─────────────────────────────────────────────────────────────────

    function lockPlayerActions() {
        if (playerLockRef.current) return;
        savedFreezeRef.current = freezeActionsUntilRef.current;
        playerLockRef.current = true;
        freezeActionsUntilRef.current = Number.POSITIVE_INFINITY;
    }

    function unlockPlayerActions() {
        if (!playerLockRef.current) return;
        playerLockRef.current = false;
        freezeActionsUntilRef.current = savedFreezeRef.current;
    }

    /**
     * Congelamento total: usado enquanto o player seleciona/posiciona o portal
     * e enquanto ele voa — aí o mundo fica parado de propósito.
     */
    function engageLocks(now: number) {
        lockPlayerActions();
        timeRef.current = applyTime(
            timeRef.current,
            {
                id: PORTAL_TIME_ID,
                kinds: ALL_TIME_KINDS,
                exempt: [],
                speed: 0,
                cooldown: 1,
                // Renovado a cada tick; se o tick parar, o congelamento expira sozinho.
                durationMs: LucauaPortalConstants.TICK_MS * 20,
            },
            now,
        );
    }

    /**
     * Congelamento seletivo da travessia: só a classe de quem atravessa entra
     * no `kinds`, e quem da mesma classe ficou para trás sai via `exempt`.
     * Sem viajantes não-player (`kinds` vazio) nenhum efeito de time é
     * aplicado — sobra só a trava do player, se for ele quem cai.
     */
    function engageTravelLocks(now: number, spec: TravelLockSpec) {
        if (spec.lockPlayer) lockPlayerActions();
        else unlockPlayerActions();

        if (spec.kinds.length === 0) {
            timeRef.current = clearTime(timeRef.current, PORTAL_TIME_ID);
            return;
        }
        timeRef.current = applyTime(
            timeRef.current,
            {
                id: PORTAL_TIME_ID,
                kinds: spec.kinds,
                exempt: spec.exempt,
                speed: 0,
                cooldown: 1,
                // Renovado a cada tick; se o tick parar, o congelamento expira sozinho.
                durationMs: LucauaPortalConstants.TICK_MS * 20,
            },
            now,
        );
    }

    /**
     * Solta as duas travas. Chamado no fim do fluxo, no reset dos portais e,
     * por via das dúvidas, no unmount (abaixo) — sem isso o
     * `freezeActionsUntilRef`, que é compartilhado com outras habilidades,
     * ficaria preso em `Infinity`.
     */
    function releaseLocks() {
        unlockPlayerActions();
        timeRef.current = clearTime(timeRef.current, PORTAL_TIME_ID);
    }

    // Unmount: a cleanup precisa de identidade estável para rodar só uma vez —
    // `releaseLocks` é recriado a cada render e usá-lo direto como dep religaria
    // a cleanup em todo render, liberando a trava no meio do uso.
    const releaseLocksStable = useStableCallback(releaseLocks);
    useEffect(() => {
        return () => releaseLocksStable();
    }, [releaseLocksStable]);

    return {
        releaseLocks: releaseLocks,
        engageLocks: engageLocks,
        engageTravelLocks: engageTravelLocks,
    };
}
