import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const getFirestoreItemMock = vi.fn(() => Promise.resolve(null));

// Mock service/storage to avoid initializing real Firebase during import.
vi.mock('service/storage', () => ({
  getArtesPorUniverso: vi.fn(() => Promise.resolve([])),
  getFirestoreItem: getFirestoreItemMock,
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

  it('usa o rótulo e o nome do campo de categoria no seletor de arte/variante', async () => {
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

    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(document.querySelector('input[name="categoria"]')).not.toBeNull();
  });

  it('exibe o seletor de tipo de custo na criação autoral da variante', async () => {
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

    expect(screen.getByLabelText(/tipo de custo/i)).toBeInTheDocument();
    expect(document.querySelector('input[name="tipoCusto"]')).not.toBeNull();
  });

  it('expõe o nome do campo no seletor de categoria e tipo de custo para o Formik atualizar corretamente', async () => {
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

    expect(document.querySelector('input[name="categoria"]')).toBeTruthy();
    expect(document.querySelector('input[name="tipoCusto"]')).toBeTruthy();
  });

  it('não força Energia quando a habilidade de classe não traz tipo de custo', async () => {
    const { default: VarianteFormDialog } = await import('./VarianteFormDialog');
    const onSubmit = vi.fn();

    getFirestoreItemMock.mockResolvedValueOnce({
      id: 'c1',
      nome: 'Classe A',
      habilidadesBasicas: [{
        nome: 'Habilidade sem tipo',
        descricao: 'Sem classificação',
        acao: 'Imediata',
      }],
      habilidadesAvancadas: [],
    });

    render(
      <VarianteFormDialog
        open
        onClose={vi.fn()}
        personagem={{ classes: ['c1'], universo: 'u1' }}
        arts={[{ id: 'art-1', nome: 'Arte Base', dominio: 3, tipo: 'Ofensiva' }]}
        condicoes={[]}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: /habilidade de classe/i }));
    const botaoEscolher = await screen.findByRole('button', { name: /escolher/i });
    fireEvent.click(botaoEscolher);

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tipoCusto: '' }));
  });
});
