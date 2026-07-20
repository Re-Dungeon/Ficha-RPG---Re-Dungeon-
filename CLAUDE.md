# Claude Instructions - ReDungeon Player Site

## Visão Geral do Projeto

Este é o **site dos jogadores** do RPG de mesa Re-Dungeon: cada jogador loga com sua conta, cria e gerencia seus próprios personagens (ficha completa — atributos, status, raça/classe, aptidões, arts, inventário, lojas, veias astrais, sorte, condições, códex, perfil). O site é **somente leitura** para tudo que não for o próprio personagem do usuário: catálogos de referência (Raças, Classes, Itens, Aptidões, Artes, Condições, Regras, Veias Astrais, Origens, Divindades, Universo) vêm de um Firestore **compartilhado** com um projeto administrativo separado ("Re-Dungeon — Banco de Dados"), que é quem os mantém. Este repositório nunca cria, edita nem popula esses catálogos — só lê.

Contexto completo da migração (este projeto nasceu da reescrita de um site vanilla HTML/CSS/JS que existia neste mesmo repositório) está em [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md), [player-site-handoff.md](./player-site-handoff.md) e [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) — leia a seção "Status da implementação" do primeiro para saber o que já existe e o que falta.

### Tech Stack
- **React 19** com **Vite** como bundler
- **Material-UI (@mui/material` + `@mui/icons-material`)** para componentes de UI, com um **tema dark customizado** (`src/common/styles/theme.js`) — ver seção de Estilização
- **Styled Components** para estilização customizada
- **React Router DOM v7** para navegação
- **Formik** com **Yup** para formulários e validação
- **Firebase/Firestore** como camada de persistência (via `src/service/storage.js`)
- **Firebase Auth** para autenticação (só e-mail/senha — sem cadastro nem Google; contas são criadas pelo administrador/mestre)
- **Vitest** + **Testing Library** para testes

### Persistência de Dados
Toda a persistência é feita via **Firebase/Firestore** através de `src/service/storage.js`, que expõe:
- Helpers genéricos: `getFirestoreItems`/`getFirestoreItem`/`addFirestoreItem`/`updateFirestoreItem`/`removeFirestoreItem` (top-level) e um helper interno de subcoleção usado por `getAptidoesAdquiridas`/`getArts`/`getHistoricoSorte`.
- CRUD de `personagens` (a única coleção que este projeto **escreve**): `getPersonagens(uid)` (filtrado por dono), `getPersonagem(id)`, `addPersonagem`, `updatePersonagem`, `removePersonagem`.
- CRUD das subcoleções de um personagem: `aptidoesAdquiridas` (doc id = id da aptidão no catálogo), `arts`, `historicoSorte` (rolagens de Fortuna **e** compras na Loja da Trapaça).
- Leitura das coleções de referência do projeto administrativo, **sempre somente-leitura**: `getUniverso`/`getOrigens`/`getDivindades` (sem filtro) e `get{Racas,Classes,Condicoes,Aptidoes,VeiasAstrais,Itens,Artes,Regras}PorUniverso(universoId)` (filtradas por `where('universo', '==', universoId)`). **Nunca** adicione `add*`/`update*`/`remove*` para essas coleções — não é este site que as gerencia.

`localStorage` só é usado para o **rascunho** de formulários com salvar explícito (`src/hooks/useDraftLocalStorage.js`, chave `rascunho_personagem_<id>_<aba>`) — nunca como fonte de verdade de dados de personagem, que é sempre o Firestore.

---

## Arquitetura

### Estrutura de Pastas
```
src/
├── common/
│   ├── styles/        # global.css (variáveis CSS) + theme.js (tema MUI dark)
│   └── utils/         # yupSchemas.js, resolveNome.js, formulas.js (+ .test.js de cada um)
├── components/        # Layout, ProtectedRoute, NumberField (reutilizáveis fora da ficha)
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useStableListKeys.js
├── pages/
│   ├── Login/
│   └── Personagens/
│       ├── Personagens.jsx        # "Meus Personagens" — grid filtrado por uid
│       ├── NovoPersonagem.jsx     # criar personagem (só nome) → navega pra ficha
│       └── Ficha/
│           ├── Ficha.jsx          # shell com <Tabs> — carrega o personagem 1x, cada aba recebe {personagem, onSave}
│           ├── constants.js, styles.js, AtributoCard.jsx, StatusCard.jsx   # compartilhados pela aba Atributos
│           ├── tabs/              # um arquivo por aba (AtributosTab, ProgressaoTab, AptidoesTab, ArtsTab,
│           │                      # InventarioTab, LojasTab, VeiasAstraisTab, SorteTab, CondicoesTab, CodexTab, PerfilTab)
│           ├── progressao/        # Universo/Raça/Classes/Treinamento (usados só por ProgressaoTab)
│           ├── aptidoes/, arts/, inventario/, lojas/, veiasAstrais/   # idem, um dir por feature complexa
├── routes/
│   └── index.jsx
└── service/
    ├── firebase.js     # initializeApp/getAuth/getFirestore — nunca chamado fora daqui
    └── storage.js
```

**Padrão da ficha**: `Ficha.jsx` é só um shell — busca o `personagem` uma vez, mantém em `useState`, e passa `{personagem, onSave}` pra aba ativa. `onSave(patch)` faz `updatePersonagem(id, patch)` e mescla o patch no estado local (otimista, sem re-fetch). Cada aba decide sozinha como/quando chamar `onSave` — algumas usam Formik com botão "Salvar" explícito (Atributos, Perfil), outras chamam `onSave` imediatamente a cada ação do usuário (Progressão, Aptidões, Arts, Condições, Lojas, Veias Astrais — mais parecido com o padrão do site vanilla de ações instantâneas). Abas somente-leitura (Códex) não recebem/usam `onSave`.

**Path aliases** (`vite.config.js`): `common`, `components`, `context`, `hooks`, `pages`, `routes`, `service` apontam para `/src/<pasta>` — sempre importe com esses caminhos absolutos (`import { useAuth } from 'context/AuthContext'`), nunca relativos entre pastas de nível diferente.

### Autenticação

Mais simples que o projeto administrativo: **sem** conceito de admin/permissões por universo — todo usuário logado só enxerga e edita os próprios personagens (reforçado pela regra do Firestore, não só pela UI).

- **`src/service/firebase.js`** — `initializeApp`/`getAuth`/`getFirestore`, config via `.env` (`VITE_FIREBASE_*`).
- **`src/context/AuthContext.jsx`** — `AuthProvider` + hook `useAuth()`. Expõe só `{ currentUser, loading, login, logout }`. **Não tem** `signup`/`loginWithGoogle`/`isAdmin`/`allowedUniversos`/`canCreate`/`canWrite` — contas são criadas manualmente pelo administrador/mestre direto no Firebase, não pelo app.
- **`src/components/ProtectedRoute/ProtectedRoute.jsx`** — layout route: mostra spinner enquanto `loading`, redireciona pra `/login` (com `state={{from: location}}`) se não há `currentUser`, senão renderiza `<Outlet/>` num `<Suspense>`.
- **`src/pages/Login/Login.jsx`** — só e-mail/senha (sem toggle de cadastro nem botão Google). Após login, navega pra `location.state?.from` ou `/personagens`.

### Padrão de Arquivos por Página/Aba
Cada página ou aba complexa tende a ter:
- **`NomeDaCoisa.jsx`** — componente principal
- **`styles.js`** — styled components (quando há muitos; abas simples usam `sx` do MUI ou estilo inline pontual)
- **`constants.js`** — listas/enums/labels/valores-padrão específicos
- Subpastas em minúsculo (`progressao/`, `aptidoes/`, `arts/`, `inventario/`, `lojas/`, `veiasAstrais/`) para os componentes/diálogos que só aquela aba usa

---

## Padrões de Código

### Convenções JavaScript/JSX
- **ES6+** (arrow functions, destructuring, template literals), **const** sobre `let`, **async/await**.
- **camelCase** para variáveis/funções/métodos, **PascalCase** para componentes, **SCREAMING_SNAKE_CASE** para constantes, **PascalCase** para arquivos de componente.
- Import order: (1) bibliotecas externas, (2) serviços/utils internos via **caminho absoluto** (alias do Vite), (3) imports relativos (styles, componentes locais da mesma pasta).

```javascript
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Formik } from 'formik';

import { getPersonagens } from 'service/storage';
import { useAuth } from 'context/AuthContext';

import { PageWrapper } from './styles';
```

### Estrutura de Componentes React
Hooks → handlers → render, sempre com `PropTypes` (componentes de aba recebem no mínimo `personagem: PropTypes.object.isRequired`, e `onSave: PropTypes.func.isRequired` quando escrevem dados).

```jsx
const NomeComponente = ({ personagem, onSave }) => {
  const [estado, setEstado] = useState(valorInicial);

  const handleAcao = useCallback(async () => {
    await onSave({ campo: novoValor });
  }, [onSave /* + o que mais o handler usar */]);

  return <div>{/* JSX */}</div>;
};

NomeComponente.propTypes = {
  personagem: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NomeComponente;
```

`react-hooks/exhaustive-deps` é **erro** no ESLint — nunca omita uma dependência real de `useCallback`/`useEffect`/`useMemo`. Se um valor derivado de `personagem.algumCampo ?? []` (array/objeto novo a cada render) for usado dentro de um `useCallback`, envolva-o em `useMemo` primeiro em vez de silenciar o lint.

---

### Estilização

O tema é **dark/glassmorphism**, aplicado em duas camadas que precisam ficar coerentes entre si:

1. **`src/common/styles/global.css`** — variáveis CSS usadas em `styled-components` e em `sx`/`style` inline:
   ```css
   --color-primary: #8b5cf6;   /* roxo */
   --color-accent: #22d3ee;    /* ciano */
   --bg-primary: #0f0f14;
   --bg-secondary: #16161d;
   --bg-card: rgba(255, 255, 255, 0.04);
   --text-primary: #f1f1f4;
   --text-secondary: #b4b4c0;
   --text-muted: #7a7a88;
   --border-primary: rgba(255, 255, 255, 0.08);
   --border-hover: rgba(139, 92, 246, 0.5);
   --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
   ```
2. **`src/common/styles/theme.js`** — `createTheme({ palette: { mode: 'dark', ... } })` aplicado via `<ThemeProvider>` em `App.jsx`. **Isso é obrigatório**: os componentes MUI (`TextField`, `Select` etc.) não leem variáveis CSS sozinhos — sem esse tema dark eles renderizam com o tema claro padrão do MUI (texto escuro, borda quase invisível num fundo escuro). Se adicionar um componente MUI novo com aparência estranha, o problema quase certamente é a falta de override no `theme.js`, não CSS.

Padrão de card usado em quase toda aba da ficha (`AtributoCardWrapper`, `CardTitle`, `CardTotal`, `StatusValueRow`, `SectionTitle` em `Ficha/styles.js`) — reaproveite esses styled components em vez de recriar o mesmo card em cada feature nova.

```javascript
import styled from 'styled-components';

export const MeuCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 16px;

  &:hover {
    border-color: var(--border-hover);
  }
`;
```

---

### Serviço de Armazenamento

```javascript
// Personagens (única coleção que este site escreve)
import { getPersonagens, getPersonagem, addPersonagem, updatePersonagem, removePersonagem } from 'service/storage';

// Subcoleções de um personagem
import { getAptidoesAdquiridas, setAptidaoAdquirida, removeAptidaoAdquirida } from 'service/storage';
import { getArts, addArt, updateArt, removeArt } from 'service/storage';
import { getHistoricoSorte, addHistoricoSorte } from 'service/storage';

// Catálogos de referência — SEMPRE somente leitura
import { getUniverso, getOrigens, getDivindades } from 'service/storage';
import { getRacasPorUniverso, getClassesPorUniverso, getItensPorUniverso /* etc. */ } from 'service/storage';
```

Ao expandir `personagens` com um campo novo (ex.: um novo sistema de jogo), primeiro confira se ele já está descrito no schema de `MIGRACAO-REACT-FIREBASE.md` §5 — se não estiver (aconteceu algumas vezes: `status.*.atual`, `aptidoesGanhas`, `racaHabilidadesAtivas` foram todos adicionados durante a implementação porque a mecânica exigia), documente a decisão na seção "Status da implementação" daquele arquivo.

Regra de segurança (`firestore.rules`, já deployado no projeto real): cada usuário só lê/escreve documentos de `personagens` onde `resource.data.uid == request.auth.uid`, e uma regra genérica de wildcard estende a mesma checagem para qualquer subcoleção (`personagens/{id}/{subcolecao}/{docId}`). **Nunca confie só na UI** para essa restrição.

---

### Formulários com Formik + Yup

```jsx
import { Formik } from 'formik';
import * as yup from 'yup';
import { nomeSchema, campoCurtoSchema, descricaoSchema, urlImagemSchema } from 'common/utils/yupSchemas';

const meuSchema = yup.object({ nome: nomeSchema, descricao: descricaoSchema });

<Formik initialValues={valoresIniciais} validationSchema={meuSchema} onSubmit={handleSubmit}>
  {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
    <form onSubmit={submit} noValidate>{/* TextFields */}</form>
  )}
</Formik>
```

- `nomeSchema`, `campoCurtoSchema`, `descricaoSchema` (máx. 5000 caracteres), `urlImagemSchema` em `common/utils/yupSchemas.js` — reaproveite em vez de escrever `yup.string()` cru.
- Campos numéricos (Base/Extra/Bônus/Atual de atributos e status) usam o componente `components/NumberField/NumberField.jsx` (usa `useField` do Formik internamente) em vez de `TextField` + `handleChange` manual.
- Em listas onde o índice do array **não** é a identidade real do item (ex.: habilidades básicas de uma raça, que não têm id próprio no catálogo), tudo bem usar o índice como `key` — está documentado inline nesses casos. Em listas onde o usuário reordena/insere/remove livremente, use `src/hooks/useStableListKeys.js`.
- Abas com "Salvar" explícito (em vez de gravar a cada ação, como Atributos e Perfil) devem espelhar os valores em edição via `src/hooks/useDraftLocalStorage.js` + `components/DraftBanner/DraftBanner.jsx`, seguindo o padrão de `AtributosTab.jsx`/`PerfilTab.jsx`: extraia um subcomponente `*FormBody` que recebe o `formik` bag como prop (nunca chame `useEffect` dentro da função `children` passada a `<Formik>` — ela não é um componente reconhecido pelo React nem pelo `eslint-plugin-react-hooks`), só grave o rascunho quando `formik.dirty` for `true`, e limpe o rascunho (`limparRascunho()`) depois de um `onSave` bem-sucedido.

---

### Rotas

Definidas direto em `src/routes/index.jsx` (`createBrowserRouter`), sem arquivo de constantes de rota separado (diferente do projeto administrativo). `/login` é pública; `/personagens`, `/personagens/novo` e `/personagens/:id` ficam aninhadas sob `<ProtectedRoute/>`. Para adicionar uma aba nova na ficha: crie o componente em `Ficha/tabs/`, importe em `Ficha.jsx`, adicione um `<Tab value="..." label="..."/>` e a renderização condicional `{aba === '...' && <MinhaAba personagem={personagem} onSave={handleSave} />}`.

---

## Fluxo de Desenvolvimento

### Comandos Principais
```bash
npm run dev        # Servidor de desenvolvimento (Vite)
npm run build       # Build de produção
npm run preview     # Pré-visualizar o build
npm run lint         # ESLint
npm run lint:fix      # ESLint com correção automática
npm run test           # Vitest (run, não watch)
```

### Verificação de Qualidade
Antes de considerar uma mudança pronta:
1. `npm run lint` — `no-console` e `react-hooks/exhaustive-deps` são **erros**, não avisos.
2. `npm run test` — `common/utils/formulas.js` e `resolveNome.js` têm suíte de testes própria; ao adicionar uma fórmula de jogo nova (algo que envolva dados/cálculos determinísticos), escreva-a como função pura ali e cubra com teste, seguindo o padrão de `formulas.test.js` (inclusive as funções que dependem de `Math.random()`, como `rolarDado`, aceitam um `rolarDadoFn` injetável para o teste ser determinístico).
3. `npm run build` — garante que não há erro de bundle.
4. Teste manual: **não há ferramenta de browser headless disponível neste ambiente Windows local** — ao validar uma mudança de UI, instale `playwright` num diretório temporário (não como dependência do projeto) e rode contra `npm run dev`, ou peça para o usuário testar manualmente. Nunca declare uma mudança de UI validada sem tê-la efetivamente exercitado.

### Testes de fluxo (Testing Library)
Mocke `service/storage` e `context/AuthContext` com `vi.mock(...)` — os testes deste projeto **nunca** devem inicializar o Firebase de verdade. Use `fireEvent` (não há `@testing-library/user-event` instalado) e `waitFor` para assertions assíncronas. Exemplos de referência: `NovoPersonagem.test.jsx` (fluxo de criação + navegação), `AtributosTab.test.jsx` (edição recalculando total + payload salvo), `InventarioTab.test.jsx` (abrir catálogo → escolher item → confirmar).

---

## Considerações de Segurança

- A autorização é **inteiramente** baseada em dono do documento (`uid`) — não existe conceito de admin/permissão por universo neste site (isso é exclusivo do projeto administrativo).
- `firestore.rules` é a camada real de segurança — a UI nunca deve ser a única barreira.
- Valide dados no frontend com Yup antes de persistir, mas trate isso como UX, não como segurança.
- Nunca commite `.env` (já está no `.gitignore`) — contém credenciais reais do Firebase compartilhado com o projeto administrativo em produção.
- Ações que afetam o projeto Firebase compartilhado (deploy de `firestore.rules`, Firebase Hosting) exigem confirmação explícita do responsável antes de executar — nunca dispare sozinho.

---

## Diretrizes de Code Review

### O Que Verificar
- Dados lidos/escritos via `service/storage.js`, nunca `fetch`/SDK do Firestore direto num componente.
- Coleções de referência (tudo que não é `personagens`) permanecem **somente leitura** — nenhum `add*`/`update*`/`remove*` novo para elas.
- Imports usam os aliases absolutos (`common`, `components`, `context`, `hooks`, `pages`, `routes`, `service`).
- Componentes de aba têm `PropTypes` com `personagem`/`onSave` conforme o padrão.
- Estilos seguem as variáveis de `global.css`; componentes MUI novos herdam o tema de `theme.js` (nada de aparência "tema claro" vazando).
- Fórmulas de jogo novas viraram função pura em `common/utils/formulas.js` com teste correspondente.
- Nenhum `console.log` em código de produção.

### Antes do Merge
1. ✅ `npm run lint` sem erros
2. ✅ `npm run test` sem falhas
3. ✅ `npm run build` sem erros
4. ✅ Mudança de UI efetivamente testada (Playwright ad-hoc ou validação manual pedida ao usuário) — não apenas "compilou"
