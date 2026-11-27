import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Ação de emote da batalha publicada para fora da cena.
 *
 * O menu "Animações" vive no `GameApp`, acima da rota — ele não alcança a API
 * da cena de batalha. Em vez de duplicar a regra da pose fora da luta, a cena
 * registra aqui o handler já validado por `useEmote`, e o menu só o oferece
 * enquanto o registro existe (ou seja, enquanto o jogador está em batalha).
 */
export type BattleEmoteHandler = {
  /** O personagem tem os sprites `idle2`/`idle3` e não está bloqueado. */
  available: boolean;
  /** Pode entrar na pose agora (parado, no chão, sem status travando). */
  usable: boolean;
  /** Entra na pose; a regra de elegibilidade continua dentro da cena. */
  trigger: () => void;
};

type BattleEmoteContextType = {
  /** `null` fora de batalha — é o que esconde a opção extra do menu. */
  battleEmote: BattleEmoteHandler | null;
  /** Devolve o cleanup para a cena desregistrar ao desmontar. */
  register: (handler: BattleEmoteHandler) => () => void;
};

const BattleEmoteContext = createContext<BattleEmoteContextType | null>(null);

const DEFAULT_BATTLE_EMOTE: BattleEmoteContextType = {
  battleEmote: null,
  register: () => () => {},
};

export function BattleEmoteProvider({ children }: { children: ReactNode }) {
  const [battleEmote, setBattleEmote] = useState<BattleEmoteHandler | null>(
    null,
  );

  const register = useCallback((handler: BattleEmoteHandler) => {
    setBattleEmote(handler);
    return () => {
      // Só limpa se ninguém tiver registrado outro handler nesse meio tempo.
      setBattleEmote((current) => (current === handler ? null : current));
    };
  }, []);

  const value = useMemo(
    () => ({ battleEmote, register }),
    [battleEmote, register],
  );

  return (
    <BattleEmoteContext.Provider value={value}>
      {children}
    </BattleEmoteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBattleEmote(): BattleEmoteContextType {
  return useContext(BattleEmoteContext) ?? DEFAULT_BATTLE_EMOTE;
}
