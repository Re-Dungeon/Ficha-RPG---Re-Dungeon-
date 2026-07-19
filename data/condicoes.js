/**
 * CONDICOES.JS - Sistema de Condições
 * Contém todas as condições negativas do jogo (sem Buffs)
 */

const CONDICOES_SISTEMA = {
  envenenado: {
    id: 'envenenado',
    nome: 'Envenenado',
    tipo: 'negativa',
    descricao: 'Toma dano ao longo do tempo enquanto o veneno está em seu corpo',
    danoTurno: 5,
    duracao: 10,
    reduções: {
      inteligencia: 0,
      percepcao: 0,
      ataque: 0
    },
    imagem: '☠️',
    cor: '#32cd32'
  },

  queimado: {
    id: 'queimado',
    nome: 'Queimado',
    tipo: 'negativa',
    descricao: 'Reduz defesa significativamente e causa dano contínuo',
    danoTurno: 8,
    duracao: 8,
    reduções: {
      defesa: -20,
      inteligencia: -10
    },
    imagem: '🔥',
    cor: '#ff4500'
  },

  congelado: {
    id: 'congelado',
    nome: 'Congelado',
    tipo: 'negativa',
    descricao: 'Reduz drasticamente a velocidade e agilidade de movimento',
    duracao: 6,
    reduções: {
      agilidade: -50,
      ataque: -15
    },
    imagem: '❄️',
    cor: '#00bfff'
  },

  atordoado: {
    id: 'atordoado',
    nome: 'Atordoado',
    tipo: 'negativa',
    descricao: 'Impossibilitado de agir normalmente, não pode atacar ou usar habilidades',
    duracao: 3,
    reduções: {
      inteligencia: -100,
      ataque: -100
    },
    imagem: '💫',
    cor: '#ffff00'
  },

  sangrando: {
    id: 'sangrando',
    nome: 'Sangrando',
    tipo: 'negativa',
    descricao: 'Ferida aberta que causa perda constante de vida',
    danoTurno: 3,
    duracao: 15,
    reduções: {
      vitalidade: -15
    },
    imagem: '🩸',
    cor: '#dc143c'
  },

  cegueira: {
    id: 'cegueira',
    nome: 'Cegueira',
    tipo: 'negativa',
    descricao: 'Impossibilitado de ver, reduz precisão e evasão drasticamente',
    duracao: 8,
    reduções: {
      percepcao: -50,
      ataque: -30,
      evasao: -30
    },
    imagem: '🚫',
    cor: '#000000'
  },

  silenciado: {
    id: 'silenciado',
    nome: 'Silenciado',
    tipo: 'negativa',
    descricao: 'Incapaz de usar magia ou habilidades que requerem fala',
    duracao: 5,
    reduções: {
      inteligencia: -50,
      magia: -100
    },
    imagem: '🤐',
    cor: '#808080'
  },

  paralizado: {
    id: 'paralizado',
    nome: 'Paralizado',
    tipo: 'negativa',
    descricao: 'Imobilizado no local, não pode se mover nem atacar',
    duracao: 4,
    reduções: {
      agilidade: -100,
      ataque: -100
    },
    imagem: '⚡',
    cor: '#ffff00'
  },

  maldito: {
    id: 'maldito',
    nome: 'Maldito',
    tipo: 'negativa',
    descricao: 'Amaldiçoado por força sombria, sofre redução geral em todos os atributos',
    duracao: 20,
    reduções: {
      forca: -20,
      vitalidade: -20,
      agilidade: -20,
      inteligencia: -20,
      percepcao: -20
    },
    imagem: '👿',
    cor: '#8b008b'
  },

  fraco: {
    id: 'fraco',
    nome: 'Fraco',
    tipo: 'negativa',
    descricao: 'Redução na força e resistência, ataques causam menos dano',
    duracao: 12,
    reduções: {
      forca: -30,
      ataque: -25
    },
    imagem: '😵',
    cor: '#d3d3d3'
  },

  doenca: {
    id: 'doenca',
    nome: 'Doença',
    tipo: 'negativa',
    descricao: 'Infectado por doença, reduz vitalidade e causa dano lento',
    danoTurno: 2,
    duracao: 25,
    reduções: {
      vitalidade: -25,
      percepcao: -15
    },
    imagem: '🦠',
    cor: '#9370db'
  },

  desarmado: {
    id: 'desarmado',
    nome: 'Desarmado',
    tipo: 'negativa',
    descricao: 'Perdeu sua arma, reduz ataque significativamente',
    duracao: 0,  // Até se rearmar
    reduções: {
      ataque: -50
    },
    imagem: '✋',
    cor: '#a9a9a9'
  },

  insano: {
    id: 'insano',
    nome: 'Insano',
    tipo: 'negativa',
    descricao: 'Sanidade abalada, ataques aleatórios ou redução de dano',
    duracao: 10,
    reduções: {
      inteligencia: -50,
      ataque: -20
    },
    imagem: '😵‍💫',
    cor: '#ff1493'
  },

  medo: {
    id: 'medo',
    nome: 'Medo',
    tipo: 'negativa',
    descricao: 'Paralisado pelo medo, reduz ataque e defesa',
    duracao: 7,
    reduções: {
      ataque: -25,
      defesa: -25
    },
    imagem: '😨',
    cor: '#4b0082'
  },

  amaldicoado: {
    id: 'amaldicoado',
    nome: '☠️ AMALDIÇOADO',
    tipo: 'maldição',
    descricao: 'O alvo é marcado por uma influência mística hostil que enfraquece todas as suas defesas naturais e sobrenaturais.',
    duracao: 3,
    raridade: 'Mítico',
    origem: 'Maldição Espontânea',
    aplicacao: 'Gatilho',
    imagem: 'https://i.imgur.com/WpP080f.png',
    cor: '#000000',
    modificadores: {
      resistenciasGerais: -50
    },
    efeitosPassivos: [
      'O alvo sofre efeitos negativos com maior intensidade',
      'Testes de resistência contra novos debuffs têm desvantagem'
    ],
    interacoes: {
      envenenado: 'dano aumentado',
      corrosao: 'ignora ainda mais defesa',
      medo: 'duração estendida',
      purificacao: 'remove imediatamente'
    },
    detalhes: 'Normalmente não pode ser resistido, apenas mitigado.',
    naoResistivel: true
  },

  stigma: {
    id: 'stigma',
    nome: 'STIGMA',
    tipo: 'maldição',
    descricao: 'O alvo é marcado por uma presença maligna que amplifica o dano recebido e enfraquece resistências, tornando-o um foco de punição.',
    duracao: 4, // Média entre 3 e 5
    raridade: 'Épico',
    origem: 'Maldição Espontânea',
    aplicacao: 'Gatilho',
    imagem: 'https://i.imgur.com/PZOVffm.png',
    cor: '#8b0000',
    modificadores: {
      danhoRecebidoAumento: 25,
      resistenciasGerais: -5
    },
    efeitosPassivos: [
      'Não pode receber escudos completos (escudos têm 50% de eficiência)',
      'Prioridade automática como alvo para inimigos inteligentes'
    ],
    interacoes: {
      maldito: 'aumenta o dano recebido para +25%',
      vulneravel: 'dano crítico contra o alvo +10%',
      bencao: 'não pode coexistir',
      protecaoSagrada: 'não pode coexistir'
    },
    detalhes: 'Chance base de 35%. Pode ser reaplicado para renovar a duração.',
    chance: 35
  },

  brancuraArcana: {
    id: 'brancuraArcana',
    nome: 'Brancura Arcana',
    tipo: 'maldição',
    descricao: 'Quem é afetado sente o mundo ficando silencioso, frio e distante, como se a realidade estivesse desligando camadas.',
    duracao: 0, // Condicional: Feitiços de Grau 9 ou Superior
    raridade: 'Mítico',
    origem: 'Maldição Espontânea',
    aplicacao: 'Automático',
    imagem: 'https://i.imgur.com/pJof2W7.png',
    cor: '#f0f8ff',
    modificadores: {
      testes_emocoes: -2,
      damhoMagicoOfensivo: -30,
      resistenciaMagia: 2,
      curamagica: -30
    },
    efeitosPassivos: [
      'Testes que envolvam emoções intensas sofrem redução',
      'Magia ofensiva perde potência',
      'Cura mágica restaura menos recursos'
    ],
    detalhes: 'Contato prolongado com áreas corrompidas, artefatos do colapso, rituais falhos ou exposição direta a Leukos instáveis',
    duracao_especial: 'Condicional: Feitiços de Grau 9 ou Superior'
  },

  purificar: {
    id: 'purificar',
    nome: 'PURIFICAR',
    tipo: 'bencao',
    descricao: 'O alvo é envolvido por uma energia purificadora que remove corrupções e restaura o equilíbrio do corpo e da mente.',
    duracao: 2,
    raridade: 'Épico',
    origem: 'Combinação',
    aplicacao: 'Gatilho',
    imagem: 'https://i.imgur.com/piUJSj3.png',
    cor: '#ffd700',
    modificadores: {
      remocaoDebuffs: 2,
      restauroHP: 10
    },
    efeitosPassivos: [
      'Imune a Definhar-se e Drenado enquanto durar'
    ],
    efeitosAtivos: [
      'Ativa imediatamente ao uso'
    ],
    interacoes: {
      drenado: 'remove',
      debilidade: 'remove',
      intoxicado: 'remove',
      exaustao: 'remove',
      putrefacao: 'reduz para Definhar-se'
    },
    detalhes: 'Aplicação direta em um alvo. Exige ação ativa. Não remove condições permanentes.'
  },

  banido: {
    id: 'banido',
    nome: 'BANIDO',
    tipo: 'efeito_temporal',
    descricao: 'O alvo é temporariamente excluído do fluxo da realidade, incapaz de agir, interagir ou ser afetado por ações comuns.',
    duracao: 2, // Média entre 1 e 3
    raridade: 'Mítico',
    origem: 'Maldição Espontânea',
    aplicacao: 'Automático',
    imagem: 'https://i.imgur.com/NenirBH.png',
    cor: '#000080',
    modificadores: {
      acoes: -100,
      movimento: -100
    },
    efeitosPassivos: [
      'O alvo existe fora do plano atual',
      'Não sofre dano direto enquanto estiver Banido',
      'Não pode recuperar HP, Mana ou recursos',
      'Incapaz de realizar ações',
      'Não pode atacar, defender ou usar habilidades',
      'Não pode ser alvo de efeitos positivos ou negativos comuns'
    ],
    interacoes: {
      atordoamento: 'remove automaticamente',
      medo: 'remove automaticamente',
      confusao: 'remove automaticamente',
      envenenamento: 'remove automaticamente',
      paralisia: 'não pode coexistir',
      petrificacao: 'não pode coexistir'
    },
    detalhes: 'Aplicado automaticamente ao atingir a condição específica. Não exige teste de resistência comum. Imune a reaplicação enquanto ativo.',
    duracao_especial: '1 a 3 turnos (definido pela habilidade ou ritual)',
    imune_resistencia: true
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONDICOES_SISTEMA };
}
