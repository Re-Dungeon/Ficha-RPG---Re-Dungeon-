import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getFirestoreItem, getRacasPorUniverso } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import RacaModal from './RacaModal';

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn(),
  getRacasPorUniverso: vi.fn(),
}));

const raca = { id: 'r1', nome: 'Elfo', raridade: 'Comum' };

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  raca: '',
  racaHabilidadesAtivas: [],
};

describe('RacaModal', () => {
  beforeEach(() => {
    getRacasPorUniverso.mockResolvedValue([raca]);
    getFirestoreItem.mockResolvedValue({ Nome: 'Re-Dungeon' });
  });

  it('escolhe uma raça e salva o id no personagem', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <RacaModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByText('Elfo'));
    fireEvent.click(screen.getByRole('button', { name: /^escolher$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ raca: 'r1', racaHabilidadesAtivas: [] }),
    );
  });
});
