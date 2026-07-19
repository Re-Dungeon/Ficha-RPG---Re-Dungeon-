/* ========================================== */
/* INVENTARIO-INIT.JS                         */
/* Inicialização e Integração do Inventário   */
/* ========================================== */

/**
 * InventarioInit
 * Responsável por:
 * - Inicializar todos os componentes
 * - Integrar com AtributosManager
 * - Configurar callbacks de sincronização
 * - Gerenciar lifecycle
 */

class InventarioInit {
    constructor() {
        this.inicializado = false;
        console.log('✅ InventarioInit criado');
    }

    /**
     * Inicializa o sistema de inventário completo
     */
    inicializar() {
        try {
            // Esperar LocalStorageManager e AtributosManager
            if (!window.localStorageManager) {
                console.warn('⚠️  Aguardando LocalStorageManager...');
                setTimeout(() => this.inicializar(), 100);
                return;
            }

            if (!window.atributosManager) {
                console.warn('⚠️  Aguardando AtributosManager...');
                setTimeout(() => this.inicializar(), 100);
                return;
            }

            if (!window.inventarioManager) {
                console.warn('⚠️  Aguardando InventarioManager...');
                setTimeout(() => this.inicializar(), 100);
                return;
            }

            if (!window.inventarioUI) {
                console.warn('⚠️  Aguardando InventarioUI...');
                setTimeout(() => this.inicializar(), 100);
                return;
            }

            if (this.inicializado) {
                console.log('✅ Inventário já foi inicializado');
                return;
            }

            console.log('🚀 Iniciando sistema de inventário completo...');

            // 1. Configurar InventarioManager com dependências
            window.inventarioManager.init(
                window.atributosManager,
                window.localStorageManager
            );

            // 2. Configurar InventarioUI
            window.inventarioUI.init(window.inventarioManager);

            // 3. Configurar sincronização com atributos
            this.setupSincronizacaoAtributos();

            // 4. Carregar dados ao trocar de aba
            this.setupTrocaAbas();

            this.inicializado = true;
            console.log('✅ Sistema de inventário inicializado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao inicializar inventário:', error);
        }
    }

    /**
     * Configura sincronização com mudanças de atributos
     */
    setupSincronizacaoAtributos() {
        console.log('🔗 Configurando sincronização com atributos...');

        // Apenas adicionar listener para atributos atualizados
        // O AtributosManager já deveria disparar este evento
        document.addEventListener('atributosAtualizados', (event) => {
            console.log(`📡 Evento de atributo alterado detectado:`, event.detail);
            
            if (event.detail.atributo === 'forca' || event.detail.atributo === 'vitalidade') {
                console.log(`🔄 Recalculando espaço do inventário...`);
                
                // Chamar callback do manager
                if (window.inventarioManager) {
                    window.inventarioManager.aoAtributosMudarem();
                }
            }
        });

        console.log('✅ Sincronização com atributos configurada');
    }

    /**
     * Configura re-renderização ao trocar de aba
     */
    setupTrocaAbas() {
        console.log('🔗 Configurando listeners de troca de abas...');

        // Interceptar cliques nas abas horizontais
        const abas = document.querySelectorAll('[data-route-horizontal]');
        
        abas.forEach(aba => {
            aba.addEventListener('click', () => {
                const rota = aba.getAttribute('data-route-horizontal');
                
                if (rota === 'inventario') {
                    console.log('📂 Aba de inventário ativada, renderizando...');
                    setTimeout(() => {
                        window.inventarioUI.render();
                    }, 100);
                }
            });
        });

        console.log('✅ Listeners de troca de abas configurados');
    }
}

// Criar e inicializar
const inventarioInit = new InventarioInit();

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📋 DOM pronto, inicializando inventário...');
        inventarioInit.inicializar();
    });
} else {
    console.log('📋 DOM já pronto, inicializando inventário...');
    inventarioInit.inicializar();
}

// Tentar inicializar a cada 500ms durante 10 segundos (20 tentativas)
let tentativas = 0;
const intervalo = setInterval(() => {
    tentativas++;
    
    if (inventarioInit.inicializado || tentativas > 20) {
        clearInterval(intervalo);
        if (inventarioInit.inicializado) {
            console.log('✅ Inventário inicializado com sucesso!');
        } else {
            console.warn('⚠️  Timeout na inicialização do inventário');
        }
    } else {
        inventarioInit.inicializar();
    }
}, 500);

console.log('✅ inventario-init.js carregado');
