import { describe, expect, it } from 'vitest';

import {
  calcularBonusCultivoTotal,
  calcularPrimariosTotais,
  calcularSecundarios,
} from 'common/utils/formulas';
import { reacaoDaFicha } from 'common/utils/gridCombate';

// Só no site dos jogadores (o Re:Master não tem formulas.js) — por isso fica
// fora do gridCombate.test.js, que é cópia compartilhada.
describe('reacaoDaFicha × formulas da ficha', () => {
  it('bate com calcularSecundarios da ficha', () => {
    const ficha = {
      atributosBase: {
        forca: 10,
        vitalidade: 20,
        agilidade: 87,
        inteligencia: 5,
        percepcao: 61,
        sorte: 33,
      },
      atributosExtra: { agilidade: 13, percepcao: 4 },
      atributosBonus: { sorte: 7 },
      secundariosBase: { reacao: 2 },
      secundariosExtra: { reacao: 1 },
      secundariosBonus: {},
      cultivoBonus: { primarios: { percepcao: { r1: 9 } }, secundarios: { reacao: 3 } },
    };
    const cultivo = calcularBonusCultivoTotal(ficha.cultivoBonus);
    const primarios = calcularPrimariosTotais(
      ficha.atributosBase,
      ficha.atributosExtra,
      ficha.atributosBonus,
      cultivo.primarios,
    );
    const esperado = calcularSecundarios(
      primarios,
      ficha.secundariosBase,
      ficha.secundariosExtra,
      ficha.secundariosBonus,
      cultivo.secundarios,
    ).reacao;
    expect(reacaoDaFicha(ficha)).toBe(esperado);
  });
});
