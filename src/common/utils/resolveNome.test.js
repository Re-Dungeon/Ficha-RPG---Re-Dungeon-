import { describe, expect, it } from 'vitest';
import { resolveNome } from './resolveNome';

const colecao = [
  { id: 'r1', Nome: "Re'Geron" },
  { id: 'r2', Nome: 'The Chaotical Gate' },
];

describe('resolveNome', () => {
  it('retorna o campo Nome do item cujo id corresponde', () => {
    expect(resolveNome(colecao, 'r2')).toBe('The Chaotical Gate');
  });

  it('retorna string vazia quando o id não é informado', () => {
    expect(resolveNome(colecao, undefined)).toBe('');
    expect(resolveNome(colecao, '')).toBe('');
  });

  it('retorna string vazia quando o id não é encontrado na coleção', () => {
    expect(resolveNome(colecao, 'inexistente')).toBe('');
  });
});
