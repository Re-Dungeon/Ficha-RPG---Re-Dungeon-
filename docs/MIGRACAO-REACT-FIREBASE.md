# Plano de Migração — ReDungeon → React + Vite + Firebase

Este documento descreve como migrar o site atual (HTML/CSS/JS vanilla, ~88 mil linhas de JS em ~140 arquivos, ~40 mil linhas de CSS, tudo client-side sem conta de usuário) para uma stack **React + Vite + Firebase**. Leia junto com:
- [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) — o que cada sistema faz hoje.
- [player-site-handoff.md](./player-site-handoff.md) — **fonte de verdade** sobre a stack obrigatória, o Firebase compartilhado, o código de autenticação a ser reaproveitado e as convenções de código a seguir. Este plano foi revisado para seguir exatamente o que está descrito lá; onde houver conflito entre as seções abaixo e `player-site-handoff.md`, **o handoff prevalece**.

---

## Status da implementação (atualizado em 2026-07-19)

**As 8 fases do roadmap (seção 10) foram implementadas.** O deploy é feito via GitHub Pages, automatizado por `.github/workflows/deploy.yml` (build + lint + testes a cada push em `main`, publicado em `https://re-dungeon.github.io/Ficha-RPG---Re-Dungeon-/`). `vite.config.js` define `base: '/Ficha-RPG---Re-Dungeon-/'` e `src/routes/index.jsx` usa `basename: import.meta.env.BASE_URL` para o React Router respeitar esse subpath; `public/404.html` + o script correspondente em `index.html` implementam o fallback de SPA que o GitHub Pages não oferece nativamente (deep-link/refresh em rotas como `/personagens/:id`).

**Desvio importante em relação à seção 0**: a migração **não** foi feita em um repositório novo separado — foi implementada neste mesmo repositório (`Ficha-RPG---Re-Dungeon-`), substituindo o site vanilla no lugar. Os arquivos antigos (`js/`, `css/`, `index.html`, `data/*.js`, `html-components/`) já foram removidos. Ver `CLAUDE.md` para as convenções de código deste projeto.

### Fase a fase

| Fase | Status | Onde está |
|---|---|---|
| 0 — Fundação | ✅ | `src/service/firebase.js`, `src/context/AuthContext.jsx`, `src/components/ProtectedRoute/`, `src/routes/index.jsx`, `src/pages/Login/` |
| 1 — Leitura de dados de referência | ✅ | `src/service/storage.js` (`get*PorUniverso`, `getUniverso`/`getOrigens`/`getDivindades`), `src/common/utils/resolveNome.js` |
| 2 — Atributos + Status + Power Combat | ✅ | `src/pages/Personagens/Ficha/tabs/AtributosTab.jsx`, fórmulas em `common/utils/formulas.js` |
| 3 — Raças, Classes, Treinamento, Sorte, Condições, Imagem | ✅ | `.../tabs/ProgressaoTab.jsx` (+`progressao/*`), `.../tabs/SorteTab.jsx`, `.../tabs/CondicoesTab.jsx`, `.../tabs/PerfilTab.jsx` |
| 4 — Aptidões e Arts | ✅ | `.../tabs/AptidoesTab.jsx` (+`aptidoes/*`), `.../tabs/ArtsTab.jsx` (+`arts/*`) |
| 5 — Inventário e economia | ✅ | `.../tabs/InventarioTab.jsx` (+`inventario/*`), `.../tabs/LojasTab.jsx` (+`lojas/*`) |
| 6 — Veias Astrais | ✅ | `.../tabs/VeiasAstraisTab.jsx` (+`veiasAstrais/*`) |
| 7 — Códex e Info do Jogador | ✅ | `.../tabs/CodexTab.jsx`; Info do Jogador absorvida em `.../tabs/PerfilTab.jsx` |
| 8 — Polimento | ✅ (menos deploy) | `firestore.rules` revisado e **já deployado no projeto real**; testes de fluxo em `NovoPersonagem.test.jsx`, `AtributosTab.test.jsx`, `InventarioTab.test.jsx` |

A ficha do personagem (`src/pages/Personagens/Ficha/Ficha.jsx`) acabou com **11 abas**: Atributos, Progressão, Aptidões, Arts, Inventário, Lojas, Veias Astrais, Companheiro, Sorte, Condições, Códex, Perfil.

### Decisões e desvios tomados durante a implementação (não previstos em detalhe neste plano)

O schema da seção 5 abaixo ficou **um pouco mais completo** do que o desenhado aqui — alguns campos eram necessários para a mecânica funcionar mas não estavam listados explicitamente:

- `status.hp/energia/fadiga` ganhou um campo `atual` (além de `base/extra/bonus`) — necessário para as barras de status terem um valor "atual" distinto do máximo (FUNCIONALIDADES.md §3 já descrevia isso).
- `aptidoesGanhas` (number, top-level) — é o contador "Ganhas" do painel de Aptidões (FUNCIONALIDADES.md §9), não estava na lista de campos da seção 5.
- `racaHabilidadesAtivas` (array de índices) — toggle de habilidades básicas ativas da raça (FUNCIONALIDADES.md §11); usa o **índice** da habilidade no array `habilidadesBasicas` do doc de `racas`, já que o catálogo não tem um id próprio por habilidade.
- `lojaTrapaça` **não tem** `saldoFortuna` como a seção 5 sugeria — isso duplicaria `sorte.fortunaAtual` (mesma moeda, ver FUNCIONALIDADES.md §6). `lojaTrapaça` guarda só `efeitosAtivos`. Trate a seção 5 abaixo como desatualizada nesse ponto específico.
- `historicoSorte` (subcoleção) registra tanto rolagens de Fortuna quanto compras na Loja da Trapaça — não é usado só para rolagens.

Outras simplificações deliberadas (escolhas de escopo, não bugs):

- **Inventário**: ~~array `inventario: [{itemId, quantidade, equipado}]` no doc do personagem, referenciando o catálogo `itens`~~ — decisão revertida a pedido do usuário (2026-07-21). Virou a subcoleção `personagens/{id}/itensInventario` (ver seção 5.1), mesmo padrão de Arts: cada item é uma **cópia própria e completa** do personagem, nunca uma referência viva ao catálogo. O diálogo de adicionar item (`CriarItemDialog.jsx`) ganhou abas **Autoral** (criar item do zero) e **Catálogo** (escolher um item de `itens` por universo, copiando os campos), espelhando `CriarArtDialog.jsx`. Editar um item (`ItemFormDialog.jsx`) só afeta a cópia do personagem — o catálogo `itens` nunca é escrito por este site. Continua sem a separação "Itens" vs. "Armazenamentos" do site vanilla — um item vira "armazenamento" via o campo `bonusEspaco`. Sem ferramenta de migração pro array antigo (mesmo precedente do rebuild de Arts) — o campo `personagens.inventario` fica órfão.
- **Treinamento**: os limiares de crítico/sucesso/quase/falha e a tabela de XP por nível são **autorais** (o FUNCIONALIDADES.md §13 não define números exatos) — documentado com o aviso ⚠️ no topo do bloco correspondente em `common/utils/formulas.js`. Fácil de recalibrar se não bater com as regras da mesa.
- **Loja da Trapaça**: catálogo pequeno e autoral embutido em `src/pages/Personagens/Ficha/lojas/catalogoTrapaca.js` — não existe coleção Firestore para isso (confirmado na seção 4 abaixo), então não tem como vir do painel administrativo.
- **Arts**: ~~modelo "flat"~~ — decisão revertida a pedido do usuário (2026-07-21). Voltou a existir **Núcleo** (`personagens/{id}/nucleos`), pré-requisito de qualquer Art nas 3 origens (`origem: 'autoral'|'classe'|'catalogo'`, cada doc de `arts` ganhou `nucleoId` obrigatório), e **Variante** (`personagens/{id}/variantes`, vinculada a uma Art via `artId`, domínio sempre menor que o da Art base — `dominioVarianteValido` em `common/utils/formulas.js`), replicando a hierarquia de 3 camadas do site vanilla original. Ver schema atualizado na seção 5.
- **Veias Astrais**: interface em lista agrupada por camada, sem o mapa visual com pan/zoom e céu estrelado animado do site vanilla — mecânica de desbloqueio em cadeia (custo cumulativo de nós-pai) e bônus em `atributosBonus` preservados.
- **Background** (Info do Jogador, FUNCIONALIDADES.md §22): textarea simples com contador de caracteres, sem editor rich-text (bold/itálico/listas) nem "templates de lore reutilizáveis".
- **`regras` é filtrada por `universo`** — confirmado pelo responsável do projeto, corrigindo a suposição cautelosa da seção 4.1 abaixo ("regras não são mencionadas como filtradas").
- **Companheiro (2026-07-22)**: revertida a decisão da seção 2.1/2.3 de não implementar — mas em modelo **bem mais simples** do que `FUNCIONALIDADES.md` §17 (sem inventário/aptidões/arts isolados por companheiro). Um companheiro é **outro documento inteiro de `personagens`**, com o campo novo `companheiroDe` (id do personagem "base", ver seção 5) apontando pra ficha que o criou. Nova aba `.../tabs/CompanheiroTab.jsx` (+`companheiro/*`), ao lado de Veias Astrais: botão "Criar Companheiro" abre `CriarCompanheiroModal.jsx` com duas opções — ficha em branco no mesmo universo, ou duplicar a ficha atual inteira (`companheiro/duplicarPersonagem.js`, que também copia as subcoleções de aptidões/núcleos/arts/variantes/inventário, remapeando `nucleoId`/`artId` pros novos ids gerados na cópia; `historicoSorte` não é duplicado, é log transiente). A aba lista, em grade, todos os personagens com `companheiroDe == id do personagem atual` (`getCompanheiros`) **e**, se a própria ficha aberta for companheira de outra (`personagem.companheiroDe` preenchido), também mostra um card pra essa ficha "base", badge "Ficha Principal". Cada card navega pra `/personagens/{id}` como qualquer personagem — não existe conceito de ficha "somente companheiro", qualquer personagem pode ter os seus próprios companheiros.
- **Reputação (2026-07-22)**: revertida a decisão da seção 2.1/2.3 de não implementar — mas o modelo é **por Origem**, não o antigo Fama/Temor global de Mundo/Região do site vanilla (`FUNCIONALIDADES.md` §5, com limiares fixos 6/11/21/31/46/61/76/91). Cada documento do catálogo `origens` já vinha, no Firestore compartilhado, com um campo `reputacao: { fama: [{quantidade, efeito}], terror: [{quantidade, efeito}] }` — os limiares e a descrição de cada efeito são definidos pelo painel administrativo por origem, não por uma tabela fixa no código. Novo item "Reputação" no menu lateral da ficha (`FichaSidebar.jsx`, grupo "Personagem", depois de "Classe") abre `sidebar/ReputacaoModal.jsx`: grade de cards com as origens do universo do personagem (`getOrigensPorUniverso`) e, ao clicar numa origem, o mesmo Dialog troca de conteúdo (padrão já usado em `LojaModal.jsx`) para um formulário com dois números editáveis — Fama e Terror — e a lista de efeitos daquela origem, marcando quais já foram desbloqueados (`calcularEfeitosReputacao` em `common/utils/formulas.js`, com teste). O personagem só guarda os números atuais por origem, em `reputacoes: { [origemId]: { fama, terror } }` (seção 5) — os efeitos em si nunca são copiados para o documento do personagem, sempre relidos do catálogo.

### Testes

`common/utils/formulas.js` e `hooks/useDraftLocalStorage.js` têm cobertura de teste completa (fórmulas puras + o hook de rascunho, com `vi.useFakeTimers()` para o debounce). Além disso, 3 testes de fluxo com Testing Library (mockando Firebase, sem tocar rede real): criar personagem (`NovoPersonagem.test.jsx`), editar atributos (`AtributosTab.test.jsx`), adicionar item ao inventário (`InventarioTab.test.jsx`).

### Rascunho em `localStorage` (seção 7.3) — ✅ implementado em 2026-07-19

A seção 7.3 abaixo descreve **salvar explícito + rascunho em `localStorage`**: enquanto o formulário não é salvo, os valores em edição ficam espelhados em `localStorage` (debounce de 400ms) para não se perder ao fechar/recarregar a aba sem querer. Implementado como:

- `src/hooks/useDraftLocalStorage.js` — hook genérico (`lerRascunho`/`salvarRascunho`/`limparRascunho`), chave por `personagemId` + aba (ex.: `rascunho_personagem_<id>_atributos`).
- `src/components/DraftBanner/DraftBanner.jsx` — banner "Você tem alterações não salvas — Restaurar/Descartar", em vez de restaurar ou descartar silenciosamente.
- Integrado nas duas abas que usam Formik com "Salvar" explícito — **`AtributosTab.jsx`** e **`PerfilTab.jsx`** (as únicas onde esse padrão se aplica; as demais abas gravam no Firestore a cada ação do usuário, sem estado "não salvo" intermediário). Cada uma extrai um subcomponente `*FormBody` que recebe o `formik` bag como prop só para poder chamar `useEffect` com segurança — hooks não podem ser chamados dentro da função `children` passada ao `<Formik>`, já que ela não é reconhecida como componente próprio pelo React nem pelo `eslint-plugin-react-hooks`.
- O rascunho só é gravado depois que o formulário realmente diverge do que foi carregado (`formik.dirty`), pra não criar um "rascunho" idêntico ao estado inicial assim que a aba abre.
- Ao salvar com sucesso, o rascunho correspondente é limpo.
- Testado de ponta a ponta com Playwright contra o Firebase real: editar sem salvar → recarregar → banner aparece → Restaurar recupera o valor → Salvar → rascunho some do `localStorage` → recarregar de novo → banner não aparece mais.

---

## 0. Contexto: dois repositórios, um único projeto Firebase

A migração **não** é "reescrever este repositório em React". O destino real é um **novo repositório separado** — o "site dos jogadores" — que:

- Compartilha o **mesmo projeto Firebase** (Auth + Firestore) de um projeto administrativo que **já existe e já está em produção**: "Re-Dungeon — Banco de Dados" (React 19 + Vite + MUI + Firebase). Esse projeto administrativo já gerencia, em coleções Firestore próprias, boa parte dos **catálogos de conteúdo** que hoje estão hardcoded neste repositório vanilla (raças, classes, itens, aptidões, condições, artes, veias astrais, divindades, origens, regras, entre outras — ver seção 4).
- **Não recria** essas telas de administração de catálogo — o site dos jogadores é **somente leitura** para tudo que não for o personagem do próprio usuário.
- **Não é responsável por popular esses catálogos.** As informações de referência (ex.: dados de Raças e Classes hoje hardcoded em `js/racas-data.js`/`js/classes-data.js` neste repositório) serão inseridas no Firestore **separadamente**, por outro processo/pessoa, usando o próprio projeto administrativo. O site dos jogadores só implementa a **leitura** dessas coleções — nunca a criação/seed delas.
- Adiciona **apenas uma coleção nova** ao Firestore compartilhado: `personagens`, com uma regra de segurança restringindo cada documento ao seu dono (`uid`).
- Reaproveita, **copiando os arquivos praticamente como estão**, a autenticação, o tema visual e os utilitários já validados no projeto administrativo (`firebase.js`, `AuthContext.jsx` simplificado, `ProtectedRoute.jsx`, `global.css`, `yupSchemas.js`, `useStableListKeys.js`) — ver `player-site-handoff.md` §4, §6 e §10 para o código exato.

Ou seja: este documento descreve como **portar as funcionalidades de jogo** descritas em `FUNCIONALIDADES.md` (atributos, status, aptidões, arts, inventário, veias astrais etc.) para dentro dessa arquitetura já definida — não como desenhar a arquitetura do zero.

---

## 1. Diagnóstico do site atual (o que não replicar)

A análise do código vanilla revelou dívida técnica típica de um projeto que cresceu sem framework de componentes/estado. Pontos a **não replicar** na reescrita:

1. **Duas arquiteturas de estado concorrentes**: `window.appState` (realmente usado) e `window.globalState` (mais bem desenhado, mas quase não usado) coexistem sem integração completa. No novo projeto, usar um único padrão de estado, consistente com o restante da família de projetos (ver seção 7).
2. **Zero reatividade real** — sincronização entre módulos feita por **polling** (`setInterval` de 300ms a 2000ms, em dezenas de arquivos) ou por **monkey-patching** de métodos de outros managers. Em React isso vira reatividade nativa via props/state/context — nenhum polling deve sobreviver à migração.
3. **Fragmentação de persistência**: dezenas de chaves de `localStorage` independentes, 3 databases IndexedDB diferentes, e pares de chaves **duplicadas com o mesmo dado**. O Firestore deve consolidar tudo em um **documento por personagem** mais subcoleções (seção 5).
4. **Padrão de modal reimplementado manualmente dezenas de vezes**. Vira componentes MUI (`Dialog`) reutilizáveis, seguindo o padrão já usado no projeto administrativo (`EntityViewDialog` etc.).
5. **Sistemas paralelos duplicados para "personagem" e "companheiro"**: Aptidões, Arts e Inventário têm implementações **inteiras e independentes** para o personagem principal e para cada companheiro. Como Companheiros não entra nesta fase (seção 2), esse problema específico fica adiado — mas o princípio (um único módulo genérico, não duas cópias) vale para qualquer extensão futura.
6. **Bancos de dados de conteúdo "legados" ao lado dos ativos** (`data/racas.js`/`data/classes.js`/`data/loja.js` parecem não estar mais conectados à UI). Isso deixa de importar de qualquer forma: os catálogos passam a vir do Firestore do projeto administrativo (seção 4), não de arquivos JS locais.
7. **Fórmulas de jogo duplicadas em mais de um arquivo** (ex. HP/Energia/Fadiga máximos calculados em dois lugares). Na reescrita, cada fórmula deve existir **uma única vez**, como função pura testável (Vitest, já usado no projeto irmão).
8. **Nenhuma conta de usuário hoje** — tudo local ao navegador, com export/import manual de `.json` como único "backup". A migração introduz **Auth + Firestore** como funcionalidade nova, não apenas troca de tecnologia.

---

## 2. Escopo desta migração

### 2.1 Decisões já tomadas (não reabrir)
- **Reputação (Fama/Terror) — implementada em 2026-07-22, mas em modelo diferente do site vanilla.** A versão descrita em `FUNCIONALIDADES.md` §5 (Fama/Temor globais, por Mundo/Região, com limiares fixos 6/11/21/31/46/61/76/91) **não foi portada** — ver seção "Decisões e desvios" abaixo para o modelo realmente implementado, por Origem.
- **Corpo Imortal não será implementado nesta fase.** Documentado em `FUNCIONALIDADES.md` §19, fora do roadmap.
- **Companheiros não serão implementados nesta fase.** Documentado em `FUNCIONALIDADES.md` §17 (e as seções que o referenciam — Aptidões de Companheiro em §9, Companheiro Arts em §10, Inventário isolado em §17), fora do roadmap.
- **Cultivação não será implementada nesta fase.** Documentado em `FUNCIONALIDADES.md` §18, fora do roadmap.
- **A barra de desbloqueio de Classes por Power Combat continua puramente informativa.** Não vira trava automática de seleção de classe — replica o comportamento atual (marcos visuais em 100/200/300 PC), sem bloquear a escolha. A única trava real permanece sendo o limite de 3 classes simultâneas.
- **Aptidões não concedem mais bônus numérico a atributos.** No site vanilla, vantagens de aptidão (níveis 1/3/5) somavam bônus aos atributos primários/secundários (`js/vantagens-aptidoes-system.js`, `js/aptidoes-bonus-sync.js`, `js/bonus-calculator.js`). Essa mecânica **não é portada**: Aptidões e suas Vantagens passam a ser **puramente narrativas/descritivas** — não alimentam mais nenhum campo `bonus` de atributo. Isso simplifica bastante o modelo de dados e elimina toda a cadeia de sincronização/recalculo que hoje existe entre Aptidões e Atributos.
- **Loja Rokmas / Menu de Itens usa a coleção `itens` já existente, filtrada por universo.** Não há mais um catálogo próprio de loja — a loja lê a coleção `itens` do Firestore, filtrando pelos itens cujo `universo` (ou campo equivalente de escopo) corresponde ao `universo` do personagem. Resolve a "decisão pendente" que havia na versão anterior deste documento.
- **Aba de Arts/Habilidades passa a ter 3 origens possíveis para cada Art do personagem**, em vez de só a criação autoral: (1) **criar uma Art única** para aquele personagem (fluxo autoral que já existe hoje — Núcleo/Art/Variante), (2) **escolher uma das habilidades da classe** do personagem (já existe hoje, ver `FUNCIONALIDADES.md` §12 — a classe injeta habilidades como Arts), ou (3) **escolher uma Art da coleção `artes`** do Firestore, também filtrada pelo `universo` do personagem. Resolve a "decisão pendente" sobre a coleção `artes` que havia na versão anterior deste documento.
- **Salvar é explícito, não autosave contínuo — mas com rascunho local.** Ver seção 7.3.
- **Dados de referência (raças, classes, itens, aptidões, condições, artes, veias astrais, divindades, origens, regras...) são inseridos no Firestore por um processo separado**, fora deste repositório e fora do escopo deste plano — este documento cobre apenas a **leitura** desses dados pelo site dos jogadores (seção 4) e a modelagem da coleção nova `personagens` (seção 5).
- **Não haverá importação de fichas antigas (`.json` exportado pelo site vanilla).** O site dos jogadores não terá uma ferramenta de conversão do backup legado — cada jogador cria os personagens do zero no site novo, preenchendo os dados diretamente pela ficha (Formik). O botão "Importar" do site atual (`FUNCIONALIDADES.md` §23) não é portado.

### 2.2 Dentro do escopo (portar nesta fase)
Atributos, Status (HP/Energia/Fadiga), Power Combat, Sorte/Fortuna (+ histórico), Condições, Imagem do personagem (via URL), Aptidões (sem bônus numérico — seção 2.1), Arts/Habilidades (autoral + habilidade de classe + catálogo `artes` por universo), Raças, Classes, Treinamento, Inventário, Loja da Trapaça, Loja Rokmas/Menu de Itens (via `itens` por universo), Veias Astrais, Códex Mágico, Popup de Informações do Jogador, Salvar (explícito + rascunho local).

### 2.3 Fora do escopo (backlog futuro, não portar agora)
| Sistema | Por quê fica de fora agora |
|---|---|
| Corpo Imortal | Decisão de produto — não implementar nesta fase |
| Companheiros (ficha, inventário isolado, aptidões/arts de companheiro, clonagem) | Decisão de produto — não implementar nesta fase |
| Cultivação (universal + Elder Gods/Boreal Line/Murim) | Decisão de produto — não implementar nesta fase |
| Importação de ficha antiga (`.json` do site vanilla) | Decisão de produto — sem ferramenta de conversão; personagens começam do zero no site novo |

A modelagem do documento `personagens` (seção 5) deixa esses campos comentados/reservados para que, quando algum deles voltar ao roadmap, a estrutura de dados não precise ser redesenhada do zero.

---

## 3. Stack obrigatória (herdada do projeto irmão)

Definida em `player-site-handoff.md` §5 — **não é uma escolha em aberto**, é a stack já usada e validada no projeto "Re-Dungeon — Banco de Dados", e deve ser replicada aqui por consistência:

| Camada | Escolha | Observação |
|---|---|---|
| Build | **Vite** | |
| UI | **React 19** (componentes funcionais + Hooks) | sem TypeScript — o projeto irmão usa **PropTypes** |
| Componentes visuais | **Material-UI (`@mui/material`)** | reaproveitar tema/paleta do projeto administrativo |
| Estilização | **Styled Components** | + `src/common/styles/global.css` (variáveis `--color-primary`, `--bg-card`, `--text-muted` etc.) copiado do projeto atual, para manter o mesmo visual dark/glassmorphism |
| Roteamento | **React Router DOM v7** | |
| Formulários/validação | **Formik + Yup** | reaproveitar `src/common/utils/yupSchemas.js` (`nomeSchema`, `campoCurtoSchema`, `descricaoSchema`, `urlImagemSchema`) |
| Dados remotos | **Firebase Firestore** (mesmo projeto do site administrativo) | **sem Firebase Storage** — ver seção 6 |
| Autenticação | **Firebase Auth** (mesmo projeto) — e-mail/senha, cadastro e Google | código pronto em `player-site-handoff.md` §4 |
| Tipagem de props | **PropTypes** | não introduzir TypeScript |
| Lint/format | **ESLint** (`eslint-plugin-jsx-a11y`, `eslint-config-prettier`) + **Prettier** | `no-console` e `react-hooks/exhaustive-deps` como erro |
| Testes | **Vitest** + **Testing Library** | primeira suíte de testes do "universo" ReDungeon deve nascer aqui, cobrindo as fórmulas puras (seção 7.2) |

Versões de referência (mesmas do projeto atual, para evitar incompatibilidade se algum código for copiado entre repositórios):
```json
"@mui/material": "^9.1.2",
"firebase": "^12.15.0",
"formik": "^2.4.9",
"react": "^19.2.7",
"react-router-dom": "^7.18.0",
"styled-components": "^6.4.3",
"yup": "^1.7.1"
```

**O que isso substitui, em relação ao que era cogitado antes desta revisão**: nada de Zustand/Redux, nada de React Hook Form + Zod, nada de TypeScript, nada de CSS Modules com design system próprio, nada de Firebase Storage. O objetivo é o novo site parecer "o mesmo produto" que o painel administrativo, não uma stack paralela.

---

## 4. Dados de referência já existentes no Firestore — não duplicar, não popular

O projeto administrativo já mantém, no mesmo Firestore, as coleções abaixo (formato `{ id, ...campos, createdAt, updatedAt }`, leitura liberada a qualquer usuário autenticado via `allow read: if isAuth();`):

`classes`, `materiais`, `racas`, `itens`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`, `divindades`, `aptidoes`, `Universo`.

O site dos jogadores **só precisa das funções `get*` (leitura)** dessas coleções — nunca `add*`/`update*`/`remove*`, e nunca um script de seed a partir deste repositório vanilla (seção 2.1 — o preenchimento desses dados é responsabilidade de outro processo). A tabela abaixo mapeia cada sistema de `FUNCIONALIDADES.md` para a coleção correspondente:

| Sistema (FUNCIONALIDADES.md) | Coleção existente | Situação |
|---|---|---|
| §11 Raças | `racas`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/racas-data.js` por `getRacasPorUniverso(universoId)` |
| §12 Classes | `classes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/classes-data.js` por `getClassesPorUniverso(universoId)` |
| §9 Aptidões (catálogo) | `aptidoes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/aptidoes-db.js` por `getAptidoesPorUniverso(universoId)`. Schema **simplificado**: como aptidões não concedem mais bônus numérico a atributos (seção 2.1), cada documento de `aptidoes` só precisa de nome/descrição + o texto narrativo de Vantagem por nível — sem campos de fórmula/valor de bônus |
| §7 Condições | `condicoes`, filtrada por `universo` | ✅ mapeamento direto — trocar `js/rd-cond-sistema.js` (catálogo) por `getCondicoesPorUniverso(universoId)` |
| §20 Veias Astrais (árvore) | `veiasAstrais`, filtrada por `universo` + `divindades` | ✅ boa aderência — a árvore de 5 constelações × 10 nós é dado de referência puro (`getVeiasAstraisPorUniverso(universoId)`); `divindades` cobre as 5 divindades temáticas (Arty/Aune/Ephelias/Nishi/Hestia). O que fica **por personagem** é só: quais nós foram desbloqueados e quanto PC foi gasto |
| §14 Inventário (itens) | `itens`, filtrada por `universo` | ✅ mapeamento direto para o catálogo de itens — o inventário do personagem passa a ser uma lista de referências `{itemId, quantidade}`, não mais objetos duplicando nome/descrição/imagem |
| Inventário (materiais/receitas) | `materiais`/`receitas`, filtradas por `universo` | ✅ **resolvido (2026-07-21)**: mesmo padrão de cópia própria de §14 — subcoleções `materiaisInventario`/`receitasInventario` em `personagens/{id}`, cada doc com `origem: 'autoral' \| 'catalogo'` + `materialId`/`receitaId` opcional. Não fazem parte do cálculo de espaço (`calcularEspacoInventario`), pois nenhuma das duas coleções tem campo de peso |
| §16 Menu de Itens / Loja Rokmas | `itens`, filtrada por `universo` | ✅ **resolvido**: a loja não tem mais catálogo próprio — lê `itens` filtrando por `where('universo', '==', personagem.universo)` |
| §10 Arts/Habilidades (Núcleos/Arts/Variantes) | `artes`, filtrada por `universo`, **+ habilidades da classe do personagem** | ✅ **resolvido**: cada Art do personagem agora tem 3 origens possíveis — (1) autoral (Núcleo/Art/Variante criados livremente, como hoje), (2) escolhida entre as habilidades da classe do personagem (já lida de `classes`), (3) escolhida da coleção `artes` filtrada por `where('universo', '==', personagem.universo)`. Ver modelagem em §5 |
| §22 Popup Info do Jogador (campo Origem) | `origens` | ✅ mapeamento direto — `origem` no documento `personagens` referencia um id de `origens` |
| Reputação (Fama/Terror) — **modelo novo, não é o do §5 antigo** | `origens`, campo `reputacao: { fama: [{quantidade, efeito}], terror: [{quantidade, efeito}] }` | ✅ **implementado em 2026-07-22**: cada origem no catálogo carrega sua própria lista de limiares/efeitos de Fama e de Terror; o personagem só guarda os números atuais (campo `reputacoes`, seção 5) |
| §21 Códex Mágico | `regras` (candidato) | ⚠️ **oportunidade, não obrigatório**: hoje é texto estático em `js/codex-magico.js`. Migrar esse conteúdo para a coleção `regras` deixaria o texto editável pelo painel administrativo sem novo deploy do site dos jogadores — avaliar com o time se vale a pena para esta fase ou se fica como texto estático mesmo |
| §17 Companheiros, §18 Cultivação | — | Fora do escopo desta fase (seção 2.3) — não relevante agora |
| §15 Loja da Trapaça, §6 Sorte/Fortuna, §13 Treinamento | nenhuma coleção equivalente | Mecânicas de jogo específicas do personagem (saldo, histórico, XP) — permanecem embutidas no documento/subcoleções de `personagens`, sem catálogo de referência |
| `cardflux` | — | Coleção existente **sem funcionalidade correspondente** em `FUNCIONALIDADES.md` — provavelmente um sistema futuro (jogo de cartas?) fora do escopo atual. Não assumir mapeamento nem duplicar; apenas não usar por enquanto |

### 4.1 O campo `universo` é a chave de escopo transversal — **confirmado**
`racas`, `classes`, `condicoes`, `aptidoes`, `veiasAstrais`, `itens` e `artes` são **todas** filtradas pelo `universo` do personagem antes de aparecer como opção — esse é o mesmo conceito de "universo temático" que hoje agrupa Raças/Classes em pastas no site vanilla (Re'Geron, The Chaotical Gate, Cultivo, One Piece, Bleach, A Crônica dos Varkhan). `divindades` e `regras` não são mencionadas como filtradas — tratar como compartilhadas entre universos, salvo indicação em contrário do painel administrativo.

**`origens` também tem campo `universo`** (confirmado inspecionando documentos reais em 2026-07-22) — `getOrigensPorUniverso(universoId)` foi adicionada para a Reputação (acima) filtrar por ele. `getOrigens()` (sem filtro, usada pelo seletor de Origem em `PerfilTab.jsx`) **não foi alterada** para não mudar o comportamento de uma tela fora do escopo desta mudança — mas é candidata a virar `getOrigensPorUniverso` numa limpeza futura, já que hoje lista origens de todos os universos misturadas.

### 4.2 Convenção id × nome de exibição — **confirmada**
Em todo campo que referencia outra coleção (`universo`, `raca`, `classes`, `origem`, ids dentro de `inventario`/`aptidoesAdquiridas`/`arts`/etc.), o documento `personagens` **sempre salva o `id`** do documento referenciado — nunca o nome como string solta. No front-end, o componente responsável por exibir esse campo resolve o `id` para o **campo `Nome`** do documento correspondente (buscado via `get*`/`getPorUniverso`, com cache local simples por tela — ex.: um `Map<id, nome>` montado a partir da lista já carregada para popular o `<Select>`). Isso vale para `universo` também: salva-se o `id` do documento em `Universo`, e a UI exibe o `Nome` desse documento (ex. no seletor de universo do personagem, e em qualquer lugar que mostre "Universo: Re'Geron").

---

## 5. Modelagem da coleção `personagens`

Único documento novo a ser criado no Firestore compartilhado. Segue o schema-base sugerido em `player-site-handoff.md` §3.2, **estendido** para cobrir o restante da ficha descrita em `FUNCIONALIDADES.md` dentro do escopo desta fase (seção 2.2). Mantém a convenção `{ id, uid, ...campos, createdAt, updatedAt }` do resto do projeto.

```js
{
  id: string,                 // gerado pelo Firestore
  uid: string,                 // dono — obrigatório, imutável após criação

  // ── campos do schema-base do handoff ──────────────────────────────
  nome: string,                 // nomeSchema
  raca: string,                 // id em `racas` (opcional)
  classes: string[],             // ids em `classes` — até 3 (multiclasse, FUNCIONALIDADES.md §12)
  origem: string,                // id em `origens` (opcional)
  universo: string,              // id em `Universo` — sempre o id salvo; o front resolve para o campo `Nome`
                                  // do documento `Universo` na exibição (seção 4.2). Define o escopo de
                                  // `racas`/`classes`/`condicoes`/`aptidoes`/`veiasAstrais`/`itens`/`artes` (seção 4.1)
  atributosBase: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },   // number
  atributosBonus: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },  // number — editável manualmente
                                  // (ex.: bônus de raça/evento); NÃO é mais alimentado por Aptidões (seção 2.1)
  atributosExtra: { forca, vitalidade, agilidade, inteligencia, percepcao, sorte },  // number
  // inventário: ver subcoleção `itensInventario` na seção 5.1 (deixou de ser array embutido)
  linkImagem: string,            // urlImagemSchema — ver seção 6, sem upload/Storage
  descricao: string,             // descricaoSchema — história/aparência

  // ── extensões para cobrir o restante da ficha (FUNCIONALIDADES.md, dentro do escopo — §2.2) ─
  jogadorInfo: {
    titulo, afiliacao, statusNarrativo, notasAdicionais, background /* html */
  },
  secundariosBase, secundariosExtra, secundariosBonus: {   // mesmo padrão dos primários
    prontidao, ataque, defesa, reacao, precisao, evasao
  },
  status: {
    hp:      { base, extra, bonus },
    energia: { base, extra, bonus },
    fadiga:  { base, extra, bonus }
  },
  sorte: { fortunaAtual: number, ultimaRolagemData: string /* YYYY-MM-DD */ },
  treinamento: { [atributo]: { xpAtual: number, nivel: number } },
  condicoesAtivas: [ { condicaoId /* ref `condicoes` */, stack, duracaoRestante, aplicadoEm } ],
  veiasAstrais: { powerCombatGasto: number, nosDesbloqueados: [nodeId /* ref `veiasAstrais` */] },
  lojaTrapaça: { saldoFortuna, efeitosAtivos: [...], historicoCompras: [...] },
  lojaRokmas:  { saldoRokmas, historicoCompras: [...] },   // itens comprados vêm de `itens` filtrada por `universo`
  reputacoes: { [origemId]: { fama: number, terror: number } },   // implementado 2026-07-22 — ver seção 2.1/4
  companheiroDe: string | null,   // implementado 2026-07-22 — id de outro doc `personagens`, se este for um Companheiro (ver seção 2.1/4)

  // reservado para quando estes sistemas voltarem ao roadmap (não usar ainda — seção 2.3)
  // corpoImortal: { dantian, meridianos, refino, marEspiritual, melhoriasDesbloqueadas: [...] },
  // cultivacao: { universal: {...}, elderGods: {...}, borealLine: {...}, murim: {...} },

  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

### 5.1 Subcoleções
Listas que crescem sem limite previsível ao longo de uma campanha ficam em subcoleção, para não esbarrar no limite de 1MB por documento e para permitir query/paginação:

```
personagens/{personagemId}/aptidoesAdquiridas/{aptidaoId}
  nivel: number     // referencia `aptidoes`; sem campo de bônus — Vantagens são só texto narrativo (seção 2.1)

personagens/{personagemId}/nucleos/{nucleoId}
  nome, tipo: string           // tipo é um dos valores de TIPO_ART_OPTIONS (Ofensiva, Defensiva, ...)
  bonus: string                 // opcional, texto curto — exibido como "Essência:" no card
  descricao: string              // texto longo — exibido na seção "✨ Essência" do card
  imagem: string                  // URL opcional (sem Firebase Storage — ver seção 6)
  classeId: string                 // opcional — presente só quando o Núcleo foi criado automaticamente ao
                                     //   escolher uma classe (ClasseModal.jsx); evita recriar o Núcleo da mesma classe

personagens/{personagemId}/arts/{artId}
  origem: 'autoral' | 'classe' | 'catalogo',
  nucleoId: string    // obrigatório em QUALQUER origem — referencia um doc de `nucleos` acima
  imagem: string        // URL opcional
  ativa: boolean
  cantico: string          // opcional — texto do verso/encantamento recitado
  circuloMagico: string     // opcional — ex.: "12º", "Nenhum"
  condicoesAplicadas: string[]  // opcional — ids de `condicoes` (mesmo catálogo somente-leitura da aba
                                  //   Condições, filtrado por universo via getCondicoesPorUniverso)
  // se origem === 'autoral': campos completos (tipo, dominio, tipoAcao, recarga, duracao,
  //   alcance, alvos, custo, dados, descricao), como hoje em `redungeon_character`
  // se origem === 'classe': { classeId, habilidadeId, nome, descricao } — referencia a habilidade já definida em `classes`
  //   (campos alcance/alvos/custo/recarga/dados/duracao/tipoAcao remapeados dos nomes próprios da
  //   habilidade — alvo/acao — quando existirem; `dados` já usa o mesmo nome dos dois lados; as
  //   habilidades de classe não têm cantico/circuloMagico/condicoesAplicadas)
  // se origem === 'catalogo': { arteId, nome } — referencia um documento em `artes` (filtrado por `universo`),
  //   + qualquer campo (dominio/custo/dados/recarga/duracao/alcance/alvos/descricao/imagem/cantico/
  //   circuloMagico) que o item do catálogo já tiver, copiado na hora de escolher — `acao` vira `tipoAcao`,
  //   `classificacao` vira `tipo` (o catálogo usa `tipo` pra outra coisa — recurso gasto tipo "Fadiga", não
  //   a classificação Ofensiva/Defensiva/etc.), e `condicoesAplicadas` (array de objetos completos de
  //   condição no catálogo) vira array só dos ids, resolvidos contra `condicoes` na hora de exibir

personagens/{personagemId}/variantes/{varianteId}
  artId: string        // obrigatório — a Art base (personagens/{personagemId}/arts/{artId})
  nome, tipo, tipoAcao: string
  dominio: number        // sempre MENOR que o domínio da Art base (dominioVarianteValido em common/utils/formulas.js)
  custo, recarga, dados, duracao, alcance, alvos, descricao, imagem: string
  // não conta no limite de Arts ativas — vive numa coleção própria

personagens/{personagemId}/itensInventario/{itemInventarioId}
  origem: 'autoral' | 'catalogo',
  itemId: string | null   // só proveniência/rastreio quando origem === 'catalogo' — nunca relido pra exibir
  nome, qualidade, tipo, dados, extra: string     // `dados` é a "Roll" (ex.: "2d4+3")
  nivelAtual: number, nivelMaximo: number | null
  pesoUnitario: number, bonusEspaco: number        // bonusEspaco = mochila/armazenamento (opcional)
  linkImagem: string                                 // URL opcional
  descricao: string                                    // opcional — flavor text geral do item
  habilidadesEspeciais: [ { nome, descricao } ]          // opcional
  quantidade: number, equipado: boolean
  // cópia própria do personagem, nunca uma referência viva ao catálogo `itens` — o jogador
  // edita livremente (todos os campos acima) sem que isso altere o doc do catálogo. Ao
  // escolher do catálogo, os campos são copiados 1:1 (mesmos nomes do doc de `itens`).

personagens/{personagemId}/historicoSorte/{eventoId}
  tipo, descricao, valor, timestamp

// Companheiros NÃO são uma subcoleção — são outro doc top-level de `personagens`,
// com `companheiroDe` apontando pro id do personagem "base" (ver seção 5 e 2.1/4).
```

Listas pequenas e naturalmente limitadas (condições ativas, histórico de sorte truncado, classes selecionadas — máx. 3) ficam como array embutido no documento principal, como no schema acima.

### 5.2 `service/storage.js`
Seguir **exatamente** o padrão genérico já usado no projeto administrativo (`getFirestoreItems`/`addFirestoreItem`/`updateFirestoreItem`/`removeFirestoreItem` por trás de wrappers finos), mas:
- `getPersonagens()` deve filtrar por `where('uid', '==', currentUser.uid)` **na query**, não buscar tudo e filtrar no cliente (personagens de outros usuários não devem nem trafegar até o navegador).
- `getUniverso()`, `getOrigens()` e `getDivindades()` são **somente leitura**, sem filtro por universo (seção 4.1) — reaproveitar o padrão genérico já existente sem adicionar `add*`/`update*`/`remove*` para essas coleções.
- `getRacasPorUniverso(universoId)`, `getClassesPorUniverso(universoId)`, `getCondicoesPorUniverso(universoId)`, `getAptidoesPorUniverso(universoId)`, `getVeiasAstraisPorUniverso(universoId)`, `getItensPorUniverso(universoId)` e `getArtesPorUniverso(universoId)` são variações filtradas (`where('universo', '==', universoId)`), todas **somente leitura**, usadas nas respectivas telas de seleção assim que o `universo` do personagem estiver definido.

---

## 6. Imagens — apenas URL, sem Firebase Storage

O stack do handoff **não inclui Firebase Storage** (nem nas dependências, nem nas variáveis de ambiente além do `storageBucket` padrão do config). O padrão a seguir é o mesmo já usado no resto do projeto: campo de texto validado por `urlImagemSchema` (Yup), igual ao `linkImagem` do schema de `personagens`.

Isso é, na prática, uma simplificação em relação ao comportamento atual do site vanilla, que hoje suporta **upload local** (convertido para base64, comprimido, salvo em IndexedDB) **além de** URL externa. Para esta fase da migração:
- Suportar **somente URL externa** (ex.: Imgur) para a imagem do personagem — consistente com `urlImagemSchema` e com o que o painel administrativo já faz para `itens`/`racas`/`classes`.
- **Não portar** a lógica de upload/compressão/IndexedDB (`image-compressor.js`, `imagem-otimizacao.js`, `image-db-manager.js`, `imagem-storage-manager.js`) — é código que deixa de ter função nesta arquitetura.
- Se upload direto de arquivo vier a ser um requisito real no futuro, isso significa **adicionar Firebase Storage** como uma decisão de produto nova — não assumir isso como parte desta migração.

---

## 7. Estado no frontend e cálculos derivados

### 7.1 Sem gerenciador de estado global novo
O projeto irmão não usa Redux/Zustand/Context complexo — o padrão observado é: página busca dados via `service/storage.js`, mantém em `useState`/Formik, formulário edita com Formik+Yup, salva com `updatePersonagem`/`addPersonagem`. Para manter consistência, **não introduzir Zustand/Redux** aqui. Usar:
- `useState`/`useEffect` (ou um `React.Context` simples, escopado à página de edição de personagem) para os dados carregados do Firestore.
- **Formik** como dono do estado do formulário de edição da ficha (provavelmente um Formik por aba/seção grande — Atributos+Status, Inventário, Arts etc. — para não ter um único formulário gigante).
- Cálculos derivados (ver 7.2) chamados a partir dos `values` do Formik em `useMemo`, não em `setInterval`.

### 7.2 Fórmulas puras — o coração da lógica de jogo
Independente da escolha de state management, as fórmulas descritas em `FUNCIONALIDADES.md` devem ser extraídas para funções puras, testadas com Vitest, e chamadas sob demanda (nunca por polling):

```js
calcularSecundarios(primariosTotais)                         // §2
calcularStatusMaximos(primariosTotais, statusBase)            // §3
calcularPowerCombat(primariosTotais, secundariosTotais)        // §4
calcularRolagemFortuna(sorteTotal)                              // §6
calcularLimiteAptidoes(primariosTotais, ganhas)                  // §9
calcularLimiteArts(primariosTotais)                                // §10
calcularEspacoInventario(primariosTotais, itensNaoEquipados)        // §14
calcularResultadoTreino(nivel, horas, bonusAptidao, bonusSorte, bonusMestre)  // §13
```
Note que **não existe mais** `calcularBonusDeAptidoes` — aptidões deixaram de conceder bônus numérico a atributos (seção 2.1); o campo `atributosBonus`/`secundariosBonus` do documento `personagens` passa a ser só um ajuste manual (ex.: bônus de raça, efeito temporário concedido pelo mestre), não algo derivado automaticamente do catálogo de aptidões.

Essas funções não dependem de React nem de Firebase — só de números e do catálogo já carregado — o que as torna o ponto de partida ideal para a primeira suíte de testes automatizados do "universo" ReDungeon.

### 7.3 Salvar: submit explícito + rascunho em localStorage
Decisão confirmada: **não replicar** o autosave contínuo do site vanilla (que grava a cada 2s em background). O padrão a seguir é:
- **Persistência real (Firestore) é sempre por ação explícita do usuário** — botão "Salvar" por aba/seção, disparando `updatePersonagem` (Formik `onSubmit`), igual às demais telas administrativas do projeto irmão.
- **Enquanto o formulário não foi salvo**, os valores em edição ficam espelhados em `localStorage` (chave por `personagemId` + aba, ex. `rascunho_personagem_<id>_atributos`) a cada mudança de campo (debounce curto, ex. 300-500ms, só para não gravar a cada tecla). Isso evita perda de trabalho em caso de fechar a aba/recarregar a página sem salvar.
- Ao abrir a tela de edição, se existir um rascunho em `localStorage` mais recente que o documento carregado do Firestore, avisar o usuário (ex.: banner "Você tem alterações não salvas — restaurar?") em vez de descartar silenciosamente.
- Ao salvar com sucesso no Firestore, **limpar o rascunho correspondente** do `localStorage` (a fonte de verdade volta a ser só o Firestore).
- Isso é bem mais simples que o mecanismo de auto-save do site legado (sem `setInterval`, sem múltiplas cópias de estado) e ainda protege contra perda de dados por acidente — o melhor dos dois comportamentos sem herdar a complexidade do sistema atual.

---

## 8. Autenticação e regras de segurança

**Não redesenhar isso** — `player-site-handoff.md` §4 já traz o código completo e pronto para copiar:
- §4.1 `src/service/firebase.js` — igual, byte a byte, ao do projeto administrativo (mesmo `firebaseConfig` via `.env`, mesmo projeto Firebase).
- §4.2 `src/context/AuthContext.jsx` — versão **simplificada** (sem `usePermissions`/`isAdmin`/`allowedUniversos`, que só fazem sentido no painel administrativo).
- §4.3 `src/components/ProtectedRoute/ProtectedRoute.jsx` — adaptado para **redirecionar para `/login`** (em vez de mostrar "Acesso Restrito"), já que aqui não existe conteúdo público.

Regra do Firestore para a nova coleção (adicionar ao `firestore.rules` **do projeto administrativo**, que é quem controla o Firestore compartilhado — o novo repositório não tem esse arquivo):
```
match /personagens/{personagemId} {
  allow read:   if isAuth() && resource.data.uid == request.auth.uid;
  allow create: if isAuth() && request.resource.data.uid == request.auth.uid;
  allow update: if isAuth() && resource.data.uid == request.auth.uid
                && request.resource.data.uid == request.auth.uid;
  allow delete: if isAuth() && resource.data.uid == request.auth.uid;
}
```
Subcoleções (`aptidoesAdquiridas`, `arts`, `historicoSorte`) herdam a mesma checagem, mas como regra do Firestore não herda automaticamente para subcoleções, cada uma precisa do próprio bloco `match /personagens/{personagemId}/{subcolecao}/{docId}` com a mesma condição (validar o `uid` lendo o documento pai via `get()`).

Não é necessário nenhum bloco de regra novo para `racas`/`classes`/`itens`/etc. — já têm `allow read: if isAuth();`, e a escrita já é bloqueada para quem não tem `userPermissions` (todo jogador comum).

⚠️ Como no handoff: nunca confiar apenas na UI para essa restrição — a regra do Firestore é a camada que realmente impede um jogador de ler/editar o personagem de outro.

---

## 9. Estrutura de pastas e componentes

Seguir a mesma organização do projeto administrativo (`player-site-handoff.md` §7), adaptada às páginas deste site:

```
src/
├── assets/
├── common/
│   ├── constants/        # routes.js, navItems.js
│   ├── styles/           # global.css (copiado do projeto atual)
│   └── utils/             # yupSchemas.js (copiado), formulas.js (NOVO — seção 7.2)
├── components/            # Header, Layout, ProtectedRoute, Modal/Dialog genérico, RarityBadge...
├── context/
│   └── AuthContext.jsx    # simplificado, sem isAdmin/universos
├── hooks/
│   ├── useStableListKeys.js
│   └── useDraftLocalStorage.js   # NOVO — rascunho local descrito na seção 7.3
├── pages/
│   ├── Login/
│   └── Personagens/
│       ├── Personagens.jsx       # "Meus Personagens", grid filtrado por uid
│       ├── NovoPersonagem.jsx    # criar/editar — Formik por aba
│       ├── FichaPersonagem/       # sub-rotas ou abas: Atributos, Status, Aptidoes, Arts,
│       │                          # Inventario, Treinamento, LojaTrapaça, LojaRokmas,
│       │                          # Sorte, Condicoes, VeiasAstrais, Codex, InfoJogador
│       ├── styles.js
│       └── utils.js               # schema Yup da ficha
├── routes/
│   └── index.jsx
└── service/
    ├── firebase.js         # copiado do projeto atual
    └── storage.js           # getPersonagens/add/update/remove + get* de leitura das coleções de referência
```

Cada "feature" do jogo dentro do escopo (Atributos, Aptidões, Arts, Inventário, Treinamento, as duas Lojas, Sorte, Condições, Veias Astrais, Códex, Info do Jogador) vira uma seção/aba dentro de `FichaPersonagem/`, não uma página de rota isolada — mantendo a mesma sensação de "SPA de abas" do site atual, mas dentro do modelo de páginas do React Router. **Companheiros e Cultivação não têm pasta nesta fase** (seção 2.3).

### 9.1 Componentes reutilizáveis a criar desde já
Mesmo sem Companheiros nesta fase, vale desenhar o componente de Inventário e o de Aptidões/Arts já parametrizados por um "caminho de dados" (`personagens/{id}/...`) em vez de referenciar `personagens/{id}` diretamente no código — isso não custa nada agora e evita reescrever esses componentes quando Companheiros voltar ao roadmap.

---

## 10. Roadmap de migração em fases

### Fase 0 — Fundação (checklist de `player-site-handoff.md` §10)
- `npm create vite@latest` + instalar dependências da seção 3 (não criar projeto Firebase novo — é o mesmo do painel administrativo).
- Copiar `.env` com as mesmas credenciais Firebase do projeto atual.
- Copiar `src/common/styles/global.css`, `src/common/utils/yupSchemas.js`, `src/hooks/useStableListKeys.js`.
- Implementar `firebase.js`, `AuthContext.jsx` e `ProtectedRoute.jsx` exatamente como em `player-site-handoff.md` §4.
- Construir `/login` e o layout base (Header, navegação).
- Adicionar o bloco de regra `personagens` (seção 8) ao `firestore.rules` **do projeto administrativo** e fazer `firebase deploy --only firestore:rules` **a partir daquele repositório** (este repositório novo não controla o Firestore).

### Fase 1 — Camada de leitura de dados de referência
- Implementar em `service/storage.js` as funções somente-leitura `getUniverso`, `getOrigens`, `getDivindades` (sem filtro) e `getRacasPorUniverso`, `getClassesPorUniverso`, `getCondicoesPorUniverso`, `getAptidoesPorUniverso`, `getVeiasAstraisPorUniverso`, `getItensPorUniverso`, `getArtesPorUniverso` (filtradas por `universo`, seção 4.1).
- Implementar a convenção id×nome de exibição (seção 4.2) num helper único (ex. `resolveNome(colecaoCarregada, id)`), reaproveitado por todos os `<Select>`/labels que referenciam outra coleção.
- **Não** escrever nenhum script/ferramenta para popular essas coleções a partir dos arquivos deste repositório vanilla — isso é feito por outro processo (seção 2.1/4).

### Fase 2 — Núcleo da ficha (Atributos + Status + Power Combat)
- Implementar `common/utils/formulas.js` com as fórmulas da seção 7.2, com testes Vitest cobrindo os casos descritos em `FUNCIONALIDADES.md` §2-§4.
- Tela/aba de Atributos (grid de primários/secundários, formulário Formik) e Status, lendo/escrevendo em `personagens`.
- Este é o sistema mais crítico — todo o resto depende dos totais de atributos.

### Fase 3 — Progressão de personagem
- Raças, Classes (multiclasse até 3, barra de PC **informativa apenas** — seção 2.1), Treinamento.
- Sorte/Fortuna (+ histórico), Condições, Imagem do personagem (URL).

### Fase 4 — Aptidões e Arts
- Aptidões (sem bônus numérico — seção 2.1), lendo o catálogo de `aptidoes`.
- Arts com as 3 origens (seção 2.1/5): autoral, habilidade de classe, catálogo `artes` por universo.

### Fase 5 — Inventário e economia
- Inventário genérico (referenciando `itens` + quantidade).
- Loja da Trapaça (Fortuna, sem catálogo de referência) e Loja Rokmas (lendo `itens` por universo).

### Fase 6 — Veias Astrais
- Consumindo `veiasAstrais` + `divindades`; maior esforço de UI desta fase — pan/zoom sobre árvore de nós.

### Fase 7 — Conteúdo de apoio e portabilidade
- Códex Mágico (avaliar migrar para `regras`, seção 4).
- Popup Info do Jogador (campo `origem` referenciando `origens`; editor rich text para `background` — considerar `TipTap`/`Lexical`).

### Fase 8 — Polimento e lançamento
- Revisão das regras de segurança do Firestore (seção 8).
- Testes Vitest das fórmulas (seção 7.2) + testes de fluxo (criar personagem, editar atributos, criar item).
- Deploy (GitHub Pages, via GitHub Actions — ver `.github/workflows/deploy.yml`).

### Backlog futuro (fora desta migração)
Reputação, Corpo Imortal, Companheiros, Cultivação — ver seção 2.3. Quando alguma dessas voltar ao roadmap, reabrir a modelagem comentada na seção 5 e criar uma fase própria, seguindo o mesmo padrão de leitura de catálogo (se aplicável) + campos/subcoleção em `personagens`.

---

## 11. Riscos, decisões pendentes e pontos de atenção

### Decisões já resolvidas (não reabrir)
- ✅ Corpo Imortal, Companheiros e Cultivação ficam fora desta fase (seção 2). Reputação **saiu dessa lista em 2026-07-22** — foi implementada, mas em modelo por Origem (não o antigo Mundo/Região), ver seção 2.1.
- ✅ Barra de desbloqueio de Classes por Power Combat permanece apenas informativa, sem virar trava automática (seção 2.1).
- ✅ Aptidões não concedem mais bônus numérico a atributos — Vantagens são só texto narrativo (seção 2.1).
- ✅ Loja Rokmas lê `itens` filtrada por `universo` do personagem — sem catálogo próprio (seção 2.1/4).
- ✅ Arts do personagem têm 3 origens: autoral, habilidade de classe, ou catálogo `artes` filtrado por `universo` (seção 2.1/5).
- ✅ Salvar é explícito (Formik `onSubmit` → Firestore), com rascunho espelhado em `localStorage` enquanto não salvo (seção 7.3).
- ✅ Sem Firebase Storage — imagens só por URL (seção 6).
- ✅ Sem Zustand/Redux/TypeScript — stack segue exatamente `player-site-handoff.md` (seção 3).
- ✅ Este repositório **não** é responsável por popular os catálogos de referência no Firestore — isso é feito separadamente (seção 2.1/4).
- ✅ Campo de escopo por universo se chama `universo` e guarda o **id** do documento em `Universo` (não um slug/string solta) — usado por `racas`, `classes`, `condicoes`, `aptidoes`, `veiasAstrais`, `itens` e `artes` (seção 4.1).
- ✅ Convenção de exibição: qualquer campo que referencia outra coleção salva o **id**; o front-end resolve para o campo **`Nome`** do documento referenciado ao exibir (seção 4.2) — nunca salvar o nome como string solta em `personagens`.
- ✅ Schema de `aptidoes` simplificado: sem campos de fórmula/valor de bônus — cada aptidão só precisa de nome/descrição + texto narrativo de Vantagem por nível (seção 4).
- ✅ **Sem importação de fichas antigas** — não há ferramenta de conversão do `.json` exportado pelo site vanilla; personagens são criados do zero no site novo (seção 2.1/2.3). Isso elimina toda a necessidade de ler `localStorage`/IndexedDB do site legado neste projeto.

### Decisões pendentes (confirmar antes de codar a fase correspondente)
- ⚠️ Nenhuma decisão de modelagem em aberto no momento — revisar esta lista a cada nova informação do time do painel administrativo.

### Pendências de confirmação com a mesa (já codado, valores a validar)
- ⚠️ **Limiares de Treinamento** (`common/utils/formulas.js`, bloco "Treinamento" — `DADO_XP_POR_TIER`, `calcularXpNecessario`, limiares de crítico/sucesso/quase/falha): a documentação de regras não define os números exatos, então os valores em uso são uma escolha autoral, sinalizada com `⚠️` no próprio código. Quando o responsável do jogo confirmar (ou corrigir) esses números, atualize `formulas.js` + `formulas.test.js` e remova o aviso do código e desta linha.

### Notas remanescentes sobre o código legado
Como não há importação de fichas antigas, os riscos específicos de leitura de `localStorage`/IndexedDB do site vanilla (chaves duplicadas, dois donos do banco `ReDungeonDB`, imagens em base64 etc.) deixam de ser relevantes para este projeto. Ainda vale como referência ao consultar o código antigo por contexto:
- **`html-components/popup-ativar-astral.html`** e `js/svg-atributos.js` são código órfão no site legado — não usar como referência de comportamento esperado.
- **Sem testes automatizados no site legado** — a extração das fórmulas (seção 7.2) é o momento de criar a primeira suíte de testes do "universo" ReDungeon.
