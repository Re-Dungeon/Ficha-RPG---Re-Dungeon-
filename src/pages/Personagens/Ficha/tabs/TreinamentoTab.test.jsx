import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { SavingProvider } from 'context/SavingContext';
import * as formulas from 'common/utils/formulas';

import TreinamentoTab from './TreinamentoTab';

// Rolagens de dado são aleatórias (common/utils/formulas.test.js já cobre a fórmula
// em si com rolarDadoFn injetável) — aqui fixamos o resultado pra testar só a
// integração: o card certo abre, o botão dispara o save com o patch esperado.
vi.mock('common/utils/formulas', async importOriginal => {
  const real = await importOriginal();
  return {
    ...real,
    calcularResultadoTreino: vi.fn(() => ({
      rolagem: 5,
      obstaculo: 5,
      tier: 'sucesso',
      diferenca: 1,
      dadoXp: 8,
      rolagensXp: [8],
      xpGanho: 8,
    })),
  };
});

const personagem = {
  id: 'p1',
  atributosBase: { forca: 10, vitalidade: 10, agilidade: 10, inteligencia: 10, percepcao: 10, sorte: 10 },
  atributosExtra: {},
  atributosBonus: {},
  treinamento: {},
};

describe('TreinamentoTab — fluxo de treino', () => {
  it('abre o diálogo do atributo e salva o novo nível/xp ao concluir o treino', async () => {
    const onSave = vi.fn().mockResolvedValue();
    render(
      <SavingProvider>
        <TreinamentoTab personagem={personagem} onSave={onSave} />
      </SavingProvider>,
    );

    // PRIMARIOS_LABELS (constants.js) tem "forca" como primeira chave — a ordem de
    // inserção do objeto é preservada pelo Object.entries, então este é o card da Força.
    const [botaoTreinarForca] = screen.getAllByRole('button', { name: /^treinar$/i });
    fireEvent.click(botaoTreinarForca);

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /iniciar treinamento/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const patch = onSave.mock.calls[0][0];
    expect(patch.atributosBase.forca).toBe(10);
    expect(patch.treinamento.forca.xpAtual).toBe(8);
    expect(formulas.calcularResultadoTreino).toHaveBeenCalled();
  });
});
