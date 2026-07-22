import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import {
  addNucleo,
  getArts,
  getCondicoesPorUniverso,
  getNucleos,
  getVariantes,
  updateArt,
} from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import ArtsTab from './ArtsTab';

vi.mock('service/storage', () => ({
  getNucleos: vi.fn(),
  getArts: vi.fn(),
  getVariantes: vi.fn(),
  getCondicoesPorUniverso: vi.fn(),
  addNucleo: vi.fn(),
  updateNucleo: vi.fn(),
  removeNucleo: vi.fn(),
  addArt: vi.fn(),
  updateArt: vi.fn(),
  removeArt: vi.fn(),
  addVariante: vi.fn(),
  updateVariante: vi.fn(),
  removeVariante: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  atributosBase: { forca: 10, vitalidade: 10, agilidade: 10, inteligencia: 10, percepcao: 10 },
  atributosExtra: {},
  atributosBonus: {},
};

const nucleo = { id: 'n1', nome: 'Punhos de Ferro', tipo: 'Ofensiva' };
const art = { id: 'a1', nome: 'Golpe Certeiro', nucleoId: 'n1', ativa: true };

describe('ArtsTab', () => {
  beforeEach(() => {
    getNucleos.mockResolvedValue([nucleo]);
    getArts.mockResolvedValue([art]);
    getVariantes.mockResolvedValue([]);
    getCondicoesPorUniverso.mockResolvedValue([]);
    addNucleo.mockResolvedValue();
    updateArt.mockResolvedValue();
  });

  it('bloqueia uma art ativa ao clicar no botão de status', async () => {
    render(
      <SavingProvider>
        <ArtsTab personagem={personagem} />
      </SavingProvider>,
    );

    const botaoStatus = await screen.findByRole('button', { name: /^ativa$/i });
    fireEvent.click(botaoStatus);

    await waitFor(() => expect(updateArt).toHaveBeenCalledWith('p1', 'a1', { ativa: false }));
  });

  it('cria um núcleo novo pelo diálogo', async () => {
    render(
      <SavingProvider>
        <ArtsTab personagem={personagem} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /\+ criar núcleo/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Nome'), { target: { value: 'Chama Interior' } });

    fireEvent.mouseDown(within(dialog).getByLabelText('Tipo'));
    fireEvent.click(await screen.findByRole('option', { name: 'Ofensiva' }));

    fireEvent.click(within(dialog).getByRole('button', { name: /confirmar/i }));

    await waitFor(() =>
      expect(addNucleo).toHaveBeenCalledWith('p1', expect.objectContaining({ nome: 'Chama Interior', tipo: 'Ofensiva' })),
    );
  });
});
