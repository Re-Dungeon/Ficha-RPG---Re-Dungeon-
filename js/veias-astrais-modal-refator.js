/**
 * HANDLER DA MODAL VEIAS ASTRAIS
 * Gerencia abertura, fechamento e controle do modal
 */

class VeiasAstraisModal {
    constructor() {
        this.modal = document.getElementById('veias-astrais-modal');
        this.backdrop = document.querySelector('.veias-astrais-backdrop');
        this.btnOpen = document.getElementById('veias-astrais-btn');
        this.btnClose = document.getElementById('btn-veias-astrais-fechar');
        this.detailCloseBtn = document.getElementById('close-detail-btn');
        
        this.system = null;
        
        this.init();
    }

    init() {
        if (this.btnOpen) {
            this.btnOpen.addEventListener('click', () => this.open());
        }

        if (this.btnClose) {
            this.btnClose.addEventListener('click', () => this.close());
        }

        if (this.detailCloseBtn) {
            this.detailCloseBtn.addEventListener('click', () => this.closeDetailPanel());
        }

        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });

        console.log('✨ VeiasAstraisModal inicializado');
    }


    open() {
        // Abrir o modal principal de Veias Astrais diretamente, sem exibir dica.
        this.abrirModalDiretamente();
    }


    /**
     * Abrir modal de Veias Astrais diretamente
     */
    abrirModalDiretamente() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            
            // Inicializar sistema na primeira abertura (defensivo)
            if (!this.system) {
                if (typeof VeiasAstraisSystem === 'function') {
                    this.system = new VeiasAstraisSystem();
                    setTimeout(() => this.system.open(), 100);
                } else if (window.initVeiasAstrais) {
                    this.system = window.initVeiasAstrais();
                    setTimeout(() => this.system.open(), 100);
                } else {
                    setTimeout(() => {
                        if (window.initVeiasAstrais) {
                            this.system = window.initVeiasAstrais();
                            this.system.open();
                        } else {
                            console.warn('⚠️ VeiasAstraisSystem não disponível no momento');
                        }
                    }, 200);
                }
            } else {
                this.system.updateUI();
            }

            // Forçar foco
            this.modal.focus();
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            if (this.system) {
                this.system.close();
            }
        }
    }

    closeDetailPanel() {
        const panel = document.getElementById('node-detail-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }
}

// Inicializar ao carregar documento
document.addEventListener('DOMContentLoaded', () => {
    new VeiasAstraisModal();
});

// Exportar para uso global
window.VeiasAstraisModal = VeiasAstraisModal;
