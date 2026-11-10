import { useCallback } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { BattleScene } from "@/components/Game/Scenes/Battle";
import { BattleProviders } from "@/components/Game/Battle/BattleProviders";
import { BattleNavbar } from "@/components/Game/Navbar/BattleNavbar";
import { useBattleNavbar } from "@/contexts/BattleNavbarContext";
import { useFlags } from "@/contexts/FlagContext";
import { useOnline } from "@/contexts/OnlineContext";
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
  const playerCount = online.connected ? (online.room?.players.length ?? 1) : 1;
  const training = key === "training";

  const originRoute = (location.state as { battleOrigin?: string } | null)
    ?.battleOrigin;
  const isAlfa = (location.state as { alfa?: boolean } | null)?.alfa === true;
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

  return (
    <BattleProviders>
      <BattleScene
        npcType={config.npcType}
        playerCount={playerCount}
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
