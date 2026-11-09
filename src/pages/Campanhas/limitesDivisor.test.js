import { afterEach, describe, expect, it, vi } from 'vitest';

import { gravarTamanho, lerTamanhoSalvo, limitarTamanhoChat } from './limitesDivisor';

describe('limitarTamanhoChat', () => {
  it('horizontal: chat entre 280px e 70% (deixando 360px de mapa)', () => {
    expect(limitarTamanhoChat(500, 1200, 'horizontal')).toEqual({ min: 280, max: 828, valor: 500 });
    expect(limitarTamanhoChat(100, 1200, 'horizontal').valor).toBe(280);
    expect(limitarTamanhoChat(5000, 1200, 'horizontal').valor).toBe(828);
    // Corpo estreito: o mapa (360 + divisão) limita antes dos 70%.
    expect(limitarTamanhoChat(5000, 800, 'horizontal').max).toBe(428);
  });

  it('nunca deixa o máximo abaixo do mínimo', () => {
    expect(limitarTamanhoChat(500, 400, 'horizontal')).toEqual({ min: 280, max: 280, valor: 280 });
  });

  it('vertical: chat entre 200px e 70% da altura (deixando 240px de mapa)', () => {
    expect(limitarTamanhoChat(1000, 700, 'vertical')).toEqual({ min: 200, max: 448, valor: 448 });
  });
});

describe('lerTamanhoSalvo / gravarTamanho', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('grava, lê e remove', () => {
    gravarTamanho('k', 432.4);
    expect(lerTamanhoSalvo('k')).toBe(432);
    gravarTamanho('k', null);
    expect(lerTamanhoSalvo('k')).toBeNull();
  });

  it('valor inválido vira null', () => {
    window.localStorage.setItem('k', 'abc');
    expect(lerTamanhoSalvo('k')).toBeNull();
    window.localStorage.setItem('k', '-5');
    expect(lerTamanhoSalvo('k')).toBeNull();
  });

  it('localStorage lançando erro não quebra', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(() => gravarTamanho('k', 300)).not.toThrow();
    expect(lerTamanhoSalvo('k')).toBeNull();
  });
});
