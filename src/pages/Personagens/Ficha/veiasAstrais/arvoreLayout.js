// Layout puro (sem dependência de React) de um grafo acíclico de nós ligados
// por `parentIds` (um nó pode exigir 2+ veias-pai) — usado pelo
// ConstelacaoArvoreModal pra posicionar cada nó em x/y antes de desenhar os
// círculos e as linhas de conexão em SVG.
const COLUMN_WIDTH = 150;
const ROW_HEIGHT = 110;

// Profundidade (coluna) determinada primariamente por `nivel` do catálogo
// (coluna = nivel - 1, então dois nós de mesmo nivel sempre caem na mesma
// coluna, e um nó nivel 3 sem nenhum `parentIds` ainda vai pra 3ª coluna) —
// mas nunca antes de qualquer um de seus pais: se o catálogo tiver um nó cujo
// nivel é MENOR que o de algum pré-requisito seu (dado real observado: uma
// veia nivel 3 exigindo 2 veias nivel 4), a cadeia de `parentIds` vence e o
// nó é empurrado pra estritamente à direita do pai mais profundo, evitando
// uma seta desenhada "voltando" pra esquerda.
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
    const pisoPorNivel = (no.nivel ?? 1) - 1;
    const pisoPorPais = pais.length === 0 ? 0 : Math.max(...pais.map(resolver)) + 1;
    const valor = Math.max(pisoPorNivel, pisoPorPais);
    visitando.delete(no.id);
    profundidade.set(no.id, valor);
    return valor;
  };
  nos.forEach(resolver);
  return profundidade;
};

// Resolve colisões dentro de UMA coluna (nós que acabariam com linhas iguais
// ou próximas demais), empurrando pra a próxima linha livre e preservando a
// ordem relativa das linhas "ideais" já atribuídas em `linhaPorId`.
const resolverColisoesNaColuna = (nosDaColuna, linhaPorId) => {
  const ordenados = [...nosDaColuna].sort((a, b) => linhaPorId.get(a.id) - linhaPorId.get(b.id));
  let linhaAnterior = -Infinity;
  ordenados.forEach(no => {
    const linhaFinal = Math.max(linhaPorId.get(no.id), linhaAnterior + 1);
    linhaPorId.set(no.id, linhaFinal);
    linhaAnterior = linhaFinal;
  });
};

export const calcularLayoutArvore = nos => {
  const porId = new Map(nos.map(no => [no.id, no]));
  const profundidade = calcularProfundidades(nos, porId);

  const filhosPorPai = new Map();
  const paisPorFilho = new Map();
  nos.forEach(no => {
    const pais = (no.parentIds ?? []).map(id => porId.get(id)).filter(Boolean);
    paisPorFilho.set(no.id, pais);
    pais.forEach(pai => {
      if (!filhosPorPai.has(pai.id)) {
        filhosPorPai.set(pai.id, []);
      }
      filhosPorPai.get(pai.id).push(no);
    });
  });

  const colunas = new Map();
  nos.forEach(no => {
    const coluna = profundidade.get(no.id);
    if (!colunas.has(coluna)) {
      colunas.set(coluna, []);
    }
    colunas.get(coluna).push(no);
  });
  const colunasCrescentes = [...colunas.keys()].sort((a, b) => a - b);
  const colunasDecrescentes = [...colunas.keys()].sort((a, b) => b - a);

  const linhaPorId = new Map();

  // FASE 1 (direita pra esquerda): `profundidade(filho)` é sempre
  // estritamente maior que a de QUALQUER pai seu, então processar as colunas
  // da mais profunda pra mais rasa garante que, ao chegar num nó, todos os
  // seus filhos já têm linha definitiva — isso centraliza um nó de
  // ramificação (2+ filhos, ex. a raiz) na média deles.
  let proximaLinhaLivre = 0;
  colunasDecrescentes.forEach(coluna => {
    const nosDaColuna = colunas.get(coluna);
    nosDaColuna.forEach(no => {
      // Só considera filhos que já têm linha definitiva — um `parentIds`
      // formando ciclo (dado de catálogo malformado) pode apontar pra um nó
      // na mesma coluna ou numa coluna ainda não processada; nesse caso trata
      // como se não tivesse filho, em vez de centralizar num valor ausente.
      const filhos = (filhosPorPai.get(no.id) ?? []).filter(filho => linhaPorId.has(filho.id));
      if (filhos.length === 0) {
        linhaPorId.set(no.id, proximaLinhaLivre);
        proximaLinhaLivre += 1;
      } else {
        const soma = filhos.reduce((total, filho) => total + linhaPorId.get(filho.id), 0);
        linhaPorId.set(no.id, soma / filhos.length);
      }
    });
    resolverColisoesNaColuna(nosDaColuna, linhaPorId);
  });

  // FASE 2 (esquerda pra direita): um nó com 2+ pais (requisito duplo) deve
  // ficar centralizado entre ESSES pais, não na posição herdada dos seus
  // próprios filhos calculada na fase 1 — sobrescreve a linha dele pela média
  // das linhas dos pais (já definitivas: pais moram em colunas mais rasas,
  // processadas antes nesta mesma fase). Nós com 0 ou 1 pai mantêm a linha da
  // fase 1 (raiz continua centralizada nos filhos; cadeia simples só herda).
  colunasCrescentes.forEach(coluna => {
    const nosDaColuna = colunas.get(coluna);
    nosDaColuna.forEach(no => {
      const pais = (paisPorFilho.get(no.id) ?? []).filter(pai => linhaPorId.has(pai.id));
      if (pais.length >= 2) {
        const soma = pais.reduce((total, pai) => total + linhaPorId.get(pai.id), 0);
        linhaPorId.set(no.id, soma / pais.length);
      }
    });
    resolverColisoesNaColuna(nosDaColuna, linhaPorId);
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
