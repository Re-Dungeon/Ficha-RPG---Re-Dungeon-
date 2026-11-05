import { describe, expect, it } from 'vitest';

import {
  converterPotencialEmDados,
  extrairBonusNumericoAtaque,
  extrairBonusNumericoDefesa,
  extrairBonusNumericoItem,
} from './ataque';

const validarResultadoMatematico = (potencialFinal, tipoDano, contexto = 'ataque') => {
  const resultado = converterPotencialEmDados(potencialFinal, tipoDano, Math.random, contexto);

  expect(resultado.potencialFinal).toBe(potencialFinal);
  expect(resultado.maximo).toBe(potencialFinal);
  expect(resultado.quantidadeDados).toBeGreaterThanOrEqual(0);
  expect(resultado.bonusFixo).toBeGreaterThanOrEqual(0);
  expect(resultado.minimo).toBeLessThanOrEqual(resultado.media);
  expect(resultado.media).toBeLessThanOrEqual(resultado.maximo);
  expect(resultado.maximo).toBeLessThanOrEqual(potencialFinal);
  expect(resultado.maximo).toBe(potencialFinal);
};

describe('extração de bônus numérico', () => {
  it('usa somente o campo dados da Art e ignora textos explicativos', () => {
    expect(extrairBonusNumericoAtaque({ dados: '3' }).valor).toBe(3);
    expect(extrairBonusNumericoAtaque({ dados: '2d6+3' }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ dados: '1d8' }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ dados: '', bonus: 4, extra: 2 }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ bonus: 4, extra: 2 }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ descricao: 'Ataque +5' }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ nome: 'Espada +7' }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ tipo: 'Arma 9' }).valor).toBe(0);
    expect(extrairBonusNumericoAtaque({ habilidadesEspeciais: [{ nome: 'Golpe Final', descricao: 'Dano +5' }] }).valor).toBe(0);
    expect(extrairBonusNumericoDefesa({ dados: '4' }).valor).toBe(4);
    expect(extrairBonusNumericoDefesa({ dados: '2d6+3' }).valor).toBe(0);
    expect(extrairBonusNumericoDefesa({ descricao: 'Defesa +5' }).valor).toBe(0);
  });

  it('preserva a lógica própria dos itens e respeita a soma de múltiplas Artes somente por dados numéricos', () => {
    const artes = [
      { dados: '2' },
      { dados: '3' },
      { dados: '2d6+3' },
      { dados: '1d8' },
      { descricao: 'Ataque +5' },
      { nome: 'Espada 7' },
    ];

    const total = artes.reduce((soma, arte) => soma + extrairBonusNumericoAtaque(arte).valor, 0);
    expect(total).toBe(5);
    expect(extrairBonusNumericoItem({ nome: 'Espada', dados: '3', extra: '9' }, 'ataque').valor).toBe(3);
    expect(extrairBonusNumericoItem({ nome: 'Espada', dados: '1d8', extra: '3' }, 'ataque').valor).toBe(0);
    expect(extrairBonusNumericoItem({ nome: 'Poção Mística', dados: '2d6+3', extra: 'Aumenta dano em 4' }, 'ataque').valor).toBe(0);
    expect(extrairBonusNumericoItem({ nome: 'Espada +7', extra: '7' }, 'ataque').valor).toBe(0);
    expect(extrairBonusNumericoItem({ descricao: 'Ataque +5' }, 'ataque').valor).toBe(0);
  });
});

describe('converterPotencialEmDados', () => {
  it('mantém o teto exato para cada perfil com potencial 40', () => {
    const esperados = {
      Contundente: '4d8+8',
      Cortante: '5d6+10',
      Perfurante: '1d20+20',
      Mágico: '8d4+8',
      Especial: '1d20+2d8+4',
    };

    Object.entries(esperados).forEach(([tipo, rollingEsperado]) => {
      const resultado = converterPotencialEmDados(40, tipo);
      expect(resultado.rolling).toBe(rollingEsperado);
      expect(resultado.maximo).toBe(40);
      expect(resultado.potencialFinal).toBe(40);
    });
  });

  it('gera expressões estáveis e diferentes conforme o tipo e o potencial', () => {
    const tipoContundente40 = converterPotencialEmDados(40, 'Contundente');
    const tipoContundente40Mesmo = converterPotencialEmDados(40, 'Contundente');
    const tipoCortante40 = converterPotencialEmDados(40, 'Cortante');
    const tipoPerfurante41 = converterPotencialEmDados(41, 'Perfurante');

    expect(tipoContundente40.rolling).toBe(tipoContundente40Mesmo.rolling);
    expect(tipoContundente40.rolling).not.toBe(tipoCortante40.rolling);
    expect(tipoPerfurante41.rolling).toBe('1d20+21');
  });

  it('valida as propriedades matemáticas para pequenos e grandes potenciais', () => {
    [0, 1, 2, 3, 5, 7, 9, 15, 20, 31, 35, 36, 40, 99, 100, 257, 1000].forEach(potencial => {
      ['Contundente', 'Cortante', 'Perfurante', 'Mágico', 'Especial'].forEach(tipo => {
        validarResultadoMatematico(potencial, tipo);
      });
    });
  });

  it('não gera dados ou expressão inválida para potenciais pequenos', () => {
    expect(converterPotencialEmDados(0, 'Contundente').rolling).toBe('0');
    expect(converterPotencialEmDados(3, 'Contundente').rolling).toBe('3');
    expect(converterPotencialEmDados(3, 'Mágico').rolling).toBe('3');
    expect(converterPotencialEmDados(5, 'Especial').rolling).toBe('5');
  });

  it('aplica os perfis defensivos com crescimento ilimitado e teto exato', () => {
    const esperados = {
      Contundente: { potencial: 22, rolling: '2d10+2' },
      Cortante: { potencial: 22, rolling: '3d6+4' },
      Perfurante: { potencial: 22, rolling: '1d20+2' },
      Mágico: { potencial: 22, rolling: '4d4+6' },
      Especial: { potencial: 22, rolling: '2d8+6' },
    };

    Object.entries(esperados).forEach(([tipo, item]) => {
      const resultado = converterPotencialEmDados(item.potencial, tipo, Math.random, 'defesa');
      expect(resultado.rolling).toBe(item.rolling);
      expect(resultado.maximo).toBe(item.potencial);
      expect(resultado.quantidadeDados).toBeGreaterThanOrEqual(0);
      expect(resultado.bonusFixo).toBeGreaterThanOrEqual(0);
    });

    expect(converterPotencialEmDados(548, 'Contundente', Math.random, 'defesa').rolling).toBe('49d10+58');
    expect(converterPotencialEmDados(548, 'Cortante', Math.random, 'defesa').rolling).toBe('73d6+110');
    expect(converterPotencialEmDados(548, 'Perfurante', Math.random, 'defesa').rolling).toBe('24d20+68');
    expect(converterPotencialEmDados(548, 'Mágico', Math.random, 'defesa').rolling).toBe('96d4+164');
    expect(converterPotencialEmDados(548, 'Especial', Math.random, 'defesa').rolling).toBe('48d8+164');

    expect(converterPotencialEmDados(1000, 'Contundente', Math.random, 'defesa').rolling).toBe('90d10+100');
    expect(converterPotencialEmDados(1000, 'Cortante', Math.random, 'defesa').rolling).toBe('133d6+202');
    expect(converterPotencialEmDados(1000, 'Perfurante', Math.random, 'defesa').rolling).toBe('45d20+100');
    expect(converterPotencialEmDados(1000, 'Mágico', Math.random, 'defesa').rolling).toBe('175d4+300');
    expect(converterPotencialEmDados(1000, 'Especial', Math.random, 'defesa').rolling).toBe('87d8+304');

    ['Contundente', 'Cortante', 'Perfurante', 'Mágico', 'Especial'].forEach(tipo => {
      validarResultadoMatematico(5, tipo, 'defesa');
      validarResultadoMatematico(22, tipo, 'defesa');
      validarResultadoMatematico(548, tipo, 'defesa');
      validarResultadoMatematico(1000, tipo, 'defesa');
    });
  });
});
