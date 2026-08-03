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
  const profundidade = calcularProfundidades(nos, porId);

  // `profundidade(filho)` é sempre estritamente maior que a de QUALQUER pai
  // seu (é `max(profundidade dos pais) + 1`), então processar as colunas da
  // mais profunda pra mais rasa garante que, ao chegar num nó, todos os seus
  // filhos (que moram em colunas mais profundas) já têm linha definitiva —
  // isso permite centralizar cada pai na média dos filhos JÁ REALOCADOS (após
  // resolver colisões), em vez de só na posição "ideal" pré-colisão. Um nó com
  // 2+ pais (requisito duplo) aparece na lista de filhos de cada um deles, o
  // que é justamente o que permite pais distintos convergirem no mesmo filho
  // sem perder a centralização.
  const filhosPorPai = new Map();
  nos.forEach(no => {
    (no.parentIds ?? []).forEach(paiId => {
      if (!porId.has(paiId)) {
        return;
      }
      if (!filhosPorPai.has(paiId)) {
        filhosPorPai.set(paiId, []);
      }
      filhosPorPai.get(paiId).push(no);
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
  const colunasDecrescentes = [...colunas.keys()].sort((a, b) => b - a);

  const linhaPorId = new Map();
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

    // Resolve colisões dentro da própria coluna (ex. dois pais que convergem
    // pro mesmo filho e por isso calculariam a mesma linha "ideal"),
    // preservando a ordem relativa das linhas calculadas acima.
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
