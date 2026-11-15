import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { addChatMensagem, getRmCampanha } from 'service/storage';
import { RolagemFichaContext } from 'context/RolagemFichaContext';
import RolarAptidao from './RolarAptidao';

vi.mock('service/storage', () => ({ addChatMensagem: vi.fn(), getRmCampanha: vi.fn() }));
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'u1' } }),
}));

const renderRolar = (campanhas = ['c1'], props = {}) =>
  render(
    <RolagemFichaContext.Provider
      value={{ personagem: { id: 'p1', nome: 'Aldric', campanhas }, campanhaPreferida: null }}
    >
      <RolarAptidao nome="Furtividade" bonus={3} {...props} />
    </RolagemFichaContext.Provider>,
  );

const abrir = () => fireEvent.click(screen.getByRole('button', { name: 'Rolar Furtividade' }));
const campoMestre = () => screen.getByLabelText('Bônus/obstáculo do mestre');
const botaoRolar = () => screen.getByRole('button', { name: /🎲 Rolar/ });

describe('RolarAptidao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addChatMensagem.mockResolvedValue();
    getRmCampanha.mockImplementation(id => Promise.resolve({ id, nome: `Campanha ${id}` }));
  });

  it('rola 1d6 + bônus sem modificador', async () => {
    renderRolar();
    abrir();
    expect(screen.getByRole('status', { name: 'Prévia da rolagem' })).toHaveTextContent('1d6+3');
    fireEvent.click(botaoRolar());
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    const [campanhaId, mensagem] = addChatMensagem.mock.calls[0];
    expect(campanhaId).toBe('c1');
    expect(mensagem.rotulo).toBe('Aptidão: Furtividade');
    expect(mensagem.rolagem.grupos).toEqual([expect.objectContaining({ quantidade: 1, faces: 6 })]);
    expect(mensagem.rolagem.termos).toEqual([3]);
  });

  it('com sorte e bônus/obstáculo do mestre', async () => {
    renderRolar();
    abrir();
    fireEvent.change(campoMestre(), { target: { value: '1d4-2' } });
    fireEvent.click(screen.getByLabelText('🍀 Usar Sorte (+1d6)'));
    expect(screen.getByRole('status', { name: 'Prévia da rolagem' })).toHaveTextContent(
      '1d6+1d6+3+1d4-2',
    );
    fireEvent.click(botaoRolar());
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    const mensagem = addChatMensagem.mock.calls[0][1];
    expect(mensagem.rotulo).toBe('Aptidão: Furtividade (🍀 Sorte, mestre +1d4-2)');
    expect(mensagem.rolagem.grupos).toHaveLength(3);
    expect(mensagem.rolagem.termos).toEqual([3, -2]);
  });

  it('modificador inválido mostra o erro e desabilita o Rolar', () => {
    renderRolar();
    abrir();
    fireEvent.change(campoMestre(), { target: { value: '+150' } });
    expect(screen.getByText(/Cada número vai até 99/)).toBeTruthy();
    expect(botaoRolar()).toBeDisabled();
  });

  it('zera o modificador e a sorte ao abrir de novo', async () => {
    renderRolar();
    abrir();
    fireEvent.change(campoMestre(), { target: { value: '+2' } });
    fireEvent.click(screen.getByLabelText('🍀 Usar Sorte (+1d6)'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByLabelText('Bônus/obstáculo do mestre')).toBeNull());
    abrir();
    expect(campoMestre()).toHaveValue('');
    expect(screen.getByLabelText('🍀 Usar Sorte (+1d6)')).not.toBeChecked();
  });

  it('fica desabilitado sem campanha', () => {
    renderRolar([]);
    expect(screen.getByRole('button', { name: 'Rolar Furtividade' })).toBeDisabled();
  });

  it('com 2 campanhas pede onde postar antes de liberar o Rolar', async () => {
    renderRolar(['c1', 'c2']);
    abrir();
    expect(botaoRolar()).toBeDisabled();
    fireEvent.mouseDown(await screen.findByLabelText('Postar em:'));
    fireEvent.click(await screen.findByRole('option', { name: 'Campanha c2' }));
    fireEvent.click(botaoRolar());
    await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
    expect(addChatMensagem.mock.calls[0][0]).toBe('c2');
  });
});
