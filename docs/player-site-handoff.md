# Handoff — Re-Dungeon Player Site

> Documento de referência para o agente de IA que vai criar o **novo projeto**: um site para os **jogadores** do RPG Re-Dungeon consultarem e gerenciarem seus próprios personagens. Este novo site é uma aplicação **separada** (repositório próprio), mas compartilha o **mesmo projeto Firebase** (Auth + Firestore) do projeto administrativo "Re-Dungeon — Banco de Dados".

> ✅ **Status (2026-07-19): implementado.** Na prática, a implementação aconteceu **neste mesmo repositório** (`Ficha-RPG---Re-Dungeon-`) — substituindo o site vanilla que existia aqui — em vez de um repositório novo separado como este documento assumia. Fora esse detalhe de onde o código mora, tudo abaixo (Firebase compartilhado, schema de `personagens`, regra do Firestore, autenticação simplificada, stack, estrutura de pastas) foi seguido como especificado. Ver [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md) (seção "Status da implementação") para o detalhamento fase a fase e os desvios pontuais tomados durante a construção, e `CLAUDE.md` para as convenções de código já em uso no projeto real.

---

## 1. Objetivo do novo projeto

Um site onde jogadores:
1. Fazem login (e-mail/senha, cadastro ou Google) usando o **mesmo Firebase Auth** do projeto atual.
2. Após o login, são redirecionados para uma tela de consulta **"Meus Personagens"**, listando apenas os personagens cujo dono (`uid`) é o usuário logado.
3. Podem **criar, visualizar, editar e remover** seus próprios personagens (ficha de personagem).
4. Ao montar/editar uma ficha, podem **consultar** (somente leitura) os dados de referência já cadastrados no projeto administrativo: Raças, Classes, Itens, Materiais, Artes, Origens, Condições, Regras, CardFlux, Veias Astrais, Divindades, Aptidões — por exemplo para escolher a raça/classe do personagem ou vincular itens do inventário.

Jogadores **não** têm acesso às telas administrativas de CRUD dessas entidades de referência — isso continua existindo **apenas** no projeto atual (Re-Dungeon — Banco de Dados). O novo site é somente leitura para tudo que não for o próprio personagem do usuário.

---

## 2. Integração com o Firebase existente

- **Mesmo projeto Firebase** (mesmo `projectId`) do repositório atual — não criar um projeto Firebase novo.
- Reaproveite os mesmos valores de `.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`) — como é o mesmo projeto, o `authDomain`/`projectId` serão idênticos. É opcional (mas recomendado) registrar um novo **Web App** dentro do mesmo projeto Firebase console (Configurações do projeto → Seus apps) só para ter métricas/appId separados; isso não muda o Auth nem o Firestore, que continuam compartilhados.
- Como o Auth é o mesmo projeto, um usuário que já tem conta no site administrativo consegue logar com as mesmas credenciais no site dos jogadores (e vice-versa) — são a mesma base de usuários do Firebase Auth.
- **Nunca duplique dados de referência.** O novo site deve **ler** as coleções `racas`, `classes`, `itens`, `materiais`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`, `divindades`, `aptidoes` e `Universo` diretamente do mesmo Firestore — nunca copiá-las ou reimplementá-las.

---

## 3. Modelo de dados

### 3.1 Coleções existentes (somente leitura no novo site)

Já existem no Firestore e seguem todas o mesmo formato `{ id, ...campos, createdAt, updatedAt }`:
`classes`, `materiais`, `racas`, `itens`, `receitas`, `condicoes`, `artes`, `origens`, `regras`, `cardflux`, `veiasAstrais`, `divindades`, `aptidoes`, `Universo` (somente leitura também no projeto atual), `userPermissions` (não é relevante para o site dos jogadores — é usada apenas para permissões administrativas do projeto atual).

O novo site só precisa das funções `get*` (leitura) dessas coleções — nunca `add*`/`update*`/`remove*`.

### 3.2 Coleção nova: `personagens`

Esta coleção **não existe ainda** e precisa ser criada como parte deste novo projeto (tanto o código quanto as regras do Firestore). Sugestão de schema, seguindo o mesmo estilo das entidades existentes:

```js
{
  id: string,              // gerado pelo Firestore
  uid: string,              // uid do dono (request.auth.uid) — obrigatório, imutável após criação
  nome: string,              // nomeSchema
  raca: string,              // id do doc em `racas` (opcional)
  classe: string,            // id do doc em `classes` (opcional)
  origem: string,            // id do doc em `origens` (opcional)
  universo: string,          // id do doc em `Universo` (opcional, se a campanha usa universos)
  atributosBase: {
    forca: number, vitalidade: number, agilidade: number,
    inteligencia: number, percepcao: number, sorte: number,
  },
  atributosBonus: {
    forca: number, vitalidade: number, agilidade: number,
    inteligencia: number, percepcao: number, sorte: number,
  },
  atributosExtra: {
    forca: number, vitalidade: number, agilidade: number,
    inteligencia: number, percepcao: number, sorte: number,
  },
  inventario: [
    { itemId: string, quantidade: number },
  ],
  habilidades: [
    { nome: string, descricao: string, origem: string }, // origem: 'raça' | 'classe' | 'aptidão' etc.
  ],
  linkImagem: string,        // urlImagemSchema
  descricao: string,         // descricaoSchema (história/aparência do personagem)
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}
```

Ajuste os campos conforme a ficha real de personagem da campanha — o importante é manter `uid` como campo raiz obrigatório, pois é ele que a regra de segurança do Firestore vai usar para restringir leitura/escrita ao dono.

`service/storage.js` do novo projeto deve seguir **exatamente** o padrão genérico já usado no projeto atual (`getFirestoreItems`/`addFirestoreItem`/`updateFirestoreItem`/`removeFirestoreItem` por trás de wrappers finos `getPersonagens`/`addPersonagem`/`updatePersonagem`/`removePersonagem`), mas a listagem deve ser filtrada por `uid` — ou via query Firestore (`where('uid', '==', currentUser.uid)`) em vez de buscar todos os documentos, já que os personagens de outros usuários não devem nem trafegar para o cliente.

### 3.3 Regras do Firestore — o que precisa ser adicionado

O arquivo `firestore.rules` do projeto atual **precisa ganhar um novo bloco** para a coleção `personagens` (esse arquivo é compartilhado — a alteração deve ser feita e deployada a partir do projeto atual, já que é o dono do projeto Firebase):

```
// ── personagens ────────────────────────────────────────────────────────────
// Cada usuário só lê/escreve os próprios personagens (campo uid == request.auth.uid).
match /personagens/{personagemId} {
  allow read: if isAuth() && resource.data.uid == request.auth.uid;
  allow create: if isAuth() && request.resource.data.uid == request.auth.uid;
  allow update: if isAuth() && resource.data.uid == request.auth.uid
                && request.resource.data.uid == request.auth.uid;
  allow delete: if isAuth() && resource.data.uid == request.auth.uid;
}
```

As demais coleções (`racas`, `classes`, `itens`, etc.) já têm `allow read: if isAuth();`, então jogadores autenticados conseguem ler sem nenhuma mudança adicional. A escrita nessas coleções já depende de `userPermissions`/`isAdmin`/`allowedUniversos` — um jogador comum não terá esse documento, então `canWriteUniverso()` retorna `false` automaticamente e a escrita já fica bloqueada sem precisar de regra extra.

> ⚠️ Nunca confiar apenas na UI para essa restrição — a regra do Firestore acima é a camada que efetivamente impede um jogador de ler/editar o personagem de outro usuário.

---

## 4. Autenticação

> Como o novo projeto é um repositório separado, o agente de IA que for implementá-lo **não tem acesso ao código-fonte do projeto atual**. Por isso, o código abaixo é o conteúdo real (adaptado) dos arquivos `src/service/firebase.js`, `src/context/AuthContext.jsx` e `src/components/ProtectedRoute/ProtectedRoute.jsx` do projeto atual — copie/adapte diretamente a partir daqui, sem precisar consultar o outro repositório.

### 4.1 `src/service/firebase.js` (copiar exatamente igual)

Inicializa o app Firebase e exporta as instâncias usadas em todo o projeto. Deve ser **byte-a-byte igual** ao do projeto atual — como é o mesmo projeto Firebase, o `firebaseConfig` (via `.env`) também é o mesmo.

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

**Como funciona:** `initializeApp` cria a conexão com o projeto Firebase a partir das credenciais do `.env`. `auth` é a instância do Firebase Auth (usada para login/logout/cadastro), `googleProvider` é o provider usado no popup de login com Google, e `db` é a instância do Firestore (usada por `service/storage.js` para ler/escrever documentos). Qualquer outro arquivo do projeto que precise falar com o Firebase importa a partir daqui — nunca chama `initializeApp`/`getAuth`/`getFirestore` diretamente.

### 4.2 `src/context/AuthContext.jsx` (adaptar — remover permissões de admin)

No projeto atual, o `AuthContext` combina o estado de autenticação com o hook `usePermissions` (que calcula `isAdmin`/`allowedUniversos`/`canCreate`/`canWrite`, usados para liberar telas de administração de entidades). O site dos jogadores **não tem** esse conceito — a permissão de escrita é sempre implícita (dono do personagem). Versão simplificada, sem `usePermissions`:

```javascript
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from 'service/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, user => {
      clearTimeout(timeout);
      setCurrentUser(user);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [],
  );

  const signup = useCallback(
    (email, password) => createUserWithEmailAndPassword(auth, email, password),
    [],
  );

  const loginWithGoogle = useCallback(
    () => signInWithPopup(auth, googleProvider),
    [],
  );

  const logout = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({ currentUser, loading, login, signup, loginWithGoogle, logout }),
    [currentUser, loading, login, signup, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
```

**Como funciona:**
- `currentUser`/`loading`: `onAuthStateChanged` é o listener do Firebase Auth — dispara toda vez que o usuário loga, desloga, ou quando a página recarrega e o Firebase restaura a sessão a partir do `localStorage` interno do SDK. Enquanto o Firebase ainda não respondeu, `loading` fica `true` (o `setTimeout` de 5s é um fallback de segurança para não travar `loading` para sempre caso o listener demore/falhe). É esse `loading` que o `ProtectedRoute` usa para não redirecionar para `/login` prematuramente antes do Firebase confirmar se já existe sessão.
- `login`/`signup`/`loginWithGoogle`/`logout`: wrappers finos em cima das funções do SDK (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup` com o `googleProvider`, `signOut`). Todas retornam uma Promise — quem chama (ex.: a tela `/login`) deve dar `await`/`.catch` para tratar erro (credenciais inválidas, e-mail já cadastrado, popup fechado pelo usuário, etc.) e mostrar feedback.
- `useMemo`/`useCallback`: evitam recriar o objeto `value` (e as funções) a cada render do `AuthProvider`, o que evitaria re-renders desnecessários em todo componente que consome `useAuth()`.
- `useAuth()`: hook de conveniência que qualquer componente usa para ler `{ currentUser, loading, login, signup, loginWithGoogle, logout }` sem precisar importar `useContext`/`AuthContext` diretamente.
- Este `AuthProvider` deve envolver a árvore de rotas no `App.jsx`/`main.jsx` do novo projeto (mesma posição em que está no projeto atual), para que `useAuth()` funcione em qualquer página.

### 4.3 `src/components/ProtectedRoute/ProtectedRoute.jsx` (adaptar — redirecionar em vez de mostrar mensagem)

No projeto atual, como existe conteúdo público (a home), o `ProtectedRoute` apenas exibe uma mensagem "Acesso Restrito" quando não há usuário logado. No site dos jogadores **tudo depende de login**, então o comportamento correto é redirecionar para `/login`:

```jsx
import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from 'context/AuthContext';

const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      height: '100%',
    }}
  >
    <CircularProgress sx={{ color: 'var(--color-primary)' }} />
  </Box>
);

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Outlet />
    </Suspense>
  );
};

export default ProtectedRoute;
```

**Como funciona:**
- É uma *layout route* do React Router: no `routes/index.jsx`, todas as rotas internas (`/personagens`, `/personagens/novo`, etc.) ficam **aninhadas** dentro de um elemento `<ProtectedRoute />`, e o `<Outlet />` é onde a rota filha correspondente é renderizada.
- Enquanto `loading` é `true` (Firebase ainda não confirmou se há sessão), mostra um spinner — **não redireciona ainda**, para não mandar um usuário já logado para `/login` só porque o Firebase ainda não respondeu.
- Se `loading` terminou e `!currentUser`, usa `<Navigate to="/login" replace />` para redirecionar (em vez do `Box` com "Acesso Restrito" do projeto atual). `replace` evita empilhar a rota protegida no histórico do navegador (botão "voltar" não volta para uma tela que exigia login). `state={{ from: location }}` é opcional, mas permite que a tela `/login` redirecione de volta para a rota que o usuário tentou acessar originalmente, após autenticar com sucesso.
- Se há usuário logado, renderiza `<Outlet />` (a rota filha) dentro de um `Suspense`, para cobrir o caso de páginas carregadas via `React.lazy`.

**Diferença importante em relação ao projeto atual:** o site dos jogadores **não precisa** do conceito de `isAdmin`/`allowedUniversos`/`canCreate`/`canWrite(universoId)` do `usePermissions.js` — esse modelo é sobre permissão de escrita nas entidades de referência (administração da campanha), que não existe no site dos jogadores. Em vez disso, a "permissão de escrita" do jogador é implícita: ele sempre pode escrever nos próprios personagens (`uid` do doc == `uid` do usuário logado) e nunca nos de terceiros — não precisa de hook de permissões, a checagem é feita comparando `personagem.uid === currentUser.uid` antes de mostrar os botões de editar/remover.

**Fluxo de redirecionamento pós-login:** como este site não tem um "dashboard público" — tudo depende do usuário estar logado — a tela de login deve ser uma **rota própria** (`/login`), não um modal na sidebar como no projeto atual. Após autenticar com sucesso (`login`/`signup`/`loginWithGoogle` resolvendo sem erro), redirecionar via `navigate` para a rota de listagem de personagens (ex.: `/personagens`, ou para `location.state?.from` se veio de um redirecionamento do `ProtectedRoute`).

---

## 5. Tech stack (mesma do projeto atual, por consistência)

- **React 19** + **Vite**
- **Material-UI (@mui/material)** para componentes de UI
- **Styled Components** para estilização customizada
- **React Router DOM v7**
- **Formik** + **Yup** para formulários e validação
- **Firebase/Firestore** + **Firebase Auth** (projeto compartilhado, ver seção 2)
- **PropTypes** para tipagem de props (não há TypeScript no projeto atual)
- **ESLint** (`eslint-plugin-jsx-a11y`, `eslint-config-prettier`) + **Prettier**
- **Vitest** + **Testing Library** para testes

Versões de referência (`package.json` do projeto atual) — usar as mesmas major versions para evitar incompatibilidades caso algum código/hook seja copiado entre os dois projetos:
```json
"@mui/material": "^9.1.2",
"firebase": "^12.15.0",
"formik": "^2.4.9",
"react": "^19.2.7",
"react-router-dom": "^7.18.0",
"styled-components": "^6.4.3",
"yup": "^1.7.1"
```

---

## 6. Padrões de código (idênticos ao projeto atual)

Copiar as convenções de `CLAUDE.md` do projeto atual:

- **camelCase** para variáveis/funções, **PascalCase** para componentes, **SCREAMING_SNAKE_CASE** para constantes.
- Import order: (1) bibliotecas externas, (2) serviços/utils internos com **caminhos absolutos** (`service/storage`, `context/AuthContext`), (3) imports relativos (styles, componentes locais).
- Componentes funcionais com Hooks → handlers → render, sempre com `PropTypes` (`propTypes` + `defaultProps` quando aplicável).
- Estilização: `styles.js` por página com `styled-components`, reaproveitando as **mesmas variáveis CSS globais** do projeto atual (`--color-primary`, `--color-accent`, `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-primary`, `--border-hover`, `--shadow-md`, etc. — ver `src/common/styles/global.css` do projeto atual). Manter o mesmo tema dark/glassmorphism para consistência visual entre os dois sites.
- Formulários: Formik + Yup, reaproveitando (copiar o arquivo) `src/common/utils/yupSchemas.js` do projeto atual — `nomeSchema`, `campoCurtoSchema`, `descricaoSchema`, `urlImagemSchema`.
- Listas dinâmicas (`FieldArray`, ex.: inventário/habilidades do personagem): **nunca usar o índice do array como `key`** — copiar `src/hooks/useStableListKeys.js` do projeto atual.
- Padrão de arquivos por página: `NomePagina.jsx`, `styles.js`, `constants.js`, `utils.js` (schema Yup + helpers).
- Serviço de dados: tudo passa por `service/storage.js`, seguindo o padrão genérico de CRUD do Firestore (`getFirestoreItems`/`addFirestoreItem`/`updateFirestoreItem`/`removeFirestoreItem` com `createdAt`/`updatedAt` via `serverTimestamp()`).
- Antes de commitar: `npm run eslint`, `npm run eslint-fix`, `npx prettier --write` nos arquivos modificados. `no-console` e `react-hooks/exhaustive-deps` devem ser erros no `eslint.config.js`, igual ao projeto atual.
- Sem `console.log` em produção. Sanitizar inputs antes de persistir. Validar com Yup no frontend, mas **nunca confiar só na UI** — a regra do Firestore (seção 3.3) é a camada real de segurança.

---

## 7. Estrutura de pastas sugerida

Mesma organização do projeto atual, adaptada às páginas deste novo site:

```
src/
├── assets/
├── common/
│   ├── constants/       # routes.js, navItems.js
│   ├── styles/          # global.css (mesmas variáveis do projeto atual)
│   └── utils/           # yupSchemas.js (copiado do projeto atual)
├── components/          # Header, Layout, ProtectedRoute, EntityFilters, EntityViewDialog...
├── context/
│   └── AuthContext.jsx  # sem lógica de isAdmin/universos
├── hooks/
│   └── useStableListKeys.js
├── pages/
│   ├── Login/            # tela de login própria (rota /login, não modal)
│   └── Personagens/
│       ├── Personagens.jsx      # "Meus Personagens" — grid filtrado por uid
│       ├── NovoPersonagem.jsx   # criar/editar ficha (Formik)
│       ├── styles.js
│       └── utils.js             # schema Yup da ficha
├── routes/
│   └── index.jsx
└── service/
    ├── firebase.js       # mesmo firebaseConfig (env vars) do projeto atual
    └── storage.js         # getPersonagens/addPersonagem/... + get* de leitura das entidades de referência
```

---

## 8. Telas principais

1. **`/login`** — tela de login (e-mail/senha, cadastro, Google), inspirada em `src/components/LoginModal/LoginModal.jsx` do projeto atual, mas como página cheia em vez de modal.
2. **`/personagens`** (rota protegida, redirecionamento pós-login) — grid de cards "Meus Personagens", **filtrado no próprio Firestore** por `uid == currentUser.uid` (não buscar tudo e filtrar no client). Segue o padrão visual de `src/pages/Recursos/Racas/Racas.jsx` (cards em grid, busca por nome, dialog de visualização com `EntityViewDialog`), removendo o filtro por universo/raridade (substituir por filtro relevante à ficha, ex.: nome/classe) e removendo `canWrite()` — o botão de editar/remover aparece sempre que `personagem.uid === currentUser.uid` (ou seja, sempre, já que a listagem já é só dos próprios).
3. **`/personagens/novo`** — formulário Formik+Yup para criar/editar personagem, com selects alimentados pelas coleções de referência lidas do Firestore (`getRacas`, `getClasses`, `getOrigens`, `getItens` para inventário) e `FieldArray` + `useStableListKeys` para habilidades/inventário.
4. **Dialog/tela de visualização da ficha** — reaproveitar o padrão de `EntityViewDialog` do projeto atual para mostrar atributos, inventário e habilidades do personagem.

---

## 9. O que NÃO replicar neste novo site

- Nenhuma tela de administração das entidades de referência (Raças, Classes, Itens, Materiais, Receitas, Condições, Artes, Origens, Regras, CardFlux, Veias Astrais, Divindades, Aptidões) — essas telas de CRUD continuam existindo **apenas** no projeto "Re-Dungeon — Banco de Dados".
- O modelo de permissões `isAdmin`/`allowedUniversos`/`userPermissions` — é específico do fluxo administrativo e não deve ser copiado para o site dos jogadores.
- Qualquer duplicação de dados das coleções de referência — sempre ler direto do Firestore compartilhado.

---

## 10. Checklist de setup para o novo projeto

> ✅ Concluído em 2026-07-19 — dentro deste mesmo repositório, não um projeto novo criado do zero.

- [x] Scaffold Vite + React + instalar as dependências da seção 5 (adaptado ao repo existente, sem `npm create vite@latest` — ver `package.json`).
- [x] `.env` com as credenciais do Firebase (mesmo `projectId`) — já existia no repo, reaproveitado.
- [x] `src/common/styles/global.css` (variáveis CSS) — recriado do zero seguindo a especificação da seção 6 (o código-fonte original não estava disponível para copiar).
- [x] `src/common/utils/yupSchemas.js` e `src/hooks/useStableListKeys.js` — idem, recriados a partir da especificação.
- [x] `AuthContext` simplificado (sem `usePermissions`) — `src/context/AuthContext.jsx`, byte-a-byte igual ao código desta seção 4.2, exceto que `signup`/`loginWithGoogle` foram removidos depois a pedido do responsável do projeto (contas são criadas manualmente pelo mestre/administrador — login é só e-mail/senha).
- [x] `service/storage.js` com leitura das coleções de referência + CRUD de `personagens` filtrado por `uid` — e mais: CRUD das subcoleções (`aptidoesAdquiridas`, `arts`, `historicoSorte`) que foram necessárias conforme a ficha cresceu além do escopo original deste handoff.
- [x] Bloco de regra `personagens` no `firestore.rules` — criado neste repo (que passou a ser o dono do Firestore, já que a migração não usou um repositório separado) e **já deployado no projeto Firebase real**.
- [x] `/login`, `/personagens` e `/personagens/novo` — e muito mais: a ficha completa (`/personagens/:id`) com 10 abas, muito além do MVP que este handoff descrevia. Ver [MIGRACAO-REACT-FIREBASE.md](./MIGRACAO-REACT-FIREBASE.md).
