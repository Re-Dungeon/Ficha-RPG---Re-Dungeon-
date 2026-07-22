// Layout puro (sem dependência de React) de uma árvore/floresta de nós ligados
// por `parentId` — usado pelo ConstelacaoArvoreModal pra posicionar cada nó em
// x/y antes de desenhar os círculos e as linhas de conexão em SVG.
const COLUMN_WIDTH = 150;
const ROW_HEIGHT = 110;

// Profundidade calculada a partir da cadeia real de `parentId` (não do campo
// `camada`, que é só um rótulo do catálogo) — garante que todo filho fique
// estritamente à direita do pai na árvore desenhada.
const calcularProfundidades = (nos, porId) => {
  const profundidade = new Map();
  const resolver = no => {
    if (profundidade.has(no.id)) {
      return profundidade.get(no.id);
    }
    const pai = no.parentId ? porId.get(no.parentId) : null;
    const valor = pai ? resolver(pai) + 1 : 0;
    profundidade.set(no.id, valor);
    return valor;
  };
  nos.forEach(resolver);
  return profundidade;
};

export const calcularLayoutArvore = nos => {
  const porId = new Map(nos.map(no => [no.id, no]));
  const filhosPorPai = new Map();
  nos.forEach(no => {
    const chave = no.parentId && porId.has(no.parentId) ? no.parentId : null;
    if (!filhosPorPai.has(chave)) {
      filhosPorPai.set(chave, []);
    }
    filhosPorPai.get(chave).push(no);
  });

  const profundidade = calcularProfundidades(nos, porId);

  const linhaPorId = new Map();
  let proximaLinha = 0;
  const atribuirLinha = no => {
    if (linhaPorId.has(no.id)) {
      return linhaPorId.get(no.id);
    }
    const filhos = filhosPorPai.get(no.id) ?? [];
    if (filhos.length === 0) {
      const linha = proximaLinha;
      proximaLinha += 1;
      linhaPorId.set(no.id, linha);
      return linha;
    }
    const linhas = filhos.map(atribuirLinha);
    const linha = linhas.reduce((total, valor) => total + valor, 0) / linhas.length;
    linhaPorId.set(no.id, linha);
    return linha;
  };
  (filhosPorPai.get(null) ?? []).forEach(atribuirLinha);

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
  const altura = Math.max(proximaLinha, 1) * ROW_HEIGHT;

  return { posicoes, largura, altura };
};
