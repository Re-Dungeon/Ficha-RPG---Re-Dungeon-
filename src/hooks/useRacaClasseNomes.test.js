import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { getCatalogoItem } from 'service/storage';
import { useRacaClasseNomes } from './useRacaClasseNomes';

vi.mock('service/storage', () => ({
  getCatalogoItem: vi.fn(),
}));

describe('useRacaClasseNomes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCatalogoItem.mockImplementation(async (colecao, id) => ({
      id,
      Nome: `${colecao}-${id}`,
      linkImagem: `img-${id}`,
    }));
  });

  it('lê raça e classes pelo catálogo em cache e devolve os nomes', async () => {
    const { result } = renderHook(() =>
      useRacaClasseNomes({ raca: 'r1', classes: ['c1', 'c2'] }),
    );

    await waitFor(() => expect(result.current.classesNomes).toHaveLength(2));
    expect(result.current.racaLinkImagem).toBe('img-r1');
    expect(getCatalogoItem).toHaveBeenCalledWith('racas', 'r1');
    expect(getCatalogoItem).toHaveBeenCalledWith('classes', 'c1');
    expect(getCatalogoItem).toHaveBeenCalledWith('classes', 'c2');
  });

  it('não relê quando chega um array novo com as mesmas classes (snapshot ao vivo)', async () => {
    const { result, rerender } = renderHook(({ personagem }) => useRacaClasseNomes(personagem), {
      initialProps: { personagem: { raca: 'r1', classes: ['c1', 'c2'] } },
    });
    await waitFor(() => expect(result.current.classesNomes).toHaveLength(2));
    const chamadas = getCatalogoItem.mock.calls.length;

    rerender({ personagem: { raca: 'r1', classes: ['c1', 'c2'], status: { hp: { atual: 3 } } } });

    expect(getCatalogoItem).toHaveBeenCalledTimes(chamadas);
  });

  it('relê quando a lista de classes muda de fato', async () => {
    const { result, rerender } = renderHook(({ personagem }) => useRacaClasseNomes(personagem), {
      initialProps: { personagem: { raca: 'r1', classes: ['c1'] } },
    });
    await waitFor(() => expect(result.current.classesNomes).toHaveLength(1));

    rerender({ personagem: { raca: 'r1', classes: ['c1', 'c3'] } });

    await waitFor(() => expect(result.current.classesNomes).toHaveLength(2));
    expect(getCatalogoItem).toHaveBeenCalledWith('classes', 'c3');
  });
});
