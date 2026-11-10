import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import useTituloDaAba from './useTituloDaAba';

const msgs = (...ids) => ids.map(id => ({ id }));

const definirOculta = oculta => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => oculta });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

describe('useTituloDaAba', () => {
  beforeEach(() => {
    document.title = 'Re-Dungeon';
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  });

  afterEach(() => {
    delete document.hidden;
  });

  it('mantém o título com a aba à vista e nada novo', () => {
    renderHook(props => useTituloDaAba(props), { initialProps: { mensagens: msgs('a') } });
    expect(document.title).toBe('Re-Dungeon');
  });

  it('prefixa (N) com o contador da interface', () => {
    const { rerender } = renderHook(props => useTituloDaAba(props), {
      initialProps: { naoLidas: 3 },
    });
    expect(document.title).toBe('(3) Re-Dungeon');
    rerender({ naoLidas: 0 });
    expect(document.title).toBe('Re-Dungeon');
  });

  it('conta as mensagens que chegam com a aba oculta e zera ao voltar', () => {
    const { rerender } = renderHook(props => useTituloDaAba(props), {
      initialProps: { mensagens: msgs('a', 'b') },
    });
    definirOculta(true);
    expect(document.title).toBe('Re-Dungeon');
    rerender({ mensagens: msgs('a', 'b', 'c', 'd') });
    expect(document.title).toBe('(2) Re-Dungeon');
    definirOculta(false);
    expect(document.title).toBe('Re-Dungeon');
  });

  it('avisa "Seu turno!" só com a aba em segundo plano, até ela ganhar foco', () => {
    const { rerender } = renderHook(props => useTituloDaAba(props), {
      initialProps: { meuTurno: false },
    });
    definirOculta(true);
    rerender({ meuTurno: true });
    expect(document.title).toBe('⚔ Seu turno! — Re-Dungeon');
    definirOculta(false);
    expect(document.title).toBe('Re-Dungeon');
  });

  it('não avisa o turno quando a aba está à vista', () => {
    const { rerender } = renderHook(props => useTituloDaAba(props), {
      initialProps: { meuTurno: false },
    });
    rerender({ meuTurno: true });
    expect(document.title).toBe('Re-Dungeon');
  });

  it('o aviso de turno cai quando a vez passa', () => {
    const { rerender } = renderHook(props => useTituloDaAba(props), {
      initialProps: { meuTurno: false },
    });
    definirOculta(true);
    rerender({ meuTurno: true });
    rerender({ meuTurno: false });
    expect(document.title).toBe('Re-Dungeon');
  });

  it('restaura o título original ao desmontar', () => {
    const { unmount } = renderHook(() => useTituloDaAba({ naoLidas: 5 }));
    expect(document.title).toBe('(5) Re-Dungeon');
    unmount();
    expect(document.title).toBe('Re-Dungeon');
  });
});
