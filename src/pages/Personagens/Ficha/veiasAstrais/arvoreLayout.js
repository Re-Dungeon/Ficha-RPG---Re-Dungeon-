// Layout puro (sem dependência de React) de um grafo acíclico de nós ligados
// por `parentIds` (um nó pode exigir 2+ veias-pai) — usado pelo
// ConstelacaoArvoreModal pra posicionar cada nó em x/y antes de desenhar os
// círculos e as linhas de conexão em SVG.
const COLUMN_WIDTH = 150;
const ROW_HEIGHT = 110;

// Profundidade calculada a partir da cadeia real de `parentIds` (não do campo
// `camada`, que é só um rótulo do catálogo) — quando há múltiplos pais, usa o
// mais profundo deles, garantindo que o nó fique estritamente à direita de
// TODOS os seus pais na árvore desenhada.
const calcularProfundidades = (nos, porId) => {
  const profundidade = new Map();
  // `visitando` guarda os nós no caminho de recursão atual: dado de catálogo é
  // admin-managed e este site só lê, então um `parentIds` formando ciclo (ex. A
  // aponta pra B e B aponta de volta pra A) não pode virar recursão infinita —
  // trata o nó que fecha o ciclo como raiz (profundidade 0) em vez de travar.
  const visitando = new Set();
  const resolver = no => {
    if (profundidade.has(no.id)) {
      return profundidade.get(no.id);
    }
    if (visitando.has(no.id)) {
      profundidade.set(no.id, 0);
      return 0;
    }
    visitando.add(no.id);
    const pais = (no.parentIds ?? []).map(id => porId.get(id)).filter(Boolean);
    const valor = pais.length === 0 ? 0 : Math.max(...pais.map(resolver)) + 1;
    visitando.delete(no.id);
    profundidade.set(no.id, valor);
    return valor;
  };
  nos.forEach(resolver);
  return profundidade;
};

export const calcularLayoutArvore = nos => {
  const porId = new Map(nos.map(no => [no.id, no]));
  // Um nó com múltiplos pais entra na lista de filhos de CADA um deles — o
  // `atribuirLinha` abaixo memoiza por id, então a linha é decidida na
  // primeira vez que o nó é alcançado e as visitas seguintes (via outro pai)
  // só reaproveitam o valor já calculado.
  const filhosPorPai = new Map();
  nos.forEach(no => {
    const pais = (no.parentIds ?? []).filter(id => porId.has(id));
    const chaves = pais.length > 0 ? pais : [null];
    chaves.forEach(chave => {
      if (!filhosPorPai.has(chave)) {
        filhosPorPai.set(chave, []);
      }
      filhosPorPai.get(chave).push(no);
    });
  });

  const profundidade = calcularProfundidades(nos, porId);

  const linhaPorId = new Map();
  const visitandoLinha = new Set();
  let proximaLinha = 0;
  const atribuirLinha = no => {
    if (linhaPorId.has(no.id)) {
      return linhaPorId.get(no.id);
    }
    // Mesma proteção contra ciclo de calcularProfundidades: se `no` já está no
    // caminho de recursão atual, trata como folha em vez de recursar pra sempre.
    if (visitandoLinha.has(no.id)) {
      const linha = proximaLinha;
      proximaLinha += 1;
      linhaPorId.set(no.id, linha);
      return linha;
    }
    visitandoLinha.add(no.id);
    const filhos = filhosPorPai.get(no.id) ?? [];
    let linha;
    if (filhos.length === 0) {
      linha = proximaLinha;
      proximaLinha += 1;
    } else {
      const linhas = filhos.map(atribuirLinha);
      linha = linhas.reduce((total, valor) => total + valor, 0) / linhas.length;
    }
    visitandoLinha.delete(no.id);
    linhaPorId.set(no.id, linha);
    return linha;
  };
  (filhosPorPai.get(null) ?? []).forEach(atribuirLinha);

  // Nós presos num ciclo puro (ex. A aponta pra B e B aponta de volta pra A,
  // sem nenhum deles descender de uma raiz real) nunca são alcançados pela
  // varredura a partir de `filhosPorPai.get(null)` acima — sem isso, ficariam
  // sem linha atribuída (`y: NaN` no SVG). Varre o que sobrou e força a
  // atribuição de linha pra esses nós isolados também.
  nos.forEach(no => {
    if (!linhaPorId.has(no.id)) {
      atribuirLinha(no);
    }
  });

  // Um nó com 2+ pais (requisito duplo) é alcançado por mais de uma entrada em
  // `filhosPorPai` mas só tem sua linha calculada UMA vez (memoizada) — cada
  // pai que o referencia centraliza sua própria linha nesse mesmo valor
  // memoizado, então pais distintos que convergem pro mesmo filho acabam
  // recebendo a linha idêntica (e tudo que penda deles também), colapsando o
  // ramo inteiro numa única linha visual. Esta passagem final agrupa os nós
  // por coluna (profundidade) e empurra qualquer colisão pra a próxima linha
  // livre, preservando a ordem relativa das linhas "ideais" calculadas acima.
  const porColuna = new Map();
  nos.forEach(no => {
    const coluna = profundidade.get(no.id);
    if (!porColuna.has(coluna)) {
      porColuna.set(coluna, []);
    }
    porColuna.get(coluna).push(no);
  });
  porColuna.forEach(nosDaColuna => {
    const ordenados = [...nosDaColuna].sort((a, b) => linhaPorId.get(a.id) - linhaPorId.get(b.id));
    let linhaAnterior = -Infinity;
    ordenados.forEach(no => {
      const linhaFinal = Math.max(linhaPorId.get(no.id), linhaAnterior + 1);
      linhaPorId.set(no.id, linhaFinal);
      linhaAnterior = linhaFinal;
    });
  });

  const posicoes = new Map(
    nos.map(no => [
      no.id,
      {
        x: profundidade.get(no.id) * COLUMN_WIDTH + COLUMN_WIDTH / 2,
        y: linhaPorId.get(no.id) * ROW_HEIGHT + ROW_HEIGHT / 2,
      },
    ]),
  );

  const maiorProfundidade = nos.length === 0 ? 0 : Math.max(...nos.map(no => profundidade.get(no.id)));
  const largura = (maiorProfundidade + 1) * COLUMN_WIDTH;
  const maiorLinha = nos.length === 0 ? 0 : Math.max(...nos.map(no => linhaPorId.get(no.id)));
  const altura = (maiorLinha + 1) * ROW_HEIGHT;

  return { posicoes, largura, altura };
};
