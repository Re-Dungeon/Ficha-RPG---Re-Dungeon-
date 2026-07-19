/**
 * EXEMPLOS PRÁTICOS - SISTEMA DE ATIVAÇÃO DE LINHAS
 * Integração com o sistema de desbloqueio de nós
 */

// ============================================================================
// EXEMPLO 1: INTEGRAR COM MODAL DE SELEÇÃO DE NÓ
// ============================================================================

/**
 * Quando o usuário clica em um nó para desbloqueá-lo
 */
function onNodeSelected(node) {
    console.log(`🔍 Nó selecionado: ${node.name}`);

    // 1. Verificar se pode desbloquear (ex: PC suficiente)
    if (window.veiasAstraisSystem.powerCombat < node.cost) {
        console.warn(`❌ PC insuficiente! Necessário: ${node.cost}, Disponível: ${window.veiasAstraisSystem.powerCombat}`);
        node.classList.add('unlock-failed');
        setTimeout(() => node.classList.remove('unlock-failed'), 400);
        return;
    }

    // 2. Desbloquear o nó
    node.state = 'unlocked';

    // 3. Consumir PC
    window.veiasAstraisSystem.powerCombat -= node.cost;

    // 4. Ativar linha com efeito em cascata completo
    window.veiasAstraisLineActivation.activateCompletePath(node.id);

    // 5. Atualizar UI
    updateUIAfterUnlock(node);

    console.log(`✅ Nó ${node.name} desbloqueado com sucesso!`);
}

// ============================================================================
// EXEMPLO 2: DESBLOQUEIO AUTOMÁTICO DE CAMINHO
// ============================================================================

/**
 * Desbloquear automaticamente todos os nós no caminho até um nó específico
 * (útil para "speedrun" ou modo tutorial)
 */
function unlockPathToNode(targetNodeId, options = {}) {
    const { animated = true, delayBetween = 200 } = options;

    // 1. Construir caminho até o nó
    const path = [];
    let currentNode = window.veiasAstraisSystem.nodes.find(n => n.id === targetNodeId);

    while (currentNode) {
        path.unshift(currentNode);
        if (currentNode.parentId === 'core') break;
        currentNode = window.veiasAstraisSystem.nodes.find(n => n.id === currentNode.parentId);
    }

    console.log(`🔓 Desbloqueando caminho com ${path.length} nós...`);

    // 2. Desbloquear sequencialmente
    path.forEach((node, idx) => {
        setTimeout(() => {
            if (node.state === 'locked') {
                node.state = 'unlocked';
                
                // Ativar linha
                if (animated) {
                    window.veiasAstraisLineActivation.activateNodePath(node.id);
                }

                // Efeito visual no nó
                const nodeElement = document.getElementById(`node-${node.id}`);
                if (nodeElement) {
                    nodeElement.classList.add('unlock-success');
                    setTimeout(() => nodeElement.classList.remove('unlock-success'), 600);
                }

                console.log(`  ✅ ${node.name}`);
            }
        }, animated ? idx * delayBetween : 0);
    });
}

// Exemplo de uso:
// unlockPathToNode(25); // Desbloquear até nó 25

// ============================================================================
// EXEMPLO 3: DESBLOQUEAR TODOS OS NÓS DE UMA CONSTELAÇÃO
// ============================================================================

/**
 * Desbloquear todos os nós de uma constelação
 */
function unlockConstellation(treeId, options = {}) {
    const { animated = true, delayBetween = 100 } = options;

    const constellationNodes = window.veiasAstraisSystem.nodes.filter(
        n => n.treeId === treeId && n.state === 'locked'
    );

    console.log(`🌟 Desbloqueando ${constellationNodes.length} nós de ${treeId}...`);

    constellationNodes.forEach((node, idx) => {
        setTimeout(() => {
            node.state = 'unlocked';

            if (animated) {
                window.veiasAstraisLineActivation.activateNodePath(node.id);
            }

            const nodeElement = document.getElementById(`node-${node.id}`);
            if (nodeElement) {
                nodeElement.classList.add('unlock-success');
                setTimeout(() => nodeElement.classList.remove('unlock-success'), 600);
            }

            console.log(`  ✅ ${node.name}`);
        }, animated ? idx * delayBetween : 0);
    });
}

// Exemplo de uso:
// unlockConstellation('arty'); // Desbloquear todos os nós de Arty

// ============================================================================
// EXEMPLO 4: SALVAMENTO E CARREGAMENTO
// ============================================================================

/**
 * Salvar estado das linhas ativadas
 */
function saveVeiasState() {
    const state = {
        timestamp: new Date().toISOString(),
        powerCombat: window.veiasAstraisSystem.powerCombat,
        resonance: window.veiasAstraisSystem.resonance,
        activatedLines: window.veiasAstraisLineActivation.getActivatedLinesToSave(),
        nodeStates: window.veiasAstraisSystem.nodes.map(n => ({
            id: n.id,
            state: n.state,
            treeId: n.treeId
        }))
    };

    localStorage.setItem('veias_astrais_state', JSON.stringify(state));
    console.log('💾 Estado das Veias Astrais salvo!');
    return state;
}

/**
 * Carregar estado das linhas ativadas
 */
function loadVeiasState() {
    const saved = localStorage.getItem('veias_astrais_state');
    if (!saved) {
        console.warn('⚠️ Nenhum estado salvo encontrado');
        return null;
    }

    const state = JSON.parse(saved);
    console.log(`♻️ Carregando estado de ${state.timestamp}...`);

    // 1. Restaurar valores
    window.veiasAstraisSystem.powerCombat = state.powerCombat;
    window.veiasAstraisSystem.resonance = state.resonance;

    // 2. Restaurar estados dos nós
    state.nodeStates.forEach(saved => {
        const node = window.veiasAstraisSystem.nodes.find(n => n.id === saved.id);
        if (node) node.state = saved.state;
    });

    // 3. Restaurar linhas ativadas
    window.veiasAstraisLineActivation.restoreActivatedLines(state.activatedLines);

    console.log('✅ Estado das Veias Astrais restaurado!');
    return state;
}

// ============================================================================
// EXEMPLO 5: EXPORTAR/IMPORTAR CONFIGURAÇÃO
// ============================================================================

/**
 * Exportar como JSON para compartilhar configuração
 */
function exportVeiasConfiguration() {
    const config = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        constellations: {},
        totalUnlocked: 0
    };

    // Agrupar por constelação
    Object.keys(window.veiasAstraisSystem.trees).forEach(treeId => {
        const nodes = window.veiasAstraisSystem.nodes.filter(n => n.treeId === treeId);
        const unlockedNodes = nodes.filter(n => n.state === 'unlocked' || n.state === 'maxed');

        config.constellations[treeId] = {
            total: nodes.length,
            unlocked: unlockedNodes.length,
            nodes: unlockedNodes.map(n => ({ id: n.id, name: n.name, level: n.level }))
        };

        config.totalUnlocked += unlockedNodes.length;
    });

    console.log('📊 Configuração exportada:', config);
    return config;
}

/**
 * Gerar código para compartilhar (base64)
 */
function generateShareCode() {
    const config = exportVeiasConfiguration();
    const jsonStr = JSON.stringify(config);
    const encoded = btoa(jsonStr);
    console.log('🔗 Código para compartilhar:', encoded);
    return encoded;
}

/**
 * Importar de código compartilhado
 */
function importFromShareCode(code) {
    try {
        const jsonStr = atob(code);
        const config = JSON.parse(jsonStr);
        console.log('📥 Configuração importada:', config);

        // Restaurar desbloqueios
        Object.entries(config.constellations).forEach(([treeId, constellation]) => {
            constellation.nodes.forEach(nodeData => {
                const node = window.veiasAstraisSystem.nodes.find(n => n.id === nodeData.id);
                if (node) {
                    node.state = 'unlocked';
                    window.veiasAstraisLineActivation.activateNodePath(node.id);
                }
            });
        });

        console.log('✅ Configuração restaurada com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao importar código:', error);
        return false;
    }
}

// ============================================================================
// EXEMPLO 6: ANIMAÇÃO ESPECIAL - DESBLOQUEIO MASSIVO
// ============================================================================

/**
 * Efeito visual epectacular quando desbloqueia muitos nós de uma vez
 */
function unlockMassiveConstellation(treeId) {
    const constellationNodes = window.veiasAstraisSystem.nodes
        .filter(n => n.treeId === treeId && n.state === 'locked')
        .sort((a, b) => a.layer - b.layer); // Ordenar por camada

    console.log(`🎆 Desbloqueio massivo de ${constellationNodes.length} nós!`);

    // Efeito de onda começando do centro
    constellationNodes.forEach((node, idx) => {
        setTimeout(() => {
            // Atualizar estado
            node.state = 'unlocked';

            // Ativar linha com efeito de onda
            window.veiasAstraisLineActivation.activateNodePath(node.id);

            // Efeito visual especial
            const nodeElement = document.getElementById(`node-${node.id}`);
            if (nodeElement) {
                nodeElement.classList.add('burst-unlock');
                setTimeout(() => nodeElement.classList.remove('burst-unlock'), 1000);
            }

            // Progressão visual
            if (idx % 3 === 0) {
                console.log(`  ✨ ${idx + 1}/${constellationNodes.length}`);
            }
        }, idx * 80); // Cascata rápida
    });

    // Notificação final
    setTimeout(() => {
        console.log(`🎉 Constelação ${treeId} completamente desbloqueada!`);
    }, constellationNodes.length * 80);
}

// ============================================================================
// EXEMPLO 7: EASTER EGG - DESBLOQUEAR TUDO
// ============================================================================

/**
 * Modo debug: desbloquear todos os nós
 * (Use apenas para testes!)
 */
function debugUnlockEverything() {
    if (!window.__DEBUG_MODE__) {
        console.warn('⚠️ Debug mode desativado. Digite: window.__DEBUG_MODE__ = true');
        return;
    }

    console.warn('🔓 DESBLOQUEANDO TUDO - MODO DEBUG');

    const allNodes = window.veiasAstraisSystem.nodes;
    allNodes.forEach((node, idx) => {
        setTimeout(() => {
            node.state = 'unlocked';
            window.veiasAstraisLineActivation.activateNodePath(node.id);
        }, idx * 30);
    });

    console.log(`✅ ${allNodes.length} nós desbloqueados!`);
}

// ============================================================================
// EXEMPLO 8: MONITORAMENTO E ESTATÍSTICAS
// ============================================================================

/**
 * Obter estatísticas completas
 */
function getVeiasStatistics() {
    const stats = {
        totalNodes: window.veiasAstraisSystem.nodes.length,
        unlockedNodes: 0,
        maxedNodes: 0,
        lockedNodes: 0,
        byConstellation: {},
        totalLinesActive: window.veiasAstraisLineActivation.activatedPaths.size,
        powerCombatUsed: window.veiasAstraisSystem.maxPowerCombat - window.veiasAstraisSystem.powerCombat,
        resonance: window.veiasAstraisSystem.resonance
    };

    // Contar por estado
    window.veiasAstraisSystem.nodes.forEach(node => {
        if (node.state === 'unlocked') stats.unlockedNodes++;
        else if (node.state === 'maxed') stats.maxedNodes++;
        else if (node.state === 'locked') stats.lockedNodes++;

        // Por constelação
        if (!stats.byConstellation[node.treeId]) {
            stats.byConstellation[node.treeId] = {
                total: 0,
                unlocked: 0,
                maxed: 0,
                locked: 0
            };
        }

        stats.byConstellation[node.treeId].total++;
        if (node.state === 'unlocked') stats.byConstellation[node.treeId].unlocked++;
        else if (node.state === 'maxed') stats.byConstellation[node.treeId].maxed++;
        else if (node.state === 'locked') stats.byConstellation[node.treeId].locked++;
    });

    // Calcular progresso geral
    stats.progressPercent = Math.round(
        ((stats.unlockedNodes + stats.maxedNodes) / stats.totalNodes) * 100
    );

    return stats;
}

/**
 * Exibir estatísticas no console
 */
function printVeiasStatistics() {
    const stats = getVeiasStatistics();
    console.table({
        'Total de Nós': stats.totalNodes,
        'Desbloqueados': stats.unlockedNodes,
        'Maximizados': stats.maxedNodes,
        'Bloqueados': stats.lockedNodes,
        'Progresso': `${stats.progressPercent}%`,
        'Linhas Ativas': stats.totalLinesActive,
        'Mana Usado': `${stats.manaUsed}/${window.veiasAstraisSystem.maxMana}`,
        'Ressonância': stats.resonance
    });

    console.log('Por Constelação:', stats.byConstellation);
}

// ============================================================================
// USO DOS EXEMPLOS
// ============================================================================

/*
// 1. Desbloquear um nó ao clicar
document.getElementById('node-5')?.addEventListener('click', () => {
    const node = veiasAstraisSystem.nodes.find(n => n.id === 5);
    onNodeSelected(node);
});

// 2. Desbloquear caminho completo
unlockPathToNode(15);

// 3. Desbloquear constelação inteira
unlockConstellation('arty');

// 4. Salvar e carregar
saveVeiasState();
setTimeout(() => loadVeiasState(), 2000);

// 5. Exportar/Importar
const shareCode = generateShareCode();
importFromShareCode(shareCode);

// 6. Desbloqueio massivo
unlockMassiveConstellation('aune');

// 7. Ativar modo debug
window.__DEBUG_MODE__ = true;
debugUnlockEverything();

// 8. Ver estatísticas
printVeiasStatistics();
*/
