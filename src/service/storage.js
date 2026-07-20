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

// ── arts — subcoleção personagens/{id}/arts (§10, §5.1) ─────────────────────
// Cada doc tem `origem: 'autoral' | 'classe' | 'catalogo'` + os campos
// correspondentes a essa origem (ver MIGRACAO-REACT-FIREBASE.md §5.1).

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

export const getClassesPorUniverso = universoId =>
  getColecaoPorUniverso('classes', universoId);

export const getCondicoesPorUniverso = universoId =>
  getColecaoPorUniverso('condicoes', universoId);

export const getAptidoesPorUniverso = universoId =>
  getColecaoPorUniverso('aptidoes', universoId);

export const getVeiasAstraisPorUniverso = universoId =>
  getColecaoPorUniverso('veiasAstrais', universoId);

export const getItensPorUniverso = universoId =>
  getColecaoPorUniverso('itens', universoId);

export const getArtesPorUniverso = universoId =>
  getColecaoPorUniverso('artes', universoId);

// `regras` é filtrada por universo (confirmado pelo usuário — corrige a
// suposição cautelosa de MIGRACAO-REACT-FIREBASE.md §4.1, que a listava como
// possivelmente compartilhada). Usada pelo Códex Mágico (§21).
export const getRegrasPorUniverso = universoId =>
  getColecaoPorUniverso('regras', universoId);
