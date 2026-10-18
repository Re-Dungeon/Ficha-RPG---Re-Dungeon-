import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import {
  addChatMensagem,
  addChatRolagemSecreta,
  getPersonagens,
  getChatMacros,
  getRmCampanha,
  moverGridToken,
  setChatMembro,
  subscribeGrid,
  subscribeGridTokens,
  subscribeChatMensagens,
  subscribeChatSecretasDoUsuario,
} from 'service/storage';
import { executarMacro as rodarMacroNoWorker } from 'common/lua/executarMacro';
import CampanhaChat from './CampanhaChat';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
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
  subscribeGrid: vi.fn(),
  subscribeGridTokens: vi.fn(),
  moverGridToken: vi.fn(),
}));

const LayoutFake = () => <Outlet context={{ setHeaderExtra: vi.fn() }} />;

const renderChat = (state = null, pathname = '/campanhas/camp-1/chat') =>
  render(
    <MemoryRouter initialEntries={[{ pathname, state }]}>
      <Routes>
        <Route element={<LayoutFake />}>
          <Route path="/campanhas/:id/chat" element={<CampanhaChat />} />
          <Route path="/campanhas/:id/grid" element={<CampanhaChat visao="grid" />} />
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

  describe('grid', () => {
    const TOKENS = [
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
    ];

    beforeEach(() => {
      subscribeGrid.mockImplementation((_campanhaId, onChange) => {
        onChange({
          imagemUrl: null,
          celula: 40,
          deslocamentoX: 0,
          deslocamentoY: 0,
          mostrarGrade: true,
          corGrade: '#ffffff',
          opacidadeGrade: 0.3,
        });
        return vi.fn();
      });
      subscribeGridTokens.mockImplementation((_campanhaId, _opcoes, onChange) => {
        onChange(TOKENS);
        return vi.fn();
      });
      moverGridToken.mockResolvedValue();
    });

    it('jogador entra como membro, vê só os tokens visíveis e o chat ao lado', async () => {
      renderChat(null, '/campanhas/camp-1/grid');

      expect(
        await screen.findByRole('button', { name: 'Aldric, coluna 2, linha 2' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ogro/ })).toBeInTheDocument();
      expect(setChatMembro).toHaveBeenCalledWith('camp-1', 'uid-jogador', 'p-1');
      expect(subscribeGridTokens).toHaveBeenCalledWith(
        'camp-1',
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
        expect(moverGridToken).toHaveBeenCalledWith('camp-1', 't1', 1, 2),
      );

      fireEvent.keyDown(screen.getByRole('button', { name: /Ogro/ }), {
        key: 'ArrowLeft',
      });
      expect(moverGridToken).toHaveBeenCalledTimes(1);
    });

    it('avisa quando o mestre ainda não montou o grid', async () => {
      subscribeGrid.mockImplementation((_campanhaId, onChange) => {
        onChange(null);
        return vi.fn();
      });
      subscribeGridTokens.mockImplementation((_campanhaId, _opcoes, onChange) => {
        onChange([]);
        return vi.fn();
      });
      renderChat(null, '/campanhas/camp-1/grid');
      expect(
        await screen.findByText('O mestre ainda não montou o grid desta campanha.'),
      ).toBeInTheDocument();
    });

    it('alterna entre chat e grid e oculta o painel do chat', async () => {
      renderChat();
      await screen.findByText('Bem-vindos à taverna.');
      expect(subscribeGrid).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
      expect(await screen.findByRole('button', { name: /Ogro/ })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Ocultar chat' }));
      expect(screen.queryByText('Bem-vindos à taverna.')).not.toBeInTheDocument();
    });
  });
});
