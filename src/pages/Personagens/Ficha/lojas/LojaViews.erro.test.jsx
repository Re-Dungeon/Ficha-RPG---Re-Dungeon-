import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LojaComprarView from './LojaComprarView';
import LojaVenderView from './LojaVenderView';

// O aviso ao jogador vem do `executar` do SavingContext (já coberto lá); estas
// views só precisam sobreviver à rejeição e deixar o diálogo fechar.
describe('Loja — falha ao gravar compra/venda', () => {
  it('Comprar: onComprar rejeita, sem erro solto, e o diálogo fecha', async () => {
    const onComprar = vi.fn().mockRejectedValue(new Error('offline'));
    render(
      <LojaComprarView
        personagem={{ universo: 'u1' }}
        catalogo={[{ id: 'i1', nome: 'Poção', precoCompra: 10, pesoUnitario: 0 }]}
        saldoRokmas={100}
        espacoLivre={10}
        posseComPorItemId={{}}
        onComprar={onComprar}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Comprar' }));
    const botoes = await screen.findAllByRole('button', { name: 'Comprar' });
    fireEvent.click(botoes.at(-1));

    await waitFor(() => expect(onComprar).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText('Comprar Item')).not.toBeInTheDocument());
  });

  it('Vender: onVender rejeita, sem erro solto, e o diálogo fecha', async () => {
    const onVender = vi.fn().mockRejectedValue(new Error('offline'));
    render(
      <LojaVenderView
        itensInventario={[{ id: 'x1', itemId: 'i1', nome: 'Poção', quantidade: 2 }]}
        catalogoPorId={new Map([['i1', { id: 'i1', precoVenda: 5 }]])}
        onVender={onVender}
        receitasInventario={[]}
        catalogoReceitasPorId={new Map()}
        onVenderReceita={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Vender' }));
    const botoes = await screen.findAllByRole('button', { name: 'Vender' });
    fireEvent.click(botoes.at(-1));

    await waitFor(() => expect(onVender).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText('Vender Item')).not.toBeInTheDocument());
  });
});
