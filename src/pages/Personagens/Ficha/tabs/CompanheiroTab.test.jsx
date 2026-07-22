import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAuth } from 'context/AuthContext';
import { addPersonagem, getCompanheiros, getPersonagem } from 'service/storage';

import CompanheiroTab from './CompanheiroTab';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({
  getCompanheiros: vi.fn(),
  getPersonagem: vi.fn(),
  addPersonagem: vi.fn(),
}));

const personagem = { id: 'p1', universo: 'universo-1', nome: 'Herói' };

describe('CompanheiroTab', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-teste' } });
    getCompanheiros.mockResolvedValue([]);
    getPersonagem.mockResolvedValue(null);
    addPersonagem.mockResolvedValue('novo-companheiro-id');
  });

  it('cria um companheiro em branco e navega pra ficha dele', async () => {
    render(
      <MemoryRouter>
        <CompanheiroTab personagem={personagem} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /criar companheiro/i }));
    await screen.findByRole('dialog');
    fireEvent.change(screen.getByLabelText(/nome do companheiro/i), { target: { value: 'Lobo' } });
    fireEvent.click(screen.getByRole('button', { name: /criar em branco/i }));

    await waitFor(() =>
      expect(addPersonagem).toHaveBeenCalledWith(
        expect.objectContaining({ uid: 'uid-teste', nome: 'Lobo', companheiroDe: 'p1' }),
      ),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
