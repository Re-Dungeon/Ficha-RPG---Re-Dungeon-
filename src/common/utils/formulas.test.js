import { describe, expect, it } from 'vitest';
import {
  aplicarXpTreino,
  calcularBonusPorSorte,
  calcularCustoDesbloqueio,
  calcularEspacoInventario,
  calcularLimiteArts,
  calcularLimiteHabilidadesBasicas,
  calcularMaximoAptidoes,
  calcularObstaculoTreino,
  calcularPcDisponivel,
  calcularPowerCombat,
  calcularPrimariosTotais,
  calcularProximoAptidaoEm,
  calcularResultadoTreino,
  calcularRolagemFortuna,
  calcularSecundarios,
  calcularStatusMaximos,
  calcularXpNecessario,
  podeRolarFortunaHoje,
  reorganizarArts,
} from './formulas';

describe('calcularPrimariosTotais', () => {
  it('soma base + extra + bônus de cada atributo primário', () => {
    const totais = calcularPrimariosTotais(
      { forca: 10, vitalidade: 5 },
      { forca: 2 },
      { vitalidade: 1 },
    );

    expect(totais).toEqual({
      forca: 12,
      vitalidade: 6,
      agilidade: 0,
      inteligencia: 0,
      percepcao: 0,
      sorte: 0,
    });
  });
});

describe('calcularSecundarios', () => {
  const primariosTotais = {
    forca: 50,
    vitalidade: 40,
    agilidade: 60,
    inteligencia: 30,
    percepcao: 45,
    sorte: 20,
  };

  it('calcula os 6 secundários a partir dos totais dos primários (FUNCIONALIDADES.md §2)', () => {
    expect(calcularSecundarios(primariosTotais)).toEqual({
      prontidao: 65,
      ataque: 4,
      defesa: 3,
      reacao: 8,
      precisao: 3,
      evasao: 3,
    });
  });

  it('soma os ajustes manuais (base/extra/bônus) do próprio secundário', () => {
    const resultado = calcularSecundarios(
      primariosTotais,
      { ataque: 2 },
      {},
      { defesa: 1 },
    );

    expect(resultado.ataque).toBe(6);
    expect(resultado.defesa).toBe(4);
  });

  it('retorna tudo zero quando os primários totais são zero', () => {
    const zerado = calcularPrimariosTotais();
    expect(calcularSecundarios(zerado)).toEqual({
      prontidao: 0,
      ataque: 0,
      defesa: 0,
      reacao: 6,
      precisao: 0,
      evasao: 0,
    });
  });
});

describe('calcularStatusMaximos', () => {
  const primariosTotais = {
    forca: 50,
    vitalidade: 40,
    agilidade: 60,
    inteligencia: 30,
    percepcao: 45,
    sorte: 20,
  };

  it('calcula HP/Energia/Fadiga máximos (FUNCIONALIDADES.md §3)', () => {
    expect(calcularStatusMaximos(primariosTotais)).toEqual({
      hp: 82,
      energia: 45,
      fadiga: 39,
    });
  });

  it('soma os ajustes manuais (base/extra/bônus) de cada status', () => {
    const resultado = calcularStatusMaximos(primariosTotais, {
      hp: { base: 10 },
      energia: { bonus: -5 },
    });

    expect(resultado.hp).toBe(92);
    expect(resultado.energia).toBe(40);
  });
});

describe('calcularPowerCombat', () => {
  it('combina ataque/defesa com força/vitalidade/agilidade (FUNCIONALIDADES.md §4)', () => {
    const primariosTotais = { forca: 50, vitalidade: 40, agilidade: 60 };
    const secundariosTotais = { ataque: 4, defesa: 3 };

    expect(calcularPowerCombat(primariosTotais, secundariosTotais)).toBe(130);
  });

  it('usa floor (arredonda para baixo)', () => {
    const primariosTotais = { forca: 0, vitalidade: 0, agilidade: 0 };
    const secundariosTotais = { ataque: 1, defesa: 0 };

    // (1+0)*1.5 = 1.5 -> floor = 1
    expect(calcularPowerCombat(primariosTotais, secundariosTotais)).toBe(1);
  });
});

// Stub determinístico para as funções que dependem de rolarDadoFn: consome
// os valores da fila na ordem em que os dados são rolados.
const criarFilaDados = valores => {
  const fila = [...valores];
  return () => fila.shift();
};

describe('calcularRolagemFortuna', () => {
  it('soma N dados d6 (1 + floor(sorteTotal/20)) + bônus base floor(sorteTotal/25) (§6)', () => {
    const resultado = calcularRolagemFortuna(45, criarFilaDados([4, 4, 4]));

    expect(resultado.quantidadeDados).toBe(3);
    expect(resultado.somaDados).toBe(12);
    expect(resultado.bonusBase).toBe(1);
    expect(resultado.resultado).toBe(13);
  });

  it('com sorte baixa, rola só 1 dado e bônus base 0', () => {
    const resultado = calcularRolagemFortuna(5, criarFilaDados([3]));

    expect(resultado.quantidadeDados).toBe(1);
    expect(resultado.resultado).toBe(3);
  });
});

describe('calcularBonusPorSorte', () => {
  it('usa a mesma fórmula floor(sorteTotal/25) da Fortuna e do Treinamento', () => {
    expect(calcularBonusPorSorte(45)).toBe(1);
    expect(calcularBonusPorSorte(0)).toBe(0);
    expect(calcularBonusPorSorte(100)).toBe(4);
  });
});

describe('podeRolarFortunaHoje', () => {
  it('permite rolar quando a última rolagem foi em outro dia', () => {
    expect(podeRolarFortunaHoje('2026-07-18', '2026-07-19')).toBe(true);
  });

  it('bloqueia uma segunda rolagem no mesmo dia', () => {
    expect(podeRolarFortunaHoje('2026-07-19', '2026-07-19')).toBe(false);
  });
});

describe('calcularLimiteHabilidadesBasicas', () => {
  it('respeita a tabela de limites por raridade (§11), ignorando acentuação/caixa', () => {
    expect(calcularLimiteHabilidadesBasicas('Comum')).toBe(1);
    expect(calcularLimiteHabilidadesBasicas('Rara')).toBe(1);
    expect(calcularLimiteHabilidadesBasicas('Épica')).toBe(1);
    expect(calcularLimiteHabilidadesBasicas('Lendária')).toBe(2);
    expect(calcularLimiteHabilidadesBasicas('Mítica')).toBe(3);
    expect(calcularLimiteHabilidadesBasicas('celestial')).toBe(Infinity);
  });

  it('assume limite 1 para raridade desconhecida', () => {
    expect(calcularLimiteHabilidadesBasicas('Inexistente')).toBe(1);
  });
});

describe('calcularObstaculoTreino', () => {
  it('cresce 2 pontos a cada 25 níveis, começando em 5 (§13)', () => {
    expect(calcularObstaculoTreino(0)).toBe(5);
    expect(calcularObstaculoTreino(10)).toBe(5);
    expect(calcularObstaculoTreino(130)).toBe(15);
  });
});

describe('calcularXpNecessario', () => {
  it('cresce linearmente de 10 (nível 0) a 100 (nível 100), depois satura em 100', () => {
    expect(calcularXpNecessario(0)).toBe(10);
    expect(calcularXpNecessario(100)).toBe(100);
    expect(calcularXpNecessario(200)).toBe(100);
  });
});

describe('calcularResultadoTreino', () => {
  it('tier "sucesso" dá dado de XP 1d8 e +20% de XP (diferença > 0)', () => {
    // nivelAtual=10 -> obstaculo=5; rolagem=6 -> diferenca=1 (sucesso)
    const resultado = calcularResultadoTreino({
      nivelAtual: 10,
      horas: 2,
      rolarDadoFn: criarFilaDados([6, 5, 7]),
    });

    expect(resultado.tier).toBe('sucesso');
    expect(resultado.dadoXp).toBe(8);
    expect(resultado.rolagensXp).toEqual([5, 7]);
    expect(resultado.xpGanho).toBe(14); // round((5+7) * 1.2)
  });

  it('tier "falha" não recebe o bônus de +20%', () => {
    // nivelAtual=0 -> obstaculo=5; rolagem=1 -> diferenca=-4 (falha)
    const resultado = calcularResultadoTreino({
      nivelAtual: 0,
      horas: 1,
      rolarDadoFn: criarFilaDados([1, 3]),
    });

    expect(resultado.tier).toBe('falha');
    expect(resultado.dadoXp).toBe(4);
    expect(resultado.xpGanho).toBe(3);
  });

  it('tier "critico" quando a diferença é >= 5', () => {
    const resultado = calcularResultadoTreino({
      nivelAtual: 0,
      horas: 0,
      rolarDadoFn: criarFilaDados([10]),
    });

    expect(resultado.tier).toBe('critico');
    expect(resultado.dadoXp).toBe(10);
  });
});

describe('aplicarXpTreino', () => {
  it('acumula XP sem subir de nível quando abaixo do necessário', () => {
    expect(aplicarXpTreino(5, 8, 5)).toEqual({ nivel: 5, xpAtual: 13 });
  });

  it('sobe um nível quando o XP acumulado atinge o necessário', () => {
    expect(aplicarXpTreino(5, 8, 10)).toEqual({ nivel: 6, xpAtual: 4 });
  });

  it('sobe múltiplos níveis de uma vez se o XP for suficiente', () => {
    expect(aplicarXpTreino(0, 0, 25)).toEqual({ nivel: 2, xpAtual: 5 });
  });
});

const primariosTotais = {
  forca: 50,
  vitalidade: 40,
  agilidade: 60,
  inteligencia: 30,
  percepcao: 45,
  sorte: 999, // não deve influenciar Aptidões/Arts (§9, §10 não usam Sorte)
};

describe('calcularMaximoAptidoes', () => {
  it('round((FOR+VIT+AGI+INT+PER)/20 + 3) + ganhas, ignorando Sorte (§9)', () => {
    expect(calcularMaximoAptidoes(primariosTotais, 2)).toBe(16);
  });

  it('sem "ganhas" informado, assume 0', () => {
    expect(calcularMaximoAptidoes(primariosTotais)).toBe(14);
  });
});

describe('calcularProximoAptidaoEm', () => {
  it('retorna quantos pontos de soma faltam para o próximo +1 no máximo', () => {
    expect(calcularProximoAptidaoEm(primariosTotais)).toBe(5);
  });
});

describe('calcularLimiteArts', () => {
  it('round((FOR+VIT+AGI+PER+INT) * 0.0293), ignorando Sorte (§10)', () => {
    expect(calcularLimiteArts(primariosTotais)).toBe(7);
  });
});

describe('reorganizarArts', () => {
  it('mantém ativas as Arts mais antigas até o limite, bloqueia as mais recentes', () => {
    const arts = [
      { id: 'a', ativa: false, criadoEm: 100 },
      { id: 'b', ativa: true, criadoEm: 50 },
      { id: 'c', ativa: true, criadoEm: 150 },
    ];

    const resultado = reorganizarArts(arts, 2);

    expect(resultado.map(art => [art.id, art.ativa])).toEqual([
      ['b', true],
      ['a', true],
      ['c', false],
    ]);
  });

  it('com limite maior que a quantidade de Arts, todas ficam ativas', () => {
    const arts = [
      { id: 'a', ativa: false, criadoEm: 2 },
      { id: 'b', ativa: false, criadoEm: 1 },
    ];

    const resultado = reorganizarArts(arts, 5);

    expect(resultado.every(art => art.ativa)).toBe(true);
  });
});

describe('calcularEspacoInventario', () => {
  it('espaço base = (FOR+VIT)/2/10; itens equipados não ocupam espaço; bonusEspaco soma sempre (§14)', () => {
    const primarios = { forca: 50, vitalidade: 40 };
    const itens = [
      { espaco: 2, quantidade: 3, equipado: false, bonusEspaco: 0 },
      { espaco: 5, quantidade: 1, equipado: true, bonusEspaco: 0 },
      { espaco: 0, quantidade: 1, equipado: false, bonusEspaco: 10 },
    ];

    const resultado = calcularEspacoInventario(primarios, itens);

    expect(resultado.espacoBase).toBe(4.5);
    expect(resultado.bonusArmazenamento).toBe(10);
    expect(resultado.espacoTotal).toBe(14.5);
    expect(resultado.espacoUsado).toBe(6);
    expect(resultado.espacoLivre).toBe(8.5);
  });

  it('espaço livre nunca fica negativo (satura em 0)', () => {
    const resultado = calcularEspacoInventario(
      { forca: 0, vitalidade: 0 },
      [{ espaco: 100, quantidade: 1, equipado: false }],
    );

    expect(resultado.espacoLivre).toBe(0);
  });

  it('sem itens, retorna só o espaço base', () => {
    const resultado = calcularEspacoInventario({ forca: 20, vitalidade: 20 });
    expect(resultado.espacoTotal).toBe(2);
    expect(resultado.espacoUsado).toBe(0);
  });
});

describe('calcularPcDisponivel', () => {
  it('PC atual menos PC já gasto em Veias Astrais', () => {
    expect(calcularPcDisponivel(130, 40)).toBe(90);
  });

  it('nunca fica negativo', () => {
    expect(calcularPcDisponivel(50, 80)).toBe(0);
  });
});

describe('calcularCustoDesbloqueio', () => {
  const nos = [
    { id: 'a', custo: 5, parentId: null },
    { id: 'b', custo: 3, parentId: 'a' },
    { id: 'c', custo: 2, parentId: 'b' },
  ];

  it('soma o custo de toda a cadeia até a raiz quando nada está desbloqueado (§20)', () => {
    const resultado = calcularCustoDesbloqueio(nos, 'c', []);
    expect(resultado.cadeia.map(no => no.id)).toEqual(['c', 'b', 'a']);
    expect(resultado.custoTotal).toBe(10);
  });

  it('para de subir a cadeia ao encontrar um nó já desbloqueado', () => {
    const resultado = calcularCustoDesbloqueio(nos, 'c', ['a']);
    expect(resultado.cadeia.map(no => no.id)).toEqual(['c', 'b']);
    expect(resultado.custoTotal).toBe(5);
  });

  it('custo zero quando o próprio nó já está desbloqueado', () => {
    const resultado = calcularCustoDesbloqueio(nos, 'c', ['c']);
    expect(resultado.cadeia).toEqual([]);
    expect(resultado.custoTotal).toBe(0);
  });
});
