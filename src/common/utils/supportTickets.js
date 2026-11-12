// Contrato compartilhado da coleção `supportTickets` entre o Banco de Dados e
// a Ficha de Jogador (mesmo projeto Firebase). Mantenha este arquivo idêntico
// nos dois repositórios e alinhado com `firestore.rules` (Banco de Dados).
//
// `category` é sempre gravada como um destes ids estáveis; o texto em
// português existe só na interface. Tickets antigos podem ter o rótulo
// ('Bug', 'Sugestão', ...) gravado — `normalizeSupportTicketCategory`
// converte esses valores para o id correspondente.

export const SUPPORT_TICKET_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'bug', label: 'Bug' }),
  Object.freeze({ id: 'suggestion', label: 'Sugestão' }),
  Object.freeze({ id: 'question', label: 'Dúvida' }),
  Object.freeze({ id: 'system-problem', label: 'Problema' }),
  Object.freeze({ id: 'other', label: 'Outro' }),
]);

export const SUPPORT_TICKET_CATEGORY_IDS = Object.freeze(
  SUPPORT_TICKET_CATEGORIES.map(category => category.id),
);

export const DEFAULT_SUPPORT_TICKET_CATEGORY = 'bug';

const CATEGORY_ALIASES = Object.freeze({
  bug: 'bug',
  suggestion: 'suggestion',
  sugestao: 'suggestion',
  question: 'question',
  duvida: 'question',
  'system-problem': 'system-problem',
  system_problem: 'system-problem',
  problem: 'system-problem',
  problema: 'system-problem',
  other: 'other',
  outro: 'other',
});

const removerAcentos = texto => texto.normalize('NFD').replace(/\p{M}/gu, '');

export const normalizeSupportTicketCategory = value => {
  const normalized = removerAcentos(String(value ?? ''))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  return CATEGORY_ALIASES[normalized] || 'other';
};

export const getSupportTicketCategoryLabel = value => {
  const id = normalizeSupportTicketCategory(value);
  return SUPPORT_TICKET_CATEGORIES.find(category => category.id === id).label;
};
