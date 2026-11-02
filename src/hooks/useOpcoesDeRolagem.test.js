import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { getArts, getCombosAtaque, getCombosDefesa } from 'service/storage';
import useOpcoesDeRolagem, { expressaoDoCombo } from './useOpcoesDeRolagem';

vi.mock('service/storage', () => ({
  getArts: vi.fn(),
  getCombosAtaque: vi.fn(),
  getCombosDefesa: vi.fn(),
}));

describe('expressaoDoCombo', () => {
  it('usa o perfilDano salvo e cai para o potencial em combos antigos', () => {
    expect(expressaoDoCombo({ perfilDano: ' 3d8+12 ' })).toBe('3d8+12');
    const recalculada = expressaoDoCombo({ potencialFinal: 20, tipoDano: 'Contundente' });
    expect(recalculada).toMatch(/d\d+/);
    expect(expressaoDoCombo({})).toBeNull();
  });
});

describe('useOpcoesDeRolagem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCombosAtaque.mockResolvedValue([
      { id: 'a1', nome: 'Golpe Duplo', perfilDano: '3d8+12' },
      { id: 'a2', nome: 'Fixo', perfilDano: '12' },
      { id: 'a3', nome: 'Enorme', perfilDano: '101d6' },
    ]);
    getCombosDefesa.mockResolvedValue([
      { id: 'd1', nome: 'Esquiva', perfilDano: '1d10+2' },
    ]);
    getArts.mockResolvedValue([
      { id: 'r1', nome: 'Bola de Fogo', dados: '2d6+3 de fogo' },
      { id: 'r2', nome: 'Sem dados', dados: 'nenhum' },
    ]);
  });

  it('inativo não lê nada', () => {
    const { result } = renderHook(() => useOpcoesDeRolagem('p1', { ativo: false }));
    expect(result.current).toEqual({ carregando: false, grupos: [] });
    expect(getCombosAtaque).not.toHaveBeenCalled();
  });

  it('carrega uma vez ao abrir e monta os grupos', async () => {
    const { result } = renderHook(() => useOpcoesDeRolagem('p1', { ativo: true }));
    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    const [ataque, defesa, arte] = result.current.grupos;
    expect(ataque.id).toBe('ataque');
    expect(ataque.itens[0]).toMatchObject({
      id: 'a1',
      rotulo: 'Golpe Duplo',
      rotuloChat: 'Ataque: Golpe Duplo',
      expressao: '3d8+12',
      desabilitado: false,
    });
    expect(ataque.itens[1]).toMatchObject({ desabilitado: true });
    expect(ataque.itens[1].motivo).toEqual(expect.any(String));
    expect(ataque.itens[2].desabilitado).toBe(true);
    expect(defesa.itens[0].rotuloChat).toBe('Defesa: Esquiva');
    expect(arte.itens).toHaveLength(1);
    expect(arte.itens[0]).toMatchObject({
      rotuloChat: 'Arte: Bola de Fogo',
      expressao: '2d6+3',
    });
    expect(getCombosAtaque).toHaveBeenCalledTimes(1);
  });

  it('falha de leitura não derruba: grupos vazios', async () => {
    getCombosAtaque.mockRejectedValue(new Error('x'));
    getCombosDefesa.mockRejectedValue(new Error('x'));
    getArts.mockRejectedValue(new Error('x'));
    const { result } = renderHook(() => useOpcoesDeRolagem('p1', { ativo: true }));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.grupos).toEqual([]);
  });
});
