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

describe('CondicoesTab — acúmulos', () => {
  beforeEach(() => {
    getCondicoesPorUniverso.mockResolvedValue([{ id: 'envenenado', nome: 'Envenenado' }]);
  });

  it('−1 acúmulo tira só um, sem confirmação', async () => {
    const onSave = vi.fn().mockResolvedValue();
    const comAcumulo = {
      ...personagem,
      condicoesAtivas: [{ ...personagem.condicoesAtivas[0], stack: 3 }],
    };
    render(
      <SavingProvider>
        <CondicoesTab personagem={comAcumulo} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Tirar um acúmulo de Envenenado' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].condicoesAtivas[0].stack).toBe(2);
  });

  it('com um acúmulo só, não mostra o −1', async () => {
    render(
      <SavingProvider>
        <CondicoesTab personagem={personagem} onSave={vi.fn()} />
      </SavingProvider>,
    );
    await screen.findByRole('button', { name: 'Remover Envenenado' });
    expect(screen.queryByRole('button', { name: /tirar um acúmulo/i })).not.toBeInTheDocument();
  });
});

describe('CondicoesTab — remover', () => {
  beforeEach(() => {
    getCondicoesPorUniverso.mockResolvedValue([{ id: 'envenenado', nome: 'Envenenado' }]);
  });

  it('pede confirmação antes de remover; Cancelar não grava', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <CondicoesTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Remover Envenenado' }));
    expect(await screen.findByText('Remover Envenenado?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('Remover Envenenado?')).not.toBeInTheDocument());
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Remover Envenenado' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Remover' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ condicoesAtivas: [] }));
  });
});
