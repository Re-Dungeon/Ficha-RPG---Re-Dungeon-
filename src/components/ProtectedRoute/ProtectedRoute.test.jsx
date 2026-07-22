import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useAuth } from 'context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

vi.mock('context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderWithRoute = () =>
  render(
    <MemoryRouter initialEntries={['/personagens']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/personagens" element={<div>Meus Personagens</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  it('redireciona para /login quando não há usuário autenticado', () => {
    useAuth.mockReturnValue({ currentUser: null, loading: false });

    renderWithRoute();

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renderiza a rota filha quando há usuário autenticado', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'abc' }, loading: false });

    renderWithRoute();

    expect(screen.getByText('Meus Personagens')).toBeInTheDocument();
  });
});
