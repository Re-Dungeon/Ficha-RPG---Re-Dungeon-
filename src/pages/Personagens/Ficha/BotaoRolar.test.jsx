import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { addChatMensagem, getRmCampanha } from 'service/storage';
import { RolagemFichaContext } from 'context/RolagemFichaContext';
import BotaoRolar from './BotaoRolar';

vi.mock('service/storage', () => ({ addChatMensagem: vi.fn(), getRmCampanha: vi.fn() }));
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'u1' } }),
}));

const renderBotao = (campanhas, campanhaPreferida = null, props = {}) =>
  render(
    <RolagemFichaContext.Provider
      value={{ personagem: { id: 'p1', nome: 'Aldric', campanhas }, campanhaPreferida }}
    >
      <BotaoRolar dados="2d6+3 de fogo" nome="Bola de Fogo" {...props} />
    </RolagemFichaContext.Provider>,
  );

describe('BotaoRolar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addChatMensagem.mockResolvedValue();
    getRmCampanha.mockImplementation(id => Promise.resolve({ id, nome: `Campanha ${id}` }));
  });

  it('não aparece sem dados rolaveis', () => {
    const { container } = renderBotao(['c1'], null, { dados: 'sem dado' });
    expect(container).toBeEmptyDOMElement();
  });

  it('rola na única campanha e avisa o jogador', async () => {
    renderBotao(['c1']);
    fireEvent.click(screen.getByRole('button', { name: /Rolar 2d6\+3/ }));
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    const [campanhaId, mensagem] = addChatMensagem.mock.calls[0];
    expect(campanhaId).toBe('c1');
    expect(mensagem.rotulo).toBe('Arte: Bola de Fogo');
    expect(await screen.findByText('Rolagem publicada no chat da campanha.')).toBeTruthy();
  });

  it('fica desabilitado sem campanha', () => {
    renderBotao([]);
    expect(screen.getByRole('button', { name: /Rolar 2d6\+3/ })).toBeDisabled();
  });

  it('com 2 campanhas e nenhuma preferida, pergunta onde postar', async () => {
    renderBotao(['c1', 'c2']);
    fireEvent.click(screen.getByRole('button', { name: /Rolar 2d6\+3/ }));
    expect(addChatMensagem).not.toHaveBeenCalled();
    fireEvent.mouseDown(await screen.findByLabelText('Postar em:'));
    fireEvent.click(await screen.findByRole('option', { name: 'Campanha c2' }));
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    expect(addChatMensagem.mock.calls[0][0]).toBe('c2');
  });

  it('usa a campanha preferida sem perguntar', async () => {
    renderBotao(['c1', 'c2'], 'c2');
    fireEvent.click(screen.getByRole('button', { name: /Rolar 2d6\+3/ }));
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    expect(addChatMensagem.mock.calls[0][0]).toBe('c2');
  });

  it('com tipo item, o rótulo da rolagem leva o prefixo "Item"', async () => {
    renderBotao(['c1'], null, { dados: '1d8+2', nome: 'Espada Longa', tipo: 'item' });
    fireEvent.click(screen.getByRole('button', { name: /Rolar 1d8\+2/ }));
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    expect(addChatMensagem.mock.calls[0][1].rotulo).toBe('Item: Espada Longa');
  });

  it('com tipo variante, o rótulo continua "Arte"', async () => {
    renderBotao(['c1'], null, { tipo: 'variante' });
    fireEvent.click(screen.getByRole('button', { name: /Rolar 2d6\+3/ }));
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    expect(addChatMensagem.mock.calls[0][1].rotulo).toBe('Arte: Bola de Fogo');
  });
});
