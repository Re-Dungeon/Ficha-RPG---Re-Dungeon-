import { describe, expect, it } from 'vitest';

import { calcularLayoutArvore } from './arvoreLayout';

describe('calcularLayoutArvore', () => {
  it('posiciona uma árvore simples com profundidade crescente por parentId', () => {
    const nos = [
      { id: 'raiz', parentId: null },
      { id: 'filho', parentId: 'raiz' },
      { id: 'neto', parentId: 'filho' },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('raiz').x).toBeLessThan(posicoes.get('filho').x);
    expect(posicoes.get('filho').x).toBeLessThan(posicoes.get('neto').x);
  });

  it('não trava em recursão infinita quando parentId forma um ciclo (dado de catálogo malformado)', () => {
    const nos = [
      { id: 'a', parentId: 'b' },
      { id: 'b', parentId: 'a' },
      { id: 'solto', parentId: null },
    ];

    const resultado = calcularLayoutArvore(nos);

    expect(resultado.posicoes.size).toBe(3);
    expect(Number.isFinite(resultado.posicoes.get('a').x)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('b').x)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('a').y)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('b').y)).toBe(true);
  });
});
