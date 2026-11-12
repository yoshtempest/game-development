import { useCallback } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { BattleScene } from "@/components/Game/Scenes/Battle";
import { BattleProviders } from "@/components/Game/Battle/BattleProviders";
import { BattleNavbar } from "@/components/Game/Navbar/BattleNavbar";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useFlags } from "@/contexts/FlagContext";
import { useOnline } from "@/contexts/OnlineContext";
import { parsePvpBestOf } from "@/hooks/battle/pvp/usePvpMatch";
import type { PvpSide } from "@/hooks/battle/coop/types";
import {
  BATTLE_CONFIGS,
  ROUTE_TO_BATTLE_KEY,
  getBattleBackgroundFromRoute,
} from "@/data/battle/config";

function BattleNavbarOverlay() {
  const { isBattleNavOpen, isClosing } = useBattleNavbar();

  if (!isBattleNavOpen && !isClosing) return null;

  return (
    <div className="navbarClip">
      <BattleNavbar />
    </div>
  );
}

export default function BattlePage() {
  const location = useLocation();
  const { pathname } = location;
  const key = ROUTE_TO_BATTLE_KEY[pathname];
  const config = key ? BATTLE_CONFIGS[key] : undefined;
  const { setFlag } = useFlags();
  const navigate = useNavigate();
  const online = useOnline();
  const training = key === "training";
  const isPvp = key === "pvp";

  // Co-op é da guilda, não da sala inteira: só o parceiro (`online.guildId`)
  // entra junto e conta para o escalonamento. PvP e treino continuam 1v1.
  const guildMate = online.room?.players.find(
    (p) => p.id !== online.playerId && p.id === online.guildId,
  );
  const playerCount = !isPvp && !training && guildMate ? 2 : 1;

  const battleLeaderId = (location.state as { battleLeaderId?: string } | null)
    ?.battleLeaderId;

  const originRoute = (location.state as { battleOrigin?: string } | null)
    ?.battleOrigin;
  const isAlfa = (location.state as { alfa?: boolean } | null)?.alfa === true;
  const pvpState = location.state as {
    pvpOpponentId?: string;
    pvpSide?: PvpSide;
    pvpBestOf?: number;
  } | null;
  const pvpOpponentId = pvpState?.pvpOpponentId;
  const pvpSide: PvpSide = pvpState?.pvpSide === "right" ? "right" : "left";
  const pvpBestOf = parsePvpBestOf(pvpState?.pvpBestOf);
  const npcLevel = (location.state as { npcLevel?: number } | null)?.npcLevel;
  const background =
    (originRoute ? getBattleBackgroundFromRoute(originRoute) : "") ||
    config?.background;

  const handleVictory = useCallback(() => {
    config?.onVictory?.({ setFlag, navigate });
  }, [config, setFlag, navigate]);

  if (!config) {
    return <div>Batalha não encontrada</div>;
  }

  // O duelo só existe a partir de um x1 aceito: sem oponente (URL digitada,
  // reload sem state) não há contra quem lutar.
  if (isPvp && (!online.connected || !pvpOpponentId)) {
    return <div>Duelo não encontrado — chame alguém pro x1 no modo online.</div>;
  }

  return (
    <BattleProviders>
      <BattleScene
        npcType={config.npcType}
        playerCount={playerCount}
        battleLeaderId={battleLeaderId}
        isPvp={isPvp}
        pvpOpponentId={pvpOpponentId}
        pvpSide={pvpSide}
        pvpBestOf={pvpBestOf}
        npcLevel={npcLevel}
        redirectTo={config.redirectTo}
        onVictory={handleVictory}
        victoryDescription={config.victoryDescription}
        background={background}
        audioSrc={config.audioSrc}
        introAudioSrc={config.introAudioSrc}
        training={training}
        isAlfa={isAlfa}
      />
      <BattleNavbarOverlay />
    </BattleProviders>
  );
}
