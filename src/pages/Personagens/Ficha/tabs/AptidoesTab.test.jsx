import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  getAptidoesAdquiridas,
  getAptidoesPorUniverso,
  removeAptidaoAdquirida,
  setAptidaoAdquirida,
} from 'service/storage';

import AptidoesTab from './AptidoesTab';

vi.mock('service/storage', () => ({
  getAptidoesAdquiridas: vi.fn(),
  getAptidoesPorUniverso: vi.fn(),
  setAptidaoAdquirida: vi.fn(),
  removeAptidaoAdquirida: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  aptidoesGanhas: 5,
  atributosBase: { forca: 10, vitalidade: 10, agilidade: 10, inteligencia: 10, percepcao: 10 },
  atributosExtra: {},
  atributosBonus: {},
};

const catalogo = [
  {
    id: 'foco-arcano',
    nome: 'Foco Arcano',
    nivelMaximo: 3,
    progressaoNiveis: [
      { nivel: 1, possuiBonus: false },
      { nivel: 2, possuiBonus: true, bonus: { descricaoCompleta: 'Vantagem narrativa nível 2' } },
    ],
  },
];

describe('AptidoesTab — fluxo de aquisição/remoção', () => {
  beforeEach(() => {
    getAptidoesPorUniverso.mockResolvedValue(catalogo);
    getAptidoesAdquiridas.mockResolvedValue([{ id: 'foco-arcano', nivel: 1 }]);
    setAptidaoAdquirida.mockResolvedValue();
    removeAptidaoAdquirida.mockResolvedValue();
  });

  it('faz upgrade de nível salvando otimisticamente e chamando setAptidaoAdquirida', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<AptidoesTab personagem={personagem} onSave={onSave} />);

    const botaoUpar = await screen.findByRole('button', { name: /upar foco arcano/i });
    fireEvent.click(botaoUpar);

    // Otimista: nível 1 → 2 aparece na tela antes mesmo do Firestore confirmar.
    expect(await screen.findByText('2 / 3')).toBeInTheDocument();
    await waitFor(() => expect(setAptidaoAdquirida).toHaveBeenCalledWith('p1', 'foco-arcano', 2));
  });

  it('reverte o upgrade e mostra mensagem de erro quando o Firestore rejeita', async () => {
    setAptidaoAdquirida.mockRejectedValue(new Error('offline'));
    const onSave = vi.fn().mockResolvedValue();
    render(<AptidoesTab personagem={personagem} onSave={onSave} />);

    const botaoUpar = await screen.findByRole('button', { name: /upar foco arcano/i });
    fireEvent.click(botaoUpar);

    await waitFor(() => expect(screen.getByText('1 / 3')).toBeInTheDocument());
    expect(await screen.findByText(/não foi possível salvar a alteração/i)).toBeInTheDocument();
  });

  it('remove uma aptidão adquirida chamando removeAptidaoAdquirida', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<AptidoesTab personagem={personagem} onSave={onSave} />);

    const botaoRemover = await screen.findByRole('button', { name: /remover foco arcano/i });
    fireEvent.click(botaoRemover);

    expect(screen.queryByText('Foco Arcano')).not.toBeInTheDocument();
    await waitFor(() => expect(removeAptidaoAdquirida).toHaveBeenCalledWith('p1', 'foco-arcano'));
  });
});
