import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { addChatMensagem } from 'service/storage';
import { RolagemFichaContext } from 'context/RolagemFichaContext';
import useRolarDaFicha from './useRolarDaFicha';

vi.mock('service/storage', () => ({ addChatMensagem: vi.fn() }));
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'u1' } }),
}));

const ficha = campanhas => ({
  id: 'p1',
  nome: 'Aldric',
  linkImagem: 'http://img/a.png',
  campanhas,
});

const montar = (personagem, campanhaPreferida = null, opcoes = {}) =>
  renderHook(() => useRolarDaFicha(opcoes), {
    wrapper: ({ children }) => (
      <RolagemFichaContext.Provider value={{ personagem, campanhaPreferida }}>
        {children}
      </RolagemFichaContext.Provider>
    ),
  });

describe('useRolarDaFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    addChatMensagem.mockResolvedValue();
  });

  it('posta na campanha preferida, falando como o personagem, com o rótulo', async () => {
    const { result } = montar(ficha(['c1', 'c2']), 'c2');
    expect(result.current.campanhaId).toBe('c2');
    expect(result.current.precisaEscolher).toBe(false);
    let retorno;
    await act(async () => {
      retorno = await result.current.rolar({ expressao: '2d6+3', rotulo: 'Arte: Golpe' });
    });
    expect(retorno).toBe(true);
    const [campanhaId, mensagem] = addChatMensagem.mock.calls[0];
    expect(campanhaId).toBe('c2');
    expect(mensagem).toMatchObject({
      tipo: 'rolagem',
      uid: 'u1',
      personagemId: 'p1',
      autorNome: 'Aldric',
      rotulo: 'Arte: Golpe',
    });
    expect(mensagem.secreta).toBeUndefined();
    expect(mensagem.rolagem.modificador).toBe(3);
  });

  it('usa a única campanha do personagem', async () => {
    const { result } = montar(ficha(['c1']));
    expect(result.current.campanhaId).toBe('c1');
    await act(async () => {
      await result.current.rolar({ expressao: '1d20' });
    });
    expect(addChatMensagem.mock.calls[0][0]).toBe('c1');
  });

  it('com 2+ campanhas e sem preferida, pede a escolha e usa a campanha passada', async () => {
    const { result } = montar(ficha(['c1', 'c2']));
    expect(result.current.campanhaId).toBeNull();
    expect(result.current.precisaEscolher).toBe(true);

    let retorno;
    await act(async () => {
      retorno = await result.current.rolar({ expressao: '1d20' });
    });
    expect(retorno).toBe(false);
    expect(addChatMensagem).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.rolar({ expressao: '1d20', campanhaId: 'c1' });
    });
    expect(addChatMensagem.mock.calls[0][0]).toBe('c1');

    await act(async () => {
      retorno = await result.current.rolar({ expressao: '1d20', campanhaId: 'outra' });
    });
    expect(retorno).toBe(false);
    expect(addChatMensagem).toHaveBeenCalledTimes(1);
  });

  it('sem campanha não posta', async () => {
    const { result } = montar(ficha([]));
    expect(result.current.semCampanha).toBe(true);
    let retorno;
    await act(async () => {
      retorno = await result.current.rolar({ expressao: '1d20' });
    });
    expect(retorno).toBe(false);
    expect(addChatMensagem).not.toHaveBeenCalled();
  });

  it('devolve { erro } para expressão inválida', async () => {
    const { result } = montar(ficha(['c1']));
    let retorno;
    await act(async () => {
      retorno = await result.current.rolar({ expressao: 'abc' });
    });
    expect(retorno.erro).toBeTruthy();
    expect(addChatMensagem).not.toHaveBeenCalled();
  });

  it('avisa por onErro quando a escrita falha', async () => {
    addChatMensagem.mockRejectedValue(new Error('boom'));
    const onErro = vi.fn();
    const { result } = montar(ficha(['c1']), null, { onErro });
    let retorno;
    await act(async () => {
      retorno = await result.current.rolar({ expressao: '1d6' });
    });
    expect(retorno).toBe(false);
    expect(onErro).toHaveBeenCalledWith('Não foi possível enviar a rolagem.');
  });
});
