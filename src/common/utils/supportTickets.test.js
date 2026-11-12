import { describe, expect, it } from 'vitest';

import {
  SUPPORT_TICKET_CATEGORY_IDS,
  getSupportTicketCategoryLabel,
  normalizeSupportTicketCategory,
} from './supportTickets';

describe('supportTickets', () => {
  it('expõe os ids aceitos pelas regras do Firestore', () => {
    expect(SUPPORT_TICKET_CATEGORY_IDS).toEqual([
      'bug',
      'suggestion',
      'question',
      'system-problem',
      'other',
    ]);
  });

  it('mantém os ids já padronizados', () => {
    SUPPORT_TICKET_CATEGORY_IDS.forEach(id => {
      expect(normalizeSupportTicketCategory(id)).toBe(id);
    });
  });

  it('converte os rótulos antigos gravados pela Ficha', () => {
    expect(normalizeSupportTicketCategory('Bug')).toBe('bug');
    expect(normalizeSupportTicketCategory('Sugestão')).toBe('suggestion');
    expect(normalizeSupportTicketCategory('Dúvida')).toBe('question');
    expect(normalizeSupportTicketCategory('Problema')).toBe('system-problem');
    expect(normalizeSupportTicketCategory('Outro')).toBe('other');
  });

  it('aceita variações de caixa, espaço e separador', () => {
    expect(normalizeSupportTicketCategory('  SUGESTAO ')).toBe('suggestion');
    expect(normalizeSupportTicketCategory('system_problem')).toBe('system-problem');
    expect(normalizeSupportTicketCategory('System Problem')).toBe('system-problem');
  });

  it('cai em "other" para valores desconhecidos ou vazios', () => {
    expect(normalizeSupportTicketCategory('qualquer')).toBe('other');
    expect(normalizeSupportTicketCategory('')).toBe('other');
    expect(normalizeSupportTicketCategory(null)).toBe('other');
    expect(normalizeSupportTicketCategory(undefined)).toBe('other');
  });

  it('devolve o rótulo em português para ids e valores antigos', () => {
    expect(getSupportTicketCategoryLabel('question')).toBe('Dúvida');
    expect(getSupportTicketCategoryLabel('Dúvida')).toBe('Dúvida');
    expect(getSupportTicketCategoryLabel('system-problem')).toBe('Problema');
    expect(getSupportTicketCategoryLabel(undefined)).toBe('Outro');
  });
});
