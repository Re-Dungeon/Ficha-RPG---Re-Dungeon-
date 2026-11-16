import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addDoc, deleteDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

vi.mock('./firebase', () => ({ auth: { currentUser: null }, db: {} }));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn((_db, ...segmentos) => ({ path: segmentos.join('/') })),
    doc: vi.fn((_db, ...segmentos) => ({ path: segmentos.join('/') })),
    query: vi.fn((ref, ...restricoes) => ({ ref, restricoes })),
    where: vi.fn((campo, op, valor) => ({ campo, op, valor })),
    serverTimestamp: vi.fn(() => 'ts'),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
  };
});

import {
  addArt,
  addComboAtaque,
  addComboDefesa,
  addItemInventario,
  addVariante,
  duplicateComboAtaque,
  getArts,
  getCombosAtaque,
  getCombosDefesa,
  getItensInventario,
  getRmCampanha,
  getVariantes,
  limparCacheCatalogos,
  limparCacheSubcolecoes,
  removeArt,
  removeComboAtaque,
  removeComboDefesa,
  removeItemInventario,
  removeVariante,
  updateArt,
  updateComboAtaque,
  updateComboDefesa,
  updateItemInventario,
  updateVariante,
} from './storage';

const snapshotDe = nomes => ({
  docs: nomes.map(nome => ({ id: nome, data: () => ({ nome }) })),
});

describe('subcoleções do personagem (cache de leitura)', () => {
  beforeEach(() => {
    limparCacheSubcolecoes();
    vi.mocked(getDocs).mockReset();
    vi.mocked(getDocs).mockResolvedValue(snapshotDe(['x1']));
    vi.mocked(getDoc).mockReset();
    vi.mocked(addDoc).mockReset();
    vi.mocked(addDoc).mockResolvedValue({ id: 'novo' });
    vi.mocked(updateDoc).mockReset();
    vi.mocked(updateDoc).mockResolvedValue();
    vi.mocked(deleteDoc).mockReset();
    vi.mocked(deleteDoc).mockResolvedValue();
  });

  it.each([
    ['getArts', getArts],
    ['getVariantes', getVariantes],
    ['getItensInventario', getItensInventario],
    ['getCombosAtaque', getCombosAtaque],
    ['getCombosDefesa', getCombosDefesa],
  ])('%s: a segunda leitura do mesmo personagem não vai ao Firestore', async (_nome, ler) => {
    const primeira = await ler('p1');
    const segunda = await ler('p1');
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(segunda).toEqual([{ id: 'x1', nome: 'x1' }]);
    // Cópia: alterar o resultado não suja o cache.
    primeira[0].nome = 'alterado';
    primeira.push({ id: 'extra' });
    expect(await ler('p1')).toEqual([{ id: 'x1', nome: 'x1' }]);
  });

  it('aberturas simultâneas dividem a mesma leitura', async () => {
    await Promise.all([getArts('p1'), getArts('p1')]);
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it('personagem e subcoleção têm entradas separadas', async () => {
    await getArts('p1');
    await getArts('p2');
    await getVariantes('p1');
    expect(getDocs).toHaveBeenCalledTimes(3);
  });

  it('uma falha não fica em cache', async () => {
    vi.mocked(getDocs).mockRejectedValueOnce(new Error('offline'));
    await expect(getArts('p1')).rejects.toThrow('offline');
    expect(await getArts('p1')).toHaveLength(1);
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it('a entrada expira depois do TTL', async () => {
    const agora = vi.spyOn(Date, 'now');
    agora.mockReturnValue(1_000_000);
    await getArts('p1');
    agora.mockReturnValue(1_000_000 + 59 * 60 * 1000);
    await getArts('p1');
    expect(getDocs).toHaveBeenCalledTimes(1);
    agora.mockReturnValue(1_000_000 + 61 * 60 * 1000);
    await getArts('p1');
    expect(getDocs).toHaveBeenCalledTimes(2);
    agora.mockRestore();
  });

  it.each([
    ['addArt', getArts, () => addArt('p1', { nome: 'a' })],
    ['updateArt', getArts, () => updateArt('p1', 'a1', { nome: 'b' })],
    ['removeArt', getArts, () => removeArt('p1', 'a1')],
    ['addVariante', getVariantes, () => addVariante('p1', { nome: 'a' })],
    ['updateVariante', getVariantes, () => updateVariante('p1', 'v1', { nome: 'b' })],
    ['removeVariante', getVariantes, () => removeVariante('p1', 'v1')],
    ['addItemInventario', getItensInventario, () => addItemInventario('p1', { nome: 'a' })],
    [
      'updateItemInventario',
      getItensInventario,
      () => updateItemInventario('p1', 'i1', { nome: 'b' }),
    ],
    ['removeItemInventario', getItensInventario, () => removeItemInventario('p1', 'i1')],
    ['addComboAtaque', getCombosAtaque, () => addComboAtaque('p1', { nome: 'a' })],
    ['updateComboAtaque', getCombosAtaque, () => updateComboAtaque('p1', 'c1', { nome: 'b' })],
    ['removeComboAtaque', getCombosAtaque, () => removeComboAtaque('p1', 'c1')],
    ['addComboDefesa', getCombosDefesa, () => addComboDefesa('p1', { nome: 'a' })],
    ['updateComboDefesa', getCombosDefesa, () => updateComboDefesa('p1', 'c1', { nome: 'b' })],
    ['removeComboDefesa', getCombosDefesa, () => removeComboDefesa('p1', 'c1')],
  ])('%s invalida só a própria subcoleção do personagem', async (_nome, ler, escrever) => {
    await ler('p1');
    await ler('p2');
    await getArts('p3');
    vi.mocked(getDocs).mockClear();

    await escrever();
    await ler('p1');
    await ler('p2');
    await getArts('p3');

    // p1 relida; p2 (outro personagem) e a outra subcoleção seguem em cache.
    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it('duplicateComboAtaque invalida a lista de combos de ataque', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'c1',
      data: () => ({ nome: 'Golpe', custoFadiga: 2 }),
    });
    await getCombosAtaque('p1');
    await duplicateComboAtaque('p1', 'c1');
    await getCombosAtaque('p1');
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it('uma escrita durante uma leitura em andamento não deixa a lista velha no cache', async () => {
    let resolverLeitura;
    vi.mocked(getDocs).mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolverLeitura = () => resolve(snapshotDe(['velha']));
        }),
    );
    const leituraVelha = getArts('p1');
    await addArt('p1', { nome: 'nova' });
    resolverLeitura();
    await leituraVelha;

    vi.mocked(getDocs).mockResolvedValueOnce(snapshotDe(['velha', 'nova']));
    expect(await getArts('p1')).toHaveLength(2);
  });

  it('falha na escrita propaga o erro e também invalida o cache', async () => {
    await getArts('p1');
    vi.mocked(updateDoc).mockRejectedValueOnce(new Error('negado'));
    await expect(updateArt('p1', 'a1', {})).rejects.toThrow('negado');
    await getArts('p1');
    expect(getDocs).toHaveBeenCalledTimes(2);
  });

  it('addArt devolve a referência criada, com o id acessível', async () => {
    expect((await addArt('p1', { nome: 'a' })).id).toBe('novo');
  });
});

describe('getRmCampanha (cache dos catálogos)', () => {
  beforeEach(() => {
    limparCacheCatalogos();
    vi.mocked(getDoc).mockReset();
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'c1',
      data: () => ({ nome: 'Campanha', mestreId: 'm1' }),
    });
  });

  it('a segunda leitura da mesma campanha não vai ao Firestore e devolve cópia', async () => {
    const primeira = await getRmCampanha('c1');
    expect(primeira).toEqual({ id: 'c1', nome: 'Campanha', mestreId: 'm1' });
    primeira.nome = 'alterado';
    expect((await getRmCampanha('c1')).nome).toBe('Campanha');
    expect(getDoc).toHaveBeenCalledTimes(1);
  });

  it('aberturas simultâneas dividem a leitura; outra campanha lê de novo', async () => {
    await Promise.all([getRmCampanha('c1'), getRmCampanha('c1')]);
    expect(getDoc).toHaveBeenCalledTimes(1);
    await getRmCampanha('c2');
    expect(getDoc).toHaveBeenCalledTimes(2);
  });

  it('uma falha não fica em cache', async () => {
    vi.mocked(getDoc).mockRejectedValueOnce(new Error('offline'));
    await expect(getRmCampanha('c1')).rejects.toThrow('offline');
    expect((await getRmCampanha('c1')).nome).toBe('Campanha');
    expect(getDoc).toHaveBeenCalledTimes(2);
  });
});
