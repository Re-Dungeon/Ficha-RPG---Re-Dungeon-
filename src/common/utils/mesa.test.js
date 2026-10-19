import { describe, expect, it } from 'vitest';

import { contarNaoLidas, idDaUltimaMensagem } from './mesa';

const msgs = ids => ids.map(id => ({ id }));

describe('idDaUltimaMensagem', () => {
  it('retorna o id da última ou null', () => {
    expect(idDaUltimaMensagem(msgs(['a', 'b']))).toBe('b');
    expect(idDaUltimaMensagem([])).toBeNull();
  });
});

describe('contarNaoLidas', () => {
  it('sem marcador ainda, não conta nada', () => {
    expect(contarNaoLidas(msgs(['a', 'b']), undefined)).toBe(0);
  });

  it('conta as mensagens depois da última vista', () => {
    expect(contarNaoLidas(msgs(['a', 'b', 'c']), 'a')).toBe(2);
    expect(contarNaoLidas(msgs(['a', 'b', 'c']), 'c')).toBe(0);
  });

  it('lista vazia quando marcou: todas são novas', () => {
    expect(contarNaoLidas(msgs(['a']), null)).toBe(1);
  });

  it('última vista saiu da janela carregada: conta todas', () => {
    expect(contarNaoLidas(msgs(['x', 'y']), 'a')).toBe(2);
  });
});
