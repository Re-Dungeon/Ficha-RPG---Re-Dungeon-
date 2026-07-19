/* ═══════════════════════════════════════════════════════════════════════════════════════════════
   CORPO IMORTAL - BASE DE MELHORIAS DETALHADAS
   
   Define todas as melhorias e habilidades para cada nível de cada função espiritual.
   Estrutura: Função → Nível → Array de melhorias
   
   Data: 1 de março de 2026
   ═══════════════════════════════════════════════════════════════════════════════════════════════ */

const CORPO_IMORTAL_MELHORIAS = {
    dantian: {
        1: [
            {
                nome: 'Aceleração do Fluxo de Qí',
                descricao: 'Aumenta a velocidade de absorção de Dou Qí pela metade',
                efeito: 'Tempo de execução para absorver Dou Qí é reduzido pela metade',
                tipo: 'passiva'
            }
        ],
        2: [
            {
                nome: 'Aumento da Capacidade Dantian',
                descricao: 'Aumenta capacidade máxima de armazenamento em +50%',
                efeito: '+50% na capacidade máxima de absorção de Dou Qí (pode ser adquirida até 3 vezes)',
                tipo: 'passiva'
            }
        ],
        3: [
            {
                nome: 'Caminho do Dou Qí',
                descricao: 'Recupera 1d4 ponto de Dou Qí adicional por rodada de cultivo',
                efeito: 'Ideal para meditação e recuperação prolongadas',
                tipo: 'ativa'
            },
            {
                nome: 'Dantian de Dupla Camada',
                descricao: 'Refina e condensa uma camada de Qi ao redor do Dantian',
                efeito: '+100% na capacidade de armazenamento de QI + defesa própria para Dantian Inferior',
                tipo: 'passiva'
            },
            {
                nome: 'Manifestação de Aura',
                descricao: 'Cria uma aura protetora durante meditação ou cultivo',
                efeito: '+25% de defesa por 1 rodada (ação bônus)',
                tipo: 'ativa'
            }
        ],
        4: [
            {
                nome: 'Resiliência Espiritual',
                descricao: 'Torna-se mais resistente a interferências externas',
                efeito: 'Vantagem em testes contra efeitos de interrupção + 50% resistência a danos mágicos durante cultivo',
                tipo: 'passiva'
            },
            {
                nome: 'Fluxo de Poder',
                descricao: 'Libera quantidade concentrada de energia em combate',
                efeito: 'Uma vez por combate: gaste 10 pontos de Dou Qí para causar 2d12 de dano adicional',
                tipo: 'ativa'
            },
            {
                nome: 'Ampliação do Potencial',
                descricao: 'Expande o Dantian para canalizar mais energia durante combate',
                efeito: '+2d10 ao dano de técnicas por 12 rodadas após meditação',
                tipo: 'passiva'
            }
        ],
        5: [
            {
                nome: 'Sinergia Energética',
                descricao: 'Integra Meridianos com Dantian para potencializar circulação de Dou Qí',
                efeito: '+3 em testes de cultivo + 1d extra ao determinar Dou Qí acumulada',
                tipo: 'ativa'
            },
            {
                nome: 'Recuperação Rápida',
                descricao: 'Desenvolve técnica de recuperação acelerada concentrando Dou Qí',
                efeito: 'Recupera 1d4 pontos de vida para cada 5 pontos de Dou Qí gastos',
                tipo: 'ativa'
            }
        ],
        6: [
            {
                nome: 'Rotação de Qi',
                descricao: 'Refina e usa Qí continuamente ao andar e respirar',
                efeito: 'Recupera QI sem parar para meditar + evolui constantemente + recupera 25% de QI em combate',
                tipo: 'passiva',
                prerequisito: 'Concentração Nível 5'
            }
        ]
    },

    meridianos: {
        1: [
            {
                nome: 'Harmonia dos Meridianos',
                descricao: 'Permite que o Qí flua sem obstruções entre os meridianos',
                efeito: '+2 em rolagens de cultivo + ignora penalidades ambientais (ação bônus)',
                tipo: 'ativa'
            }
        ],
        2: [
            {
                nome: 'Purificação dos Meridianos',
                descricao: 'Remove bloqueios que impedem circulação do Qí',
                efeito: 'Remove penalidades em rolagens de cultivo + aumenta absorção em 1d6',
                tipo: 'ativa'
            }
        ],
        3: [
            {
                nome: 'Abertura Meridiana',
                descricao: 'Aumenta capacidade de absorção de Qí dobrando resultado',
                efeito: 'Dobra o resultado da rolagem de cultivo para maior acumulação',
                tipo: 'ativa'
            },
            {
                nome: 'Sussurros do Qí',
                descricao: 'Sente flutuações de Qí ao redor detectando seres espirituais',
                efeito: 'Detecta presenças espirituais em raio de 30m + vantagem em testes de percepção',
                tipo: 'passiva'
            },
            {
                nome: 'Meridianos Perfeitos',
                descricao: 'Os meridianos não demonstram resistência ao fluxo natural de Qi',
                efeito: 'Redução de 20% no consumo de Qí das técnicas',
                tipo: 'passiva'
            }
        ],
        4: [
            {
                nome: 'Meridianos em Cadeia',
                descricao: 'Cria rede interconectada que potencializa Dou Qí',
                efeito: '+1 em capacidade de Dou Qí para cada meridiano aberto (acumula até total)',
                tipo: 'passiva'
            },
            {
                nome: 'Ritmo do Fluxo Energético',
                descricao: 'Sincroniza respiração com fluxo de Qí aumentando velocidade',
                efeito: 'Reduz tempo de execução de técnicas em 1 turno + 50 de prontidão em combate',
                tipo: 'passiva'
            },
            {
                nome: 'Fortificação Meridiana',
                descricao: 'Fortalece meridianos contra bloqueios e danos',
                efeito: 'Resistência a efeitos que obstruem fluxo + ignora 1 bloqueio por combate',
                tipo: 'passiva'
            }
        ],
        5: [
            {
                nome: 'Sinfonia do Qí',
                descricao: 'Harmoniza fluxo de Qí para maximizar eficácia',
                efeito: 'Re-rola cultivo 2x/dia (escolhe resultado mais alto) + +25 capacidade máxima temporária',
                tipo: 'ativa'
            },
            {
                nome: 'Meridianos Essenciais',
                descricao: 'Foca nos 14 meridianos principais aumentando habilidade de cultivo',
                efeito: '+1d por meridiano aberto (até 14d extras em rolagens de cultivo)',
                tipo: 'passiva'
            }
        ]
    },

    refino: {
        1: [
            {
                nome: 'Força Vital Aumentada',
                descricao: 'Aprimora força vital tornando-se mais resistente',
                efeito: '+2 em pontos de vida sempre aplicar um ponto em constituição',
                tipo: 'passiva'
            }
        ],
        2: [
            {
                nome: 'Corpo de Ferro',
                descricao: 'Corpo se torna quase indestrutível com refinamento contínuo',
                efeito: 'Resistência a dano cortante e perfurante + reduz dano em (Mod Qí + ¼ Constituição)',
                tipo: 'passiva'
            },
            {
                nome: 'Energia Inesgotável',
                descricao: 'Corpo refinado não se cansa tão facilmente',
                efeito: '1d10+10% da constituição de redução em fadiga (2x por descanso longo)',
                tipo: 'passiva'
            }
        ],
        3: [
            {
                nome: 'Aprimoramento Muscular',
                descricao: 'Músculos se tornam mais fortes e ágeis',
                efeito: '+1 em testes de Atletismo + adiciona Mod Qí ao dano corpo a corpo',
                tipo: 'passiva'
            },
            {
                nome: 'Sangue Imaculado',
                descricao: 'Venenos normais não têm efeito, alta tolerância aos letais',
                efeito: '+3 para resistir a efeitos de veneno',
                tipo: 'passiva'
            },
            {
                nome: 'Fortalecimento Muscular',
                descricao: 'Fortalece músculos profundamente aumentando vitalidade',
                efeito: '+10 PV permanentes por nível + 3d12 de recuperação após treino físico',
                tipo: 'passiva'
            }
        ],
        4: [
            {
                nome: 'Ossos de Aço',
                descricao: 'Fortalece ossos tornando corpo incrivelmente resistente',
                efeito: 'Dobra a saúde atual + reduz dano de impacto/perfuração em 2d12',
                tipo: 'passiva',
                prerequisito: 'Fortalecimento Muscular'
            },
            {
                nome: 'Resiliência Espiritual',
                descricao: 'Refino corporal fortalece essência espiritual',
                efeito: 'Vantagem contra incapacitação/controle mental + gaste Qí para remover condições negativas',
                tipo: 'ativa'
            },
            {
                nome: 'Regeneração Celular',
                descricao: 'Corpo desenvolve capacidade incrível de regeneração',
                efeito: 'Recupera 5% saúde por turno por 1d6 turnos (1x por descanso longo)',
                tipo: 'ativa'
            }
        ],
        5: [
            {
                nome: 'Músculos de Titã',
                descricao: 'Treinamento extremo torna músculos poderosos',
                efeito: '+2 em testes de força + 25% de saúde máxima adicional',
                tipo: 'passiva',
                prerequisito: 'Ossos de Aço'
            },
            {
                nome: 'Exceder Limite Corporal',
                descricao: 'Transcende limites naturais do corpo refinando físico e mente',
                efeito: 'Aumenta permanentemente limite máximo de um atributo (não Sorte) em seu nível de classe (até 4 vezes)',
                tipo: 'passiva'
            },
            {
                nome: 'Corpo Adaptado',
                descricao: 'Resistência a efeitos naturais após experiências extremas',
                efeito: 'Vantagem contra Calor, Frio e Pressão de ar',
                tipo: 'passiva'
            }
        ]
    },

    marEspiritual: {
        1: [
            {
                nome: 'Visão Interior',
                descricao: 'Detecta desequilíbrios de Qí e impurezas olhando para dentro',
                efeito: 'Remove 1 condição negativa como ação bônus (1x por descanso longo)',
                tipo: 'ativa'
            }
        ],
        2: [
            {
                nome: 'Conexão Profunda',
                descricao: 'Mar Espiritual expande conectando-se ao ambiente',
                efeito: 'Detecta seres ocultos em raio de 30m + vantagem em Percepção',
                tipo: 'passiva'
            },
            {
                nome: 'Treinamento no Mar Espiritual',
                descricao: 'Cria espaço de meditação e aprendizado acelerado',
                efeito: 'Dobra rolagem de EXP ao aprender novas habilidades',
                tipo: 'passiva'
            }
        ],
        3: [
            {
                nome: 'Fortificação do Mar Espiritual',
                descricao: 'Fortalece defesas espirituais contra drenagem de energia',
                efeito: 'Gaste 20% Qí para reduzir dano espiritual/drenagem pela metade + +2 em resistência',
                tipo: 'ativa'
            },
            {
                nome: 'Repelir Possessão',
                descricao: 'Cria campo energético que repele forças malignas',
                efeito: 'Protege contra possessão/controle por 5 rodadas + vantagem em resistência + teste extra com Mod Qí',
                tipo: 'ativa'
            },
            {
                nome: 'Mar Espiritual Estabilizado',
                descricao: 'Desenvolve estabilidade inabalável em fluxo de Qí',
                efeito: 'Re-rola críticos negativos em técnicas Qí (1x por sessão)',
                tipo: 'passiva'
            }
        ],
        4: [
            {
                nome: 'Elementos do Mar Espiritual',
                descricao: 'Conecta-se profundamente escolhendo um elemento extra',
                efeito: 'Escolha elemento (fogo/água/terra/ar) + +1 em testes de ataque/dano com elemento',
                tipo: 'ativa'
            },
            {
                nome: 'Expansão do Mar Espiritual',
                descricao: 'Rolagem dobra quando Rank de cultivo aumenta',
                efeito: 'Dobra rolagem do Mar Espiritual permitindo acumular mais Qí',
                tipo: 'passiva'
            }
        ],
        5: [
            {
                nome: 'Força Espiritual',
                descricao: 'Expande capacidade de acumular Qí no Dantian',
                efeito: 'Role 1d10 + nível classe + Mod Qí (resultado = vezes para expandir) + Qí adic = dado da raça (1x por descanso)',
                tipo: 'ativa'
            },
            {
                nome: 'Domínio do Corpo Espiritual',
                descricao: 'Percepção espiritual atinge novo patamar',
                efeito: 'Projeta consciência até 60m detectando energias espirituais (1x por descanso curto)',
                tipo: 'ativa',
                prerequisito: 'Percepção Nível 3'
            }
        ]
    }
};

/**
 * Obtém todas as melhorias desbloqueadas para uma função
 * @param {string} funcao - Nome da função (dantian, meridianos, refino, marEspiritual)
 * @param {number} nivel - Nível atual da função (0-6)
 * @returns {array} Array com todas as melhorias desbloqueadas
 */
function obterMelhorias(funcao, nivel) {
    const funcaoData = CORPO_IMORTAL_MELHORIAS[funcao];
    
    if (!funcaoData) return [];
    
    // 🔧 CORREÇÃO: Retornar APENAS as melhorias do nível especificado
    // Não adicionar todas até o nível - apenas do nível atual
    return (funcaoData[nivel]) ? [...funcaoData[nivel]] : [];
}

/**
 * Obtém apenas as novas melhorias do nível específico
 * @param {string} funcao
 * @param {number} nivel
 * @returns {array}
 */
function obterMelhoriasDuNivel(funcao, nivel) {
    const funcaoData = CORPO_IMORTAL_MELHORIAS[funcao];
    return (funcaoData && funcaoData[nivel]) ? funcaoData[nivel] : [];
}

/**
 * Formata melhorias para exibição
 * @param {array} melhorias
 * @returns {string} HTML formatado
 */
function formatarMelhorias(melhorias) {
    if (!melhorias || melhorias.length === 0) {
        return '<li style="opacity: 0.6;">Nenhuma melhoria desbloqueada ainda</li>';
    }
    
    let html = '';
    for (const melhoria of melhorias) {
        const tipo = melhoria.tipo === 'ativa' ? '⚡ Ativa' : '🛡️ Passiva';
        const prereq = melhoria.prerequisito ? `<div style="font-size: 0.75rem; opacity: 0.7;">Requisito: ${melhoria.prerequisito}</div>` : '';
        
        html += `
            <li style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(100, 150, 255, 0.1); border-left: 3px solid #60a5fa; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${melhoria.nome}</strong>
                    <span style="font-size: 0.875rem; opacity: 0.8;">${tipo}</span>
                </div>
                <div style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem;">${melhoria.descricao}</div>
                <div style="font-size: 0.8rem; color: #fbbf24; margin-top: 0.5rem;">✨ ${melhoria.efeito}</div>
                ${prereq}
            </li>
        `;
    }
    
    return html;
}
