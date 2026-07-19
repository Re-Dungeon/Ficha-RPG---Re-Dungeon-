/**
 * LOJA DA TRAPAÇA - CATÁLOGO DE ITENS
 * 
 * Sistema econômico baseado em Fortuna (Ȼ)
 * Moeda: Trickster's Coin
 */

const LOJA_ITEMS = {
    beneficios_menores: [
        {
            id: 'encontro-favoravel',
            nome: 'Encontro Favorável',
            emoji: '💬',
            custo: 3,
            descricao: 'Rola 1d4 para reduzir obstáculo em interação social antes que saia do controle',
            efeito: 'Reduz obstáculo em interação social',
            tipo: 'narrativo',
            limite_uso: '⚡ Imediato',
            ativacao: 'imediata',
            categoria: 'beneficios_menores'
        },
        {
            id: 'fofoca-do-dia',
            nome: 'Fofoca do Dia',
            emoji: '🗣️',
            custo: 5,
            descricao: 'Descobre uma pista ou informação útil sem exigir investigação',
            efeito: '+1 Pista/Informação',
            tipo: 'narrativo',
            limite_uso: '⚡ Imediato',
            ativacao: 'imediata',
            categoria: 'beneficios_menores'
        },
        {
            id: 'pressentimento',
            nome: 'Pressentimento',
            emoji: '🎲',
            custo: 5,
            descricao: 'Antes de entrar em um local ou situação perigosa, o mestre indica dicas de um perigo próximo (emboscada, armadilha, inimigo escondido). Não revela tudo, apenas o risco mais próximo.',
            efeito: 'Aviso de perigo próximo',
            tipo: 'narrativo',
            limite_uso: '⚡ Imediato',
            ativacao: 'imediata',
            categoria: 'beneficios_menores'
        },
        {
            id: 'momento-dramatico',
            nome: 'Momento Dramático',
            emoji: '🎭',
            custo: 6,
            descricao: 'Uma situação social que estava prestes a dar errado recebe uma reviravolta favorável (alguém interrompe, surge prova inesperada, aliado defende). O conflito não desaparece, mas a tensão diminui.',
            efeito: 'Reviravolta em situação social',
            tipo: 'narrativo',
            limite_uso: '⚡ Imediato',
            ativacao: 'imediata',
            categoria: 'beneficios_menores'
        },
        {
            id: 'reputacao-fervorosa',
            nome: 'Reputação Fervorosa',
            emoji: '👑',
            custo: 10,
            descricao: 'Personagem é reconhecido por feitos notórios, facilitando ajuda social',
            efeito: 'Facilita testes sociais difíceis',
            tipo: 'narrativo',
            limite_uso: '⚡ Imediato',
            ativacao: 'imediata',
            categoria: 'beneficios_menores'
        }
    ],
    vantagens_taticas: [
        {
            id: 'beneficio-ocasional',
            nome: 'Benefício Ocasional',
            emoji: '✨',
            custo: 5,
            descricao: 'Concede +3 em uma rolagem como fator externo favorável',
            efeito: '+3 em 1 rolagem (combate ou fora)',
            tipo: 'mecanico',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        },
        {
            id: 'ajuste-de-destino',
            nome: 'Ajuste de Destino',
            emoji: '⚔️',
            custo: 8,
            descricao: 'Após rolar um dado, o jogador pode aumentar ou diminuir o resultado em até 2 pontos. Não pode transformar um resultado comum em crítico.',
            efeito: '+/-2 em resultado de dado',
            tipo: 'mecanico',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        },
        {
            id: 'foco-repentino',
            nome: 'Foco Repentino',
            emoji: '⚔️',
            custo: 9,
            descricao: 'Antes de fazer uma rolagem importante, o jogador pode ativar esta trapaça. Ele rola 2 dados e fica com o melhor resultado.',
            efeito: 'Melhor de 2d6 em rolagem importante',
            tipo: 'mecanico',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        },
        {
            id: 'trapaceiro',
            nome: 'Trapaceiro',
            emoji: '🎲',
            custo: 10,
            descricao: 'Permite rerrolar qualquer dado em momentos críticos',
            efeito: 'Rerrolar 1 dado (1x/sessão)',
            tipo: 'mecanico',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        },
        {
            id: 'furto-de-dados',
            nome: 'Furto de Dados',
            emoji: '🎯',
            custo: 10,
            descricao: 'Após sucesso, guarde até 3d6 para usar em rolagens futuras',
            efeito: 'Guarda 3d6 para later',
            tipo: 'mecanico',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        },
        {
            id: 'trato-feito',
            nome: 'Trato Feito',
            emoji: '🤝',
            custo: 10,
            descricao: 'Durante negociações, rola dados com o mestre para decidir o resultado',
            efeito: 'Rola contra mestre em negociação',
            tipo: 'social',
            limite_uso: '📦 Armazenável',
            ativacao: 'manual',
            categoria: 'vantagens_taticas'
        }
    ],
    efeitos_avancados: [
        {
            id: 'reflexo-instintivo',
            nome: 'Reflexo Instintivo',
            emoji: '🔮',
            custo: 17,
            descricao: 'Após sofrer um ataque, o personagem pode reduzir o dano recebido em 30%. Só pode ser usado uma vez por combate.',
            efeito: '-30% dano (1x/combate)',
            tipo: 'sorte',
            limite_uso: '⚔️ Combate',
            ativacao: 'imediata',
            categoria: 'efeitos_avancados'
        },
        {
            id: 'azar-na-sorte',
            nome: 'Azar na Sorte',
            emoji: '🌙',
            custo: 15,
            descricao: 'Uma vez por sessão, transforma um fracasso em sucesso',
            efeito: 'Fracasso → Sucesso (1x/sessão)',
            tipo: 'sorte',
            limite_uso: '🕐 Sessão',
            ativacao: 'imediata',
            categoria: 'efeitos_avancados'
        },
        {
            id: 'reversor',
            nome: 'Reversor',
            emoji: '🔄',
            custo: 15,
            descricao: 'Transforma condição negativa em vantagem (+metade dificuldade)',
            efeito: 'Negativo → Vantagem temporária',
            tipo: 'sorte',
            limite_uso: '🕐 Sessão',
            ativacao: 'imediata',
            categoria: 'efeitos_avancados'
        },
        {
            id: 'beneficiario-afortunado',
            nome: 'Beneficiário Afortunado',
            emoji: '🛡️',
            custo: 15,
            descricao: 'Evita situação perigosa ou mortal graças a um golpe de sorte',
            efeito: 'Salva de situação mortal/perigosa',
            tipo: 'sorte',
            limite_uso: '🕐 Sessão',
            ativacao: 'imediata',
            categoria: 'efeitos_avancados'
        }
    ],
    bencaos_unicas: [
        {
            id: 'instinto-de-sobrevivencia',
            nome: 'Instinto de Sobrevivência',
            emoji: '🔮',
            custo: 19,
            descricao: 'Quando um golpe reduziria o personagem a 0 de vida, ele permanece com 1 ponto de vida. Só pode acontecer uma vez por sessão.',
            efeito: 'Sobrevive com 1 HP (1x/sessão)',
            tipo: 'unico',
            limite_uso: '🕐 Sessão',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'segundo-folego',
            nome: 'Segundo Fôlego',
            emoji: '🔮',
            custo: 23,
            descricao: 'Durante combate, o personagem recupera imediatamente 25% da vida máxima. Pode ser usado apenas uma vez por personagem.',
            efeito: '+25% HP em combate (1x/personagem)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'manual',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'sorte-de-principiante',
            nome: 'Sorte de Principiante',
            emoji: '🌟',
            custo: 20,
            descricao: 'Durante 3 turnos, todos os bônus de sorte são multiplicados por 1,5 (arredonda cima)',
            efeito: 'Sorte ×1,5 (3 turnos)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'escapada-milagrosa',
            nome: 'Escapada Milagrosa',
            emoji: '💨',
            custo: 20,
            descricao: 'Escapa por um triz de ataque, armadilha ou efeito perigoso no último segundo',
            efeito: 'Escape certo de 1 perigo',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'sorte-extrema',
            nome: 'Sorte Extrema',
            emoji: '⚡',
            custo: 25,
            descricao: 'Durante 10 minutos, +5 de sorte em TODAS as rolagens aplicáveis',
            efeito: '+5 sorte (10 min)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'abencado-pelos-ceus',
            nome: 'Abençoado pelos Céus',
            emoji: '☀️',
            custo: 30,
            descricao: 'Rola 10d6 e guarda os 2 maiores para substituir rolagens futuras',
            efeito: '10d6 → Guarda top 2 (sessão)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'evento-canonico',
            nome: 'Evento Canônico',
            emoji: '📖',
            custo: 35,
            descricao: 'No combate atual, ignora falhas críticas, armadilhas e efeitos negativos do azar',
            efeito: 'Imune a azar (1 combate)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'imediata',
            categoria: 'bencaos_unicas'
        },
        {
            id: 'destino-favoravel',
            nome: 'Destino Favorável',
            emoji: '👑',
            custo: 40,
            descricao: 'Escolha qualquer rolagem da sessão e transforme em crítico absoluto',
            efeito: 'Crítico certo (1 rolagem)',
            tipo: 'unico',
            limite_uso: '👑 Único',
            ativacao: 'manual',
            categoria: 'bencaos_unicas'
        }
    ]
};

/**
 * Sistema de Rastreamento de Compras
 * Armazenado em localStorage: "loja-trapaça-compras"
 */
const LOJA_RASTREAMENTO = {
    comprasRealizada: [],
    efeitosAtivos: [],
    limites: {
        beneficiarios_menores: 'ilimitado',
        vantagens_taticas: 2,
        efeitos_avancados: 1,
        bencaos_unicas: 1
    }
};

/**
 * CONSTANTES DE CONFIGURAÇÃO
 */
const LOJA_CONFIG = {
    moeda: {
        nome: 'Trickster\'s Coin',
        simbolo: 'Ȼ',
        emoji: '🎲'
    },
    categoria_nomes: {
        beneficios_menores: 'Benefícios Menores',
        vantagens_taticas: 'Vantagens Táticas',
        efeitos_avancados: 'Efeitos Avançados',
        bencaos_unicas: 'Bênçãos Únicas'
    },
    armazenamento: {
        compras: 'loja-trapaça-compras',
        saldo: 'redungeon_fortuna_atual'
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.LOJA_ITEMS = LOJA_ITEMS;
    window.LOJA_CONFIG = LOJA_CONFIG;
    window.LOJA_RASTREAMENTO = LOJA_RASTREAMENTO;
}
