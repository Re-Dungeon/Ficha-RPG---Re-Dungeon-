import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import { addPersonagem, getUniverso } from 'service/storage';
import NovoPersonagem from './NovoPersonagem';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({ addPersonagem: vi.fn(), getUniverso: vi.fn() }));

describe('NovoPersonagem — fluxo de criação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-teste' } });
    addPersonagem.mockResolvedValue('novo-id-123');
    getUniverso.mockResolvedValue([{ id: 'universo-1', Nome: 'Re-Dungeon' }]);
  });

  it('cria o personagem com o uid do usuário logado e navega para a ficha recém-criada', async () => {
    render(
      <MemoryRouter initialEntries={['/personagens/novo']}>
        <Routes>
          <Route path="/personagens/novo" element={<NovoPersonagem />} />
          <Route path="/personagens/:id" element={<div>Ficha aberta</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nome do personagem/i), {
      target: { value: 'Aldric' },
    });

    fireEvent.mouseDown(screen.getByLabelText(/^universo$/i));
    fireEvent.click(await within(screen.getByRole('listbox')).findByText('Re-Dungeon'));

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(addPersonagem).toHaveBeenCalledWith({
        uid: 'uid-teste',
        nome: 'Aldric',
        universo: 'universo-1',
      }),
    );
    await screen.findByText('Ficha aberta');
  });

  it('exige que um universo seja selecionado antes de salvar', async () => {
    render(
      <MemoryRouter initialEntries={['/personagens/novo']}>
        <Routes>
          <Route path="/personagens/novo" element={<NovoPersonagem />} />
          <Route path="/personagens/:id" element={<div>Ficha aberta</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nome do personagem/i), {
      target: { value: 'Aldric' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await screen.findByText(/universo é obrigatório/i);
    expect(addPersonagem).not.toHaveBeenCalled();
  });
});
