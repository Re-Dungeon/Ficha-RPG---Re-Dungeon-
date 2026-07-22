export const TIPO_ART_OPTIONS = [
  'Ofensiva',
  'Defensiva',
  'Estratégica',
  'Suporte',
  'Controle',
  'Invocação',
  'Transformação',
  'Passiva',
  'Racial',
];

export const TIPO_ACAO_OPTIONS = ['Imediata', 'Duradoura', 'Sustentada'];

export const DOMINIO_LABELS = {
  1: 'Básico',
  2: 'Menor',
  3: 'Intermediário',
  4: 'Maior',
  5: 'Supremo',
};

// Ícone + cor por tipo de Art/Núcleo/Variante — portado de RulesEngine.ART_TYPES
// do site vanilla original, pra manter a mesma paleta visual dos badges.
export const TIPO_ART_META = {
  Ofensiva: { icone: '⚔️', cor: '#FF6B6B' },
  Defensiva: { icone: '🛡️', cor: '#4ECDC4' },
  Estratégica: { icone: '🧠', cor: '#FFD93D' },
  Suporte: { icone: '💚', cor: '#95E1D3' },
  Controle: { icone: '🎮', cor: '#A78BFA' },
  Invocação: { icone: '👥', cor: '#8B5CF6' },
  Transformação: { icone: '🔄', cor: '#EC4899' },
  Passiva: { icone: '⭐', cor: '#6B7280' },
  Racial: { icone: '🏰', cor: '#D4AF37' },
};

export const TIPO_ACAO_META = {
  Imediata: { icone: '⚡' },
  Duradoura: { icone: '⏳' },
  Sustentada: { icone: '♾️' },
};

// Campos exibidos no StatGrid de um card de Art — compartilhado entre ArtCard
// (ficha) e ArtCatalogoCard (diálogo de criação, aba Catálogo).
export const ART_STAT_CAMPOS = [
  ['Recarga', 'recarga'],
  ['Ação', 'tipoAcao'],
  ['Duração', 'duracao'],
  ['Alcance', 'alcance'],
  ['Alvos', 'alvos'],
  ['Custo', 'custo'],
  ['Dados', 'dados'],
];

export const ART_AUTORAL_INICIAL = {
  nucleoId: '',
  nome: '',
  tipo: TIPO_ART_OPTIONS[0],
  dominio: 1,
  recarga: '',
  duracao: '',
  alcance: '',
  alvos: '',
  custo: '',
  dados: '',
  tipoAcao: TIPO_ACAO_OPTIONS[0],
  imagem: '',
  cantico: '',
  circuloMagico: '',
  condicoesAplicadas: [],
  descricao: '',
};

export const NUCLEO_INICIAL = {
  nome: '',
  tipo: TIPO_ART_OPTIONS[0],
  bonus: '',
  descricao: '',
  imagem: '',
};

export const VARIANTE_INICIAL = {
  artId: '',
  nome: '',
  tipo: TIPO_ART_OPTIONS[0],
  tipoAcao: TIPO_ACAO_OPTIONS[0],
  dominio: 1,
  recarga: '',
  duracao: '',
  alcance: '',
  alvos: '',
  custo: '',
  dados: '',
  imagem: '',
  cantico: '',
  circuloMagico: '',
  condicoesAplicadas: [],
  descricao: '',
};
