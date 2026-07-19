/* ============================================ */
/* ROUTES-HORIZONTAL.JS - Gerenciamento das    */
/* Rotas Horizontais (Abas Superiores)         */
/* ============================================ */

/**
 * RoutesHorizontal
 * Responsável por:
 * - Gerenciar cliques nas abas horizontais
 * - Alternar visibilidade de seções
 * - Atualizar estado visual (.active-horizontal)
 * - Sincronizar com o StateManager
 */

class RoutesHorizontal {
    constructor() {
        this.tabSelector = '.horizontal-bar__tab';
        this.contentSelector = '.content-section';
        this.activeClass = 'active-horizontal';
        
        // Inicializar
        this.init();
    }

    /**
     * Inicializa os listeners
     */
    init() {
        // Selecionar todos os tabs
        const tabs = document.querySelectorAll(this.tabSelector);

        if (tabs.length === 0) {
            console.warn('RoutesHorizontal: Nenhum tab encontrado');
            return;
        }

        console.log(`✅ RoutesHorizontal: ${tabs.length} abas encontradas`);

        // Adicionar event listeners a cada tab
        tabs.forEach((tab, index) => {
            const routeId = tab.getAttribute('data-route-horizontal');
            console.log(`   [${index}] Tab: ${routeId} (${tab.textContent.trim()})`);
            
            tab.addEventListener('click', (e) => this.handleTabClick(e, tab));
            tab.addEventListener('keydown', (e) => this.handleTabKeydown(e, tab));
        });

        // Sincronizar com mudanças de estado (com verificação de disponibilidade)
        this.waitForStateManager(() => {
            if (window.stateManager && typeof window.stateManager.subscribe === 'function') {
                try {
                    window.stateManager.subscribe((state) => {
                        console.log(`📢 [RoutesHorizontal] Mudança de estado: ${state.activeHorizontalRoute}`);
                        this.updateActiveTab(state.activeHorizontalRoute);
                        this.updateVisibleContent(state.activeHorizontalRoute);
                    });
                    console.log('✅ Subscription ao StateManager ativada');
                } catch (e) {
                    console.warn('⚠️ Erro ao subscribir ao StateManager:', e.message);
                }
            } else {
                console.warn('⚠️ RoutesHorizontal: stateManager.subscribe não disponível (fallback ativado)');
            }
        });

        // Definir primeiro tab como ativo por padrão (com retry)
        this.waitForStateManager(() => {
            try {
                this.setActiveRoute('atributos');
            } catch (e) {
                console.warn('⚠️ Erro ao setActiveRoute:', e.message);
            }
        });

        console.log('✅ RoutesHorizontal inicializado com sucesso!');
    }

    /**
     * Aguarda StateManager ficar disponível
     * @param {Function} callback - Função a executar quando StateManager estiver pronto
     * @param {Number} maxRetries - Número máximo de tentativas (padrão: 30)
     * @param {Number} retryDelay - Delay entre tentativas em ms (padrão: 200ms)
     */
    waitForStateManager(callback, maxRetries = 30, retryDelay = 200) {
        let retries = 0;
        
        const check = () => {
            if (window.stateManager) {
                console.log('✅ StateManager está disponível agora');
                callback();
                return;
            }
            
            retries++;
            if (retries < maxRetries) {
                // Log apenas a cada 5 tentativas para não poluir o console
                if (retries % 5 === 0) {
                    console.log(`⏳ [RoutesHorizontal] Aguardando StateManager (tentativa ${retries}/${maxRetries})...`);
                }
                setTimeout(check, retryDelay);
            } else {
                console.error(`❌ StateManager não ficou disponível após ${maxRetries} tentativas (${maxRetries * retryDelay}ms)`);
                console.error('⚠️ Tentando fazer fallback para inicialização manual');
                // Fallback: tentar ativar manualmente a rota mesmo sem StateManager
                try {
                    callback();
                } catch (e) {
                    console.error('❌ Fallback também falhou:', e.message);
                }
            }
        };
        
        check();
    }

    /**
     * Manipula clique em um tab
     * @param {Event} event - Evento de clique
     * @param {HTMLElement} tab - Elemento do tab
     */
    handleTabClick(event, tab) {
        event.preventDefault();
        event.stopPropagation();
        
        const routeId = tab.getAttribute('data-route-horizontal');
        
        console.log(`🖱️  [RoutesHorizontal] Click detectado em: ${routeId}`);
        
        if (routeId) {
            this.setActiveRoute(routeId);
        } else {
            console.warn('RoutesHorizontal: data-route-horizontal não definido no tab');
        }
    }

    /**
     * Manipula navegação por teclado (Arrow Keys)
     * @param {KeyboardEvent} event - Evento de teclado
     * @param {HTMLElement} tab - Elemento do tab
     */
    handleTabKeydown(event, tab) {
        const tabs = Array.from(document.querySelectorAll(this.tabSelector));
        const currentIndex = tabs.indexOf(tab);

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            const nextTab = tabs[currentIndex + 1];
            if (nextTab) {
                nextTab.focus();
                nextTab.click();
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            const prevTab = tabs[currentIndex - 1];
            if (prevTab) {
                prevTab.focus();
                prevTab.click();
            }
        } else if (event.key === 'Home') {
            event.preventDefault();
            const firstTab = tabs[0];
            if (firstTab) {
                firstTab.focus();
                firstTab.click();
            }
        } else if (event.key === 'End') {
            event.preventDefault();
            const lastTab = tabs[tabs.length - 1];
            if (lastTab) {
                lastTab.focus();
                lastTab.click();
            }
        }
    }

    /**
     * Define uma rota como ativa
     * @param {string} routeId - ID da rota (ex: 'atributos')
     */
    setActiveRoute(routeId) {
        console.log(`🔄 [RoutesHorizontal] Setando rota ativa: ${routeId}`);
        
        // Validar routeId
        if (!routeId) {
            console.error('❌ routeId não fornecido');
            return;
        }

        // Se StateManager não estiver disponível, fazer update visual direto
        if (!window.stateManager) {
            console.warn('⚠️ StateManager não disponível, fazendo update visual direto');
            this.updateActiveTab(routeId);
            this.updateVisibleContent(routeId);
            return;
        }
        
        if (typeof window.stateManager.setActiveHorizontalRoute !== 'function') {
            console.error('❌ Método setActiveHorizontalRoute não é uma função!');
            this.updateActiveTab(routeId);
            this.updateVisibleContent(routeId);
            return;
        }
        
        try {
            window.stateManager.setActiveHorizontalRoute(routeId);
            console.log(`✅ Rota ${routeId} foi ativada com sucesso`);
        } catch (error) {
            console.error(`❌ Erro ao ativar rota ${routeId}:`, error);
            // Fallback: fazer update visual mesmo se StateManager falhar
            this.updateActiveTab(routeId);
            this.updateVisibleContent(routeId);
        }
    }

    /**
     * Atualiza o tab visual ativo
     * @param {string} routeId - ID da rota
     */
    updateActiveTab(routeId) {
        const tabs = document.querySelectorAll(this.tabSelector);
        
        console.log(`🎨 [RoutesHorizontal] Atualizando estilo da aba ativa: ${routeId}`);

        tabs.forEach(tab => {
            const tabRoute = tab.getAttribute('data-route-horizontal');
            
            if (tabRoute === routeId) {
                tab.classList.add(this.activeClass);
                tab.setAttribute('aria-selected', 'true');
                console.log(`   ✅ Aba ${tabRoute} marcada como ativa`);
            } else {
                tab.classList.remove(this.activeClass);
                tab.setAttribute('aria-selected', 'false');
            }
        });
    }

    /**
     * Mostra/esconde seções de conteúdo
     * @param {string} routeId - ID da rota
     */
    updateVisibleContent(routeId) {
        const sections = document.querySelectorAll(this.contentSelector);
        
        console.log(`👁️  [RoutesHorizontal] Atualizando conteúdo visível para: ${routeId}`);

        let found = false;

        sections.forEach(section => {
            const sectionId = section.getAttribute('id');
            
            // Mapear ID de rota para ID de seção
            const expectedSectionId = `rpg-content-${routeId}`;

            if (sectionId === expectedSectionId) {
                section.classList.add('content-section--active');
                found = true;
                console.log(`   ✅ Seção ${sectionId} ficou visível`);
                
                // ✨ Recalcular e atualizar quando aba de aptidões fica visível
                if (routeId === 'aptidoes' && window.aptidoesManager) {
                    console.log('📊 [RoutesHorizontal] Aba de aptidões ficou visível - sincronizando renderização...');
                    if (typeof window.aptidoesManager.render === 'function') {
                        try {
                            window.aptidoesManager.render();
                            console.log('✅ Renderização de aptidões sincronizada com sucesso');
                        } catch (error) {
                            console.error('❌ Erro ao renderizar aptidões:', error);
                        }
                    } else {
                        console.warn('⚠️ aptidoesManager.render() não é uma função');
                    }
                }

                // ✨ Recalcular e atualizar quando aba de ARTs fica visível
                if (routeId === 'arts' && window.artsManager) {
                    console.log('📊 [RoutesHorizontal] Aba de ARTs ficou visível - atualizando...');
                    if (typeof window.artsManager.render === 'function') {
                        window.artsManager.render();
                    }
                }
            } else {
                section.classList.remove('content-section--active');
            }
        });

        if (!found) {
            console.warn(`⚠️  [RoutesHorizontal] Seção rpg-content-${routeId} não encontrada!`);
        }
    }

    /**
     * Loga informações de debug
     */
    debug() {
        if (!window.stateManager) {
            console.warn('stateManager não disponível');
            return;
        }
        const activeRoute = window.stateManager.getActiveHorizontalRoute();
        console.log(`📊 Rota Horizontal Ativa: ${activeRoute}`);
    }
}

/**
 * Inicializar quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar um pouco para garantir que StateManager está pronto
        setTimeout(() => {
            window.routesHorizontal = new RoutesHorizontal();
        }, 1000);
    });
} else {
    // DOM já está pronto
    setTimeout(() => {
        window.routesHorizontal = new RoutesHorizontal();
    }, 1000);
}
