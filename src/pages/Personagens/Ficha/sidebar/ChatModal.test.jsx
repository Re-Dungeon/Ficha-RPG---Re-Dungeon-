import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  getRmCampanha,
  setChatMembro,
  subscribeChatMensagens,
} from 'service/storage';
import ChatModal from './ChatModal';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({
  addChatMensagem: vi.fn(),
  getRmCampanha: vi.fn(),
  removeChatMensagem: vi.fn(),
  setChatMembro: vi.fn(),
  subscribeChatMensagens: vi.fn(),
  addChatRolagemSecreta: vi.fn(),
  removeChatRolagemSecreta: vi.fn(),
  subscribeChatSecretasDoMestre: vi.fn(() => vi.fn()),
  subscribeChatSecretasDoUsuario: vi.fn(() => vi.fn()),
  getChatMacros: vi.fn(() => Promise.resolve([])),
  addChatMacro: vi.fn(),
  updateChatMacro: vi.fn(),
  removeChatMacro: vi.fn(),
  subscribeAudioMesa: vi.fn(() => vi.fn()),
  setAudioMesa: vi.fn(),
}));

const CAMPANHAS = {
  torre: { id: 'torre', nome: 'A Torre', mestreId: 'uid-mestre' },
  abismo: { id: 'abismo', nome: 'O Abismo', mestreId: 'uid-mestre' },
};

const MENSAGENS_POR_CAMPANHA = {
  torre: [{ id: 'm1', uid: 'uid-mestre', autorNome: 'Mestre', isMestre: true, tipo: 'texto', texto: 'Na torre.' }],
  abismo: [{ id: 'm2', uid: 'uid-mestre', autorNome: 'Mestre', isMestre: true, tipo: 'texto', texto: 'No abismo.' }],
};

const renderModal = personagem =>
  render(
    <MemoryRouter>
      <ChatModal open onClose={vi.fn()} personagem={personagem} />
    </MemoryRouter>,
  );

describe('ChatModal (menu Social da ficha)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-jogador' } });
    getRmCampanha.mockImplementation(id => Promise.resolve(CAMPANHAS[id] ?? null));
    setChatMembro.mockResolvedValue();
    addChatMensagem.mockResolvedValue();
    subscribeChatMensagens.mockImplementation((campanhaId, onChange) => {
      onChange(MENSAGENS_POR_CAMPANHA[campanhaId]);
      return vi.fn();
    });
  });

  it('abre o chat da campanha do personagem falando como ele', async () => {
    renderModal({ id: 'wesley', nome: 'Wesley Chase', campanhas: ['torre'] });

    expect(await screen.findByText('Na torre.')).toBeInTheDocument();
    expect(setChatMembro).toHaveBeenCalledWith('torre', 'uid-jogador', 'wesley');
    expect(screen.getByText(/falando como/i)).toHaveTextContent('Wesley Chase');

    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Subo a escada.' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    await waitFor(() =>
      expect(addChatMensagem).toHaveBeenCalledWith(
        'torre',
        expect.objectContaining({
          uid: 'uid-jogador',
          personagemId: 'wesley',
          autorNome: 'Wesley Chase',
          persona: 'jogador',
          texto: 'Subo a escada.',
        }),
      ),
    );
  });

  it('com mais de uma campanha, permite trocar a sala', async () => {
    renderModal({ id: 'wesley', nome: 'Wesley Chase', campanhas: ['torre', 'abismo'] });
    await screen.findByText('Na torre.');

    fireEvent.mouseDown(screen.getByLabelText(/^campanha$/i));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('O Abismo'));

    expect(await screen.findByText('No abismo.')).toBeInTheDocument();
    expect(setChatMembro).toHaveBeenCalledWith('abismo', 'uid-jogador', 'wesley');
  });

  it('personagem sem campanha mostra como vincular', async () => {
    renderModal({ id: 'solo', nome: 'Solitário', campanhas: [] });

    expect(await screen.findByText(/não está em nenhuma campanha/i)).toBeInTheDocument();
    expect(subscribeChatMensagens).not.toHaveBeenCalled();
  });

  it('NPC não entra no chat', async () => {
    renderModal({ id: 'npc', nome: 'Taverneiro', tipo: 'NPC', campanhas: ['torre'] });

    expect(await screen.findByText(/só personagens jogáveis/i)).toBeInTheDocument();
    expect(setChatMembro).not.toHaveBeenCalled();
  });
});
