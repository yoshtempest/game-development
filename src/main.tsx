// import "tempest-react-sdk/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "./styles/index.css";

import { AppProviders } from "@/contexts/AppProviders";
import { AppRoutes } from "@/pages/AppRoutes";
import { applyGameViewportWidth } from "@/data/grid";
import { LANGUAGE_KEY } from "@/data/storageKeys";
import { parseGameLanguage } from "@/data/settings/language";
import { applyDocumentLanguage } from "@/utils/documentLanguage";

type ContainerWithRoot = HTMLElement & {
  _reactRoot: ReturnType<typeof createRoot>;
};

applyGameViewportWidth(document.documentElement);
applyDocumentLanguage(parseGameLanguage(localStorage.getItem(LANGUAGE_KEY)));

const container = document.getElementById("root")!;
const root =
  (container as ContainerWithRoot)._reactRoot ||
  ((container as ContainerWithRoot)._reactRoot = createRoot(container));

root.render(
  <div className="viewportRoot">
    <StrictMode>
      <HashRouter>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </HashRouter>
    </StrictMode>
  </div>,
);
