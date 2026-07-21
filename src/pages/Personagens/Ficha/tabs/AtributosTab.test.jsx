import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { SavingProvider } from 'context/SavingContext';

import AtributosTab from './AtributosTab';

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn().mockResolvedValue(null),
}));

const renderComProvider = ui => render(<SavingProvider>{ui}</SavingProvider>);

const personagem = {
  id: 'p1',
  nome: 'Teste',
  atributosBase: { forca: 0, vitalidade: 0, agilidade: 0, inteligencia: 0, percepcao: 0, sorte: 0 },
  atributosExtra: {},
  atributosBonus: {},
  secundariosBase: {},
  secundariosExtra: {},
  secundariosBonus: {},
  status: {},
};

describe('AtributosTab — fluxo de edição', () => {
  it('abre a modal do atributo, recalcula o Total ao editar a Base e salva o valor correto', async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    const gemaForca = screen.getByRole('button', { name: /força/i });
    fireEvent.click(gemaForca);

    const dialog = await screen.findByRole('dialog', { name: /configurar força/i });
    fireEvent.change(within(dialog).getByLabelText('Base'), { target: { value: '50' } });

    // Dialog aberto deixa o resto da página aria-hidden, então reconsulta por role
    // não encontraria a gema — reusa a referência já capturada e olha só o texto.
    await waitFor(() => expect(within(gemaForca).getByText('50')).toBeInTheDocument());

    fireEvent.click(within(dialog).getByRole('button', { name: /salvar/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].atributosBase.forca).toBe(50);
  });

  it('descarta as edições da modal ao clicar em Cancelar', async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderComProvider(<AtributosTab personagem={personagem} onSave={onSave} onExcluir={vi.fn()} />);

    const gemaForca = screen.getByRole('button', { name: /força/i });
    fireEvent.click(gemaForca);
    const dialog = await screen.findByRole('dialog', { name: /configurar força/i });
    fireEvent.change(within(dialog).getByLabelText('Base'), { target: { value: '50' } });
    await waitFor(() => expect(within(gemaForca).getByText('50')).toBeInTheDocument());

    fireEvent.click(within(dialog).getByRole('button', { name: /cancelar/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.click(gemaForca);
    const dialogReaberto = await screen.findByRole('dialog', { name: /configurar força/i });
    expect(within(dialogReaberto).getByLabelText('Base')).toHaveValue(0);
  });
});
