/**
 * RACAS.JS - Sistema de Raças
 * Contém todas as raças disponíveis no jogo com bônus e habilidades
 */

const RACAS_SISTEMA = {
  humano: {
    id: 'humano',
    nome: 'Humano',
    tipo: "Re'Geron",
    descricao: 'Versáteis e adaptáveis, os humanos se destacam pela capacidade de aprendizado rápido e flexibilidade',
    bonus: {
      forca: 0,
      vitalidade: 1,
      agilidade: 0,
      inteligencia: 0,
      percepcao: 0
    },
    habilidadesRaciais: [
      'Polivalência (Pode treinar qualquer habilidade 10% mais rápido)',
      'Aprendizado Rápido (Ganha +10% experiência)'
    ],
    imagem: '🧑',
    cor: '#d4a574'
  },

  elfo: {
    id: 'elfo',
    nome: 'Elfo',
    tipo: "Re'Geron",
    descricao: 'Elegantes e mágicos, os elfos possuem afinidade natural com a magia e visão aguçada',
    bonus: {
      forca: -1,
      vitalidade: 0,
      agilidade: 2,
      inteligencia: 1,
      percepcao: 1
    },
    habilidadesRaciais: [
      'Visão Noturna (Vê 50% melhor na escuridão)',
      'Afinidade Mágica (+15% dano mágico)'
    ],
    imagem: '🧝',
    cor: '#90ee90'
  },

  anao: {
    id: 'anao',
    nome: 'Anão',
    tipo: "Re'Geron",
    descricao: 'Fortes e resistentes, os anões são mestres da forja e resistem bem a magia',
    bonus: {
      forca: 2,
      vitalidade: 2,
      agilidade: -1,
      inteligencia: 0,
      percepcao: -1
    },
    habilidadesRaciais: [
      'Resistência à Magia (+20% resistência mágica)',
      'Maestria em Ferramentas (Fabrica itens 25% mais rápido)'
    ],
    imagem: '👨',
    cor: '#cd853f'
  },

  orc: {
    id: 'orc',
    nome: 'Orc',
    tipo: "Re'Geron",
    descricao: 'Selvagens e poderosos, os orcs são guerreiros natos com força bruta incomparável',
    bonus: {
      forca: 3,
      vitalidade: 1,
      agilidade: 0,
      inteligencia: -1,
      percepcao: -1
    },
    habilidadesRaciais: [
      'Fúria Tribal (+25% dano em ataques corpo-a-corpo)',
      'Vitalidade Selvagem (+15% regeneração de HP)'
    ],
    imagem: '👹',
    cor: '#228b22'
  },

  goblin: {
    id: 'goblin',
    nome: 'Goblin',
    tipo: "Re'Geron",
    descricao: 'Pequenos mas astutos, os goblins são ágeis e engenhosos em combate',
    bonus: {
      forca: -1,
      vitalidade: 0,
      agilidade: 2,
      inteligencia: 1,
      percepcao: 1
    },
    habilidadesRaciais: [
      'Astúcia Goblin (+20% ganho de ouro)',
      'Reflexos Rápidos (+10% evasão)'
    ],
    imagem: '👺',
    cor: '#32cd32'
  },

  tiefling: {
    id: 'tiefling',
    nome: 'Tiefling',
    tipo: "Re'Geron",
    descricao: 'Descendentes de seres infernais, possuem afinidade com magia sombria',
    bonus: {
      forca: 0,
      vitalidade: -1,
      agilidade: 1,
      inteligencia: 2,
      percepcao: 1
    },
    habilidadesRaciais: [
      'Herança Infernal (+20% dano com magia sombria)',
      'Resistência ao Fogo (+25% resistência ao fogo)'
    ],
    imagem: '😈',
    cor: '#8b008b'
  },

  draconico: {
    id: 'draconico',
    nome: 'Dracônico',
    tipo: "Re'Geron",
    descricao: 'Herdeiros do poder dos dragões, combinam força e magia em harmonia',
    bonus: {
      forca: 1,
      vitalidade: 2,
      agilidade: 0,
      inteligencia: 1,
      percepcao: 1
    },
    habilidadesRaciais: [
      'Herança Dracônica (+30% resistência a magia elemental)',
      'Sopro de Dragão (Habilidade de ataques em área)'
    ],
    imagem: '🐉',
    cor: '#ff4500'
  },

  felinido: {
    id: 'felinido',
    nome: 'Felinído',
    tipo: "Re'Geron",
    descricao: 'Felinos humanoides, ágeis e predadores por natureza',
    bonus: {
      forca: 1,
      vitalidade: 0,
      agilidade: 3,
      inteligencia: 0,
      percepcao: 2
    },
    habilidadesRaciais: [
      'Reflexos de Felino (+15% velocidade de ataque)',
      'Visão Aguçada (Detecta inimigos ocultos +25%)'
    ],
    imagem: '🐱',
    cor: '#ff8c00'
  },

  naga: {
    id: 'naga',
    nome: 'Naga',
    tipo: "Re'Geron",
    descricao: 'Seres serpentinos com domínio sobre a água e magia natural',
    bonus: {
      forca: 0,
      vitalidade: 1,
      agilidade: 1,
      inteligencia: 2,
      percepcao: 1
    },
    habilidadesRaciais: [
      'Domínio da Água (+20% dano com magia de água)',
      'Enrolamento Serpentino (Pode imobilizar inimigos)'
    ],
    imagem: '🐍',
    cor: '#00ced1'
  },

  sobrevivente: {
    id: 'sobrevivente',
    nome: 'Sobrevivente',
    tipo: "The Chaotical Gate",
    raridade: 'RARO',
    descricao: 'Você passou por algo que deveria ter te quebrado… mas não quebrou. Dor, perda, medo — tudo virou aprendizado. Hoje, seu corpo reata antes da mente, e seu instinto grita quando o perigo se aproxima.',
    imagem: 'https://i.imgur.com/SvoCbDq.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '5d6+10',
      vitalidade: '5d6+12',
      agilidade: '4d6+10',
      inteligencia: '4d6+10',
      percepcao: '4d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Casca Grossa',
        descricao: 'Você já passou por coisa pior.',
        efeito: 'Recebe +2 de Defesa ou +2 em testes para resistir dor, medo ou exaustão'
      },
      {
        nome: 'Sobrevivência Prática',
        descricao: 'Você sabe se virar mesmo sem recursos.',
        efeito: 'Em situações de escassez, recebe +2 em testes gerais relacionados à sobrevivência, rastreamento, improviso ou resistência'
      },
      {
        nome: 'Instinto de Sobrevivência',
        descricao: 'Seu corpo reage antes mesmo de você entender o que está acontecendo.',
        efeito: 'Uma vez por cena: reduzir dano drasticamente, agir antes do impacto ou detectar ameaça. Recebe +3 em uma rolagem defensiva'
      },
      {
        nome: 'Sangue Frio',
        descricao: 'Quando tudo desmorona, você se mantém firme.',
        efeito: 'Recebe +2 em testes de Vontade e Percepção em perigo extremo, pressão intensa ou risco de morte. Não sofre penalidades por medo ou pânico'
      }
    ],
    cor: '#228b22'
  },

  popstar: {
    id: 'popstar',
    nome: 'PopStar',
    tipo: "The Chaotical Gate",
    raridade: 'RARO',
    descricao: 'Você viveu sob luzes, câmeras e julgamentos constantes. Aprendeu a controlar sua imagem, influenciar pessoas e dominar ambientes sociais… mas nunca teve o luxo de desaparecer.',
    imagem: 'https://i.imgur.com/R3TsTwi.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '4d6+10',
      agilidade: '5d6+10',
      inteligencia: '5d6+10',
      percepcao: '5d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Presença Dominante',
        descricao: 'Você sabe como prender atenção e controlar o foco das pessoas.',
        efeito: 'Uma vez por cena, pode receber +3 em uma rolagem social (Persuasão, Manipulação, Performance ou Intimidação leve)'
      },
      {
        nome: 'Centro das Atenções',
        descricao: 'Você pode transformar qualquer situação em um palco.',
        efeito: 'Uma vez por cena: atrair atenção de múltiplos alvos, distrair inimigos. Inimigos recebem -2 para resistir à distração, aliados recebem +2 em ações coordenadas'
      },
      {
        nome: 'Fama',
        descricao: 'Seu rosto ou nome abre portas… ou cria problemas.',
        efeito: 'Pode conseguir acesso facilitado a locais, pessoas ou eventos. Pode pedir favores simples baseados em reconhecimento'
      },
      {
        nome: 'Leitura de Público',
        descricao: 'Você entende reações antes mesmo delas acontecerem.',
        efeito: 'Recebe +2 em Percepção em interações sociais. Identifica emoções dominantes de grupos sem rolagem'
      }
    ],
    cor: '#ff1493'
  },

  membroCla: {
    id: 'membroCla',
    nome: 'Membro de Clã',
    tipo: "The Chaotical Gate",
    raridade: 'RARO',
    descricao: 'Você nasceu dentro de uma tradição antiga. Disciplina, respeito e treinamento fizeram parte da sua vida desde cedo. Cada movimento seu carrega técnica, cada decisão carrega propósito.',
    imagem: 'https://i.imgur.com/2cfXudn.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '5d6+10',
      agilidade: '5d6+12',
      inteligencia: '4d6+10',
      percepcao: '4d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Treinamento Marcial',
        descricao: 'Seu corpo foi treinado para eficiência máxima.',
        efeito: 'Recebe +2 em ataques corpo a corpo'
      },
      {
        nome: 'Controle Interno',
        descricao: 'Você domina sua respiração, foco e emoções.',
        efeito: 'Recebe +2 em testes de Vontade e Percepção. Não sofre penalidades por pressão leve ou distrações'
      },
      {
        nome: 'Golpe Preciso',
        descricao: 'Você atinge pontos vitais com precisão.',
        efeito: 'Uma vez por sessão: ao acertar um ataque, causa +3 dados de dano ou ignora defesa leve'
      },
      {
        nome: 'Leitura de Movimento',
        descricao: 'Você antecipa ações pelo corpo do inimigo.',
        efeito: 'Recebe +2 em testes se sua reação for positiva. Identifica ataques previsíveis com mais facilidade'
      }
    ],
    cor: '#1e90ff'
  },

  periferia: {
    id: 'periferia',
    nome: 'Periferia',
    tipo: "The Chaotical Gate",
    raridade: 'COMUM',
    descricao: 'Você veio de um lugar onde sobreviver já era aprendizado. Cresceu cercado por improviso, pressão, barulho e realidade dura. Aprendeu cedo a ler o ambiente, perceber risco e agir antes que o problema cresça.',
    imagem: 'https://i.imgur.com/bCsVSqQ.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '4d6+10',
      agilidade: '5d6+10',
      inteligencia: '4d6+10',
      percepcao: '5d6+12',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Leitura de Ambiente',
        descricao: 'Você está acostumado a notar movimentações estranhas e intenções ocultas.',
        efeito: 'Uma vez por cena: +3 em rolagem de Percepção, Agilidade ou Inteligência ao identificar perigo, emboscada, fuga ou comportamento suspeito'
      },
      {
        nome: 'Contato nas Ruas',
        descricao: 'Você conhece alguém que consegue favores menores ou informações rápidas.',
        efeito: 'Uma vez por sessão: pode declarar um contato útil ligado ao submundo, bairro, comércio informal ou redes locais'
      },
      {
        nome: 'Jogo de Cintura',
        descricao: 'Você sabe lidar com situações improvisadas.',
        efeito: 'Quando não tiver a aptidão ideal, reduz o obstáculo em -2'
      },
      {
        nome: 'Anonimato',
        descricao: 'Ninguém espera muito de você no início — o que pode ser bom… ou ruim.',
        efeito: 'Dificuldade em ser levado a sério inicialmente (-2 em testes sociais formais), mas pode passar despercebido com facilidade (+2 em furtividade social)'
      }
    ],
    cor: '#696969'
  },

  estrangeiro: {
    id: 'estrangeiro',
    nome: 'Estrangeiro',
    tipo: "The Chaotical Gate",
    raridade: 'COMUM',
    descricao: 'Você não nasceu aqui. Cada rua, cada costume e cada expressão já foi um mistério. Enquanto outros vivem no automático, você observa. Entre dois mundos, você aprendeu a enxergar o que ninguém percebe.',
    imagem: 'https://i.imgur.com/nAlUvh5.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '4d6+10',
      agilidade: '4d6+10',
      inteligencia: '5d6+10',
      percepcao: '5d6+12',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Visão de Fora',
        descricao: 'Você enxerga padrões e falhas que os locais ignoram.',
        efeito: 'Uma vez por cena: pode perguntar ao mestre "O que está estranho aqui?" Recebe uma pista verdadeira + +3 na próxima ação relacionada'
      },
      {
        nome: 'Adaptabilidade Cultural',
        descricao: 'Você aprendeu a se ajustar rapidamente a novos ambientes.',
        efeito: 'Recebe +2 em testes sociais ou de percepção ao lidar com culturas diferentes, costumes desconhecidos ou situações fora do padrão'
      },
      {
        nome: 'Bagagem de Mundo',
        descricao: 'Você traz conhecimentos que outros não têm.',
        efeito: 'Uma vez por cena: pode declarar que conhece um idioma, um costume ou uma informação cultural relevante. Ganha vantagem narrativa na cena'
      },
      {
        nome: 'Olhar Deslocado',
        descricao: 'Você percebe incoerências com facilidade.',
        efeito: 'Recebe +2 em testes para detectar mentiras, padrões estranhos ou inconsistências'
      }
    ],
    cor: '#ff6347'
  },

  familiaConservadora: {
    id: 'familiaConservadora',
    nome: 'Família Conservadora',
    tipo: "The Chaotical Gate",
    raridade: 'COMUM',
    descricao: 'Você cresceu em um ambiente de regras claras, valores rígidos e expectativas altas. Sua criação te deu estrutura, disciplina e princípios… mas também limitou sua liberdade.',
    imagem: 'https://i.imgur.com/ZbrQPE5.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '5d6+10',
      agilidade: '4d6+10',
      inteligencia: '5d6+10',
      percepcao: '5d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Disciplina Familiar',
        descricao: 'Você foi criado com regras e constância.',
        efeito: 'Recebe +2 em testes de Vontade. Não sofre penalidades por distrações leves ou pressão emocional básica'
      },
      {
        nome: 'Boa Educação',
        descricao: 'Você sabe se portar e falar da forma "certa".',
        efeito: 'Recebe +2 em testes sociais formais (conversas sérias, autoridades, ambientes institucionais). Dificilmente causa má impressão inicial'
      },
      {
        nome: 'Pensamento Estruturado',
        descricao: 'Você foi ensinado a pensar antes de agir.',
        efeito: 'Uma vez por cena: pode receber +3 em uma rolagem de Inteligência ou Percepção ao analisar, planejar ou tomar decisões importantes'
      },
      {
        nome: 'Valores Inabaláveis',
        descricao: 'Você tem princípios fortes que guiam suas ações.',
        efeito: 'Recebe +2 para resistir manipulação, intimidação ou pressão social. Dificilmente muda de opinião sob influência externa'
      }
    ],
    cor: '#4169e1'
  },

  nobre: {
    id: 'nobre',
    nome: 'Nobre',
    tipo: "The Chaotical Gate",
    raridade: 'COMUM',
    descricao: 'Você nasceu cercado por poder, influência e expectativas. Aprendeu desde cedo que o mundo não funciona apenas com força… mas com conexões, palavras certas e decisões bem calculadas. Onde outros pedem, você negocia.',
    imagem: 'https://i.imgur.com/bCsVSqQ.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '5d6+10',
      vitalidade: '4d6+10',
      agilidade: '4d6+10',
      inteligencia: '5d6+12',
      percepcao: '4d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Etiqueta Impecável',
        descricao: 'Você sabe exatamente como se portar em qualquer ambiente formal.',
        efeito: 'Recebe +2 em testes sociais formais (negociação, diplomacia, influência em ambientes de elite)'
      },
      {
        nome: 'Mente Estratégica',
        descricao: 'Você está acostumado a pensar antes de agir.',
        efeito: 'Uma vez por cena: pode receber +3 em uma rolagem de Inteligência ou Percepção ao analisar situações, planejar ou antecipar movimentos'
      },
      {
        nome: 'Influência Familiar',
        descricao: 'Sua família abre portas — mesmo que isso tenha um preço.',
        efeito: 'Uma vez por sessão: pode conseguir acesso a locais restritos, garantir encontro com alguém importante ou obter apoio indireto. Sucesso automático em situações plausíveis'
      },
      {
        nome: 'Autoridade Natural',
        descricao: 'Sua presença impõe respeito imediato.',
        efeito: 'Em primeiro contato com NPCs de menor status, recebe +2 em testes sociais e dificilmente é ignorado'
      }
    ],
    cor: '#daa520'
  },

  estudante: {
    id: 'estudante',
    nome: 'Estudante',
    tipo: "The Chaotical Gate",
    raridade: 'COMUM',
    descricao: 'Você cresceu dentro da rotina comum: escola, responsabilidades, sonhos e incertezas. Aprendeu a equilibrar pressão, prazos e relações sociais enquanto tentava entender seu lugar no mundo. Você desenvolveu a capacidade de aprender rápido e se adaptar sempre.',
    imagem: 'https://i.imgur.com/Fs7sD1u.png',
    limiteAtributo: 150,
    atributosBase: {
      forca: '4d6+10',
      vitalidade: '4d6+10',
      agilidade: '4d6+10',
      inteligencia: '5d6+12',
      percepcao: '5d6+10',
      sorte: '5d20'
    },
    habilidadesRaciais: [
      {
        nome: 'Aprendizado Rápido',
        descricao: 'Você está acostumado a absorver informações sob pressão e aplicar na prática rapidamente.',
        efeito: 'Uma vez por cena: pode receber +3 em uma rolagem de Inteligência, Percepção ou Conhecimento ao estudar, analisar, resolver problemas ou entender situações novas'
      },
      {
        nome: 'Vida Cotidiana',
        descricao: 'Você sabe lidar com tarefas comuns, burocracias e ambientes sociais básicos sem dificuldade.',
        efeito: 'Sempre que estiver lidando com situações do dia a dia (transporte, compras, documentos, interações simples), recebe vantagem narrativa ou bônus leve a critério do mestre'
      },
      {
        nome: 'Improviso',
        descricao: 'Mesmo sem preparo ideal, você dá um jeito.',
        efeito: 'Uma vez por cena: pode refazer uma rolagem (exceto combate direto pesado), mantendo o melhor resultado'
      },
      {
        nome: 'Resiliência Acadêmica',
        descricao: 'Você está acostumado a lidar com pressão constante, prazos e cansaço mental.',
        efeito: 'Sempre que falhar em uma rolagem de Inteligência, Percepção ou Conhecimento: pode receber +2 imediato para transformar a falha em sucesso parcial (com consequência leve definida pelo mestre)'
      }
    ],
    cor: '#8b4513'
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RACAS_SISTEMA };
}
