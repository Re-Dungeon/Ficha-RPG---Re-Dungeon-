/* ════════════════════════════════════════════════════════════════════════════════ */
/* STATE-SYNCHRONIZATION.JS - Sincronização entre Managers e GlobalState             */
/* ════════════════════════════════════════════════════════════════════════════════ */

/**
 * 🔄 SISTEMA DE SINCRONIZAÇÃO CENTRALIZADO
 * 
 * Este módulo é responsável por:
 * 1. LER dados de todos os managers e sincronizar para GlobalState
 * 2. ESCREVER dados de GlobalState para todos os managers
 * 3. Manter única fonte de verdade: window.globalState
 * 
 * Cada manager deve implementar:
 * - getStateSnapshot() -> retorna seu estado atual completo
 * - loadFromState(estado) -> carrega estado e atualiza interface interna
 * - render() -> renderiza interface baseado no estado interno
 * 
 * NUNCA use localStorage diretamente. Use este módulo!
 */
class StateSynchronization {
    constructor() {
        this.managers = new Map();
        console.log('✅ StateSynchronization inicializado');
    }

    /**
     * Registra um manager para sincronização
     * @param {string} id - ID único do manager (ex: 'artsManager', 'treinamentoSistema')
     * @param {object} manager - Instância do manager
     * @param {object} config - Configuração de sincronização
     *   - statePath: caminho no globalState (ex: 'personagem.habilidades')
     *   - getState: function que retorna estado atual do manager
     *   - setState: function que carrega estado no manager
     *   - render: function que re-renderiza interface
     */
    registerManager(id, manager, config) {
        if (!config.getState || !config.setState || !config.render) {
            console.warn(`⚠️ Manager ${id} registrado sem callbacks completos`);
        }
        
        this.managers.set(id, {
            instance: manager,
            statePath: config.statePath,
            getState: config.getState.bind(manager),
            setState: config.setState.bind(manager),
            render: config.render.bind(manager)
        });
        
        console.log(`✅ Manager ${id} registrado para sincronização`);
        return this;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📤 SINCRONIZAR PARA GLOBALSSTATE (Antes de salvar)
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Sincroniza dados de TODOS os managers para GlobalState
     * Chamado ANTES de salvar arquivo JSON
     * 
     * @return {boolean} true se sucesso
     */
    syncAllToGlobalState() {
        console.log('\n🔄 === SINCRONIZAÇÃO: Managers → GlobalState ===');
        
        let totalSucesso = 0;
        let totalErro = 0;

        for (const [id, config] of this.managers.entries()) {
            try {
                const estadoAtual = config.getState();
                
                if (estadoAtual === null || estadoAtual === undefined) {
                    console.warn(`⚠️ ${id}: getState() retornou null/undefined`);
                    totalErro++;
                    continue;
                }

                // Atualizar GlobalState
                window.globalState.updatePart(config.statePath, estadoAtual);
                
                console.log(`✅ ${id}: ${config.statePath}`);
                totalSucesso++;
            } catch (erro) {
                console.error(`❌ ${id}: ${erro.message}`);
                totalErro++;
            }
        }

        console.log(`\n📊 Resultado: ${totalSucesso} sucesso, ${totalErro} erro\n`);
        return totalErro === 0;
    }

    /**
     * Sincroniza um manager específico
     */
    syncManagerToGlobalState(id) {
        const config = this.managers.get(id);
        if (!config) {
            console.error(`❌ Manager ${id} não registrado`);
            return false;
        }

        try {
            const estado = config.getState();
            window.globalState.updatePart(config.statePath, estado);
            console.log(`✅ ${id} → GlobalState`);
            return true;
        } catch (erro) {
            console.error(`❌ ${id} sincronização falhou:`, erro);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📥 CARREGAR DO GLOBALSSTATE (Depois de importar)
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Carrega estado de GlobalState para TODOS os managers
     * Chamado APÓS importar arquivo JSON
     * 
     * @return {boolean} true se sucesso
     */
    loadAllFromGlobalState() {
        console.log('\n🔄 === SINCRONIZAÇÃO: GlobalState → Managers ===');
        
        let totalSucesso = 0;
        let totalErro = 0;

        for (const [id, config] of this.managers.entries()) {
            try {
                // Obter estado do GlobalState
                const estado = window.globalState.getPart(config.statePath);
                
                if (estado === null || estado === undefined) {
                    console.warn(`⚠️ ${id}: Nenhum estado em ${config.statePath}`);
                    totalErro++;
                    continue;
                }

                // Carregar no manager
                config.setState(JSON.parse(JSON.stringify(estado)));
                
                console.log(`✅ ${id}: carregado de ${config.statePath}`);
                totalSucesso++;
            } catch (erro) {
                console.error(`❌ ${id}: ${erro.message}`);
                totalErro++;
            }
        }

        console.log(`\n📊 Resultado: ${totalSucesso} sucesso, ${totalErro} erro\n`);
        return totalErro === 0;
    }

    /**
     * Carrega um manager específico
     */
    loadManagerFromGlobalState(id) {
        const config = this.managers.get(id);
        if (!config) {
            console.error(`❌ Manager ${id} não registrado`);
            return false;
        }

        try {
            const estado = window.globalState.getPart(config.statePath);
            if (!estado) {
                console.warn(`⚠️ Nenhum estado para ${id} em ${config.statePath}`);
                return false;
            }
            
            config.setState(JSON.parse(JSON.stringify(estado)));
            console.log(`✅ ${id} ← GlobalState`);
            return true;
        } catch (erro) {
            console.error(`❌ ${id} carregamento falhou:`, erro);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🎨 RE-RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Re-renderiza TODOS os managers
     * Chamado APÓS carregar do GlobalState
     */
    renderAll() {
        console.log('\n🎨 === RE-RENDERIZAÇÃO: Todos os Managers ===');
        
        let totalSucesso = 0;
        let totalErro = 0;

        for (const [id, config] of this.managers.entries()) {
            try {
                config.render();
                console.log(`✅ ${id}: renderizado`);
                totalSucesso++;
            } catch (erro) {
                console.error(`❌ ${id}: ${erro.message}`);
                totalErro++;
            }
        }

        console.log(`\n📊 Resultado: ${totalSucesso} sucesso, ${totalErro} erro\n`);
        return totalErro === 0;
    }

    /**
     * Re-renderiza um manager específico
     */
    renderManager(id) {
        const config = this.managers.get(id);
        if (!config) {
            console.error(`❌ Manager ${id} não registrado`);
            return false;
        }

        try {
            config.render();
            console.log(`✅ ${id}: renderizado`);
            return true;
        } catch (erro) {
            console.error(`❌ ${id} renderização falhou:`, erro);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔍 DIAGNÓSTICO
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Verifica sincronização de um manager
     */
    checkSynchronization(id) {
        const config = this.managers.get(id);
        if (!config) {
            console.error(`❌ Manager ${id} não registrado`);
            return null;
        }

        try {
            const managerState = config.getState();
            const globalState = window.globalState.getPart(config.statePath);
            
            const isSync = JSON.stringify(managerState) === JSON.stringify(globalState);
            
            return {
                manager: id,
                statePath: config.statePath,
                sincronizado: isSync,
                tamanhoManager: JSON.stringify(managerState).length,
                tamanhoGlobal: JSON.stringify(globalState).length,
                managerState: managerState,
                globalState: globalState
            };
        } catch (erro) {
            console.error(`❌ Verificação falhou para ${id}:`, erro);
            return null;
        }
    }

    /**
     * Verifica sincronização de TODOS os managers
     */
    checkAllSynchronization() {
        console.log('\n🔍 === VERIFICAÇÃO DE SINCRONIZAÇÃO ===');
        const resultados = [];

        for (const [id, _] of this.managers.entries()) {
            const resultado = this.checkSynchronization(id);
            if (resultado) {
                resultados.push(resultado);
                const status = resultado.sincronizado ? '✅' : '❌';
                console.log(`${status} ${id}: ${resultado.sincronizado ? 'SINCRONIZADO' : 'DESSINCRONIZADO'}`);
            }
        }

        console.log('\n');
        return resultados;
    }

    /**
     * Lista todos os managers registrados
     */
    listManagers() {
        const lista = [];
        for (const [id, config] of this.managers.entries()) {
            lista.push({
                id: id,
                statePath: config.statePath
            });
        }
        return lista;
    }
}

/**
 * INSTÂNCIA GLOBAL ÚNICA
 */
if (typeof window !== 'undefined') {
    window.stateSynchronization = new StateSynchronization();
    console.log('✅ StateSynchronization inicializado');
}
