import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  getRmCampanha,
  setChatMembro,
  subscribeAudioMesa,
  subscribeChatMensagens,
} from 'service/storage';
import ChatModal from './ChatModal';
import { AudioMesaProvider, useAudioMesaGlobal } from 'context/AudioMesaContext';

vi.mock('components/Chat/PlayerAudioMesa', () => ({
  default: ({ atual, volume, mudo }) => (
    <div data-testid="audio-player" data-volume={volume} data-mudo={String(mudo)}>
      {atual?.videoId ?? 'player'}
    </div>
  ),
}));

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

  it('mantém o player global montado quando o modal fecha', async () => {
    const personagem = { id: 'wesley', nome: 'Wesley Chase', campanhas: ['torre'] };
    const onClose = vi.fn();
    const ativarAudio = () =>
      subscribeAudioMesa.mockImplementation((campanhaId, onChange) => {
        onChange({
          videoId: 'abc123',
          estado: 'tocando',
          posicaoBase: 30,
          referenciaEm: Date.now(),
          repetir: true,
        });
        return vi.fn();
      });

    ativarAudio();

    const renderWithProvider = open =>
      render(
        <MemoryRouter>
          <AudioMesaProvider>
            <ChatModal open={open} onClose={onClose} personagem={personagem} />
          </AudioMesaProvider>
        </MemoryRouter>,
      );

    const { rerender } = renderWithProvider(true);

    expect(await screen.findByText('Na torre.')).toBeInTheDocument();
    expect(screen.getByTestId('audio-player')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AudioMesaProvider>
          <ChatModal open={false} onClose={onClose} personagem={personagem} />
        </AudioMesaProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('audio-player')).toBeInTheDocument();
  });

  it('ignora placeholder de áudio ao reabrir o chat sem nova música', () => {
    const Probe = () => {
      const { audio, registrarAudio } = useAudioMesaGlobal();

      React.useEffect(() => {
        registrarAudio({
          atual: { videoId: 'abc123', estado: 'tocando' },
          player: { atual: { videoId: 'abc123', estado: 'tocando' }, volume: 50, mudo: false },
        });
        registrarAudio({
          atual: null,
          player: { atual: null, volume: 50, mudo: false },
        });
      }, [registrarAudio]);

      return <div data-testid="audio-video">{audio?.atual?.videoId ?? 'none'}</div>;
    };

    render(
      <AudioMesaProvider>
        <Probe />
      </AudioMesaProvider>,
    );

    expect(screen.getByTestId('audio-video')).toHaveTextContent('abc123');
  });

  it('mantém a faixa ativa ao reabrir o chat sem reinicializar a reprodução', () => {
    const Probe = () => {
      const { audio, registrarAudio } = useAudioMesaGlobal();
      const jaRegistrouSegunda = React.useRef(false);

      React.useEffect(() => {
        if (!audio) {
          registrarAudio({
            atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true },
            player: { atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true }, volume: 50, mudo: false },
          });
          return;
        }

        if (!jaRegistrouSegunda.current) {
          jaRegistrouSegunda.current = true;
          registrarAudio({
            atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true },
            player: { atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true }, volume: 50, mudo: false },
          });
        }
      }, [audio, registrarAudio]);

      return <div data-testid="audio-volume">{audio?.player?.volume ?? 'none'}</div>;
    };

    render(
      <AudioMesaProvider>
        <Probe />
      </AudioMesaProvider>,
    );

    expect(screen.getByTestId('audio-volume')).toHaveTextContent('50');
  });

  it('atualiza o player global quando o volume ou mute mudam sem trocar a faixa', () => {
    const Probe = () => {
      const { audio, registrarAudio } = useAudioMesaGlobal();
      const jaRegistrouVolume = React.useRef(false);

      React.useEffect(() => {
        if (!audio) {
          registrarAudio({
            atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true },
            player: { atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true }, volume: 50, mudo: false },
          });
          return;
        }

        if (!jaRegistrouVolume.current) {
          jaRegistrouVolume.current = true;
          registrarAudio({
            atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true },
            player: { atual: { videoId: 'abc123', estado: 'tocando', posicaoBase: 30, referenciaEm: 1000, repetir: true }, volume: 80, mudo: true },
          });
        }
      }, [audio, registrarAudio]);

      return (
        <div>
          <span data-testid="audio-volume">{audio?.player?.volume ?? 'none'}</span>
          <span data-testid="audio-mudo">{audio?.player?.mudo ? 'muted' : 'not-muted'}</span>
        </div>
      );
    };

    render(
      <AudioMesaProvider>
        <Probe />
      </AudioMesaProvider>,
    );

    expect(screen.getByTestId('audio-volume')).toHaveTextContent('80');
    expect(screen.getByTestId('audio-mudo')).toHaveTextContent('muted');
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
