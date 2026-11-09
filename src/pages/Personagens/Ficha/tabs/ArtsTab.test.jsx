import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import {
  addNucleo,
  getArts,
  getCondicoesPorUniverso,
  getNucleos,
  getVariantes,
  removeArt,
  removeNucleo,
  removeVariante,
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

  it('usa o total efetivo dos primários, incluindo bônus de cultivo, para calcular o limite de arts', async () => {
    render(
      <SavingProvider>
        <ArtsTab personagem={{ ...personagem, cultivoBonus: { primarios: { forca: 20, vitalidade: 20 } } }} />
      </SavingProvider>,
    );

    expect(await screen.findByText('3')).toBeInTheDocument();
  });

  it('exibe o limite final considerando bônus manual adicional e atualiza o valor', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <ArtsTab personagem={{ ...personagem, artsLimiteAdicional: 3 }} onSave={onSave} />
      </SavingProvider>,
    );

    expect(await screen.findByText('4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /adicionar limite/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ artsLimiteAdicional: 4 }));

    fireEvent.click(screen.getByRole('button', { name: /remover limite/i }));
    await waitFor(() => expect(onSave).toHaveBeenLastCalledWith({ artsLimiteAdicional: 2 }));
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

  it('remover um Núcleo pede confirmação listando o que vai junto', async () => {
    getVariantes.mockResolvedValue([{ id: 'v1', artId: 'a1', nome: 'Golpe Duplo' }]);
    removeNucleo.mockResolvedValue();
    removeArt.mockResolvedValue();
    removeVariante.mockResolvedValue();
    render(
      <SavingProvider>
        <ArtsTab personagem={personagem} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Remover o Núcleo Punhos de Ferro' }));
    expect(await screen.findByText('Excluir o Núcleo "Punhos de Ferro"?')).toBeInTheDocument();
    expect(screen.getByText('1 Art deste Núcleo')).toBeInTheDocument();
    expect(screen.getByText('1 Variante dessas Arts')).toBeInTheDocument();
    expect(removeNucleo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(removeNucleo).toHaveBeenCalledWith('p1', 'n1'));
    expect(removeArt).toHaveBeenCalledWith('p1', 'a1');
    expect(removeVariante).toHaveBeenCalledWith('p1', 'v1');
  });
});
