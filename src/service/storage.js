import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
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

export const consumirRecursosPersonagem = async (personagemId, recursos = {}) => {
  const gastoEnergia = Math.max(0, Number(recursos?.energia ?? 0) || 0);
  const gastoFadiga = Math.max(0, Number(recursos?.fadiga ?? 0) || 0);
  const gastoSaude = Math.max(0, Number(recursos?.saude ?? recursos?.hp ?? 0) || 0);

  if (gastoEnergia <= 0 && gastoFadiga <= 0 && gastoSaude <= 0) {
    return {
      energia: { atual: 0, maximo: 0 },
      fadiga: { atual: 0, maximo: 0 },
      gastoEnergia: 0,
      gastoFadiga: 0,
      gastoSaude: 0,
    };
  }

  return runTransaction(db, async transaction => {
    const ref = doc(db, 'personagens', personagemId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      throw new Error('Personagem não encontrado para atualizar os recursos.');
    }

    const personagemAtual = snapshot.data() ?? {};
    const statusAtual = personagemAtual.status ?? {};
    const statusMaximosAtual = personagemAtual.statusMaximos ?? {};
    const saudeStatusAtual = statusAtual?.hp ?? statusAtual?.saude ?? {};
    const saudeStatusMaximoAtual = statusMaximosAtual?.hp ?? statusMaximosAtual?.saude ?? {};
    const energiaAtual = Number(statusAtual?.energia?.atual ?? 0);
    const energiaMaxima = Number(
      statusMaximosAtual?.energia ?? statusAtual?.energia?.maximo ?? 0,
    );
    const fadigaAtual = Number(statusAtual?.fadiga?.atual ?? 0);
    const fadigaMaxima = Number(
      statusMaximosAtual?.fadiga ?? statusAtual?.fadiga?.maximo ?? 0,
    );
    const saudeAtual = Number(saudeStatusAtual?.atual ?? 0);
    const saudeMaxima = Number(
      saudeStatusMaximoAtual?.maximo ?? saudeStatusMaximoAtual ?? saudeStatusAtual?.maximo ?? 0,
    );

    if (gastoEnergia > 0 && energiaAtual < gastoEnergia) {
      throw new Error('Energia insuficiente para realizar a ação.');
    }

    if (gastoFadiga > 0 && fadigaAtual < gastoFadiga) {
      throw new Error('Fadiga insuficiente para realizar a ação.');
    }

    if (gastoSaude > 0 && saudeAtual < gastoSaude) {
      throw new Error('Saúde insuficiente para realizar a ação.');
    }

    const proximaEnergia = Math.max(0, energiaAtual - gastoEnergia);
    const proximaFadiga = Math.max(0, fadigaAtual - gastoFadiga);
    const proximaSaude = Math.max(0, saudeAtual - gastoSaude);
    const proximoStatus = {
      ...statusAtual,
      hp: {
        ...((statusAtual.hp ?? statusAtual.saude ?? {})),
        atual: proximaSaude,
        maximo: saudeMaxima || ((statusAtual.hp ?? statusAtual.saude ?? {}).maximo ?? proximaSaude),
      },
      ...(Object.prototype.hasOwnProperty.call(statusAtual, 'saude') || Object.prototype.hasOwnProperty.call(statusMaximosAtual, 'saude')
        ? {
            saude: {
              ...((statusAtual.saude ?? statusAtual.hp ?? {})),
              atual: proximaSaude,
              maximo: saudeMaxima || ((statusAtual.saude ?? statusAtual.hp ?? {}).maximo ?? proximaSaude),
            },
          }
        : {}),
      energia: {
        ...((statusAtual.energia ?? {})),
        atual: proximaEnergia,
        maximo: energiaMaxima || ((statusAtual.energia ?? {}).maximo ?? proximaEnergia),
      },
      fadiga: {
        ...((statusAtual.fadiga ?? {})),
        atual: proximaFadiga,
        maximo: fadigaMaxima || ((statusAtual.fadiga ?? {}).maximo ?? proximaFadiga),
      },
    };

    transaction.update(ref, {
      status: proximoStatus,
      statusMaximos: {
        ...statusMaximosAtual,
        hp: saudeMaxima || Number(statusMaximosAtual?.hp ?? statusMaximosAtual?.saude ?? (statusAtual.hp ?? statusAtual.saude ?? {}).maximo ?? proximaSaude),
        ...(Object.prototype.hasOwnProperty.call(statusMaximosAtual, 'saude') || Object.prototype.hasOwnProperty.call(statusAtual, 'saude')
          ? {
              saude: saudeMaxima || Number(statusMaximosAtual?.saude ?? statusMaximosAtual?.hp ?? (statusAtual.saude ?? statusAtual.hp ?? {}).maximo ?? proximaSaude),
            }
          : {}),
        energia: energiaMaxima || Number(statusMaximosAtual?.energia ?? (statusAtual.energia ?? {}).maximo ?? proximaEnergia),
        fadiga: fadigaMaxima || Number(statusMaximosAtual?.fadiga ?? (statusAtual.fadiga ?? {}).maximo ?? proximaFadiga),
      },
      updatedAt: serverTimestamp(),
    });

    const resultado = {
      energia: { atual: proximaEnergia, maximo: energiaMaxima || Number((statusAtual.energia ?? {}).maximo ?? proximaEnergia) },
      fadiga: { atual: proximaFadiga, maximo: fadigaMaxima || Number((statusAtual.fadiga ?? {}).maximo ?? proximaFadiga) },
      gastoEnergia,
      gastoFadiga,
      gastoSaude,
    };

    if (gastoSaude > 0 || Object.prototype.hasOwnProperty.call(statusAtual, 'hp') || Object.prototype.hasOwnProperty.call(statusAtual, 'saude')) {
      resultado.saude = { atual: proximaSaude, maximo: saudeMaxima || Number((statusAtual.hp ?? statusAtual.saude ?? {}).maximo ?? proximaSaude) };
    }

    return resultado;
  });
};

export const consumirEnergiaPersonagem = async (personagemId, custoEnergia) => {
  const gasto = Math.max(0, Number(custoEnergia) || 0);
  if (gasto <= 0) {
    return { atual: 0, gasto: 0 };
  }

  const resultado = await consumirRecursosPersonagem(personagemId, { energia: gasto, fadiga: 0 });
  return { atual: resultado.energia.atual, gasto, maximo: resultado.energia.maximo };
};

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

// ── efeitosGuardados — subcoleção personagens/{id}/efeitosGuardados (§15) ─
// Guarda cada benefício comprado em uma entrada própria da ficha, com
// `beneficioId` + `quantidade` + timestamps. Mantém o layout compatível com os
// dados antigos em `personagem.lojaTrapaça.efeitosAtivos` sem duplicar o
// catálogo em si.
export const getEfeitosGuardados = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'efeitosGuardados');

export const setEfeitoGuardado = (personagemId, beneficioId, data) =>
  setDoc(doc(db, 'personagens', personagemId, 'efeitosGuardados', beneficioId), {
    beneficioId,
    quantidade: Number(data.quantidade ?? 0),
    usosPeriodo: Number(data.usosPeriodo ?? 0),
    referenciaPeriodo: data.referenciaPeriodo ?? null,
    nome: data.nome ?? null,
    categoria: data.categoria ?? null,
    adquiridoEm: data.adquiridoEm ?? null,
    ...data,
    createdAt: data.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const removeEfeitoGuardado = (personagemId, beneficioId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'efeitosGuardados', beneficioId));

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

// ── notas — subcoleção personagens/{id}/notas (novas notas do personagem)
// Estrutura: { title, content, plainText, coverImage, isFavorite, createdAt, updatedAt }
export const getNotas = personagemId => getSubcolecaoItems('personagens', personagemId, 'notas');

export const getNota = async (personagemId, notaId) => {
  const snapshot = await getDoc(doc(db, 'personagens', personagemId, 'notas', notaId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addNota = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'notas'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateNota = (personagemId, notaId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'notas', notaId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeNota = (personagemId, notaId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'notas', notaId));

export const duplicateNota = async (personagemId, notaId) => {
  const nota = await getNota(personagemId, notaId);
  if (!nota) return null;
  const rest = { ...nota };
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  const ref = await addDoc(collection(db, 'personagens', personagemId, 'notas'), {
    ...rest,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// ── combosAtaque — subcoleção personagens/{id}/combosAtaque ──
export const getCombosAtaque = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'combosAtaque');

export const getComboAtaque = async (personagemId, comboId) => {
  const snapshot = await getDoc(doc(db, 'personagens', personagemId, 'combosAtaque', comboId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addComboAtaque = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'combosAtaque'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateComboAtaque = (personagemId, comboId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'combosAtaque', comboId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeComboAtaque = (personagemId, comboId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'combosAtaque', comboId));

export const duplicateComboAtaque = async (personagemId, comboId) => {
  const combo = await getComboAtaque(personagemId, comboId);
  if (!combo) return null;
  const rest = { ...combo };
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  const ref = await addDoc(collection(db, 'personagens', personagemId, 'combosAtaque'), {
    ...rest,
    nome: `${rest.nome ?? 'Combinação'} (cópia)`,
    custoFadiga: Number(rest.custoFadiga ?? 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// ── combosDefesa — subcoleção personagens/{id}/combosDefesa ──
export const getCombosDefesa = personagemId =>
  getSubcolecaoItems('personagens', personagemId, 'combosDefesa');

export const getComboDefesa = async (personagemId, comboId) => {
  const snapshot = await getDoc(doc(db, 'personagens', personagemId, 'combosDefesa', comboId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addComboDefesa = (personagemId, data) =>
  addDoc(collection(db, 'personagens', personagemId, 'combosDefesa'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateComboDefesa = (personagemId, comboId, data) =>
  updateDoc(doc(db, 'personagens', personagemId, 'combosDefesa', comboId), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const removeComboDefesa = (personagemId, comboId) =>
  deleteDoc(doc(db, 'personagens', personagemId, 'combosDefesa', comboId));

export const duplicateComboDefesa = async (personagemId, comboId) => {
  const combo = await getComboDefesa(personagemId, comboId);
  if (!combo) return null;
  const rest = { ...combo };
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  const ref = await addDoc(collection(db, 'personagens', personagemId, 'combosDefesa'), {
    ...rest,
    nome: `${rest.nome ?? 'Combinação'} (cópia)`,
    custoFadiga: Number(rest.custoFadiga ?? 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

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

// `rmCampanhas` é do módulo Re:Master e usa `universoId` (não `universo`
// como os catálogos do Re-Dungeon acima) — não reaproveita getColecaoPorUniverso.
export const getRmCampanhasPorUniverso = universoId =>
  getFirestoreItems('rmCampanhas', where('universoId', '==', universoId));

export const getOrigensPorUniverso = universoId =>
  getColecaoPorUniverso('origens', universoId);

export const getClassesPorUniverso = universoId =>
  getColecaoPorUniverso('classes', universoId);

export const getCorposEspeciaisPorUniverso = universoId =>
  getColecaoPorUniverso('corposEspeciais', universoId);

// Aptidões, Condições e Regras podem pertencer a mais de um universo — o
// projeto administrativo migrou o campo de `universo` (string) para `universos`
// (array) nesses três catálogos, mas documentos antigos ainda não recadastrados
// pelo novo formulário continuam só com `universo`. Consulta os dois formatos e
// mescla, removendo duplicatas por id (mesmo padrão validado em 2026-07-22 para
// aptidoes, estendido em 2026-07-23 quando condicoes/regras ganharam o mesmo
// campo `universos` no admin, commit dd0d038).
const getColecaoMultiUniversoPorUniverso = async (collectionName, universoId) => {
  const [porUniversos, porUniversoLegado] = await Promise.all([
    getFirestoreItems(collectionName, where('universos', 'array-contains', universoId)),
    getFirestoreItems(collectionName, where('universo', '==', universoId)),
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

export const getCondicoesPorUniverso = universoId =>
  getColecaoMultiUniversoPorUniverso('condicoes', universoId);

export const getAptidoesPorUniverso = universoId =>
  getColecaoMultiUniversoPorUniverso('aptidoes', universoId);

export const getVeiasAstraisPorUniverso = universoId =>
  getColecaoPorUniverso('veiasAstrais', universoId);

// `itens` continua com `universo` singular (não migrado para `universos` no
// admin), mas ganhou o booleano `mostrarNaLoja` (commit dd0d038, 2026-07-23):
// só itens marcados por lá devem aparecer na Loja e no catálogo de "Adicionar
// Item" da aba Inventário — os dois únicos consumidores deste catálogo no site
// (LojaModal.jsx e CriarItemDialog.jsx). Filtro feito em memória (não via query
// Firestore) para não exigir um índice composto novo.
export const getItensPorUniverso = async universoId => {
  const itens = await getColecaoPorUniverso('itens', universoId);
  return itens.filter(item => item.mostrarNaLoja === true);
};

export const getMateriaisPorUniverso = universoId =>
  getColecaoPorUniverso('materiais', universoId);

export const getReceitasPorUniverso = universoId =>
  getColecaoPorUniverso('receitas', universoId);

export const getArtesPorUniverso = universoId =>
  getColecaoPorUniverso('artes', universoId);

// `regras` é filtrada por universo (confirmado pelo usuário — corrige a
// suposição cautelosa de MIGRACAO-REACT-FIREBASE.md §4.1, que a listava como
// possivelmente compartilhada) e agora também pode pertencer a mais de um
// universo — mesmo padrão `universos`/`universo` legado de condicoes/aptidoes.
// Usada pelo Códex Mágico (§21).
export const getRegrasPorUniverso = universoId =>
  getColecaoMultiUniversoPorUniverso('regras', universoId);

// `tricksterCoin` é a coleção oficial do catálogo de benefícios no projeto
// administrativo Re. A ficha do jogador usa o mesmo formato de catálogo em
// `universos`/`universo` legado, mas a fonte de dados deve ser única para evitar
// consultas redundantes e erros de permissão em coleções antigas.
export const getBeneficios = async () => {
  try {
    return await getFirestoreItems('tricksterCoin');
  } catch {
    return [];
  }
};

export const getBeneficiosPorUniverso = async universoId => {
  if (!universoId) {
    return [];
  }

  try {
    return await getColecaoMultiUniversoPorUniverso('tricksterCoin', universoId);
  } catch {
    return [];
  }
};

// `reinosCultivo` — catálogo dos Reinos do Sistema de Cultivo. Deixou de ser
// exclusivo do universo Cultivo (confirmado por doc de teste em `reinosCultivo`
// com `universo` de outro universo e `subUniverso: ''`): todo universo pode ter
// sua própria trilha de Reinos, filtrada primeiro por `universo`. Universos com
// múltiplos sistemas paralelos (ex.: Cultivo, que tem "Doupo Cangqiong",
// "Martial Peak" etc. no campo `SubUniversos` do doc `Universo`) também
// filtram por `subUniverso`; universos sem esse campo não têm o seletor de
// sistema — os Reinos têm `subUniverso: ''` e o filtro é só por `universo`.
// A ordem da trilha NÃO vem de um campo de índice: cada Reino aponta o
// anterior por `reinoAnterior` (id; "" no primeiro) — use `ordenarReinosCultivo`
// (common/utils/formulas.js) para montar a sequência. Somente leitura.
export const getReinosCultivo = (universoId, subUniverso = '') => {
  const constraints = [where('universo', '==', universoId)];
  if (subUniverso) {
    constraints.push(where('subUniverso', '==', subUniverso));
  }
  return getFirestoreItems('reinosCultivo', ...constraints);
};

// ── Chat da campanha — rmCampanhas/{id}/chatMembros e chatMensagens ───────
// Única escrita do player site em coleções `rm*`: só essas duas subcoleções,
// e o `firestore.rules` confere em cada operação que o personagem apontado é
// do usuário e ainda tem a campanha em `campanhas` (o mestre acessa via
// `mestreId`). `chatMembros/{uid}` é só um ponteiro `{uid, personagemId}`
// usado pela regra de leitura — criado ao abrir o chat, sem migração.
export const CHAT_LIMITE_MENSAGENS = 100;

export const getRmCampanha = id => getFirestoreItem('rmCampanhas', id);

export const setChatMembro = (campanhaId, uid, personagemId) =>
  setDoc(doc(db, 'rmCampanhas', campanhaId, 'chatMembros', uid), {
    uid,
    personagemId,
    updatedAt: serverTimestamp(),
  });

// Primeiro listener em tempo real do projeto: devolve o `unsubscribe` do
// `onSnapshot` — chame-o no cleanup do `useEffect`. As mensagens chegam em
// ordem cronológica (mais antiga primeiro), já limitadas às últimas 100.
export const subscribeChatMensagens = (campanhaId, onChange, onError) => {
  const mensagensQuery = query(
    collection(db, 'rmCampanhas', campanhaId, 'chatMensagens'),
    orderBy('createdAt', 'desc'),
    limit(CHAT_LIMITE_MENSAGENS),
  );
  return onSnapshot(
    mensagensQuery,
    snapshot => {
      const mensagens = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data({ serverTimestamps: 'estimate' }),
      }));
      onChange(mensagens.reverse());
    },
    onError,
  );
};

export const addChatMensagem = (campanhaId, mensagem) =>
  addDoc(collection(db, 'rmCampanhas', campanhaId, 'chatMensagens'), {
    ...mensagem,
    createdAt: serverTimestamp(),
  });

export const removeChatMensagem = (campanhaId, mensagemId) =>
  deleteDoc(doc(db, 'rmCampanhas', campanhaId, 'chatMensagens', mensagemId));
