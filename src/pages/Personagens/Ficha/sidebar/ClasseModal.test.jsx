import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { addNucleo, getClassesPorUniverso, getFirestoreItem, getNucleos } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import ClasseModal from './ClasseModal';

vi.mock('service/storage', () => ({
  getClassesPorUniverso: vi.fn(),
  getFirestoreItem: vi.fn(),
  getNucleos: vi.fn(),
  addNucleo: vi.fn(),
  addArt: vi.fn(),
}));

const classe = { id: 'c1', nome: 'Guerreiro', raridade: 'Comum' };

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
    getClassesPorUniverso.mockResolvedValue([classe]);
    getFirestoreItem.mockResolvedValue({ Nome: 'Re-Dungeon' });
    getNucleos.mockResolvedValue([]);
    addNucleo.mockResolvedValue({ id: 'n1' });
  });

  it('escolhe uma classe, cria o núcleo dela e salva a lista atualizada', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <ClasseModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Guerreiro'));
    fireEvent.click(screen.getByRole('button', { name: /^escolher$/i }));

    await waitFor(() =>
      expect(addNucleo).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ nome: 'Guerreiro', classeId: 'c1' }),
      ),
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ classes: ['c1'] }));
  });
});
