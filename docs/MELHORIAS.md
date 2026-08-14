# Melhorias Propostas — ReDungeon Player Site

Este documento lista melhorias concretas para o projeto, priorizadas por impacto/esforço, com passo a passo de implementação para cada uma. Todas foram levantadas observando o estado atual do código (varreduras em `2026-07-20`/`2026-07-22` e `2026-08-09`) — não são hipotéticas.

Leia também [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md) (seção "Status da implementação") para saber o que já foi feito; este documento cobre o que falta **além** do roadmap de migração, que já está 100% implementado, incluindo o deploy (GitHub Pages via `.github/workflows/deploy.yml`).

---

## Resumo

| #   | Melhoria                                                           | Impacto     | Esforço    |
| --- | ------------------------------------------------------------------ | ----------- | ---------- |
| 1   | CI no GitHub Actions (lint + test + build) — ✅ feito               | Alto        | Baixo      |
| 2   | `.env.example` para onboarding — ✅ já existia, conferido           | Médio       | Baixo      |
| 3   | Tratamento de erro nas operações do Firestore — ✅ feito            | Alto        | Médio      |
| 4   | Error Boundary global — ✅ feito                                    | Médio       | Baixo      |
| 5   | Cobertura de teste nas abas sem teste — ✅ feito (10/10 abas/modais)  | Alto        | Médio/Alto |
| 6   | Code splitting por rota (`React.lazy`) — ✅ feito                   | Baixo/Médio | Baixo      |
| 8   | Auditoria de acessibilidade e Lighthouse — 🟡 parcial (contraste checado; auditoria ao vivo bloqueada por falta de `.env`, não por browser) | Médio | Baixo |
| 9   | Fechar pendências documentais do `MIGRACAO-REACT-FIREBASE.md` — ✅ feito | Baixo | Baixo |
| 10  | Bug: `NumberField` grava `NaN` ao digitar `-` num campo numérico — ✅ feito | Alto | Baixo |
| 11  | Bug: `CondicaoCard`/`CondicoesTab` grava duração sem debounce nem tratamento de erro — ✅ feito | Médio | Baixo |
| 12  | Bug: `arvoreLayout.js` sem proteção contra ciclo em `parentId` (Veias Astrais) — ✅ feito | Médio | Baixo |
| 13  | `CLAUDE.md` documenta a paleta de cores antiga (roxo/ciano em vez de dourado/azul) — ✅ feito | Baixo | Baixo |
| 14  | Botão "Voltar" morto (chama o mesmo `onClose` que "Fechar") em 3 modais — ✅ feito | Baixo | Baixo |
| 15  | Leituras de catálogo sem `.catch` prendem a UI em loading permanente em erro — ✅ feito | Médio | Médio |
| 16  | `InventarioTab`/`ArtsTab` exigem `onSave` via PropTypes mas nunca chamam — ✅ feito | Baixo | Baixo |
| 17  | `Personagens.jsx`: leituras de `getPersonagens` sem `.catch` — ✅ feito ([detalhe](#17-personagensjsx-leituras-sem-catch--loading-permanente-em-erro--feito-em-2026-08-09)) | Alto | Baixo |
| 18  | `NovoPersonagem.jsx`/rota órfã duplicando `CriarPersonagemModal.jsx` — 🟡 parcial ([detalhe](#18-novopersonagemjsx-órfã-e-duplicando-criarpersonagemmodaljsx--parcial-em-2026-08-09)) | Médio | Baixo |
| 19  | Assets PNG não otimizados (~3,5 MB) — 🔴 pendente ([detalhe](#19-assets-png-não-otimizados)) | Médio | Baixo |
| 20  | Bundle inicial sem `manualChunks` (~1,3 MB) — ✅ feito ([detalhe](#20-bundle-inicial-ainda-grande--manualchunks-feito-em-2026-08-09)) | Médio | Médio |
| 21  | `defaultProps` depreciado no React 19 (28 arquivos) — 🔴 pendente ([detalhe](#21-defaultprops-em-componente-de-função--depreciado-no-react-19)) | Baixo | Médio |
| 22  | Styled-components inline fora do `styles.js` da pasta — 🔴 pendente ([detalhe](#22-styled-components-inline-fora-do-stylesjs-da-pasta)) | Baixo | Médio |
| 23  | Typo `handeEscolherDoCatalogo` — ✅ feito ([detalhe](#23-typo-handeescolherdocatalogo--feito-em-2026-08-09)) | Baixo | Baixo |
| 24  | `CorpoEspecialGrid.jsx`: heurística de campo de bônus — 🔴 pendente, depende do outro projeto ([detalhe](#24-corpoespecialgridjsx-heurística-de-nome-de-campo-para-bônusdesvantagem--pendente-depende-do-projeto-administrativo)) | Baixo | Baixo* |
| 25  | Tempo mínimo do overlay de "Salvando" (2s → 1s) — ✅ feito ([detalhe](#25-tempo-mínimo-do-overlay-de-salvando-reduzido-de-2s-para-1s--feito-em-2026-08-09)) | Baixo | Baixo |

_\* item 24 depende de mudança no projeto administrativo, fora deste repositório._

Ver seção **"Varredura de 2026-08-09"** no fim do documento para o detalhamento dos itens 17–25.

---

## 1. CI no GitHub Actions (lint + test + build) — ✅ implementado em 2026-07-22

`.github/workflows/ci.yml` roda `npm run lint`, `npm run test -- --run` e `npm run build` em todo `pull_request`, sem secrets do Firebase (os testes mockam `service/storage`/`context/AuthContext`, e o build não falha com `VITE_FIREBASE_*` ausentes). É um workflow separado de `deploy.yml` de propósito: `deploy.yml` só dispara em `push` para `main` e publica no GitHub Pages, então não faz sentido rodar `upload-pages-artifact`/`deploy-pages` a partir de um PR ainda não mergeado.

**Falta só**: ativar a proteção de branch no GitHub (Settings → Branches → Branch protection rule para `main`) exigindo o check do CI antes do merge — é config do repositório, não arquivo, e não foi aplicada ainda (confirme com o responsável antes).

---

## 2. `.env.example` — ✅ já existia, conferido em 2026-07-22

`.env.example` já existe na raiz com as 6 chaves `VITE_FIREBASE_*` (placeholders, sem valores reais) e não está no `.gitignore` (só `.env` está). Não há `README.md` no projeto para adicionar a linha opcional de `cp .env.example .env` — o `CLAUDE.md` já documenta a config via `.env` na seção de Tech Stack, então não foi adicionado texto extra ali para não duplicar.

---

## 3. Tratamento de erro nas operações do Firestore — ✅ feito em 2026-07-22

**Achado ao investigar**: `Ficha.jsx`'s `handleSave` já **não** era otimista (`await updatePersonagem` roda antes do merge no estado local — se a escrita falhar, o merge nunca acontece), diferente do que este item descrevia. Algumas abas (ex. `AptidoesTab`) já tinham seu próprio padrão local de otimista+reverter+mensagem de erro. O gap real era: (a) nenhum feedback visual na maioria dos fluxos, e (b) alguns `handleSubmit` do Formik (`AtributosTab`, `PerfilTab`) deixavam `isSubmitting` travado em `true` para sempre se o save falhasse, prendendo o botão "Salvar".

**O que foi feito**:
- `components/ErrorSnackbar/ErrorSnackbar.jsx` — MUI `Snackbar`/`Alert` de erro reutilizável.
- `context/SavingContext.jsx`'s `executar` (o ponto central por onde passam ~15 componentes de escrita) agora captura qualquer erro, loga no console, mostra o `ErrorSnackbar` e re-lança — isso cobre de graça todo fluxo que já usava `useSaving().executar`.
- `AtributosTab.jsx` e `PerfilTab.jsx`: `handleSubmit` agora usa `try/catch/finally` para sempre chamar `setSubmitting(false)`, mesmo em erro (bug real corrigido, não só cobertura de feedback).
- Dois pontos que escrevem no Firestore **fora** de `useSaving`/`onSave` (porque ficam fora do `SavingProvider`, que só existe dentro de `Ficha.jsx`) ganharam tratamento local equivalente: `NovoPersonagem.jsx` (criar personagem) e `CriarCompanheiroModal.jsx` (criar/duplicar companheiro).
- Teste novo em `AtributosTab.test.jsx` cobrindo `onSave` rejeitando: mostra a mensagem de erro e reabilita o botão Salvar.

**Não coberto** (avaliado e decidido não valer o risco sem teste visual): auditoria linha-a-linha dos ~26 arquivos que importam `service/storage` diretamente — a maioria só lê catálogos (sem necessidade de tratamento de erro de escrita) ou já delega para um componente pai que passa por `useSaving`/`onSave`. Se aparecer um novo ponto de escrita direta sem passar por nenhum dos dois, replique o padrão de `NovoPersonagem.jsx`/`CriarCompanheiroModal.jsx`.

---

## 4. Error Boundary global — ✅ feito em 2026-07-22

`src/components/ErrorBoundary/ErrorBoundary.jsx` (class component com `componentDidCatch`/`getDerivedStateFromError`, card no tema dark, botão "Recarregar"). Aplicado em duas camadas:
- `App.jsx` envolve `<RouterProvider>` — rede de segurança global.
- `Ficha.jsx` envolve o bloco das 7 abas principais com `<ErrorBoundary key={aba} ...>` — a `key={aba}` remonta o boundary a cada troca de aba, então um erro numa aba não deixa as outras travadas, e trocar de aba já "recupera" sem precisar recarregar a página.

Qualquer aba nova continua podendo quebrar isoladamente sem derrubar a ficha inteira, contanto que continue sendo renderizada dentro desse bloco em `Ficha.jsx`.

---

## 5. Cobertura de teste nas abas sem teste — ✅ feito em 2026-07-22

**Por quê**: cobertura de teste de UI era baixa. Nota: a descrição original deste item citava `ProgressaoTab`/`LojasTab` — esses nomes não existem mais como tabs (a ficha foi refeita com sidebar+modais desde então); os nomes corretos hoje são `TreinamentoTab`, `LojaModal`/`LojaTrapacaSection` etc.

**Todas as abas/modais principais agora têm teste** (🟢 = novo em 2026-07-22, já existiam antes as 3 sem marcação):
- `AtributosTab` (já existia) — inclui agora também o caso de `onSave` falhando (ver item 3).
- `InventarioTab` (já existia).
- `NovoPersonagem` (já existia).
- 🟢 `AptidoesTab` (`AptidoesTab.test.jsx`): upgrade de nível salvando otimisticamente, reversão + mensagem de erro quando o Firestore rejeita, remoção de aptidão adquirida.
- 🟢 `TreinamentoTab`/`TreinamentoSection` (`TreinamentoTab.test.jsx`): abre o diálogo do atributo certo e salva `treinamento`/`atributosBase` (rolagem de dado mockada via `vi.mock('common/utils/formulas', ...)`, já que é aleatória por natureza).
- 🟢 `ArtsTab` (`ArtsTab.test.jsx`): bloqueia/ativa uma Art, cria um Núcleo novo pelo diálogo (incluindo o `<Select>` de Tipo).
- 🟢 `VeiasAstraisTab` (`VeiasAstraisTab.test.jsx`): bloqueia todas as veias desbloqueadas (devolve PC), abre a árvore de constelação de uma divindade.
- 🟢 `CompanheiroTab` (`CompanheiroTab.test.jsx`): cria um companheiro em branco e navega pra ficha dele (`MemoryRouter` + `useAuth` mockado).
- 🟢 `PerfilTab`/`InfoModal` (`InfoModal.test.jsx`, testado no nível do modal — é o que a app realmente renderiza): edita e salva o nome do personagem.
- 🟢 `SorteTab` (`SorteTab.test.jsx`): rola a fortuna (rolagem mockada), salva o novo saldo e registra no histórico.
- 🟢 `CodexTab` (`CodexTab.test.jsx`): aviso de "selecione um universo" quando não há um; carrega e expande uma regra mostrando o conteúdo.
- 🟢 `RacaModal` (`RacaModal.test.jsx`): escolhe uma raça e salva o id + reseta habilidades ativas.
- 🟢 `ClasseModal` (`ClasseModal.test.jsx`): escolhe uma classe — cobre o fluxo de `garantirNucleoDaClasse` (cria o Núcleo automático em Arts) + salva a lista de classes.
- 🟢 `ReputacaoModal` (`ReputacaoModal.test.jsx`): abre uma origem, ajusta um eixo (Fama) e salva.
- 🟢 `LojaModal`/`LojaTrapacaSection` — só `LojaModal.test.jsx` (define um novo saldo de Rokmas e salva); `LojaTrapacaSection` ficou sem teste próprio (fluxo de compra com Fortuna é mais complexo — catálogo autoral embutido — e o `LojaModal` já cobre o padrão `useSaving`/diálogo desse mesmo arquivo de sidebar).

**Não coberto** (escopo consciente, não esquecido): `LojaTrapacaSection` (ver acima), e os fluxos de formulário completo de Inventário (`CriarItemDialog`/`CriarMaterialDialog`/`CriarReceitaDialog` — `InventarioTab.test.jsx` já cobre o caminho de catálogo mais comum) e de Arts (`ArtFormDialog`/`VarianteFormDialog` — `ArtsTab.test.jsx` cobre criação de Núcleo e toggle de Art, não o formulário completo de Art/Variante). Rode `npm run test -- --coverage` (adicione `@vitest/coverage-v8` como dependência de dev) se quiser visualizar lacunas remanescentes com precisão.

---

## 6. Code splitting por rota — ✅ feito em 2026-07-22

`src/routes/index.jsx` agora usa `lazy(() => import(...))` para `Personagens`, `NovoPersonagem` e `Ficha` (Login continua estático — é a página de entrada, não faz sentido adiar). `ProtectedRoute.jsx` já envolvia `<Outlet/>` num `<Suspense>`, então não precisou de nenhuma mudança lá.

Resultado medido no `npm run build`: o chunk inicial (`index-*.js`) caiu de ~1709 kB para ~1310 kB minificados; `Ficha` (a maior feature, com as 7 abas + diálogos) virou seu próprio chunk de ~375 kB, carregado só quando o usuário abre uma ficha. O aviso de "chunk maior que 500 kB" do Vite ainda aparece para o chunk inicial — reduzir mais que isso exigiria dividir dependências de terceiros (MUI/Firebase) via `manualChunks`, o que não foi feito aqui por ser uma mudança de configuração de build mais arriscada e sem pedido explícito.

---

## 8. Auditoria de acessibilidade e Lighthouse — 🟡 parcial em 2026-07-22 (contraste checado, resto continua manual)

**Por quê**: `eslint-plugin-jsx-a11y` já está instalado e ativo no lint, o que cobre problemas estáticos (ex. `<img>` sem `alt`), mas não substitui uma auditoria real de contraste/navegação por teclado. Nota: as cores atuais do tema (`global.css`) já não são as mesmas descritas quando este item foi escrito — hoje é dourado/azul (`--color-primary: #e8cb85`, `--color-accent: #5b7cfa`) sobre roxo bem escuro, não mais o roxo/ciano original, mas o risco de contraste apontado (opacidades baixas tipo `--bg-card: rgba(255, 255, 255, 0.04)`) continua válido.

**O que foi possível automatizar sem browser**: calculei o contraste WCAG 2.1 (fórmula de luminância relativa) de todo par texto/fundo usado em `global.css`, compositando `--bg-card` (rgba translúcido) sobre `--bg-primary`. Resultado — 14 dos 15 pares passam AA normal (4.5:1) e todos passam AA large/UI (3:1); o único ponto abaixo do limiar:

- **`--text-muted` (#7a7a88) sobre `--bg-card` composto em `--bg-primary`: contraste 4.36:1**, abaixo dos 4.5:1 exigidos para texto normal (passa nos 3:1 de texto grande/ícone). É uma diferença pequena (não é um vermelho-sobre-vermelho), mas texto pequeno usando essa cor dentro de um card pode falhar auditoria formal de acessibilidade. Não ajustei a variável porque é uma decisão de design (mudar `--text-muted` afeta hierarquia visual em todo o app) que não dá pra validar sem ver renderizado — sinalizando aqui em vez de mudar às cegas.

**Tentativa de auditoria real com browser (2026-07-22) — correção importante em relação à primeira versão deste item**: ao contrário do que este item dizia antes ("ambiente sem ferramenta de browser headless confiável"), `npx playwright install chromium` **funciona neste ambiente** (baixa e cacheia normalmente em `%LOCALAPPDATA%\ms-playwright`) — instalei `playwright` + `@axe-core/playwright` num diretório de scratchpad (não como dependência do projeto) e rodei `npm run dev` real. O bloqueio de verdade foi outro: **não existe `.env` local neste checkout** (só `.env.example`, com placeholders), então o Firebase falha com `auth/invalid-api-key` no import do módulo e a árvore React inteira nem monta (`#root` fica vazio) — nenhuma página real chega a renderizar, então o Axe só via um HTML vazio, invalidando qualquer resultado. Havia um `.env` com credenciais reais do mesmo projeto Firebase compartilhado em outro repositório local do usuário (`Banco-de-Dados---Re-Dungeon`), mas perguntei antes de copiar credenciais entre repositórios e o usuário preferiu não rodar a auditoria ao vivo desta vez — ficou só o cálculo estático de contraste acima. **Para a próxima tentativa**: com um `.env` válido presente, o script de auditoria (Playwright + `@axe-core/playwright`, login com a conta de teste, scan de Login/Personagens/abas da Ficha, teste de focus-trap/Escape em diálogos) já está pronto — é só reconstruir o padrão acima, não precisa reinventar a abordagem.

**Passo a passo restante (precisa de um `.env` válido + browser real)**:

1. Rode `npm run build && npm run preview` e abra o Chrome DevTools → aba Lighthouse → categoria Accessibility (e Performance, já que está ali).
2. Repita para: tela de login, listagem de personagens, e pelo menos 3 abas da ficha (Atributos, Inventário, Aptidões) — o tema muda pouco entre abas, mas os componentes MUI usados variam (`Dialog`, `Select`, `Chip`).
3. Se o Lighthouse confirmar o ponto de `--text-muted` acima (ou achar outro que o cálculo estático não pegou — ex. texto sobre imagem de fundo), ajuste a variável CSS correspondente em `global.css` (não hardcode a cor no componente) e confirme que `theme.js` continua coerente.
4. Teste navegação só por teclado (Tab/Shift+Tab/Enter/Esc) nos diálogos principais (`ClasseModal`, `RacaModal`, `GerenciarAptidoesDialog`, `CriarArtDialog`) — MUI `Dialog` já cuida de focus trap por padrão, mas confirme que não há nenhum `tabIndex` customizado quebrando isso.

---

## 9. Fechar pendências documentais do `MIGRACAO-REACT-FIREBASE.md` — ✅ formalizado em 2026-07-22

Das duas pendências que este item listava, uma já **não é mais uma pendência**: `regras` filtrado por `universo` foi confirmado pelo responsável do projeto (§4.1 do documento de migração já registra isso como decisão fechada, não aberta — a descrição antiga deste item estava desatualizada).

A pendência real — os limiares de Treinamento (crítico/sucesso/quase/falha) e a tabela de XP por nível em `common/utils/formulas.js` serem **autorais** (⚠️ no código, doc não define os números exatos) — agora tem uma entrada formal em `MIGRACAO-REACT-FIREBASE.md` §11, na nova subseção "Pendências de confirmação com a mesa", em vez de existir só como comentário solto no meio do código.

**Falta só**: quando o responsável do jogo confirmar os números reais, atualizar `formulas.js` + `formulas.test.js` e remover o aviso `⚠️` do código e da entrada em §11 — isso é trabalho de calibração de regras de jogo, não de engenharia, então fica de fato pendente até essa confirmação externa.

---

## Itens encontrados na varredura adicional de 2026-07-22 — ✅ todos implementados

Os itens abaixo foram achados numa varredura de código independente do backlog original (itens 1–9), documentados e depois implementados no mesmo dia.

### 10. Bug: `NumberField` grava `NaN` ao digitar `-` num campo numérico — ✅ feito

`components/NumberField/NumberField.jsx` agora mantém um estado local de texto bruto (`raw`) separado do valor numérico gravado no Formik: enquanto o texto digitado não é um número válido (ex. só `-`), o input mostra o texto mas não grava nada no Formik; ao virar um número válido (`-5`), aí sim `helpers.setValue` é chamado. No blur, o campo é normalizado de volta pro valor comprometido. Um `useEffect` sincroniza `raw` sempre que `field.value` muda por fora (ex. Cancelar reaplicando o snapshot). Testes novos em `NumberField.test.jsx` cobrem: digitar `-5` sem nunca gravar `NaN` no Formik, e normalizar pra `0` no blur se o campo ficar vazio.

---

### 11. Bug: `CondicaoCard`/`CondicoesTab` grava duração sem debounce nem tratamento de erro — ✅ feito

`CondicaoCard.jsx` agora mantém a duração em estado local (`duracaoLocal`) e só chama `onAlterarDuracao` no blur (ou Enter) — não mais a cada tecla — e só se o valor realmente mudou. `CondicoesTab.jsx`'s `handleAlterarDuracao` passou a usar `useSaving().executar()`, igual `handleAdicionar`/`handleRemover` no mesmo arquivo, ganhando o `ErrorSnackbar` do item 3 de graça. Testes novos em `CondicoesTab.test.jsx` cobrem: só salva no blur (não por tecla), e não salva de novo se o valor não mudou.

---

### 12. Bug: `arvoreLayout.js` sem proteção contra ciclo em `parentId` (Veias Astrais) — ✅ feito

`calcularProfundidades` e `atribuirLinha` em `arvoreLayout.js` agora guardam um set de nós "em visita" (mesmo padrão de `calcularCustoDesbloqueio` em `formulas.js`) — um `parentId` formando ciclo é tratado como raiz/folha em vez de recursar pra sempre. Também foi adicionada uma varredura final para atribuir linha aos nós presos num ciclo puro e nunca alcançados pela travessia normal a partir das raízes reais (senão ficariam com `y: NaN`). Testes novos em `arvoreLayout.test.js` cobrem uma árvore normal e um ciclo de 2 nós (A↔B) sem travar e sem `NaN` nas posições.

---

### 13. `CLAUDE.md` documenta a paleta de cores antiga — ✅ feito

O bloco de variáveis CSS na seção de Estilização do `CLAUDE.md` foi atualizado para bater com `src/common/styles/global.css`: `--color-primary: #e8cb85` (dourado), `--color-accent: #5b7cfa` (azul), `--bg-primary: #0a0913`, `--bg-secondary: #100e1c`, `--border-hover: rgba(232, 203, 133, 0.5)`.

---

### 14. Botão "Voltar" morto em `RacaModal`/`ClasseModal`/`SorteModal` — ✅ feito

Removido o botão duplicado `aria-label="Voltar"` (e o import não usado de `KeyboardReturnIcon`) nos três modais — sobrou só o "Fechar", que já fazia a mesma coisa.

---

### 15. Leituras de catálogo sem `.catch` prendem a UI em loading permanente — ✅ feito

Adicionado `.catch` (com `console.error` e, quando existia um estado `carregando`/`erro`, resetando-o) nos 27 pontos de leitura sem tratamento encontrados por `grep -rn "\.then(" src/pages/Personagens/Ficha src/hooks` — os 8 arquivos citados originalmente (`RacaModal`, `ClasseModal`, `LojaModal`, `AptidoesTab`, `VeiasAstraisTab`, `CodexTab`, `CompanheiroTab`, `useRacaClasseNomes`) mais 11 arquivos adicionais achados na varredura completa (`CriarArtDialog`, `CriarItemDialog`, `CriarMaterialDialog`, `CriarReceitaDialog`, `UniversoSelect`, `AptidaoConsultaModal`, `ReputacaoModal`, `ArtsTab`, `CondicoesTab`, `PerfilTab`, `SorteTab`). Mais um achado por leitura manual (fora do grep, que só pega `.then(`): `ArtsTab.jsx`'s `carregarTudo` usava `async/await` sem `try/catch`, deixando `carregando` travado em erro — também corrigido. Não foi extraído um hook compartilhado (`useCatalogoFetch`) como o passo a passo original sugeria como opcional — o `.catch` pontual por arquivo já resolve o bug reportado (loading travado) sem a reestruturação maior que um hook compartilhado exigiria.

---

### 16. `InventarioTab`/`ArtsTab` exigem `onSave` via PropTypes mas nunca chamam — ✅ feito

Removida a prop `onSave` de `InventarioTab.jsx` e `ArtsTab.jsx` (destructuring, `PropTypes`, e o `Ficha.jsx` que as renderiza) — nenhuma das duas nunca chamava, ambas escrevem via helpers de subcoleção próprios (`addItemInventario`/`addArt`/etc.).

---

## Varredura de 2026-08-09

Entre 2026-07-22 (última varredura) e hoje o projeto ganhou várias features novas (Nível, Cultivo, Corpos Especiais, separação de fichas por `tipo`/NPC/Criatura, vínculo com Campanhas do Re:Master, reforma visual de Arts e Veias Astrais — ver `git log --oneline` do período). `npm run lint`, `npm run test` (143 testes) e `npm run build` passam limpos hoje, então os itens abaixo são achados novos de uma varredura de código, não regressões dos itens 1–16.

| #   | Melhoria                                                                 | Impacto | Esforço | Status |
| --- | ------------------------------------------------------------------------- | ------- | ------- | ------ |
| 17  | `Personagens.jsx`: leituras de `getPersonagens` sem `.catch` (loading trava para sempre em erro) | Alto    | Baixo   | ✅ feito |
| 18  | `NovoPersonagem.jsx`/rota `/personagens/novo` órfã e duplicando `CriarPersonagemModal.jsx` já divergente | Médio   | Baixo   | 🟡 parcial |
| 19  | Assets PNG não otimizados (~3,5 MB, maior arquivo 1,5 MB) inflando o bundle | Médio   | Baixo   | 🔴 pendente |
| 20  | Bundle inicial (`index-*.js`) ainda ~1,3 MB minificado — sem `manualChunks` para MUI/Firebase | Médio   | Médio   | ✅ feito |
| 21  | `defaultProps` em componente de função — depreciado no React 19 (28 arquivos) | Baixo   | Médio   | 🔴 pendente |
| 22  | `arts/CriarArtDialog.jsx` e `sidebar/NivelModal.jsx`: styled-components inline em vez do `styles.js` da pasta; sem teste | Baixo   | Médio   | 🔴 pendente |
| 23  | Typo `handeEscolherDoCatalogo` em `CriarArtDialog.jsx:263`               | Baixo   | Baixo   | ✅ feito |
| 24  | `CorpoEspecialGrid.jsx`: heurística de nome de campo para classificar bônus/desvantagem indica schema não fechado no catálogo administrativo | Baixo   | Baixo (mas depende do outro projeto) | 🔴 pendente |

---

### 17. `Personagens.jsx`: leituras sem `.catch` — loading permanente em erro — ✅ feito em 2026-08-09

**Achado**: `Personagens.jsx:47` (carga inicial) e `Personagens.jsx:70` (`handleCreated`, recarrega após criar personagem) chamavam `getPersonagens(currentUser.uid).then(...)` sem `.catch`. Se a leitura falhasse (ex. offline), `setLoading(false)` nunca rodava e a tela "Meus Personagens" — a primeira coisa que qualquer jogador vê depois do login — ficava com o spinner girando para sempre, sem nenhuma mensagem de erro. Era exatamente o bug que o item 15 (varredura de 2026-07-22) já tinha corrigido em 27+11 outros pontos do app; esses dois pontos ficaram de fora porque `Personagens.jsx` não fica dentro de `Ficha/` nem `hooks/`, os únicos caminhos cobertos pelo grep usado naquela varredura.

**O que foi feito**: os dois `.then` ganharam `.catch(error => { console.error(...); setErro('...'); setLoading(false); })`, novo estado `erro` + `<ErrorSnackbar>` renderizado no fim do componente — mesmo padrão de `RacaModal.jsx`/`CriarPersonagemModal.jsx`.

---

### 18. `NovoPersonagem.jsx` órfã e duplicando `CriarPersonagemModal.jsx` — 🟡 parcial em 2026-08-09

**Achado**: `Personagens.jsx` hoje abre a criação de personagem via `CriarPersonagemModal` (um modal), não navegando mais para `/personagens/novo` — nenhum lugar da UI linka para essa rota. Mesmo assim, `routes/index.jsx:24` ainda a registra e o `NovoPersonagem.jsx` continua existindo, com seu próprio `getUniverso().then(setUniversos)` sem `.catch` (mesmo bug do item 17) — os dois arquivos têm essencialmente o mesmo schema Yup e `handleSubmit`, mas já tinham divergido.

**O que foi feito**: só a paridade de tratamento de erro — `getUniverso()` em `NovoPersonagem.jsx` agora tem `.catch` preenchendo o `erro`/`ErrorSnackbar` que o arquivo já tinha (mas não usava nesse ponto), igual `CriarPersonagemModal.jsx`. **Não foi removida** a rota nem o arquivo — decidir se `/personagens/novo` ainda tem uso (link direto/bookmark) é uma decisão de produto, não só de engenharia, então ficou fora desta aplicação automática das melhorias.

**Falta só**: com o responsável do projeto confirmando que a rota pode sair, remover `NovoPersonagem.jsx`, `NovoPersonagem.test.jsx` e a entrada em `routes/index.jsx`. Se precisar continuar existindo, extrair o formulário compartilhado (schema + `handleSubmit` + carregamento de universos/campanhas) para um hook ou componente comum reaproveitado pelos dois, em vez de manter duas cópias que só uma recebe correção de bug.

---

### 19. Assets PNG não otimizados

**Achado**: `src/pages/Personagens/Ficha/assets/` tem 4 PNGs somando ~3,5 MB (`estrela-atributos.png` 1,5 MB, `moldura-retrato.png` 976 KB, `gema-atributo.png` 920 KB, `planeta-redungeon.png` 212 KB — usados em `Ficha/styles.js`/`AtributoEstrela.jsx`, não são código morto). O `npm run build` copia todos sem compressão adicional para `dist/assets/`, então mesmo com o code splitting por rota do item 6, qualquer usuário que abra uma ficha baixa esses ~3,5 MB de imagem.

**Passo a passo**: converter para WebP (ou AVIF) com um otimizador (`squoosh`/`sharp`/`vite-plugin-image-optimizer`) mantendo fallback PNG só se precisar de compatibilidade; para `estrela-atributos.png`/`gema-atributo.png` (usados em tamanho pequeno na tela, a julgar pelo nome), considerar também redimensionar a imagem de origem em vez de só recomprimir — 1,5 MB é grande demais para um elemento decorativo de UI.

---

### 20. Bundle inicial ainda grande — ✅ `manualChunks` feito em 2026-08-09

**Achado**: o item 6 (2026-07-22) já fez code splitting por rota e deixou registrado que o aviso "chunk maior que 500 kB" do Vite persistia por não separar as dependências de terceiros. `npm run build` mostrava `index-*.js` em 1.313,60 kB minificados (375,89 kB gzip) — o próprio Vite avisava. Sem esse item resolvido, praticamente todo o custo de MUI + Firebase + styled-components caía no carregamento inicial (tela de Login), antes mesmo do usuário logar.

**O que foi feito**: `vite.config.js` ganhou `build.rollupOptions.output.manualChunks` separando `firebase` (`firebase/app`+`firebase/auth`+`firebase/firestore`) e `mui` (`@mui/material`+`@mui/icons-material`) do restante do vendor. Resultado medido: `index-*.js` caiu de 1.313,60 kB para 382,68 kB minificados — os 692,13 kB de `firebase-*.js` e 370,85 kB de `mui-*.js` viraram chunks próprios, carregados em paralelo e cacheáveis independentemente (ex. um deploy que só mexe em código de app não invalida o cache do chunk `firebase`). O aviso de "chunk > 500 kB" ainda aparece só para `firebase-*.js` — é o próprio SDK do Firebase, não dá pra reduzir sem trocar de biblioteca ou usar imports mais granulares (fora do escopo desta melhoria).

**Não coberto**: `styled-components` não ganhou chunk próprio (fica junto do vendor restante em `index-*.js`) — não valeu a pena separar um pacote pequeno (~13 kB) num chunk HTTP adicional.

---

### 21. `defaultProps` em componente de função — depreciado no React 19

**Achado**: o projeto está em React `^19.2.7`. Desde o React 18.3, `defaultProps` em componentes de função gera aviso de depreciação no console e será removido numa versão futura — 28 arquivos ainda usam esse padrão (`grep -rn "defaultProps" src`), incluindo componentes tocados nesta última leva de features (`PerfilTab.jsx`, `ConstelacaoArvoreModal.jsx`, `DesbloquearNoDialog.jsx`, `PersonagemCardItem.jsx`) — ou seja, o padrão antigo continua sendo copiado em código novo em vez de migrar.

**Passo a passo**: trocar `Componente.defaultProps = { prop: valor }` por parâmetro default na desestruturação (`const Componente = ({ prop = valor }) => ...`), um arquivo por vez (mudança mecânica, sem risco funcional); vale rodar `npm run lint` + `npm run test` depois de cada lote para garantir que nenhum teste dependia do comportamento de `defaultProps` com `undefined` explícito (que se comporta diferente de default de parâmetro em um detalhe: `defaultProps` também cobre `null`, default de parâmetro não).

---

### 22. Styled-components inline fora do `styles.js` da pasta

**Achado**: `sidebar/NivelModal.jsx` (1042 linhas) define ~600 linhas de styled-components próprios em vez de usar um `sidebar/nivel/styles.js` dedicado, ao contrário do padrão que `CultivoModal.jsx` segue corretamente (estilos em `cultivo/styles.js`) e do que `CLAUDE.md` documenta ("styles.js — styled components, quando há muitos"). `arts/CriarArtDialog.jsx` tem o mesmo problema: define ~90 linhas de styled-components próprios (`DialogHeader`, `SectionCard`, `StyledTextField` etc.) apesar de já importar `arts/styles.js` na linha seguinte para outro componente (`CatalogArtsGrid`). Nenhum dos dois arquivos tem teste (`NivelModal.test.jsx`/`CriarArtDialog` não existem), diferente dos demais modais de `sidebar/` (`ClasseModal`, `InfoModal`, `LojaModal`, `RacaModal`, `ReputacaoModal` — todos têm `.test.jsx`).

**Passo a passo**: mover os styled-components de `NivelModal.jsx` para um `styles.js` novo na mesma pasta (ou reaproveitar `Ficha/styles.js` onde já existir um equivalente, ex. `SectionTitle`/`AtributoCardWrapper`); mover os de `CriarArtDialog.jsx` para dentro do `arts/styles.js` já existente. Ambos os componentes fazem mais de uma coisa (`NivelModal` mistura layout + cálculo de progressão; `CriarArtDialog` mistura formulário autoral + seletor de habilidade de classe + seletor de catálogo) — vale considerar quebrar em subcomponentes ao mesmo tempo que se resolve o teste faltante, já que testar um componente de 600–1000 linhas de uma vez é mais custoso do que testar peças menores.

---

### 23. Typo `handeEscolherDoCatalogo` — ✅ feito em 2026-08-09

**Achado**: `arts/CriarArtDialog.jsx:263` definia `const handeEscolherDoCatalogo = useCallback(...)` (faltando o "l" de "handle"), usado em `CriarArtDialog.jsx:622`. Não era um bug funcional — só o nome do identificador.

**O que foi feito**: renomeado para `handleEscolherDoCatalogo` nos dois pontos (definição e uso). Mudança isolada de nome, sem alterar comportamento.

---

### 24. `CorpoEspecialGrid.jsx`: heurística de nome de campo para bônus/desvantagem — 🔴 pendente (depende do projeto administrativo)

**Achado**: `getBonusTexto`/`bonusLinhaEhDesvantagem` em `corpoEspecial/CorpoEspecialGrid.jsx:148-190` tentam ler o texto de um bônus testando 7-8 nomes de campo possíveis (`descricao`, `descricaoCompleta`, `nome`, `titulo`, `texto`, `label`, `title`) e classificam vantagem/desvantagem fazendo `includes` de substrings (`"desvant"`, `"vantag"`, `"disadv"`, `"advant"`) no texto. Isso é sintoma de o catálogo `corposEspeciais` (mantido pelo projeto administrativo, fora deste repo) ainda não ter um schema fechado para esse campo — o código está compensando no cliente em vez de o catálogo garantir um formato único.

**Passo a passo**: não é algo que este repositório resolve sozinho (ver seção "Visão Geral" do `CLAUDE.md` — catálogos são somente leitura aqui). Sinalizar ao responsável do projeto administrativo para padronizar o campo de bônus de Corpo Especial num formato único (ex. sempre `{ texto, tipo: 'vantagem' | 'desvantagem' }`); depois de padronizado lá, simplificar `getBonusTexto`/`bonusLinhaEhDesvantagem` para ler direto sem heurística.

---

### 25. Tempo mínimo do overlay de "Salvando" reduzido de 2s para 1s — ✅ feito em 2026-08-09

**Contexto**: não veio da varredura de código — foi um pedido direto do usuário ("diminua o tempo mínimo de load das telas para 1 segundo"). O único ponto do app com um piso artificial de duração é `context/SavingContext.jsx`: toda escrita que passa por `useSaving().executar()` (~15 componentes de escrita da ficha — Aptidões, Arts, Condições, Lojas, Veias Astrais, Progressão etc.) mostra o `SavingOverlay` (spinner de tela cheia) por no mínimo `DURACAO_MINIMA_MS`, mesmo que o Firestore responda mais rápido — existe para o overlay não "piscar" em conexões rápidas.

**O que foi feito**: `DURACAO_MINIMA_MS` em `SavingContext.jsx` mudou de `2000` para `1000`. Não há teste que dependa do valor exato (`grep` confirmou), e a lógica de espera (`Math.max` implícito via `if (espera > 0)`) não precisou mudar — só a constante. Abas com "Salvar" explícito via Formik (Atributos, Perfil) não passam por este overlay, então não são afetadas por esta mudança.
