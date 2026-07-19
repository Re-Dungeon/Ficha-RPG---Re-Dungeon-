/* ════════════════════════════════════════════════════════════════════════════════
   🧿 SISTEMA DE CONDIÇÕES - REDUNGEON
   Sistema Profissional de Status, Buffs, Debuffs, Maldições e Bênçãos
   ════════════════════════════════════════════════════════════════════════════════ */

/**
 * CATÁLOGO GLOBAL DE CONDIÇÕES
 * Todas as condições possíveis do sistema
 */
const RD_COND_CATALOGO = {
    // 🟢 BUFFS
    'aumento-ataque': {
        id: 'aumento-ataque',
        nome: 'Aumento de Ataque',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+15% Dano de Ataque, +10% Precisão',
        descricaoCompleta: 'O alvo recebe um aumento temporário em seu poder ofensivo, causando mais dano em ataques físicos ou habilidades ofensivas.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'dano-ataque', valor: 15 },
            { atributo: 'precisao', valor: 10 }
        ],
        efeitosPassivos: [
            'Ataques básicos causam dano aumentado',
            'Habilidades ofensivas físicas recebem bônus'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não acumula com outros buffs de Ataque do mesmo tipo',
            'Pode coexistir com Aumento de Velocidade e Chance Crítica'
        ],
        detalhesAplicacao: 'Aplicação direta. Não exige teste.',
        imagem: 'https://i.imgur.com/G4DEzNi.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'aumento-velocidade': {
        id: 'aumento-velocidade',
        nome: 'Aumento de Velocidade',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+20% Prontidão, +15% Agilidade',
        descricaoCompleta: 'O alvo se move e reage com mais rapidez, aumentando sua prontidão de ação e agilidade física.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'prontidao', valor: 20 },
            { atributo: 'agilidade', valor: 15 }
        ],
        efeitosPassivos: [
            'Maior chance de agir antes na rodada',
            'Melhora ações de esquiva e deslocamento'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não acumula com outros buffs de Velocidade',
            'Pode coexistir com Aumento de Ataque e Aumento de Defesa'
        ],
        detalhesAplicacao: 'Aplicação direta. Sem teste.',
        imagem: 'https://i.imgur.com/AkJCLaF.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'aumento-defesa': {
        id: 'aumento-defesa',
        nome: 'Aumento de Defesa',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+20% Defesa, +10% Resistências gerais',
        descricaoCompleta: 'O alvo fortalece sua postura defensiva, reduzindo o dano recebido e aumentando sua resistência a ataques.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'defesa', valor: 20 },
            { atributo: 'resistencias', valor: 10 }
        ],
        efeitosPassivos: [
            'Reduz dano físico recebido',
            'Melhora resistência contra efeitos hostis'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não acumula com outros buffs de Defesa',
            'Pode coexistir com Aumento de Ataque e Aumento de Velocidade'
        ],
        detalhesAplicacao: 'Aplicação direta. Sem teste.',
        imagem: 'https://i.imgur.com/TyNLqTE.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'invencibilidade': {
        id: 'invencibilidade',
        nome: 'Invencibilidade',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'Imune a danos e efeitos negativos',
        descricaoCompleta: 'O alvo torna-se completamente imune a danos e efeitos negativos por um curto período.',
        origem: 'Combinação',
        duracao: '1 Turno (máximo 2 em casos especiais)',
        raridade: 'Lendário',
        aplicacao: 'Gatilho',
        modificadores: [],
        efeitosPassivos: [
            'Não sofre empurrões, quedas ou controle de grupo',
            'Não perde HP, Mana ou recursos'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Remove automaticamente todos os debuffs ao ser aplicado',
            'Não pode coexistir com Vulnerável ou Stigma',
            'Suspende efeitos de dano contínuo (DoT)'
        ],
        detalhesAplicacao: 'Aplicação direta. Não pode ser reaplicada enquanto ativa.',
        imagem: 'https://i.imgur.com/C4nIkHD.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'imortalidade': {
        id: 'imortalidade',
        nome: 'Imortalidade',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'HP não pode cair abaixo de 1',
        descricaoCompleta: 'O alvo não pode morrer. Mesmo sofrendo dano letal, sua existência é mantida por uma força superior.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos (combate) ou permanente em eventos narrativos',
        raridade: 'Lendário',
        aplicacao: 'Gatilho',
        modificadores: [],
        efeitosPassivos: [
            'Continua sofrendo dano normalmente',
            'Continua recebendo debuffs e controle',
            'Não perde a consciência por dano'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Pode coexistir com debuffs e dano contínuo',
            'Não remove efeitos negativos ao ser aplicada',
            'Não pode coexistir com Banido'
        ],
        detalhesAplicacao: 'Aplicação direta. Não pode ser reaplicada enquanto ativa.',
        imagem: 'https://i.imgur.com/qHW9P1W.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'barreira': {
        id: 'barreira',
        nome: 'Barreira',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'Absorve dano antes que afete a vida',
        descricaoCompleta: 'Uma barreira de energia envolve o alvo, absorvendo dano antes que ele afete sua vida.',
        origem: 'Habilidade',
        duracao: '3 a 5 Turnos ou até absorver X de dano',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [],
        efeitosPassivos: [
            'Barreira não é afetada por dano contínuo (DoT)',
            'Dano excessivo não atravessa para o HP'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não acumula com outras Barreiras',
            'Pode coexistir com Aumento de Defesa e Regeneração',
            'Efeitos de Dissipar removem a Barreira'
        ],
        detalhesAplicacao: 'Aplicação direta. Sem teste.',
        imagem: 'https://i.imgur.com/ve2VIv0.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'resistencia-critica': {
        id: 'resistencia-critica',
        nome: 'Aumento de Resistência Crítica',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+25% Resistência a Crítico, -10% Dano crítico recebido',
        descricaoCompleta: 'O alvo fortalece seus pontos vitais e postura defensiva, reduzindo a chance e o impacto de golpes críticos recebidos.',
        origem: 'Habilidade',
        duracao: '3 a 5 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'resistencia-critico', valor: 25 }
        ],
        efeitosPassivos: [
            'Reduz a chance de sofrer acertos críticos',
            'Críticos recebidos causam menos dano'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não acumula com outros buffs de Resistência Crítica',
            'Pode coexistir com Aumento de Defesa e Barreira'
        ],
        detalhesAplicacao: 'Aplicação direta. Sem teste.',
        imagem: 'https://i.imgur.com/nwCAWID.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'furia': {
        id: 'furia',
        nome: 'Fúria',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+30% Dano de Ataque, +20% Chance de Crítico, -20% Defesa',
        descricaoCompleta: 'O alvo entra em um estado de fúria incontrolável, aumentando drasticamente seu poder ofensivo em troca de menor defesa e controle.',
        origem: 'Combinação',
        duracao: '2 a 4 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'dano', valor: 30 },
            { atributo: 'critico', valor: 20 },
            { atributo: 'defesa', valor: -20 }
        ],
        efeitosPassivos: [
            'Não pode usar ações defensivas complexas',
            'Prioriza ataques ofensivos'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não pode coexistir com Concentração ou Defesa Total',
            'Remove Medo ao ser aplicada',
            'Se combinado com Imortalidade, remove a penalidade de Defesa'
        ],
        detalhesAplicacao: 'Aplicação direta. Não pode ser cancelada voluntariamente.',
        imagem: 'https://i.imgur.com/YhKJoxh.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'concentracao': {
        id: 'concentracao',
        nome: 'Concentração',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+20% Precisão, +20% Resistência a efeitos mentais, +15% Chance de acerto crítico controlado',
        descricaoCompleta: 'O alvo entra em um estado de foco absoluto, melhorando precisão, controle e resistência a efeitos mentais.',
        origem: 'Habilidade',
        duracao: '3 a 5 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'precisao', valor: 20 },
            { atributo: 'resistencia-mental', valor: 20 },
            { atributo: 'critico', valor: 15 }
        ],
        efeitosPassivos: [
            'Reduz chance de falha de habilidades',
            'Mantém ações estáveis sob pressão'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Não pode coexistir com Fúria',
            'Remove Desatento e Desorientado ao ser aplicada',
            'Reduz duração de Confusão pela metade'
        ],
        detalhesAplicacao: 'Aplicação direta. Exige ação dedicada.',
        imagem: 'https://i.imgur.com/vBiYNXP.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'cura-continua': {
        id: 'cura-continua',
        nome: 'Cura Contínua',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'Recupera 15% do HP máximo por turno',
        descricaoCompleta: 'O alvo recupera vida gradualmente a cada turno enquanto o efeito estiver ativo.',
        origem: 'Habilidade',
        duracao: '3 a 6 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [],
        efeitosPassivos: [
            'Não pode exceder o HP máximo',
            'Cura reduzida se estiver sob ferimentos graves'
        ],
        efeitosAtivos: [
            'Estabiliza sangramentos leves',
            'Reduz impacto de dano contínuo'
        ],
        interacoes: [
            'Não funciona se estiver com Desacordado',
            'Reduz duração de Intoxicado em 1 turno',
            'Metade do efeito se estiver Eletrificado'
        ],
        detalhesAplicacao: 'Aplicação direta. Pode ser reaplicada (não acumula, apenas renova).',
        imagem: 'https://i.imgur.com/IZzAuCj.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'dissipar': {
        id: 'dissipar',
        nome: 'Dissipar',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'Remove 1 condição ativa do alvo',
        descricaoCompleta: 'Remove ou enfraquece efeitos ativos de um alvo, anulando buffs ou debuffs temporários.',
        origem: 'Habilidade',
        duracao: 'Efeito imediato',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [],
        efeitosPassivos: [
            'Caso não remova, reduz a duração da condição em 2 turnos'
        ],
        efeitosAtivos: [
            'Ativa imediatamente ao uso'
        ],
        interacoes: [
            'Remove buffs e debuffs temporários',
            'Não remove condições permanentes',
            'Não afeta estados narrativos'
        ],
        detalhesAplicacao: 'Aplicação direta em um alvo. Exige ação ativa.',
        imagem: 'https://i.imgur.com/U6jOchj.png',
        podeStack: false,
        temDuracao: false,
        exigeEvento: false
    },

    'furtividade': {
        id: 'furtividade',
        nome: 'Furtividade',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+3 Evasão, -5 Dificuldade para ser detectado',
        descricaoCompleta: 'O alvo se move de forma silenciosa e discreta, tornando-se difícil de detectar e atacar.',
        origem: 'Combinação',
        duracao: 'Até 3 Turnos ou até ser revelado',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'evasao', valor: 3 }
        ],
        efeitosPassivos: [
            'Não provoca ataques de oportunidade',
            'Movimentação silenciosa'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Quebrada ao atacar ou usar habilidade ofensiva',
            'Cancelada por Iluminado ou Revelado',
            'Reduz eficácia de Sentidos Aguçados'
        ],
        detalhesAplicacao: 'Exige ação dedicada. Não pode ser reaplicada enquanto ativa.',
        imagem: 'https://i.imgur.com/GLLljoM.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'revigorar': {
        id: 'revigorar',
        nome: 'Revigorar',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: '+20% Vigor, +15% Prontidão. Remove Debilidade, Drenado e Exaustão',
        descricaoCompleta: 'Uma onda de energia vital percorre o corpo do alvo, restaurando forças, removendo enfraquecimentos e fortalecendo a resistência temporariamente.',
        origem: 'Habilidade',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'vigor', valor: 20 },
            { atributo: 'prontidao', valor: 15 }
        ],
        efeitosPassivos: [
            '+20% Vigor e +15% Prontidão'
        ],
        efeitosAtivos: [
            'Ativa imediatamente ao uso'
        ],
        interacoes: [
            'Regride Corrupção em 1 estágio',
            'Remove Definhar-se',
            'Não remove Putrefação'
        ],
        detalhesAplicacao: 'Aplicação direta em um alvo. Exige ação ativa.',
        imagem: 'https://i.imgur.com/siyRduO.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'chance-critica': {
        id: 'chance-critica',
        nome: 'Chance Crítica',
        tipo: 'buff',
        categoria: 'buff',
        descricaoCurta: 'Aumenta chance crítica: Nível 1 +10% dano | Nível 2 +20% | Nível 3 +30% (Críticos amplificam: +20%, +35%, +50%)',
        descricaoCompleta: 'Aumenta a chance de acerto crítico ao reduzir o valor mínimo necessário para critar. Efeito Primário: +10% a +30% dano baseado no nível. Acerto Crítico amplifica: Nível 1 = +20%, Nível 2 = +35%, Nível 3 = +50%. Sinergia com Dano Crítico: +5% adicional em críticos por nível.',
        origem: 'Combinação',
        duracao: 'Definida pela fonte do buff (ex: 3 turnos, 1 cena)',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'critico', valor: 30 }
        ],
        efeitosPassivos: [],
        efeitosAtivos: [
            'Amplifica acertos críticos em +20% a +50% de dano dependendo do nível'
        ],
        interacoes: [
            'Sinergia com Dano Crítico: +5% de dano adicional em críticos por nível'
        ],
        detalhesAplicacao: 'Manual ou automática. Não consome ação extra após aplicada.',
        imagem: 'https://i.imgur.com/8pBmPFh.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    // 🔥 MALDIÇÕES E DEBUFFS ESPECIAIS

    'amaldicoado': {
        id: 'amaldicoado',
        nome: '☠️ AMALDIÇOADO',
        tipo: 'maldicion',
        descricaoCurta: 'Marcado por influência mística hostil. Resistências: –50%',
        descricaoCompleta: 'O alvo é marcado por uma influência mística hostil que enfraquece todas as suas defesas naturais e sobrenaturais.',
        origem: 'Maldição Espontânea',
        duracao: '3 Turnos',
        raridade: 'Mítico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'resistencias', valor: -50 }
        ],
        efeitosPassivos: [
            'O alvo sofre efeitos negativos com maior intensidade',
            'Testes de resistência contra novos debuffs têm desvantagem'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Envenenado: dano aumentado',
            'Corrosão: ignora ainda mais defesa',
            'Medo: duração estendida',
            'Purificação: remove imediatamente'
        ],
        detalhesAplicacao: 'Normalmente não pode ser resistido, apenas mitigado.',
        imagem: 'https://i.imgur.com/WpP080f.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        naoResistivel: true
    },

    'stigma': {
        id: 'stigma',
        nome: 'STIGMA',
        tipo: 'maldicion',
        descricaoCurta: '+25% Dano Recebido, -5 Resistências. Escudos têm 50% de eficiência',
        descricaoCompleta: 'O alvo é marcado por uma presença maligna que amplifica o dano recebido e enfraquece resistências, tornando-o um foco de punição.',
        origem: 'Maldição Espontânea',
        duracao: '3 a 5 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'dano-recebido', valor: 25 },
            { atributo: 'resistencias', valor: -5 }
        ],
        efeitosPassivos: [
            'Não pode receber escudos completos (escudos têm 50% de eficiência)',
            'Prioridade automática como alvo para inimigos inteligentes'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Se combinado com Maldição, aumenta o dano recebido para +25%',
            'Se combinado com Vulnerável, dano crítico contra o alvo +10%',
            'Não pode coexistir com Bênção ou Proteção Sagrada'
        ],
        detalhesAplicacao: 'Chance base de 35%. Pode ser reaplicado para renovar a duração.',
        imagem: 'https://i.imgur.com/PZOVffm.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        chance: 35
    },

    'brancura-arcana': {
        id: 'brancura-arcana',
        nome: 'Brancura Arcana',
        tipo: 'maldicion',
        descricaoCurta: 'Mundo silencioso e frio. Magia -30%, Emoções -2, Cura -30%',
        descricaoCompleta: 'Quem é afetado sente o mundo ficando silencioso, frio e distante, como se a realidade estivesse desligando camadas.',
        origem: 'Maldição Espontânea',
        duracao: 'Condicional - Feitiços de Grau 9 ou Superior',
        raridade: 'Mítico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'testes-emocoes', valor: -2 },
            { atributo: 'dano-magia-ofensiva', valor: -30 },
            { atributo: 'resistencia-magia', valor: 2 },
            { atributo: 'cura-magica', valor: -30 }
        ],
        efeitosPassivos: [
            'Testes que envolvam emoções intensas sofrem redução',
            'Magia ofensiva perde potência',
            'Cura mágica restaura menos recursos'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Removida ao sair da área de corrupção'
        ],
        detalhesAplicacao: 'Contato prolongado com áreas corrompidas, artefatos do colapso, rituais falhos ou exposição direta a Leukos instáveis.',
        imagem: 'https://i.imgur.com/pJof2W7.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: true
    },

    'purificar': {
        id: 'purificar',
        nome: 'PURIFICAR',
        tipo: 'bencao',
        descricaoCurta: 'Remove até 2 debuffs. Restaura 10% HP. Imune a Definhar-se',
        descricaoCompleta: 'O alvo é envolvido por uma energia purificadora que remove corrupções e restaura o equilíbrio do corpo e da mente.',
        origem: 'Combinação',
        duracao: '2 Turnos - Imunidade',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'cura-hp', valor: 10 }
        ],
        efeitosPassivos: [
            'Imune a Definhar-se e Drenado enquanto durar'
        ],
        efeitosAtivos: [
            'Ativa imediatamente ao uso',
            'Remove até 2 debuffs ativos do alvo'
        ],
        interacoes: [
            'Remove: Drenado, Debilidade, Intoxicado e Exaustão',
            'Reduz Putrefação para Definhar-se',
            'Não remove condições permanentes'
        ],
        detalhesAplicacao: 'Aplicação direta em um alvo. Exige ação ativa.',
        imagem: 'https://i.imgur.com/piUJSj3.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'banido': {
        id: 'banido',
        nome: 'BANIDO',
        tipo: 'temporal',
        descricaoCurta: 'Excluído do fluxo da realidade. Incapaz de agir ou ser afetado',
        descricaoCompleta: 'O alvo é temporariamente excluído do fluxo da realidade, incapaz de agir, interagir ou ser afetado por ações comuns.',
        origem: 'Maldição Espontânea',
        duracao: '1 a 3 Turnos (definido pela habilidade ou ritual)',
        raridade: 'Mítico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'acoes', valor: -100 },
            { atributo: 'movimento', valor: -100 }
        ],
        efeitosPassivos: [
            'O alvo existe fora do plano atual',
            'Não sofre dano direto enquanto estiver Banido',
            'Não pode recuperar HP, Mana ou recursos',
            'Incapaz de realizar ações',
            'Não pode atacar, defender ou usar habilidades',
            'Não pode ser alvo de efeitos positivos ou negativos comuns'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Remove automaticamente: Atordoamento, Medo, Confusão, Envenenamento',
            'Não pode coexistir com: Paralisia, Petrificação',
            'Efeitos de Duração continuam contando normalmente'
        ],
        detalhesAplicacao: 'Aplicado automaticamente ao atingir a condição específica. Não exige teste de resistência comum. Imune a reaplicação enquanto ativo.',
        imagem: 'https://i.imgur.com/NenirBH.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: true,
        imune_resistencia: true
    },

    // 🟦 ESTADOS

    'confuso': {
        id: 'confuso',
        nome: '🌀 CONFUSO',
        tipo: 'estado',
        descricaoCurta: 'Mente em desordem. Reação –5, Esquiva –5. Ações imprevisíveis',
        descricaoCompleta: 'A mente do alvo entra em desordem temporária, tornando decisões e ações imprevisíveis.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'reacao', valor: -5 },
            { atributo: 'esquiva', valor: -5 }
        ],
        efeitosPassivos: [
            'No início do turno, rola-se um teste ou dado de efeito',
            'Age normalmente / Perde a ação / Ataca um alvo aleatório ao alcance'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Medo: aumenta a chance de perder o turno',
            'Enraivecido: remove ações defensivas, favorece ataques aleatórios',
            'Silenciado: impede tentativas de reorganização mental por magia'
        ],
        detalhesAplicacao: 'Pode haver resistência mental para reduzir a duração em 1 turno.',
        imagem: 'https://i.imgur.com/2qREF92.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'cegueira': {
        id: 'cegueira',
        nome: '👁️ CEGUEIRA',
        tipo: 'estado',
        descricaoCurta: 'Perde visão. Precisão –50%, Esquiva –50%',
        descricaoCompleta: 'O alvo perde total ou parcialmente a visão funcional.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'N/A',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'precisao', valor: -50 },
            { atributo: 'esquiva', valor: -50 }
        ],
        efeitosPassivos: [
            'Falha automática em ações que dependem exclusivamente da visão',
            'Ataques à distância sofrem penalidade severa'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Surpresa: efeitos dobrados',
            'Confusão: ações tornam-se altamente erráticas',
            'Imobilizado: alvo fica praticamente indefeso'
        ],
        detalhesAplicacao: 'Alvos preparados ou com sentidos alternativos podem reduzir os efeitos.',
        imagem: 'https://i.imgur.com/1OoXNbX.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'surdez': {
        id: 'surdez',
        nome: '👂 SURDEZ',
        tipo: 'estado',
        descricaoCurta: 'Sem percepção auditiva. Reação –2, Táticos –2',
        descricaoCompleta: 'O alvo perde a capacidade de perceber sons relevantes ao combate.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'reacao', valor: -2 },
            { atributo: 'taticos', valor: -2 }
        ],
        efeitosPassivos: [
            'Não reage a comandos verbais',
            'Pode falhar em detectar inimigos fora do campo visual'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Cegueira: gera desorientação total',
            'Surpresa: praticamente garantida',
            'Confusão: piora tomada de decisão'
        ],
        detalhesAplicacao: 'Automático após dano sônico ou falha de resistência.',
        imagem: 'https://i.imgur.com/wXqrVZZ.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'silenciado-estado': {
        id: 'silenciado-estado',
        nome: '🔇 SILENCIADO',
        tipo: 'estado',
        descricaoCurta: 'Fluxo verbal bloqueado. Sem magia verbal nem habilidades com fala',
        descricaoCompleta: 'O fluxo verbal e arcano do alvo é bloqueado.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [],
        efeitosPassivos: [
            'Não pode conjurar magias verbais',
            'Habilidades que exigem fala falham automaticamente'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Vazamento Arcano: o vazamento se intensifica',
            'Concentração: é quebrada',
            'Impede reorganização mental'
        ],
        detalhesAplicacao: 'Gatilho específico ou efeito direto.',
        imagem: 'https://i.imgur.com/TnlOr0t.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'cansaco': {
        id: 'cansaco',
        nome: '😵‍💫 CANSAÇO',
        tipo: 'estado',
        descricaoCurta: 'Acúmulo de desgaste. Penalidades progressivas',
        descricaoCompleta: 'O corpo acumula desgaste até o colapso funcional.',
        origem: 'Evento',
        duracao: 'Até descanso adequado',
        raridade: 'Épico',
        aplicacao: 'Acúmulo',
        modificadores: [],
        efeitosPassivos: [
            'Leve: penalidades físicas leves',
            'Moderado: afeta reação',
            'Grave: afeta mente',
            'Exausto: colapso geral',
            'Penalidades aumentam com o nível'
        ],
        efeitosAtivos: [
            'Afeta praticamente todos os debuffs',
            'Amplifica Sangramento, Fraqueza, Sonolento'
        ],
        interacoes: [],
        detalhesAplicacao: 'Acúmulos por esforço ou falhas.',
        imagem: 'https://i.imgur.com/3TxAOwL.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false
    },

    'desacordado': {
        id: 'desacordado',
        nome: '💤 DESACORDADO',
        tipo: 'estado',
        descricaoCurta: 'Inconsciente. Incapaz de agir. Defesa –50%, Críticos +25%',
        descricaoCompleta: 'O alvo perde a consciência temporariamente, ficando incapaz de agir ou reagir ao combate.',
        origem: 'Combinação',
        duracao: '1 a 3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'defesa', valor: -50 },
            { atributo: 'criticos-contra', valor: 25 }
        ],
        efeitosPassivos: [
            'Incapaz de realizar ações',
            'Não pode se mover, atacar ou usar habilidades'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Remove automaticamente: Desorientado, Desatento, Medo',
            'Não pode coexistir com Atordoamento ou Banido'
        ],
        detalhesAplicacao: 'Chance base de 25%. Não acumula.',
        imagem: 'https://i.imgur.com/cPLo8L9.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        chance: 25
    },

    'drenado': {
        id: 'drenado',
        nome: 'DRENADO',
        tipo: 'estado',
        descricaoCurta: 'Energia vital sugada. HP –10%, Vigor –15%, Prontidão –15%',
        descricaoCompleta: 'A energia vital do alvo é constantemente sugada, reduzindo sua capacidade de lutar e se recuperar.',
        origem: 'Habilidade',
        duracao: '3 a 5 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'hp-maximo', valor: -10 },
            { atributo: 'vigor', valor: -15 },
            { atributo: 'prontidao', valor: -15 }
        ],
        efeitosPassivos: [
            'Cura recebida reduzida em 50%',
            'Regeneração natural anulada'
        ],
        efeitosAtivos: [
            'Perda de energia vital por turno'
        ],
        interacoes: [
            'Sinergia com Definhar-se e Putrefação',
            'Cancela Cura Contínua',
            'Dissipar reduz duração em 1 turno'
        ],
        detalhesAplicacao: 'Aplicação direta. Pode acumular até 2 vezes.',
        imagem: 'https://i.imgur.com/UrVRTgz.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false
    },

    'imunidade': {
        id: 'imunidade',
        nome: 'IMUNIDADE',
        tipo: 'estado',
        descricaoCurta: 'Imune a danos e debuffs. Ignora ameaças externas',
        descricaoCompleta: 'O alvo torna-se temporariamente imune a danos e efeitos negativos, ignorando completamente ameaças externas.',
        origem: 'Combinação',
        duracao: '1 a 2 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'imunidade-dano', valor: 100 },
            { atributo: 'imunidade-debuffs', valor: 100 }
        ],
        efeitosPassivos: [
            'Não sofre dano físico, mágico ou elemental',
            'Não pode receber novas condições negativas'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Cancela todos os debuffs ao ser aplicada',
            'Não pode coexistir com Fúria',
            'Dissipar comum falha'
        ],
        detalhesAplicacao: 'Aplicação direta. Exige ação completa.',
        imagem: 'https://i.imgur.com/xTNX4gp.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'azia': {
        id: 'azia',
        nome: 'AZIA',
        tipo: 'estado',
        descricaoCurta: 'Desconforto estomacal. Prontidão –10%, Concentração –10%',
        descricaoCompleta: 'O alvo sofre desconforto estomacal persistente, dificultando ações que exigem foco, esforço ou concentração.',
        origem: 'Evento',
        duracao: '2 a 4 Turnos',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'prontidao', valor: -10 },
            { atributo: 'concentracao', valor: -10 }
        ],
        efeitosPassivos: [
            'Chance de falha aumentada em ações complexas',
            'Não pode usar habilidades que exigem canalização longa'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Cancela Concentração ao ser aplicada',
            'Cura Contínua funciona normalmente',
            'Se combinado com Intoxicado, evolui para Náusea'
        ],
        detalhesAplicacao: 'Aplicação direta. Não acumula.',
        imagem: 'https://i.imgur.com/nQZtIdg.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'queda': {
        id: 'queda',
        nome: '⬇️ QUEDA',
        tipo: 'estado',
        descricaoCurta: 'Colisão com solo. Dano proporcional à altura',
        descricaoCompleta: 'O alvo sofre dano ao colidir violentamente com o solo após uma queda.',
        origem: 'Ambiente',
        duracao: 'Dano imediato no impacto',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'dano-queda', valor: 0 }
        ],
        efeitosPassivos: [
            'Aplica Atordoado (1 turno) se a queda for alta',
            'Pode aplicar Desorientado'
        ],
        efeitosAtivos: [
            'Ignora evasão',
            'Não pode ser bloqueado'
        ],
        interacoes: [
            'Furtividade é cancelada',
            'Imunidade ignora o dano',
            'Petrificar-se reduz o dano pela metade'
        ],
        detalhesAplicacao: 'Aplicação automática ao atingir o solo.',
        imagem: 'https://i.imgur.com/rHYdoMD.png',
        podeStack: false,
        temDuracao: false,
        exigeEvento: true
    },

    'acerto-critico': {
        id: 'acerto-critico',
        nome: 'Acerto Crítico',
        tipo: 'estado',
        descricaoCurta: 'Ataque crítico. Dano máximo automático',
        descricaoCompleta: 'Quando o jogador obtém um 6 na rolagem, o ataque se torna crítico e causa dano máximo automático, sem necessidade de rolar dano.',
        origem: 'Combinação',
        duracao: 'Até o ataque crítico ser resolvido',
        raridade: 'Comum',
        aplicacao: 'Chance',
        modificadores: [
            { atributo: 'dano', valor: 0 }
        ],
        efeitosPassivos: [
            'Enquanto ativo, o próximo ataque confirmado aplica dano máximo'
        ],
        efeitosAtivos: [
            'Não possui ativação manual',
            'É aplicado automaticamente ao cumprir a condição (rolar 6)'
        ],
        interacoes: [
            'Combina com Buffs de dano (o bônus soma ao dano máximo)',
            'Ignora penalidades de dano mínimo',
            'Não acumula com outros tipos de crítico alternativo'
        ],
        detalhesAplicacao: 'Ativa automaticamente ao tirar 6. Não requer gasto de recurso. Não pode ser prevenido ou negado por defesas comuns.',
        imagem: 'https://i.imgur.com/RKzdxAT.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: true
    },

    'dano-critico': {
        id: 'dano-critico',
        nome: '💥 Dano Crítico',
        tipo: 'estado',
        descricaoCurta: 'Críticos causam dano máximo. 1 ataque',
        descricaoCompleta: 'Enquanto ativo, permite que acertos críticos convertam o dano causado em dano máximo, em vez de rolar o valor.',
        origem: 'Habilidade',
        duracao: '1 Ataque',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'critico-dano-maximo', valor: 100 }
        ],
        efeitosPassivos: [
            'O efeito só dispara se ocorrer Acerto Crítico',
            'Sem Acerto Crítico, o buff não tem efeito'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Requer: Acerto Crítico',
            'Sem Acerto Crítico → sem Dano Crítico',
            'Buffs de dano alteram o valor máximo',
            'Reduções e resistências ainda se aplicam',
            'Não acumula com outros efeitos de dano crítico'
        ],
        detalhesAplicacao: 'O buff fica ativo no personagem. Ao ocorrer Acerto Crítico, o efeito é consumido. Pode ou não ser consumível (regra da fonte).',
        imagem: 'https://i.imgur.com/rg2r3uw.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'exausto': {
        id: 'exausto',
        nome: 'Exausto',
        tipo: 'estado',
        descricaoCurta: 'Sobrecarga física. Penalidade em testes (–3)',
        descricaoCompleta: 'O corpo do alvo entra em sobrecarga, reduzindo drasticamente sua capacidade de sustentar ações físicas e mentais.',
        origem: 'Habilidade',
        duracao: '1 Estágio - Descanso',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'testes-fisicos', valor: -3 },
            { atributo: 'testes-mentais', valor: -3 }
        ],
        efeitosPassivos: [
            'Ações consecutivas custam mais esforço (50%)',
            'Falhas se tornam mais prováveis sob pressão'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Fraqueza: amplia penalidades físicas',
            'Lentidão: reduz ainda mais o deslocamento',
            'Fragilizado: esforço causa desgaste adicional'
        ],
        detalhesAplicacao: 'Aplicado ao usar habilidades além do limite, permanecer em ambientes extremos ou falhar repetidamente em testes de resistência.',
        imagem: 'https://i.imgur.com/KGDjhBM.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'molhado': {
        id: 'molhado',
        nome: 'Molhado',
        tipo: 'estado',
        descricaoCurta: 'Encharcado. Agilidade –3, Deslocamento –4m',
        descricaoCompleta: 'O alvo está encharcado, com corpo e equipamentos cobertos por água, afetando mobilidade e interações elementais.',
        origem: 'Ambiente',
        duracao: 'Enquanto permanecer molhado',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'agilidade', valor: -3 },
            { atributo: 'deslocamento', valor: -4 }
        ],
        efeitosPassivos: [
            'Aumenta a eficácia de efeitos de frio, eletricidade e corrosão',
            'Reduz a eficácia de efeitos baseados em fogo ou calor'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Lentidão: aumenta a penalidade de movimento',
            'Corrosão: amplia área ou duração',
            'Muco Corrosivo Espesso: facilita aplicação e escalonamento',
            'Confusão: pode converter em restrição severa de movimento'
        ],
        detalhesAplicacao: 'Aplicado por imersão, chuva intensa, ataques de água ou falha em testes ambientais.',
        imagem: 'https://i.imgur.com/fdZG4z0.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'imobilizado': {
        id: 'imobilizado',
        nome: 'Imobilizado',
        tipo: 'estado',
        descricaoCurta: 'Preso ao local. Deslocamento zero, Agilidade –5',
        descricaoCompleta: 'O alvo perde completamente a capacidade de se mover, ficando preso ao local onde está.',
        origem: 'Habilidade',
        duracao: '1 a 2 Turnos',
        raridade: 'N/A',
        aplicacao: 'Chance',
        modificadores: [
            { atributo: 'deslocamento', valor: -100 },
            { atributo: 'agilidade', valor: -5 }
        ],
        efeitosPassivos: [
            'O alvo não pode se mover voluntariamente',
            'Pode realizar ações que não envolvam deslocamento'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Lentidão: facilita aplicação do Imobilizado',
            'Congelado: pode evoluir diretamente para Imobilizado',
            'Fragilizado: ataques contra o alvo recebem bônus situacional'
        ],
        detalhesAplicacao: 'Aplicado por habilidades de aprisionamento ou ao acumular Lentidão + Congelado simultaneamente.',
        imagem: 'https://i.imgur.com/sMDSCsX.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'vazamento-arcano': {
        id: 'vazamento-arcano',
        nome: 'Vazamento Arcano',
        tipo: 'estado',
        descricaoCurta: 'Energia mágica escapa. Mana –50%, Custo +50%',
        descricaoCompleta: 'A energia mágica do alvo escapa de forma descontrolada, reduzindo sua capacidade de sustentar e recuperar poder arcano.',
        origem: 'Evento',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'recuperacao-mana', valor: -50 },
            { atributo: 'custo-magia', valor: 50 }
        ],
        efeitosPassivos: [
            'Parte da energia mágica é perdida a cada turno',
            'Conjurações tornam-se instáveis sob pressão'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: acelera a perda de energia',
            'Flagelo de Água: amplifica o vazamento',
            'Medo: aumenta a chance de falha mágica',
            'Corrosão: pode afetar focos ou catalisadores mágicos'
        ],
        detalhesAplicacao: 'Aplicado ao falhar criticamente em magias, sofrer interrupção durante conjuração ou usar poder além do limite seguro.',
        imagem: 'https://i.imgur.com/UQwPROh.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'atordoado-estado': {
        id: 'atordoado-estado',
        nome: '🌀 ATORDOADO',
        tipo: 'estado',
        descricaoCurta: 'Choque físico/mental. Defesa –2, Reação –3',
        descricaoCompleta: 'O alvo sofre um choque físico ou mental que interrompe completamente sua capacidade de agir.',
        origem: 'Evento',
        duracao: '1 Turno',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'defesa', valor: -2 },
            { atributo: 'reacao', valor: -3 }
        ],
        efeitosPassivos: [
            'Não pode realizar ações no turno afetado',
            'Não pode realizar reações defensivas ativas (esquiva, bloqueio)'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: duração aumenta em +1 turno',
            'Imobilizado: alvo fica completamente indefeso',
            'Confusão: após o término, rola teste para evitar Confusão por 1 turno'
        ],
        detalhesAplicacao: 'Se o dano exceder um limiar físico ou mental definido pelo sistema, o estado é aplicado imediatamente.',
        imagem: 'https://i.imgur.com/Vp7es4D.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    // 🔴 DEBUFFS

    'enraivecido': {
        id: 'enraivecido',
        nome: '😡 ENRAIVECIDO',
        tipo: 'debuff',
        descricaoCurta: 'Agressividade cega. Ataque +2, Defesa –2, Testes mentais –1',
        descricaoCompleta: 'O alvo entra em um estado de agressividade cega.',
        origem: 'Evento',
        duracao: '2 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'ataque', valor: 2 },
            { atributo: 'defesa', valor: -2 },
            { atributo: 'testes-mentais', valor: -1 }
        ],
        efeitosPassivos: [
            'Prioriza ataques diretos',
            'Ignora ações defensivas complexas'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Provocado: sinergia total',
            'Confusão: comportamento caótico',
            'Medo: pode suprimir temporariamente'
        ],
        detalhesAplicacao: 'Automático ou falha emocional.',
        imagem: 'https://i.imgur.com/uHrWyWE.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'sonolento': {
        id: 'sonolento',
        nome: '😴 SONOLENTO',
        tipo: 'debuff',
        descricaoCurta: 'Luta para se manter alerta. Reação –3, Percepção –2',
        descricaoCompleta: 'O corpo e a mente do alvo lutam para se manter alertas.',
        origem: 'Habilidade',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Acúmulo',
        modificadores: [
            { atributo: 'reacao', valor: -3 },
            { atributo: 'percepcao', valor: -2 }
        ],
        efeitosPassivos: [
            'Pode falhar em esquivas',
            'Testes de atenção sofrem penalidade severa'
        ],
        efeitosAtivos: [
            'Chance de perder o turno'
        ],
        interacoes: [
            'Exausto: pode evoluir para inconsciência',
            'Surpresa: efeitos dobrados',
            'Medo: falhas mais frequentes'
        ],
        detalhesAplicacao: 'Chance de ativar ou efeito contínuo.',
        imagem: 'https://i.imgur.com/gVN5SHO.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false
    },

    'desatento': {
        id: 'desatento',
        nome: 'DESATENTO',
        tipo: 'debuff',
        descricaoCurta: 'Foco perdido. Precisão –25%, Percepção –40%',
        descricaoCompleta: 'O alvo perde foco momentaneamente, reduzindo sua capacidade de perceber e reagir a ameaças.',
        origem: 'Combinação',
        duracao: '2 a 4 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'precisao', valor: -25 },
            { atributo: 'percepcao', valor: -40 }
        ],
        efeitosPassivos: [
            'Dificuldade em detectar armadilhas e emboscadas'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Se aplicado novamente, renova a duração',
            'Se combinado com Desorientado, evolui para Confusão'
        ],
        detalhesAplicacao: 'Chance base de 30%. Não acumula.',
        imagem: 'https://i.imgur.com/i49VXCH.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        chance: 30
    },

    'desorientado': {
        id: 'desorientado',
        nome: 'DESORIENTADO',
        tipo: 'debuff',
        descricaoCurta: 'Sem noção espacial. Precisão –20%, Velocidade –15%, Esquiva –20%',
        descricaoCompleta: 'O alvo perde noção de espaço e tempo, tendo dificuldade para agir e se posicionar corretamente.',
        origem: 'Combinação',
        duracao: '1 a 3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'precisao', valor: -20 },
            { atributo: 'velocidade', valor: -15 },
            { atributo: 'esquiva', valor: -20 }
        ],
        efeitosPassivos: [
            '25% de chance de falhar em ações',
            'Movimento pode ser errático'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Se combinado com Medo, evolui para Pânico',
            'Se combinado com Desatento, evolui para Confusão',
            'Não pode coexistir com Foco Total'
        ],
        detalhesAplicacao: 'Chance base de 40%. Não acumula.',
        imagem: 'https://i.imgur.com/KIIqjJf.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        chance: 40
    },

    'eletrificado': {
        id: 'eletrificado',
        nome: '⚡ ELETRIFICADO',
        tipo: 'debuff',
        descricaoCurta: 'Descargas elétricas. Precisão –25%, Prontidão –30%',
        descricaoCompleta: 'O corpo do alvo é atravessado por descargas elétricas, causando dor, espasmos e dificuldade de controle motor.',
        origem: 'Habilidade',
        duracao: '2 a 4 Turnos',
        raridade: 'Comum',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'precisao', valor: -25 },
            { atributo: 'prontidao', valor: -30 }
        ],
        efeitosPassivos: [
            'Sofre dano elétrico leve por turno',
            '20% de chance de falhar ações físicas'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Se aplicado novamente, renova a duração',
            'Se combinado com Molhado, dobra o dano por turno',
            'Se combinado com Paralisado, vira Atordoado'
        ],
        detalhesAplicacao: 'Chance base de 35%. Pode acumular até 2 vezes.',
        imagem: 'https://i.imgur.com/O37KFQL.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false,
        chance: 35
    },

    'intoxicado': {
        id: 'intoxicado',
        nome: '☠️ INTOXICADO',
        tipo: 'debuff',
        descricaoCurta: 'Substância tóxica. Força –25%, Vitalidade –25%',
        descricaoCompleta: 'O alvo foi afetado por uma substância tóxica que enfraquece o corpo e causa dano progressivo.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos',
        raridade: 'Comum',
        aplicacao: 'Chance',
        modificadores: [
            { atributo: 'forca', valor: -25 },
            { atributo: 'vitalidade', valor: -25 }
        ],
        efeitosPassivos: [
            'Sofre dano de veneno por turno',
            'Cura recebida é reduzida em 20%'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Pode acumular até 3 vezes',
            'Se combinado com Sangramento, dano por turno +50%',
            'Evolui para Envenenado em 3 acúmulos'
        ],
        detalhesAplicacao: 'Chance base de 40%. Pode acumular.',
        imagem: 'https://i.imgur.com/kjFLcRt.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false,
        chance: 40
    },

    'definhar-se': {
        id: 'definhar-se',
        nome: 'DEFINHAR-SE',
        tipo: 'debuff',
        descricaoCurta: 'Deterioração lenta. HP –5% por turno, Força –10%, Vigor –10%',
        descricaoCompleta: 'O corpo do alvo começa a se deteriorar lentamente, perdendo vitalidade, força e capacidade de recuperação a cada turno.',
        origem: 'Combinação',
        duracao: '3 a 6 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'hp-maximo', valor: -5 },
            { atributo: 'forca', valor: -10 },
            { atributo: 'vigor', valor: -10 }
        ],
        efeitosPassivos: [
            'Cura recebida reduzida em 50%',
            'Não pode receber bônus de HP temporário'
        ],
        efeitosAtivos: [
            'Dano progressivo por turno'
        ],
        interacoes: [
            'Cancela Vigor ao ser aplicada',
            'Cura Contínua tem efeito reduzido',
            'Dissipar reduz duração em 2 turnos'
        ],
        detalhesAplicacao: 'Aplicação direta. Pode acumular até 3 vezes.',
        imagem: 'https://i.imgur.com/lwYOrH8.png',
        podeStack: true,
        temDuracao: true,
        exigeEvento: false
    },

    'putrefacao': {
        id: 'putrefacao',
        nome: 'PUTREFAÇÃO',
        tipo: 'debuff',
        descricaoCurta: 'Colapso orgânico. HP –10%, Força –20%, Vitalidade –20%, Defesa –15%',
        descricaoCompleta: 'O corpo do alvo entra em colapso orgânico, apodrecendo em vida e perdendo rapidamente vitalidade, resistência e controle corporal.',
        origem: 'Combinação',
        duracao: '2 a 4 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'hp-maximo', valor: -10 },
            { atributo: 'forca', valor: -20 },
            { atributo: 'vitalidade', valor: -20 },
            { atributo: 'defesa', valor: -15 }
        ],
        efeitosPassivos: [
            'Cura recebida reduzida em 75%',
            'Não pode receber buffs de HP ou resistência',
            'Sangramento é aplicado automaticamente'
        ],
        efeitosAtivos: [
            'Dano contínuo grave por turno'
        ],
        interacoes: [
            'Substitui Definhar-se automaticamente',
            'Cancela Vigor e Cura Contínua',
            'Dissipar comum falha (exige Purificação avançada)'
        ],
        detalhesAplicacao: 'Aplicação direta. Não acumula.',
        imagem: 'https://i.imgur.com/7qgtdD9.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'debilidade': {
        id: 'debilidade',
        nome: 'DEBILIDADE',
        tipo: 'debuff',
        descricaoCurta: 'Enfraquecimento geral. Força –20%, Agilidade –20%, Prontidão –20%',
        descricaoCompleta: 'O alvo sofre enfraquecimento geral, reduzindo sua capacidade física e mental de agir com eficiência.',
        origem: 'Combinação',
        duracao: '3 a 5 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'forca', valor: -20 },
            { atributo: 'agilidade', valor: -20 },
            { atributo: 'prontidao', valor: -20 }
        ],
        efeitosPassivos: [
            'Ações custam mais esforço',
            'Reduz chance de sucesso em testes físicos e mentais'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Cancela Vigor ao ser aplicada',
            'Pode coexistir com Exausto',
            'Concentração reduz seus efeitos pela metade'
        ],
        detalhesAplicacao: 'Aplicação direta. Não acumula.',
        imagem: 'https://i.imgur.com/WJdj0No.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'corrupcao': {
        id: 'corrupcao',
        nome: 'CORRUPÇÃO',
        tipo: 'debuff',
        descricaoCurta: 'Energia corruptora. HP –5%, Força –10%, Vigor –10%',
        descricaoCompleta: 'Uma energia corruptora invade o corpo do alvo, deteriorando gradualmente sua vitalidade até levá-lo à putrefação completa.',
        origem: 'Maldição Espontânea',
        duracao: '5 a 8 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'hp-maximo', valor: -5 },
            { atributo: 'forca', valor: -10 },
            { atributo: 'vigor', valor: -10 }
        ],
        efeitosPassivos: [
            'Cura recebida reduzida em 50%',
            'Regeneração natural anulada'
        ],
        efeitosAtivos: [
            'Dano progressivo por turno'
        ],
        interacoes: [
            'Substitui Definhar-se ao ser aplicada',
            'Evolui automaticamente para Putrefação',
            'Purificar reduz um estágio da Corrupção'
        ],
        detalhesAplicacao: 'Aplicação direta. Não acumula.',
        imagem: 'https://i.imgur.com/4OmnPyZ.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'praga': {
        id: 'praga',
        nome: 'PRAGA',
        tipo: 'debuff',
        descricaoCurta: 'Doença contagiosa. HP –5%, Força –10%, Vigor –10%, Prontidão –10%',
        descricaoCompleta: 'Uma doença altamente contagiosa se espalha pelo ambiente, enfraquecendo rapidamente todos os afetados.',
        origem: 'Combinação',
        duracao: '3 a 6 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'hp-maximo', valor: -5 },
            { atributo: 'forca', valor: -10 },
            { atributo: 'vigor', valor: -10 },
            { atributo: 'prontidao', valor: -10 }
        ],
        efeitosPassivos: [
            'Cura recebida reduzida em 50%',
            'Regeneração natural anulada'
        ],
        efeitosAtivos: [
            'Dano contínuo por turno'
        ],
        interacoes: [
            'Aplica Corrupção se durar mais de 3 turnos',
            'Pode coexistir com Drenado',
            'Purificar remove apenas de um alvo'
        ],
        detalhesAplicacao: 'Área de efeito. Pode se espalhar para alvos próximos.',
        imagem: 'https://i.imgur.com/E0xNcLs.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'petrificar-se': {
        id: 'petrificar-se',
        nome: 'PETRIFICAR-SE',
        tipo: 'debuff',
        descricaoCurta: 'Corpo em pedra. Movimento 0, Ações 0. Resistência +50%',
        descricaoCompleta: 'O corpo do alvo é transformado em pedra, anulando completamente seus movimentos e ações.',
        origem: 'Habilidade',
        duracao: '1 a 3 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'deslocamento', valor: 0 },
            { atributo: 'acoes', valor: 0 },
            { atributo: 'reacoes', valor: 0 },
            { atributo: 'resistencia-fisica', valor: 50 },
            { atributo: 'vulnerabilidade-contundente', valor: 25 }
        ],
        efeitosPassivos: [
            'Imune a empurrões e deslocamentos',
            'Resistência física aumentada em 50%',
            'Vulnerável a dano contundente (+25%)'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Cancela Furtividade, Fúria e Concentração',
            'Suspende efeitos de Cura Contínua',
            'Dissipar comum falha'
        ],
        detalhesAplicacao: 'Aplicação direta. Exige teste de resistência do alvo.',
        imagem: 'https://i.imgur.com/MWmS81W.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'fratura': {
        id: 'fratura',
        nome: 'FRATURA',
        tipo: 'debuff',
        descricaoCurta: 'Osso quebrado. Agilidade –30%, Prontidão –20%, Defesa –20%',
        descricaoCompleta: 'O alvo sofre a quebra de um osso ou articulação, comprometendo severamente sua mobilidade e eficiência em combate.',
        origem: 'Combinação',
        duracao: 'Até ser tratada ou 5-10 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'agilidade', valor: -30 },
            { atributo: 'prontidao', valor: -20 },
            { atributo: 'defesa', valor: -20 }
        ],
        efeitosPassivos: [
            'Movimento reduzido em 50%',
            'Ações físicas custam mais esforço',
            'Não pode correr ou saltar'
        ],
        efeitosAtivos: [
            'Dor intensa ao se mover'
        ],
        interacoes: [
            'Geralmente aplicada após Queda alta ou extrema',
            'Cancela Furtividade',
            'Cura Contínua tem efeito reduzido em 50%'
        ],
        detalhesAplicacao: 'Queda alta. Impacto crítico. Falha grave em teste físico.',
        imagem: 'https://i.imgur.com/C66Uv5L.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'panico': {
        id: 'panico',
        nome: 'PÂNICO',
        tipo: 'debuff',
        descricaoCurta: 'Medo extremo. Concentração –40%, Prontidão –25%, Precisão –20%',
        descricaoCompleta: 'O alvo é dominado por medo extremo, perdendo o controle racional e reagindo de forma instintiva e desordenada.',
        origem: 'Combinação',
        duracao: '2 a 4 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'concentracao', valor: -40 },
            { atributo: 'prontidao', valor: -25 },
            { atributo: 'precisao', valor: -20 }
        ],
        efeitosPassivos: [
            'Não pode manter habilidades canalizadas',
            'Ações estratégicas têm chance de falha',
            'Prioriza fuga ou ações defensivas'
        ],
        efeitosAtivos: [
            'No início do turno, rola teste: Falha → perde ação OU se move aleatoriamente'
        ],
        interacoes: [
            'Cancela Concentração e Fúria',
            'Não pode ser combinado com Furtividade',
            'Se combinado com Desorientado, pode evoluir para Colapso Mental'
        ],
        detalhesAplicacao: 'Exige teste de resistência mental.',
        imagem: 'https://i.imgur.com/jWm8hhK.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'muco': {
        id: 'muco',
        nome: 'Muco',
        tipo: 'debuff',
        descricaoCurta: 'Muco ácido espesso. Agilidade –3, Defesa –2',
        descricaoCompleta: 'Um muco ácido e espesso cobre o alvo, dificultando movimentos e fragilizando gradualmente materiais e defesas.',
        origem: 'Inimigo',
        duracao: '3 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'agilidade', valor: -3 },
            { atributo: 'defesa', valor: -2 }
        ],
        efeitosPassivos: [
            'O alvo tem sua mobilidade parcialmente comprometida',
            'Equipamentos afetados contam como fragilizados enquanto cobertos pelo muco'
        ],
        efeitosAtivos: [
            'A cada turno, o alvo pode gastar uma ação para tentar remover parcialmente o muco'
        ],
        interacoes: [
            'Molhado: aumenta a área afetada pelo muco',
            'Queimando: remove o muco rapidamente, mas causa dano colateral leve',
            'Congelado: endurece o muco, convertendo o efeito em penalidade maior de movimento'
        ],
        detalhesAplicacao: 'Aplicado por toque, ataque corporal, falha em teste ambiental ou exposição direta à secreção do sapo.',
        imagem: 'https://i.imgur.com/laAulBd.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'fraqueza': {
        id: 'fraqueza',
        nome: 'Fraqueza',
        tipo: 'debuff',
        descricaoCurta: 'Perda de firmeza. Força –3 em testes, Dano –1d',
        descricaoCompleta: 'O alvo perde firmeza física e energética, tendo sua força e resistência gradualmente comprometidas.',
        origem: 'Habilidade',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'forca', valor: -3 },
            { atributo: 'dano', valor: -1 }
        ],
        efeitosPassivos: [
            'Esforços prolongados exigem mais do corpo, acelerando o cansaço'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: dobra a penalidade em testes físicos',
            'Fragilizado: ataques contra o alvo recebem bônus situacional'
        ],
        detalhesAplicacao: 'Aplicado ao falhar em testes físicos críticos, sofrer certos debuffs cumulativos ou por habilidades específicas.',
        imagem: 'https://i.imgur.com/IvWgvgB.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'fragilizado': {
        id: 'fragilizado',
        nome: 'Fragilizado',
        tipo: 'debuff',
        descricaoCurta: 'Integridade comprometida. Defesa 50%, Tolerância com desvantagem',
        descricaoCompleta: 'A integridade física ou defensiva do alvo é comprometida, tornando-o mais suscetível a impactos e efeitos hostis.',
        origem: 'Evento',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'defesa', valor: -50 }
        ],
        efeitosPassivos: [
            'Ataques contra o alvo ignoram parte da defesa'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Fraqueza: amplia penalidades ofensivas',
            'Exausto: ataques sofridos causam maior desgaste',
            'Corrosão: acelera deterioração de equipamentos'
        ],
        detalhesAplicacao: 'Aplicado ao sofrer dano repetido do mesmo tipo, ataques precisos ou efeitos que degradam matéria.',
        imagem: 'https://i.imgur.com/LcjXmn7.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'lentidao': {
        id: 'lentidao',
        nome: 'Lentidão',
        tipo: 'debuff',
        descricaoCurta: 'Movimentos reduzidos. Deslocamento 50%, Agilidade –40%',
        descricaoCompleta: 'O alvo tem seus movimentos e reações reduzidos, agindo de forma atrasada e previsível.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'Raro',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'deslocamento', valor: -50 },
            { atributo: 'agilidade', valor: -40 }
        ],
        efeitosPassivos: [
            'Reações são mais difíceis de executar',
            'Ações que exigem reposicionamento custam mais'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: reduz ainda mais o deslocamento',
            'Fragilizado: dificulta reposicionamento defensivo'
        ],
        detalhesAplicacao: 'Aplicado por efeitos de controle de movimento, falha em testes de agilidade ou contato com substâncias densas.',
        imagem: 'https://i.imgur.com/o6yMP8b.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'corrosao': {
        id: 'corrosao',
        nome: 'Corrosão',
        tipo: 'debuff',
        descricaoCurta: 'Matéria degrada. Defesa –1d12+4, Testes equipamentos –3',
        descricaoCompleta: 'A matéria do alvo começa a se degradar lentamente, enfraquecendo equipamentos e defesas.',
        origem: 'Inimigo',
        duracao: '3 Turnos',
        raridade: 'Épico',
        aplicacao: 'Automático',
        modificadores: [
            { atributo: 'defesa', valor: -5 }
        ],
        efeitosPassivos: [
            'Equipamentos corroídos contam como danificados enquanto o efeito persistir'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Fragilizado: acelera a perda defensiva',
            'Fraqueza: amplia o impacto da degradação'
        ],
        detalhesAplicacao: 'Aplicado por contato com substâncias corrosivas ou exposição contínua a ambientes degradantes.',
        imagem: 'https://i.imgur.com/aA9NUXO.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'flagelo-agua': {
        id: 'flagelo-agua',
        nome: 'Flagelo de Água',
        tipo: 'debuff',
        descricaoCurta: 'Água drexa vitalidade. Vigor recuperação –50%',
        descricaoCompleta: 'A água drena o ritmo vital do alvo, sufocando sua capacidade de recuperar vigor e sustentar ações físicas.',
        origem: 'Maldição Espontânea',
        duracao: '3 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'recuperacao-vigor', valor: -50 }
        ],
        efeitosPassivos: [
            'A recuperação de Vigor ocorre de forma lenta e irregular',
            'A barra de Vigor apresenta sinais visuais do efeito (ex: brilho azulado)'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: acelera o colapso físico',
            'Molhado: prolonga a duração do Flagelo',
            'Lentidão: dificulta ainda mais esquivas e reposicionamento'
        ],
        detalhesAplicacao: 'Aplicado ao ser atingido por habilidades aquáticas malditas, permanecer em zonas de água profana ou falhar em testes de resistência espiritual/física.',
        imagem: 'https://i.imgur.com/b1aHQ0V.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'congelado': {
        id: 'congelado',
        nome: 'Congelado',
        tipo: 'debuff',
        descricaoCurta: 'Frio extremo. Deslocamento –50%, Agilidade –3, Reação –3',
        descricaoCompleta: 'O corpo do alvo é tomado por frio extremo, endurecendo músculos e articulações e limitando severamente a mobilidade.',
        origem: 'Habilidade',
        duracao: '2 Turnos',
        raridade: 'Épico',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'deslocamento', valor: -50 },
            { atributo: 'agilidade', valor: -3 },
            { atributo: 'reacao', valor: -3 }
        ],
        efeitosPassivos: [
            'Ações físicas rápidas tornam-se difíceis ou atrasadas',
            'Esquivas e reposicionamentos são menos eficazes'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Molhado: aumenta a duração ou a intensidade do Congelado',
            'Lentidão: pode evoluir para imobilização temporária',
            'Fragilizado: impactos físicos causam maior efeito'
        ],
        detalhesAplicacao: 'Aplicado por ataques de gelo, falha em testes de resistência ao frio ou exposição prolongada a ambientes congelantes.',
        imagem: 'https://i.imgur.com/6Ug5hFT.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'queimando': {
        id: 'queimando',
        nome: 'Queimando',
        tipo: 'debuff',
        descricaoCurta: 'Chamas consomem. Dano 30% por turno. Concentração –3',
        descricaoCompleta: 'Chamas consomem o corpo e os equipamentos do alvo, causando dano contínuo e forçando decisões rápidas.',
        origem: 'Habilidade',
        duracao: '3 Turnos',
        raridade: 'Épico',
        aplicacao: 'Chance',
        modificadores: [
            { atributo: 'concentracao', valor: -3 }
        ],
        efeitosPassivos: [
            'Equipamentos inflamáveis correm risco de dano',
            'Ações defensivas sob pressão se tornam mais difíceis'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Molhado: remove ou reduz Queimando imediatamente',
            'Corrosão: gera dano colateral adicional',
            'Exausto: acelera o colapso físico'
        ],
        detalhesAplicacao: 'Aplicado ao sofrer dano de fogo, explosões ou falhar em testes contra efeitos incendiários.',
        imagem: 'https://i.imgur.com/axT9lFV.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false,
        chance: 40
    },

    'paralisado': {
        id: 'paralisado',
        nome: 'Paralisado',
        tipo: 'debuff',
        descricaoCurta: 'Sistema nervoso colapso. Incapaz de agir. Defesa –3d',
        descricaoCompleta: 'O sistema nervoso do alvo entra em colapso temporário, impedindo qualquer ação voluntária.',
        origem: 'Item',
        duracao: '1 Turno',
        raridade: 'N/A',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'acoes', valor: -100 },
            { atributo: 'defesa', valor: -3 }
        ],
        efeitosPassivos: [
            'O alvo não pode realizar ações, reações ou movimentos',
            'Falha automática em testes físicos'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: aumenta a duração',
            'Fragilizado: ataques causam efeito máximo',
            'Medo (se existir): facilita aplicação'
        ],
        detalhesAplicacao: 'Aplicado por falha crítica em resistências, venenos específicos ou habilidades de alto risco.',
        imagem: 'https://i.imgur.com/Y4riPp8.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'medo': {
        id: 'medo',
        nome: 'Medo',
        tipo: 'debuff',
        descricaoCurta: 'Dominado pelo medo. Vontade –3, Sanidade –3, Ataque –3',
        descricaoCompleta: 'O alvo é dominado pelo medo, tendo sua capacidade de agir com clareza e firmeza seriamente comprometida.',
        origem: 'Evento',
        duracao: '2 Turnos',
        raridade: 'N/A',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'vontade', valor: -3 },
            { atributo: 'sanidade', valor: -3 },
            { atributo: 'ataque', valor: -3 }
        ],
        efeitosPassivos: [
            'O alvo evita aproximação voluntária da fonte do medo, se possível',
            'Ações ofensivas diretas exigem esforço emocional adicional'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: aumenta a duração do Medo',
            'Fraqueza: amplia penalidades físicas',
            'Paralisado: Medo pode evoluir para Paralisia por pânico extremo',
            'Imobilizado: dificulta tentativas de se libertar'
        ],
        detalhesAplicacao: 'Aplicado ao falhar em testes contra intimidação, presenciar eventos traumáticos ou enfrentar entidades aterradoras.',
        imagem: 'https://i.imgur.com/ZKZR5ou.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'envenenado': {
        id: 'envenenado',
        nome: 'Envenenado',
        tipo: 'debuff',
        descricaoCurta: 'Toxina circula. Dano por turno. Atletismo –5, Acrobacia –5',
        descricaoCompleta: 'Uma toxina circula pelo corpo do alvo, causando deterioração progressiva e comprometendo suas capacidades físicas.',
        origem: 'Item',
        duracao: '3 Turnos',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'atletismo', valor: -5 },
            { atributo: 'acrobacia', valor: -5 }
        ],
        efeitosPassivos: [
            'A condição se agrava se o alvo realizar esforço físico intenso',
            'Recuperações naturais são menos eficazes'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Exausto: acelera o dano e a degradação',
            'Fraqueza: amplia penalidades físicas',
            'Corrosão: toxinas ácidas podem gerar efeitos combinados',
            'Molhado: certos venenos se espalham ou persistem mais'
        ],
        detalhesAplicacao: 'Aplicado por mordida, perfuração, ingestão, inalação ou contato com toxinas.',
        imagem: 'https://i.imgur.com/p22SNdG.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'provocado': {
        id: 'provocado',
        nome: '🔥 PROVOCADO',
        tipo: 'debuff',
        descricaoCurta: 'Atenção forçada. Táticos –2',
        descricaoCompleta: 'O alvo tem sua atenção e agressividade forçadas contra um inimigo específico.',
        origem: 'Habilidade',
        duracao: '1 Turno',
        raridade: 'Raro',
        aplicacao: 'Gatilho',
        modificadores: [
            { atributo: 'taticos', valor: -2 }
        ],
        efeitosPassivos: [
            'Deve priorizar ataques contra o provocador',
            'Ignora alvos alternativos se puder alcançar o provocador'
        ],
        efeitosAtivos: [],
        interacoes: [
            'Concentração: 50% de chance de ignorar a provocação',
            'Medo: o alvo tenta atacar, mas pode falhar ou hesitar',
            'Enraivecido: aumenta a agressividade e remove qualquer hesitação'
        ],
        detalhesAplicacao: 'O alvo pode resistir com teste mental ou social, se aplicável.',
        imagem: 'https://i.imgur.com/CbRWsQ9.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'sangramento': {
        id: 'sangramento',
        nome: '🩸 SANGRAMENTO',
        tipo: 'debuff',
        descricaoCurta: 'Ferimentos abertos. Dano por turno',
        descricaoCompleta: 'O alvo sofre perda constante de vitalidade devido a ferimentos abertos.',
        origem: 'Item',
        duracao: '3 Turnos',
        raridade: 'Comum',
        aplicacao: 'Automático',
        modificadores: [],
        efeitosPassivos: [
            'Sofre dano direto por turno (50% do dano causado)',
            'Parte da defesa é ignorada'
        ],
        efeitosAtivos: [
            'Ações físicas intensas aumentam o dano'
        ],
        interacoes: [
            'Exausto: dano aumentado',
            'Fraqueza: duração estendida',
            'Envenenado: efeitos se somam'
        ],
        detalhesAplicacao: 'Pode ser resistido parcialmente por armadura pesada ou habilidades defensivas.',
        imagem: 'https://i.imgur.com/ZOu7ve8.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    // ⚪ ESTADOS - BENÉFICOS

    'descanso': {
        id: 'descanso',
        nome: '😴 DESCANSO',
        tipo: 'estado',
        descricaoCurta: 'Estado de recuperação. Regenera HP, Energia e reduz Fadiga',
        descricaoCompleta: 'Estado de recuperação física e mental. Ao permanecer em repouso por horas, o personagem recupera vida, energia e reduz fadiga gradualmente.',
        origem: 'Combinação',
        duracao: 'horas Tempo Real',
        raridade: 'Comum',
        aplicacao: 'Manual',
        modificadores: [
            { atributo: 'velocidade-reacao', valor: -70 },
            { atributo: 'percepcao', valor: -50 },
            { atributo: 'defesa', valor: -40 }
        ],
        efeitosPassivos: [
            'Recupera HP baseado no tempo de descanso',
            'Recupera Energia / Mana gradualmente',
            'Reduz níveis de Fadiga',
            'Aumenta estabilidade mental',
            'O corpo entra em estado de regeneração natural'
        ],
        efeitosAtivos: [
            'Pode encerrar o descanso antecipadamente',
            'Recebe apenas a porcentagem de recuperação correspondente ao tempo descansado'
        ],
        interacoes: [
            'Com Meditação: +30% recuperação de energia',
            'Com Regeneração: +25% recuperação de HP',
            'Com Ferimento Grave: reduz recuperação em 50%',
            'Receber dano: interrompe imediatamente o descanso'
        ],
        detalhesAplicacao: 'Personagem deve estar fora de combate, em repouso e não realizar ações físicas intensas. Qualquer dano ou ação intensa cancela o estado.',
        imagem: 'https://i.imgur.com/X3YVy1G.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'meditacao': {
        id: 'meditacao',
        nome: '🧘 MEDITAÇÃO',
        tipo: 'estado',
        descricaoCurta: 'Foco mental profundo. +Recuperação de Energia, +Resistência Mental',
        descricaoCompleta: 'O personagem entra em um estado profundo de foco mental, acelerando a recuperação de energia espiritual e aumentando estabilidade emocional.',
        origem: 'Ambiente',
        duracao: 'até 6 horas Tempo Real',
        raridade: 'Raro',
        aplicacao: 'Manual',
        modificadores: [
            { atributo: 'velocidade-reacao', valor: -60 },
            { atributo: 'percepcao', valor: -40 }
        ],
        efeitosPassivos: [
            'Aumenta regeneração de energia espiritual',
            'Reduz estresse mental',
            'Diminui efeitos de estados mentais negativos leves'
        ],
        efeitosAtivos: [
            'Pode canalizar energia acumulada ao terminar a meditação',
            '+10% energia extra recuperada'
        ],
        interacoes: [
            'Com Descanso: +30% recuperação de energia',
            'Com Aura de Serenidade: reduz efeitos mentais negativos em 50%',
            'Com Fúria: interrompe meditação imediatamente'
        ],
        detalhesAplicacao: 'Personagem deve permanecer imóvel e concentrado. Movimento ou dano cancela o estado.',
        imagem: 'https://i.imgur.com/wT8C6oI.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'regeneracao': {
        id: 'regeneracao',
        nome: '✨ REGENERAÇÃO',
        tipo: 'estado',
        descricaoCurta: 'Cura acelerada. Regenera ferimentos gradualmente',
        descricaoCompleta: 'O corpo do personagem acelera processos naturais de cura, regenerando ferimentos gradualmente ao longo do tempo.',
        origem: 'Combinação',
        duracao: 'até 8 horas Tempo Real',
        raridade: 'Raro',
        aplicacao: 'Manual',
        modificadores: [
            { atributo: 'velocidade-fisica', valor: -10 }
        ],
        efeitosPassivos: [
            'Cura ferimentos ao longo do tempo',
            'Reduz efeitos de sangramento',
            'Melhora recuperação física',
            'Regeneração acelerada de HP'
        ],
        efeitosAtivos: [
            'Ao finalizar regeneração completa: remove 1 ferimento moderado'
        ],
        interacoes: [
            'Com Descanso: +50% cura',
            'Com Veneno: cura reduzida em 40%'
        ],
        detalhesAplicacao: 'Aplicado automaticamente após certos eventos de cura ou habilidades específicas.',
        imagem: 'https://i.imgur.com/zc4IWca.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    'aura-serenidade': {
        id: 'aura-serenidade',
        nome: '☮️ AURA DE SERENIDADE',
        tipo: 'estado',
        descricaoCurta: 'Aura calmante. Reduz tensão, estabiliza aliados próximos',
        descricaoCompleta: 'Uma aura calmante envolve o personagem, reduzindo tensão emocional e estabilizando aliados próximos.',
        origem: 'Ambiente',
        duracao: 'até 3 horas Tempo Real',
        raridade: 'Épico',
        aplicacao: 'Manual',
        modificadores: [
            { atributo: 'resistencia-mental', valor: 15 },
            { atributo: 'estabilidade-emocional', valor: 20 }
        ],
        efeitosPassivos: [
            'Reduz chance de medo',
            'Reduz chance de pânico',
            'Estabiliza emoções',
            'Aliados próximos recebem bônus mental leve'
        ],
        efeitosAtivos: [
            'Pode emitir uma onda calmante',
            'Remove medo leve de aliados próximos'
        ],
        interacoes: [
            'Com Meditação: +40% estabilidade mental',
            'Com Fúria: efeitos reduzidos'
        ],
        detalhesAplicacao: 'Aura se irradia automaticamente. Aliados dentro de 3 metros recebem os efeitos.',
        imagem: 'https://i.imgur.com/hSu1cHV.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    },

    // 🟡 BÊNÇÃOS

    'bencao-vitalidade': {
        id: 'bencao-vitalidade',
        nome: '⭐ BENÇÃO DE VITALIDADE',
        tipo: 'bencao',
        descricaoCurta: 'Energia divina. +Vitalidade, +Regeneração, +Resistência',
        descricaoCompleta: 'Uma energia divina fortalece o corpo do personagem, aumentando vitalidade e acelerando recuperação.',
        origem: 'Habilidade',
        duracao: 'até 4 horas Tempo Real',
        raridade: 'Mítico',
        aplicacao: 'N/A',
        modificadores: [
            { atributo: 'vitalidade-maxima', valor: 25 },
            { atributo: 'regeneracao-hp', valor: 20 },
            { atributo: 'resistencia-fisica', valor: 15 }
        ],
        efeitosPassivos: [
            'Aumenta resistência a dano',
            'Acelera cura natural',
            'Reduz fadiga'
        ],
        efeitosAtivos: [
            'Pode converter energia divina em cura imediata de emergência'
        ],
        interacoes: [
            'Com Regeneração: +40% cura',
            'Com Descanso: cura completa mais rápida'
        ],
        detalhesAplicacao: 'Bênção é conferida por entidades divinas ou habilidades sagradas de alto nível.',
        imagem: 'https://i.imgur.com/uiwQK8X.png',
        podeStack: false,
        temDuracao: true,
        exigeEvento: false
    }
};

/**
 * CLASSE PRINCIPAL DO SISTEMA DE CONDIÇÕES
 */
class SistemaCondicoes {
    constructor() {
        this.condicoesAtivas = [];
        this.carregarDadosPersistidos();
        this.inicializar();
    }

    /**
     * Inicializar o sistema
     */
    inicializar() {
        console.log('🧿 [Condições] Inicializando sistema...');
        this.criarHTML();
        this.configurarEventos();
        console.log('✅ [Condições] Sistema pronto');
    }

    /**
     * Criar estrutura HTML
     */
    criarHTML() {
        // Se já existe, não criar novamente
        if (document.getElementById('rd-cond-popup')) return;

        const html = `
            <!-- 🧿 POPUP PRINCIPAL DE CONDIÇÕES -->
            <div id="rd-cond-overlay" class="rd-cond-overlay rd-cond-hidden">
                <div id="rd-cond-popup" class="rd-cond-popup">
                    <div class="rd-cond-header">
                        <h2 class="rd-cond-title">⚠ CONDIÇÕES ATIVAS</h2>
                        <div class="rd-cond-header-buttons">
                            <button id="rd-cond-voltar" class="rd-cond-voltar-btn" title="Voltar para Menu">↩</button>
                            <button id="rd-cond-close" class="rd-cond-close-btn" title="Fechar">✘</button>
                        </div>
                    </div>

                    <div id="rd-cond-content" class="rd-cond-content">
                        <!-- Preenchido dinamicamente -->
                    </div>

                    <div class="rd-cond-footer">
                        <button id="rd-cond-add-btn" class="rd-cond-add-btn">➕ Adicionar Condição</button>
                    </div>
                </div>
            </div>

            <!-- 👁 POPUP "VER CONDIÇÃO" -->
            <div id="rd-cond-view-overlay" class="rd-cond-view-overlay rd-cond-hidden">
                <div id="rd-cond-view-popup" class="rd-cond-view-popup">
                    <div class="rd-cond-view-header">
                        <button class="rd-cond-view-close" title="Fechar">✘</button>
                    </div>
                    <div id="rd-cond-view-content" class="rd-cond-view-content">
                        <!-- Preenchido dinamicamente -->
                    </div>
                </div>
            </div>

            <!-- 📜 POPUP CÓDEX DE CONDIÇÕES -->
            <div id="rd-cond-codex-overlay" class="rd-cond-codex-overlay rd-cond-hidden">
                <div id="rd-cond-codex-popup" class="rd-cond-codex-popup">
                    <div class="rd-cond-codex-header">
                        <h2>📜 Códex de Condições</h2>
                        <button class="rd-cond-codex-close" title="Fechar">✘</button>
                    </div>

                    <div class="rd-cond-codex-filters">
                        <input 
                            id="rd-cond-search" 
                            type="text" 
                            class="rd-cond-search" 
                            placeholder="🔍 Buscar condição..."
                        />
                        <select id="rd-cond-filter" class="rd-cond-filter">
                            <option value="">Todos os Tipos</option>
                            <option value="buff">🟢 Buffs</option>
                            <option value="debuff">🔴 Debuffs</option>
                            <option value="maldicion">🟣 Maldições</option>
                            <option value="bencao">🟡 Bênçãos</option>
                            <option value="estado">⚫ Estados</option>
                            <option value="temporal">⏳ Temporais</option>
                        </select>
                    </div>

                    <div id="rd-cond-codex-lista" class="rd-cond-codex-lista">
                        <!-- Preenchido dinamicamente -->
                    </div>
                </div>
            </div>

            <!-- ⚠️ POPUP DE CONFIRMAÇÃO -->
            <div id="rd-cond-confirm-overlay" class="rd-cond-confirm-overlay rd-cond-hidden">
                <div class="rd-cond-confirm-popup">
                    <h3 id="rd-cond-confirm-titulo">Confirmar ação</h3>
                    <p id="rd-cond-confirm-mensagem">Você tem certeza?</p>
                    <div class="rd-cond-confirm-botoes">
                        <button id="rd-cond-confirm-sim" class="rd-cond-btn-sim">Sim</button>
                        <button id="rd-cond-confirm-nao" class="rd-cond-btn-nao">Não</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Configurar eventos globais
     */
    configurarEventos() {
        // Botão voltar para menu
        document.getElementById('rd-cond-voltar')?.addEventListener('click', () => this.voltarMenu());

        // Botão fechar popup principal
        document.getElementById('rd-cond-close')?.addEventListener('click', () => this.fecharPopup());

        // Botão adicionar condição
        document.getElementById('rd-cond-add-btn')?.addEventListener('click', () => this.abrirCodex());

        // Botão fechar view
        document.querySelector('.rd-cond-view-close')?.addEventListener('click', () => this.fecharView());

        // Botão fechar codex
        document.querySelector('.rd-cond-codex-close')?.addEventListener('click', () => this.fecharCodex());

        // Filtros codex
        document.getElementById('rd-cond-search')?.addEventListener('input', () => this.filtrarCondiciones());
        document.getElementById('rd-cond-filter')?.addEventListener('change', () => this.filtrarCondiciones());

        // Confirmação
        document.getElementById('rd-cond-confirm-nao')?.addEventListener('click', () => this.fecharConfirmacao());

        // Overlay fechar
        document.getElementById('rd-cond-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'rd-cond-overlay') this.fecharPopup();
        });

        console.log('✅ [Condições] Eventos configurados');
    }

    /**
     * Renderizar popup principal
     */
    renderizarPopupPrincipal() {
        const content = document.getElementById('rd-cond-content');
        if (!content) return;

        if (this.condicoesAtivas.length === 0) {
            content.innerHTML = `
                <div class="rd-cond-vazio">
                    <div class="rd-cond-vazio-icone">✨</div>
                    <h3>Seu personagem está estável</h3>
                    <p>Nenhuma condição ativa no momento.</p>
                    <p class="rd-cond-vazio-dica">Clique em "➕ Adicionar Condição" para aplicar efeitos.</p>
                </div>
            `;
            return;
        }

        // Agrupar por tipo
        const porTipo = {
            buff: [],
            debuff: [],
            maldicion: [],
            bencao: [],
            estado: [],
            temporal: []
        };

        this.condicoesAtivas.forEach(cond => {
            const catalogada = RD_COND_CATALOGO[cond.id];
            if (catalogada) {
                porTipo[catalogada.tipo].push(cond);
            }
        });

        let html = '';

        // Renderizar por categoria
        const categorias = [
            { tipo: 'buff', emoji: '🟢', titulo: 'Buffs' },
            { tipo: 'debuff', emoji: '🔴', titulo: 'Debuffs' },
            { tipo: 'maldicion', emoji: '🟣', titulo: 'Maldições' },
            { tipo: 'bencao', emoji: '🟡', titulo: 'Bênçãos' },
            { tipo: 'estado', emoji: '⚫', titulo: 'Estados' },
            { tipo: 'temporal', emoji: '⏳', titulo: 'Temporais' }
        ];

        categorias.forEach(cat => {
            if (porTipo[cat.tipo].length > 0) {
                html += `
                    <div class="rd-cond-categoria">
                        <h3 class="rd-cond-categoria-titulo">${cat.emoji} ${cat.titulo}</h3>
                        <div class="rd-cond-cards-grid">
                            ${porTipo[cat.tipo].map(cond => this.renderizarCard(cond)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        content.innerHTML = html;

        // Configurar eventos dos cards
        this.configurarEventosCards();
    }

    /**
     * Renderizar card de condição
     */
    renderizarCard(cond) {
        const catalogada = RD_COND_CATALOGO[cond.id];
        if (!catalogada) return '';

        const duracao = this.formatarDuracao(cond, catalogada);
        const imagem = catalogada.imagem ? `<img src="${catalogada.imagem}" alt="${catalogada.nome}" class="rd-cond-card-imagem">` : `<div class="rd-cond-card-icone">${catalogada.icone}</div>`;

        return `
            <div id="rd-cond-card-${cond.id}" class="rd-cond-card rd-cond-card--${catalogada.tipo}">
                <div class="rd-cond-card-icone-container">${imagem}</div>
                
                <div class="rd-cond-card-conteudo">
                    <h4 class="rd-cond-card-nome">${catalogada.nome}</h4>
                    <span class="rd-cond-card-tipo">${this.traduzirTipo(catalogada.tipo)}</span>
                    <p class="rd-cond-card-descricao">${catalogada.descricaoCurta}</p>
                </div>

                ${duracao ? `<div class="rd-cond-card-duracao">${duracao}</div>` : ''}
                ${cond.stack > 1 ? `<div class="rd-cond-card-stack">x${cond.stack}</div>` : ''}

                <div class="rd-cond-card-acoes">
                    <button class="rd-cond-card-ver" data-id="${cond.id}" title="Ver detalhes">👁</button>
                    <button class="rd-cond-card-remover" data-id="${cond.id}" title="Remover">❌</button>
                </div>
            </div>
        `;
    }

    /**
     * Configurar eventos dos cards
     */
    configurarEventosCards() {
        document.querySelectorAll('.rd-cond-card-ver').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.abrirView(id);
            });
        });

        document.querySelectorAll('.rd-cond-card-remover').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const cond = this.condicoesAtivas.find(c => c.id === id);
                if (cond) {
                    const catalogada = RD_COND_CATALOGO[id];
                    this.pedirConfirmacao(
                        `Remover "${catalogada.nome}"?`,
                        () => this.removerCondicao(id)
                    );
                }
            });
        });
    }

    /**
     * Abrir popup de detalhes
     */
    abrirView(condId) {
        const catalogada = RD_COND_CATALOGO[condId];
        if (!catalogada) return;

        const imagem = catalogada.imagem ? `<img src="${catalogada.imagem}" alt="${catalogada.nome}" class="rd-cond-view-imagem">` : `<div class="rd-cond-view-icone-grande">${catalogada.icone}</div>`;

        const html = `
            <div class="rd-cond-view-header-imagem">
                ${imagem}
            </div>

            <div class="rd-cond-view-titulo">
                <h2>${catalogada.nome}</h2>
                <p class="rd-cond-view-tipo">Tipo: ${this.traduzirTipo(catalogada.tipo)}</p>
            </div>

            <div class="rd-cond-view-separador"></div>

            <div class="rd-cond-view-bloco">
                <h3>📖 DESCRIÇÃO</h3>
                <p>${catalogada.descricaoCompleta}</p>
            </div>

            <div class="rd-cond-view-grid">
                <div class="rd-cond-view-item">
                    <strong>🔷 Origem:</strong> ${catalogada.origem}
                </div>
                <div class="rd-cond-view-item">
                    <strong>⏱️ Duração:</strong> ${catalogada.duracao}
                </div>
                <div class="rd-cond-view-item">
                    <strong>💎 Raridade:</strong> ${catalogada.raridade}
                </div>
                <div class="rd-cond-view-item">
                    <strong>⚙️ Aplicação:</strong> ${catalogada.aplicacao}
                </div>
            </div>

            <div class="rd-cond-view-separador"></div>

            ${catalogada.modificadores.length > 0 ? `
                <div class="rd-cond-view-bloco">
                    <h3>📊 MODIFICADORES</h3>
                    <ul class="rd-cond-view-lista">
                        ${catalogada.modificadores.map(m => {
                            const valor = m.valor > 0 ? '+' : '';
                            const sufixo = (m.atributo.includes('dano') || m.atributo.includes('defesa') || m.atributo.includes('resistencia') || m.atributo.includes('critico') || m.atributo.includes('agilidade') || m.atributo.includes('prontidao') || m.atributo.includes('precisao') || m.atributo.includes('estabilidade') || m.atributo.includes('velocidade') || m.atributo.includes('regeneracao') || m.atributo.includes('percepcao')) ? '%' : '';
                            return `<li>${m.atributo}: ${valor}${m.valor}${sufixo}</li>`;
                        }).join('')}
                    </ul>
                </div>
            ` : ''}

            ${catalogada.efeitosPassivos.length > 0 ? `
                <div class="rd-cond-view-bloco">
                    <h3>⚡ EFEITOS PASSIVOS</h3>
                    <ul class="rd-cond-view-lista">
                        ${catalogada.efeitosPassivos.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${catalogada.efeitosAtivos.length > 0 ? `
                <div class="rd-cond-view-bloco">
                    <h3>🎯 EFEITOS ATIVOS</h3>
                    <ul class="rd-cond-view-lista">
                        ${catalogada.efeitosAtivos.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${catalogada.interacoes.length > 0 ? `
                <div class="rd-cond-view-bloco">
                    <h3>🔗 INTERAÇÕES</h3>
                    <ul class="rd-cond-view-lista">
                        ${catalogada.interacoes.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="rd-cond-view-bloco">
                <h3>📝 DETALHES DE APLICAÇÃO</h3>
                <p>${catalogada.detalhesAplicacao}</p>
            </div>

            <div class="rd-cond-view-separador"></div>

            <div class="rd-cond-view-rodape">
                <small>Copiado de ReDungeon em ${new Date().toLocaleDateString('pt-BR')}</small>
            </div>
        `;

        document.getElementById('rd-cond-view-content').innerHTML = html;
        document.getElementById('rd-cond-view-overlay').classList.remove('rd-cond-hidden');
    }

    /**
     * Abrir Códex
     */
    abrirCodex() {
        this.filtrarCondiciones();
        document.getElementById('rd-cond-codex-overlay').classList.remove('rd-cond-hidden');
        document.getElementById('rd-cond-search').focus();
    }

    /**
     * Filtrar condições no Códex
     */
    filtrarCondiciones() {
        const busca = document.getElementById('rd-cond-search').value.toLowerCase();
        const filtro = document.getElementById('rd-cond-filter').value;

        let condicoesFiltradas = Object.values(RD_COND_CATALOGO);

        // Aplicar filtro de tipo
        if (filtro) {
            condicoesFiltradas = condicoesFiltradas.filter(c => c.tipo === filtro);
        }

        // Aplicar filtro de busca
        if (busca) {
            condicoesFiltradas = condicoesFiltradas.filter(c =>
                c.nome.toLowerCase().includes(busca) ||
                c.descricaoCurta.toLowerCase().includes(busca)
            );
        }

        // Renderizar
        const lista = document.getElementById('rd-cond-codex-lista');
        
        if (condicoesFiltradas.length === 0) {
            lista.innerHTML = `
                <div class="rd-cond-codex-vazio">
                    <div class="rd-cond-codex-vazio-icone">🔍</div>
                    <h3>Nenhuma condição encontrada</h3>
                    <p>Tente ajustar sua busca ou filtro.</p>
                </div>
            `;
            return;
        }
        
        lista.innerHTML = condicoesFiltradas.map(cond => {
            const imagem = cond.imagem ? `<img src="${cond.imagem}" alt="${cond.nome}" class="rd-cond-codex-imagem">` : `<div class="rd-cond-codex-icone">${cond.icone}</div>`;
            return `
            <div class="rd-cond-codex-card rd-cond-codex-card--${cond.tipo}">
                <div class="rd-cond-codex-icone-container">${imagem}</div>
                <div class="rd-cond-codex-info">
                    <h4>${cond.nome}</h4>
                    <p>${cond.descricaoCurta}</p>
                    <span class="rd-cond-codex-tipo">${this.traduzirTipo(cond.tipo)}</span>
                </div>
                <button class="rd-cond-codex-adicionar" data-id="${cond.id}">➕</button>
            </div>
            `;
        }).join('');

        // Configurar botões adicionar
        document.querySelectorAll('.rd-cond-codex-adicionar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.adicionarCondicao(id);
                this.fecharCodex();
                this.renderizarPopupPrincipal();
            });
        });
    }

    /**
     * Adicionar condição
     */
    adicionarCondicao(condId) {
        const catalogada = RD_COND_CATALOGO[condId];
        if (!catalogada) return;

        // Verificar se já existe
        const existente = this.condicoesAtivas.find(c => c.id === condId);

        if (existente) {
            if (catalogada.podeStack) {
                existente.stack = (existente.stack || 1) + 1;
            } else {
                console.warn(`[Condições] ${catalogada.nome} já está ativa`);
                return;
            }
        } else {
            this.condicoesAtivas.push({
                id: condId,
                stack: 1,
                duracaoRestante: catalogada.temDuracao ? this.parsearDuracao(catalogada.duracao) : null,
                dataAplicacao: new Date()
            });
        }

        this.salvarDados();
        this.renderizarPopupPrincipal();
    }

    /**
     * Remover condição
     */
    removerCondicao(condId) {
        this.condicoesAtivas = this.condicoesAtivas.filter(c => c.id !== condId);
        this.salvarDados();
        this.renderizarPopupPrincipal();
        this.fecharConfirmacao();
    }

    /**
     * Pedir confirmação
     */
    pedirConfirmacao(mensagem, callback) {
        const overlay = document.getElementById('rd-cond-confirm-overlay');
        const btn = document.getElementById('rd-cond-confirm-sim');

        document.getElementById('rd-cond-confirm-mensagem').textContent = mensagem;

        // Remover listeners antigos
        const novoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(novoBtn, btn);

        novoBtn.addEventListener('click', () => {
            callback();
        });

        overlay.classList.remove('rd-cond-hidden');
    }

    /**
     * Fechar confirmação
     */
    fecharConfirmacao() {
        document.getElementById('rd-cond-confirm-overlay').classList.add('rd-cond-hidden');
    }

    /**
     * Fechar view
     */
    fecharView() {
        document.getElementById('rd-cond-view-overlay').classList.add('rd-cond-hidden');
    }

    /**
     * Fechar codex
     */
    fecharCodex() {
        document.getElementById('rd-cond-codex-overlay').classList.add('rd-cond-hidden');
    }

    /**
     * Fechar popup principal
     */
    fecharPopup() {
        document.getElementById('rd-cond-overlay').classList.add('rd-cond-hidden');
    }

    /**
     * Voltar para o menu principal
     */
    voltarMenu() {
        console.log('🔙 Voltando do popup de condições para o menu principal...');
        this.fecharPopup();
        
        // Aguardar a animação de fechamento
        setTimeout(() => {
            const btnMenu = document.getElementById('btn-menu-principal');
            if (btnMenu) {
                btnMenu.click();
                btnMenu.focus();
                console.log('✅ Voltado com sucesso para o menu principal');
            } else {
                console.warn('⚠️ Botão do menu principal não encontrado');
            }
        }, 300);
    }

    /**
     * Abrir popup principal
     */
    abrirPopup() {
        document.getElementById('rd-cond-overlay').classList.remove('rd-cond-hidden');
        this.renderizarPopupPrincipal();
    }

    /**
     * Traduzir tipo
     */
    traduzirTipo(tipo) {
        const tipos = {
            buff: '🟢 Buff',
            debuff: '🔴 Debuff',
            maldicion: '🟣 Maldição',
            bencao: '🟡 Bênção',
            estado: '⚫ Estado',
            temporal: '⏳ Temporal'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Formatar duração
     */
    formatarDuracao(cond, catalogada) {
        if (!catalogada.temDuracao) return '';

        if (cond.duracaoRestante === null) {
            // Se for duração em horas Tempo Real, exibir apenas "Tempo"
            if (catalogada.duracao && catalogada.duracao.includes('horas Tempo Real')) {
                return 'Tempo';
            }
            return catalogada.duracao;
        }

        return `${cond.duracaoRestante}T`;
    }

    /**
     * Parsear duração para número
     */
    parsearDuracao(duracao) {
        const match = duracao.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Salvar dados localmente
     */
    salvarDados() {
        localStorage.setItem('rd-cond-dados', JSON.stringify(this.condicoesAtivas));
        console.log('💾 [Condições] Dados salvos');
    }

    /**
     * Carregardados persistidos
     */
    carregarDadosPersistidos() {
        const dados = localStorage.getItem('rd-cond-dados');
        if (dados) {
            try {
                this.condicoesAtivas = JSON.parse(dados);
                console.log('📂 [Condições] Dados carregados:', this.condicoesAtivas.length);
            } catch (e) {
                console.warn('[Condições] Erro ao carregar dados:', e);
                this.condicoesAtivas = [];
            }
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO GLOBAL
// ════════════════════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sistemaCondicoes = new SistemaCondicoes();
        console.log('✅ Sistema de Condições pronto em window.sistemaCondicoes');
    });
} else {
    window.sistemaCondicoes = new SistemaCondicoes();
    console.log('✅ Sistema de Condições pronto em window.sistemaCondicoes');
}
