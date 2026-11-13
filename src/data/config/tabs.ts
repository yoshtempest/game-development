export type ConfigTab = "geral" | "batalha" | "conteudo";

export const CONFIG_TABS: ConfigTab[] = ["geral", "batalha", "conteudo"];
export const CONFIG_TAB_COUNT = CONFIG_TABS.length;

export const CONFIG_TAB_LABELS: Record<ConfigTab, string> = {
  geral: "Geral",
  batalha: "Batalha",
  conteudo: "Conteúdo",
};
