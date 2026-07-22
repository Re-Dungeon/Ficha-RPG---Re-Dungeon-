import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
  addItemInventario,
  getItensInventario,
  getItensPorUniverso,
  getMateriaisInventario,
  getReceitasInventario,
} from 'service/storage';
import { SavingProvider } from 'context/SavingContext';
import InventarioTab from './InventarioTab';

vi.mock('service/storage', () => ({
  getItensInventario: vi.fn(),
  getItensPorUniverso: vi.fn(),
  addItemInventario: vi.fn(),
  updateItemInventario: vi.fn(),
  removeItemInventario: vi.fn(),
  getMateriaisInventario: vi.fn(),
  getMateriaisPorUniverso: vi.fn(),
  addMaterialInventario: vi.fn(),
  updateMaterialInventario: vi.fn(),
  removeMaterialInventario: vi.fn(),
  getReceitasInventario: vi.fn(),
  getReceitasPorUniverso: vi.fn(),
  addReceitaInventario: vi.fn(),
  updateReceitaInventario: vi.fn(),
  removeReceitaInventario: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  atributosBase: { forca: 20, vitalidade: 20 },
  atributosExtra: {},
  atributosBonus: {},
};

describe('InventarioTab — fluxo de adicionar item do catálogo', () => {
  beforeEach(() => {
    getItensInventario.mockResolvedValue([]);
    getItensPorUniverso.mockResolvedValue([
      { id: 'espada-curta', nome: 'Espada Curta', qualidade: 'Comum', pesoUnitario: 2 },
    ]);
    addItemInventario.mockResolvedValue();
    getMateriaisInventario.mockResolvedValue([]);
    getReceitasInventario.mockResolvedValue([]);
  });

  it('copia um item do catálogo pro inventário do personagem como uma cópia própria', async () => {
    const onSave = vi.fn();
    render(
      <SavingProvider>
        <InventarioTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    await waitFor(() => expect(getItensInventario).toHaveBeenCalledWith('p1'));

    fireEvent.click(screen.getByRole('button', { name: /\+ adicionar item/i }));
    fireEvent.click(await screen.findByRole('tab', { name: /catálogo/i }));
    fireEvent.click(await screen.findByRole('button', { name: /escolher/i }));
    fireEvent.click(screen.getByRole('button', { name: /^adicionar$/i }));

    await waitFor(() =>
      expect(addItemInventario).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({
          origem: 'catalogo',
          itemId: 'espada-curta',
          nome: 'Espada Curta',
          quantidade: 1,
          equipado: false,
          qualidade: 'Comum',
          pesoUnitario: 2,
        }),
      ),
    );
  });
});
