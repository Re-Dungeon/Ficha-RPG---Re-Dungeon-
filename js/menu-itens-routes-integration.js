/**
 * INTEGRAÇÃO - SISTEMA DE ITENS COM ROTAS VERTICAIS
 * 
 * Conecta o botão route-itens da barra vertical com o sistema de itens
 */

class MenuItensRouteIntegration {
    constructor() {
        console.log('🔗 [MenuItensRouteIntegration] Inicializando integração...');

        this.setupIntegration();
        console.log('✅ [MenuItensRouteIntegration] Integração pronta');
    }

    /**
     * Setup da integração com rotas
     */
    setupIntegration() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.conectarRota());
        } else {
            this.conectarRota();
        }
    }

    /**
     * Conectar o botão route-itens ao sistema
     */
    conectarRota() {
        const botaoItens = document.getElementById('route-itens');

        if (!botaoItens) {
            console.warn('❌ [MenuItensRouteIntegration] Botão route-itens não encontrado');
            return;
        }

        // Adicionar event listener
        botaoItens.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🛒 [MenuItensRouteIntegration] Botão route-itens clicado');

            // Verificar se UI está disponível
            if (!window.menuItensUI) {
                console.error('❌ Interface de itens não carregada ainda');
                return;
            }

            // Abrir modal principal do sistema de itens
            window.menuItensUI.abrirModalPrincipal();

            // Marcar como ativo
            this.marcarComoAtivo(botaoItens);
        });

        console.log('✅ [MenuItensRouteIntegration] Botão route-itens conectado');
    }

    /**
     * Marcar botão como ativo
     */
    marcarComoAtivo(botao) {
        // Remover ativo de todos os botões da barra vertical
        document.querySelectorAll('.vertical-bar__button').forEach(btn => {
            btn.classList.remove('active-vertical');
        });

        // Adicionar ativo ao botão de itens
        botao.classList.add('active-vertical');
    }

    /**
     * Desmarcar botão
     */
    desmarcarAtivo() {
        const botaoItens = document.getElementById('route-itens');
        if (botaoItens) {
            botaoItens.classList.remove('active-vertical');
        }
    }
}

// Criar instância global após os sistemas estarem prontos
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // Aguardar MenuItensUI estar pronto
        const tentarIntegrar = setInterval(() => {
            if (window.menuItensUI) {
                clearInterval(tentarIntegrar);
                window.menuItensRouteIntegration = new MenuItensRouteIntegration();
            }
        }, 100);

        // Timeout de segurança
        setTimeout(() => clearInterval(tentarIntegrar), 5000);
    });
}
