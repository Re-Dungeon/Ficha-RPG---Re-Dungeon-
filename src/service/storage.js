import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from 'service/firebase';

export const getFirestoreItems = async (collectionName, ...queryConstraints) => {
  const itemsQuery = query(collection(db, collectionName), ...queryConstraints);
  const snapshot = await getDocs(itemsQuery);
  return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};

export const getFirestoreItem = async (collectionName, id) => {
  const snapshot = await getDoc(doc(db, collectionName, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addFirestoreItem = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateFirestoreItem = (collectionName, id, data) =>
  updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeFirestoreItem = (collectionName, id) =>
  deleteDoc(doc(db, collectionName, id));

export const getPersonagens = uid =>
  getFirestoreItems('personagens', where('uid', '==', uid));

export const getPersonagem = id => getFirestoreItem('personagens', id);

export const addPersonagem = data => addFirestoreItem('personagens', data);

export const updatePersonagem = (id, data) => updateFirestoreItem('personagens', id, data);

export const removePersonagem = id => removeFirestoreItem('personagens', id);

// Companheiros são outro doc top-level de `personagens` com `companheiroDe`
// apontando pro id do personagem "base" — não uma subcoleção (ver
// MIGRACAO-REACT-FIREBASE.md §5). Os dois filtros são necessários porque
// `firestore.rules` restringe list queries a `uid == request.auth.uid`.
export const getCompanheiros = (uid, personagemId) =>
  getFirestoreItems('personagens', where('uid', '==', uid), where('companheiroDe', '==', personagemId));

// ── historicoSorte — subcoleção personagens/{id}/historicoSorte (§6, §5.1) ──

export const getHistoricoSorte = async personagemId => {
  const historicoQuery = query(
    collection(db, 'personagens', personagemId, 'historicoSorte'),
    orderBy('timestamp', 'desc'),
    limit(10),
  );
  const snapshot = await getDocs(historicoQuery);
  return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};

export const addHistoricoSorte = (personagemId, evento) =>
  addDoc(collection(db, 'personagens', personagemId, 'historicoSorte'), {
    ...evento,
    timestamp: serverTimestamp(),
  });

const getSubcolecaoItems = async (parentCollection, parentId, subcollectionName) => {
  const snapshot = await getDocs(collection(db, parentCollection, parentId, subcollectionName));
  return snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
};

// ── aptidoesAdquiridas — subcoleção personagens/{id}/aptidoesAdquiridas (§9) ─
// Doc id = id da aptidão no catálogo `aptidoes`; campo `nivel` só (sem bônus).

export const getAptidoesAdquiridas = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'aptidoesAdquiridas');

export const setAptidaoAdquirida = (personagemId, aptidaoId, nivel) =>
  setDoc(doc(db, 'personagens', personagemId, 'aptidoesAdquiridas', aptidaoId), {
    nivel,
    updatedAt: serverTimestamp(),
  });

export const removeAptidaoAdquirida = (personagemId, aptidaoId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'aptidoesAdquiridas', aptidaoId));

// ── nucleos — subcoleção personagens/{id}/nucleos (§10) ─────────────────────
// Pré-requisito de toda Art: nome, tipo, bonus (curto), descricao (essência), imagem.

export const getNucleos = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'nucleos');

export const addNucleo = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'nucleos'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateNucleo = (personagemId, nucleoId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'nucleos', nucleoId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeNucleo = (personagemId, nucleoId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'nucleos', nucleoId));

// ── arts — subcoleção personagens/{id}/arts (§10, §5.1) ─────────────────────
// Cada doc tem `origem: 'autoral' | 'classe' | 'catalogo'` + os campos
// correspondentes a essa origem, e sempre um `nucleoId` (obrigatório em
// qualquer origem — ver MIGRACAO-REACT-FIREBASE.md §5.1).

export const getArts = personagemId => getSubcolecaoItems('personagens', personagemId, 'arts');

export const addArt = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'arts'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateArt = (personagemId, artId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'arts', artId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeArt = (personagemId, artId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'arts', artId));

// ── variantes — subcoleção personagens/{id}/variantes (§10) ─────────────────
// Sub-versão de uma Art (`artId`), domínio sempre menor que o da Art base
// (dominioVarianteValido em common/utils/formulas.js); não conta no limite de
// Arts ativas por viver numa coleção própria.

export const getVariantes = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'variantes');

export const addVariante = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'variantes'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateVariante = (personagemId, varianteId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'variantes', varianteId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeVariante = (personagemId, varianteId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'variantes', varianteId));

// ── itensInventario — subcoleção personagens/{id}/itensInventario (§14) ─────
// Cada doc é uma cópia própria do personagem (nunca uma referência viva ao
// catálogo `itens`) — `origem: 'autoral' | 'catalogo'` + `itemId` opcional
// (só proveniência/rastreio, nunca relido pra exibir). Mesmo padrão de arts/
// nucleos/variantes: escolher do catálogo copia os campos pro doc do
// personagem, que passa a ser livremente editável sem tocar o catálogo.

export const getItensInventario = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'itensInventario');

export const addItemInventario = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'itensInventario'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateItemInventario = (personagemId, itemInventarioId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'itensInventario', itemInventarioId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeItemInventario = (personagemId, itemInventarioId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'itensInventario', itemInventarioId));

// ── materiaisInventario — subcoleção personagens/{id}/materiaisInventario ──
// Mesmo padrão de itensInventario: cópia própria do personagem, nunca uma
// referência viva ao catálogo `materiais` — `origem: 'autoral' | 'catalogo'`
// + `materialId` opcional (só proveniência).

export const getMateriaisInventario = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'materiaisInventario');

export const addMaterialInventario = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'materiaisInventario'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateMaterialInventario = (personagemId, materialInventarioId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'materiaisInventario', materialInventarioId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeMaterialInventario = (personagemId, materialInventarioId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'materiaisInventario', materialInventarioId));

// ── receitasInventario — subcoleção personagens/{id}/receitasInventario ────
// Mesmo padrão de itensInventario/materiaisInventario — `origem: 'autoral' |
// 'catalogo'` + `receitaId` opcional (só proveniência).

export const getReceitasInventario = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'receitasInventario');

export const addReceitaInventario = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'receitasInventario'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateReceitaInventario = (personagemId, receitaInventarioId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'receitasInventario', receitaInventarioId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeReceitaInventario = (personagemId, receitaInventarioId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'receitasInventario', receitaInventarioId));

// ── Coleções de referência do projeto administrativo — somente leitura ─────
// Compartilhadas no mesmo Firestore; nunca add*/update*/remove* a partir
// deste site (ver MIGRACAO-REACT-FIREBASE.md §4).

const getColecaoPorUniverso = (collectionName, universoId) =>
  getFirestoreItems(collectionName, where('universo', '==', universoId));

export const getUniverso = () => getFirestoreItems('Universo');
export const getOrigens = () => getFirestoreItems('origens');
export const getDivindades = () => getFirestoreItems('divindades');

export const getRacasPorUniverso = universoId =>
  getColecaoPorUniverso('racas', universoId);

export const getOrigensPorUniverso = universoId =>
  getColecaoPorUniverso('origens', universoId);

export const getClassesPorUniverso = universoId =>
  getColecaoPorUniverso('classes', universoId);

export const getCondicoesPorUniverso = universoId =>
  getColecaoPorUniverso('condicoes', universoId);

// Aptidões são o único catálogo que pode pertencer a mais de um universo — o
// projeto administrativo migrou o campo de `universo` (string) para `universos`
// (array), mas documentos antigos ainda não recadastrados pelo novo formulário
// continuam só com `universo`. Consulta os dois formatos e mescla, removendo
// duplicatas por id (confirmado lendo o Firestore + o repositório administrativo
// em 2026-07-22 — nenhum doc tinha os dois campos ao mesmo tempo).
export const getAptidoesPorUniverso = async universoId => {
  const [porUniversos, porUniversoLegado] = await Promise.all([
    getFirestoreItems('aptidoes', where('universos', 'array-contains', universoId)),
    getFirestoreItems('aptidoes', where('universo', '==', universoId)),
  ]);
  const vistos = new Set();
  return [...porUniversos, ...porUniversoLegado].filter(item => {
    if (vistos.has(item.id)) {
      return false;
    }
    vistos.add(item.id);
    return true;
  });
};

export const getVeiasAstraisPorUniverso = universoId =>
  getColecaoPorUniverso('veiasAstrais', universoId);

export const getItensPorUniverso = universoId =>
  getColecaoPorUniverso('itens', universoId);

export const getMateriaisPorUniverso = universoId =>
  getColecaoPorUniverso('materiais', universoId);

export const getReceitasPorUniverso = universoId =>
  getColecaoPorUniverso('receitas', universoId);

export const getArtesPorUniverso = universoId =>
  getColecaoPorUniverso('artes', universoId);

// `regras` é filtrada por universo (confirmado pelo usuário — corrige a
// suposição cautelosa de MIGRACAO-REACT-FIREBASE.md §4.1, que a listava como
// possivelmente compartilhada). Usada pelo Códex Mágico (§21).
export const getRegrasPorUniverso = universoId =>
  getColecaoPorUniverso('regras', universoId);
