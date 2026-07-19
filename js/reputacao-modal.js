// Sistema de Reputacao - Classe Principal
class ReputacaoModal {
    constructor() {
        this.tempValues = { mundo: 0, regiao: 0 };
        this.originalValues = { mundo: 0, regiao: 0 };
        this.isOpen = false;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando ReputacaoModal...');
        this.createModalHTML();
        this.setupEventListeners();
        this.loadValuesFromState();
        console.log('✅ ReputacaoModal pronto!');
    }

    createModalHTML() {
        const modalHTML = `
            <div id="reputacao-modal-overlay" class="reputacao-modal-overlay">
                <div class="reputacao-modal">
                    <div class="reputacao-modal__header">
                        <h2 class="reputacao-modal__title">REPUTACAO</h2>
                        <button class="reputacao-modal__close" id="reputacao-close">X</button>
                    </div>
                    <div class="reputacao-modal__divider"></div>
                    <div class="reputacao-modal__content">
                        <div class="reputacao-status-section">
                            <div class="reputacao-status-container">
                                <div class="reputacao-status-nivel">
                                    <span class="reputacao-status-label" id="reputacao-nivel-label">NV. 0</span>
                                </div>
                                <div class="reputacao-status-descricao">
                                    <span class="reputacao-status-text" id="reputacao-nivel-descricao">Desconhecido</span>
                                </div>
                            </div>
                            <div class="reputacao-total-display-wrapper">
                                <span class="reputacao-total-label">Total: </span>
                                <span class="reputacao-total-value" id="reputacao-total-display">0</span>
                                <span class="reputacao-total-max">/50</span>
                            </div>
                        </div>
                        <div class="reputacao-modal__divider reputacao-modal__divider--secondary"></div>
                        <div class="reputacao-grid">
                            <div class="reputacao-box">
                                <h3 class="reputacao-box__title">MUNDO</h3>
                                <div class="reputacao-box__display" id="reputacao-mundo-display">0</div>
                                <input type="number" id="reputacao-mundo" class="reputacao-box__input" placeholder="0" min="0" max="50" value="0">
                            </div>
                            <div class="reputacao-box">
                                <h3 class="reputacao-box__title">REGIAO</h3>
                                <div class="reputacao-box__display" id="reputacao-regiao-display">0</div>
                                <input type="number" id="reputacao-regiao" class="reputacao-box__input" placeholder="0" min="0" max="50" value="0">
                            </div>
                        </div>
                    </div>
                    <div class="reputacao-modal__divider"></div>
                    <div class="reputacao-modal__footer">
                        <button class="reputacao-modal__btn-cancel" id="reputacao-cancel">CANCELAR</button>
                        <button class="reputacao-modal__btn-save" id="reputacao-save">SALVAR</button>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('reputacao-modal-overlay')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    setupEventListeners() {
        // Botao de abrir (no header do personagem)
        // ⚠️ DESABILITADO: O V2 agora cuida disto
        // const btnAbrir = document.querySelector('#reputacao-btn');
        // console.log('🔍 Procurando botao #reputacao-btn:', btnAbrir ? '✓ Encontrado' : '✗ Nao encontrado');
        // 
        // if (btnAbrir) {
        //     btnAbrir.addEventListener('click', (e) => {
        //         e.preventDefault();
        //         console.log('🖱️ Clique no botao reputacao detectado');
        //         this.open();
        //     });
        // }

        // Botoes do modal
        document.querySelector('#reputacao-close')?.addEventListener('click', () => this.close());
        document.querySelector('#reputacao-cancel')?.addEventListener('click', () => this.close());
        document.querySelector('#reputacao-save')?.addEventListener('click', () => this.save());

        // Inputs
        document.querySelector('#reputacao-mundo')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 0;
            this.tempValues.mundo = Math.max(0, Math.min(value, 50));
            this.updatePreview();
        });

        document.querySelector('#reputacao-regiao')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 0;
            this.tempValues.regiao = Math.max(0, Math.min(value, 50));
            this.updatePreview();
        });

        // Fechar modal ao clicar no overlay
        document.querySelector('#reputacao-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'reputacao-modal-overlay') {
                this.close();
            }
        });

        console.log('✓ Event listeners configurados');
    }

    open() {
        if (this.isOpen) return;
        console.log('📂 Abrindo modal de reputacao...');
        this.loadValuesFromState();
        const overlay = document.querySelector('#reputacao-modal-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.isOpen = true;
            console.log('✓ Modal visivel');
        }
    }

    close() {
        if (!this.isOpen) return;
        console.log('📁 Fechando modal de reputacao...');
        const overlay = document.querySelector('#reputacao-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.isOpen = false;
        }
    }

    loadValuesFromState() {
        const state = window.appState || window.stateManager;
        
        if (!state) {
            console.warn('⚠️ StateManager não encontrado');
            return;
        }

        const reputation = state.getReputation();
        this.originalValues = { mundo: reputation.mundo, regiao: reputation.regiao };
        this.tempValues = { mundo: reputation.mundo, regiao: reputation.regiao };
        this.updateInputs();
        this.updatePreview();
    }

    updateInputs() {
        const mundoInput = document.querySelector('#reputacao-mundo');
        const regiaoInput = document.querySelector('#reputacao-regiao');
        if (mundoInput) mundoInput.value = this.tempValues.mundo;
        if (regiaoInput) regiaoInput.value = this.tempValues.regiao;
    }

    updatePreview() {
        const total = this.calculateTotal();
        const level = this.getReputationLevel(total);

        document.querySelector('#reputacao-nivel-label').textContent = 'NV. ' + level.nivel;
        document.querySelector('#reputacao-nivel-descricao').textContent = level.descricao;
        document.querySelector('#reputacao-total-display').textContent = total;
        document.querySelector('#reputacao-mundo-display').textContent = this.tempValues.mundo;
        document.querySelector('#reputacao-regiao-display').textContent = this.tempValues.regiao;
    }

    calculateTotal() {
        const total = this.tempValues.mundo + this.tempValues.regiao;
        return Math.min(total, 50);
    }

    getReputationLevel(total = null) {
        const value = total !== null ? total : this.calculateTotal();
        const levels = [
            { range: [0, 9], nivel: 0, descricao: 'Desconhecido' },
            { range: [10, 19], nivel: 1, descricao: 'Reconhecido' },
            { range: [20, 29], nivel: 2, descricao: 'Promissor' },
            { range: [30, 39], nivel: 3, descricao: 'Respeitado' },
            { range: [40, 49], nivel: 4, descricao: 'Influente' },
            { range: [50, 50], nivel: 5, descricao: 'Lenda Viva' }
        ];
        const level = levels.find(l => value >= l.range[0] && value <= l.range[1]);
        return level || levels[0];
    }

    save() {
        if (this.tempValues.mundo === this.originalValues.mundo && 
            this.tempValues.regiao === this.originalValues.regiao) {
            console.log('ℹ️ Nenhuma alteracao detectada');
            this.close();
            return;
        }

        if (typeof appState !== 'undefined') {
            const state = window.appState || window.stateManager;
            if (state) {
                state.setReputation({
                    mundo: this.tempValues.mundo,
                    regiao: this.tempValues.regiao
                });
                const reputation = state.getReputation();
                console.log('✓ Reputacao salva:', reputation);

                // ✅ PERSISTIR EM LOCALSTORAGE
                if (window.localStorageManager) {
                    window.localStorageManager.saveReputacao(reputation);
                    console.log('💾 Reputacao salva em localStorage');
                }
            }
        }
        this.close();
    }

    getStatus() {
        const total = this.calculateTotal();
        const level = this.getReputationLevel(total);
        return {
            isOpen: this.isOpen,
            mundo: this.tempValues.mundo,
            regiao: this.tempValues.regiao,
            total,
            nivel: level.nivel,
            descricao: level.descricao
        };
    }

    debug() {
        console.group('Estado do Modal de Reputacao');
        console.table(this.getStatus());
        console.groupEnd();
    }
}

// Inicializacao
let reputacaoModal = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOMContentLoaded disparado');
    console.log('🔍 Verificando appState:', typeof appState !== 'undefined' ? '✓' : '✗');
    
    reputacaoModal = new ReputacaoModal();
    window.reputacaoModal = reputacaoModal;
    
    console.log('🎯 reputacaoModal disponivel globalmente');
});
