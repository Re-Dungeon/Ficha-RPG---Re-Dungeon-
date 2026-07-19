/* ============================================ */
/* APTIDÕES-MODAL.JS - Sistema de Modais       */
/* Integração com aplicação                    */
/* ============================================ */

/**
 * AptidoesModal - Gerenciamento de modais
 * Também cuida de sincronização com outras abas
 */

class AptidoesModal {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Inicializa o sistema de modais
     */
    async init() {
        console.log('🎭 Inicializando AptidoesModal...');

        // ⚠️ AGUARDAR aptidoesManager estar definido
        let tentativas = 0;
        while (!window.aptidoesManager && tentativas < 100) {
            console.log('⏳ Aguardando window.aptidoesManager...');
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!window.aptidoesManager) {
            console.error('❌ AptidoesManager não disponível após timeout');
            return;
        }

        // Aguardar DB estar pronto
        if (!window.aptidoesManager.db) {
            console.log('⏳ Aguardando AptidoesManager.db inicializar...');
            try {
                await window.aptidoesManager.init();
            } catch (error) {
                console.error('❌ Erro ao inicializar AptidoesManager:', error);
                return;
            }
        }

        this.setupCloseHandlers();
        this.setupIntegration();

        console.log('✅ AptidoesModal inicializado com sucesso');
        this.isInitialized = true;
    }

    /**
     * Setup handlers para fechar modais (REMOVIDO: aptidoes-gerenciar-modal foi deletado do DOM)
     */
    setupCloseHandlers() {
        const modais = [
            'aptidoes-criar-modal',
            'aptidoes-ganhar-modal',
            'aptidoes-remover-modal'
        ];

        modais.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            const backdrop = modal.querySelector('.modal-overlay__backdrop');
            const closeBtn = modal.querySelector('.modal-close-btn');

            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            }
        });
    }

    /**
     * Setup integração com outras abas
     */
    setupIntegration() {
        // Listener para mudanças em atributos
        if (window.atributosManager) {
            window.atributosManager.addEventListener = window.atributosManager.addEventListener || (() => {});
            console.log('✅ Integração com Atributos configurada');
        }

        // Listener para mudanças em status
        if (window.StatusBarsManager) {
            console.log('✅ Integração com Status configurada');
        }

        // Listener de eventos do AptidoesManager
        aptidoesManager.addEventListener((event, data) => {
            this.handleAptidoesEvent(event, data);
        });
    }

    /**
     * Processa eventos do AptidoesManager
     */
    handleAptidoesEvent(event, data) {
        console.log(`📢 Evento de Aptidões: ${event}`, data);

        switch (event) {
            case 'init':
                this.onInitialized(data);
                break;
            case 'aptidoescriadas':
                this.onAptidoesCriadas(data);
                break;
            case 'aptidaoUpgrade':
                this.onAptidaoUpgrade(data);
                break;
            case 'aptidaoReset':
                this.onAptidaoReset(data);
                break;
            case 'aptidaoRemovida':
                this.onAptidaoRemovida(data);
                break;
            case 'ganhaup':
                this.onGanhaUp(data);
                break;
            case 'ganhadown':
                this.onGanhaDown(data);
                break;
        }
    }

    /**
     * Callback: Inicialização concluída
     */
    onInitialized(data) {
        console.log('🎯 Inicialização de aptidões concluída');
    }

    /**
     * Callback: Aptidões criadas
     */
    onAptidoesCriadas(data) {
        console.log(`✨ ${data.count} aptidões criadas`);
        aptidoesManager.render();
    }

    /**
     * Callback: Aptidão foi upgradeada
     */
    onAptidaoUpgrade(data) {
        console.log(`⬆️ Aptidão ${data.aptidao} -> Nv ${data.novoNivel}`);
        
        // Sincronizar com atributos se houver bônus
        this.syncBonus();
    }

    /**
     * Callback: Aptidão foi resetada
     */
    onAptidaoReset(data) {
        console.log(`🔄 Aptidão ${data.aptidao} resetada`);
        this.syncBonus();
    }

    /**
     * Callback: Aptidão foi removida
     */
    onAptidaoRemovida(data) {
        console.log(`❌ Aptidão ${data.aptidao} removida`);
        this.syncBonus();
    }

    /**
     * Callback: Ganhas aumentou
     */
    onGanhaUp(data) {
        console.log(`⭐ Ganhas: ${data.ganhas}`);
        this.recalculateMaximo();
    }

    /**
     * Callback: Ganhas diminuiu
     */
    onGanhaDown(data) {
        console.log(`⭐ Ganhas: ${data.ganhas}`);
        this.recalculateMaximo();
    }

    /**
     * Sincroniza bônus de aptidões com atributos
     * ✅ REATIVADO - Delega para BonusCalculator
     * 
     * Fluxo:
     * 1. BonusCalculator recalcula todos os bônus
     * 2. Atualiza AtributosManager.atributosBonusAptidoes
     * 3. Renderiza atributos na tela
     * 4. Atualiza popups se abertos
     */
    syncBonus() {
        console.log('🔄 [AptidoesModal] Sincronizando bônus via BonusCalculator...');
        
        // Verificar disponibilidade
        if (!window.bonusCalculator || typeof window.bonusCalculator.cicloCompletoAtualizacao !== 'function') {
            console.error('❌ BonusCalculator não disponível para sincronização');
            return;
        }

        // ✅ Executar ciclo completo de recálculo e atualização
        window.bonusCalculator.cicloCompletoAtualizacao();
        
        console.log('✅ Bônus sincronizados e atributos renderizados');
    }

    /**
     * ⚠️ DESABILITADO
     * Aplica bônus a um atributo
     * 
     * ❌ REMOVIDO DA CHAMADA - BonusCalculator é a ÚNICA entidade que calcula bônus
     * Esta função foi neutralizada para evitar dupla aplicação de bônus.
     * AptidoesModal deve apenas disparar eventos, nunca modificar bônus diretamente.
     */
    applyBonusToAttribute(efeito) {
        console.warn('⚠️ [AptidoesModal.applyBonusToAttribute] DESABILITADO - Use BonusCalculator.recalcularBonusAptidoesAPartirDasAptidoes() em seu lugar');
        // ❌ DESABILITADO: Sem operações
        return;
    }

    /**
     * Recalcula máximo de aptidões
     */
    recalculateMaximo() {
        const novoMaximo = aptidoesManager.getMaximo();
        console.log(`📊 Máximo recalculado: ${novoMaximo}`);
        
        // Verificar se há aptidões acima do novo máximo
        const atual = aptidoesManager.getAtualTotal();
        if (atual > novoMaximo) {
            console.warn(`⚠️ Total de aptidões (${atual}) excede o máximo (${novoMaximo})`);
        }

        aptidoesManager.renderControlPanel();
    }

    /**
     * Fecha um modal
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Inicialização global
const aptidoesModal = new AptidoesModal();

// Inicializar quando o DOM estiver pronto - SEM TIMEOUT AGRESSIVO
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎭 Iniciando inicialização de Aptidões (Modal)...');
    
    try {
        // Aguardar appState
        for (let i = 0; i < 100; i++) {
            if (window.appState) break;
            await new Promise(r => setTimeout(r, 100));
        }
        
        if (!window.appState) {
            return; // appState still loading
            return;
        }
        console.log('✅ appState disponível');
        
        // Aguardar aptidoesManager (foi criado no DOMContentLoaded do aptidoes-manager.js)
        for (let i = 0; i < 100; i++) {
            if (window.aptidoesManager && window.aptidoesManagerReady) break;
            await new Promise(r => setTimeout(r, 100));
        }
        
        if (!window.aptidoesManager) {
            return; // aptidoesManager still loading
            return;
        }
        console.log('✅ aptidoesManager disponível');
        
        // Inicializar modal
        await aptidoesModal.init();
        
        // Renderizar
        if (typeof window.aptidoesManager.render === 'function') {
            window.aptidoesManager.render();
        }
        
        console.log('✅ Sistema de Aptidões iniciado com sucesso!');
    } catch (error) {
        console.error('❌ Erro na inicialização de Aptidões:', error.message);
    }
});
