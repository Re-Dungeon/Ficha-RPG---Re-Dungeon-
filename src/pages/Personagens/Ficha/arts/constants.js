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

export const ART_AUTORAL_INICIAL = {
  nome: '',
  tipo: TIPO_ART_OPTIONS[0],
  dominio: 1,
  recarga: '',
  duracao: '',
  alcance: '',
  alvos: '',
  custo: '',
  dano: '',
  tipoAcao: TIPO_ACAO_OPTIONS[0],
  descricao: '',
};
