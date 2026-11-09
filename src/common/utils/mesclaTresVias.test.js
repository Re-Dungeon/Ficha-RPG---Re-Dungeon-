import { describe, expect, it } from 'vitest';

import { mesclarTresVias, valoresIguais } from 'common/utils/mesclaTresVias';

const status = (hp, energia) => ({
  hp: { base: 10, extra: 0, bonus: 0, atual: hp },
  energia: { base: 5, extra: 0, bonus: 0, atual: energia },
});

describe('mesclarTresVias', () => {
  it('não desfaz o PV mudado pelo grid quando a aba salva o status inteiro', () => {
    const base = { status: status(20, 8) };
    // A aba mexeu só na energia; o hp do patch é o antigo (20).
    const patch = { status: status(20, 3) };
    // Enquanto isso o grid baixou o PV para 12.
    const atual = { status: status(12, 8), nome: 'Aldric' };

    expect(mesclarTresVias(base, patch, atual)).toEqual({ status: status(12, 3) });
  });

  it('o que o usuário mudou vence o valor do Firestore', () => {
    const base = { status: status(20, 8) };
    const patch = { status: status(5, 8) };
    const atual = { status: status(12, 8) };

    expect(mesclarTresVias(base, patch, atual).status.hp.atual).toBe(5);
  });

  it('arrays são atômicos: mudou → vale o patch; não mudou → vale o atual', () => {
    const base = { condicoesAtivas: [{ id: 'a' }], inventario: ['x'] };
    const patch = { condicoesAtivas: [{ id: 'a' }, { id: 'b' }], inventario: ['x'] };
    const atual = { condicoesAtivas: [], inventario: ['x', 'y'] };

    expect(mesclarTresVias(base, patch, atual)).toEqual({
      condicoesAtivas: [{ id: 'a' }, { id: 'b' }],
      inventario: ['x', 'y'],
    });
  });

  it('chave nova do patch (que não existe no atual) é gravada', () => {
    expect(mesclarTresVias({}, { nivel: 3 }, {})).toEqual({ nivel: 3 });
    expect(
      mesclarTresVias({ status: {} }, { status: { fadiga: { atual: 2 } } }, { status: {} }),
    ).toEqual({ status: { fadiga: { atual: 2 } } });
  });

  it('preserva campos aninhados do atual que o patch não tem', () => {
    const base = { estadoCombate: { ppAtual: 4 } };
    const patch = { estadoCombate: { ppAtual: 2 } };
    const atual = { estadoCombate: { ppAtual: 4, turno: 3 } };

    expect(mesclarTresVias(base, patch, atual)).toEqual({
      estadoCombate: { ppAtual: 2, turno: 3 },
    });
  });

  it('sem base devolve o patch como veio', () => {
    const patch = { status: status(1, 1) };
    expect(mesclarTresVias(undefined, patch, { status: status(9, 9) })).toBe(patch);
  });
});

describe('valoresIguais', () => {
  it('compara objetos, arrays e timestamps por valor', () => {
    expect(valoresIguais({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(valoresIguais({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(valoresIguais([1, 2], [2, 1])).toBe(false);
    expect(valoresIguais({ toMillis: () => 5 }, { toMillis: () => 5 })).toBe(true);
    expect(valoresIguais(null, 0)).toBe(false);
  });
});
