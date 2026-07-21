# Melhorias Propostas — ReDungeon Player Site

Este documento lista melhorias concretas para o projeto, priorizadas por impacto/esforço, com passo a passo de implementação para cada uma. Todas foram levantadas observando o estado atual do código (`2026-07-20`) — não são hipotéticas.

Leia também [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md) (seção "Status da implementação") para saber o que já foi feito; este documento cobre o que falta **além** do roadmap de migração, que já está 100% implementado (falta só o deploy final, item 8 abaixo).

---

## Resumo

| # | Melhoria | Impacto | Esforço |
|---|---|---|---|
| 1 | CI no GitHub Actions (lint + test + build) | Alto | Baixo |
| 2 | `.env.example` para onboarding | Médio | Baixo |
| 3 | Tratamento de erro nas operações do Firestore | Alto | Médio |
| 4 | Error Boundary global | Médio | Baixo |
| 5 | Cobertura de teste nas abas sem teste | Alto | Médio/Alto |
| 6 | Code splitting por rota (`React.lazy`) | Baixo/Médio | Baixo |
| 7 | Testes de `firestore.rules` com o Emulator Suite | Médio | Médio |
| 8 | Deploy no Firebase Hosting | Alto | Baixo (mas precisa autorização) |
| 9 | Auditoria de acessibilidade e Lighthouse | Médio | Baixo |
| 10 | Renomear `data/`/schema pendências do `MIGRACAO-REACT-FIREBASE.md` | Baixo | Baixo |

---

## 1. CI no GitHub Actions (lint + test + build)

**Por quê**: hoje `npm run lint`, `npm run test` e `npm run build` só rodam manualmente. Não há `.github/workflows/`, então nada impede um PR quebrado de ser mesclado — a verificação de qualidade descrita no `CLAUDE.md` depende 100% de disciplina manual.

**Passo a passo**:
1. Crie `.github/workflows/ci.yml`.
2. Defina o gatilho: `on: { push: { branches: [main] }, pull_request: {} }`.
3. Um único job `build`, `runs-on: ubuntu-latest`, com passos: `actions/checkout@v4` → `actions/setup-node@v4` (versão igual à usada localmente, ex. `node-version: 20`, com `cache: npm`) → `npm ci` → `npm run lint` → `npm run test` → `npm run build`.
4. **Não** inclua secrets do Firebase no workflow — os testes já mockam `service/storage` e `context/AuthContext` (ver seção de testes do `CLAUDE.md`), então `npm run test`/`npm run build` não precisam de `.env` real. Se `npm run build` reclamar de variáveis `VITE_FIREBASE_*` ausentes, crie um `.env` fake só com placeholders no step do CI (não é segredo, é só para o Vite não quebrar o build).
5. Ative a proteção de branch no GitHub (Settings → Branches → Branch protection rule para `main`) exigindo o check do CI antes de merge — esse passo é uma configuração do repositório, não um arquivo, então confirme com o responsável antes de aplicar.

---

## 2. `.env.example`

**Por quê**: o projeto depende de variáveis `VITE_FIREBASE_*` (ver `src/service/firebase.js`), mas não existe um arquivo de exemplo — só o `.env` real (gitignored). Qualquer pessoa nova clonando o repositório não tem como saber quais variáveis preencher sem pedir para alguém ou ler o código-fonte de `firebase.js`.

**Passo a passo**:
1. Abra `src/service/firebase.js` e liste todas as chaves `import.meta.env.VITE_FIREBASE_*` usadas.
2. Crie `.env.example` na raiz com essas chaves e valores vazios/fake (`VITE_FIREBASE_API_KEY=`, etc.) — nunca copie os valores reais do `.env`.
3. Confirme que `.env.example` **não** está no `.gitignore` (só `.env` deve estar) e commite.
4. Opcional: adicione uma linha no `README.md` (se existir) ou no topo do `CLAUDE.md` indicando `cp .env.example .env` como primeiro passo de setup.

---

## 3. Tratamento de erro nas operações do Firestore

**Por quê**: `Ficha.jsx` (e as abas que chamam `onSave`) não têm nenhum `try/catch` em torno das chamadas a `updatePersonagem`/`addPersonagem`/etc. — confirmado por busca no código, não há `catch` nem `console.error` nesse fluxo. Se a escrita falhar (perda de conexão, regra do Firestore rejeitando, quota excedida), o usuário não recebe nenhum feedback: a UI já atualizou otimisticamente (`onSave` mescla o patch no estado local antes/independente da confirmação do Firestore) e o erro simplesmente desaparece no console do navegador.

**Passo a passo**:
1. Em `Ficha.jsx`, envolva a chamada a `updatePersonagem` dentro do `handleSave` (ou equivalente) em `try/catch`.
2. Em caso de erro, **não** aplique o patch otimista no estado local (ou reverta se já foi aplicado) e exiba um MUI `Snackbar`/`Alert` de erro — reaproveite o padrão de card/tema já usado no projeto (`--color-primary`/tema dark do `theme.js`).
3. Repita o mesmo padrão nos pontos onde as abas chamam `service/storage.js` diretamente sem passar por `onSave` (ex.: ações imediatas em Aptidões, Arts, Lojas, Veias Astrais — confira cada `tabs/*.jsx` e os subdiretórios `aptidoes/`, `arts/`, `lojas/`, `veiasAstrais/`).
4. Padronize um único componente de feedback (ex. `components/Feedback/ErrorSnackbar.jsx` ou um hook `useSnackbar()` de contexto) em vez de duplicar `Snackbar` em cada aba — siga a convenção de "um componente compartilhado em `components/`" já usada por `NumberField`/`Layout`/`ProtectedRoute`.
5. Adicione um teste (seguindo o padrão de `AtributosTab.test.jsx`) que mocka `updatePersonagem` rejeitando a Promise e verifica que a mensagem de erro aparece.

---

## 4. Error Boundary global

**Por quê**: não existe nenhum `ErrorBoundary` no projeto (busca por `ErrorBoundary`/ `componentDidCatch` não encontrou nada fora de `ProtectedRoute`, que trata só o estado de auth). Um erro de render em qualquer aba da ficha (ex. um catálogo de referência com formato inesperado) derruba a árvore inteira do React com tela branca, sem chance de recuperação sem recarregar a página.

**Passo a passo**:
1. Crie `src/components/ErrorBoundary/ErrorBoundary.jsx` como class component (é o único jeito de implementar `componentDidCatch`/`getDerivedStateFromError` em React) — MUI `Card` com o tema dark, mensagem amigável e botão "Recarregar" (`window.location.reload()`).
2. Envolva o `<RouterProvider>` (ou o `<Outlet/>` dentro de `Layout.jsx`) com esse boundary em `App.jsx`.
3. Opcional, mas recomendado: coloque um boundary **também** ao redor de cada `<Tab>` renderizada em `Ficha.jsx`, para que um erro numa aba não derrube a ficha inteira (o usuário troca de aba e continua usando o resto).
4. Documente em `CLAUDE.md`/aqui que qualquer aba nova deve continuar assumindo que pode quebrar isoladamente.

---

## 5. Cobertura de teste nas abas sem teste

**Por quê**: hoje só existem testes de fluxo para `AtributosTab`, `InventarioTab` e `NovoPersonagem` (mais os testes puros de `formulas.js`/`resolveNome.js`/`useDraftLocalStorage.js`/`ProtectedRoute`). As abas `ProgressaoTab`/`TreinamentoTab`, `AptidoesTab`, `ArtsTab`, `LojasTab`, `VeiasAstraisTab`, `SorteTab`, `CondicoesTab`, `CodexTab` e `PerfilTab` não têm nenhum teste de Testing Library.

**Passo a passo** (por aba, repetível):
1. Escolha a aba de maior risco primeiro — sugestão: `AptidoesTab`/`ArtsTab` (lógica mais complexa: aquisição, remoção, ajuste de vantagens) e `LojasTab` (envolve `historicoSorte` e cálculo de saldo).
2. Siga exatamente o padrão de `InventarioTab.test.jsx`: `vi.mock('service/storage')` e `vi.mock('context/AuthContext')`, nunca tocar Firebase real.
3. Cubra pelo menos: (a) render inicial com dados mockados, (b) uma ação de escrita chamando `onSave`/a função de `service/storage` correta com o payload esperado, (c) um caso de borda específico da aba (ex. em Veias Astrais, tentar desbloquear um nó sem o pai desbloqueado deve ser bloqueado na UI).
4. Use `fireEvent` (não há `@testing-library/user-event` instalado, conforme convenção já documentada) e `waitFor` para asserções assíncronas.
5. Depois de cobrir as abas, rode `npm run test -- --coverage` (adicione `@vitest/coverage-v8` como dependência de dev se ainda não estiver instalado) para visualizar o que ainda falta e evitar lacunas silenciosas.

---

## 6. Code splitting por rota

**Por quê**: `src/routes/index.jsx` importa `Login`, `Personagens`, `NovoPersonagem` e `Ficha` (que por sua vez importa as 10 abas) tudo de forma estática — não há nenhum `React.lazy`/`Suspense` nas rotas (só existe `Suspense` dentro de `ProtectedRoute.jsx`, envolvendo o `<Outlet/>`, mas os módulos já foram baixados no bundle inicial mesmo assim). Como a ficha tem 10 abas com diálogos e catálogos, isso infla o bundle inicial mesmo para quem só quer ver a tela de login.

**Passo a passo**:
1. Em `src/routes/index.jsx`, troque os imports estáticos de `Personagens`, `NovoPersonagem` e `Ficha` por `React.lazy(() => import('pages/Personagens/...'))`.
2. Como `ProtectedRoute.jsx` já envolve `<Outlet/>` num `<Suspense>` com spinner, o lazy loading vai funcionar sem mudança adicional nesse componente — confirme lendo o fallback atual e ajuste o visual se necessário.
3. Rode `npm run build` e compare o tamanho dos chunks gerados antes/depois (Vite já reporta isso no output do build).
4. Opcional: dentro de `Ficha.jsx`, avalie fazer lazy loading das abas menos usadas (Códex, Veias Astrais) se o chunk da ficha ainda estiver grande — só vale a pena se o ganho for mensurável, não faça por especulação.

---

## 7. Testes de `firestore.rules` com o Emulator Suite

**Por quê**: `firestore.rules` (41 linhas) é a única camada real de segurança do projeto (a UI nunca deve ser a única barreira, conforme o próprio `CLAUDE.md`), mas não há nenhum teste automatizado validando as regras — hoje a confiança é só "já foi deployado e parece funcionar".

**Passo a passo**:
1. Instale `@firebase/rules-unit-testing` como dependência de dev.
2. Configure o Firebase Emulator Suite localmente (`firebase init emulators`, escolhendo só Firestore) — isso roda inteiramente local, sem tocar o projeto Firebase real.
3. Crie `firestore.rules.test.js` (fora da suíte do Vitest principal ou integrado a ela, dependendo de como o emulador for iniciado) cobrindo os casos centrais: (a) usuário A não consegue ler/escrever personagem do usuário B, (b) usuário A consegue ler/escrever o próprio personagem, (c) a regra de wildcard cobre corretamente subcoleções (`aptidoesAdquiridas`, `arts`, `historicoSorte`) com o mesmo isolamento por `uid`.
4. Documente no `package.json` um script `test:rules` que sobe o emulador e roda esses testes, deixando claro que é separado do `npm run test` normal (não deve rodar em todo `npm run test` para não exigir o emulador sempre).
5. Opcional: adicione esse script como job extra no CI do item 1, se o tempo de execução for aceitável.

---

## 8. Deploy no Firebase Hosting

**Por quê**: conforme `MIGRACAO-REACT-FIREBASE.md`, todas as 8 fases do roadmap já foram implementadas — falta só o deploy final, adiado a pedido do responsável do projeto.

**Passo a passo** (executar **somente com confirmação explícita do responsável**, por afetar o projeto Firebase compartilhado em produção):
1. `firebase init hosting`, apontando o diretório público para `dist/` e configurando rewrite de SPA (`"rewrites": [{"source": "**", "destination": "/index.html"}]`) para o React Router funcionar em refresh de rotas profundas (`/personagens/:id`).
2. `npm run build`.
3. `firebase deploy --only hosting`.
4. Validar manualmente as rotas principais após o deploy (login, listagem de personagens, abrir uma ficha, trocar de aba) — sem ferramenta de browser headless neste ambiente, pedir validação manual ao responsável ou usar Playwright ad-hoc conforme já praticado (ver `CLAUDE.md`).

---

## 9. Auditoria de acessibilidade e Lighthouse

**Por quê**: `eslint-plugin-jsx-a11y` já está instalado e ativo no lint, o que cobre problemas estáticos (ex. `<img>` sem `alt`), mas não substitui uma auditoria real de contraste/navegação por teclado — especialmente relevante aqui porque o tema é dark/glassmorphism com opacidades baixas (`--bg-card: rgba(255, 255, 255, 0.04)`), que é uma combinação clássica de baixo contraste.

**Passo a passo**:
1. Rode `npm run build && npm run preview` e abra o Chrome DevTools → aba Lighthouse → categoria Accessibility (e Performance, já que está ali).
2. Repita para: tela de login, listagem de personagens, e pelo menos 3 abas da ficha (Atributos, Inventário, Aptidões) — o tema muda pouco entre abas, mas os componentes MUI usados variam (`Dialog`, `Select`, `Chip`).
3. Para cada problema de contraste apontado, ajuste a variável CSS correspondente em `global.css` (não hardcode a cor no componente) e confirme que o tema (`theme.js`) continua coerente com a variável nova.
4. Teste navegação só por teclado (Tab/Shift+Tab/Enter/Esc) nos diálogos principais (`ClasseModal`, `RacaModal`, `GerenciarAptidoesDialog`, `CriarArtDialog`) — MUI `Dialog` já cuida de focus trap por padrão, mas confirme que não há nenhum `tabIndex` customizado quebrando isso.

---

## 10. Fechar pendências documentais do `MIGRACAO-REACT-FIREBASE.md`

**Por quê**: o próprio documento de migração já sinaliza dívidas menores que vale formalizar — não são bugs, mas ficaram registradas como "desvios" ao invés de decisões fechadas:
- Os limiares de Treinamento (crítico/sucesso/quase/falha) e a tabela de XP por nível em `common/utils/formulas.js` são marcados como **autorais** (⚠️ no código) — vale confirmar com a mesa/responsável do jogo se os números batem com as regras reais, e remover o aviso quando confirmado.
- `regras` filtrado por `universo` foi uma correção de suposição anterior — vale conferir se esse comportamento continua correto à medida que novos universos forem cadastrados.

**Passo a passo**:
1. Marque essas duas pendências como itens de acompanhamento (issue no GitHub, se o repositório usar, ou lista própria) em vez de deixá-las só como comentário `⚠️` no meio do código.
2. Ao confirmar os números de Treinamento com o responsável do jogo, atualize `formulas.js` (e o teste correspondente em `formulas.test.js`) e remova o aviso do código e a menção em `MIGRACAO-REACT-FIREBASE.md` §"Outras simplificações deliberadas".
