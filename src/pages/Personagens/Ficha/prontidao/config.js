export const CATEGORIAS_ACOES_PRONTIDAO = [
  { id: 'todas', label: 'Todas' },
  { id: 'ofensivas', label: 'Ofensivas' },
  { id: 'movimentacao', label: 'Movimentação' },
  { id: 'defensivas', label: 'Defensivas' },
  { id: 'taticas', label: 'Táticas' },
  { id: 'utilitarias', label: 'Utilitárias' },
  { id: 'recuperacao', label: 'Recuperação' },
];

export const TOKENS_ACAO_PRONTIDAO = {
  unica: {
    id: 'unica',
    nome: 'Única',
    descricao: 'Esta ação possui uma limitação de execução por turno, quando prevista em suas regras.',
    cor: 'rgba(232, 203, 133, 0.14)',
    textColor: '#f4dda2',
  },
  reativa: {
    id: 'reativa',
    nome: 'Reativa',
    descricao: 'Esta ação pode ser utilizada como resposta a uma situação específica.',
    cor: 'rgba(96, 165, 250, 0.14)',
    textColor: '#7dd3fc',
  },
  repetivel: {
    id: 'repetivel',
    nome: 'Repetível',
    descricao: 'Esta ação pode ser repetida enquanto seus requisitos e recursos permitirem.',
    cor: 'rgba(168, 85, 247, 0.14)',
    textColor: '#c084fc',
  },
  instantanea: {
    id: 'instantanea',
    nome: 'Instantânea',
    descricao: 'Esta ação produz seu efeito imediatamente após a execução válida.',
    cor: 'rgba(250, 204, 21, 0.14)',
    textColor: '#facc15',
  },
  preparacao: {
    id: 'preparacao',
    nome: 'Preparação',
    descricao: 'Esta ação prepara ou concede um benefício para um momento posterior.',
    cor: 'rgba(192, 132, 252, 0.14)',
    textColor: '#d8b4fe',
  },
  gratuita: {
    id: 'gratuita',
    nome: 'Gratuita',
    descricao: 'Esta ação não exige custo adicional de PP na situação em que o benefício se aplica.',
    cor: 'rgba(34, 197, 94, 0.14)',
    textColor: '#86efac',
  },
  condicional: {
    id: 'condicional',
    nome: 'Condicional',
    descricao: 'Esta ação exige que determinadas condições sejam atendidas.',
    cor: 'rgba(251, 146, 60, 0.14)',
    textColor: '#fdba74',
  },
  descanso: {
    id: 'descanso',
    nome: 'Descanso',
    descricao: 'Esta ação está relacionada à recuperação de recursos.',
    cor: 'rgba(96, 165, 250, 0.12)',
    textColor: '#93c5fd',
  },
};

const normalizarIdsTokens = tokens =>
  (Array.isArray(tokens) ? tokens.map(token => (typeof token === 'string' ? token : token?.id)).filter(Boolean) : []);

export const getTokensAcao = acao => {
  const ids = normalizarIdsTokens(acao?.tokens);
  if (!ids.length && acao?.reativa) {
    ids.push('reativa');
  }

  const id = acao?.id;

  if (id === 'atacar' || id === 'ataque-duplo' || id === 'usar-habilidade') {
    const semRepetivel = ids.filter(tokenId => tokenId !== 'repetivel');
    if (!semRepetivel.includes('unica')) {
      semRepetivel.push('unica');
    }
    return semRepetivel
      .map(tokenId => TOKENS_ACAO_PRONTIDAO[tokenId])
      .filter(Boolean);
  }

  if ((id === 'mover' || id === 'correr' || id === 'reposicionar' || id === 'analisar') && !ids.includes('repetivel')) {
    ids.push('repetivel');
  }

  if ((id === 'contra-ataque' || id === 'esquiva' || id === 'bloquear' || id === 'aparar' || id === 'salvaguarda') && !ids.includes('reativa')) {
    ids.push('reativa');
  }

  if ((id === 'prontificar' || id === 'mirar') && !ids.includes('preparacao')) {
    ids.push('preparacao');
  }

  if ((id === 'recuperar-se' || id === 'descansar') && !ids.includes('descanso')) {
    ids.push('descanso');
  }

  if ((id === 'fintar' || id === 'auxiliar-aliado' || id === 'acao-extra' || id === 'usar-item' || id === 'usar-habilidade') && !ids.includes('condicional')) {
    ids.push('condicional');
  }

  if ((id === 'ataque-duplo' || id === 'levantar') && !ids.includes('condicional')) {
    ids.push('condicional');
  }

  return ids
    .map(tokenId => TOKENS_ACAO_PRONTIDAO[tokenId])
    .filter(Boolean);
};

export const CUSTOS_PROGRESSIVOS_PRONTIDAO = {
  mover: { pp10: 2, pp315: 36, pp5000: 677 },
  levantar: { pp10: 2, pp315: 35, pp5000: 680 },
  analisar: { pp10: 2, pp315: 37, pp5000: 682 },
  mirar: { pp10: 2, pp315: 37, pp5000: 682 },
  prontificar: { pp10: 2, pp315: 37, pp5000: 682 },
  correr: { pp10: 3, pp315: 37, pp5000: 682 },
  'usar-item': { pp10: 2, pp315: 35, pp5000: 680 },
  'auxiliar-aliado': { pp10: 3, pp315: 51, pp5000: 1017 },
  reposicionar: { pp10: 3, pp315: 53, pp5000: 1020 },
  fintar: { pp10: 3, pp315: 53, pp5000: 1020 },
  bloquear: { pp10: 3, pp315: 60, pp5000: 1100 },
  aparar: { pp10: 3, pp315: 60, pp5000: 1100 },
  esquiva: { pp10: 3, pp315: 65, pp5000: 1150 },
  'agarrar': { pp10: 3, pp315: 55, pp5000: 950 },
  atacar: { pp10: 3, pp315: 75, pp5000: 1250 },
  'usar-habilidade': { pp10: 5, pp315: 95, pp5000: 1550 },
  'contra-ataque': { pp10: 4, pp315: 90, pp5000: 1450 },
  'ataque-duplo': { pp10: 5, pp315: 120, pp5000: 1900 },
  'acao-extra': { pp10: 8, pp315: 150, pp5000: 2250 },
  salvaguarda: { pp10: 3, pp315: 60, pp5000: 1050 },
};

export const ACOES_PRONTIDAO = [
  {
    id: 'mover',
    nome: 'Movimentar-se',
    categoria: 'movimentacao',
    custoFixoPP: 15,
    percentualPP: 6,
    descricao: 'Desloca o personagem pelo campo de combate, respeitando terreno, obstáculos e alcance.',
    icone: '👟',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Desloca o personagem pelo campo de combate, respeitando terreno, obstáculos e alcance.',
      comoUtilizar: 'Declare o destino e percorra uma rota válida dentro da distância permitida.',
      requisitos: 'Espaço acessível e liberdade de movimento.',
      teste: 'Sem teste em terreno comum; o mestre pode solicitar teste em condições difíceis.',
      bonusPermitidos: 'Aptidões e efeitos de deslocamento podem ampliar o alcance.',
      condicoesSucesso: 'O personagem alcança o destino declarado.',
      consequenciasFalha: 'Movimento interrompido ou reduzido por obstáculo, efeito ou teste falho.',
      observacoes: 'Sair de uma área ameaçada pode provocar reação conforme as regras da mesa.',
    },
  },
  {
    id: 'levantar',
    nome: 'Levantar-se',
    categoria: 'movimentacao',
    custoFixoPP: 15,
    percentualPP: 6,
    descricao: 'Permite que o personagem se erga após cair ou ficar derrubado.',
    icone: '🧍',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Permite que o personagem se erga após cair ou ficar derrubado.',
      comoUtilizar: 'Declare a tentativa de levantar e verifique impedimentos ou ameaças.',
      requisitos: 'Estar caído e possuir condições de se levantar.',
      teste: 'Normalmente sem teste; condições adversas podem exigir teste físico.',
      bonusPermitidos: 'Bônus de mobilidade podem facilitar a ação.',
      condicoesSucesso: 'O personagem retorna à posição de pé.',
      consequenciasFalha: 'O personagem permanece caído quando houver impedimento ou falha aplicável.',
      observacoes: 'Não remove automaticamente outros estados negativos.',
    },
  },
  {
    id: 'analisar',
    nome: 'Analisar',
    categoria: 'taticas',
    custoFixoPP: 15,
    percentualPP: 6,
    descricao: 'Observa o alvo ou ambiente para identificar pistas, riscos e oportunidades.',
    icone: '🔎',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Observa o alvo ou ambiente para identificar pistas, riscos e oportunidades.',
      comoUtilizar: 'Indique o alvo ou elemento observado e o que deseja descobrir.',
      requisitos: 'Ter meios de observar o alvo ou ambiente.',
      teste: 'Teste de Percepção ou Inteligência quando houver informação oculta.',
      bonusPermitidos: 'Aptidões de observação e conhecimento podem auxiliar.',
      condicoesSucesso: 'Recebe informação útil conforme o resultado e a situação.',
      consequenciasFalha: 'Não identifica informação adicional ou interpreta pistas de forma incompleta.',
      observacoes: 'Não revela automaticamente segredos impossíveis de perceber.',
    },
  },
  {
    id: 'mirar',
    nome: 'Mirar',
    categoria: 'taticas',
    custoFixoPP: 20,
    percentualPP: 10,
    descricao: 'Dedica atenção à precisão do próximo ataque contra um alvo.',
    icone: '🎯',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Dedica atenção à precisão do próximo ataque contra um alvo.',
      comoUtilizar: 'Escolha um alvo visível e declare a preparação do ataque.',
      requisitos: 'Alvo identificável e possibilidade de manter a mira.',
      teste: 'Sem teste inicial; o ataque posterior segue sua rolagem normal.',
      bonusPermitidos: 'Bônus de precisão apenas quando previstos pela regra vigente.',
      condicoesSucesso: 'O custo do ataque potencializado e reduzido em 50%.',
      consequenciasFalha: 'A mira pode ser perdida se houver interrupção ou mudança de alvo.',
      observacoes: 'Não inventar bônus numérico; preservar modificadores existentes.',
    },
  },
  {
    id: 'prontificar',
    nome: 'Prontificar-se',
    categoria: 'taticas',
    custoFixoPP: 20,
    percentualPP: 10,
    descricao: 'Assume uma postura de prontidão para reagir a mudanças no combate.',
    icone: '⏱️',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Assume uma postura de prontidão para reagir a mudanças no combate.',
      comoUtilizar: 'Declare a condição ou situação para a qual deseja ficar preparado.',
      requisitos: 'Capacidade de agir e condição de prontidão válida.',
      teste: 'Sem teste inicial; a reação pode exigir teste próprio.',
      bonusPermitidos: 'Modificadores de reação previstos pelo sistema podem se aplicar.',
      condicoesSucesso: 'Caso seja expostos a alguma situaçao nesse estado o usuario ganha bonus de 1d6 adicional para tal situação. Pode ser utilizado no proximo turno!',
      consequenciasFalha: 'A condição não ocorre ou a preparação é interrompida.',
      observacoes: 'Não concede PP adicional nem ações gratuitas automaticamente.',
    },
  },
  {
    id: 'correr',
    nome: 'Correr',
    categoria: 'movimentacao',
    custoFixoPP: 25,
    percentualPP: 12,
    descricao: 'Executa um deslocamento acelerado para alcançar ou abandonar uma posição.',
    icone: '🏃',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Executa um deslocamento acelerado para alcançar ou abandonar uma posição.',
      comoUtilizar: 'Declare rota e destino, respeitando limitações de terreno.',
      requisitos: 'Ter espaço e condições para correr.',
      teste: 'Teste físico quando o terreno ou a situação exigir.',
      bonusPermitidos: 'Bônus de velocidade e aptidões aplicáveis.',
      condicoesSucesso: 'O personagem avança rapidamente pela rota permitida. Dobra a distancia percorrida!',
      consequenciasFalha: 'O avanço é limitado ou interrompido.',
      observacoes: 'O deslocamento exato deve seguir as regras existentes.',
    },
  },
  {
    id: 'usar-item',
    nome: 'Usar Item',
    categoria: 'utilitarias',
    custoFixoPP: 25,
    percentualPP: 12,
    descricao: 'Utiliza um item elegível do inventário durante o combate.',
    icone: '🧰',
    reativa: false,
    custoPendente: true,
    detalhes: {
      descricaoCompleta: 'Utiliza um item elegível do inventário durante o combate.',
      comoUtilizar: 'Selecione um consumível, escolha seus efeitos aplicáveis e confirme o uso.',
      requisitos: 'Possuir item elegível e quantidade disponível; cumprir requisitos de uso.',
      teste: 'Sem teste, salvo quando o item exigir explicitamente.',
      bonusPermitidos: 'Efeitos descritos no próprio item.',
      condicoesSucesso: 'O efeito é aplicado e uma unidade é consumida após confirmação.',
      consequenciasFalha: 'Uso não confirmado ou requisitos não atendidos; nenhum item deve ser consumido.',
      observacoes: 'Não permitir armas/equipamentos comuns; preservar seleção múltipla de status e desconto único.',
    },
  },
  {
    id: 'auxiliar-aliado',
    nome: 'Auxiliar Aliado',
    categoria: 'utilitarias',
    custoFixoPP: 35,
    percentualPP: 7,
    descricao: 'Ajuda um aliado a superar um obstáculo ou executar uma ação.',
    icone: '🤝',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Ajuda um aliado a superar um obstáculo ou executar uma ação.',
      comoUtilizar: 'Identifique o aliado e descreva uma forma plausível de assistência.',
      requisitos: 'Aliado acessível e auxílio possível na situação.',
      teste: 'Teste cooperativo ou da aptidão adequada, quando necessário.',
      bonusPermitidos: 'Bônus de cooperação conforme a regra vigente.',
      condicoesSucesso: 'O aliado recebe o auxílio permitido pela mecânica.',
      consequenciasFalha: 'O auxílio não produz o efeito pretendido.',
      observacoes: 'Não criar bônus numéricos novos sem definição de regra.',
    },
  },
  {
    id: 'reposicionar',
    nome: 'Reposicionar-se',
    categoria: 'movimentacao',
    custoFixoPP: 30,
    percentualPP: 14,
    descricao: 'Muda de posição com cuidado para obter vantagem espacial ou reduzir exposição.',
    icone: '↩️',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Muda de posição com cuidado para obter vantagem espacial ou reduzir exposição.',
      comoUtilizar: 'Declare a nova posição e como pretende alcançá-la.',
      requisitos: 'Rota válida e espaço disponível.',
      teste: 'Teste de Agilidade ou aptidão pertinente em situações arriscadas.',
      bonusPermitidos: 'Aptidões de mobilidade podem facilitar.',
      condicoesSucesso: 'O personagem alcança uma posição taticamente favorável.',
      consequenciasFalha: 'Não alcança a posição ou fica exposto a consequências do cenário.',
      observacoes: 'Vantagem posicional depende das regras e do terreno.',
    },
  },
  {
    id: 'fintar',
    nome: 'Fintar',
    categoria: 'taticas',
    custoFixoPP: 30,
    percentualPP: 16,
    descricao: 'Engana o oponente com movimentos ou intenções falsas para criar abertura.',
    icone: '🪄',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Engana o oponente com movimentos ou intenções falsas para criar abertura.',
      comoUtilizar: 'Escolha o alvo e descreva a finta.',
      requisitos: 'Alvo capaz de perceber a finta e alcance adequado.',
      teste: 'Teste de habilidade marcial ou Agilidade contra defesa apropriada.',
      bonusPermitidos: 'Aptidões de combate e enganação podem se aplicar.',
      condicoesSucesso: 'O alvo é enganado e a abertura prevista pela regra é criada.',
      consequenciasFalha: 'O alvo não é enganado e mantém sua defesa.',
      observacoes: 'A vantagem exata deve respeitar a mecânica atual.',
    },
  },
  {
    id: 'bloquear',
    nome: 'Bloqueio',
    categoria: 'defensivas',
    custoFixoPP: 25,
    percentualPP: 16,
    descricao: 'Tenta absorver ou impedir um golpe com defesa adequada.',
    icone: '🛡️',
    reativa: true,
    detalhes: {
      descricaoCompleta: 'Tenta absorver ou impedir um golpe com defesa adequada.',
      comoUtilizar: 'Declare o bloqueio quando a reação for permitida.',
      requisitos: 'Ataque bloqueável e meios válidos de defesa.',
      teste: 'O jogador realiza um teste do sistema + aptidões relacionadas.',
      bonusPermitidos: 'Escudos e aptidões defensivas podem ajudar.',
      condicoesSucesso: 'O golpe é bloqueado ou mitigado conforme a regra.',
      consequenciasFalha: 'O bloqueio falha e o ataque segue sua resolução.',
      observacoes: 'Não pressupor bloqueio absoluto ou redução fixa de dano.',
    },
  },
  {
    id: 'aparar',
    nome: 'Aparar',
    categoria: 'defensivas',
    custoFixoPP: 25,
    percentualPP: 18,
    descricao: 'Desvia um ataque com arma ou técnica apropriada.',
    icone: '🗡️',
    reativa: true,
    detalhes: {
      descricaoCompleta: 'Desvia um ataque com arma ou técnica apropriada.',
      comoUtilizar: 'Declare a tentativa de aparar um ataque elegível.',
      requisitos: 'Ter meio apropriado para aparar e condições de reação.',
      teste: 'O jogador realiza um teste do sistema + precisão.',
      bonusPermitidos: 'Treinamento e equipamento adequado podem auxiliar.',
      condicoesSucesso: 'O ataque é desviado conforme a resolução.',
      consequenciasFalha: 'A tentativa falha e o ataque continua.',
      observacoes: 'Respeitar restrições de aparo contra ataques especiais.',
    },
  },
  {
    id: 'esquiva',
    nome: 'Esquiva',
    categoria: 'defensivas',
    custoFixoPP: 25,
    percentualPP: 20,
    descricao: 'Evita um ataque por deslocamento rápido e leitura do movimento inimigo.',
    icone: '💨',
    reativa: true,
    detalhes: {
      descricaoCompleta: 'Evita um ataque por deslocamento rápido e leitura do movimento inimigo.',
      comoUtilizar: 'Declare a esquiva no momento permitido.',
      requisitos: 'Possuir mobilidade e espaço para esquivar.',
      teste: 'Teste de Evasão ou Agilidade contra o ataque.',
      bonusPermitidos: 'Aptidões de evasão podem auxiliar.',
      condicoesSucesso: 'O ataque é evitado conforme o resultado.',
      consequenciasFalha: 'O personagem não consegue evitar o golpe.',
      observacoes: 'Respeitar efeitos que impeçam deslocamento ou reação.',
    },
  },
  {
    id: 'agarrar',
    nome: 'Agarrar / Empurrar',
    categoria: 'utilitarias',
    custoFixoPP: 30,
    percentualPP: 20,
    descricao: 'Controla fisicamente um alvo, tentando segurá-lo ou deslocá-lo à força.',
    icone: '🪢',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Controla fisicamente um alvo, tentando segurá-lo ou deslocá-lo à força.',
      comoUtilizar: 'Escolha agarrar ou empurrar e identifique o alvo.',
      requisitos: 'Alvo ao alcance e diferença de porte compatível com a regra.',
      teste: 'Teste físico resistido conforme regras de combate.',
      bonusPermitidos: 'Força e aptidões de luta corporal podem ajudar.',
      condicoesSucesso: 'O alvo é agarrado ou empurrado conforme o resultado.',
      consequenciasFalha: 'O alvo resiste e a tentativa não produz o efeito desejado.',
      observacoes: 'Distância empurrada e condições de agarrão seguem regras vigentes.',
    },
  },
  {
    id: 'atacar',
    nome: 'Atacar',
    categoria: 'ofensivas',
    custoFixoPP: 55,
    percentualPP: 8,
    descricao: 'Executa um ataque comum contra um alvo válido.',
    icone: '⚔️',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Executa um ataque comum contra um alvo válido.',
      comoUtilizar: 'Selecione o alvo e a forma de ataque; resolva acerto e dano.',
      requisitos: 'Alvo válido, alcance e meios de ataque disponíveis.',
      teste: 'Rolagem de ataque contra a defesa aplicável.',
      bonusPermitidos: 'Arma, atributos e aptidões podem modificar a rolagem.',
      condicoesSucesso: 'O ataque acerta e aplica os efeitos devidos.',
      consequenciasFalha: 'O ataque erra ou é defendido.',
      observacoes: 'Custo único da ação; não cobrar custo adicional de movimentação implícita.',
    },
  },
  {
    id: 'usar-habilidade',
    nome: 'Usar Habilidade / Arte',
    categoria: 'utilitarias',
    custoFixoPP: 30,
    percentualPP: 25,
    descricao: 'Ativa uma habilidade ou arte disponível ao personagem.',
    icone: '✨',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Ativa uma habilidade ou arte disponível ao personagem.',
      comoUtilizar: 'Selecione a habilidade e siga seus requisitos, alcance e efeitos.',
      requisitos: 'Habilidade disponível; recursos, recargas e condições atendidos.',
      teste: 'Teste indicado na própria habilidade, quando houver.',
      bonusPermitidos: 'Benefícios definidos pela habilidade ou arte.',
      condicoesSucesso: 'A habilidade resolve seus efeitos conforme a descrição.',
      consequenciasFalha: 'A ativação falha ou o efeito é resistido conforme a regra.',
      observacoes: 'Custo-base de PP; preservar outros recursos e restrições específicos.',
    },
  },
  {
    id: 'contra-ataque',
    nome: 'Contra-Ataque',
    categoria: 'ofensivas',
    custoFixoPP: 60,
    percentualPP: 15,
    descricao: 'Responde a uma abertura ou ataque inimigo com uma ofensiva imediata.',
    icone: '🛡️',
    reativa: true,
    detalhes: {
      descricaoCompleta: 'Responde a uma abertura ou ataque inimigo com uma ofensiva imediata.',
      comoUtilizar: 'Declare o contra-ataque na janela permitida pela mecânica.',
      requisitos: 'Condição de contra-ataque válida e capacidade de reagir.',
      teste: 'Teste de reação e ataque conforme a regra existente.',
      bonusPermitidos: 'Aptidões de reação e combate podem se aplicar.',
      condicoesSucesso: 'O contra-ataque é executado e resolvido normalmente.',
      consequenciasFalha: 'A janela é perdida ou o golpe não atinge o alvo.',
      observacoes: 'Não conceder contra-ataques ilimitados; preservar restrições.',
    },
  },
  {
    id: 'ataque-duplo',
    nome: 'Ataque Duplo',
    categoria: 'ofensivas',
    custoFixoPP: 70,
    percentualPP: 15,
    descricao: 'Executa dois ataques como parte de uma única ação especial.',
    icone: '✦',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Executa dois ataques como parte de uma única ação especial.',
      comoUtilizar: 'Escolha os alvos permitidos e resolva cada ataque conforme as regras.',
      requisitos: 'Condições, armas e alvos elegíveis para Ataque Duplo.',
      teste: 'Rolagem de ataque para cada golpe, se a mecânica atual exigir.',
      bonusPermitidos: 'Bônus aplicáveis a cada golpe conforme o sistema.',
      condicoesSucesso: 'Os ataques elegíveis são resolvidos, com efeitos individuais.',
      consequenciasFalha: 'Um ou ambos os golpes podem falhar.',
      observacoes: 'Cobrar PP uma vez pela ação inteira; não somar dois custos de Atacar.',
    },
  },
  {
    id: 'acao-extra',
    nome: 'Ação Extra',
    categoria: 'utilitarias',
    custoFixoPP: 80,
    percentualPP: 23,
    descricao: 'Concede uma ação adicional elegível conforme as restrições do sistema.',
    icone: '✧',
    reativa: false,
    detalhes: {
      descricaoCompleta: 'Concede uma ação adicional elegível conforme as restrições do sistema.',
      comoUtilizar: 'Ative a Ação Extra e escolha uma ação permitida pelo benefício.',
      requisitos: 'PP suficiente e demais limites de Ação Extra atendidos.',
      teste: 'A ação escolhida usa seus testes normais, se houver.',
      bonusPermitidos: 'Permite executar a ação adicional elegível sem novo custo de PP.',
      condicoesSucesso: 'A ação adicional é disponibilizada e executada quando válida.',
      consequenciasFalha: 'A ativação é recusada se não cumprir os requisitos.',
      observacoes: 'Preservar a regra de elegibilidade e impedir cobrança dupla.',
    },
  },
  {
    id: 'salvaguarda',
    nome: 'Salvaguarda',
    categoria: 'defensivas',
    custoFixoPP: 25,
    percentualPP: 10,
    descricao: 'Tenta resistir ou evitar um efeito perigoso mediante a defesa apropriada.',
    icone: '🛡️',
    reativa: true,
    detalhes: {
      descricaoCompleta: 'Tenta resistir ou evitar um efeito perigoso mediante a defesa apropriada.',
      comoUtilizar: 'Declare a salvaguarda quando o efeito ou a regra permitir.',
      requisitos: 'Existir uma condição válida para realizar salvaguarda.',
      teste: 'Teste de resistência ou salvaguarda apropriado ao efeito.',
      bonusPermitidos: 'Atributos, aptidões e proteções aplicáveis.',
      condicoesSucesso: 'O personagem resiste ou reduz o efeito conforme a regra.',
      consequenciasFalha: 'O efeito é aplicado conforme a consequência prevista.',
      observacoes: 'Não inventar imunidade; confirmar janelas e testes na mecânica existente.',
    },
  },
  {
    id: 'recuperar-se',
    nome: 'Recuperar-se',
    categoria: 'recuperacao',
    percentualPP: 0,
    descricao: 'Recupera Pontos de Prontidão conforme a mecânica específica existente.',
    icone: '💗',
    reativa: false,
    recupera: 0.2,
    detalhes: {
      descricaoCompleta: 'Recupera Pontos de Prontidão conforme a mecânica específica existente.',
      comoUtilizar: 'Declare Recuperar-se e siga as condições atuais do sistema.',
      requisitos: 'Respeitar os limites e condições de Recuperar-se.',
      teste: 'Conforme a mecânica atual, se houver teste.',
      bonusPermitidos: 'Restauração de PP conforme a regra existente.',
      condicoesSucesso: 'O personagem recupera a Prontidão prevista.',
      consequenciasFalha: 'Não recupera PP se os requisitos não forem cumpridos.',
      observacoes: 'Não atribuir custo híbrido; revisar a recuperação existente antes de mudar valores.',
    },
  },
  {
    id: 'descansar',
    nome: 'Descansar',
    categoria: 'recuperacao',
    custoFixoPP: 0,
    percentualPP: 0,
    descricao: 'Realiza um descanso breve ou prolongado que recupera os recursos previstos pelo sistema.',
    icone: '🌙',
    reativa: false,
    recupera: 1,
    detalhes: {
      descricaoCompleta: 'Realiza um descanso breve ou prolongado que recupera os recursos previstos pelo sistema.',
      comoUtilizar: 'Declare o descanso e cumpra suas condições de duração e segurança.',
      requisitos: 'Condições e restrições de descanso existentes atendidas.',
      teste: 'Sem teste, salvo condição especial prevista.',
      bonusPermitidos: 'Recuperação de 40% ou 80% dos status conforme implementação vigente.',
      condicoesSucesso: 'A recuperação prevista é aplicada.',
      consequenciasFalha: 'O descanso pode ser interrompido ou impedido por condições externas.',
      observacoes: 'GRÁTIS: 0 PP. Não alterar como Saúde, Energia e Fadiga são tratados atualmente.',
    },
  },
];

export const formatarCategoriaAcao = categoriaId => {
  const categoria = CATEGORIAS_ACOES_PRONTIDAO.find(item => item.id === categoriaId);
  return categoria?.label ?? 'Ação';
};

export const temCustoValido = acao => {
  if (acao?.id === 'recuperar-se' || acao?.id === 'descansar') {
    return true;
  }

  if (acao?.custoPendente) {
    return false;
  }

  return Boolean(acao?.id && CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]);
};

export const formatarCustoAcao = (acao = {}, ppMaximo = 0) => {
  if (acao?.id === 'recuperar-se' || acao?.id === 'descansar') {
    return '0 PP';
  }

  if (acao?.custoPendente || !acao?.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]) {
    return 'Custo pendente';
  }

  return `${calcularCustoPpAcao(ppMaximo, acao.id)} PP`;
};

export const criarDetalhesAcao = (acao = {}, ppMaximo = 0) => {
  const custoCalculado = acao.id === 'recuperar-se' || acao.id === 'descansar'
    ? 0
    : acao.custoPendente || !acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]
      ? 'Custo pendente'
      : calcularCustoPpAcao(ppMaximo, acao.id);

  const detalheBase = {
    nome: acao.nome || 'Ação',
    categoria: formatarCategoriaAcao(acao.categoria),
    descricaoCompleta: acao.descricao || 'A definir',
    comoUtilizar: 'A definir',
    requisitos: 'A definir',
    teste: 'A definir',
    bonusPermitidos: 'A definir',
    condicoesSucesso: 'A definir',
    consequenciasFalha: 'A definir',
    custoPercentualPP: 'A definir',
    custoCalculadoPP: custoCalculado === 'Custo pendente' ? 'Custo pendente' : `${custoCalculado} PP`,
    observacoes: 'A definir',
    tokens: getTokensAcao(acao),
  };

  if (acao.custoPendente || !acao.id || !CUSTOS_PROGRESSIVOS_PRONTIDAO[acao.id]) {
    detalheBase.custoPercentualPP = 'Custo pendente';
  } else {
    detalheBase.custoPercentualPP = formatarCustoAcao(acao, ppMaximo);
  }

  return {
    ...detalheBase,
    ...(acao.detalhes ?? {}),
  };
};

export const calcularPpMaximo = valorProntidao => Math.max(0, Number(valorProntidao ?? 0) || 0);

export const interpolarCustoProgressivo = (pp, ppInicial, ppFinal, custoInicial, custoFinal) => {
  const ppAlvo = Number(pp ?? 0);
  const ppInicio = Number(ppInicial ?? 10);
  const ppFim = Number(ppFinal ?? 315);
  const custoIni = Number(custoInicial ?? 0);
  const custoFim = Number(custoFinal ?? custoIni);

  if (!Number.isFinite(ppAlvo) || !Number.isFinite(ppInicio) || !Number.isFinite(ppFim) || !Number.isFinite(custoIni) || !Number.isFinite(custoFim)) {
    return 0;
  }

  if (ppAlvo <= 0 || ppInicio <= 0 || ppFim <= 0 || custoIni <= 0 || custoFim <= 0) {
    return 0;
  }

  const progresso = Math.log(ppAlvo / ppInicio) / Math.log(ppFim / ppInicio);
  const custo = custoIni * Math.pow(custoFim / custoIni, progresso);
  const arredondado = Math.round(custo);

  return Math.max(1, Math.min(arredondado, Math.max(1, Math.floor(ppAlvo))));
};

export const calcularCustoPpAcao = (ppMaximo, acaoOuPercentual = 0) => {
  const maximo = Math.max(0, Number(ppMaximo ?? 0) || 0);

  if (typeof acaoOuPercentual === 'string') {
    if (acaoOuPercentual === 'recuperar-se' || acaoOuPercentual === 'descansar') {
      return 0;
    }

    const configuracao = CUSTOS_PROGRESSIVOS_PRONTIDAO[acaoOuPercentual];
    if (!configuracao) {
      return 0;
    }

    const pp10 = Number(configuracao.pp10 ?? 0);
    const pp315 = Number(configuracao.pp315 ?? pp10);
    const pp5000 = Number(configuracao.pp5000 ?? pp315);

    if (maximo <= 10) {
      return Math.round((pp10 * maximo) / 10);
    }

    if (maximo <= 315) {
      return Math.round(interpolarCustoProgressivo(maximo, 10, 315, pp10, pp315));
    }

    return Math.round(interpolarCustoProgressivo(maximo, 315, 5000, pp315, pp5000));
  }

  return 0;
};

export const calcularRecuperacaoPp = (ppMaximo, percentual = 0.2) => {
  const maximo = Math.max(0, Number(ppMaximo ?? 0) || 0);
  const percentualNormalizado = Math.max(0, Number(percentual ?? 0) || 0);

  return Math.ceil(maximo * percentualNormalizado);
};

export const normalizarEstadoCombate = (personagem = {}, ppMaximo) => {
  const estado = personagem?.estadoCombate ?? {};
  const historico = Array.isArray(estado.historicoAcoes) ? estado.historicoAcoes : [];
  const turnoAtual = Number(estado.turno ?? 1) || 1;
  const ppAtualBase = Number(estado.ppAtual ?? ppMaximo ?? 0) || 0;
  const ppAtual = Math.min(Math.max(ppAtualBase, 0), Math.max(0, ppMaximo || 0));
  const acaoExtra = estado.acaoExtra && typeof estado.acaoExtra === 'object'
    ? {
        id: estado.acaoExtra.id ?? 'acao-extra',
        personagemId: estado.acaoExtra.personagemId ?? personagem?.id ?? null,
        turno: Number(estado.acaoExtra.turno ?? turnoAtual) || turnoAtual,
        custoPago: Number(estado.acaoExtra.custoPago ?? 0) || 0,
        limiteCusto: Number(estado.acaoExtra.limiteCusto ?? 0) || 0,
        usosRestantes: Number(estado.acaoExtra.usosRestantes ?? 0) || 0,
        status: estado.acaoExtra.status ?? 'pendente',
      }
    : null;

  return {
    turno: turnoAtual,
    ppAtual,
    recuperacaoUtilizada: Boolean(estado.recuperacaoUtilizada),
    descansando: Boolean(estado.descansando),
    historicoAcoes: historico.slice(0, 12),
    acaoExtra,
  };
};
