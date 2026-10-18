import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  getPersonagens,
  getRmCampanha,
  setChatMembro,
  subscribeChatMensagens,
} from 'service/storage';
import CampanhaChat from './CampanhaChat';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({
  addChatMensagem: vi.fn(),
  getPersonagens: vi.fn(),
  getRmCampanha: vi.fn(),
  removeChatMensagem: vi.fn(),
  setChatMembro: vi.fn(),
  subscribeChatMensagens: vi.fn(),
}));

const LayoutFake = () => <Outlet context={{ setHeaderExtra: vi.fn() }} />;

const renderChat = (state = null) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/campanhas/camp-1/chat', state }]}>
      <Routes>
        <Route element={<LayoutFake />}>
          <Route path="/campanhas/:id/chat" element={<CampanhaChat />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const MENSAGENS = [
  {
    id: 'm1',
    uid: 'uid-mestre',
    autorNome: 'Mestre',
    isMestre: true,
    tipo: 'texto',
    texto: 'Bem-vindos à taverna.',
    url: null,
    createdAt: new Date(),
  },
  {
    id: 'm2',
    uid: 'uid-outro',
    autorNome: 'Brina',
    isMestre: false,
    tipo: 'imagem',
    texto: '',
    url: 'https://media.giphy.com/media/abc/giphy.gif',
    createdAt: new Date(),
  },
  {
    id: 'm3',
    uid: 'uid-mestre',
    autorNome: 'Bartolomeu',
    isMestre: true,
    persona: 'npc',
    tipo: 'texto',
    texto: 'O que vai ser, forasteiro?',
    url: null,
    createdAt: new Date(),
  },
];

describe('CampanhaChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-jogador' } });
    getRmCampanha.mockResolvedValue({ id: 'camp-1', nome: 'A Torre', mestreId: 'uid-mestre' });
    getPersonagens.mockResolvedValue([
      { id: 'p-1', nome: 'Aldric', linkImagem: 'https://ex.com/a.png', campanhas: ['camp-1'] },
      { id: 'p-2', nome: 'Outro', campanhas: ['camp-9'] },
    ]);
    setChatMembro.mockResolvedValue();
    addChatMensagem.mockResolvedValue();
    subscribeChatMensagens.mockImplementation((_campanhaId, onChange) => {
      onChange(MENSAGENS);
      return vi.fn();
    });
  });

  it('registra o membro com o personagem da campanha e mostra texto e imagem renderizada', async () => {
    renderChat();

    expect(await screen.findByText('Bem-vindos à taverna.')).toBeInTheDocument();
    expect(setChatMembro).toHaveBeenCalledWith('camp-1', 'uid-jogador', 'p-1');
    expect(screen.getByText(/falando como/i)).toHaveTextContent('Aldric');

    const imagem = screen.getByAltText('Imagem enviada por Brina');
    expect(imagem).toHaveAttribute('src', 'https://media.giphy.com/media/abc/giphy.gif');
    expect(screen.queryByText('https://media.giphy.com/media/abc/giphy.gif')).not.toBeInTheDocument();
  });

  it('mostra a etiqueta NPC quando o mestre fala como um NPC da mesa', async () => {
    renderChat();

    const mensagemNpc = (await screen.findByText('O que vai ser, forasteiro?')).closest(
      '[data-testid="chat-mensagem"]',
    );
    expect(mensagemNpc).toHaveTextContent('Bartolomeu');
    expect(mensagemNpc).toHaveTextContent('NPC');
  });

  it('envia mensagem de texto assinada pelo personagem', async () => {
    renderChat();
    await screen.findByText('Bem-vindos à taverna.');

    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: '  Peço uma cerveja  ' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

    await waitFor(() =>
      expect(addChatMensagem).toHaveBeenCalledWith('camp-1', {
        uid: 'uid-jogador',
        personagemId: 'p-1',
        autorNome: 'Aldric',
        autorAvatar: 'https://ex.com/a.png',
        isMestre: false,
        persona: 'jogador',
        tipo: 'texto',
        texto: 'Peço uma cerveja',
        url: null,
      }),
    );
  });

  it('envia imagem pelo diálogo e bloqueia link de página', async () => {
    renderChat();
    await screen.findByText('Bem-vindos à taverna.');

    fireEvent.click(screen.getByRole('button', { name: /enviar imagem/i }));
    const campoUrl = await screen.findByLabelText(/url da imagem/i);
    const botaoEnviar = screen.getByRole('button', { name: /^enviar$/i });

    fireEvent.change(campoUrl, { target: { value: 'https://tenor.com/view/gato-123' } });
    expect(botaoEnviar).toBeDisabled();

    fireEvent.change(campoUrl, { target: { value: 'https://ex.com/mapa.gif' } });
    fireEvent.click(botaoEnviar);

    await waitFor(() =>
      expect(addChatMensagem).toHaveBeenCalledWith(
        'camp-1',
        expect.objectContaining({ tipo: 'imagem', url: 'https://ex.com/mapa.gif', personagemId: 'p-1' }),
      ),
    );
  });

  it('vindo da ficha, já fala como o personagem dela', async () => {
    getPersonagens.mockResolvedValue([
      { id: 'p-1', nome: 'Aldric', campanhas: ['camp-1'] },
      { id: 'p-3', nome: 'Wesley Chase', campanhas: ['camp-1'] },
    ]);
    renderChat({ personagemId: 'p-3' });

    await screen.findByText('Bem-vindos à taverna.');
    expect(setChatMembro).toHaveBeenCalledWith('camp-1', 'uid-jogador', 'p-3');
    expect(screen.getByLabelText(/falando como/i)).toHaveTextContent('Wesley Chase');
  });

  it('nega acesso a quem não tem personagem na campanha', async () => {
    getPersonagens.mockResolvedValue([{ id: 'p-2', nome: 'Outro', campanhas: ['camp-9'] }]);
    renderChat();

    expect(await screen.findByText(/não tem um personagem nesta campanha/i)).toBeInTheDocument();
    expect(setChatMembro).not.toHaveBeenCalled();
    expect(subscribeChatMensagens).not.toHaveBeenCalled();
  });
});
