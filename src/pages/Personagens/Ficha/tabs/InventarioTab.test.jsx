import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getItensPorUniverso } from 'service/storage';
import InventarioTab from './InventarioTab';

vi.mock('service/storage', () => ({
  getItensPorUniverso: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  atributosBase: { forca: 20, vitalidade: 20 },
  atributosExtra: {},
  atributosBonus: {},
  inventario: [],
};

describe('InventarioTab — fluxo de adicionar item', () => {
  beforeEach(() => {
    getItensPorUniverso.mockResolvedValue([
      { id: 'espada-curta', Nome: 'Espada Curta', qualidade: 'Comum', espaco: 2 },
    ]);
  });

  it('adiciona um item do catálogo ao inventário do personagem', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<InventarioTab personagem={personagem} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /\+ adicionar item/i }));
    fireEvent.click(await screen.findByRole('button', { name: /escolher/i }));
    fireEvent.click(screen.getByRole('button', { name: /^adicionar$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        inventario: [{ itemId: 'espada-curta', quantidade: 1, equipado: false }],
      }),
    );
  });
});
