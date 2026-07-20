const PRIMARIOS = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];

const somar = (...campos) => campos.reduce((total, valor) => total + (valor ?? 0), 0);

export const calcularPrimariosTotais = (base = {}, extra = {}, bonus = {}) =>
  Object.fromEntries(
    PRIMARIOS.map(chave => [chave, somar(base[chave], extra[chave], bonus[chave])]),
  );

export const calcularSecundarios = (primariosTotais, base = {}, extra = {}, bonus = {}) => {
  const { forca, vitalidade, agilidade, inteligencia, percepcao, sorte } = primariosTotais;
  const ajuste = chave => somar(base[chave], extra[chave], bonus[chave]);

  return {
    prontidao:
      Math.ceil(((agilidade * 0.6 + percepcao * 0.3 + sorte * 0.1) / 250) * 315) +
      ajuste('prontidao'),
    ataque: Math.ceil(((forca * 0.7 + inteligencia * 0.3) / 250) * 21) + ajuste('ataque'),
    defesa:
      Math.ceil(((vitalidade * 0.6 + agilidade * 0.3 + sorte * 0.1) / 250) * 16) +
      ajuste('defesa'),
    reacao:
      Math.ceil(((agilidade * 0.5 + percepcao * 0.3 + sorte * 0.2) / 250) * 6) +
      6 +
      ajuste('reacao'),
    precisao:
      Math.ceil(((agilidade * 0.3 + percepcao * 0.6 + sorte * 0.1) / 250) * 12) +
      ajuste('precisao'),
    evasao:
      Math.ceil(((agilidade * 0.5 + percepcao * 0.4 + sorte * 0.1) / 250) * 12) +
      ajuste('evasao'),
  };
};

export const calcularStatusMaximos = (primariosTotais, status = {}) => {
  const { forca, vitalidade, inteligencia, percepcao, sorte } = primariosTotais;
  const ajuste = chave => {
    const campo = status[chave] ?? {};
    return somar(campo.base, campo.extra, campo.bonus);
  };

  return {
    hp: Math.ceil((forca * 0.3 + vitalidade * 0.6 + sorte * 0.1) * 2) + ajuste('hp'),
    energia:
      Math.ceil((inteligencia * 0.6 + percepcao * 0.3 + sorte * 0.1) * 1.333) +
      ajuste('energia'),
    fadiga: Math.ceil(forca * 0.3 + vitalidade * 0.5 + sorte * 0.2) + ajuste('fadiga'),
  };
};

export const calcularPowerCombat = (primariosTotais, secundariosTotais) => {
  const { forca, vitalidade, agilidade } = primariosTotais;
  const { ataque, defesa } = secundariosTotais;
  return Math.floor((ataque + defesa) * 1.5 + (forca + vitalidade + agilidade) * 0.8);
};

export const rolarDado = sides => 1 + Math.floor(Math.random() * sides);

// Divisor compartilhado por Fortuna (§6) e Treinamento (§13) — mesma fórmula
// "floor(Sorte Total / 25)" nos dois sistemas.
export const calcularBonusPorSorte = sorteTotal => Math.floor(sorteTotal / 25);

// ── Sorte e Fortuna (FUNCIONALIDADES.md §6) — fórmula totalmente especificada ──

export const calcularRolagemFortuna = (sorteTotal, rolarDadoFn = rolarDado) => {
  const quantidadeDados = 1 + Math.floor(sorteTotal / 20);
  const rolagens = Array.from({ length: quantidadeDados }, () => rolarDadoFn(6));
  const somaDados = rolagens.reduce((total, valor) => total + valor, 0);
  const bonusBase = calcularBonusPorSorte(sorteTotal);
  return { quantidadeDados, rolagens, somaDados, bonusBase, resultado: somaDados + bonusBase };
};

export const podeRolarFortunaHoje = (
  ultimaRolagemData,
  hoje = new Date().toISOString().slice(0, 10),
) => ultimaRolagemData !== hoje;

// ── Raças — limite de habilidades básicas simultâneas por raridade (§11) ──

const LIMITE_HABILIDADES_POR_RARIDADE = {
  comum: 1,
  raro: 1,
  epico: 1,
  lendario: 2,
  mitico: 3,
  celestial: Infinity,
};

// Faixa Unicode das marcas diacríticas combinantes (acentos separados pelo
// normalize('NFD')), construída por código para evitar problemas de encoding
// com os caracteres combinantes em si.
const DIACRITICOS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g',
);

const normalizarTexto = texto =>
  (texto ?? '')
    .toString()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase();

export const calcularLimiteHabilidadesBasicas = raridade =>
  LIMITE_HABILIDADES_POR_RARIDADE[normalizarTexto(raridade)] ?? 1;

// ── Treinamento (FUNCIONALIDADES.md §13) ──────────────────────────────────
// ⚠️ A documentação não define os limiares exatos de crítico/sucesso/quase/
// falha, qual dado de XP (1d4-1d10) cada um usa, nem a tabela de XP por
// nível — só descreve o comportamento geral ("10 XP nos níveis iniciais,
// subindo até 100 XP nos avançados"). Os valores abaixo são uma escolha de
// design autoral, documentada aqui para poder ser recalibrada facilmente se
// não bater com as regras reais da mesa.

const DADO_XP_POR_TIER = { critico: 10, sucesso: 8, quase: 6, falha: 4 };

export const calcularObstaculoTreino = nivel => 5 + Math.floor(nivel / 25) * 2;

// Linear de 10 XP (nível 0) a 100 XP (nível 100+), conforme descrito no doc.
export const calcularXpNecessario = nivel =>
  Math.min(100, 10 + Math.floor(Math.max(0, nivel) * 0.9));

export const calcularResultadoTreino = ({
  nivelAtual,
  horas,
  bonusSorte = 0,
  bonusMestre = 0,
  bonusAptidao = 0,
  rolarDadoFn = rolarDado,
}) => {
  const obstaculo = calcularObstaculoTreino(nivelAtual);
  const rolagem = rolarDadoFn(6) + bonusAptidao + bonusSorte + bonusMestre;
  const diferenca = rolagem - obstaculo;

  let tier;
  if (diferenca >= 5) {
    tier = 'critico';
  } else if (diferenca >= 0) {
    tier = 'sucesso';
  } else if (diferenca >= -2) {
    tier = 'quase';
  } else {
    tier = 'falha';
  }

  const dadoXp = DADO_XP_POR_TIER[tier];
  const rolagensXp = Array.from({ length: horas }, () => rolarDadoFn(dadoXp));
  const xpBruto = rolagensXp.reduce((total, valor) => total + valor, 0);
  const xpGanho = diferenca > 0 ? Math.round(xpBruto * 1.2) : xpBruto;

  return { obstaculo, rolagem, diferenca, tier, dadoXp, rolagensXp, xpGanho };
};

// Aplica o XP ganho ao par (nível, xpAtual), subindo quantos níveis o XP
// acumulado permitir (a "escada" de XP necessário muda a cada nível).
export const aplicarXpTreino = (nivelAtual, xpAtualAntes, xpGanho) => {
  let nivel = nivelAtual;
  let xpAtual = xpAtualAntes + xpGanho;

  while (xpAtual >= calcularXpNecessario(nivel)) {
    xpAtual -= calcularXpNecessario(nivel);
    nivel += 1;
  }

  return { nivel, xpAtual };
};

// ── Aptidões (FUNCIONALIDADES.md §9) ───────────────────────────────────────
// Sem Sorte, ao contrário das outras fórmulas do sistema.

const somaAptidoesArts = primariosTotais => {
  const { forca, vitalidade, agilidade, inteligencia, percepcao } = primariosTotais;
  return forca + vitalidade + agilidade + inteligencia + percepcao;
};

export const calcularMaximoAptidoes = (primariosTotais, ganhas = 0) =>
  Math.round(somaAptidoesArts(primariosTotais) / 20 + 3) + ganhas;

// Quantos pontos a soma (FOR+VIT+AGI+INT+PER) ainda precisa subir para o
// Máximo de aptidões (sem contar "Ganhas") aumentar em +1.
export const calcularProximoAptidaoEm = primariosTotais => {
  const soma = somaAptidoesArts(primariosTotais);
  const maximoAtual = Math.round(soma / 20 + 3);
  let delta = 1;
  while (Math.round((soma + delta) / 20 + 3) <= maximoAtual) {
    delta += 1;
  }
  return delta;
};

// ── Arts / Habilidades — limite de Arts ativas (FUNCIONALIDADES.md §10) ───

export const calcularLimiteArts = primariosTotais =>
  Math.round(somaAptidoesArts(primariosTotais) * 0.0293);

// Reorganiza quais Arts ficam ativas quando o limite muda: mantém ativas as
// mais antigas até preencher o limite, bloqueia as mais recentes que sobrarem.
export const reorganizarArts = (arts, limite) => {
  const ordenadas = [...arts].sort((a, b) => (a.criadoEm ?? 0) - (b.criadoEm ?? 0));
  return ordenadas.map((art, index) => ({ ...art, ativa: index < limite }));
};

// ── Inventário (FUNCIONALIDADES.md §14) ────────────────────────────────────
// `itensInventario` é a lista já resolvida (item do catálogo `itens` + dados
// do personagem mesclados): [{ espaco, bonusEspaco, quantidade, equipado }].
// Itens equipados não ocupam espaço; `bonusEspaco` (ex.: mochilas) soma à
// capacidade total independente de estar equipado.
export const calcularEspacoInventario = (primariosTotais, itensInventario = []) => {
  const espacoBase = (primariosTotais.forca + primariosTotais.vitalidade) / 2 / 10;
  const bonusArmazenamento = itensInventario.reduce(
    (total, item) => total + (item.bonusEspaco ?? 0) * (item.quantidade ?? 1),
    0,
  );
  const espacoTotal = espacoBase + bonusArmazenamento;
  const espacoUsado = itensInventario
    .filter(item => !item.equipado)
    .reduce((total, item) => total + (item.espaco ?? 0) * (item.quantidade ?? 1), 0);

  return {
    espacoBase,
    bonusArmazenamento,
    espacoTotal,
    espacoUsado,
    espacoLivre: Math.max(0, espacoTotal - espacoUsado),
  };
};

// ── Veias Astrais (FUNCIONALIDADES.md §20) ──────────────────────────────────
// Power Combat é a "moeda": pcDisponivel = PC atual − PC já gasto em nós.
export const calcularPcDisponivel = (powerCombatAtual, powerCombatGasto = 0) =>
  Math.max(0, powerCombatAtual - powerCombatGasto);

// Ao clicar num nó bloqueado, o custo real inclui todos os nós-pai ainda
// bloqueados no caminho até ele (subindo por `parentId` até a raiz ou até
// achar um nó já desbloqueado). `nos` é a lista plana de nós da constelação.
export const calcularCustoDesbloqueio = (nos, nodeId, idsDesbloqueados = []) => {
  const porId = new Map(nos.map(no => [no.id, no]));
  const cadeia = [];
  const visitados = new Set();
  let atualId = nodeId;

  while (atualId && !idsDesbloqueados.includes(atualId) && !visitados.has(atualId)) {
    visitados.add(atualId);
    const no = porId.get(atualId);
    if (!no) {
      break;
    }
    cadeia.push(no);
    atualId = no.parentId;
  }

  return { cadeia, custoTotal: cadeia.reduce((total, no) => total + (no.custo ?? 0), 0) };
};
