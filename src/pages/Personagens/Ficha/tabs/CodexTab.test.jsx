import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getRegrasPorUniverso } from 'service/storage';

import CodexTab from './CodexTab';

vi.mock('service/storage', () => ({
  getRegrasPorUniverso: vi.fn(),
}));

describe('CodexTab', () => {
  it('mostra o aviso de selecionar universo quando o personagem não tem um', () => {
    render(<CodexTab personagem={{ id: 'p1', universo: '' }} />);
    expect(screen.getByText(/selecione um universo/i)).toBeInTheDocument();
    expect(getRegrasPorUniverso).not.toHaveBeenCalled();
  });

  it('carrega e expande uma regra do universo mostrando seu conteúdo', async () => {
    getRegrasPorUniverso.mockResolvedValue([
      {
        id: 'r1',
        nome: 'Vantagem',
        descricaoCurta: 'Resumo curto',
        comoFunciona: 'Explicação detalhada de como funciona.',
      },
    ]);

    render(<CodexTab personagem={{ id: 'p1', universo: 'universo-1' }} />);

    await waitFor(() => expect(getRegrasPorUniverso).toHaveBeenCalledWith('universo-1'));

    const cabecalho = await screen.findByRole('button', { name: /vantagem/i });
    fireEvent.click(cabecalho);

    expect(await screen.findByText('Explicação detalhada de como funciona.')).toBeInTheDocument();
  });
});
