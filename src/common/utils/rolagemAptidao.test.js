import { describe, expect, it } from 'vitest';

import { preparar } from 'common/utils/gridRolagem';

import {
  ROTULO_MAX,
  interpretarModificador,
  montarRolagemAptidao,
  previaRolagemAptidao,
} from './rolagemAptidao';

// randomUint32 que sempre cai na face 4 de um d6 (valor % 6 + 1 = 4).
const sempreQuatro = () => 3;

describe('interpretarModificador', () => {
  it('vazio é sem modificador', () => {
    expect(interpretarModificador('')).toEqual({ termos: [], texto: '' });
    expect(interpretarModificador('   ')).toEqual({ termos: [], texto: '' });
  });

  it('aceita várias entradas e completa o sinal do primeiro termo', () => {
    expect(interpretarModificador('1d4+5-7').texto).toBe('+1d4+5-7');
    expect(interpretarModificador('2').texto).toBe('+2');
    expect(interpretarModificador('-3').texto).toBe('-3');
    expect(interpretarModificador('-1d6').texto).toBe('-1d6');
    expect(interpretarModificador(' + d8 - 2 ').texto).toBe('+1d8-2');
  });

  it('recusa número acima de 99, mais de 10 dados, faces estranhas e lixo', () => {
    expect(interpretarModificador('+100').erro).toMatch(/99/);
    expect(interpretarModificador('+99').erro).toBeUndefined();
    expect(interpretarModificador('6d4+5d6').erro).toMatch(/10 dados/);
    expect(interpretarModificador('1d7').erro).toMatch(/Dados permitidos/);
    expect(interpretarModificador('abc').erro).toMatch(/Não entendi/);
    expect(interpretarModificador('1d4d6').erro).toMatch(/Falta \+ ou -/);
  });
});

describe('previaRolagemAptidao', () => {
  it('monta 1d6 + bônus, com o dado da sorte separado', () => {
    expect(previaRolagemAptidao({ bonus: 3 }).expressao).toBe('1d6+3');
    expect(previaRolagemAptidao({ bonus: 0 }).expressao).toBe('1d6');
    expect(previaRolagemAptidao({ bonus: 3, sorte: true, modificador: '1d4-1d6-2' }).expressao).toBe(
      '1d6+1d6+3+1d4-1d6-2',
    );
  });

  it('acusa o limite de grupos do chat antes de rolar', () => {
    const muitos = Array.from({ length: 9 }, () => '+1d4').join('');
    expect(previaRolagemAptidao({ sorte: true, modificador: muitos }).erro).toMatch(/grupos/);
  });
});

describe('montarRolagemAptidao', () => {
  it('sem modificador: expressão válida e rótulo simples', () => {
    const resultado = montarRolagemAptidao({ nome: 'Furtividade', bonus: 2 });
    expect(resultado).toEqual({ expressao: '1d6+2', rotulo: 'Aptidão: Furtividade' });
    expect(preparar(resultado.expressao).erro).toBeUndefined();
  });

  it('com sorte e mestre: rótulo cita os dois', () => {
    const resultado = montarRolagemAptidao({
      nome: 'Furtividade',
      bonus: 3,
      sorte: true,
      modificador: '1d4-2',
    });
    expect(resultado.expressao).toBe('1d6+1d6+3+1d4-2');
    expect(resultado.rotulo).toBe('Aptidão: Furtividade (🍀 Sorte, mestre +1d4-2)');
  });

  it('dado negativo do mestre é rolado no envio e vira número', () => {
    const resultado = montarRolagemAptidao(
      { nome: 'Atletismo', bonus: 1, modificador: '-2d6+5' },
      sempreQuatro,
    );
    expect(resultado.expressao).toBe('1d6+1-8+5');
    expect(resultado.rotulo).toBe('Aptidão: Atletismo (mestre -2d6[4,4]+5)');
    expect(preparar(resultado.expressao).erro).toBeUndefined();
  });

  it('modificador inválido devolve erro', () => {
    expect(montarRolagemAptidao({ nome: 'X', modificador: '+150' }).erro).toMatch(/99/);
  });

  it('corta o nome para o rótulo caber em 100 caracteres', () => {
    const resultado = montarRolagemAptidao({ nome: 'N'.repeat(150), sorte: true, modificador: '1d4' });
    expect(resultado.rotulo.length).toBeLessThanOrEqual(ROTULO_MAX);
    expect(resultado.rotulo).toMatch(/… \(🍀 Sorte, mestre \+1d4\)$/);
  });
});
