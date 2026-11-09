import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Formik } from 'formik';

import useIsMobile from 'hooks/useIsMobile';
import AtributoCard from './AtributoCard';

vi.mock('hooks/useIsMobile', () => ({ default: vi.fn() }));
// As calculadoras/prontidão têm testes próprios; aqui só importa abrir.
vi.mock('./ataque/CalculadoraAtaqueModal', () => ({
  default: ({ open, contexto }) => (open ? <div>Calculadora aberta: {contexto}</div> : null),
}));
vi.mock('./prontidao/ProntidaoModal', () => ({
  default: ({ open, tipo }) => (open ? <div>Prontidão aberta: {tipo}</div> : null),
}));

const renderCard = (label, onSubmit = vi.fn()) =>
  render(
    <Formik initialValues={{ base: 1, extra: 0, bonus: 0 }} onSubmit={onSubmit}>
      <AtributoCard
        label={label}
        total={1}
        baseName="base"
        extraName="extra"
        bonusName="bonus"
        personagem={{ id: 'p1' }}
      />
    </Formik>,
  );

describe('AtributoCard — atalhos do menu de contexto', () => {
  it('celular: o diálogo da gema traz a calculadora (sem botão direito no toque)', async () => {
    useIsMobile.mockReturnValue(true);
    renderCard('Defesa');

    fireEvent.click(screen.getByRole('button', { name: 'Defesa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculadora de Defesa' }));

    expect(screen.getByText('Calculadora aberta: defesa')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Configurar Defesa')).not.toBeInTheDocument());
  });

  it('desktop: o diálogo da gema também mostra os atalhos, e o botão direito continua', async () => {
    useIsMobile.mockReturnValue(false);
    renderCard('Ataque');

    fireEvent.click(screen.getByRole('button', { name: 'Ataque' }));
    expect(screen.getByText('Configurar Ataque')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculadora de Ataque' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('Configurar Ataque')).not.toBeInTheDocument());
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Ataque' }));
    expect(screen.getByRole('menuitem', { name: 'Calculadora de Ataque' })).toBeInTheDocument();
  });
});

describe('AtributoCard — atalho com edição pendente', () => {
  const editarBaseEAbrirAtalho = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Defesa' }));
    fireEvent.change(screen.getByLabelText('Base'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculadora de Defesa' }));
  };

  it('sem edição abre o atalho direto, sem perguntar', async () => {
    useIsMobile.mockReturnValue(true);
    renderCard('Defesa');
    fireEvent.click(screen.getByRole('button', { name: 'Defesa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Calculadora de Defesa' }));

    expect(screen.queryByText('Salvar alterações antes?')).not.toBeInTheDocument();
    expect(screen.getByText('Calculadora aberta: defesa')).toBeInTheDocument();
  });

  it('com edição pergunta e Salvar grava a ficha e abre o atalho', async () => {
    useIsMobile.mockReturnValue(true);
    const onSubmit = vi.fn();
    renderCard('Defesa', onSubmit);
    editarBaseEAbrirAtalho();

    expect(screen.getByText('Salvar alterações antes?')).toBeInTheDocument();
    expect(screen.queryByText('Calculadora aberta: defesa')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].base).toBe(7);
    expect(screen.getByText('Calculadora aberta: defesa')).toBeInTheDocument();
  });

  it('Descartar volta os valores e abre o atalho sem gravar', async () => {
    useIsMobile.mockReturnValue(true);
    const onSubmit = vi.fn();
    renderCard('Defesa', onSubmit);
    editarBaseEAbrirAtalho();

    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getByText('Calculadora aberta: defesa')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Defesa' }));
    expect(screen.getByLabelText('Base')).toHaveValue(1);
  });

  it('Cancelar fica no diálogo da gema, com a edição preservada', async () => {
    useIsMobile.mockReturnValue(true);
    renderCard('Defesa');
    editarBaseEAbrirAtalho();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('Salvar alterações antes?')).not.toBeInTheDocument());
    expect(screen.getByText('Configurar Defesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Base')).toHaveValue(7);
    expect(screen.queryByText('Calculadora aberta: defesa')).not.toBeInTheDocument();
  });
});
