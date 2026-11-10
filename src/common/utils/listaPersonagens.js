import { getNome } from 'common/utils/resolveNome';

// Busca e ordenação da lista "Minhas Fichas" (funções puras).

export const ORDENACOES = [
  { valor: 'nome', rotulo: 'Nome' },
  { valor: 'recente', rotulo: 'Última edição' },
  { valor: 'nivel', rotulo: 'Nível' },
];

export const ORDENACAO_PADRAO = 'nome';

const ordenacaoValida = valor => ORDENACOES.some(item => item.valor === valor);

export const normalizarOrdenacao = valor => (ordenacaoValida(valor) ? valor : ORDENACAO_PADRAO);

// Minúsculas e sem acento: "jose" acha "José", "ÁRIA" acha "Aria".
export const normalizarBusca = texto =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export const filtrarPorNome = (personagens, busca) => {
  const termo = normalizarBusca(busca);
  if (!termo) return personagens;
  return personagens.filter(personagem => normalizarBusca(getNome(personagem)).includes(termo));
};

// Timestamp do Firestore, { seconds }, Date, número ou texto ISO → milissegundos
// (0 quando não há data).
export const milissegundosDe = valor => {
  if (!valor) return 0;
  if (typeof valor.toMillis === 'function') return valor.toMillis();
  if (typeof valor.seconds === 'number') return valor.seconds * 1000;
  if (valor instanceof Date) return valor.getTime();
  const numero = typeof valor === 'number' ? valor : Date.parse(valor);
  return Number.isFinite(numero) ? numero : 0;
};

// `nivel` é { atual, ... } (ficha) ou um número solto (dados antigos).
export const nivelDe = personagem => {
  const bruto = personagem?.nivel;
  const numero = Number(typeof bruto === 'object' && bruto !== null ? bruto.atual : bruto);
  return Number.isFinite(numero) ? numero : 0;
};

const compararNome = (a, b) =>
  getNome(a).localeCompare(getNome(b), 'pt-BR', { sensitivity: 'base', numeric: true });

// Não altera a lista recebida. Empates caem no nome (A–Z).
export const ordenarPersonagens = (personagens, ordenacao = ORDENACAO_PADRAO) => {
  const copia = [...personagens];
  switch (normalizarOrdenacao(ordenacao)) {
    case 'recente':
      return copia.sort(
        (a, b) =>
          milissegundosDe(b.updatedAt) - milissegundosDe(a.updatedAt) || compararNome(a, b),
      );
    case 'nivel':
      return copia.sort((a, b) => nivelDe(b) - nivelDe(a) || compararNome(a, b));
    case 'nome':
    default:
      return copia.sort(compararNome);
  }
};
