import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SavingProvider } from 'context/SavingContext';
import InfoModal from './InfoModal';

vi.mock('service/storage', () => ({
  getFirestoreItem: vi.fn(),
  getOrigens: vi.fn().mockResolvedValue([]),
  getOrigensPorUniverso: vi.fn().mockResolvedValue([]),
  getRmCampanhasPorUniverso: vi.fn().mockResolvedValue([]),
  getUniverso: vi.fn().mockResolvedValue([{ id: 'universo-1', Nome: 'Re-Dungeon' }]),
  getCorposEspeciaisPorUniverso: vi.fn().mockResolvedValue([]),
}));

const personagemBase = {
  id: 'p1',
  nome: 'Herói',
  universo: 'universo-1',
  raca: '',
  classes: [],
  corpoEspecial: '',
  jogadorInfo: {
    background: 'História antiga em texto simples',
  },
};

describe('InfoModal / Background rich text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica o alinhamento escolhido ao inserir uma imagem no background', async () => {
    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagemBase} onSave={vi.fn()} />
      </SavingProvider>,
    );

    fireEvent.click(screen.getByRole('tab', { name: /background/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /inserir imagem/i })[0]);
    fireEvent.change(screen.getByLabelText(/URL da imagem/i), {
      target: { value: 'https://example.com/foto.jpg' },
    });

    fireEvent.mouseDown(screen.getByLabelText(/alinhamento/i));
    fireEvent.click(screen.getByRole('option', { name: /direita/i }));

    fireEvent.click(screen.getAllByRole('button', { name: /inserir imagem/i }).at(-1));

    await waitFor(() => expect(document.querySelector('.ProseMirror img')).toBeInTheDocument());
    expect(document.querySelector('.ProseMirror img').style.float).toBe('right');
  });

  it('mostra contador informativo e salva o conteúdo do background em formato rico', async () => {
    const onSave = vi.fn().mockResolvedValue();

    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagemBase} onSave={onSave} />
      </SavingProvider>,
    );

    fireEvent.click(screen.getByRole('tab', { name: /background/i }));

    expect(await screen.findByText(/caracteres.*palavras/i)).toBeInTheDocument();

    const editor = document.querySelector('.ProseMirror');
    expect(editor).not.toBeNull();

    fireEvent.input(editor, {
      target: { innerHTML: '<p>Herói de <strong>grande coragem</strong>.</p>' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].jogadorInfo.backgroundRich).toBeTruthy();
    expect(typeof onSave.mock.calls[0][0].jogadorInfo.backgroundRich).toBe('string');
  });

  it('carrega background antigo em texto simples sem perder o conteúdo', async () => {
    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagemBase} onSave={vi.fn()} />
      </SavingProvider>,
    );

    fireEvent.click(screen.getByRole('tab', { name: /background/i }));

    await waitFor(() => expect(screen.getByText(/História antiga em texto simples/i)).toBeInTheDocument());
  });

  it('exibe o editor expandido com cabeçalho refinado e ações do rodapé', async () => {
    render(
      <SavingProvider>
        <InfoModal open onClose={vi.fn()} personagem={personagemBase} onSave={vi.fn()} />
      </SavingProvider>,
    );

    fireEvent.click(screen.getByRole('tab', { name: /background/i }));

    fireEvent.click(screen.getByRole('button', { name: /expandir editor/i }));

    expect(await screen.findByText(/Editor Expandido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voltar ao modal/i })).toBeInTheDocument();
  });
});
