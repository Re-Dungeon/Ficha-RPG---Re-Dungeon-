import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import ArtCatalogoCard from './ArtCatalogoCard';

describe('ArtCatalogoCard', () => {
  it('renderiza o card no novo formato de habilidade para o catálogo', () => {
    render(
      <ArtCatalogoCard
        art={{
          nome: 'Lâmina de Fogo',
          descricao: 'Uma arte de combate explosiva.',
          tipoAcao: 'Ação',
          alcance: 'Curto',
          alvos: '1 alvo',
          custo: '2 PE',
          recarga: '1 rodada',
          dados: '1d6',
          duracao: 'Instantânea',
          imagem: 'https://example.com/lamina.png',
        }}
        disabled={false}
        onEscolher={vi.fn()}
      />,
    );

    expect(screen.getByTestId('catalogo-art-card')).toBeInTheDocument();
    expect(screen.getByText('Lâmina de Fogo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /escolher/i })).toBeInTheDocument();
  });
});
