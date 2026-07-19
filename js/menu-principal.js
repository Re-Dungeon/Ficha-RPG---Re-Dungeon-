/* ============================================ */
/* MENU-PRINCIPAL.JS - Controller do Menu      */
/* Controla Sidebar Retrátil (Menu Principal)  */
/* Compatível com sistema existente            */
/* ============================================ */

class MenuPrincipal {
    constructor() {
        // Dados do menu organizados por seção
        this.menuData = [
            // Seção: PERSONAGEM
            { id: 'info', label: 'Info', icon: 'https://i.imgur.com/HW92olm.png', route: 'info', section: 'personagem' },
            { id: 'aptidao', label: 'Aptidão', icon: 'https://i.imgur.com/DiJ5DOO.png', route: 'aptidao', section: 'personagem' },
            { id: 'racas', label: 'Raças', icon: 'https://i.imgur.com/jZENyy3.png', route: 'racas', section: 'personagem' },
            { id: 'classes', label: 'Classes', icon: 'https://i.imgur.com/YH0sMiU.png', route: 'classes', section: 'personagem' },
            
            // Seção: SISTEMA
            { id: 'sorte', label: 'Sorte', icon: 'https://i.imgur.com/Zix5j38.png', route: 'sorte', section: 'sistema' },
            { id: 'sobre', label: 'Sobre', icon: 'https://i.imgur.com/Bxze1jj.png', route: 'footer-info', section: 'sistema' },
            { id: 'itens', label: 'Loja', icon: 'https://i.imgur.com/znIA8hP.png', route: 'itens', section: 'sistema' },
            { id: 'condicoes', label: 'Condições', icon: 'https://i.imgur.com/KKlDkAJ.png', route: 'condicoes', section: 'sistema' },
            
            // Seção: PROGRESSÃO
            { id: 'cultivacao', label: 'Cultivação', icon: 'https://i.imgur.com/E6LUTRF.png', route: 'cultivacao', section: 'progressao' },
            { id: 'corpo-imortal', label: 'Corpo Imortal', icon: 'https://i.imgur.com/fvcUAAE.png', route: 'corpo-imortal', section: 'progressao' },
            
            // Seção: DADOS
            { id: 'salvar', label: 'Salvar', icon: 'https://i.imgur.com/dblnoAI.png', route: 'salvar', section: 'dados' },
            { id: 'importar', label: 'Importar', icon: 'https://i.imgur.com/Lr4KpQY.png', route: 'importar', section: 'dados' }
        ];

        this.isOpen = false;
        this.sidebarCollapsed = false;
        this.quickShortcutItems = this.menuData.map(item => ({ ...item }));
        this.init();
    }

    /**
     * Inicializa o menu e a sidebar
     */
    init() {
        this.attachEventListeners();
        this.restoreCollapsedState();
        console.log('✅ MenuPrincipal inicializado como Sidebar Retrátil');
    }

    /**
     * Restaura o estado de colapso do localStorage
     */
    restoreCollapsedState() {
        const saved = localStorage.getItem('menu-principal-collapsed');
        if (saved === 'true') {
            // Recolher
            this.sidebarCollapsed = false; // Reset para permitir collapse
            this.collapse();
        } else {
            // Expandir (padrão)
            this.sidebarCollapsed = true; // Reset para permitir expand
            this.expand();
        }
    }

    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Botão para abrir/fechar menu na barra horizontal
        const btnMenuPrincipal = document.getElementById('btn-menu-principal');
        if (btnMenuPrincipal) {
            btnMenuPrincipal.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Fechar com ESC em mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.sidebarCollapsed && window.innerWidth < 768) {
                this.collapse();
            }
        });

        console.log('✅ Sidebar event listeners anexados');
    }

    /**
     * Expande a sidebar
     */
    expand() {
        const sidebar = document.getElementById('rpg-vertical-bar-left');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');

        if (!sidebar) {
            console.warn('⚠️ Sidebar não encontrada');
            return;
        }

        // Se já está expandido, pular
        if (!this.sidebarCollapsed) return;

        sidebar.classList.remove('collapsed');
        this.sidebarCollapsed = false;

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        localStorage.setItem('menu-principal-collapsed', 'false');
        console.log('✅ Sidebar expandida');
    }

    /**
     * Recolhe a sidebar
     */
    collapse() {
        const sidebar = document.getElementById('rpg-vertical-bar-left');
        const toggleBtn = document.querySelector('.sidebar-toggle-btn');

        if (!sidebar) {
            console.warn('⚠️ Sidebar não encontrada');
            return;
        }

        // Se já está recolhido, pular
        if (this.sidebarCollapsed) return;

        sidebar.classList.add('collapsed');
        this.sidebarCollapsed = true;

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        localStorage.setItem('menu-principal-collapsed', 'true');
        console.log('✅ Sidebar recolhida');
    }

    /**
     * Alterna entre expandir e recolher
     */
    toggle() {
        if (this.sidebarCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    /**
     * Verifica se a sidebar está visível
     */
    isVisible() {
        return !this.sidebarCollapsed;
    }

    /**
     * Trata clique em botão do menu
     * @param {Object} item - Objeto do item
     */
    handleButtonClick(item) {
        console.log(`🔘 Botão do menu clicado: ${item.label}`);

        // Handler especial para raças - com retry
        if (item.route === 'racas') {
            if (window.racasUI && typeof window.racasUI.abrirModal === 'function') {
                window.racasUI.abrirModal();
            } else {
                // Se não estiver pronto, tenta via botão de rota
                const button = document.getElementById('route-racas');
                if (button) {
                    button.click();
                } else {
                    console.warn('⚠️ Sistema de raças não inicializado');
                }
            }
            return;
        }

        // Handler especial para classes - com retry
        if (item.route === 'classes') {
            if (window.classesUI && typeof window.classesUI.abrirModal === 'function') {
                window.classesUI.abrirModal();
            } else {
                // Se não estiver pronto, tenta via botão de rota
                const button = document.getElementById('route-classes');
                if (button) {
                    button.click();
                } else {
                    console.warn('⚠️ Sistema de classes não inicializado');
                }
            }
            return;
        }

        // Handler especial para sorte
        if (item.route === 'sorte') {
            if (window.sorteModal && typeof window.sorteModal.open === 'function') {
                window.sorteModal.open();
            } else {
                const button = document.getElementById('route-sorte');
                if (button) button.click();
            }
            return;
        }

        // Handler especial para condições
        if (item.route === 'condicoes') {
            if (window.sistemaCondicoes && typeof window.sistemaCondicoes.abrirPopup === 'function') {
                window.sistemaCondicoes.abrirPopup();
            } else {
                const button = document.getElementById('route-condicoes');
                if (button) button.click();
            }
            return;
        }

        // Handler especial para corpo imortal
        if (item.route === 'corpo-imortal') {
            if (window.corpoImortalUI && typeof window.corpoImortalUI.abrir === 'function') {
                window.corpoImortalUI.abrir();
            } else {
                const button = document.getElementById('route-corpo-imortal');
                if (button) button.click();
            }
            return;
        }

        // Handler especial para cultivação
        if (item.route === 'cultivacao') {
            if (window.cultivacao && typeof window.cultivacao.ui?.abrir === 'function') {
                window.cultivacao.ui.abrir();
            } else {
                const button = document.getElementById('route-cultivacao');
                if (button) {
                    button.click();
                } else {
                    console.warn('⚠️ Sistema de Cultivação não inicializado');
                }
            }
            return;
        }

        // Handler especial para aptidão
        if (item.route === 'aptidao') {
            if (window.aptidoesVisualPopup && typeof window.aptidoesVisualPopup.open === 'function') {
                window.aptidoesVisualPopup.open();
                console.log('📖 [MenuPrincipal] Enciclopédia de Aptidões aberta por clique');
            } else {
                const button = document.getElementById('route-aptidao');
                if (button) button.click();
            }
            return;
        }

        // Fazer com que a ação seja executada via routes-vertical
        const button = document.getElementById(`route-${item.route}`);

        if (button) {
            // Ativar o evento de clique do botão original
            button.click();
            button.focus();
        } else {
            console.warn(`⚠️ Botão original não encontrado: route-${item.route}`);
        }
    }
}

/**
 * Inicializar quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.menuPrincipal = new MenuPrincipal();
    });
} else {
    // DOM já está pronto
    window.menuPrincipal = new MenuPrincipal();
}

