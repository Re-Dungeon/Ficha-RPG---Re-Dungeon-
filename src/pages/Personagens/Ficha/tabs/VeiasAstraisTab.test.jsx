import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getDivindades, getVeiasAstraisPorUniverso } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import VeiasAstraisTab from './VeiasAstraisTab';

vi.mock('service/storage', () => ({
  getDivindades: vi.fn(),
  getVeiasAstraisPorUniverso: vi.fn(),
}));

const divindade = { id: 'd1', nome: 'Solara' };
const veia = { id: 'v1', divindade: 'd1', parentId: null, custo: 5, camada: 1 };

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  atributosBase: { forca: 10, vitalidade: 10, agilidade: 10, inteligencia: 10, percepcao: 10, sorte: 10 },
  atributosExtra: {},
  atributosBonus: {},
  secundariosBase: {},
  secundariosExtra: {},
  secundariosBonus: {},
  veiasAstrais: { powerCombatGasto: 5, nosDesbloqueados: ['v1'] },
};

describe('VeiasAstraisTab', () => {
  beforeEach(() => {
    getDivindades.mockResolvedValue([divindade]);
    getVeiasAstraisPorUniverso.mockResolvedValue([veia]);
  });

  it('bloqueia todas as veias desbloqueadas e devolve o PC gasto', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <VeiasAstraisTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /bloquear todas as veias/i }));
    fireEvent.click(await screen.findByRole('button', { name: /^bloquear todas$/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        veiasAstrais: { powerCombatGasto: 0, nosDesbloqueados: [] },
      }),
    );
  });

  it('abre a árvore de constelação ao clicar numa divindade', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <VeiasAstraisTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /solara/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
