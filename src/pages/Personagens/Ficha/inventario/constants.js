export const QUALIDADE_OPTIONS = ['Comum', 'Raro', 'Épico', 'Lendário', 'Mítico', 'Celestial'];

// Cor por qualidade do item — portada de InventarioItemModal.css (--color-quality-*)
// do site vanilla original, pra manter a mesma paleta visual dos badges/bordas.
export const QUALIDADE_META = {
  Comum: { cor: '#9a9a9a' },
  Raro: { cor: '#2ecc71' },
  Épico: { cor: '#9b59b6' },
  Lendário: { cor: '#f39c12' },
  Mítico: { cor: '#e74c3c' },
  Celestial: { cor: '#3498db' },
};

// Emoji por tipo de item — mesma ideia de InventarioUI.obterEmojiTipo() do site
// vanilla, adaptada pra checagem por substring (os tipos vêm do catálogo `itens`
// como texto livre, ex.: "Armas", "Poções").
const TIPO_EMOJI_MAP = [
  [['arma'], '⚔️'],
  [['armadura', 'escudo'], '🛡️'],
  [['poção', 'pocao', 'consumível', 'consumivel'], '🧪'],
  [['livro', 'grimório', 'grimorio'], '📖'],
  [['ouro'], '🪙'],
  [['joia', 'jóia'], '💎'],
  [['mapa'], '🗺️'],
  [['chave'], '🔑'],
  [['amuleto'], '✨'],
];

export const obterEmojiTipo = tipo => {
  const tipoLower = (tipo ?? '').toLowerCase();
  const encontrado = TIPO_EMOJI_MAP.find(([chaves]) => chaves.some(chave => tipoLower.includes(chave)));
  return encontrado ? encontrado[1] : '📦';
};

// Rótulos exibidos nos cards/diálogos de item. O 2º elemento é o nome real do
// campo no doc (confirmado inspecionando um doc real do catálogo `itens`) ou
// uma função quando o valor exibido combina mais de um campo — "Nível" junta
// `nivelAtual`/`nivelMaximo`, já que o catálogo guarda os dois separados.
export const ITEM_STAT_CAMPOS = [
  ['Tipo', 'tipo'],
  ['Nível', item => (item.nivelMaximo ? `${item.nivelAtual ?? '?'} / ${item.nivelMaximo}` : (item.nivelAtual ?? ''))],
  ['Roll', 'dados'],
  ['Extra', 'extra'],
];

export const obterValorStatItem = (item, campo) => (typeof campo === 'function' ? campo(item) : item[campo]);

// Campos do item de catálogo copiados pro doc do personagem ao "escolher" —
// usado tanto por CriarItemDialog (aba Catálogo) quanto pela Loja Rokmas
// (compra), já que as duas leem a mesma coleção `itens` por universo.
export const CAMPOS_ITEM_CATALOGO = [
  'qualidade',
  'tipo',
  'dados',
  'nivelAtual',
  'nivelMaximo',
  'extra',
  'pesoUnitario',
  'bonusEspaco',
  'linkImagem',
  'descricao',
  'habilidadesEspeciais',
];

export const extrairCamposItem = item =>
  Object.fromEntries(
    CAMPOS_ITEM_CATALOGO.filter(campo => item[campo] !== undefined).map(campo => [campo, item[campo]]),
  );

// Valores default do formulário de item autoral (`ItemFormDialog`/`CriarItemDialog`)
// — mirror de `ART_AUTORAL_INICIAL` em `arts/constants.js`. Usa os mesmos nomes
// de campo do catálogo `itens` (cópia direta ao "escolher do catálogo").
export const ITEM_AUTORAL_INICIAL = {
  nome: '',
  qualidade: QUALIDADE_OPTIONS[0],
  tipo: '',
  dados: '',
  nivelAtual: 1,
  nivelMaximo: '',
  extra: '',
  pesoUnitario: 0,
  bonusEspaco: 0,
  linkImagem: '',
  descricao: '',
  habilidadesEspeciais: [],
  quantidade: 1,
};

// Opções de raridade usadas por `materiais`/`receitas` — mesma lista de
// palavras de QUALIDADE_OPTIONS, mas concordância feminina ("raridade"),
// confirmada consultando docs reais das duas coleções no Firestore.
export const RARIDADE_OPTIONS = ['Comum', 'Rara', 'Épica', 'Lendária', 'Mítica', 'Celestial'];

// Rótulos exibidos nos cards/diálogos de material. Nomes de campo confirmados
// inspecionando docs reais do catálogo `materiais` (nada em comum com os
// campos de `itens` — não portar suposições entre as duas coleções).
export const MATERIAL_STAT_CAMPOS = [
  ['Tipo', 'tipo'],
  ['Pureza', material => (material.pureza != null ? `${material.pureza}%` : '')],
  ['Taxa de Drop', material => (material.taxaDrop != null ? `${material.taxaDrop}%` : '')],
  ['Valor de Mercado', 'valorMercado'],
];

export const CAMPOS_MATERIAL_CATALOGO = [
  'tipo',
  'raridade',
  'pureza',
  'taxaDrop',
  'quantidadeBase',
  'valorMercado',
  'linkImagem',
  'descricao',
  'propriedades',
];

export const extrairCamposMaterial = material =>
  Object.fromEntries(
    CAMPOS_MATERIAL_CATALOGO.filter(campo => material[campo] !== undefined).map(campo => [campo, material[campo]]),
  );

export const MATERIAL_AUTORAL_INICIAL = {
  nome: '',
  tipo: '',
  raridade: RARIDADE_OPTIONS[0],
  pureza: '',
  taxaDrop: '',
  valorMercado: '',
  linkImagem: '',
  descricao: '',
  propriedades: '',
  quantidade: 1,
};

// Rótulos exibidos nos cards/diálogos de receita. Nomes de campo confirmados
// inspecionando docs reais do catálogo `receitas` — `materiais` (lista de
// ingredientes) sempre veio vazia nos docs reais consultados, então só é
// exibida (somente leitura) no diálogo de visualização quando presente.
export const RECEITA_STAT_CAMPOS = [
  ['Categoria', 'categoria'],
  ['Valor de Compra', 'valorCompra'],
  ['Valor de Venda', 'valorVenda'],
];

export const CAMPOS_RECEITA_CATALOGO = [
  'categoria',
  'raridade',
  'valorCompra',
  'valorVenda',
  'linkImagem',
  'descricao',
  'materiais',
];

export const extrairCamposReceita = receita =>
  Object.fromEntries(
    CAMPOS_RECEITA_CATALOGO.filter(campo => receita[campo] !== undefined).map(campo => [campo, receita[campo]]),
  );

export const RECEITA_AUTORAL_INICIAL = {
  nome: '',
  categoria: '',
  raridade: RARIDADE_OPTIONS[0],
  valorCompra: '',
  valorVenda: '',
  linkImagem: '',
  descricao: '',
  materiais: [],
  quantidade: 1,
};
