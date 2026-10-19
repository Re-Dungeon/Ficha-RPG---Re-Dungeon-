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

const renderCard = label =>
  render(
    <Formik initialValues={{ base: 1, extra: 0, bonus: 0 }} onSubmit={vi.fn()}>
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

  it('desktop: o diálogo da gema não mostra os atalhos (ficam no botão direito)', async () => {
    useIsMobile.mockReturnValue(false);
    renderCard('Ataque');

    fireEvent.click(screen.getByRole('button', { name: 'Ataque' }));
    expect(screen.getByText('Configurar Ataque')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Calculadora de Ataque' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByText('Configurar Ataque')).not.toBeInTheDocument());
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Ataque' }));
    expect(screen.getByRole('menuitem', { name: 'Calculadora de Ataque' })).toBeInTheDocument();
  });
});
