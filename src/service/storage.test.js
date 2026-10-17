import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, getDocs, where } from 'firebase/firestore';

vi.mock('service/firebase', () => ({
  auth: { currentUser: { uid: 'user-1', email: 'user@example.com' } },
  db: {},
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  return {
    ...actual,
    collection: vi.fn((dbRef, name) => ({ dbRef, name })),
    query: vi.fn((...args) => args),
    where: vi.fn((field, op, value) => ({ field, op, value })),
    getDocs: vi.fn(),
  };
});

import { getBeneficiosPorUniverso } from './storage';

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
