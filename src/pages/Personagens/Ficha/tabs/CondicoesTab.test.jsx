import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getCondicoesPorUniverso } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import CondicoesTab from './CondicoesTab';

vi.mock('service/storage', () => ({
  getCondicoesPorUniverso: vi.fn(),
}));

const personagem = {
  id: 'p1',
  universo: 'universo-1',
  condicoesAtivas: [{ condicaoId: 'envenenado', stack: 1, duracaoRestante: 3, aplicadoEm: '2026-01-01' }],
};

describe('CondicoesTab — duração da condição', () => {
  beforeEach(() => {
    getCondicoesPorUniverso.mockResolvedValue([{ id: 'envenenado', nome: 'Envenenado' }]);
  });

  it('só salva a nova duração no blur, não a cada tecla digitada', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <CondicoesTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    const input = await screen.findByLabelText(/duração restante de envenenado/i);
    fireEvent.change(input, { target: { value: '5' } });
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.blur(input);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].condicoesAtivas[0].duracaoRestante).toBe(5);
  });

  it('não salva de novo no blur se o valor não mudou', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <CondicoesTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    const input = await screen.findByLabelText(/duração restante de envenenado/i);
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
  });
});
