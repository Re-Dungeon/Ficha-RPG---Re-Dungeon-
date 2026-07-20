import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AtributosTab from './AtributosTab';

const personagem = {
  id: 'p1',
  nome: 'Teste',
  atributosBase: { forca: 0, vitalidade: 0, agilidade: 0, inteligencia: 0, percepcao: 0, sorte: 0 },
  atributosExtra: {},
  atributosBonus: {},
  secundariosBase: {},
  secundariosExtra: {},
  secundariosBonus: {},
  status: {},
};

describe('AtributosTab — fluxo de edição', () => {
  it('recalcula o Total ao editar a Base de um atributo e salva o valor correto', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(<AtributosTab personagem={personagem} onSave={onSave} />);

    // Força é o primeiro atributo primário renderizado — primeiro campo "Base" no DOM.
    const camposBase = screen.getAllByLabelText('Base');
    fireEvent.change(camposBase[0], { target: { value: '50' } });

    expect(await screen.findByText('50')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0].atributosBase.forca).toBe(50);
  });
});
