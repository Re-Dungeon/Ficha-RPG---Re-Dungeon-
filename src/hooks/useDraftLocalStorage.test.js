import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useDraftLocalStorage } from './useDraftLocalStorage';

const CHAVE = 'rascunho_personagem_p1_atributos';

describe('useDraftLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lerRascunho retorna null quando não há nada salvo', () => {
    const { result } = renderHook(() => useDraftLocalStorage(CHAVE));
    expect(result.current.lerRascunho()).toBeNull();
  });

  it('salvarRascunho grava no localStorage após o debounce, não imediatamente', () => {
    const { result } = renderHook(() => useDraftLocalStorage(CHAVE));

    result.current.salvarRascunho({ nome: 'Aldric' });
    expect(window.localStorage.getItem(CHAVE)).toBeNull();

    vi.advanceTimersByTime(400);

    const salvo = JSON.parse(window.localStorage.getItem(CHAVE));
    expect(salvo.valores).toEqual({ nome: 'Aldric' });
    expect(typeof salvo.salvoEm).toBe('number');
  });

  it('chamadas seguidas de salvarRascunho reiniciam o debounce (só a última vale)', () => {
    const { result } = renderHook(() => useDraftLocalStorage(CHAVE));

    result.current.salvarRascunho({ nome: 'A' });
    vi.advanceTimersByTime(200);
    result.current.salvarRascunho({ nome: 'AB' });
    vi.advanceTimersByTime(200);
    // ainda não passaram 400ms desde a última chamada
    expect(window.localStorage.getItem(CHAVE)).toBeNull();

    vi.advanceTimersByTime(200);
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE));
    expect(salvo.valores).toEqual({ nome: 'AB' });
  });

  it('limparRascunho remove a chave e cancela um debounce pendente', () => {
    const { result } = renderHook(() => useDraftLocalStorage(CHAVE));

    result.current.salvarRascunho({ nome: 'Aldric' });
    result.current.limparRascunho();
    vi.advanceTimersByTime(400);

    expect(window.localStorage.getItem(CHAVE)).toBeNull();
  });
});
