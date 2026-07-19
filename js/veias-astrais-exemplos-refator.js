/**
 * VEIAS ASTRAIS - EXEMPLOS E TESTE
 * Comandos úteis para console para testar e manipular o sistema
 */

// ============================================================================
// ATALHOS GLOBAIS
// ============================================================================

const VA = {
    // Abrir/fechar modal
    open: () => {
        const modal = document.getElementById('veias-astrais-modal');
        if (modal) modal.classList.remove('hidden');
        if (window.veiasAstraisSystem) window.veiasAstraisSystem.open();
    },

    close: () => {
        const modal = document.getElementById('veias-astrais-modal');
        if (modal) modal.classList.add('hidden');
        if (window.veiasAstraisSystem) window.veiasAstraisSystem.close();
    },

    // Obter sistema
    system: () => window.veiasAstraisSystem,
    nav: () => window.veiasAstraisSystem?.navigation,

    // Informações
    stats: () => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');
        
        console.log('📊 ESTATÍSTICAS DO SISTEMA:');
        console.log(`  Total de Nós: ${sys.nodes.length}`);
        console.log(`  Conexões: ${sys.connections.length}`);
        console.log(`  Power Combat: ${sys.powerCombat} / ${sys.maxPowerCombat}`);
        console.log(`  Ressonância: ${sys.resonance} / ${sys.maxResonance}`);
        console.log(`  Árvores: ${Object.keys(sys.trees).length}`);
        
        Object.values(sys.trees).forEach(tree => {
            console.log(`    - ${tree.name}: ${tree.unlockedNodes} / ${tree.totalNodes} desbloqueados`);
        });
    },

    // Listar nós
    nodes: (filter = null) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        let nodes = sys.nodes;

        if (filter === 'locked') nodes = nodes.filter(n => n.state === 'locked');
        else if (filter === 'unlocked') nodes = nodes.filter(n => n.state === 'unlocked');
        else if (filter === 'active') nodes = nodes.filter(n => n.state === 'active');
        else if (filter === 'maxed') nodes = nodes.filter(n => n.state === 'maxed');

        console.log(`📌 NÓS (${filter || 'todos'}):`, nodes);
        return nodes;
    },

    // Listar árvores
    trees: () => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');
        
        console.log('🌳 ÁRVORES:', sys.trees);
        return sys.trees;
    },

    // Gerenciamento de nós
    unlock: (nodeId) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        const node = sys.nodes.find(n => n.id === nodeId);
        if (!node) return console.log(`❌ Nó ${nodeId} não encontrado`);

        sys.unlockNode(node);
        console.log(`✅ Nó ${node.name} desbloqueado!`);
    },

    unlockAll: () => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        sys.nodes.forEach(node => {
            if (node.state === 'locked') {
                node.state = 'unlocked';
            }
        });

        sys.renderNodes();
        sys.renderConnections();
        sys.updateUI();
        console.log('✅ Todos os nós desbloqueados!');
    },

    // Power Combat
    addPowerCombat: (amount) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        sys.powerCombat = Math.min(sys.maxPowerCombat, sys.powerCombat + amount);
        sys.updateUI();
        console.log(`✅ Power Combat adicionado! Atual: ${sys.powerCombat} / ${sys.maxPowerCombat}`);
    },

    setPowerCombat: (amount) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        sys.powerCombat = Math.max(0, Math.min(sys.maxPowerCombat, amount));
        sys.updateUI();
        console.log(`✅ Power Combat definido para: ${sys.powerCombat}`);
    },

    // Navegação
    focus: (nodeId) => {
        const sys = window.veiasAstraisSystem;
        if (!sys || !sys.navigation) return console.log('❌ Navegação não disponível');

        const node = sys.nodes.find(n => n.id === nodeId);
        if (!node) return console.log(`❌ Nó ${nodeId} não encontrado`);

        sys.navigation.focusOn(node.x, node.y, 1.5);
        console.log(`✅ Focando em ${node.name}`);
    },

    focusTree: (treeId) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        sys.focusTree(treeId);
        console.log(`✅ Focando em ${treeId}`);
    },

    focusCore: () => {
        const sys = window.veiasAstraisSystem;
        if (!sys || !sys.navigation) return console.log('❌ Navegação não disponível');

        sys.navigation.focusCore();
        console.log('✅ Focando no núcleo central');
    },

    zoom: (level) => {
        const sys = window.veiasAstraisSystem;
        if (!sys || !sys.navigation) return console.log('❌ Navegação não disponível');

        sys.navigation.zoom = Math.max(
            sys.navigation.minZoom,
            Math.min(sys.navigation.maxZoom, level)
        );
        sys.navigation.updateMapTransform();
        sys.navigation.updateZoomIndicator();
        console.log(`✅ Zoom definido para: ${Math.round(sys.navigation.zoom * 100)}%`);
    },

    // Seleção
    select: (nodeId) => {
        const sys = window.veiasAstraisSystem;
        if (!sys) return console.log('❌ Sistema não inicializado');

        const node = sys.nodes.find(n => n.id === nodeId);
        if (!node) return console.log(`❌ Nó ${nodeId} não encontrado`);

        sys.selectNode(node);
        console.log(`✅ Nó selecionado: ${node.name}`);
    },

    selected: () => {
        const sys = window.veiasAstraisSystem;
        if (!sys || !sys.selectedNode) return console.log('Nenhum nó selecionado');
        
        console.log('✨ NÓ SELECIONADO:', sys.selectedNode);
        return sys.selectedNode;
    }
};

// Exportar globalmente
window.VA = VA;

// ============================================================================
// EXEMPLOS DE USO
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ✨ VEIAS ASTRAIS - CONSOLE COMMANDS                          ║
║                                                                ║
║  Use window.VA para acessar as funções:                       ║
║                                                                ║
║  VA.open()               - Abrir modal                        ║
║  VA.close()              - Fechar modal                       ║
║  VA.stats()              - Ver estatísticas                   ║
║  VA.nodes()              - Listar todos os nós                ║
║  VA.nodes('locked')      - Listar nós bloqueados              ║
║  VA.nodes('unlocked')    - Listar nós desbloqueados           ║
║  VA.trees()              - Listar árvores                     ║
║  VA.unlock(id)           - Desbloquear nó por ID              ║
║  VA.unlockAll()          - Desbloquear todos os nós           ║
║  VA.addMana(50)          - Adicionar mana                     ║
║  VA.setMana(100)         - Definir mana                       ║
║  VA.focus(0)             - Focar em nó específico             ║
║  VA.focusTree('corpo')   - Focar em árvore                    ║
║  VA.focusCore()          - Focar no núcleo                    ║
║  VA.zoom(2)              - Definir zoom (0.5-3)               ║
║  VA.select(0)            - Selecionar nó                      ║
║  VA.selected()           - Ver nó selecionado                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// ============================================================================
// TESTES AUTOMÁTICOS
// ============================================================================

function testarVeiasAstrais() {
    console.log('🧪 Iniciando testes do sistema Veias Astrais...\n');

    // Teste 1: Abertura
    console.log('✅ Teste 1: Abrindo modal...');
    VA.open();

    // Teste 2: Aguardar inicialização
    setTimeout(() => {
        console.log('\n✅ Teste 2: Verificando sistema...');
        VA.stats();

        // Teste 3: Listar nós
        console.log('\n✅ Teste 3: Nós por estado:');
        console.log(`  Bloqueados: ${VA.nodes('locked').length}`);
        console.log(`  Desbloqueados: ${VA.nodes('unlocked').length}`);

        // Teste 4: Desbloqueio
        console.log('\n✅ Teste 4: Desbloqueando primeiro nó...');
        const firstLocked = VA.nodes('locked')[0];
        if (firstLocked) {
            VA.unlock(firstLocked.id);
        }

        // Teste 5: Foco
        console.log('\n✅ Teste 5: Focando em árvore corpo...');
        VA.focusTree('corpo');

        // Teste 6: Zoom
        console.log('\n✅ Teste 6: Ajustando zoom...');
        VA.zoom(1.5);

        console.log('\n✨ Testes completados!');
    }, 500);
}

// Exportar função de teste
window.testarVeiasAstrais = testarVeiasAstrais;

// Comentar a linha abaixo para não executar testes automaticamente ao carregar
// testarVeiasAstrais();
