// `veiasAstrais` no Firestore é uma coleção FLAT: cada doc é uma veia (nó)
// individual, filtrada por `universo`, sem doc de "constelação" agrupando-as
// — o agrupamento por divindade e a árvore são só computados aqui, no client.
// Campos reais confirmados direto no Firestore: `nome`, `descricao` (frase
// curta de categoria, ex. "Poder básico de Aune"), `custo` (STRING, às vezes
// vazia), `divindade` (id de `divindades`), `requisito` (id da veia-pai,
// string vazia na raiz — não existe `parentId`) e `aprimoramento` (texto
// livre com o efeito completo — não existe `bonusAtributo` estruturado, o
// mesmo padrão de texto solto usado em `habilidade.bonus` das Classes).
export const normalizarVeia = veia => ({
  ...veia,
  custo: Number(veia.custo) || 0,
  parentId: veia.requisito || null,
  divindadeId: veia.divindade || null,
});

// Cor representativa de cada divindade (campo `cor`, hex, ex. "#ff0000" pra
// Arty) — usada no header/glow da árvore e da modal de veia. Fallback só
// cobre divindades sem o campo preenchido (ex. catálogos de teste antigos).
export const corDivindade = divindade => divindade?.cor || '#22d3ee';

// Marca d'água da imagem da divindade atrás da árvore (`ArvoreFundoImagem`
// em styles.js) — ajuste estes dois valores pra deixá-la mais ou menos
// visível. 0 = invisível/preto e branco, 1 = opaca/cor cheia do original.
export const ARVORE_FUNDO_OPACIDADE = 0.07;
export const ARVORE_FUNDO_SATURACAO = 0.2;

export const agruparVeiasPorDivindade = (veias, divindades) => {
  const porDivindade = new Map();
  veias.forEach(veia => {
    if (!porDivindade.has(veia.divindadeId)) {
      porDivindade.set(veia.divindadeId, []);
    }
    porDivindade.get(veia.divindadeId).push(veia);
  });
  return Array.from(porDivindade.entries()).map(([divindadeId, itens]) => ({
    divindadeId,
    divindade: divindades.find(item => item.id === divindadeId) ?? null,
    veias: itens,
  }));
};
