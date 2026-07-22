import { describe, expect, it } from 'vitest';
import { getNome, resolveNome } from './resolveNome';

const colecao = [
  { id: 'r1', Nome: "Re'Geron" },
  { id: 'r2', Nome: 'The Chaotical Gate' },
  { id: 'r3', nome: 'Nome em minúsculo' },
];

describe('resolveNome', () => {
  it('retorna o campo Nome do item cujo id corresponde', () => {
    expect(resolveNome(colecao, 'r2')).toBe('The Chaotical Gate');
  });

  it('retorna o campo nome (minúsculo) quando Nome não existe', () => {
    expect(resolveNome(colecao, 'r3')).toBe('Nome em minúsculo');
  });

  it('retorna string vazia quando o id não é informado', () => {
    expect(resolveNome(colecao, undefined)).toBe('');
    expect(resolveNome(colecao, '')).toBe('');
  });

  it('retorna string vazia quando o id não é encontrado na coleção', () => {
    expect(resolveNome(colecao, 'inexistente')).toBe('');
  });
});

describe('getNome', () => {
  it('prioriza Nome sobre nome quando ambos existem', () => {
    expect(getNome({ Nome: 'Maiusculo', nome: 'minusculo' })).toBe('Maiusculo');
  });

  it('usa nome (minúsculo) quando Nome não existe', () => {
    expect(getNome({ nome: 'minusculo' })).toBe('minusculo');
  });

  it('retorna string vazia para item nulo/indefinido', () => {
    expect(getNome(null)).toBe('');
    expect(getNome(undefined)).toBe('');
  });
});
