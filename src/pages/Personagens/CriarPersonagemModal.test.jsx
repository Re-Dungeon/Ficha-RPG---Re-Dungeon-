import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAuth } from 'context/AuthContext';
import { addPersonagem, getUniverso } from 'service/storage';
import CriarPersonagemModal from './CriarPersonagemModal';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('service/storage', () => ({
  addPersonagem: vi.fn(),
  getUniverso: vi.fn(),
}));
vi.mock('hooks/useCampanhasPorUniverso', () => ({
  useCampanhasPorUniverso: () => [],
}));

describe('CriarPersonagemModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-teste' } });
    addPersonagem.mockResolvedValue('novo-id-123');
    getUniverso.mockResolvedValue([
      { id: 'u1', Nome: 'Abyssal' },
      { id: 'u2', Nome: 'Astral' },
      { id: 'u3', Nome: 'Dread' },
    ]);
  });

  it('permite pesquisar universos pelo nome dentro da lista do modal', async () => {
    render(
      <CriarPersonagemModal open onClose={vi.fn()} onCreated={vi.fn()} />,
    );

    const input = await screen.findByRole('combobox', { name: /universo/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'astr' } });

    await waitFor(() => expect(screen.getByText('Astral')).toBeInTheDocument());
    expect(screen.queryByText('Abyssal')).not.toBeInTheDocument();
    expect(screen.queryByText('Dread')).not.toBeInTheDocument();
  });

  it('mantém a seleção após a busca e cria a ficha com o universo correto', async () => {
    const onCreated = vi.fn();
    render(
      <CriarPersonagemModal open onClose={vi.fn()} onCreated={onCreated} />,
    );

    const input = await screen.findByRole('combobox', { name: /universo/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'aby' } });
    fireEvent.click(await screen.findByText('Abyssal'));

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Aria' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(addPersonagem).toHaveBeenCalledWith({
        uid: 'uid-teste',
        nome: 'Aria',
        universo: 'u1',
        tipo: 'Personagem Jogável',
        campanhas: [],
      }),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
  });
});
