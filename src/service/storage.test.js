import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, doc, getDocs, runTransaction, where } from 'firebase/firestore';

vi.mock('service/firebase', () => ({
  auth: { currentUser: { uid: 'user-1', email: 'user@example.com' } },
  db: {},
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  return {
    ...actual,
    collection: vi.fn((dbRef, name) => ({ dbRef, name })),
    doc: vi.fn((dbRef, name, id) => ({ dbRef, name, id })),
    query: vi.fn((...args) => args),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    getDocs: vi.fn(),
    runTransaction: vi.fn(async (_db, callback) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
        update: vi.fn(),
      };
      await callback(transaction);
      return transaction;
    }),
  };
});

import {
  consumirRecursosPersonagem,
  getBeneficiosPorUniverso,
  getOrigensPorUniverso,
  normalizarPersonagemCarregado,
  updatePersonagem,
} from './storage';

describe('storage benefit catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: [{ id: 'b1', data: () => ({ universo: 'u1', nome: 'Benefício do universo', universos: ['u1'] }) }],
    });
  });

  it('usa somente a coleção oficial tricksterCoin para a Loja da Trapaça', async () => {
    const itens = await getBeneficiosPorUniverso('u1');

    expect(itens).toHaveLength(1);
    expect(collection).toHaveBeenCalledTimes(2);
    expect(collection).toHaveBeenNthCalledWith(1, expect.any(Object), 'tricksterCoin');
    expect(collection).toHaveBeenNthCalledWith(2, expect.any(Object), 'tricksterCoin');
    expect(where).toHaveBeenCalledTimes(2);
    expect(getDocs).toHaveBeenCalledTimes(2);
  });
});

describe('origin catalog compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filtra origens por universo legado e por arrays multiuniverso sem duplicar registros', async () => {
    const origemGlobal = { id: 'o-global', nome: 'Origem Global', universo: 're', universos: ['re'] };
    const origemMulti = { id: 'o-multi', nome: 'Origem Multi', universos: ['u1', 'u2'] };
    const origemLegada = { id: 'o-legacy', nome: 'Origem Legada', universo: 'u1' };

    getDocs.mockImplementation(async query => {
      const filtro = query?.[1]?.value ?? query?.[0]?.value ?? null;
      const docs = [
        { id: origemGlobal.id, data: () => origemGlobal },
        { id: origemMulti.id, data: () => origemMulti },
        { id: origemLegada.id, data: () => origemLegada },
      ];

      return {
        docs: docs.filter(doc => {
          const item = doc.data();
          const universos = Array.isArray(item.universos) ? item.universos : [];
          const universoLegado = item.universo ?? item.universoId ?? item.universo_id;
          if (filtro === 'u1') {
            return universos.includes('u1') || universoLegado === 'u1';
          }
          return true;
        }),
      };
    });

    const itens = await getOrigensPorUniverso('u1');

    expect(itens.map(item => item.id)).toEqual(expect.arrayContaining(['o-multi', 'o-legacy']));
    expect(itens.map(item => item.id)).not.toContain('o-global');
    expect(itens).toHaveLength(2);
  });
});

describe('resource consumption invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantém o status atual quando todos os custos são zero ou inválidos', async () => {
    vi.mocked(runTransaction).mockImplementation(async (_db, callback) => {
      const transaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({
            status: {
              energia: { atual: 42, maximo: 60 },
              fadiga: { atual: 7, maximo: 10 },
              hp: { atual: 80, maximo: 100 },
            },
            statusMaximos: {
              energia: 60,
              fadiga: 10,
              hp: 100,
            },
          }),
        }),
        update: vi.fn(),
      };

      return callback(transaction);
    });

    const resultado = await consumirRecursosPersonagem('p1', { energia: 0, fadiga: 0, saude: 0 });

    expect(resultado).toMatchObject({
      energia: { atual: 42, maximo: 60 },
      fadiga: { atual: 7, maximo: 10 },
      gastoEnergia: 0,
      gastoFadiga: 0,
      gastoSaude: 0,
      saude: { atual: 80, maximo: 100 },
    });

    const transactionArg = vi.mocked(runTransaction).mock.calls[0][1];
    const updateSpy = vi.fn();
    const getSpy = vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({
        status: { energia: { atual: 42, maximo: 60 }, fadiga: { atual: 7, maximo: 10 }, hp: { atual: 80, maximo: 100 } },
        statusMaximos: { energia: 60, fadiga: 10, hp: 100 },
      }),
    });

    await transactionArg({ get: getSpy, update: updateSpy });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(runTransaction).toHaveBeenCalledTimes(1);
  });
});

describe('combat persistence compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normaliza campos planos do combate em um personagem carregado', () => {
    const personagem = {
      id: 'p1',
      nome: 'Nerak',
      prontidaoMaximaEfetiva: 315,
      prontidaoAtual: 240,
      ppGastosTurno: 75,
      turnoNumero: 3,
      historicoAcoes: [{ nome: 'Atacar', custo: '-75 PP', turno: 'Turno 3' }],
    };

    const resultado = normalizarPersonagemCarregado(personagem);

    expect(resultado.estadoCombate).toMatchObject({
      ppAtual: 240,
      turno: 3,
      historicoAcoes: personagem.historicoAcoes,
    });
    expect(resultado.prontidaoMaximaEfetiva).toBe(315);
    expect(resultado.prontidaoAtual).toBe(240);
  });

  it('persiste dados de combate no formato compatível com o Re sem sobrescrever outros campos', async () => {
    const payload = {
      nome: 'Nerak',
      estadoCombate: {
        ppAtual: 240,
        turno: 3,
        historicoAcoes: [{ nome: 'Atacar', custo: '-75 PP', turno: 'Turno 3' }],
      },
    };

    await updatePersonagem('p1', payload);

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledWith(expect.any(Object), 'personagens', 'p1');

    const transaction = vi.mocked(runTransaction).mock.results[0].value;
    await transaction.then?.(value => value);

    const transactionArg = vi.mocked(runTransaction).mock.calls[0][1];
    const updateSpy = vi.fn();
    const getSpy = vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) });
    await transactionArg({ get: getSpy, update: updateSpy });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        nome: 'Nerak',
        estadoCombate: expect.objectContaining({
          ppAtual: 240,
          turno: 3,
          historicoAcoes: payload.estadoCombate.historicoAcoes,
        }),
        prontidaoMaximaEfetiva: 0,
        prontidaoAtual: 240,
        ppGastosTurno: 0,
        turnoNumero: 3,
        historicoAcoes: payload.estadoCombate.historicoAcoes,
      }),
    );
  });
});
