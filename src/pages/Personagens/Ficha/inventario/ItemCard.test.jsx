import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RolagemFichaContext } from 'context/RolagemFichaContext';
import ItemCard from './ItemCard';

vi.mock('service/storage', () => ({ addChatMensagem: vi.fn(), getRmCampanha: vi.fn() }));
vi.mock('context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'u1' } }),
}));

const renderCard = item =>
  render(
    <RolagemFichaContext.Provider
      value={{ personagem: { id: 'p1', nome: 'Aldric', campanhas: ['c1'] }, campanhaPreferida: null }}
    >
      <ItemCard
        item={{ id: 'i1', nome: 'Espada Longa', quantidade: 1, ...item }}
        onVer={vi.fn()}
        onEditar={vi.fn()}
        onEquipar={vi.fn()}
        onRemover={vi.fn()}
      />
    </RolagemFichaContext.Provider>,
  );

describe('ItemCard — Rolar', () => {
  it('mostra o botão Rolar quando o item tem dados', () => {
    renderCard({ dados: '1d8+2 cortante' });
    expect(screen.getByRole('button', { name: /Rolar 1d8\+2/ })).toBeInTheDocument();
  });

  it('não mostra o botão sem dados', () => {
    renderCard({});
    expect(screen.queryByRole('button', { name: /Rolar/ })).not.toBeInTheDocument();
  });

  it('não mostra o botão quando o texto de dados não tem dado válido', () => {
    renderCard({ dados: 'depende da arma' });
    expect(screen.queryByRole('button', { name: /Rolar/ })).not.toBeInTheDocument();
  });
});
