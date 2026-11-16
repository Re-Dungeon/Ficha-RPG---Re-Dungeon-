import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { atualizarRecursoAtualPersonagem } from 'service/storage';
import StatusFaixa from './StatusFaixa';

vi.mock('service/storage', () => ({ atualizarRecursoAtualPersonagem: vi.fn() }));

const personagem = {
  id: 'p1',
  status: {
    hp: { atual: 8 },
    energia: { atual: 3 },
    fadiga: { atual: 10 },
  },
  statusMaximos: { hp: 10, energia: 5, fadiga: 10 },
  secundariosTotais: { prontidao: 6 },
  estadoCombate: { ppAtual: 4 },
};

describe('StatusFaixa', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    atualizarRecursoAtualPersonagem.mockReset();
    atualizarRecursoAtualPersonagem.mockResolvedValue(7);
  });

  it('mostra atual/máximo de PV, Energia, Fadiga e PP', () => {
    render(<StatusFaixa personagem={personagem} />);

    expect(within(screen.getByTestId('faixa-pv')).getByText('8/10')).toBeInTheDocument();
    expect(within(screen.getByTestId('faixa-energia')).getByText('3/5')).toBeInTheDocument();
    expect(within(screen.getByTestId('faixa-fadiga')).getByText('10/10')).toBeInTheDocument();
    expect(within(screen.getByTestId('faixa-pp')).getByText('4/6')).toBeInTheDocument();
  });

  it('− mostra o valor na hora e grava uma vez, depois de uma pausa', async () => {
    render(<StatusFaixa personagem={personagem} />);

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir PV' }));

    expect(within(screen.getByTestId('faixa-pv')).getByText('7/10')).toBeInTheDocument();
    expect(atualizarRecursoAtualPersonagem).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledTimes(1);
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledWith('p1', 'pv', 7);
  });

  it('vários cliques seguidos viram uma única escrita com o valor final', async () => {
    render(<StatusFaixa personagem={personagem} />);
    const menos = screen.getByRole('button', { name: 'Diminuir PV' });

    fireEvent.click(menos);
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.click(menos);
    fireEvent.click(menos);
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    // O prazo recomeça a cada clique: ainda nada gravado.
    expect(atualizarRecursoAtualPersonagem).not.toHaveBeenCalled();
    expect(within(screen.getByTestId('faixa-pv')).getByText('5/10')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledTimes(1);
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledWith('p1', 'pv', 5);
  });

  it('cliques que voltam ao valor original não gravam', async () => {
    render(<StatusFaixa personagem={personagem} />);

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir PV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar PV' }));
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(atualizarRecursoAtualPersonagem).not.toHaveBeenCalled();
  });

  it('desmontar a faixa com cliques pendentes grava na hora', () => {
    const { unmount } = render(<StatusFaixa personagem={personagem} />);

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Energia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Energia' }));
    expect(atualizarRecursoAtualPersonagem).not.toHaveBeenCalled();

    unmount();
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledTimes(1);
    expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledWith('p1', 'energia', 1);
  });

  it('+ não passa do máximo e − não passa de zero', () => {
    render(<StatusFaixa personagem={{ ...personagem, status: { ...personagem.status, fadiga: { atual: 10 }, energia: { atual: 0 } } }} />);

    expect(screen.getByRole('button', { name: 'Aumentar Fadiga' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Diminuir Energia' })).toBeDisabled();
  });

  it('se a gravação falha, volta ao valor da ficha e avisa', async () => {
    atualizarRecursoAtualPersonagem.mockRejectedValue(new Error('falhou'));
    render(<StatusFaixa personagem={personagem} />);

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Energia' }));
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText(/Não foi possível atualizar/)).toBeInTheDocument();
    expect(within(screen.getByTestId('faixa-energia')).getByText('3/5')).toBeInTheDocument();
  });

  it('ficha sem máximos gravados e sem Prontidão não renderiza a faixa', () => {
    render(<StatusFaixa personagem={{ id: 'p2', status: {}, statusMaximos: {} }} />);
    expect(screen.queryByLabelText('Recursos do personagem')).not.toBeInTheDocument();
  });

  it('sem Prontidão não mostra o PP', () => {
    render(<StatusFaixa personagem={{ ...personagem, secundariosTotais: {} }} />);
    expect(screen.queryByTestId('faixa-pp')).not.toBeInTheDocument();
  });
});
