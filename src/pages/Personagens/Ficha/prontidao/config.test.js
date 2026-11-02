import { describe, expect, it } from 'vitest';

import {
  criarRegistroHistorico,
  estadoDoNovoTurno,
  normalizarEstadoCombate,
  prontidaoMaximaDaFicha,
} from './config';

describe('estadoDoNovoTurno', () => {
  const ppMaximo = 40;
  const base = normalizarEstadoCombate(
    {
      id: 'p1',
      estadoCombate: {
        turno: 3,
        ppAtual: 5,
        recuperacaoUtilizada: true,
        descansando: true,
        historicoAcoes: Array.from({ length: 12 }, (_, i) => ({ id: `h${i}`, turno: 3 })),
        acaoExtra: { status: 'pendente', turno: 3, usosRestantes: 1, custoPago: 8 },
      },
    },
    ppMaximo,
  );

  it('turno +1, PP cheio, recuperação/descanso liberados e Ação Extra expirada', () => {
    const proximo = estadoDoNovoTurno(base, ppMaximo);
    expect(proximo).toMatchObject({
      turno: 4,
      ppAtual: 40,
      recuperacaoUtilizada: false,
      descansando: false,
      acaoExtra: { status: 'expirado', usosRestantes: 0, custoPago: 8 },
    });
    expect(proximo.historicoAcoes).toHaveLength(12);
    expect(proximo.historicoAcoes[0]).toMatchObject({
      nome: 'Prontidão restaurada',
      custo: '0 PP',
      turno: 'Turno 4',
      restante: 40,
    });
    expect(proximo.historicoAcoes[0].id).toMatch(/^turno-/);
    expect(proximo.historicoAcoes[1].id).toBe('h0');
  });

  it('sem Ação Extra pendente, mantém a que existe (ou null)', () => {
    const usada = { ...base, acaoExtra: { status: 'usado', usosRestantes: 0 } };
    expect(estadoDoNovoTurno(usada, 10).acaoExtra).toEqual({
      status: 'usado',
      usosRestantes: 0,
    });
    expect(estadoDoNovoTurno({ turno: 1, historicoAcoes: [] }, 10).acaoExtra).toBeNull();
  });
});

describe('criarRegistroHistorico', () => {
  it('monta a linha com o turno em texto', () => {
    expect(criarRegistroHistorico('Atacar', '-3 PP', 2, 7)).toMatchObject({
      nome: 'Atacar',
      custo: '-3 PP',
      turno: 'Turno 2',
      restante: 7,
      id: expect.stringMatching(/^acao-/),
    });
  });
});

describe('prontidaoMaximaDaFicha', () => {
  it('usa o total salvo da Prontidão, depois a máxima efetiva; senão 0', () => {
    expect(
      prontidaoMaximaDaFicha({
        secundariosTotais: { prontidao: '57' },
        prontidaoMaximaEfetiva: 30,
      }),
    ).toBe(57);
    expect(prontidaoMaximaDaFicha({ prontidaoMaximaEfetiva: 30 })).toBe(30);
    expect(prontidaoMaximaDaFicha({})).toBe(0);
    expect(prontidaoMaximaDaFicha(null)).toBe(0);
  });
});
