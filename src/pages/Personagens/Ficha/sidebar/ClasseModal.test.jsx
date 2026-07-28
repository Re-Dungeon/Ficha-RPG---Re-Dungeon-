import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

import {
  addNucleo,
  getArts,
  getClassesPorUniverso,
  getFirestoreItem,
  getNucleos,
  getVariantes,
  removeArt,
  removeNucleo,
  removeVariante,
} from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import ClasseModal from './ClasseModal';

vi.mock('service/storage', () => ({
  getClassesPorUniverso: vi.fn(),
  getFirestoreItem: vi.fn(),
  getNucleos: vi.fn(),
  getArts: vi.fn(),
  getVariantes: vi.fn(),
  addNucleo: vi.fn(),
  addArt: vi.fn(),
  removeVariante: vi.fn(),
  removeArt: vi.fn(),
  removeNucleo: vi.fn(),
}));

const classe = { id: 'c1', nome: 'Guerreiro', raridade: 'Comum' };
const classe2 = { id: 'c2', nome: 'Mago', raridade: 'Rara' };
const classe3 = { id: 'c3', nome: 'Bandido', raridade: 'Épica' };

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  classes: [],
  atributosBase: {},
  atributosExtra: {},
  atributosBonus: {},
  secundariosBase: {},
  secundariosExtra: {},
  secundariosBonus: {},
};

describe('ClasseModal', () => {
  beforeEach(() => {
    getClassesPorUniverso.mockResolvedValue([classe, classe2, classe3]);
    getFirestoreItem.mockResolvedValue({ Nome: 'Re-Dungeon' });
    getNucleos.mockResolvedValue([]);
    getArts.mockResolvedValue([]);
    getVariantes.mockResolvedValue([]);
    addNucleo.mockResolvedValue({ id: 'n1' });
    removeNucleo.mockResolvedValue();
    removeArt.mockResolvedValue();
    removeVariante.mockResolvedValue();
  });

  it('escolhe uma classe, cria o núcleo dela e salva a lista atualizada', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Guerreiro'));
    fireEvent.click(screen.getByRole('button', { name: /^Escolher Classe$/i }));

    await waitFor(() =>
      expect(addNucleo).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ nome: 'Guerreiro', classeId: 'c1' }),
      ),
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ classes: ['c1'] }));
  });

  it('mostra 2ª Escolha e 3ª Escolha nas classes restantes após seleções parciais', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const personagemComUmaClasse = { ...personagem, classes: ['c1'] };

    const { rerender } = render(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagemComUmaClasse} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Mago'));
    const secondChoiceButton = await screen.findByRole('button', { name: /2ª Escolha/i });
    expect(secondChoiceButton).toBeInTheDocument();
    expect(secondChoiceButton).not.toBeDisabled();

    // DEBUG
    // console.log('button text', secondChoiceButton.textContent);
    fireEvent.click(secondChoiceButton);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({ classes: ['c1', 'c2'] });

    const personagemComDuasClasses = { ...personagem, classes: ['c1', 'c2'] };
    rerender(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagemComDuasClasses} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Bandido'));
    expect(screen.getByRole('button', { name: /3ª Escolha/i })).toBeInTheDocument();
  });

  it('mantém a classe aberta no painel após desmarcar e remove apenas da seleção', async () => {
    const personagemComClasses = { ...personagem, classes: ['c1', 'c2'] };
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagemComClasses} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Guerreiro'));
    fireEvent.click(screen.getByRole('button', { name: /Desmarcar Classe/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ classes: ['c2'] }));
    expect(screen.getByText('GUERREIRO')).toBeInTheDocument();
  });

  it('remove o núcleo e suas artes/variantes ao desmarcar e recria ao selecionar novamente a mesma classe', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const nucleo = { id: 'n1', classeId: 'c1' };
    const art = { id: 'a1', nucleoId: 'n1' };
    const variante = { id: 'v1', artId: 'a1' };
    getNucleos.mockResolvedValueOnce([nucleo]);
    getArts.mockResolvedValueOnce([art]);
    getVariantes.mockResolvedValueOnce([variante]);

    const personagemComClasse = { ...personagem, classes: ['c1'] };
    const { rerender } = render(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagemComClasse} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Guerreiro'));
    fireEvent.click(screen.getByRole('button', { name: /Desmarcar Classe/i }));

    await waitFor(() => expect(removeVariante).toHaveBeenCalledWith('p1', 'v1'));
    await waitFor(() => expect(removeArt).toHaveBeenCalledWith('p1', 'a1'));
    await waitFor(() => expect(removeNucleo).toHaveBeenCalledWith('p1', 'n1'));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ classes: [] }));
    await waitForElementToBeRemoved(() => screen.queryByLabelText(/Salvando/i), { timeout: 3000 });

    getNucleos.mockResolvedValueOnce([]);
    const personagemSemClasse = { ...personagem, classes: [] };
    rerender(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagemSemClasse} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Guerreiro'));
    fireEvent.click(screen.getByRole('button', { name: /^Escolher Classe$/i }));

    await waitFor(() => expect(addNucleo).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ nome: 'Guerreiro', classeId: 'c1' }),
    ));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ classes: ['c1'] }));
  });
});
