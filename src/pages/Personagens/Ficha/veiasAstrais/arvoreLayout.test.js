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

  it('centraliza um nó com 2+ pais na altura média DESSES pais, não na posição herdada dos seus filhos', () => {
    // raiz -> a -> b, raiz -> c (mais raso); confluencia exige b e c e não
    // tem filho próprio. Sem a fase 2, `confluencia` fica na posição herdada
    // da fase 1 (baseada em si mesma como folha) em vez de centralizada entre
    // `b` e `c`.
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'a', parentIds: ['raiz'] },
      { id: 'b', parentIds: ['a'] },
      { id: 'c', parentIds: ['raiz'] },
      { id: 'confluencia', parentIds: ['b', 'c'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    const mediaPais = (posicoes.get('b').y + posicoes.get('c').y) / 2;
    expect(posicoes.get('confluencia').y).toBe(mediaPais);
  });

  it('centraliza uma cadeia de convergências sucessivas (diamante de diamantes) sem colisão', () => {
    // raiz -> a, raiz -> b, raiz -> c (3 filhos diretos);
    // d exige a e b; e exige b e c; final exige d e e.
    const nos = [
      { id: 'raiz', parentIds: [] },
      { id: 'a', parentIds: ['raiz'] },
      { id: 'b', parentIds: ['raiz'] },
      { id: 'c', parentIds: ['raiz'] },
      { id: 'd', parentIds: ['a', 'b'] },
      { id: 'e', parentIds: ['b', 'c'] },
      { id: 'final', parentIds: ['d', 'e'] },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('d').y).toBe((posicoes.get('a').y + posicoes.get('b').y) / 2);
    expect(posicoes.get('e').y).toBe((posicoes.get('b').y + posicoes.get('c').y) / 2);
    expect(posicoes.get('final').y).toBe((posicoes.get('d').y + posicoes.get('e').y) / 2);

    // Nenhum par de nós na mesma coluna deve colidir.
    const porColuna = new Map();
    nos.forEach(no => {
      const x = posicoes.get(no.id).x;
      if (!porColuna.has(x)) porColuna.set(x, []);
      porColuna.get(x).push(posicoes.get(no.id).y);
    });
    porColuna.forEach(ys => {
      expect(new Set(ys).size).toBe(ys.length);
    });
  });

  it('usa o campo `nivel` do catálogo (não a profundidade calculada) pra decidir a coluna', () => {
    // pai nivel1; filhoNivel2 e filhoNivel3 exigem o MESMO pai (mesmo
    // `requisito`) mas têm nivel diferente — devem cair em colunas
    // diferentes, uma pra cada nivel.
    const nos = [
      { id: 'pai', parentIds: [], nivel: 1 },
      { id: 'filhoNivel2', parentIds: ['pai'], nivel: 2 },
      { id: 'filhoNivel3', parentIds: ['pai'], nivel: 3 },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('filhoNivel2').x).not.toBe(posicoes.get('filhoNivel3').x);
    expect(posicoes.get('filhoNivel3').x).toBeGreaterThan(posicoes.get('filhoNivel2').x);
  });

  it('coloca um nó nivel 3 sem nenhum requisito na 3ª coluna (índice 2)', () => {
    const nos = [{ id: 'orfaoNivel3', parentIds: [], nivel: 3 }];

    const { posicoes } = calcularLayoutArvore(nos);

    // x = coluna * 150 + 75; coluna 2 (3ª coluna, 0-indexada) => x = 375.
    expect(posicoes.get('orfaoNivel3').x).toBe(375);
  });

  it('dois nós de mesmo nivel caem na mesma coluna mesmo com requisitos diferentes', () => {
    const nos = [
      { id: 'raizA', parentIds: [], nivel: 1 },
      { id: 'raizB', parentIds: [], nivel: 1 },
      { id: 'filhoA', parentIds: ['raizA'], nivel: 3 },
      { id: 'filhoB', parentIds: ['raizB'], nivel: 3 },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('filhoA').x).toBe(posicoes.get('filhoB').x);
  });

  it('nunca posiciona um nó antes de um pai seu, mesmo se o nivel do catálogo for menor que o do pai (dado real)', () => {
    // Caso real observado no catálogo: uma veia nivel 3 (custo 0, um "bônus")
    // exige 2 veias nivel 4 — o nivel sozinho a colocaria ANTES dos pais
    // (coluna 2), mas a cadeia de `parentIds` deve vencer aqui.
    const nos = [
      { id: 'preRequisitoA', parentIds: [], nivel: 4 },
      { id: 'preRequisitoB', parentIds: [], nivel: 4 },
      { id: 'bonusNivelBaixo', parentIds: ['preRequisitoA', 'preRequisitoB'], nivel: 3 },
    ];

    const { posicoes } = calcularLayoutArvore(nos);

    expect(posicoes.get('bonusNivelBaixo').x).toBeGreaterThan(posicoes.get('preRequisitoA').x);
    expect(posicoes.get('bonusNivelBaixo').x).toBeGreaterThan(posicoes.get('preRequisitoB').x);
  });
});
