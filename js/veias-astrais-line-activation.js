/**
 * SISTEMA DE ATIVAÇÃO DE LINHAS - VEIAS ASTRAIS
 * Gerencia a visualização e animação das linhas quando nós são desbloqueados
 */

class VeiasAstraisLineActivation {
    constructor(veiasSystem) {
        this.veias = veiasSystem;
        this.activatedPaths = new Set(); // Rastreia linhas ativadas
        this.activatedPathsData = new Map(); // Armazena dados da ativação (treeId, intensity, role)
        this.constellationColors = {
            'arty': '#ff4444',
            'aune': '#ffdd44',
            'ephelias': '#4477dd',
            'nishi': '#9966ff',
            'hestia': '#66dd66'
        };
        
        // Hook para restaurar linhas após redraw
        this.setupRedrawHook();
    }

    /**
     * SETUP DO HOOK PARA RESTAURAR LINHAS APÓS REDRAW
     */
    setupRedrawHook() {
        if (!this.veias) return;
        
        const originalRenderConnections = this.veias.renderConnections.bind(this.veias);
        
        this.veias.renderConnections = () => {
            // Executar renderização original
            originalRenderConnections();
            
            // Restaurar linhas ativadas após redraw
            this.restoreActivatedLinesAfterRender();
        };
        
        console.log('✅ Hook de redraw configurado para preservar linhas ativadas');
    }

    /**
     * RESTAURAR LINHAS ATIVADAS APÓS RENDERIZAÇÃO
     */
    restoreActivatedLinesAfterRender() {
        console.log(`🔄 Restaurando ${this.activatedPaths.size} linhas ativadas após redraw...`);
        
        this.activatedPaths.forEach(pathKey => {
            const data = this.activatedPathsData.get(pathKey);
            if (data) {
                const lineSelector = `path[data-from="${data.from}"][data-to="${data.to}"]`;
                const lineElement = document.querySelector(lineSelector);
                
                if (lineElement) {
                    // Reaplica as classes permanentes
                    lineElement.classList.add('active', 'activated-permanent', `constellation-${data.treeId}`, `intensity-${data.intensity}`);
                    lineElement.style.stroke = this.constellationColors[data.treeId] || '#ffffff';
                    
                    console.log(`✅ Linha restaurada: ${pathKey}`);
                }
            }
        });
        
        console.log(`✨ ${this.activatedPaths.size} linhas ativadas restauradas`);
    }

    /**
     * ATIVAR LINHAS QUANDO UM NÓ É DESBLOQUEADO
     */
    activateNodePath(nodeId) {
        const node = this.veias.nodes.find(n => n.id === nodeId);
        if (!node) {
            console.warn(`❌ Nó ${nodeId} não encontrado`);
            return;
        }

        console.log(`✨ Ativando caminho do nó: ${node.name} (${node.treeId})`);

        // 1. Ativar linhas conectadas ao nó
        this.activateConnectedLines(node);

        // 2. Ativar linha parental (de conexão anterior)
        if (node.parentId && node.parentId !== 'core') {
            this.activateParentLine(node);
        }

        // 3. Ativar linhas filhas (próximos nós)
        this.activateChildLines(node);

        // 4. Atualizar contagem de nós desbloqueados na constelação
        this.updateConstellationProgress(node.treeId);

        // 5. Trigger efeito visual especial
        this.triggerActivationEffect(node);
    }

    /**
     * ATIVAR LINHAS CONECTADAS DIRETAMENTE AO NÓ
     */
    activateConnectedLines(node) {
        const connectedConnections = this.veias.connections.filter(
            conn => conn.from === node.id || conn.to === node.id
        );

        connectedConnections.forEach(conn => {
            this.activateLine(conn, node.treeId, 'high');
        });

        console.log(`🔗 ${connectedConnections.length} linhas conectadas ativadas`);
    }

    /**
     * ATIVAR LINHA PARENTAL
     */
    activateParentLine(node) {
        const parentConnection = this.veias.connections.find(
            conn => conn.from === node.parentId && conn.to === node.id
        );

        if (parentConnection) {
            this.activateLine(parentConnection, node.treeId, 'high', 'parent');
            console.log(`📍 Linha parental ativada`);
        }
    }

    /**
     * ATIVAR LINHAS FILHAS (PRÓXIMOS NÓS) - COM EFEITO DE CORRENTE ENERGÉTICA
     */
    activateChildLines(node) {
        // Encontrar todos os nós que têm este nó como pai
        const childNodes = this.veias.nodes.filter(n => n.parentId === node.id);

        childNodes.forEach(childNode => {
            const childConnection = this.veias.connections.find(
                conn => conn.from === node.id && conn.to === childNode.id
            );

            if (childConnection) {
                // Ativar linha com intensidade alta para mostrar a ligação
                this.activateLine(childConnection, node.treeId, 'high', 'child');
                
                // Adicionar efeito especial de "corrente energética"
                this.addEnergyChainEffect(childConnection, node.treeId);
            }
        });

        console.log(`👶 ${childNodes.length} linhas filhas ativadas com corrente energética`);
    }

    /**
     * EFEITO DE CORRENTE ENERGÉTICA - Ilumina a linha do nó desbloqueado pro próximo
     */
    addEnergyChainEffect(connection, treeId) {
        const lineSelector = `path[data-from="${connection.from}"][data-to="${connection.to}"]`;
        const lineElement = document.querySelector(lineSelector);

        if (!lineElement) {
            const allPaths = document.querySelectorAll('path[data-from]');
            console.warn(`⚠️ Elemento de corrente energética não encontrado: ${lineSelector}`);
            console.warn(`Total de paths com data-from: ${allPaths.length}`);
            return;
        }

        // Adicionar classe de efeito energético
        lineElement.classList.add('energy-chain-active', `energy-${treeId}`);
        
        // Criar animação pulsante especial
        lineElement.style.animation = `energy-pulse-${treeId} 1.5s ease-in-out infinite`;

        console.log(`⚡ Efeito de corrente energética adicionado para ${connection.from} → ${connection.to}`);
    }

    /**
     * ATIVAR UMA LINHA INDIVIDUAL
     */
    activateLine(connection, treeId, intensity = 'medium', role = 'connected') {
        // Gerar seletor para a linha
        const lineSelector = `path[data-from="${connection.from}"][data-to="${connection.to}"]`;
        const lineElement = document.querySelector(lineSelector);

        if (!lineElement) {
            // Debug melhorado
            const allPaths = document.querySelectorAll('path[data-from]');
            console.warn(`⚠️ Elemento de linha não encontrado: ${lineSelector}`);
            console.warn(`Total de paths com data-from: ${allPaths.length}`);
            if (allPaths.length > 0) {
                console.warn(`Primeiro path data-from/to:`, 
                    `${allPaths[0].getAttribute('data-from')} → ${allPaths[0].getAttribute('data-to')}`);
            }
            return;
        }

        // Gerar chave única para rastrear
        const pathKey = `${connection.from}-${connection.to}`;
        
        if (this.activatedPaths.has(pathKey)) {
            console.log(`📌 Linha já estava ativa: ${pathKey}`);
            return;
        }

        // ARMAZENAR DADOS DA ATIVAÇÃO PERMANENTEMENTE
        this.activatedPaths.add(pathKey);
        this.activatedPathsData.set(pathKey, {
            from: connection.from,
            to: connection.to,
            treeId: treeId,
            intensity: intensity,
            role: role
        });

        // Remover classes antigas
        lineElement.classList.remove('link-locked', 'link-unlocked', 'deactivating');

        // Adicionar classes de ativação PERMANENTES
        // 'active' = linha desbloqueada e permanentemente visível
        // 'constellation-{treeId}' = identidade visual da constelação
        // 'activated-permanent' = novo estado que mantém a animação pulsante sem reset
        lineElement.classList.add('active', 'activated-permanent', `constellation-${treeId}`, `intensity-${intensity}`);

        // Aplicar cor específica da constelação
        lineElement.style.stroke = this.constellationColors[treeId] || '#ffffff';

        // Adicionar animação de "burst" no início
        lineElement.classList.add('activation-burst');
        
        // Remover a classe de burst após 800ms, mantendo as outras classes
        setTimeout(() => {
            lineElement.classList.remove('activation-burst');
        }, 800);

        console.log(`✅ Linha ativada permanentemente: ${pathKey} (intensidade: ${intensity}, papel: ${role})`);
    }

    /**
     * OBTER ANIMAÇÃO CORRETA POR CONSTELAÇÃO
     */
    getAnimationForConstellation(treeId) {
        const animations = {
            'arty': 'line-arty-pulse',
            'aune': 'line-aune-glow',
            'ephelias': 'line-ephelias-flow',
            'nishi': 'line-nishi-vibrate',
            'hestia': 'line-hestia-growth'
        };

        return animations[treeId] || 'line-default-glow';
    }

    /**
     * ATIVAR CAMINHO COMPLETO (CORE até o nó)
     */
    activateCompletePath(nodeId) {
        console.log(`🌟 Ativando caminho completo até nó ${nodeId}`);

        // Construir caminho rastreando pais
        const path = [];
        let currentNode = this.veias.nodes.find(n => n.id === nodeId);

        while (currentNode) {
            path.unshift(currentNode);
            if (currentNode.parentId === 'core') break;
            currentNode = this.veias.nodes.find(n => n.id === currentNode.parentId);
        }

        // Ativar linhas sequencialmente com delay
        path.forEach((node, idx) => {
            setTimeout(() => {
                this.activateNodePath(node.id);
            }, idx * 150); // 150ms entre cada ativação
        });
    }

    /**
     * DESATIVAR LINHAS (opcional - para quando desbloqueio é revertido)
     */
    deactivateLine(connection) {
        const lineSelector = `[data-from="${connection.from}"][data-to="${connection.to}"]`;
        const lineElement = document.querySelector(`svg .astral-links-group path${lineSelector}`);

        if (lineElement) {
            const pathKey = `${connection.from}-${connection.to}`;
            this.activatedPaths.delete(pathKey);
            this.activatedPathsData.delete(pathKey);

            lineElement.classList.remove('active', 'activation-burst');
            lineElement.classList.add('deactivating');

            setTimeout(() => {
                lineElement.classList.remove('deactivating');
                lineElement.classList.add('link-locked');
                lineElement.style.stroke = '';
            }, 600);

            console.log(`🔌 Linha desativada: ${pathKey}`);
        }
    }

    /**
     * EFEITO VISUAL ESPECIAL QUANDO NÓ É DESBLOQUEADO
     */
    triggerActivationEffect(node) {
        // Efeito de pulso no nó
        const nodeElement = document.getElementById(`node-${node.id}`);
        if (nodeElement) {
            nodeElement.classList.add('node-unlock-pulse');
            setTimeout(() => {
                nodeElement.classList.remove('node-unlock-pulse');
            }, 800);
        }

        // Efeito de onda em todas as linhas da constelação
        this.triggerConstellationWave(node.treeId);

        // Som/notificação (opcional)
        this.playActivationFeedback(node.treeId);
    }

    /**
     * EFEITO DE ONDA EM TODAS AS LINHAS DA CONSTELAÇÃO
     */
    triggerConstellationWave(treeId) {
        const lines = document.querySelectorAll(`.astral-links-group path[class*="constellation-${treeId}"]`);
        
        lines.forEach((line, idx) => {
            setTimeout(() => {
                line.classList.add('wave-effect');
                setTimeout(() => {
                    line.classList.remove('wave-effect');
                }, 1500);
            }, idx * 50); // Delay escalonado para efeito de onda
        });
    }

    /**
     * ATUALIZAR PROGRESSO DA CONSTELAÇÃO
     */
    updateConstellationProgress(treeId) {
        const constellation = this.veias.trees[treeId];
        if (!constellation) return;

        // Contar nós desbloqueados desta constelação
        const unlockedNodes = this.veias.nodes.filter(
            n => n.treeId === treeId && (n.state === 'unlocked' || n.state === 'maxed')
        ).length;

        constellation.unlockedNodes = unlockedNodes;

        // Atualizar UI da sidebar
        const treeItem = document.querySelector(`[data-tree="${treeId}"]`);
        if (treeItem) {
            const countSpan = treeItem.querySelector('span:last-child');
            if (countSpan) {
                countSpan.textContent = `${unlockedNodes}/${constellation.totalNodes}`;
            }
        }

        console.log(`📊 ${treeId}: ${unlockedNodes}/${constellation.totalNodes} nós desbloqueados`);
    }

    /**
     * FEEDBACK DE ATIVAÇÃO (som, efeito visual)
     */
    playActivationFeedback(treeId) {
        // Aqui você pode adicionar sons, efeitos visuais, etc.
        // Por enquanto, apenas console.log
        console.log(`🎵 Feedback de ativação para ${treeId}`);
    }

    /**
     * RESTAURAR ESTADO DE LINHAS (carregar de salvo)
     */
    restoreActivatedLines(savedActivations) {
        if (!savedActivations || savedActivations.length === 0) return;

        console.log(`♻️ Restaurando ${savedActivations.length} linhas ativadas...`);

        savedActivations.forEach(activation => {
            const connection = this.veias.connections.find(
                conn => conn.from === activation.from && conn.to === activation.to
            );

            if (connection) {
                const node = this.veias.nodes.find(n => n.id === activation.to);
                if (node) {
                    const pathKey = `${connection.from}-${connection.to}`;
                    
                    // Armazenar dados de ativação
                    this.activatedPaths.add(pathKey);
                    this.activatedPathsData.set(pathKey, {
                        from: connection.from,
                        to: connection.to,
                        treeId: node.treeId,
                        intensity: activation.intensity || 'medium',
                        role: 'restored'
                    });
                    
                    this.activateLine(connection, node.treeId, activation.intensity || 'medium');
                }
            }
        });

        console.log(`✅ Linhas restauradas com sucesso`);
    }

    /**
     * OBTER LISTA DE ATIVAÇÕES PARA SALVAR
     */
    getActivatedLinesToSave() {
        const result = [];

        this.activatedPathsData.forEach((data, pathKey) => {
            result.push({
                from: data.from,
                to: data.to,
                treeId: data.treeId,
                intensity: data.intensity,
                role: data.role
            });
        });

        return result;
    }

    /**
     * ATIVAR MÚLTIPLAS LINHAS DE FORMA ESCALONADA (para efeito visual impressionante)
     */
    activateMultipleLinesCascade(nodeIds, delayBetween = 100) {
        console.log(`🎆 Ativando ${nodeIds.length} nós em cascata...`);

        nodeIds.forEach((nodeId, idx) => {
            setTimeout(() => {
                this.activateNodePath(nodeId);
            }, idx * delayBetween);
        });
    }
}

// Inicializar quando o sistema estiver pronto
window.VeiasAstraisLineActivation = VeiasAstraisLineActivation;

document.addEventListener('DOMContentLoaded', () => {
    if (window.veiasAstraisSystem) {
        window.veiasAstraisLineActivation = new VeiasAstraisLineActivation(window.veiasAstraisSystem);
        window.veiasAstraisSystem.lineActivation = window.veiasAstraisLineActivation;
        console.log('✅ Sistema de Ativação de Linhas inicializado');
    }
});
