import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NucleoViewDialog from './NucleoViewDialog';

describe('NucleoViewDialog', () => {
  it('quebra a linha do texto de bônus quando ele é longo', () => {
    render(
      <NucleoViewDialog
        open
        onClose={vi.fn()}
        onEditar={vi.fn()}
        nucleo={{
          nome: 'Núcleo da Tempestade',
          tipo: 'Elemento',
          bonus: 'Bônus com texto extremamente longo que precisa quebrar dentro do card sem ultrapassar os limites visuais da caixa',
          descricao: 'Descrição do núcleo',
        }}
      />,
    );

    const bonusText = screen.getByText(/Bônus com texto extremamente longo/i);

    expect(bonusText).toHaveStyle({
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
    });
  });
});
