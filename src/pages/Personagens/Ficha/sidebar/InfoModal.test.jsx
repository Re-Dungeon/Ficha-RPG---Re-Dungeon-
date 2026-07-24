import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getCorposEspeciaisPorUniverso, getFirestoreItem, getOrigens, getUniverso } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import InfoModal from './InfoModal';

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn(),
  getOrigens: vi.fn(),
  getUniverso: vi.fn(),
  getCorposEspeciaisPorUniverso: vi.fn(),
}));

const personagem = {
  id: 'p1',
  nome: 'Herói',
  universo: 'universo-1',
  raca: '',
  classes: [],
  corpoEspecial: '',
};

describe('InfoModal / PerfilTab', () => {
  beforeEach(() => {
    getFirestoreItem.mockResolvedValue(null);
    getOrigens.mockResolvedValue([]);
    getUniverso.mockResolvedValue([{ id: 'universo-1', Nome: 'Re-Dungeon' }]);
    getCorposEspeciaisPorUniverso.mockResolvedValue([]);
  });

  it('salva o nome editado do personagem', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    const campoNome = await screen.findByLabelText('Nome do Personagem');
    fireEvent.change(campoNome, { target: { value: 'Herói Renomeado' } });

    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Herói Renomeado' })),
    );
  });

  it('escolhe um corpo especial do catálogo do universo', async () => {
    getCorposEspeciaisPorUniverso.mockResolvedValue([{ id: 'ce1', nome: 'Corpo Fênix' }]);
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Corpo Especial' }));

    fireEvent.click(await screen.findByRole('button', { name: /^escolher$/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ corpoEspecial: 'ce1' }));
  });
});
