import { describe, expect, it } from 'vitest';

import { calcularLayoutArvore } from './arvoreLayout';

describe('calcularLayoutArvore', () => {
  it('posiciona uma árvore simples com profundidade crescente por parentIds', () => {
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'filho', parentIds: ['raiz'] },
      { id: 'neto', parentIds: ['filho'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('raiz').x).toBeLessThan(posicoes.get('filho').x);
    expect(posicoes.get('filho').x).toBeLessThan(posicoes.get('neto').x);
  });

  it('não trava em recursão infinita quando parentIds forma um ciclo (dado de catálogo malformado)', () => {
    const nos = [
      { id: 'a', parentIds: ['b'] },
      { id: 'b', parentIds: ['a'] },
      { id: 'solto', parentIds: [] },
    ];

    const resultado = calcularLayoutArvore(nos);

    expect(resultado.posicoes.size).toBe(3);
    expect(Number.isFinite(resultado.posicoes.get('a').x)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('b').x)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('a').y)).toBe(true);
    expect(Number.isFinite(resultado.posicoes.get('b').y)).toBe(true);
  });

  it('posiciona um nó com 2+ pais estritamente à direita do pai mais profundo (requisito duplo)', () => {
    // raiz -> a -> b, raiz -> c (mais raso); confluencia exige a e c ambos.
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'a', parentIds: ['raiz'] },
      { id: 'b', parentIds: ['a'] },
      { id: 'c', parentIds: ['raiz'] },
      { id: 'confluencia', parentIds: ['b', 'c'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('confluencia').x).toBeGreaterThan(posicoes.get('b').x);
    expect(posicoes.get('confluencia').x).toBeGreaterThan(posicoes.get('c').x);
  });

  it('não empilha nós de colunas diferentes na mesma linha quando um requisito duplo converge (regressão)', () => {
    // raiz -> a -> b, raiz -> c (mais raso); confluencia exige b e c. Sem a
    // separação de colisão, `a`, `b` e `c` colapsavam todos na mesma linha de
    // `raiz` porque `confluencia` (filho compartilhado) só tem sua linha
    // calculada uma vez e ambos os pais centralizam nela.
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'a', parentIds: ['raiz'] },
      { id: 'b', parentIds: ['a'] },
      { id: 'c', parentIds: ['raiz'] },
      { id: 'confluencia', parentIds: ['b', 'c'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('a').y).not.toBe(posicoes.get('c').y);
  });

  it('centraliza o nó pai na altura média dos filhos, mesmo após a resolução de colisão (regressão)', () => {
    // raiz -> a -> b, raiz -> c (mais raso); confluencia exige b e c. `a` e
    // `c` são empurrados pra linhas diferentes pra não colidir — mas `raiz`
    // (pai de ambos) precisa ficar centralizada na média das posições FINAIS
    // deles, não na posição "ideal" pré-colisão.
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'a', parentIds: ['raiz'] },
      { id: 'b', parentIds: ['a'] },
      { id: 'c', parentIds: ['raiz'] },
      { id: 'confluencia', parentIds: ['b', 'c'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    const mediaFilhos = (posicoes.get('a').y + posicoes.get('c').y) / 2;
    expect(posicoes.get('raiz').y).toBe(mediaFilhos);
  });
});
