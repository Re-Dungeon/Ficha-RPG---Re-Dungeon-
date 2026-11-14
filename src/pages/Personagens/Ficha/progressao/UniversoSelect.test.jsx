import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import UniversoSelect from './UniversoSelect';

vi.mock('service/storage', () => ({
  getUniverso: vi.fn(),
}));

const { getUniverso } = await import('service/storage');

describe('UniversoSelect', () => {
  it('mantém o universo atual inativo visível e oculta outros inativos, mas permite trocar para ativos', async () => {
    getUniverso.mockResolvedValue([
      { id: 'u-inativo', Nome: 'Solaris', ativo: false },
      { id: 'u-ativo-1', Nome: 'Aurelia', ativo: true },
      { id: 'u-ativo-2', Nome: 'Vera', ativo: true },
      { id: 'u-2-inativo', Nome: 'Nyx', ativo: false },
    ]);

    const onSave = vi.fn();

    render(<UniversoSelect personagem={{ universo: 'u-inativo' }} onSave={onSave} />);

    const input = await screen.findByRole('combobox', { name: /universo/i });
    await waitFor(() => expect(input).toHaveValue('Solaris'));

    fireEvent.focus(input);
    const listbox = await screen.findByRole('listbox');

    expect(within(listbox).getByText('Solaris')).toBeInTheDocument();
    expect(within(listbox).getByText('Aurelia')).toBeInTheDocument();
    expect(within(listbox).getByText('Vera')).toBeInTheDocument();
    expect(within(listbox).queryByText('Nyx')).not.toBeInTheDocument();

    fireEvent.click(within(listbox).getByText('Aurelia'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ universo: 'u-ativo-1', raca: '', racaHabilidadesAtivas: [], classes: [] }),
    );
  });
});
