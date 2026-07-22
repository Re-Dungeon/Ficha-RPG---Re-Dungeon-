import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getOrigensPorUniverso } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import ReputacaoModal from './ReputacaoModal';

vi.mock('service/storage', () => ({
  getOrigensPorUniverso: vi.fn(),
}));

const origem = { id: 'o1', nome: 'Cidade Livre', reputacao: { fama: [], terror: [] } };

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  reputacoes: {},
};

describe('ReputacaoModal', () => {
  beforeEach(() => {
    getOrigensPorUniverso.mockResolvedValue([origem]);
  });

  it('abre uma origem, ajusta a fama e salva', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <ReputacaoModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /cidade livre/i }));

    const campoFama = await screen.findByLabelText('Fama atual');
    fireEvent.change(campoFama, { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        reputacoes: { o1: { fama: 10, terror: 0 } },
      }),
    );
  });
});
