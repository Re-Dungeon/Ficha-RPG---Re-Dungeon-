import {
  calcularBonusCultivoTotal,
  calcularPrimariosTotais,
  calcularSecundarios,
} from './formulas';

export const ATAQUE_PERFIS = {
  Contundente: { label: 'Contundente', dados: 'd8', porcentagemFixa: 20, maximoBase: 24, qtd: 0, lados: 8 },
  Cortante: { label: 'Cortante', dados: 'd6', porcentagemFixa: 25, maximoBase: 24, qtd: 0, lados: 6 },
  Perfurante: { label: 'Perfurante', dados: 'd20', porcentagemFixa: 5, maximoBase: 24, qtd: 0, lados: 20 },
  Mágico: { label: 'Mágico', dados: 'd4', porcentagemFixa: 20, maximoBase: 24, qtd: 0, lados: 4 },
  Especial: { label: 'Especial', dados: '1d20 + 2d8', porcentagemFixa: 10, maximoBase: 24, qtd: 0, lados: [20, 8] },
};

export const DEFESA_PERFIS = {
  Contundente: { label: 'Defesa Física', dados: 'd10', porcentagemFixa: 10, maximoBase: 24, qtd: 0, lados: 10 },
  Cortante: { label: 'Defesa Mágica', dados: 'd6', porcentagemFixa: 20, maximoBase: 24, qtd: 0, lados: 6 },
  Perfurante: { label: 'Defesa Energética', dados: 'd20', porcentagemFixa: 10, maximoBase: 24, qtd: 0, lados: 20 },
  Mágico: { label: 'Defesa Espiritual', dados: 'd4', porcentagemFixa: 30, maximoBase: 24, qtd: 0, lados: 4 },
  Especial: { label: 'Defesa Especial', dados: 'd8', porcentagemFixa: 30, maximoBase: 24, qtd: 0, lados: 8 },
};

export const TIPOS_DANO_ATAQUE = Object.keys(ATAQUE_PERFIS);

const getPerfilPorContexto = (tipoDano = 'Contundente', contexto = 'ataque') => {
  const perfis = contexto === 'defesa' ? DEFESA_PERFIS : ATAQUE_PERFIS;
  return perfis[tipoDano] ?? perfis.Contundente;
};

const normalizeText = valor =>
  String(valor ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const parseInteger = valor => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
};

export const clampedPercent = (valor = 0, min = 0, max = 100) => {
  const numero = Number(valor) || 0;
  return Math.min(max, Math.max(min, numero));
};

export const calcularValorBaseSecundario = (personagem = {}, tipoSecundario = 'ataque') => {
  const tipo = tipoSecundario === 'defesa' ? 'defesa' : 'ataque';
  const primariosTotais = calcularPrimariosTotais(
    personagem.atributosBase ?? {},
    personagem.atributosExtra ?? {},
    personagem.atributosBonus ?? {},
    calcularBonusCultivoTotal(personagem.cultivoBonus ?? {}).primarios,
  );
  const secundariosTotais = calcularSecundarios(
    primariosTotais,
    personagem.secundariosBase ?? {},
    personagem.secundariosExtra ?? {},
    personagem.secundariosBonus ?? {},
    calcularBonusCultivoTotal(personagem.cultivoBonus ?? {}).secundarios,
  );

  return Number(secundariosTotais[tipo] ?? 0);
};

export const calcularAtaqueDaFicha = (personagem = {}) => calcularValorBaseSecundario(personagem, 'ataque');

export const calcularDefesaDaFicha = (personagem = {}) => calcularValorBaseSecundario(personagem, 'defesa');

export const calcularPotencialBase = (
  ataqueFicha = 0,
  bonusArte = 0,
  bonusItem = 0,
  bonusExtra = 0,
) => Math.max(0, Math.floor(ataqueFicha + bonusArte + bonusItem + bonusExtra));

export const calcularAumentoPotencial = (potencialBase = 0, percentualPotencializacao = 0) => {
  const percentual = clampedPercent(percentualPotencializacao, 0, 30);
  const base = Math.max(0, Number(potencialBase) || 0);
  return Math.max(0, Math.floor(base * (percentual / 100)));
};

export const calcularPotencialFinal = (potencialBase = 0, percentualPotencializacao = 0) => {
  const base = Math.max(0, Number(potencialBase) || 0);
  const aumento = calcularAumentoPotencial(base, percentualPotencializacao);
  return Math.max(0, base + aumento);
};

export const calcularCustoEnergia = (energiaMaxima = 0, percentualPotencializacao = 0) => {
  const percentual = clampedPercent(percentualPotencializacao, 0, 30);
  return Math.max(0, Math.ceil((Number(energiaMaxima) || 0) * (percentual / 100)));
};

export const calcularCustoPercentualRecurso = (recursoMaximo = 0, percentualPotencializacao = 0) => {
  const percentual = clampedPercent(percentualPotencializacao, 0, 30);
  return Math.max(0, Math.ceil((Number(recursoMaximo) || 0) * (percentual / 100)));
};

export const calcularParcelaFixa = (potencialFinal = 0, tipoDano = 'Contundente', contexto = 'ataque') => {
  const perfil = getPerfilPorContexto(tipoDano, contexto);
  const potencial = Math.max(0, Number(potencialFinal) || 0);
  const porcentagem = Number(perfil.porcentagemFixa ?? 15);
  return Math.floor((potencial * porcentagem) / 100);
};

export const rolarDado = (lados = 6, randomFn = Math.random) => 1 + Math.floor(randomFn() * lados);

const formatarRolling = (parteDados = '', bonusFixoFinal = 0) => {
  const bonus = Number(bonusFixoFinal) || 0;

  if (!parteDados) {
    return String(Math.max(0, bonus));
  }

  if (bonus === 0) {
    return parteDados;
  }

  return `${parteDados}${bonus > 0 ? '+' : ''}${bonus}`;
};

const calcularPerfilEspecial = (potencialFinal, contexto = 'ataque') => {
  const perfil = getPerfilPorContexto('Especial', contexto);
  const lados = perfil.lados;

  if (!Array.isArray(lados) || lados.length === 0) {
    return calcularPerfilGenerico(potencialFinal, 'Especial', contexto);
  }

  const potencial = Math.max(0, Number(potencialFinal) || 0);
  const fixoInicial = Math.floor((potencial * (perfil.porcentagemFixa ?? 10)) / 100);
  let disponivelParaDados = potencial - fixoInicial;
  let quantidadeD20 = 0;
  let quantidadeD8 = 0;
  const conjuntoCompleto = 36;

  const conjuntosCompletos = Math.floor(disponivelParaDados / conjuntoCompleto);
  quantidadeD20 += conjuntosCompletos;
  quantidadeD8 += conjuntosCompletos * 2;
  disponivelParaDados -= conjuntosCompletos * conjuntoCompleto;

  while (disponivelParaDados >= 8) {
    quantidadeD8 += 1;
    disponivelParaDados -= 8;
  }

  if (disponivelParaDados >= 20) {
    quantidadeD20 += 1;
    disponivelParaDados -= 20;
  }

  const bonusFixoFinal = fixoInicial + disponivelParaDados;
  const parteDados = `${quantidadeD20 > 0 ? `${quantidadeD20}d20` : ''}${quantidadeD20 > 0 && quantidadeD8 > 0 ? '+' : ''}${quantidadeD8 > 0 ? `${quantidadeD8}d8` : ''}`;
  const maximo = 20 * quantidadeD20 + 8 * quantidadeD8 + bonusFixoFinal;
  const minimo = quantidadeD20 + quantidadeD8 + bonusFixoFinal;
  const media = quantidadeD20 * 10.5 + quantidadeD8 * 4.5 + bonusFixoFinal;

  return {
    fixo: bonusFixoFinal,
    variavel: potencial - fixoInicial,
    perfil: parteDados || '0',
    rolagemMaxima: 20 * quantidadeD20 + 8 * quantidadeD8,
    rolagemObtida: 20 * quantidadeD20 + 8 * quantidadeD8,
    rolagens: [],
    resultadoFinal: potencial,
    potencialFinal: potencial,
    quantidadeDados: quantidadeD20 + quantidadeD8,
    bonusFixo: bonusFixoFinal,
    maximo,
    minimo,
    media,
    rolling: formatarRolling(parteDados, bonusFixoFinal),
  };
};

const calcularPerfilGenerico = (potencialFinal, tipoDano, contexto = 'ataque') => {
  const perfil = getPerfilPorContexto(tipoDano, contexto);
  const potencial = Math.max(0, Number(potencialFinal) || 0);
  const lados = Number(perfil.lados ?? 8);
  const porcentagemFixa = Number(perfil.porcentagemFixa ?? 20);
  const fixoInicial = Math.floor((potencial * porcentagemFixa) / 100);
  const disponivelParaDados = potencial - fixoInicial;
  const quantidadeDados = Math.floor(disponivelParaDados / lados);
  const resto = disponivelParaDados % lados;
  const bonusFixoFinal = fixoInicial + resto;
  const parteDados = quantidadeDados > 0 ? `${quantidadeDados}d${lados}` : '';
  const maximo = quantidadeDados * lados + bonusFixoFinal;
  const minimo = quantidadeDados + bonusFixoFinal;
  const media = quantidadeDados * ((lados + 1) / 2) + bonusFixoFinal;

  return {
    fixo: bonusFixoFinal,
    variavel: disponivelParaDados,
    perfil: parteDados || '0',
    rolagemMaxima: quantidadeDados * lados,
    rolagemObtida: quantidadeDados * lados,
    rolagens: [],
    resultadoFinal: potencial,
    potencialFinal: potencial,
    quantidadeDados,
    bonusFixo: bonusFixoFinal,
    maximo,
    minimo,
    media,
    rolling: formatarRolling(parteDados, bonusFixoFinal),
  };
};

export const calcularRolagemPerfil = (tipoDano, randomFn = Math.random) => {
  const perfil = ATAQUE_PERFIS[tipoDano] ?? ATAQUE_PERFIS.Contundente;

  if (tipoDano === 'Especial') {
    const dado20 = rolarDado(20, randomFn);
    const dado8 = rolarDado(8, randomFn);
    return { rolagemObtida: dado20 + dado8, rolagens: [dado20, dado8], nome: perfil.dados };
  }

  const lados = Number(perfil.lados ?? 8);
  const rolagens = Array.from(
    { length: Math.max(0, Number(perfil.qtd ?? 1)) },
    () => rolarDado(lados, randomFn),
  );
  return {
    rolagemObtida: rolagens.reduce((total, valor) => total + valor, 0),
    rolagens,
    nome: perfil.dados,
  };
};

export const converterPotencialEmDados = (potencialFinal = 0, tipoDano = 'Contundente', _randomFn = Math.random, contexto = 'ataque') => {
  if (tipoDano === 'Especial') {
    return calcularPerfilEspecial(potencialFinal, contexto);
  }

  return calcularPerfilGenerico(potencialFinal, tipoDano, contexto);
};

const parseNumeroProximoAoTermo = (texto, termos) => {
  const normalizado = normalizeText(texto);
  if (!normalizado) return 0;

  for (const termo of termos) {
    const regex = new RegExp(`${termo}[^0-9+-]*([+-]?\\d+)`, 'i');
    const match = normalizado.match(regex);
    if (match) {
      return parseInteger(match[1]);
    }
  }

  const explicit = normalizado.match(/(?:^|[^a-z])([+-]?\d+)(?![a-z])/);
  if (explicit) {
    return parseInteger(explicit[1]);
  }

  return 0;
};

const palavrasChavePorContexto = contexto => {
  if (contexto === 'defesa') {
    return [
      'defesa',
      'defense',
      'protecao',
      'protecao',
      'proteção',
      'protecao',
      'resistencia',
      'resistência',
      'escudo',
      'blindagem',
      'armadura',
      'barreira',
      'cobertura',
      'mitigacao',
      'mitigação',
    ];
  }

  return ['ataque', 'attack', 'dano', 'damage', 'golpe', 'impacto', 'acerto', 'precisao', 'precision'];
};

export const extrairBonusNumericoContexto = (valor, contexto = 'ataque') => {
  if (!valor || typeof valor !== 'object') {
    return { valor: 0, origem: 'nenhuma' };
  }

  const textos = [
    valor.bonus,
    valor.extra,
    valor.descricao,
    valor.nome,
    valor.dados,
    valor.tipo,
    valor.cantico,
    valor.circuloMagico,
    valor.habilidadesEspeciais,
  ]
    .flatMap(item => (Array.isArray(item) ? item : [item]))
    .filter(item => item !== undefined && item !== null && item !== '');

  const palavrasChave = palavrasChavePorContexto(contexto);

  for (const texto of textos) {
    const numero = parseNumeroProximoAoTermo(texto, palavrasChave);
    if (numero !== 0) {
      return { valor: numero, origem: texto };
    }
  }

  const extra = textos.find(item => typeof item === 'string' && /[+-]?\d+/.test(item));
  if (extra && !/[dD]\d+/.test(normalizeText(extra))) {
    const match = String(extra).match(/[+-]?\d+/g);
    if (match && match.length > 0) {
      return { valor: parseInteger(match[match.length - 1]), origem: extra };
    }
  }

  return { valor: 0, origem: 'nenhuma' };
};

export const extrairBonusNumericoAtaque = valor => extrairBonusNumericoContexto(valor, 'ataque');

export const extrairBonusNumericoDefesa = valor => extrairBonusNumericoContexto(valor, 'defesa');

export const extrairBonusNumericoItem = (item, contexto = 'ataque') => {
  if (!item || typeof item !== 'object') {
    return { valor: 0, origem: 'nenhuma' };
  }

  const textos = [item.extra, item.descricao, item.dados, item.nome, item.tipo, item.habilidadesEspeciais].flatMap(itemTexto =>
    Array.isArray(itemTexto) ? itemTexto : [itemTexto],
  );

  const palavrasChave = palavrasChavePorContexto(contexto);

  for (const texto of textos) {
    if (!texto) continue;
    const numero = parseNumeroProximoAoTermo(texto, palavrasChave);
    if (numero !== 0) {
      return { valor: numero, origem: texto };
    }
  }

  const valorExtra = Number(item.extra ?? item.bonus ?? 0);
  if (Number.isFinite(valorExtra) && valorExtra !== 0) {
    return { valor: valorExtra, origem: item.extra ?? item.bonus };
  }

  if (typeof item.extra === 'string' && /[+-]\d+/.test(item.extra)) {
    const match = item.extra.match(/[+-]?\d+/g);
    if (match && match.length > 0) {
      return { valor: parseInteger(match[match.length - 1]), origem: item.extra };
    }
  }

  return { valor: 0, origem: 'nenhuma' };
};

export const calcularBonusSelecaoAtaque = (art, item, ataqueBase = 0) => {
  const bonusArte = extrairBonusNumericoAtaque(art).valor;
  const bonusItem = extrairBonusNumericoItem(item).valor;
  const bonusDuplicado =
    bonusItem > 0 && Math.abs(ataqueBase + bonusItem - (ataqueBase + bonusItem)) === 0;

  return {
    bonusArte,
    bonusItem: bonusDuplicado ? 0 : bonusItem,
  };
};
