import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Personagens from './Personagens';
import { useAuth } from 'context/AuthContext';
import { useSelecao } from 'context/selecaoContext';
import { getFirestoreItem, getPersonagens } from 'service/storage';

vi.mock('context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('context/selecaoContext', () => ({ useSelecao: vi.fn() }));
vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn(),
  getPersonagens: vi.fn(),
}));

describe('Personagens', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ currentUser: { uid: 'uid-1' } });
    useSelecao.mockReturnValue({ limparPersonagem: vi.fn() });
    getFirestoreItem.mockImplementation(async (collectionName, id) => ({
      id,
      nome: `${collectionName} ${id}`,
    }));
  });

  it('classifica personagens, NPCs, criaturas e companheiros em abas separadas', async () => {
    getPersonagens.mockResolvedValue([
      { id: 'p1', uid: 'uid-1', nome: 'Herói', tipo: 'Personagem Jogável', universo: 'u1' },
      { id: 'p2', uid: 'uid-1', nome: 'Bandido', tipo: 'NPC', universo: 'u1' },
      { id: 'p3', uid: 'uid-1', nome: 'Golem', tipo: 'Criatura', universo: 'u1' },
      { id: 'c1', uid: 'uid-1', nome: 'Lobo', tipo: 'Personagem Jogável', companheiroDe: 'p1', universo: 'u1' },
      { id: 'c2', uid: 'uid-1', nome: 'Mago', tipo: 'NPC', companheiroDe: 'p2', universo: 'u1' },
    ]);

    render(
      <MemoryRouter initialEntries={['/personagens']}>
        <Routes>
          <Route path="/personagens" element={<Personagens />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Herói')).toBeInTheDocument());
    expect(screen.getByRole('tab', { name: 'Meus Personagens' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Meus NPCs' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Minhas Criaturas' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Companheiros' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Companheiros' }));
    await waitFor(() => expect(screen.getByText('Lobo')).toBeInTheDocument());
    expect(screen.queryByText('Herói')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Meus Personagens' }));
    await waitFor(() => expect(screen.getByText('Herói')).toBeInTheDocument());
    expect(screen.queryByText('Lobo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Meus NPCs' }));
    await waitFor(() => expect(screen.getByText('Bandido')).toBeInTheDocument());
    expect(screen.queryByText('Lobo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Minhas Criaturas' }));
    await waitFor(() => expect(screen.getByText('Golem')).toBeInTheDocument());
    expect(screen.queryByText('Lobo')).not.toBeInTheDocument();
  });

  it('mantém documentos antigos sem tipo em Personagem Jogável e não os classifica como companheiros', async () => {
    getPersonagens.mockResolvedValue([
      { id: 'legacy-p1', uid: 'uid-1', nome: 'Legado', universo: 'u1' },
      { id: 'legacy-c', uid: 'uid-1', nome: 'Companheiro antigo', companheiroDe: 'legacy-p1', universo: 'u1' },
    ]);

    render(
      <MemoryRouter initialEntries={['/personagens']}>
        <Routes>
          <Route path="/personagens" element={<Personagens />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Legado')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: 'Companheiros' }));
    await waitFor(() => expect(screen.getByText('Companheiro antigo')).toBeInTheDocument());
    expect(screen.queryByText('Legado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Meus Personagens' }));
    await waitFor(() => expect(screen.getByText('Legado')).toBeInTheDocument());
    expect(screen.queryByText('Companheiro antigo')).not.toBeInTheDocument();
  });
});
