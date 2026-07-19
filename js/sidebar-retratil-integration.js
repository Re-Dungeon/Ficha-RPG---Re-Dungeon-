/* ============================================ */
/* SIDEBAR-RETRATIL-INTEGRATION.JS             */
/* Integração e reorganização da Sidebar       */
/* ============================================ */

/**
 * Reorganiza os botões da sidebar em seções lógicas
 */
class SidebarIntegration {
    constructor() {
        this.sidebar = document.getElementById('rpg-vertical-bar-left');
        this.sidebarRight = document.getElementById('rpg-vertical-bar-right');
        this.container = this.sidebar?.querySelector('.vertical-bar__container');
        
        if (this.sidebar && this.container) {
            this.init();
        }
    }

    init() {
        // Aguardar um pouco para garantir que todos os elementos estão prontos
        setTimeout(() => {
            this.reorganizeSidebar();
            this.setupToggleButton();
            this.restoreState();
            this.hideRightSidebar();
            console.log('✅ SidebarIntegration inicializado');
        }, 100);
    }

    /**
     * Reorganiza a sidebar em seções temáticas
     */
    reorganizeSidebar() {
        // Coletar botões de AMBAS as barras (esquerda e direita)
        let buttons = Array.from(this.container.querySelectorAll('.vertical-bar__button'));
        
        if (this.sidebarRight) {
            const rightButtons = Array.from(
                this.sidebarRight.querySelectorAll('.vertical-bar__button')
            );
            buttons = buttons.concat(rightButtons);
        }
        
        // Remover botão de toggle temporário se existir
        const existingToggle = this.container.querySelector('.sidebar-toggle-btn');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Mapa de rotas para seções
        const sections = {
            personagem: {
                title: '👤 Personagem',
                items: ['info', 'aptidao', 'racas', 'classes']
            },
            sistema: {
                title: '⚙️ Sistema',
                items: ['sorte', 'itens', 'condicoes']
            },
            progressao: {
                title: '📈 Progressão',
                items: ['cultivacao', 'corpo-imortal']
            },
            dados: {
                title: '💾 Dados',
                items: ['salvar', 'importar', 'footer-info']
            }
        };

        // Limpar container
        this.container.innerHTML = '';

        // Criar botão de toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'btn-menu-principal';
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Expandir/Recolher Menu');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('title', 'Clique para expandir/recolher');
        toggleBtn.innerHTML = `
            <span class="sidebar-toggle-icon" aria-hidden="true">☰</span>
            <span class="sidebar-toggle-label">Menu Principal</span>
        `;
        
        toggleBtn.addEventListener('click', () => {
            if (window.menuPrincipal) {
                window.menuPrincipal.toggle();
            }
        });

        this.container.appendChild(toggleBtn);

        // Container para seções
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'sidebar-sections';

        // Processar cada seção
        Object.entries(sections).forEach(([sectionKey, sectionData]) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'sidebar-section';

            // Título
            const titleDiv = document.createElement('div');
            titleDiv.className = 'sidebar-section-title';
            titleDiv.textContent = sectionData.title;
            titleDiv.setAttribute('aria-hidden', 'true');
            sectionDiv.appendChild(titleDiv);

            // Botões
            sectionData.items.forEach(itemRoute => {
                const button = buttons.find(btn => {
                    const route = btn.getAttribute('data-route-vertical');
                    return route === itemRoute;
                });

                if (button) {
                    // Usar o botão original para preservar event listeners já anexados
                    const buttonElement = button;
                    sectionDiv.appendChild(buttonElement);
                } else {
                    console.warn(`⚠️ Botão não encontrado para rota: ${itemRoute}`);
                }
            });

            sectionsContainer.appendChild(sectionDiv);
        });

        this.container.appendChild(sectionsContainer);

        // Sincronizar estado ativo
        this.updateActiveState();
    }

    /**
     * Configura o botão de toggle
     */
    setupToggleButton() {
        const toggleBtn = this.container.querySelector('.sidebar-toggle-btn');
        if (!toggleBtn || !window.menuPrincipal) return;

        // Atualizar estado inicial
        const collapsed = localStorage.getItem('menu-principal-collapsed') === 'true';
        if (collapsed) {
            this.sidebar.classList.add('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            this.sidebar.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Restaura o estado da sidebar do localStorage
     */
    restoreState() {
        const collapsed = localStorage.getItem('menu-principal-collapsed') === 'true';
        if (collapsed) {
            this.sidebar.classList.add('collapsed');
        } else {
            this.sidebar.classList.remove('collapsed');
        }
    }

    /**
     * Atualiza qual botão está marcado como ativo
     */
    updateActiveState() {
        const mainContent = document.getElementById('rpg-main-content-box');
        if (!mainContent) return;

        const observer = new MutationObserver(() => {
            this.markActiveButton();
        });

        observer.observe(mainContent, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });

        // Verificar estado inicial
        this.markActiveButton();
    }

    /**
     * Marca qual botão está ativo
     */
    markActiveButton() {
        const sections = document.querySelectorAll('.content-section');
        let activeRoute = null;

        sections.forEach(section => {
            if (section.classList.contains('content-section--active')) {
                const id = section.id;
                const route = id.replace('rpg-content-', '');
                activeRoute = route;
            }
        });

        if (activeRoute) {
            const buttons = this.container.querySelectorAll('[data-route-vertical]');
            buttons.forEach(btn => {
                const route = btn.getAttribute('data-route-vertical');
                btn.setAttribute('data-active', route === activeRoute ? 'true' : 'false');
            });
        }
    }

    /**
     * Esconde a sidebar direita já que todos os botões estão na esquerda agora
     */
    hideRightSidebar() {
        if (this.sidebarRight) {
            this.sidebarRight.style.display = 'none';
            this.sidebarRight.setAttribute('aria-hidden', 'true');
            console.log('✅ Sidebar direita escondida (botões consolidados na esquerda)');
        }
    }
}

/**
 * Inicializar integração quando pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarIntegration = new SidebarIntegration();
    });
} else {
    window.sidebarIntegration = new SidebarIntegration();
}
