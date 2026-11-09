import { describe, expect, it } from 'vitest';

import {
  filtrarPorNome,
  milissegundosDe,
  nivelDe,
  normalizarBusca,
  normalizarOrdenacao,
  ordenarPersonagens,
} from './listaPersonagens';

const lista = [
  { id: 'a', nome: 'Zélia', nivel: { atual: 3 }, updatedAt: { seconds: 100 } },
  { id: 'b', nome: 'Aria', nivel: { atual: 10 }, updatedAt: { toMillis: () => 300000 } },
  { id: 'c', nome: 'álvaro', nivel: 3, updatedAt: { seconds: 200 } },
  { id: 'd', Nome: 'Bruno' },
];

describe('normalizarBusca', () => {
  it('tira acento, caixa e espaços das pontas', () => {
    expect(normalizarBusca('  ÁRIA José ')).toBe('aria jose');
    expect(normalizarBusca(null)).toBe('');
  });
});

describe('filtrarPorNome', () => {
  it('acha por parte do nome sem ligar para acento nem caixa', () => {
    expect(filtrarPorNome(lista, 'ALVARO').map(p => p.id)).toEqual(['c']);
    expect(filtrarPorNome(lista, 'zel').map(p => p.id)).toEqual(['a']);
  });

  it('aceita o campo Nome (maiúsculo) e devolve tudo com busca vazia', () => {
    expect(filtrarPorNome(lista, 'bru').map(p => p.id)).toEqual(['d']);
    expect(filtrarPorNome(lista, '   ')).toBe(lista);
  });
});

describe('milissegundosDe / nivelDe', () => {
  it('converte as formas de data e de nível', () => {
    expect(milissegundosDe({ seconds: 2 })).toBe(2000);
    expect(milissegundosDe({ toMillis: () => 5 })).toBe(5);
    expect(milissegundosDe(new Date(7))).toBe(7);
    expect(milissegundosDe(undefined)).toBe(0);
    expect(nivelDe({ nivel: { atual: 4 } })).toBe(4);
    expect(nivelDe({ nivel: 6 })).toBe(6);
    expect(nivelDe({})).toBe(0);
  });
});

describe('ordenarPersonagens', () => {
  it('por nome ignora acento e caixa (A–Z)', () => {
    expect(ordenarPersonagens(lista, 'nome').map(p => p.id)).toEqual(['c', 'b', 'd', 'a']);
  });

  it('por última edição: mais recente primeiro, sem data por último', () => {
    expect(ordenarPersonagens(lista, 'recente').map(p => p.id)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('por nível: maior primeiro, empate pelo nome', () => {
    expect(ordenarPersonagens(lista, 'nivel').map(p => p.id)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('não altera a lista original e cai em Nome para valor desconhecido', () => {
    const original = [...lista];
    ordenarPersonagens(lista, 'recente');
    expect(lista).toEqual(original);
    expect(ordenarPersonagens(lista, 'xyz').map(p => p.id)).toEqual(['c', 'b', 'd', 'a']);
    expect(normalizarOrdenacao('xyz')).toBe('nome');
  });
});
