import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  addChatRolagemSecreta,
  getPersonagens,
  getRmCampanha,
  setChatMembro,
  subscribeChatMensagens,
  subscribeChatSecretasDoUsuario,
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
  addChatRolagemSecreta: vi.fn(),
  removeChatRolagemSecreta: vi.fn(),
  subscribeChatSecretasDoMestre: vi.fn(() => vi.fn()),
  subscribeChatSecretasDoUsuario: vi.fn(() => vi.fn()),
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

  describe('rolagem de dados', () => {
    const enviarComando = comando => {
      fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: comando } });
      fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    };

    it('/r 1d6+5-3 rola em vez de mandar texto', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');

      enviarComando('/r 1d6+5-3');

      await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
      const [campanhaId, mensagem] = addChatMensagem.mock.calls[0];
      expect(campanhaId).toBe('camp-1');
      expect(mensagem).toMatchObject({
        tipo: 'rolagem',
        texto: '',
        autorNome: 'Aldric',
        persona: 'jogador',
        rolagem: { termos: [5, -3], modificador: 2 },
      });
      const [grupo] = mensagem.rolagem.grupos;
      expect(grupo).toMatchObject({ quantidade: 1, faces: 6 });
      expect(grupo.resultados[0]).toBeGreaterThanOrEqual(1);
      expect(grupo.resultados[0]).toBeLessThanOrEqual(6);
      expect(mensagem.rolagem.total).toBe(grupo.resultados[0] + 2);
      expect(mensagem).not.toHaveProperty('secreta');
      await waitFor(() => expect(screen.getByLabelText('Mensagem')).toHaveValue(''));
    });

    it('/rs grava a rolagem na pasta secreta do próprio jogador', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');

      enviarComando('/rs 2d20+1d4');

      await waitFor(() =>
        expect(addChatRolagemSecreta).toHaveBeenCalledWith(
          'camp-1',
          'uid-jogador',
          expect.objectContaining({ tipo: 'rolagem', secreta: true }),
        ),
      );
      expect(addChatMensagem).not.toHaveBeenCalled();
      expect(addChatRolagemSecreta.mock.calls[0][2].rolagem.grupos.map(g => g.faces)).toEqual([20, 4]);
    });

    it('comando inválido não é enviado e mostra o erro', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');

      enviarComando('/r 1d7');

      expect(await screen.findByText(/dados permitidos/i)).toBeInTheDocument();
      expect(addChatMensagem).not.toHaveBeenCalled();
      expect(screen.getByLabelText('Mensagem')).toHaveValue('/r 1d7');
    });

    it('modal: escolhe d6, define bônus e rola', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');

      fireEvent.click(screen.getByRole('button', { name: /rolar dados/i }));
      fireEvent.click(await screen.findByRole('button', { name: 'd6' }));
      fireEvent.change(screen.getByLabelText('Bônus'), { target: { value: '8' } });
      fireEvent.click(screen.getByRole('button', { name: /^rolar$/i }));

      await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(1));
      expect(addChatMensagem.mock.calls[0][1].rolagem).toMatchObject({
        grupos: [{ quantidade: 1, faces: 6 }],
        termos: [8],
        modificador: 8,
      });
    });

    it('modal: mistura dados e marca como secreta', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');

      fireEvent.click(screen.getByRole('button', { name: /rolar dados/i }));
      fireEvent.click(await screen.findByRole('button', { name: 'd20' }));
      fireEvent.change(screen.getByLabelText('Quantidade de d20'), { target: { value: '2' } });
      fireEvent.click(screen.getByRole('button', { name: /adicionar outro dado/i }));
      fireEvent.click(await screen.findByRole('button', { name: 'd4' }));
      fireEvent.change(screen.getByLabelText('Obstáculo'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('switch', { name: /rolagem secreta/i }));
      fireEvent.click(screen.getByRole('button', { name: /^rolar$/i }));

      await waitFor(() => expect(addChatRolagemSecreta).toHaveBeenCalledTimes(1));
      expect(addChatRolagemSecreta.mock.calls[0][2].rolagem).toMatchObject({
        grupos: [
          { quantidade: 2, faces: 20 },
          { quantidade: 1, faces: 4 },
        ],
        termos: [-1],
      });
    });

    it('exibe a rolagem no formato "rolou 1d6 + 8 = 14 {[6] + 8}" e as secretas do jogador', async () => {
      const rolagem = {
        id: 'r1',
        uid: 'uid-outro',
        autorNome: 'Wesley Chase',
        isMestre: false,
        persona: 'jogador',
        tipo: 'rolagem',
        texto: '',
        url: null,
        rolagem: { grupos: [{ quantidade: 1, faces: 6, resultados: [6] }], termos: [8], modificador: 8, total: 14 },
        createdAt: new Date(),
      };
      subscribeChatMensagens.mockImplementation((_id, onChange) => {
        onChange([...MENSAGENS, rolagem]);
        return vi.fn();
      });
      subscribeChatSecretasDoUsuario.mockImplementation((_id, _uid, onChange) => {
        onChange([{ ...rolagem, id: 's1', uid: 'uid-jogador', autorNome: 'Aldric', secreta: true, donoUid: 'uid-jogador' }]);
        return vi.fn();
      });
      renderChat();

      const linhas = await screen.findAllByText('rolou');
      const publica = linhas[0].closest('[data-testid="chat-mensagem"]');
      expect(publica).toHaveTextContent('Wesley Chase rolou 1d6 + 8 = 14 {[6] + 8}');
      const secreta = within(screen.getByRole('log')).getByText('secreta').closest('[data-testid="chat-mensagem"]');
      expect(secreta).toHaveTextContent('Aldric');
      expect(subscribeChatSecretasDoUsuario).toHaveBeenCalledWith('camp-1', 'uid-jogador', expect.any(Function), expect.any(Function));
    });
  });
});
