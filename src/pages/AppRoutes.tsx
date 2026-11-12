import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { lazyLoad } from "@/utils/lazyLoad";
import { LoadingScreen } from "@/components/Loading/Screen";
import { Preloader } from "@/components/Loading/Preloader";
import { GameProviders } from "@/components/Game/Providers";
import { GameApp } from "@/components/Game/GameApp";

const Loading = lazyLoad(() => import("@/pages/Loading"));
const Intro = lazyLoad(() => import("@/pages/Intro"));
const Tutorial = lazyLoad(() => import("@/pages/Tutorial"));
const Home = lazyLoad(() => import("@/pages/Home"));
const CombatTutorial = lazyLoad(() => import("@/pages/CombatTutorial"));

const JomasioEntrancePage = lazyLoad(() => import("@/pages/JomasioEntrance"));

const ChapterPage = lazyLoad(() => import("@/pages/Chapter"));

const FirstCutscenePage = lazyLoad(() => import("@/pages/FirstCutscene"));

const CantinaPage = lazyLoad(() => import("@/pages/Cantina"));

const DirectorPage = lazyLoad(() => import("@/pages/Director"));

const HallPage = lazyLoad(() => import("@/pages/Hall"));

const PcRoomPage = lazyLoad(() => import("@/pages/PcRoom"));

const LibraryPage = lazyLoad(() => import("@/pages/Library"));
const FootballCourtPage = lazyLoad(() => import("@/pages/FootballCourt"));

const CafeteriaPage = lazyLoad(() => import("@/pages/Cafeteria"));
const HellroomPage = lazyLoad(() => import("@/pages/HellRoom"));
const BrodiClassPage = lazyLoad(() => import("@/pages/BrodiClass"));

const BattlePage = lazyLoad(() => import("@/pages/BattlePage"));
const BattleTesterPage = lazyLoad(() => import("@/pages/BattleTester"));
const ReplayPage = lazyLoad(() => import("@/pages/Replay"));

const Landing = lazyLoad(() => import("@/pages/Landing"));
const Online = lazyLoad(() => import("@/pages/Online"));
const Login = lazyLoad(() => import("@/pages/Login"));
const Register = lazyLoad(() => import("@/pages/Register"));

const nonBattlePages = [
  DirectorPage,
  HellroomPage,
  Loading,
  Intro,
  Tutorial,
  CombatTutorial,
  Home,
  JomasioEntrancePage,
  ChapterPage,
  FirstCutscenePage,
  CantinaPage,
  HallPage,
  PcRoomPage,
  LibraryPage,
  CafeteriaPage,
  FootballCourtPage,
  BrodiClassPage,
  Online,
];

export function AppRoutes() {
  return (
    <>
      <Preloader pages={nonBattlePages} />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/online" element={<Online />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <GameProviders>
                <GameApp />
              </GameProviders>
            }
          >
            <Route index element={<Loading />} />
            <Route path="tutorial" element={<Tutorial />} />
            <Route path="combatTutorial" element={<CombatTutorial />} />
            <Route path="intro" element={<Intro />} />
            <Route path="home" element={<Home />} />

            <Route path="hall">
              <Route index element={<Navigate to="/hall/one" />} />
              <Route path=":id" element={<HallPage />} />
              <Route path="jailson/battle" element={<BattlePage />} />
              <Route path="center/battle" element={<BattlePage />} />
              <Route path="pandemony/battle" element={<BattlePage />} />
            </Route>

            <Route path="chapter/:id" element={<ChapterPage />} />

            <Route path="firstCutscene" element={<FirstCutscenePage />} />

            <Route path="jomasioentrance">
              <Route index element={<Navigate to="/jomasioentrance/one" />} />
              <Route path=":id" element={<JomasioEntrancePage />} />
            </Route>

            <Route path="director">
              <Route index element={<Navigate to="/director/one" />} />
              <Route path=":id" element={<DirectorPage />} />
            </Route>

            <Route path="library">
              <Route index element={<Navigate to="/library/one" />} />
              <Route path=":id" element={<LibraryPage />} />
            </Route>

            <Route path="cantina">
              <Route index element={<Navigate to="/cantina/one" />} />
              <Route path=":id" element={<CantinaPage />} />
              <Route path="battle" element={<BattlePage />} />
            </Route>

            <Route path="footballcourt">
              <Route index element={<Navigate to="/footballcourt/one" />} />
              <Route path=":id" element={<FootballCourtPage />} />
              <Route path="battle" element={<BattlePage />} />
            </Route>

            <Route path="hellroom">
              <Route index element={<Navigate to="/hellroom/one" />} />
              <Route path=":id" element={<HellroomPage />} />
              <Route path="battle" element={<BattlePage />} />
            </Route>

            <Route path="cafeteria">
              <Route index element={<Navigate to="/cafeteria/one" />} />
              <Route path=":id" element={<CafeteriaPage />} />
              <Route path="battle" element={<BattlePage />} />
            </Route>

            <Route path="pcroom">
              <Route index element={<Navigate to="/pcroom/one" />} />
              <Route path=":id" element={<PcRoomPage />} />
              <Route path="battle/one" element={<BattlePage />} />
              <Route path="battle/two" element={<BattlePage />} />
              <Route path="battle/three" element={<BattlePage />} />
            </Route>

            <Route path="brodiclass">
              <Route index element={<Navigate to="/brodiclass/one" />} />
              <Route path=":id" element={<BrodiClassPage />} />
              <Route path="/brodiclass/battle" element={<BattlePage />} />
            </Route>

            <Route path="training" element={<BattlePage />} />

            <Route path="battle/hungry" element={<BattlePage />} />
            <Route path="battle/pvp" element={<BattlePage />} />
            <Route path="battle/hungryDog" element={<BattlePage />} />
            <Route path="battle/vandinhafragment" element={<BattlePage />} />
            <Route path="battle/truevandinha" element={<BattlePage />} />
            <Route path="battle/jhowsimar" element={<BattlePage />} />
            <Route path="battle/piupiu" element={<BattlePage />} />
            <Route path="battle/rice" element={<BattlePage />} />
            <Route path="battle/goat" element={<BattlePage />} />
            <Route path="battle/rickprime" element={<BattlePage />} />

            <Route
              path="/battle/tester/:npcId"
              element={<BattleTesterPage />}
            />

            <Route path="replay/:id" element={<ReplayPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
