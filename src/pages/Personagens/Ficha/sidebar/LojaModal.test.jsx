import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  getItensInventario,
  getItensPorUniverso,
  getReceitasInventario,
  getReceitasPorUniverso,
} from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import LojaModal from './LojaModal';

vi.mock('service/storage', () => ({
  getItensInventario: vi.fn(),
  getItensPorUniverso: vi.fn(),
  getReceitasInventario: vi.fn(),
  getReceitasPorUniverso: vi.fn(),
  addItemInventario: vi.fn(),
  updateItemInventario: vi.fn(),
  removeItemInventario: vi.fn(),
  updateReceitaInventario: vi.fn(),
  removeReceitaInventario: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  atributosBase: {},
  atributosExtra: {},
  atributosBonus: {},
  lojaRokmas: { saldoRokmas: 150, historicoCompras: [] },
};

describe('LojaModal', () => {
  beforeEach(() => {
    getItensInventario.mockResolvedValue([]);
    getItensPorUniverso.mockResolvedValue([]);
    getReceitasInventario.mockResolvedValue([]);
    getReceitasPorUniverso.mockResolvedValue([]);
  });

  it('define um novo saldo de Rokmas e salva', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <LojaModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /definir rokmas/i }));

    const campoSaldo = await screen.findByLabelText(/novo saldo de rokmas/i);
    fireEvent.change(campoSaldo, { target: { value: '300' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        lojaRokmas: { saldoRokmas: 300, historicoCompras: [] },
      }),
    );
  });
});
