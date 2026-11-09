import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

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
  beforeEach(() => {
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

  it('− grava o valor novo na hora e mostra o valor otimista', async () => {
    render(<StatusFaixa personagem={personagem} />);

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir PV' }));

    expect(within(screen.getByTestId('faixa-pv')).getByText('7/10')).toBeInTheDocument();
    await waitFor(() => expect(atualizarRecursoAtualPersonagem).toHaveBeenCalledWith('p1', 'pv', 7));
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

    expect(await screen.findByText(/Não foi possível atualizar/)).toBeInTheDocument();
    expect(within(screen.getByTestId('faixa-energia')).getByText('3/5')).toBeInTheDocument();
  });

  it('sem Prontidão não mostra o PP', () => {
    render(<StatusFaixa personagem={{ ...personagem, secundariosTotais: {} }} />);
    expect(screen.queryByTestId('faixa-pp')).not.toBeInTheDocument();
  });
});
