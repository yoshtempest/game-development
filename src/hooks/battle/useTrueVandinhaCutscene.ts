import { useEffect, useRef, useState } from "react";
import type { useBattleScene } from "@/hooks/battle/main/battleScene/useScene";
import { useCutscene } from "@/hooks/interaction/cutscene/useCutscene";
import { trueVandinhaBattleDialogue } from "@/data/dialogues/trueVandinhaBattle/one";
import { npcPath } from "@/utils/paths";

/**
 * Fatia da API de batalha que a cutscene consome. O hook é chamado antes de
 * `useBattleScene` (que precisa de `dialogueOpen` como entrada), então
 * `player`/`npc`/`battle` chegam por ref depois que a cena monta a API.
 */
export type TrueVandinhaCutsceneApi = Pick<
  ReturnType<typeof useBattleScene>,
  "player" | "npc" | "battle"
>;

type Params = {
  npcType: string;
  apiRef: React.RefObject<TrueVandinhaCutsceneApi | null>;
};

/**
 * Cutscene da TrueVandinha: ao se aproximar na 1ª fase, dispara fall + flash +
 * diálogo + transição para a 2ª fase. Vive fora do fluxo geral da batalha
 * porque tem estados, temporizadores e transições próprios.
 */
export function useTrueVandinhaCutscene({ npcType, apiRef }: Params) {
  const isTrueVandinha = npcType === "trueVandinha";

  const [cutsceneOpen, setCutsceneOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [background, setBackground] = useState<string | null>(null);
  const [dialogueOpen, setDialogueOpen] = useState(false);

  const triggeredRef = useRef(false);
  const phase2Ref = useRef(false);
  // Timers da sequência (flash e início da cutscene). Guardados em ref para o
  // cleanup do unmount cancelar o que ainda estiver pendente.
  const timersRef = useRef<number[]>([]);

  const cutscene = useCutscene({
    dialogue: trueVandinhaBattleDialogue,
    autoStart: false,
    onFinish: () => {
      setCutsceneOpen(false);
      setDialogueOpen(false);
    },
  });

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // `cutscene` muda de identidade a cada render (assim como `npc`/`battle` no
  // efeito original), então o efeito reavalia sempre; o `triggeredRef` garante
  // que a sequência só começa uma vez.
  useEffect(() => {
    const api = apiRef.current;
    if (!isTrueVandinha || !api) return;
    if (triggeredRef.current) return;

    const { player, npc, battle } = api;
    if ((battle.npcPhase ?? 1) !== 1) return;
    if (Math.abs(npc.x - player.x) > 90) return;

    triggeredRef.current = true;
    // Bloqueia a IA e o lifecycle (que, para boss de 1ª fase, avançaria de
    // fase sozinho ao zerar o HP). A cutscene assume o controle a partir daqui.
    battle.isEnding.current = true;
    npc.updateNpc({ state: "fall" });
    battle.setNpcHP(0);

    // Pausa a batalha imediatamente para a IA não sobrescrever o sprite.
    setDialogueOpen(true);

    setFlash(true);
    timersRef.current.push(window.setTimeout(() => setFlash(false), 500));

    timersRef.current.push(
      window.setTimeout(() => {
        setBackground(npcPath("/trueVandinha/shenLong.svg"));
        npc.updateNpc({ state: "giveMeMyPower" });
        setCutsceneOpen(true);
        cutscene.start();
      }, 500),
    );
  }, [isTrueVandinha, apiRef, cutscene]);

  useEffect(() => {
    const api = apiRef.current;
    if (!isTrueVandinha || !api) return;
    if (!cutsceneOpen) return;
    if (phase2Ref.current) return;
    // Terceiro diálogo (índice 2): "Muito bem, seu desejo..."
    if (cutscene.index !== 2) return;

    const { npc, battle } = api;
    phase2Ref.current = true;
    battle.setNpcPhase(2);
    battle.setNpcHP(battle.npcMaxHp);
    battle.isEnding.current = false;
    npc.updateNpc({ state: "giveMeMyPower" });
  }, [isTrueVandinha, cutsceneOpen, cutscene.index, apiRef]);

  return { flash, background, dialogueOpen, cutsceneOpen, cutscene };
}
