import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { addHistoricoSorte, getHistoricoSorte } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';
import * as formulas from 'common/utils/formulas';

import SorteTab from './SorteTab';

vi.mock('service/storage', () => ({
  getHistoricoSorte: vi.fn(),
  addHistoricoSorte: vi.fn(),
}));

// Rolagem de dado é aleatória por natureza (coberta com rolarDadoFn injetável em
// formulas.test.js) — aqui fixamos o resultado pra testar só a integração do save.
vi.mock('common/utils/formulas', async importOriginal => {
  const real = await importOriginal();
  return {
    ...real,
    calcularRolagemFortuna: vi.fn(() => ({
      quantidadeDados: 1,
      rolagens: [4],
      somaDados: 4,
      bonusBase: 1,
      resultado: 5,
    })),
  };
});

const personagem = {
  id: 'p1',
  atributosBase: { sorte: 10 },
  atributosExtra: {},
  atributosBonus: {},
  sorte: { fortunaAtual: 20, ultimaRolagemData: '' },
};

describe('SorteTab', () => {
  it('rola a fortuna, salva o novo saldo e registra o evento no histórico', async () => {
    getHistoricoSorte.mockResolvedValue([]);
    addHistoricoSorte.mockResolvedValue();
    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <SorteTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /rolar fortuna/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ sorte: expect.objectContaining({ fortunaAtual: 25 }) }),
      ),
    );
    await waitFor(() =>
      expect(addHistoricoSorte).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ tipo: 'rolagem_fortuna', valor: 5 }),
      ),
    );
    expect(formulas.calcularRolagemFortuna).toHaveBeenCalled();
  });
});
