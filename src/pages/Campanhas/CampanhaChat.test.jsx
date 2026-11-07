import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useParams } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  addChatRolagemSecreta,
  addGridArea,
  alterarGridCombate,
  getCondicoesPorUniverso,
  getPersonagens,
  getArts,
  getChatMacros,
  getCombosAtaque,
  getRmCampanha,
  moverGridToken,
  setGridPing,
  setAudioMesa,
  subscribeAudioMesa,
  setChatMembro,
  subscribeGridCena,
  subscribeGridCenaAtiva,
  subscribeGridCombate,
  subscribeGridPings,
  subscribeGridTokens,
  subscribeChatMensagens,
  subscribeChatSecretasDoUsuario,
  subscribePersonagem,
  atualizarRecursoAtualPersonagem,
  updatePersonagem,
} from 'service/storage';
import { executarMacro as rodarMacroNoWorker } from 'common/lua/executarMacro';
import useIsMobile from 'hooks/useIsMobile';
import CampanhaChat from './CampanhaChat';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('hooks/useIsMobile', () => ({ default: vi.fn(() => false) }));
// Sem Web Worker no jsdom: a execução Lua é simulada (o runtime real tem
// testes próprios em common/lua/luaRuntime.test.js).
vi.mock('common/lua/executarMacro', () => {
  class MacroCancelada extends Error {}
  return { executarMacro: vi.fn(), MacroCancelada };
});
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
  getChatMacros: vi.fn(() => Promise.resolve([])),
  addChatMacro: vi.fn(),
  updateChatMacro: vi.fn(),
  removeChatMacro: vi.fn(),
  subscribeAudioMesa: vi.fn(),
  setAudioMesa: vi.fn(),
  subscribeGridCenaAtiva: vi.fn(),
  subscribeGridCena: vi.fn(),
  subscribeGridTokens: vi.fn(),
  moverGridToken: vi.fn(),
  getCondicoesPorUniverso: vi.fn(() => Promise.resolve([])),
  subscribeGridPings: vi.fn(() => vi.fn()),
  setGridPing: vi.fn(() => Promise.resolve()),
  subscribePersonagem: vi.fn(() => vi.fn()),
  atualizarRecursoAtualPersonagem: vi.fn(() => Promise.resolve()),
  subscribeGridCombate: vi.fn(() => vi.fn()),
  alterarGridCombate: vi.fn(),
  subscribeGridCamadas: vi.fn(() => () => {}),
  subscribeGridMarcadores: vi.fn(() => () => {}),
  subscribeGridDesenhos: vi.fn(() => () => {}),
  setGridCamada: vi.fn(() => Promise.resolve()),
  addGridMarcador: vi.fn(() => Promise.resolve()),
  updateGridMarcador: vi.fn(() => Promise.resolve()),
  removeGridMarcador: vi.fn(() => Promise.resolve()),
  addGridDesenho: vi.fn(() => Promise.resolve()),
  removeGridDesenhos: vi.fn(() => Promise.resolve()),
  getArts: vi.fn(() => Promise.resolve([])),
  getCombosAtaque: vi.fn(() => Promise.resolve([])),
  getCombosDefesa: vi.fn(() => Promise.resolve([])),
  subscribeGridAreas: vi.fn(() => () => {}),
  addGridArea: vi.fn(() => Promise.resolve()),
  updateGridArea: vi.fn(() => Promise.resolve()),
  removeGridArea: vi.fn(() => Promise.resolve()),
  removeGridAreas: vi.fn(() => Promise.resolve()),
  updatePersonagem: vi.fn(),
  normalizarPersonagemCarregado: vi.fn(personagem => personagem),
}));

// O jsdom não tem PointerEvent (o grid lê pointerType/altKey dos eventos).
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventDeTeste extends MouseEvent {
    constructor(tipo, init = {}) {
      super(tipo, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }
  window.PointerEvent = PointerEventDeTeste;
}

const LayoutFake = ({ setHeaderExtra = vi.fn() } = {}) => <Outlet context={{ setHeaderExtra }} />;

const FichaTeste = () => {
  const { id } = useParams();
  return <div>Ficha do personagem {id}</div>;
};

const renderChat = (state = null, pathname = '/campanhas/camp-1/chat') =>
  render(
    <MemoryRouter initialEntries={[{ pathname, state }]}>
      <Routes>
        <Route element={<LayoutFake />}>
          <Route path="/campanhas/:id/chat" element={<CampanhaChat />} />
          <Route path="/campanhas/:id/lateral" element={<CampanhaChat visao="lateral" />} />
          <Route path="/campanhas/:id/grid" element={<CampanhaChat visao="grid" />} />
          <Route path="/personagens/:id" element={<FichaTeste />} />
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
    useIsMobile.mockReturnValue(false);
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-jogador' } });
    getRmCampanha.mockResolvedValue({
      id: 'camp-1',
      nome: 'A Torre',
      mestreId: 'uid-mestre',
    });
    getPersonagens.mockResolvedValue([
      {
        id: 'p-1',
        nome: 'Aldric',
        linkImagem: 'https://ex.com/a.png',
        campanhas: ['camp-1'],
      },
      { id: 'p-2', nome: 'Outro', campanhas: ['camp-9'] },
    ]);
    setChatMembro.mockResolvedValue();
    subscribeAudioMesa.mockImplementation((_campanhaId, onChange) => {
      onChange(null);
      return vi.fn();
    });
    setAudioMesa.mockResolvedValue();
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
    expect(
      screen.queryByText('https://media.giphy.com/media/abc/giphy.gif'),
    ).not.toBeInTheDocument();
  });

  it('abre o lightbox somente ao clicar na imagem da mensagem do chat', async () => {
    renderChat();

    const imagem = await screen.findByAltText('Imagem enviada por Brina');
    fireEvent.click(imagem);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Imagem enviada por Brina' })).toBeInTheDocument();
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

    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: '  Peço uma cerveja  ' },
    });
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
        expect.objectContaining({
          tipo: 'imagem',
          url: 'https://ex.com/mapa.gif',
          personagemId: 'p-1',
        }),
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

  it('volta diretamente para a ficha do personagem que originou o chat', async () => {
    const setHeaderExtra = vi.fn();
    const LayoutVoltarFake = () => <Outlet context={{ setHeaderExtra }} />;

    render(
      <MemoryRouter initialEntries={[{ pathname: '/campanhas/camp-1/chat', state: { personagemId: 'p-3' } }]}>
        <Routes>
          <Route element={<LayoutVoltarFake />}>
            <Route path="/campanhas/:id/chat" element={<CampanhaChat />} />
            <Route path="/personagens/:id" element={<FichaTeste />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('Bem-vindos à taverna.');
    expect(setHeaderExtra).toHaveBeenCalled();

    const callbackVoltar = setHeaderExtra.mock.calls.at(-1)[0].onVoltar;
    act(() => {
      callbackVoltar();
    });

    expect(await screen.findByText('Ficha do personagem p-3')).toBeInTheDocument();
  });

  it('nega acesso a quem não tem personagem na campanha', async () => {
    getPersonagens.mockResolvedValue([
      { id: 'p-2', nome: 'Outro', campanhas: ['camp-9'] },
    ]);
    renderChat();

    expect(
      await screen.findByText(/não tem um personagem nesta campanha/i),
    ).toBeInTheDocument();
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
      expect(
        addChatRolagemSecreta.mock.calls[0][2].rolagem.grupos.map(g => g.faces),
      ).toEqual([20, 4]);
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
      fireEvent.change(screen.getByLabelText('Quantidade de d20'), {
        target: { value: '2' },
      });
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
        rolagem: {
          grupos: [{ quantidade: 1, faces: 6, resultados: [6] }],
          termos: [8],
          modificador: 8,
          total: 14,
        },
        createdAt: new Date(),
      };
      subscribeChatMensagens.mockImplementation((_id, onChange) => {
        onChange([...MENSAGENS, rolagem]);
        return vi.fn();
      });
      subscribeChatSecretasDoUsuario.mockImplementation((_id, _uid, onChange) => {
        onChange([
          {
            ...rolagem,
            id: 's1',
            uid: 'uid-jogador',
            autorNome: 'Aldric',
            secreta: true,
            donoUid: 'uid-jogador',
          },
        ]);
        return vi.fn();
      });
      renderChat();

      const linhas = await screen.findAllByText('rolou');
      const publica = linhas[0].closest('[data-testid="chat-mensagem"]');
      expect(publica).toHaveTextContent('Wesley Chase rolou 1d6 + 8 = 14 {[6] + 8}');
      const secreta = within(screen.getByRole('log'))
        .getByText('secreta')
        .closest('[data-testid="chat-mensagem"]');
      expect(secreta).toHaveTextContent('Aldric');
      expect(subscribeChatSecretasDoUsuario).toHaveBeenCalledWith(
        'camp-1',
        'uid-jogador',
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe('macros', () => {
    const MACRO = {
      id: 'mc1',
      nome: 'dano_impacto',
      descricao: '',
      codigo: 'enviar(1)',
      somenteMestre: false,
      ordem: 1,
    };

    beforeEach(() => {
      getChatMacros.mockResolvedValue([MACRO]);
    });

    it('jogador busca só macros públicas, responde a pergunta e o resultado é publicado', async () => {
      rodarMacroNoWorker.mockImplementation(async (_codigo, { perguntar }) => {
        const nome = await perguntar({
          tipo: 'input',
          pergunta: 'Nome do personagem:',
          padrao: '',
        });
        return [
          { tipo: 'texto', texto: `DANO DE IMPACTO - ${nome}` },
          {
            tipo: 'rolagem',
            rolagem: {
              grupos: [{ quantidade: 1, faces: 6, resultados: [4] }],
              termos: [],
              modificador: 0,
              total: 4,
            },
          },
        ];
      });
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      await waitFor(() =>
        expect(getChatMacros).toHaveBeenCalledWith('camp-1', {
          incluirSomenteMestre: false,
        }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Macros' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Usar dano_impacto' }));
      fireEvent.change(await screen.findByLabelText('Nome do personagem:'), {
        target: { value: 'Wesley' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'OK' }));

      await waitFor(() => expect(addChatMensagem).toHaveBeenCalledTimes(2));
      expect(addChatMensagem.mock.calls[0][1]).toMatchObject({
        tipo: 'macro',
        macroNome: 'dano_impacto',
        texto: 'DANO DE IMPACTO - Wesley',
        autorNome: 'Aldric',
      });
      expect(addChatMensagem.mock.calls[1][1]).toMatchObject({
        tipo: 'rolagem',
        rolagem: { total: 4 },
      });
    });

    it('cancelar a macro não publica nada', async () => {
      rodarMacroNoWorker.mockImplementation(async (_codigo, { perguntar }) => {
        await perguntar({ tipo: 'input', pergunta: 'VIT:', padrao: '0' });
        return [{ tipo: 'texto', texto: 'nunca' }];
      });
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      fireEvent.change(screen.getByLabelText('Mensagem'), {
        target: { value: '/m dano_impacto' },
      });
      await waitFor(() => expect(getChatMacros).toHaveBeenCalled());
      fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));

      fireEvent.click(await screen.findByRole('button', { name: /cancelar macro/i }));
      await waitFor(() =>
        expect(screen.queryByLabelText('VIT:')).not.toBeInTheDocument(),
      );
      expect(addChatMensagem).not.toHaveBeenCalled();
    });

    it('erro na macro aparece para o jogador e nada é publicado', async () => {
      rodarMacroNoWorker.mockRejectedValue(
        new Error('macro:12: attempt to index a nil value'),
      );
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      fireEvent.click(screen.getByRole('button', { name: 'Macros' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Usar dano_impacto' }));

      expect(
        await screen.findByText(
          'A macro "dano_impacto" falhou: macro:12: attempt to index a nil value',
        ),
      ).toBeInTheDocument();
      expect(addChatMensagem).not.toHaveBeenCalled();
    });
  });

  describe('música da mesa', () => {
    const VIDEO = 'dQw4w9WgXcQ';

    it('jogador vê o que toca e ajusta só o volume (sem controles do mestre)', async () => {
      subscribeAudioMesa.mockImplementation((_campanhaId, onChange) => {
        onChange({
          videoId: VIDEO,
          estado: 'tocando',
          posicaoBase: 0,
          repetir: true,
          referenciaEm: Date.now(),
        });
        return vi.fn();
      });
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      expect(subscribeAudioMesa).toHaveBeenCalledWith(
        'camp-1',
        expect.any(Function),
        expect.any(Function),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Música da mesa' }));
      const dialogo = await screen.findByRole('dialog');
      expect(within(dialogo).getByRole('status')).toHaveTextContent(
        'Carregando o título',
      );
      expect(
        within(dialogo).getByRole('slider', { name: 'Volume da música' }),
      ).toBeInTheDocument();
      expect(within(dialogo).queryByLabelText('Link do YouTube')).not.toBeInTheDocument();

      fireEvent.click(within(dialogo).getByRole('button', { name: 'Silenciar' }));
      expect(
        within(dialogo).getByRole('button', { name: 'Ativar som' }),
      ).toBeInTheDocument();
    });

    it('mestre toca um link, recusa link inválido e para a música', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'uid-mestre' } });
      getPersonagens.mockResolvedValue([]);
      renderChat();
      fireEvent.click(await screen.findByRole('button', { name: 'Música da mesa' }));
      const dialogo = await screen.findByRole('dialog');
      expect(within(dialogo).getByRole('status')).toHaveTextContent(
        'Nenhuma música tocando.',
      );

      const campo = within(dialogo).getByLabelText('Link do YouTube');
      fireEvent.change(campo, { target: { value: 'https://vimeo.com/123' } });
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Tocar' }));
      expect(
        await within(dialogo).findByText(/Cole um link de vídeo do YouTube/),
      ).toBeInTheDocument();
      expect(setAudioMesa).not.toHaveBeenCalled();

      fireEvent.change(campo, { target: { value: `https://youtu.be/${VIDEO}?t=30` } });
      fireEvent.click(within(dialogo).getByRole('switch'));
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Tocar' }));
      await waitFor(() =>
        expect(setAudioMesa).toHaveBeenCalledWith('camp-1', {
          videoId: VIDEO,
          estado: 'tocando',
          posicaoBase: 30,
          repetir: false,
        }),
      );
    });

    it('mestre pausa e para o que está tocando', async () => {
      useAuth.mockReturnValue({ currentUser: { uid: 'uid-mestre' } });
      getPersonagens.mockResolvedValue([]);
      subscribeAudioMesa.mockImplementation((_campanhaId, onChange) => {
        onChange({
          videoId: VIDEO,
          estado: 'tocando',
          posicaoBase: 10,
          repetir: true,
          referenciaEm: Date.now(),
        });
        return vi.fn();
      });
      renderChat();
      fireEvent.click(await screen.findByRole('button', { name: 'Música da mesa' }));
      const dialogo = await screen.findByRole('dialog');

      fireEvent.click(within(dialogo).getByRole('button', { name: 'Pausar' }));
      await waitFor(() =>
        expect(setAudioMesa).toHaveBeenCalledWith(
          'camp-1',
          expect.objectContaining({ videoId: VIDEO, estado: 'pausado', repetir: true }),
        ),
      );
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Parar' }));
      await waitFor(() =>
        expect(setAudioMesa).toHaveBeenLastCalledWith('camp-1', {
          videoId: null,
          estado: 'parado',
          posicaoBase: 0,
          repetir: true,
        }),
      );
    });
  });

  describe('grid', () => {
    const CONFIG = {
      imagemUrl: null,
      celula: 40,
      deslocamentoX: 0,
      deslocamentoY: 0,
      mostrarGrade: true,
      corGrade: '#ffffff',
      opacidadeGrade: 0.3,
    };
    const CENAS = {
      'cena-1': { ...CONFIG, nome: 'Taverna' },
      'cena-2': { ...CONFIG, nome: 'Masmorra' },
    };
    const TOKENS_POR_CENA = {
      'cena-1': [
        {
          id: 't1',
          nome: 'Aldric',
          tipo: 'jogador',
          col: 1,
          lin: 1,
          tamanho: 1,
          donos: ['uid-jogador'],
          oculto: false,
        },
        {
          id: 't2',
          nome: 'Ogro',
          tipo: 'criatura',
          col: 4,
          lin: 1,
          tamanho: 2,
          donos: [],
          oculto: false,
        },
      ],
      'cena-2': [
        {
          id: 't9',
          nome: 'Esqueleto',
          tipo: 'criatura',
          col: 0,
          lin: 0,
          tamanho: 1,
          donos: [],
          oculto: false,
        },
      ],
    };
    let mudarCenaAtiva;
    let emitirTokens;

    beforeEach(() => {
      subscribeGridCenaAtiva.mockImplementation((_campanhaId, onChange) => {
        mudarCenaAtiva = onChange;
        onChange('cena-1');
        return vi.fn();
      });
      subscribeGridCena.mockImplementation((_campanhaId, cenaId, onChange) => {
        onChange(CENAS[cenaId] ? { id: cenaId, ...CENAS[cenaId] } : null);
        return vi.fn();
      });
      subscribeGridTokens.mockImplementation((_campanhaId, cenaId, _opcoes, onChange) => {
        emitirTokens = onChange;
        onChange(TOKENS_POR_CENA[cenaId] ?? []);
        return vi.fn();
      });
      moverGridToken.mockResolvedValue();
    });

    const [ALDRIC, OGRO] = TOKENS_POR_CENA['cena-1'];
    const horario = segundos => ({ seconds: segundos, nanoseconds: 0 });

    it('mostra o botão Desenhar no mapa e liga a paleta (jogador sem Apagar todos)', async () => {
      renderChat(null, '/campanhas/camp-1/grid');
      await screen.findByRole('button', { name: /Aldric, coluna/ });

      const botao = screen.getByRole('button', { name: 'Desenhar' });
      expect(botao).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(botao);
      expect(botao).toHaveAttribute('aria-pressed', 'true');
      expect(
        screen.getByRole('button', { name: 'Apagar meus desenhos' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Apagar todos' }),
      ).not.toBeInTheDocument();
    });

    it('rastro de um movimento ao vivo aparece com a distância e some em 10 s', async () => {
      renderChat(null, '/campanhas/camp-1/grid');
      await screen.findByRole('button', { name: /Aldric, coluna/ });

      // Timers falsos só depois da carga (findBy usa timers de verdade).
      vi.useFakeTimers();
      try {
        act(() =>
          emitirTokens([
            ALDRIC,
            {
              ...OGRO,
              col: 7,
              movidoEm: horario(5),
              rastro: [
                { col: 4, lin: 1 },
                { col: 7, lin: 1 },
              ],
            },
          ]),
        );
        expect(screen.getByText('3 q · 4,5 m')).toBeInTheDocument();

        act(() => vi.advanceTimersByTime(10000));
        expect(screen.queryByText('3 q · 4,5 m')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('movimento antigo (já na carga inicial) não mostra rastro', async () => {
      subscribeGridTokens.mockImplementation((_campanhaId, _cena, _opcoes, onChange) => {
        onChange([
          {
            ...ALDRIC,
            movidoEm: horario(1),
            rastro: [
              { col: 1, lin: 4 },
              { col: 1, lin: 1 },
            ],
          },
          OGRO,
        ]);
        return vi.fn();
      });
      renderChat(null, '/campanhas/camp-1/grid');
      await screen.findByRole('button', { name: /Aldric, coluna/ });
      expect(screen.queryByText(/ q · /)).not.toBeInTheDocument();
    });

    it('meu movimento mostra o rastro na hora e a confirmação não duplica', async () => {
      renderChat(null, '/campanhas/camp-1/grid');
      fireEvent.keyDown(await screen.findByRole('button', { name: /Aldric, coluna/ }), {
        key: 'ArrowDown',
      });
      expect(await screen.findByText('1 q · 1,5 m')).toBeInTheDocument();

      const rastro = [
        { col: 1, lin: 1 },
        { col: 1, lin: 2 },
      ];
      // Snapshot local (escrita pendente) e depois o confirmado pelo servidor.
      act(() => emitirTokens([{ ...ALDRIC, lin: 2, rastro, movidoEm: null }, OGRO]));
      act(() =>
        emitirTokens([{ ...ALDRIC, lin: 2, rastro, movidoEm: horario(9) }, OGRO]),
      );
      expect(screen.getAllByText('1 q · 1,5 m')).toHaveLength(1);
    });

    it('regra ainda sem rastro: move só col/lin, sem erro', async () => {
      moverGridToken.mockRejectedValueOnce(
        Object.assign(new Error('negado'), { code: 'permission-denied' }),
      );
      renderChat(null, '/campanhas/camp-1/grid');
      fireEvent.keyDown(await screen.findByRole('button', { name: /Aldric, coluna/ }), {
        key: 'ArrowDown',
      });

      await waitFor(() => expect(moverGridToken).toHaveBeenCalledTimes(2));
      expect(moverGridToken).toHaveBeenLastCalledWith('camp-1', 'cena-1', 't1', 1, 2);
      expect(screen.queryByText(/Não foi possível mover/)).not.toBeInTheDocument();
      expect(screen.getByText('1 q · 1,5 m')).toBeInTheDocument();
    });

    it('jogador entra como membro, vê a cena ativa (tokens visíveis) e o chat ao lado', async () => {
      renderChat(null, '/campanhas/camp-1/grid');

      expect(
        await screen.findByRole('button', { name: 'Aldric, coluna 2, linha 2' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ogro/ })).toBeInTheDocument();
      expect(screen.getByText('Taverna')).toBeInTheDocument();
      expect(setChatMembro).toHaveBeenCalledWith('camp-1', 'uid-jogador', 'p-1');
      expect(subscribeGridTokens).toHaveBeenCalledWith(
        'camp-1',
        'cena-1',
        { incluirOcultos: false },
        expect.any(Function),
        expect.any(Function),
      );
      expect(screen.getByText('Bem-vindos à taverna.')).toBeInTheDocument();
    });

    it('jogador move o próprio token, mas não o do mestre', async () => {
      renderChat(null, '/campanhas/camp-1/grid');

      fireEvent.keyDown(await screen.findByRole('button', { name: /Aldric, coluna/ }), {
        key: 'ArrowDown',
      });
      await waitFor(() =>
        expect(moverGridToken).toHaveBeenCalledWith('camp-1', 'cena-1', 't1', 1, 2, [
          { col: 1, lin: 1 },
          { col: 1, lin: 2 },
        ]),
      );

      fireEvent.keyDown(screen.getByRole('button', { name: /Ogro/ }), {
        key: 'ArrowLeft',
      });
      expect(moverGridToken).toHaveBeenCalledTimes(1);
    });

    it('troca sozinho quando o mestre mostra outra cena', async () => {
      renderChat(null, '/campanhas/camp-1/grid');
      await screen.findByRole('button', { name: /Aldric, coluna/ });

      act(() => mudarCenaAtiva('cena-2'));

      expect(
        await screen.findByRole('button', { name: /Esqueleto/ }),
      ).toBeInTheDocument();
      expect(screen.getByText('Masmorra')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Aldric, coluna/ }),
      ).not.toBeInTheDocument();
    });

    it('avisa quando não há cena ativa', async () => {
      subscribeGridCenaAtiva.mockImplementation((_campanhaId, onChange) => {
        onChange(null);
        return vi.fn();
      });
      renderChat(null, '/campanhas/camp-1/grid');
      expect(
        await screen.findByText('O mestre ainda não abriu uma cena.'),
      ).toBeInTheDocument();
      expect(subscribeGridTokens).not.toHaveBeenCalled();
    });

    it('alterna entre chat e grid e oculta o painel do chat', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      expect(subscribeGridCenaAtiva).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
      expect(await screen.findByRole('button', { name: /Ogro/ })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Ocultar chat' }));
      expect(screen.queryByText('Bem-vindos à taverna.')).not.toBeInTheDocument();
    });

    it('esconde o botão de painel lateral na visualização de chat em tela cheia', async () => {
      renderChat();
      expect(await screen.findByText('Bem-vindos à taverna.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Painel lateral/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument();
    });

    it('abre o chat em painel lateral sem perder o histórico', async () => {
      renderChat(null, '/campanhas/camp-1/lateral');
      expect(await screen.findByText('Bem-vindos à taverna.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Painel lateral/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Minimizar chat/ })).toBeInTheDocument();
    });

    describe('Fase 3C: ações', () => {
      const tocarToken = nome => {
        const token = screen.getByRole('button', { name: nome });
        const clique = { clientX: 60, clientY: 60, pointerId: 1, pointerType: 'mouse', button: 0 };
        fireEvent.pointerDown(token, clique);
        fireEvent.pointerUp(screen.getByRole('application', { name: 'Grid da campanha' }), clique);
      };

      it('"Rolar…" só aparece no meu token; a rolagem sai com o rótulo, assinada pelo token', async () => {
        renderChat(null, '/campanhas/camp-1/grid');
        await screen.findByRole('button', { name: /Aldric, coluna/ });

        tocarToken(/Ogro/);
        expect(screen.queryByRole('button', { name: 'Rolar…' })).not.toBeInTheDocument();

        tocarToken(/Aldric, coluna/);
        fireEvent.click(screen.getByRole('button', { name: 'Rolar…' }));
        const dialogo = await screen.findByRole('dialog');
        fireEvent.change(within(dialogo).getByLabelText('Expressão'), {
          target: { value: '1d6+2' },
        });
        fireEvent.change(within(dialogo).getByLabelText('Rótulo (opcional)'), {
          target: { value: 'Teste de força' },
        });
        await act(async () => fireEvent.click(within(dialogo).getByRole('button', { name: 'Rolar' })));

        await waitFor(() =>
          expect(addChatMensagem).toHaveBeenCalledWith(
            'camp-1',
            expect.objectContaining({
              tipo: 'rolagem',
              personagemId: 'p-1',
              autorNome: 'Aldric',
              rotulo: 'Teste de força',
            }),
          ),
        );
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      });

      it('token que é ficha minha oferece os combos salvos e rola com o rótulo do combo', async () => {
        TOKENS_POR_CENA['cena-1'][0].refId = 'p-1';
        getCombosAtaque.mockResolvedValue([{ id: 'c1', nome: 'Golpe Duplo', perfilDano: '2d8+5' }]);
        getArts.mockResolvedValue([{ id: 'a1', nome: 'Chama', dados: '3d6 de fogo' }]);
        try {
          renderChat(null, '/campanhas/camp-1/grid');
          await screen.findByRole('button', { name: /Aldric, coluna/ });
          tocarToken(/Aldric, coluna/);
          fireEvent.click(screen.getByRole('button', { name: 'Rolar…' }));
          const dialogo = await screen.findByRole('dialog');
          expect(await within(dialogo).findByText('Chama')).toBeInTheDocument();
          await act(async () =>
            fireEvent.click(within(dialogo).getByRole('button', { name: /Golpe Duplo/ })),
          );
          await waitFor(() =>
            expect(addChatMensagem).toHaveBeenCalledWith(
              'camp-1',
              expect.objectContaining({ personagemId: 'p-1', rotulo: 'Ataque: Golpe Duplo' }),
            ),
          );
        } finally {
          delete TOKENS_POR_CENA['cena-1'][0].refId;
        }
      });

      it('mostra o botão Área e posiciona um raio na cena (grava com meu uid)', async () => {
        renderChat(null, '/campanhas/camp-1/grid');
        await screen.findByRole('button', { name: /Aldric, coluna/ });
        fireEvent.click(screen.getByRole('button', { name: 'Área' }));
        fireEvent.click(screen.getByRole('button', { name: 'Raio' }));
        fireEvent.change(screen.getByLabelText('Tamanho (m)'), { target: { value: '3' } });
        fireEvent.click(screen.getByRole('button', { name: 'Posicionar no mapa' }));
        const clique = { clientX: 200, clientY: 200, pointerId: 1, pointerType: 'mouse', button: 0 };
        const viewport = screen.getByRole('application', { name: 'Grid da campanha' });
        fireEvent.pointerDown(viewport, clique);
        await act(async () => fireEvent.pointerUp(viewport, clique));
        await waitFor(() =>
          expect(addGridArea).toHaveBeenCalledWith(
            'camp-1',
            'cena-1',
            expect.objectContaining({ uid: 'uid-jogador', forma: 'raio', metros: 3 }),
          ),
        );
      });
    });

    describe('Fase 2: condições, recursos e sinais', () => {
      const FICHA_ALDRIC = {
        id: 'p-1',
        status: { hp: { atual: 5 } },
        statusMaximos: { hp: 10 },
        condicoesAtivas: [{ condicaoId: 'c1', stack: 1 }],
      };
      let emitirPings;

      beforeEach(() => {
        getRmCampanha.mockResolvedValue({
          id: 'camp-1',
          nome: 'A Torre',
          mestreId: 'uid-mestre',
          universoId: 'univ-1',
        });
        getCondicoesPorUniverso.mockResolvedValue([
          { id: 'c1', nome: 'Envenenado', linkImagem: 'https://ex.com/veneno.png' },
        ]);
        subscribeGridTokens.mockImplementation(
          (_campanhaId, _cenaId, _opcoes, onChange) => {
            onChange([{ ...ALDRIC, refId: 'p-1' }, OGRO]);
            return vi.fn();
          },
        );
        subscribePersonagem.mockImplementation((_id, onChange) => {
          onChange(FICHA_ALDRIC);
          return vi.fn();
        });
        subscribeGridPings.mockImplementation((_campanhaId, _cenaId, onChange) => {
          emitirPings = onChange;
          onChange([]);
          return vi.fn();
        });
        setGridPing.mockResolvedValue();
      });

      it('catálogo de condições só é carregado na visão grid', async () => {
        renderChat();
        await screen.findByText('Bem-vindos à taverna.');
        expect(getCondicoesPorUniverso).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
        await screen.findByRole('button', { name: /Aldric, coluna/ });
        expect(getCondicoesPorUniverso).toHaveBeenCalledWith('univ-1');
      });

      it('token do jogador mostra a barra de PV e a condição da ficha ao vivo', async () => {
        const { container } = renderChat(null, '/campanhas/camp-1/grid');
        await screen.findByRole('button', { name: /Aldric, coluna/ });
        expect(subscribePersonagem).toHaveBeenCalledWith(
          'p-1',
          expect.any(Function),
          expect.any(Function),
        );
        const aldric = container.querySelector('[data-token-id="t1"]');
        expect(aldric.querySelector('[data-barra="pv"] > span')).toHaveStyle({
          width: '50%',
        });
        await waitFor(() =>
          expect(aldric.querySelector('[data-condicao="c1"] img')).toHaveAttribute(
            'src',
            'https://ex.com/veneno.png',
          ),
        );
      });

      it('edita o PV atual no cartão do próprio token e grava na ficha certa; o Ogro não edita', async () => {
        const { container } = renderChat(null, '/campanhas/camp-1/grid');
        const aldric = await screen.findByRole('button', { name: /Aldric, coluna/ });
        await waitFor(() => expect(subscribePersonagem).toHaveBeenCalled());

        fireEvent.pointerOver(aldric, { pointerType: 'mouse' });
        const cartao = container.querySelector('[data-detalhe]');
        expect(within(cartao).getByLabelText('PV atual')).toHaveValue('5');
        fireEvent.click(within(cartao).getByRole('button', { name: 'Aumentar PV' }));
        await waitFor(() =>
          expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledWith('p-1', 'pv', 6),
        );

        const campo = within(cartao).getByLabelText('PV atual');
        fireEvent.change(campo, { target: { value: '99' } });
        fireEvent.keyDown(campo, { key: 'Enter' });
        await waitFor(() =>
          expect(atualizarRecursoAtualPersonagem).toHaveBeenLastCalledWith('p-1', 'pv', 10),
        );

        fireEvent.pointerOut(aldric, { pointerType: 'mouse' });
        fireEvent.pointerOver(screen.getByRole('button', { name: /Ogro/ }), {
          pointerType: 'mouse',
        });
        expect(container.querySelector('[data-recurso]')).toBeNull();
      });

      it('sinal ao vivo do mestre aparece com o nome; jogador não tem "Puxar vista"', async () => {
        const { container } = renderChat(null, '/campanhas/camp-1/grid');
        await screen.findByRole('button', { name: /Aldric, coluna/ });
        expect(
          screen.queryByRole('button', { name: 'Puxar vista' }),
        ).not.toBeInTheDocument();

        act(() =>
          emitirPings([
            {
              uid: 'uid-mestre',
              x: 40,
              y: 40,
              puxar: true,
              nome: 'Mestre',
              criadoEm: { seconds: 3, nanoseconds: 0 },
            },
          ]),
        );
        expect(container.querySelector('[data-ping="uid-mestre"]')).toHaveTextContent(
          'Mestre',
        );
      });

      it('Alt+clique no mapa grava o sinal com o nome de quem fala', async () => {
        renderChat(null, '/campanhas/camp-1/grid');
        await screen.findByRole('button', { name: /Aldric, coluna/ });
        fireEvent.pointerDown(
          screen.getByRole('application', { name: 'Grid da campanha' }),
          {
            clientX: 50,
            clientY: 60,
            pointerId: 1,
            pointerType: 'mouse',
            button: 0,
            altKey: true,
          },
        );
        expect(setGridPing).toHaveBeenCalledWith(
          'camp-1',
          'cena-1',
          'uid-jogador',
          expect.objectContaining({ puxar: false, nome: 'Aldric' }),
        );
      });
    });

    describe('Fase 3A: combate', () => {
      const FICHA_ALDRIC = {
        id: 'p-1',
        uid: 'uid-jogador',
        prontidaoAtual: 4,
        prontidaoMaximaEfetiva: 30,
        secundariosTotais: { prontidao: 30 },
        estadoCombate: { ppAtual: 4, turno: 2, historicoAcoes: [] },
      };
      const COMBATE = {
        ordem: [
          { tokenId: 't1', iniciativa: 18, d20: 13, reacao: 5 },
          { tokenId: 't2', iniciativa: 9, d20: 7, reacao: 2 },
        ],
        indice: 0,
        rodada: 1,
        inicioTurno: { col: 1, lin: 1 },
        turnoEm: { seconds: 3, nanoseconds: 0 },
      };
      let emitirCombate;

      beforeEach(() => {
        subscribeGridTokens.mockImplementation(
          (_campanhaId, _cenaId, _opcoes, onChange) => {
            onChange([{ ...ALDRIC, refId: 'p-1' }, OGRO]);
            return vi.fn();
          },
        );
        subscribePersonagem.mockImplementation((_id, onChange) => {
          onChange(FICHA_ALDRIC);
          return vi.fn();
        });
        subscribeGridCombate.mockImplementation((_campanhaId, _cenaId, onChange) => {
          emitirCombate = onChange;
          onChange(COMBATE);
          return vi.fn();
        });
        alterarGridCombate.mockResolvedValue(true);
        updatePersonagem.mockResolvedValue({});
      });

      it('na minha vez: faixa, "Encerrar meu turno" passa a vez com a mensagem', async () => {
        renderChat(null, '/campanhas/camp-1/grid');
        const encerrar = await screen.findByRole('button', {
          name: 'Encerrar meu turno',
        });
        expect(screen.getByText('Rodada 1')).toBeInTheDocument();
        expect(subscribeGridCombate).toHaveBeenCalledWith(
          'camp-1',
          'cena-1',
          expect.any(Function),
          expect.any(Function),
        );

        fireEvent.click(encerrar);
        await waitFor(() => expect(alterarGridCombate).toHaveBeenCalledTimes(1));
        const [campanhaId, cenaId, calcular] = alterarGridCombate.mock.calls[0];
        expect([campanhaId, cenaId]).toEqual(['camp-1', 'cena-1']);
        expect(calcular(COMBATE)).toEqual({
          patch: { indice: 1, rodada: 1, inicioTurno: { col: 4, lin: 1 } },
          mudouTurno: true,
          mensagem: expect.objectContaining({
            tipo: 'combate',
            autorNome: 'Aldric',
            personagemId: 'p-1',
            combate: {
              evento: 'turno',
              cenaId: 'cena-1',
              rodada: 1,
              nome: 'Ogro',
              oculto: false,
            },
          }),
        });
      });

      it('"Seu turno! Restaurar PP" restaura a ficha da vez e some', async () => {
        renderChat(null, '/campanhas/camp-1/grid');
        fireEvent.click(
          await screen.findByRole('button', { name: 'Seu turno! Restaurar PP' }),
        );
        await waitFor(() =>
          expect(updatePersonagem).toHaveBeenCalledWith('p-1', {
            estadoCombate: expect.objectContaining({ ppAtual: 30, turno: 3 }),
          }),
        );
        await waitFor(() =>
          expect(
            screen.queryByRole('button', { name: 'Seu turno! Restaurar PP' }),
          ).not.toBeInTheDocument(),
        );
        // Turno novo (outra chave): o botão volta.
        act(() => emitirCombate({ ...COMBATE, turnoEm: { seconds: 9, nanoseconds: 0 } }));
        expect(
          screen.getByRole('button', { name: 'Seu turno! Restaurar PP' }),
        ).toBeInTheDocument();
      });

      it('na vez de um token alheio, nada de botões de turno', async () => {
        subscribeGridCombate.mockImplementation((_campanhaId, _cenaId, onChange) => {
          onChange({ ...COMBATE, indice: 1 });
          return vi.fn();
        });
        renderChat(null, '/campanhas/camp-1/grid');
        expect(await screen.findByText('Rodada 1')).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Encerrar meu turno' }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Seu turno! Restaurar PP' }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Próximo turno' }),
        ).not.toBeInTheDocument();
      });

      it('"só na sua vez": fora da vez o jogador não move e vê o aviso', async () => {
        subscribeGridCena.mockImplementation((_campanhaId, cenaId, onChange) => {
          onChange({ id: cenaId, ...CENAS[cenaId], travamento: 'turno' });
          return vi.fn();
        });
        subscribeGridCombate.mockImplementation((_campanhaId, _cenaId, onChange) => {
          onChange({ ...COMBATE, indice: 1 });
          return vi.fn();
        });
        const { container } = renderChat(null, '/campanhas/camp-1/grid');
        fireEvent.keyDown(
          await screen.findByRole('button', { name: /^Aldric, coluna/ }),
          {
            key: 'ArrowDown',
          },
        );
        expect(moverGridToken).not.toHaveBeenCalled();
        expect(container.querySelector('[data-travamento]')).toHaveTextContent(
          'Movimento só na sua vez',
        );
      });
    });

    it('celular: alterna Mapa | Chat (começa no mapa) e conta as mensagens novas', async () => {
      useIsMobile.mockReturnValue(true);
      let novasMensagens;
      subscribeChatMensagens.mockImplementation((_campanhaId, onChange) => {
        novasMensagens = onChange;
        onChange(MENSAGENS);
        return vi.fn();
      });
      renderChat(null, '/campanhas/camp-1/grid');

      const mapa = await screen.findByRole('button', { name: /Aldric, coluna/ });
      const corpo = mapa.closest('[data-aba]');
      expect(corpo).toHaveAttribute('data-aba', 'mapa');
      // Mapa | Chat substitui Chat|Grid e "Ocultar chat".
      expect(screen.queryByRole('button', { name: 'Grid' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Ocultar chat' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument();

      act(() =>
        novasMensagens([
          ...MENSAGENS,
          {
            ...MENSAGENS[0],
            id: 'm4',
            texto: 'Rolem iniciativa.',
            createdAt: new Date(Date.now() + 60000),
          },
        ]),
      );
      fireEvent.click(await screen.findByRole('button', { name: 'Chat, 1 novas' }));

      expect(corpo).toHaveAttribute('data-aba', 'chat');
      expect(screen.getByText('Rolem iniciativa.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Mapa' }));
      expect(corpo).toHaveAttribute('data-aba', 'mapa');
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument();
    });
  });
});
