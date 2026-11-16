import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { getItensInventario } from 'service/storage';

import ProntidaoModal from './ProntidaoModal';

vi.mock('service/storage', () => ({
  getItensInventario: vi.fn(),
  removeItemInventario: vi.fn(),
  updateItemInventario: vi.fn(),
}));

const personagem = { id: 'p1', nome: 'Teste' };

describe('ProntidaoModal — leitura do inventário', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getItensInventario).mockResolvedValue([]);
  });

  it('o modal de mecânicas (tipo "info") não lê o inventário', async () => {
    render(
      <ProntidaoModal open onClose={vi.fn()} personagem={personagem} prontidaoValor={20} tipo="info" />,
    );

    await screen.findByRole('dialog', { name: /mecânicas de prontidão/i });
    expect(getItensInventario).not.toHaveBeenCalled();
  });

  it('a Central de Ações lê o inventário do personagem ao abrir', async () => {
    render(
      <ProntidaoModal
        open
        onClose={vi.fn()}
        personagem={personagem}
        onSave={vi.fn()}
        prontidaoValor={20}
        tipo="central"
      />,
    );

    await screen.findByRole('dialog', { name: /central de ações/i });
    await waitFor(() => expect(getItensInventario).toHaveBeenCalledWith('p1'));
  });
});
