import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getFirestoreItem, getReinosCultivo } from 'service/storage';
import { SavingProvider } from 'context/SavingContext';

import CultivoModal from './CultivoModal';

vi.mock('service/firebase', () => ({ auth: {}, db: {} }));

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn(),
  getReinosCultivo: vi.fn(),
}));

// Universo sem `SubUniversos`, mas com duas trilhas paralelas de Reinos
// (cada uma começa num Reino com `reinoAnterior` vazio).
const REINOS = [
  { id: 'b2', nome: 'Monstro', reinoAnterior: 'b1', subUniverso: '', quantidadeSubReinos: 3, experienciaPorSubReino: 10 },
  { id: 'a1', nome: 'Aspirante', reinoAnterior: '', subUniverso: '', quantidadeSubReinos: 3, experienciaPorSubReino: 10 },
  { id: 'b1', nome: 'Besta', reinoAnterior: '', subUniverso: '', quantidadeSubReinos: 3, experienciaPorSubReino: 10 },
  { id: 'a2', nome: 'Adormecido', reinoAnterior: 'a1', subUniverso: '', quantidadeSubReinos: 3, experienciaPorSubReino: 10 },
];

const renderModal = (personagem, onSave = vi.fn().mockResolvedValue()) => {
  render(
    <SavingProvider>
      <CultivoModal open onClose={vi.fn()} personagem={personagem} onSave={onSave} />
    </SavingProvider>,
  );
  return onSave;
};

describe('CultivoModal — trilhas paralelas sem SubUniversos', () => {
  beforeEach(() => {
    vi.mocked(getFirestoreItem).mockResolvedValue({ id: 'u1', Nome: 'Crônica' });
    vi.mocked(getReinosCultivo).mockResolvedValue(REINOS);
  });

  it('oferece cada trilha como um sistema e grava a progressão na chave do Reino raiz', async () => {
    const onSave = renderModal({ id: 'p1', universo: 'u1' });

    fireEvent.click(await screen.findByRole('button', { name: 'Escolher sistema de cultivo' }));
    expect(screen.getByRole('menuitem', { name: 'Aspirante' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Besta' }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ cultivo: { b1: { reinoId: '', xpAtual: 0 } } }),
    );
    expect(getReinosCultivo).toHaveBeenCalledWith('u1', '');
  });

  it('mostra uma aba por sistema iniciado e troca a trilha exibida sem misturar progressões', async () => {
    renderModal({
      id: 'p1',
      universo: 'u1',
      cultivo: { a1: { reinoId: 'a2', xpAtual: 5 }, b1: { reinoId: 'b1', xpAtual: 0 } },
    });

    expect(await screen.findByRole('tab', { name: 'Aspirante' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Adormecido' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Besta' }));
    expect(await screen.findByRole('heading', { name: 'Besta' })).toBeInTheDocument();
    expect(screen.getByText('Monstro', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Adormecido' })).not.toBeInTheDocument();
  });

  it('migra o progresso legado de `principal` pra trilha que contém o Reino salvo', async () => {
    renderModal({ id: 'p1', universo: 'u1', cultivo: { principal: { reinoId: 'b2', xpAtual: 7 } } });

    expect(await screen.findByRole('tab', { name: 'Besta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Aspirante' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Monstro' })).toBeInTheDocument();
  });
});
