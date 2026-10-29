# AGENTS.md — react-jomasio-adventures

RPG 2D tile-based (17×13) em React 19. SPA client-side com `HashRouter`,
publicado no subpath do GitHub Pages (`/react-jomasio-adventures/`) e
instalável como PWA. O `server/` (Express + SQLite) é **opcional** — existe
só para login e cloud save; o jogo inteiro roda sem ele.

Este arquivo é um mapa: o que existe, em que ordem as camadas se dependem e
quais invariantes o compilador já protege. Antes de mudar arquitetura, leia
"Camadas" e "Invariantes".

## Comandos

```bash
npm run dev          # vite (porta 5173, host true)
npm run type-check   # tsc -b  (project references: tsconfig.app + tsconfig.node)
npm run lint         # eslint . (recommendedTypeChecked + react-hooks recommended-latest)
npm run build        # tsc -b && vite build && vite build --config vite.sw.config.ts (service worker)
npm run dev:server   # backend em :3001 (tsx watch, server/)
```

`type-check` e `lint` passam limpos. **Não existe suíte de testes** —
`@playwright/test` está no `package.json` mas não há spec no repo; não invente
`npm test` como verificação. A verificação de mudança visual é manual
(`npm run dev`; para resetar estado travado use hard reload — TODO.md).

## Stack e regras do compilador

- React 19.1, TypeScript 5.9, `rolldown-vite` 7 (instalado como `vite` via
  override), `react-router` **7** (importe de `react-router`, não
  `react-router-dom`), `lucide-react`, `lz-string` (save comprimido),
  `tempest-react-sdk` (manifest + service worker via `vite`/`vite.sw.config.ts`).
- Alias `@/` → `./src/`. Use `@/` para tudo que sai da pasta atual; caminho
  relativo só dentro da mesma pasta ou pasta irmã direta.
- `strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`,
  `noImplicitReturns`, `noUnusedLocals/Parameters`. Consequências práticas:
  - **todo** import type-only precisa de `import type`;
  - **sem parameter properties** (`constructor(private x)`) — declare field e
    atribua no constructor;
  - indexar `Record`/`array` devolve `T | undefined` — trate explicitamente;
  - toda função com retorno precisa retornar em todos os caminhos.
- ESLint: `js.recommended` + `tseslint.recommendedTypeChecked` +
  `react-hooks.recommended-latest` + `react-refresh.vite`, `projectService` ligado
  ao `tsconfig.app.json`. `server/**` tem bloco próprio (sem DOM, sem type-aware).
- `tsconfig.app.json` inclui também `dump/RewardList` (protótipo fora de `src/`).

## Camadas (direção de dependência)

```
utils/types  →  data  →  gameRules  →  services  →  contexts  →  hooks
             →  components  →  scenes / interactions  →  features  →  pages
```

- `utils/types/` é a base: só tipos e `global.d.ts`. **Não importa React**
  (única exceção documentada: `scenes/shared/types.ts`, que monta
  `BattleSceneApi` a partir de `ReturnType<typeof useX>` porque a cena é quem
  compõe os hooks).
- `data/` = dados estáticos, sem side effect (tabelas de itens, NPCs,
  quests, equipamento, flags, sprites, mensagens).
- `gameRules/` = regras puras (sem React, sem estado): movimento, estados do
  player, equipamento/status, loot, projéteis, profissões, rewards.
- `services/` = regras de negócio em **classes**, DI por constructor, sem React
  depois de instanciadas. Módulos `data/`→`utils/`, `gameRules/`→`data/` são
  permitidos; o inverso não.
- `contexts/` = estado global (26 providers). `hooks/` = hooks de domínio
  (a camada que pode ler contexts). `components/` = UI.
- `scenes/` = **dados** de cena (importa `data/`, `maps/`, e alguns hooks de
  diálogo). `interactions/` = mapa de interações por tile. `features/` =
  cola entre dados e `SceneBase`. `pages/` = rota.

## Três pipelines

### Exploração

```
AppRoutes  →  pages/<Loc>/index.tsx  →  createScenePage(<Loc>Scene)
            →  ScenePage (lê :id do router)  →  features/<loc>/index.tsx
            →  SceneBase  →  ExploreScene (GameMap + Player + NPC + Talks)
```

- `pages/<Loc>/index.tsx` é 3 linhas: `export default createScenePage(Feature)`
  (precisa do `// eslint-disable-next-line react-refresh/only-export-components`
  porque o `default` convive com o named import).
- `features/<loc>/index.tsx` exporta **named** `<Loc>Scene({ sceneId })`: escolhe
  a cena em `SCENES[sceneId]`, monta `interactions` (`useMemo` sobre os deps),
  `itemPickupTiles`, handlers de saída e overlays (modais/puzzles) **fora** do
  `SceneBase`.
- Dados puros vêm de `scenes/<loc>/<sceneId>/` + `maps/<loc>/<cena>.ts`.
- `SceneBase` (components/Game/Scenes/Base) é o ponto único: fecha navbar,
  seta `player.mode = "explore"`, resolve spawn, mapa/missões, e cria o
  `SceneEventService` no `onFinish` com as dependências expostas por
  `onFinishExtra`. Ele `dispose()` no unmount — não duplique.
- `useExitTile` (hooks/scene) resolve a saída: `scene.tiles` (`route` ou
  `getRoute`) + `handleExit` do feature; `navigateWithFade` faz a transição.

### Batalha

```
rota /battle/...  →  pages/BattlePage  →  ROUTE_TO_BATTLE_KEY[pathname]
                 →  BATTLE_CONFIGS[key]  →  BattleProviders + BattleScene
                 →  useBattleScene (hooks/battle/main/useScene)
                 →  useBattleSystem (hooks/battle/main/useSystem) + hooks por eixo
```

- `BattlePage` é genérico: a battle é resolvida por **rota**, não por
  componente. Criar battle = entrada em `data/battle/config.ts`
  (`BATTLE_CONFIGS` + `ROUTE_TO_BATTLE_KEY`) + rota em `AppRoutes`.
- `BattleScene` (750 linhas) é só composição/render; a lógica está em
  `hooks/battle/**` (charge, damage, death, effects, npc, player, player/characters/*,
  projectile, recording, rewind, summon, time, victory, loot, highlight).
- Habilidade de personagem = 4 lugares: registro em
  `data/characters/<char>/abilities.ts` (agregado por
  `data/characters/abilities.ts` em `CHARACTER_ACTIVE_ABILITIES` — o que battle
  e menu de Status concordam; `createActiveAbility` de `abilityFactories`
  preenche `kind`), hook em
  `hooks/battle/player/characters/<char>/use<Ability>.ts`, botão em
  `components/Game/Battle/Buttons/<Char>/<Ability>/`, e fluxo (custo/charge/
  special) em `useSystem`/`useVastolordForm`. Números em
  `data/characters/<char>.ts`, sprites/animação em
  `data/battle/animationFlow.ts` + `public/assets/player/`.
- `BattleSceneApi` (`scenes/shared/types.ts`) é o contrato entre a cena e os
  hooks — campo novo de habilidade entra ali.

### Menus / UI

`NavbarContext` (screen aberta) + `components/Game/Navbar/ExploreNavbar/*` +
`hooks/menu/*` (inventory, equipment, bestiary, quests, pets, professions,
saves, config). `GameControlsContext` é uma **pilha** de layers: cada hook
consumidor empilha via `useGameControlsLayer` e o topo da pilha captura o
input (teclado + touch: `JoystickMovement` / `ButtonsMovement`).

## Anatomia de uma cena

`scenes/<loc>/<sceneId>/` — um arquivo por papel, todos default-ou-named
exportados e plugged em `scene.ts`:

| Arquivo       | Conteúdo                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `scene.ts`    | `SceneConfig`: `id`, `background`, `map`, `tiles`, `npcs`, `events`, `dialogueData`, `initialPosition`, `audio`, `scaleFix` |
| `tiles.ts`    | `createDoorTile` / `createConditionalTile(x, y, getRoute)`                                                                  |
| `npcs.ts`     | `createNpc(npcPath("/x/default.svg"), gridX, gridY, size?)`                                                                 |
| `position.ts` | `initialPosition: ExplorePosition` ou `(lastPage) => …`                                                                     |
| `dialogue.ts` | `get<Scene>Dialogue(context): Dialogue[]`                                                                                   |
| `events.ts`   | `SceneEvent[]` declarativo                                                                                                  |
| `plate.ts`    | placas de chão (`createPlate`) — opcional                                                                                   |

Depois registre em `scenes/<loc>/index.ts` (`Partial<Record<SceneId, SceneConfig>>`).
`SceneId` é uma **union global** em `utils/types/global.d.ts` — cena nova sem
entrada ali não compila. Roteiros de saída ficam em `scenes/shared/routes.ts`;
adjacência do mapa em `scenes/shared/sceneAdjacency.ts`; cells do mapa em
`data/scene/map.ts`; backgrounds em `data/scene/background.ts`.

`scenes/shared/factories.ts` tem os construtores (`createNpc`, `createPlate`,
`createDoorTile`, `createConditionalTile`, `createPosition`,
`createGiveQuestEvent`). `scenes/shared/helpers.ts` tem `hasQuest`/`hasAnyQuest`
para `getRoute`.

### Eventos de cena

`SceneEvent` (union global) é **dado**, não código. `SceneEventService`
(`services/engine/`) interpreta; handlers que precisam de deps de fora do
padrão entram via `onFinishExtra` do feature. Tipos hoje: `openModal`,
`navigate`, `playSound`, `setFlag`, `log`, `progressQuest`, `giveQuest`,
`addItem`, `removeItem`, `prepareTombstone`, `conditional` (com `then`/`else`
recursivos). Evento novo = union + `case` no service.

### Diálogos

`defineDialogue([...])` + registro de falantes em `data/speakers.ts`.

```ts
export const d = defineDialogue([
  ["jailson", "Olá"], // [who, message]
  ["protagonista", "Oi", "talking"], // + expression
  { who: "victor", pose: "sitting", message: "...", soundSrc: "..." }, // pose/sound/name
]);
```

- `SPEAKERS[id]` = `{ name, base?, pose?, kind?, isPlayer? }`; `base` gera
  `npcPath(base/pose.svg)` ou `playerPath(...)` quando `kind: "player"`.
- `DialogueExpression` é union global (valores existentes em
  `public/assets/player/<char>/expressions/`). `useDialogue` resolve o nome do
  player de `localStorage.playerName` e o sprite pela expressão atual.
- Objeto sem `who` é escape hatch (template dinâmico, ex.: `goodPowder.ts`).
- Cena pode usar array estático ou `get<Scene>Dialogue(context)` reativo a
  quests/items/flags/character.

## Services

Classes com constructor e backend injetado; nada de React.

- `services/npc/` — todo NPC ataca. `NpcAttack` abstrato + `DefaultNpcAttack`
  (persegue e dá melee). Um arquivo por NPC em `attacks/`; multi-fase vira
  pasta (`attacks/maugrelo/` com `phase1/`, `phase2/`, `state.ts`,
  `actions/`). Registry `attacks/index.ts` é `satisfies Record<NpcType, NpcAttack>`
  → **NPC sem ataque não compila**; `getNpcAttack()` estoura em runtime.
  `BehaviorContext`/`BehaviorResult` (`utils/types/npc/npcBehavior.ts`) são o
  contrato: projétil, phases, sounds, summons, debuffs, push/grab — tudo opcional
  e injetado por `useNpcAI`.
- `services/combat/` — `CombatService` (instância default `combatService`): dano,
  crítico, elemento, sorte, cooldown. `character.ts` tem `BaseCharacter` +
  `BaseNPCProps`/`BasePlayerProps` (a fundação de entidades).
- `services/items/` — efeitos em `ITEM_ACTIONS` (`Partial<Record<ItemId,…>>`).
- `services/inventory/` — `InventoryService`: regras puras de pilha/capacidade;
  métodos recebem e devolvem o array (`AddItemResult` traz `sound`).
- `services/save/` — `SaveService`, `SlotManager`, `StorageService`
  (`StorageLike` injetado) + funções de módulo delegando à instância default.

## Estado e persistência

- Contexts são flat em `contexts/`, um arquivo por domínio, padrão
  `XProvider` + hook `useX` (context separado quando há estado vs. ações:
  `usePlayerState` / `usePlayerActions`). `value` sempre em `useMemo`; o
  provider e o hook no mesmo arquivo **precisam** de
  `// eslint-disable-next-line react-refresh/only-export-components`.
- `useCompressedStorage(key, default, normalize?)` é o padrão de estado
  persistido: debounce de 1s, flush no unmount e em `pagehide`, chave resolvida
  **uma vez** na leitura. Estado que muda rápido (regen) não deve escrever por
  render.
- Slots: `slotKey(key)` prefixa `_0`/`_1` (`SlotManager`). **Trocar/apagar slot
  exige reload completo** (`hooks/menu/useSave.ts`) — sem isso o app mantém o
  estado do slot antigo em memória e sobrescreve o novo. Chaves novas precisam
  entrar em `GAME_STATE_KEYS` (`slotManager.ts`) para o clear de slot apagar.
- Nomes de chave vivem em `data/storageKeys.ts`.
- `saveGame()` é chamado em 4 lugares, todos em route/data change:
  `GameApp.tsx` (itens/quests/classe/personagem + cloud), `Scenes/Explore`
  (posição), `hooks/battle/main/useScene` e `battle/death/useDeathCallbacks`.
- Cloud save: `utils/api.ts` (`/api/*` com `Authorization: Bearer` do
  `jomasio_token`) + `AuthContext`. Trate ausência de backend como estado
  normal, não como erro fatal.

## Assets, grid e CSS

- **Nunca** hardcode caminho de `public/`. `utils/paths.ts` é a fonte única:
  `asset()`/`resolveAsset()` aplicam `import.meta.env.BASE_URL`
  (`/react-jomasio-adventures/`); helpers de categoria (`itemPath`, `npcPath`,
  `playerPath`, `chestPath`, `backgroundAudioPath`, `cenariosPath`…) já
  aplicam o base — **nunca** chame `asset()` por cima de um helper
  (prefixo duplicado).
- Dados guardam só o **nome** do arquivo; a pasta mora no helper.
- Grid/área de jogo: `data/grid.ts` é fonte única (`MAP_GRID_COLS/ROWS`,
  `GAME_VIEWPORT_WIDTH_RATIO` publicado como `--game-viewport-width`).
  Não repita `17`, `13`, `0.74` ou `74vw` em TS/CSS.
- CSS em dois sistemas: global em `src/styles/*.css` (importado por
  `styles/index.css`; classes legadas em PascalCase/camelCase como `Master`,
  `SceneMap`, `navbarClip`, `.app`) **e** `styles.module.css` por componente
  (camelCase, `className={styles.x}`). Componente novo → CSS module.
  `src/styles/variables.css` tem os tokens (`--size-*`, cores).
- Ordem de `z-index` alta é intencional (navbar 9999999, overlays 99999999) —
  não "limpe" sem entender.

## Elementos em batalha

Não existe raça: a tipagem elemental é o único eixo de diferença entre
criaturas. O caminho de leitura é sempre:

```
CHARACTER_ELEMENT_TYPES / NPC_TYPINGS (data)
                      →  funil de dano (elemental por nível)
```

- **Registro**: `data/types/characterElementTypes.ts`
  (`CHARACTER_ELEMENT_TYPES`, um array por `CharacterId`) e
  `data/types/npcElementTypes.ts` (`NPC_TYPINGS`, `Partial` por
  `NpcType | PetElementKey`; NPC sem entrada cai em `Normalis`). Lista
  literal — multi-tipagem é livre, quantas colunas quiser.
- **Funis de dano** (não adicione um quarto caminho): player→NPC em
  `computeHitDamage` (cobre básico, special e habilidades), `damageSummon` e
  `useDash`; NPC→player em `getNpcVsPlayerMultiplier`
  (`gameRules/battle/npcVsPlayerDamage.ts`), que `rollNpcDamage`,
  `npcThrowHit`, `projectileHp` e `computeSummonDamage` já consomem.
- **Tipagem**: não há progressão elemental por nível. Todo caminho de dano e
  toda UI leem a mesma função, `getCharacterElementTypes(character)` — se um
  lugar resolver tipagem por conta própria, é bug.
- **Status**: imunidade não vem de dado nenhum; `applyPlayerStatus` é o ponto
  único de entrada e status novo precisa entrar em `PlayerStatus`
  (`utils/types/battle/status.ts`).
- Balanceamento da tabela e a regra de média geométrica: `ELEMENTS.md`.

## Armadura e natureza do dano

Tipagem elemental ≠ armadura. São dois eixos independentes, e os dois valem para
**todo ser em batalha** (player, NPC principal, summons inimigos, aliados, pets).

```
DamageKind (physical | magical | true) + DamageArmor (physical | magical)
                      →  CombatService.applyArmor (ponto único)
```

- **Tipos**: `utils/types/battle/damageKind.ts`. `DamageArmor` é o par de
  colunas; `true` não tem coluna e por isso ignora qualquer armadura. Os
  combinadores (`NO_ARMOR`, `getArmorFor`, `addArmor`, `scaleArmor`,
  `getBlockArmor`) ficam em `gameRules/battle/damage/armor.ts`.
- **Funil único**: `CombatService.applyArmor`. Um caminho de dano que calcula
  redução por conta própria é bug — foi assim que `useExternal` e
  `damageSummon` divergiam do melee do NPC.
- **Dado legado**: `StatBlock.armor` é a base das **duas** colunas;
  `physicalArmor`/`magicalArmor` são o excedente de quem blindar só um lado.
  `getTotalArmor` e `getNpcStats` devolvem `DamageArmor` já preenchido.
- **Quem declara a natureza do golpe**: habilidade em
  `data/characters/abilities.ts` (`ActiveAbility.damageType`, lido por
  `getAbilityDamageType(id)` — é a fonte de verdade, GameData e hook não podem
  discordar); golpe de NPC no registry `services/npc/attacks/<npc>.ts`
  (`tryMeleeAttack`/`rangedChaseBehavior` + `Projectile.damageType`); efeito de
  pet em `data/characters/petSkills/types.ts`. **Ausente = física** — é o que
  preserva o balanceamento de tudo que não foi classificado.
- **Ordem da conta**: armadura **antes** do multiplicador elemental (e do
  berserk, no `damageSummon`). Elemento muda _quanto_ o golpe tira, não _se_
  ele é bloqueado.
- **Block**: o medidor consome o golpe **bruto**, então ele não conhece coluna —
  `getBlockArmor` projeta as duas num número (`Math.max`) tanto para o player
  quanto para o NPC.
- **Summons**: a armadura é resolvida no spawn e guardada em
  `SummonedNpc.armor` (inclusive no frame do rewind/replay). Dano entre summons
  usa a do alvo, não a do NPC principal.
- **Dano verdadeiro está pronto e sem uso**: nenhum golpe do jogo passa
  `"true"` pelo funil hoje. A Expansão de Domínio declara `damageType: "true"`
  no dado, mas é um _execute_ (`setNpcHP(0)`) — não existe conta de dano para a
  armadura reduzir. Tratar a Expansão como "dano verdadeiro" é leitura errada
  do que o código faz.
- **Exceções intencionais** (não são armadura que o golpe deveria furar):
  execute da Expansão de Domínio, reflexo e o reflect do Babidi, ticks de
  sangramento e o dummy de treino.

## Lasers (regras invariantes)

Todo laser e feixe semelhante (Maugrelo, Vastolord, Kamehameha) obedece:

1. **Origem na entidade geradora** — o feixe nasce na posição da entidade que
   o invoca (`fromX`/`fromY` = entidade), nunca na borda da tela ou "do nada".
2. **Dano contínuo + empurrão** — enquanto ativo, a cada tick todo inimigo na
   faixa sofre dano (mitigado pela armadura do alvo) e é empurrado na direção
   oposta à entidade; a distância por tick varia por laser.
3. **Renderização do ponto à alvo** — a animação de criação revela o feixe do
   extremo da entidade até o alvo via `clip-path` (inset), na direção em que a
   entidade está voltada (direita → direita, esquerda → esquerda). O feixe não
   "surge" inteiro de uma vez.

A faixa horizontal de acerto é sempre `[min(fromX,toX), max(fromX,toX)]`,
independente da ordem dos extremos. Novo laser = novo tipo de feixe seguindo
estas três regras (origem, dano+push, clip-path de criação).

## Convenções

| Categoria        | Convenção                                       | Exemplo                              |
| ---------------- | ----------------------------------------------- | ------------------------------------ |
| Componente       | pasta `PascalCase/index.tsx` (ou `X.tsx`)       | `SceneBase`, `Game/Scenes/Base`      |
| Página           | `pages/<PascalCase>/index.tsx`, default exp.    | `pages/Hall/index.tsx`               |
| Feature          | `features/<lowercase>/index.tsx`, named exp.    | `HallScene`                          |
| Contexto         | `PascalCaseContext.tsx`                         | `PlayerContext.tsx`                  |
| Hook             | `useNome.ts` / `useNome.tsx`, sempre `function` | `useGameAudio.ts`                    |
| Service          | classe PascalCase com DI no constructor         | `CombatService`                      |
| Registry/factory | `index.ts` com `satisfies Record<K, V>`         | `services/npc/attacks/index.ts`      |
| Dados            | `SCREAMING_SNAKE` p/ tabelas, `camelCase.ts`    | `NPC_CLASSES`, `data/items/index.ts` |
| Utilitário/tipo  | `camelCase.ts`                                  | `saveGame.ts`, `player.ts`           |
| CSS module       | sempre `styles.module.css`                      |                                      |

- **Nenhum** arrow function em componente, hook ou provider: `export function X()`
  (197 componentes, 217 hooks). Default export só em `pages/*` e em 3
  componentes legados (`Talking`, `Scenes/ScenePage`, `PWA`).
- Zero `any`, zero `@ts-ignore`, zero `React.FC`, zero class component no `src/`.
- Props de componente: `type Props = { … }` no topo do arquivo.
- Imports agrupados por linha em branco: react/libs → contextos → hooks →
  componentes → services → gameRules → data → utils/types → CSS.
- Comentários e JSDoc em **PT-BR** e explicam **por quê** (o código é
  ricamente comentado com invariantes; usar `// ── Seção ──` como separador
  como em `global.d.ts`). Não copiar comentários-lembrete/emoji legados
  (`🔥`, `✅`, "aqui é a mágica") — são ruído, não padrão.
- Git: `feat:` / `fix:` em inglês no subject (histórico do repo).

## Invariantes que o compilador já protege

Ao adicionar uma entrada nova, estes registros exaustivos **quebram o build**
até você preencher — use isso a seu favor:

- `data/npc/npc.ts` `NPC_CLASSES` → `NpcType`; força `data/npc/displayNames.ts`
  (`Record<NpcType, string>`) e `services/npc/attacks/index.ts`.
- `data/characters/list.ts` `CHARACTERS` → `CharacterId`; força
  `CHARACTER_ELEMENT_TYPES` (`data/types/characterElementTypes.ts`, como
  `satisfies Record<CharacterId, readonly ElementType[]>`): personagem novo não
  compila sem tipagem elemental declarada.
- `utils/types/global.d.ts`: `SceneId`, `PlayerState` (com `animationFlow` em
  `data/battle/animationFlow.ts` como `Record<PlayerState, …>`), `DialogueExpression`,
  `NPCClass`, `Projectile` (union por `variant`), `ItemId`/`QuestId`/`FlagId`
  derivados de `data/`.
- `services/save/slotManager.ts` `GAME_STATE_KEYS` (chave de slot).
- `data/npc/statusMultipliers.ts` `NPC_STATUS_MULTIPLIERS` → `Record<NpcType, …>`:
  todo NPC precisa dos quatro multiplicadores (dano, armadura física/mágica, vida).
- `ActiveAbility.damageType` não é exaustivo (ausente = física), mas quem
  declara precisa usar `getAbilityDamageType(id)`: o compilador não força, mas
  `Projectile.damageType` e `SummonedNpc.armor` quebram o build quando um
  caminho novo esquece de carregar a coluna.

## Regras invioláveis (bugs já custaram caro ao mundo)

1. **Sem side effect dentro de state updater** (`playSound`/`navigate` dentro de
   `setItems(prev => …)`) — e nunca ler estado setado dentro do updater fora dele.
2. **Limpar sempre** `setTimeout`/`setInterval`/listeners/áudio no cleanup do
   effect. `dispose()` de `SceneEventService`/áudio no unmount da cena.
3. **Estabilizar deps**: use `useLatestRef` / `useStableCallback`
   (`hooks/useLatestRef.ts`, `hooks/useStableCallback.ts`) em vez de
   `eslint-disable react-hooks/exhaustive-deps` (o projeto usa
   `recommended-latest`, então vale obedecer).
4. `key={scene.id}` no `ExploreScene` (troca de cena precisa remontar) e
   `useEffect` de save com `prevRouteRef` (não salvar no primeiro render).
5. `dispose()`/limpeza em troca de slot de save; reload completo.
6. `noUncheckedIndexedAccess`: indexar tabela sempre com guarda/fallback —
   item/quest/NPC inexistente é esperado em save antigo.
7. `react-refresh/only-export-components`: componente com named export +
   default export ou hook no mesmo arquivo precisa do disable (padrão em
   contexts e pages).
8. `BattlePage` é uma **única** página lazy (`lazyLoad` em `AppRoutes`)
   reutilizada por todas as rotas de battle — battle nova é config, não página
   nova. Páginas não-battle entram também em `nonBattlePages` para o `Preloader`.

## Receitas

**Nova página/rota**: `pages/<Nome>/index.tsx` → `lazyLoad` em
`AppRoutes.tsx` → rota (filha de `GameProviders`) → add em `nonBattlePages` se
não-battle.

**Nova cena em local existente**: `SceneId` em `global.d.ts` → matriz em
`maps/<loc>/<cena>.ts` (ou reusar `maps/map.ts`) → `scenes/<loc>/<cena>/` com
`scene.ts` + o que o local usar → entrada em `scenes/<loc>/index.ts` →
`createDoorTile` ligando no `tiles.ts` de origem → `routes.ts` → `sceneAdjacency`/
`data/scene/map.ts` se visível no mapa.

**Novo local**: `features/<loc>` + `interactions/<loc>.ts` (com
`createInteractionMap`/`createPickupHandler`) + `pages/<Loc>` + `scenes/<loc>/` +
`maps/<loc>/` + rota `/<loc>/:id` + `backgrounds` + `MUSICS` + `EXPLORE_ROUTES`
(`hooks/scene/useExploreLocation`).

**Novo NPC**: `NPC_CLASSES` → `displayNames` → `attacks/<npcType>.ts` +
registry → `statusMultipliers.ts` (obrigatório: os quatro multiplicadores de
status do NPC — dano/vida/armadura física e mágica, padrão 1) → (opcional)
`data/npc/levels.ts`, `bossScales.ts`, `NPC_TYPINGS` em
`data/types/npcElementTypes.ts` → sprites em `public/assets/npc/<type>/<state>.svg`
e `NPC_CATEGORY` em `data/sprites/sprites.ts` → `BATTLE_CONFIGS` + rota se for
lutável → `data/npc/cards.ts`/`displayNames` para bestiary.

**Novo item**: `data/items/<categoria>.ts` via `createItems(...)` (o `id` sai da
chave) → sprite em `public/assets/items/` + `data/items/droppable.ts` se
droppável → `ITEM_ACTIONS` (`services/items/itemEffects.ts`) se consumível →
`data/inventory/labels.ts` se tiver filtro próprio.

**Novo falante**: `SPEAKERS` + poses/sprites em `public/assets/npc/<base>/`.

**Novo estado de player / habilidade**: `global.d.ts` (`PlayerState` +
`Set`/predicados em `gameRules/battle/playerStates/`) → `animationFlow` →
`STATE_FOLDER`/`paths.ts` (sprite) → hook + botão + `useSystem`.

## Docs do repo

- `DOCUMENTACAO.md` — requisitos/especificação do jogo (RFxx), o contrato
  funcional; atualize junto com mudança de regra.
- `ELEMENTS.md` — sistema elemental (nota de projeto, parcialmente adotada).
- `TODO.md` — backlog do autor (ideias, não especificação).
- `TEMPEST_SDK_PLAN.md` — plano de migração do SDK/PWA (histórico).
- `README.md` — template do Vite, **desatualizado**; não use como referência.
- `server/` — backend Express + better-sqlite3, `tsconfig` próprio sem DOM.
