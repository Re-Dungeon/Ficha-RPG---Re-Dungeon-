import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock service/storage to avoid initializing real Firebase during import.
vi.mock('service/storage', () => ({
  getArtesPorUniverso: vi.fn(() => Promise.resolve([])),
  getFirestoreItem: vi.fn(() => Promise.resolve(null)),
}));

describe('VarianteFormDialog', () => {
  it('mostra as opções de criação por autoral, classe e catálogo', async () => {
    const { default: VarianteFormDialog } = await import('./VarianteFormDialog');

    render(
      <VarianteFormDialog
        open
        onClose={vi.fn()}
        personagem={{ classes: ['c1'], universo: 'u1' }}
        arts={[{ id: 'art-1', nome: 'Arte Base' }]}
        condicoes={[]}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: /variante autoral/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /habilidade de classe/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /catálogo/i })).toBeInTheDocument();
  });
});
