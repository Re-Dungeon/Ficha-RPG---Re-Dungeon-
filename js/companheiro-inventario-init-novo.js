/* ========================================== */
/* COMPANHEIRO-INVENTARIO-INIT.JS              */
/* Inicialização do Sistema de Inventário      */
/* ========================================== */

/**
 * CompanheiroInventarioInit
 * Inicializa e integra o sistema de inventário do companheiro
 * 
 * Fluxo:
 * 1. Aguarda companheiroInventarioManager disponível
 * 2. Aguarda companheiroInventarioUI disponível
 * 3. Aguarda companheiroData disponível
 * 4. Aguarda localStorageManager disponível
 * 5. Inicializa manager com dados e localStorage
 * 6. Inicializa UI com manager
 * 7. Configura sincronização com atributos do companheiro
 */

class CompanheiroInventarioInit {
    constructor() {
        this.tentativas = 0;
        this.maxTentativas = 40; // Aumentado de 20 para 40 (20 segundos ao invés de 10)
        this.intervaloMs = 500;
        
        this.inicializar();
    }

    inicializar() {
        // Verificar dependências
        if (!window.companheiroInventarioManager) {
            if (this.tentativas < this.maxTentativas) {
                this.tentativas++;
                console.log(`⏳ Aguardando companheiroInventarioManager... (${this.tentativas}/${this.maxTentativas})`);
                setTimeout(() => this.inicializar(), this.intervaloMs);
            } else {
                console.warn('⚠️ companheiroInventarioManager não encontrado após 20 segundos');
            }
            return;
        }

        if (!window.companheiroInventarioUI) {
            if (this.tentativas < this.maxTentativas) {
                this.tentativas++;
                console.log(`⏳ Aguardando companheiroInventarioUI... (${this.tentativas}/${this.maxTentativas})`);
                setTimeout(() => this.inicializar(), this.intervaloMs);
            } else {
                console.warn('⚠️ companheiroInventarioUI não encontrado após 20 segundos');
            }
            return;
        }

        if (!window.companheiroData) {
            if (this.tentativas < this.maxTentativas) {
                this.tentativas++;
                console.log(`⏳ Aguardando companheiroData... (${this.tentativas}/${this.maxTentativas})`);
                setTimeout(() => this.inicializar(), this.intervaloMs);
            } else {
                console.warn('⚠️ companheiroData não encontrado após 20 segundos');
            }
            return;
        }

        if (!window.localStorageManager) {
            if (this.tentativas < this.maxTentativas) {
                this.tentativas++;
                console.log(`⏳ Aguardando localStorageManager... (${this.tentativas}/${this.maxTentativas})`);
                setTimeout(() => this.inicializar(), this.intervaloMs);
            } else {
                console.warn('⚠️ localStorageManager não encontrado após 20 segundos');
            }
            return;
        }

        // Todas as dependências disponíveis
        console.log('🚀 Todas as dependências carregadas!');
        this.setup();
    }

    /**
     * Aguarda elemento estar visível e pronto
     */
    async aguardarElementoVisivel(seletor, maxTentativas = 30) {
        for (let i = 0; i < maxTentativas; i++) {
            const elemento = document.querySelector(seletor);
            if (elemento && elemento.offsetParent !== null) {
                // Elemento existe e está visível
                console.log(`✅ Elemento ${seletor} está pronto`);
                return elemento;
            }
            // Aguardar 100ms
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn(`⚠️ Elemento ${seletor} não ficou visível após ${maxTentativas * 100}ms`);
        return null;
    }

    /**
     * Aguarda container do companheiro estar pronto
     */
    async aguardarConainerCompanheiro() {
        // Aguardar pelo container principal ou modal
        const container = await this.aguardarElementoVisivel('#aba-companheiro-inventario, #modalNovoCompanheiro');
        if (!container) {
            // Se nenhum estiver visível, apenas aguarde 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    setup() {
        // Inicializar manager
        window.companheiroInventarioManager.init(
            window.companheiroData,
            window.localStorageManager
        );

        // ⭐ AGUARDAR container estar pronto ANTES de inicializar UI
        this.aguardarConainerCompanheiro().then(() => {
            // Inicializar UI
            window.companheiroInventarioUI.init(window.companheiroInventarioManager);
            
            // ⭐ Configurar listeners globais (apenas uma vez)
            window.companheiroInventarioUI.setupListenersGlobais();

            // Setup de sincronização com atributos do companheiro
            this.setupSincronizacao();

            // Setup de listeners de abas
            this.setupAbas();

            console.log('✅ CompanheiroInventarioInit completo!');
        });

    /**
     * Configura sincronização com mudanças de atributos do companheiro
     */
    setupSincronizacao() {
        // Listener para quando atributos mudam
        window.addEventListener('companheiroAtributosAtualizados', () => {
            console.log('🔄 Atributos do companheiro atualizados, recalculando espaço...');
            if (window.companheiroInventarioUI) {
                window.companheiroInventarioUI.render();
            }
        });

        // Listener para quando companheiro é selecionado
        window.addEventListener('companheiroSelecionado', (e) => {
            const companheiroData = e.detail;
            console.log('🐾 Novo companheiro selecionado:', companheiroData?.nome);
            
            // Reinicializar COMPLETAMENTE com novos dados
            if (window.companheiroInventarioManager && companheiroData) {
                window.companheiroInventarioManager.init(
                    companheiroData,
                    window.localStorageManager
                );
                // ⭐ IMPORTANTE: chamar init() da UI para re-cachear elementos e re-adicionar listeners
                window.companheiroInventarioUI.init(window.companheiroInventarioManager);
            }
        });

        console.log('✅ Sincronização configurada');
    }

    /**
     * Configura listeners para alternância de abas
     */
    setupAbas() {
        // ✅ USAR EVENT DELEGATION para capturar cliques em abas
        const modal = document.getElementById('modalNovoCompanheiro');
        if (!modal) {
            console.warn('⚠️ Modal não encontrada para setup de abas');
            return;
        }

        // Quando aba de inventário é clicada, renderizar conteúdo
        modal.addEventListener('click', (e) => {
            const btnClicado = e.target.closest('.modal-aba-btn');
            if (btnClicado) {
                const abaAtiva = btnClicado.getAttribute('data-aba');
                if (abaAtiva === 'inventario') {
                    console.log('📦 Aba de inventário ativada, renderizando...');
                    // ✅ Dar tempo para o CSS fazer a transição
                    setTimeout(() => {
                        if (window.companheiroInventarioUI) {
                            window.companheiroInventarioUI.render();
                        }
                    }, 50);
                }
            }
        });

        console.log('✅ Listeners de abas configurados');
    }
}

// Inicializar quando documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CompanheiroInventarioInit();
    });
} else {
    new CompanheiroInventarioInit();
}
