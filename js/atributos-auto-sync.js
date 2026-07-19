/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ATRIBUTOS-AUTO-SYNC.JS
 * SINCRONIZAÇÃO AUTOMÁTICA E PERSISTENTE DE ATRIBUTOS
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Problema Resolvido:
 * - Atributos/Status não eram salvos automaticamente ao fechar modais
 * - Dados desapareciam ao pressionar F5
 * 
 * Solução:
 * - Sincroniza AppState com localStorage em tempo real
 * - Fallback: sincronização a cada 2 segundos
 * - Sincronização forçada ao descarregar página
 * - Sincronização quando AppState muda
 */

class AtributosAutoSync {
    constructor() {
        this.syncInterval = null;
        this.lastAtributosState = null;
        this.lastStatusState = null;
        this.lastReputacaoState = null;
        this.isSyncing = false;
        
        console.log('🔄 [AtributosAutoSync] Inicializando...');
        this.init();
    }

    /**
     * Inicializa o sistema de sincronização
     */
    init() {
        // 1️⃣ Sincronizar a cada 2 segundos (fallback)
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, 2000);
        
        console.log('✅ Sincronização periódica ativada (2s)');

        // 2️⃣ Sincronizar quando página vai descarregar (F5, fechar aba, etc)
        window.addEventListener('beforeunload', (e) => {
            // 🔒 BLOQUEIO: Não sincronizar durante importação ou limpeza
            if (window.isImportandoFicha || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA') ||
                sessionStorage.getItem('LIMPEZA_FICHA_ATIVA')) {
                console.log('🔒 [AutoSync] Sincronização beforeunload bloqueada - Operação em progresso');
                return;
            }

            console.log('⚠️ [AutoSync] Página descarregando - sincronizando dados...');
            this.performSync(true);  // Sincronização forçada
        });
        
        console.log('✅ Listener de descarregamento ativado');

        // 3️⃣ Sincronizar quando AppState notifica mudanças
        if (window.appState) {
            // Verificar se AppState tem subscribe
            if (typeof window.appState.subscribe === 'function') {
                window.appState.subscribe(() => {
                    console.log('🔔 [AutoSync] AppState notificou mudança');
                    this.performSync();
                });
                console.log('✅ Listener de AppState ativado');
            }
        }

        // 4️⃣ Sincronizar quando aba fica visível (volta de background)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ [AutoSync] Aba ficou visível - sincronizando...');
                this.performSync();
            }
        });
        
        console.log('✅ Listener de visibilidade ativado');

        console.log('✅ [AtributosAutoSync] Sistema pronto!');
    }

    /**
     * Executa a sincronização
     * @param {boolean} force - Se true, força sincronização mesmo sem mudanças
     */
    performSync(force = false) {
        // 🔒 BLOQUEIO DUPLO: Não sincronizar se limpeza ou importação em progresso
        if (sessionStorage.getItem('LIMPEZA_FICHA_ATIVA') || sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA')) {
            console.log('🔒 [AutoSync] Sincronização bloqueada - Operação em progresso');
            return;
        }

        // Evitar sincronizações paralelas
        if (this.isSyncing && !force) {
            return;
        }
        
        this.isSyncing = true;

        try {
            // Obter estado atual
            const state = window.appState?.getState();
            if (!state) {
                this.isSyncing = false;
                return;
            }

            // Verificar se houve mudanças em atributos
            const atributosJSON = JSON.stringify(state.atributos);
            const statusJSON = JSON.stringify(state.status);
            const reputacaoJSON = JSON.stringify(state.reputation);

            let temMudancas = false;

            // 🔍 Atributos mudaram?
            if (force || atributosJSON !== this.lastAtributosState) {
                if (state.atributos && window.localStorageManager) {
                    window.localStorageManager.saveAtributos(state.atributos);
                    console.log('💾 [AutoSync] Atributos sincronizados');
                    temMudancas = true;
                }
                this.lastAtributosState = atributosJSON;
            }

            // 🔍 Status mudou?
            if (force || statusJSON !== this.lastStatusState) {
                if (state.status && window.localStorageManager) {
                    window.localStorageManager.saveStatus(state.status);
                    console.log('💾 [AutoSync] Status sincronizado');
                    temMudancas = true;
                }
                this.lastStatusState = statusJSON;
            }

            // 🔍 Reputação mudou?
            if (force || reputacaoJSON !== this.lastReputacaoState) {
                if (state.reputation && window.localStorageManager) {
                    window.localStorageManager.saveReputacao(state.reputation);
                    console.log('💾 [AutoSync] Reputação sincronizada');
                    temMudancas = true;
                }
                this.lastReputacaoState = reputacaoJSON;
            }

            if (force && !temMudancas) {
                console.log('ℹ️ [AutoSync] Sincronização forçada sem mudanças');
            }

        } catch (erro) {
            console.error('❌ [AutoSync] Erro ao sincronizar:', erro);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Força uma sincronização completa
     */
    forceSync() {
        console.log('🔄 [AutoSync] Sincronização forçada solicitada');
        this.performSync(true);
    }

    /**
     * Desativa o sistema de sincronização
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            console.log('🛑 [AutoSync] Sincronização periódica desativada');
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO GLOBAL
// ════════════════════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.atributosAutoSync = new AtributosAutoSync();
        console.log('✅ AtributosAutoSync inicializado (via DOMContentLoaded)');
    });
} else {
    window.atributosAutoSync = new AtributosAutoSync();
    console.log('✅ AtributosAutoSync inicializado (documento já carregado)');
}
