import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ChatSala from './ChatSala';

const audioFalso = sobrescrever => ({
  tocando: true,
  pausado: false,
  repetir: true,
  titulo: 'Taverna ambiente',
  bloqueado: false,
  erroPlayer: null,
  podeControlar: false,
  volume: 50,
  mudo: false,
  setVolume: vi.fn(),
  setMudo: vi.fn(),
  liberarSom: vi.fn(),
  tocar: vi.fn(),
  pausar: vi.fn(),
  retomar: vi.fn(),
  parar: vi.fn(),
  setRepetir: vi.fn(),
  ...sobrescrever,
});

const renderSala = audio =>
  render(
    <ChatSala
      mensagens={[]}
      currentUid="u1"
      onEnviarTexto={vi.fn()}
      onEnviarImagem={vi.fn()}
      onRolar={vi.fn()}
      onApagar={vi.fn()}
      audio={audio}
    />,
  );

describe('ChatSala — histórico', () => {
  it('oculta por padrão só as mensagens de hoje e expande com o botão', () => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    const mensagemHoje = {
      id: 'h1',
      uid: 'u1',
      autorNome: 'Eu',
      tipo: 'texto',
      texto: 'Mensagem de hoje',
      createdAt: hoje,
    };
    const mensagemOntem = {
      id: 'h2',
      uid: 'u2',
      autorNome: 'Outro',
      tipo: 'texto',
      texto: 'Mensagem de ontem',
      createdAt: ontem,
    };

    render(
      <ChatSala
        mensagens={[mensagemHoje, mensagemOntem]}
        currentUid="u1"
        onEnviarTexto={vi.fn()}
        onEnviarImagem={vi.fn()}
        onRolar={vi.fn()}
        onApagar={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Mostrar histórico' })).toBeInTheDocument();
    expect(screen.getByText('Mensagem de hoje')).toBeInTheDocument();
    expect(screen.queryByText('Mensagem de ontem')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar histórico' }));
    expect(screen.getByRole('button', { name: 'Ocultar histórico' })).toBeInTheDocument();
    expect(screen.getByText('Mensagem de ontem')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar histórico' }));
    expect(screen.queryByText('Mensagem de ontem')).not.toBeInTheDocument();
  });

  it('mantém o histórico em uma área de scroll independente', () => {
    renderSala(null);
    const log = screen.getByRole('log');
    expect(window.getComputedStyle(log).overflowY).toBe('auto');
    expect(log).toHaveAttribute('data-chat-scroll-area', 'true');
  });
});

describe('ChatSala — combate', () => {
  const renderCombate = (itensAtaque, itensDefesa) =>
    render(
      <ChatSala
        mensagens={[]}
        currentUid="u1"
        onEnviarTexto={vi.fn()}
        onEnviarImagem={vi.fn()}
        onRolar={vi.fn()}
        onApagar={vi.fn()}
        opcoesCombate={[
          { id: 'ataque', titulo: 'Ataque', itens: itensAtaque },
          { id: 'defesa', titulo: 'Defesa', itens: itensDefesa },
        ]}
      />,
    );

  it('abre a ferramenta e carrega ataque e defesa com quantidades reais e executa rolagem', async () => {
    const onRolar = vi.fn().mockResolvedValue(undefined);
    render(
      <ChatSala
        mensagens={[]}
        currentUid="u1"
        onEnviarTexto={vi.fn()}
        onEnviarImagem={vi.fn()}
        onRolar={onRolar}
        onApagar={vi.fn()}
        opcoesCombate={[
          {
            id: 'ataque',
            titulo: 'Ataque',
            itens: [
              {
                id: 'combo-1',
                rotulo: 'Golpe Duplo',
                rotuloChat: 'Ataque: Golpe Duplo',
                expressao: '2d6+3',
              },
            ],
          },
          {
            id: 'defesa',
            titulo: 'Defesa',
            itens: [
              {
                id: 'combo-2',
                rotulo: 'Escudo de Ferro',
                rotuloChat: 'Defesa: Escudo de Ferro',
                expressao: '1d20+4',
              },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Combate' }));

    expect(screen.getByRole('tab', { name: /ataque/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /defesa/i })).toBeInTheDocument();
    expect(screen.getByText('Ataque')).toBeInTheDocument();
    expect(screen.getByText('Defesa')).toBeInTheDocument();
    expect(screen.getByText('Golpe Duplo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /defesa/i }));
    fireEvent.click(screen.getByRole('button', { name: /escudo de ferro/i }));

    expect(onRolar).toHaveBeenCalledWith(
      expect.objectContaining({
        grupos: expect.any(Array),
        termos: expect.any(Array),
        secreta: false,
        rotulo: 'Defesa: Escudo de Ferro',
      }),
    );
  });

  it('mostra todas as combinações sem scrollbar até 6 itens e habilita rolagem acima disso', () => {
    const base = Array.from({ length: 6 }, (_, index) => ({
      id: `combo-${index + 1}`,
      rotulo: `Combinação ${index + 1}`,
      rotuloChat: `Ataque: Combinação ${index + 1}`,
      expressao: '1d20+1',
    }));

    const { rerender } = renderCombate(base, []);
    fireEvent.click(screen.getByRole('button', { name: 'Combate' }));
    expect(screen.getByTestId('combate-lista')).toHaveAttribute('data-combate-lista', 'false');

    rerender(
      <ChatSala
        mensagens={[]}
        currentUid="u1"
        onEnviarTexto={vi.fn()}
        onEnviarImagem={vi.fn()}
        onRolar={vi.fn()}
        onApagar={vi.fn()}
        opcoesCombate={[
          { id: 'ataque', titulo: 'Ataque', itens: [...base, { id: 'combo-7', rotulo: 'Combinação 7', rotuloChat: 'Ataque: Combinação 7', expressao: '1d20+1' }] },
          { id: 'defesa', titulo: 'Defesa', itens: [] },
        ]}
      />,
    );

    expect(screen.getByTestId('combate-lista')).toHaveAttribute('data-combate-lista', 'true');
    fireEvent.mouseOver(screen.getByRole('button', { name: /combinação 7/i }));
    expect(screen.getByRole('button', { name: /combinação 7/i })).toBeInTheDocument();
  });

  it('respeita a categoria vazia elegante quando não há combinações', () => {
    render(
      <ChatSala
        mensagens={[]}
        currentUid="u1"
        onEnviarTexto={vi.fn()}
        onEnviarImagem={vi.fn()}
        onRolar={vi.fn()}
        onApagar={vi.fn()}
        opcoesCombate={[
          {
            id: 'ataque',
            titulo: 'Ataque',
            itens: [],
          },
          {
            id: 'defesa',
            titulo: 'Defesa',
            itens: [],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Combate' }));
    expect(screen.getByRole('tab', { name: /ataque/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /defesa/i })).toBeInTheDocument();
    expect(screen.getByText(/nenhuma combinação salva/i)).toBeInTheDocument();
  });

  it('mantém o painel estável com muitas combinações e não rompe mouse/scroll', () => {
    const combos = Array.from({ length: 12 }, (_, index) => ({
      id: `combo-${index + 1}`,
      rotulo: `Combo ${index + 1}`,
      rotuloChat: `Ataque: Combo ${index + 1}`,
      expressao: '2d8+2',
    }));

    renderCombate(combos, [{ id: 'd1', rotulo: 'Defesa Extra', rotuloChat: 'Defesa: Defesa Extra', expressao: '1d20+3' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Combate' }));
    expect(screen.getByTestId('combate-lista')).toHaveAttribute('data-combate-lista', 'true');
    const lista = screen.getByTestId('combate-lista');
    expect(lista).toHaveStyle({ overflowY: 'auto' });
    fireEvent.scroll(lista, { target: { scrollTop: 20 } });
    expect(screen.getByRole('button', { name: /combo 12/i })).toBeInTheDocument();
  });
});

describe('ChatSala — música da mesa', () => {
  it('sem `audio`, não mostra o ícone', () => {
    renderSala(null);
    expect(
      screen.queryByRole('button', { name: 'Música da mesa' }),
    ).not.toBeInTheDocument();
  });

  it('autoplay bloqueado: o aviso libera o som num clique', () => {
    const audio = audioFalso({ bloqueado: true });
    renderSala(audio);
    fireEvent.click(
      screen.getByRole('button', { name: 'Clique para ouvir a música da mesa' }),
    );
    expect(audio.liberarSom).toHaveBeenCalled();
  });

  it('modal mostra o título e o volume muda só para quem ajustou', () => {
    const audio = audioFalso();
    renderSala(audio);
    expect(
      screen.queryByRole('button', { name: 'Clique para ouvir a música da mesa' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Música da mesa' }));
    expect(screen.getByRole('status', { name: 'Música tocando' })).toHaveTextContent(
      'Taverna ambiente',
    );
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume da música' }), {
      key: 'ArrowRight',
    });
    expect(audio.setVolume).toHaveBeenCalledWith(51);
  });

  it('mestre com música tocando: mudar o "Repetir" grava na mesa', () => {
    const audio = audioFalso({ podeControlar: true });
    renderSala(audio);
    fireEvent.click(screen.getByRole('button', { name: 'Música da mesa' }));
    fireEvent.click(screen.getByRole('switch'));
    expect(audio.setRepetir).toHaveBeenCalledWith(false);
  });
});
