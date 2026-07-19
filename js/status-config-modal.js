/* ============================================ */
/* STATUS-CONFIG-MODAL.JS                      */
/* Sistema Centralizado de Configuração        */
/* ============================================ */

/**
 * StatusConfigModal - Gerencia o popup de configuração
 * Responsável por:
 * - Abrir/fechar modal
 * - Editar Atual e Extra
 * - Calcular Máximo automaticamente
 * - Atualizar barras em tempo real
 * - Exibir prévia de todos os status
 */

const StatusConfigModal = {
    // ============================================
    // ESTADO
    // ============================================

    state: {
        isOpen: false,
        activeStatus: null, // 'hp', 'energy' ou 'fatiga'
        lastHoveredStatus: null, // Rastreia qual seção o usuário passou o mouse
        tempValues: {
            hp: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
            energy: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
            fatigue: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
        },
        originalValues: {
            hp: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
            energy: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
            fatigue: { current: 0, base: 0, extra: 0, bonus: 0, maximum: 0 },
        },
    },

    // ============================================
    // CONFIGURAÇÕES
    // ============================================

    config: {
        // Código Interno de Máximo (pode ser expandido por status)
        internalMaxCode: {
            hp: 0,
            energy: 0,
            fatigue: 0,
        },
        // Rótulos
        labels: {
            hp: 'Saúde',
            energy: 'Energia',
            fatigue: 'Fadiga',
        },
    },
    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    /**
     * Inicializa o sistema de modal
     */
    init() {
        console.log('🎮 Inicializando StatusConfigModal...');

        // Criar elementos DOM
        this.createModalDOM();

        // Inserir CSS
        this.injectStyles();

        // Registrar event listeners
        this.registerEventListeners();

        console.log('✅ StatusConfigModal inicializado com sucesso');
        return true;
    },

    /**
     * Cria a estrutura DOM do modal e overlay
     */
    createModalDOM() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'status-config-overlay';
        overlay.id = 'status-config-overlay';

        // Modal Container
        const modal = document.createElement('div');
        modal.className = 'status-config-modal';
        modal.id = 'status-config-modal';

        // HTML do Modal
        modal.innerHTML = `
            <!-- CABEÇALHO -->
            <div class="status-config-header">
                <h2 class="status-config-title" id="status-config-title">Configurar Status</h2>
                <button class="status-config-close" id="status-config-close-btn">✕</button>
            </div>

            <!-- SEÇÃO DE PRÉVIA -->
            <div class="status-config-preview" id="status-config-preview">
                <!-- Prévia HP -->
                <div class="status-config-preview-item status-config-preview-hp" data-status="hp">
                    <div class="status-config-preview-label">Saúde</div>
                    <div class="status-config-preview-value" id="preview-hp-value">0 / 100</div>
                </div>

                <!-- Prévia Energia -->
                <div class="status-config-preview-item status-config-preview-energy" data-status="energy">
                    <div class="status-config-preview-label">Energia</div>
                    <div class="status-config-preview-value" id="preview-energy-value">0 / 100</div>
                </div>

                <!-- Prévia Fadiga -->
                <div class="status-config-preview-item status-config-preview-fatigue" data-status="fatigue">
                    <div class="status-config-preview-label">Fadiga</div>
                    <div class="status-config-preview-value" id="preview-fatigue-value">0 / 100</div>
                </div>
            </div>

            <!-- SEÇÃO DE EDIÇÃO -->
            <div class="status-config-details" id="status-config-details">
                <h3 class="status-config-detail-title" id="status-config-detail-title">Saúde</h3>

                <!-- Grid de Quadrados -->
                <div class="status-config-grid" id="status-config-grid">
                    <!-- Quadrado: Atual -->
                    <div class="status-config-quad hp" data-field="current">
                        <label class="status-config-quad-label">Atual</label>
                        <input 
                            type="number" 
                            class="status-config-input" 
                            id="status-config-current"
                            min="0"
                            placeholder="Valor atual"
                        >
                    </div>

                    <!-- Quadrado: Extra -->
                    <div class="status-config-quad hp" data-field="extra">
                        <label class="status-config-quad-label">Extra</label>
                        <input 
                            type="number" 
                            class="status-config-input" 
                            id="status-config-extra"
                            min="0"
                            placeholder="Valor extra"
                        >
                    </div>

                    <!-- Quadrado: Máximo (Não Modificável) -->
                    <div class="status-config-quad hp locked" data-field="max">
                        <label class="status-config-quad-label">Máximo</label>
                        <div class="status-config-value" id="status-config-max">
                            <span id="status-config-max-value">0</span>
                            <span class="status-config-calc-icon">⚙️</span>
                        </div>
                    </div>

                    <!-- Quadrado: Bônus (Editável) -->
                    <div class="status-config-quad hp" data-field="bonus">
                        <label class="status-config-quad-label">Bônus</label>
                        <input 
                            type="number" 
                            class="status-config-input" 
                            id="status-config-bonus"
                            min="0"
                            placeholder="Valor bônus"
                        >
                    </div>
                </div>
            </div>

            <!-- FOOTER COM BOTÕES -->
            <div class="status-config-footer">
                <button class="status-config-btn status-config-btn-cancel" id="status-config-cancel">
                    Cancelar
                </button>
                <button class="status-config-btn status-config-btn-save" id="status-config-save">
                    Salvar Alterações
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        console.log('✅ DOM do modal criado');
    },

    /**
     * Injeta o CSS do modal no documento
     */
    injectStyles() {
        if (document.querySelector('link[href*="status-config-modal.css"]')) {
            console.log('⚠️  CSS do modal já está carregado');
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/status-config-modal.css';
        document.head.appendChild(link);

        console.log('✅ CSS do modal injetado');
    },

    /**
     * Registra todos os event listeners
     */
    registerEventListeners() {
        // Botão de fechamento
        document.getElementById('status-config-close-btn')?.addEventListener('click', () => {
            this.close();
        });

        // Botão Cancelar
        document.getElementById('status-config-cancel')?.addEventListener('click', () => {
            this.close();
        });

        // Botão Salvar
        document.getElementById('status-config-save')?.addEventListener('click', () => {
            this.saveChanges();
        });

        // Fechar ao clicar fora do modal
        document.getElementById('status-config-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'status-config-overlay') {
                this.close();
            }
        });

        // Botões de prévia (mudar status ativo)
        document.querySelectorAll('.status-config-preview-item').forEach(item => {
            item.addEventListener('click', () => {
                const status = item.dataset.status;
                this.setActiveStatus(status);
            });
        });

        // Inputs para recalcular Máximo em tempo real e atualizar prévia
        document.getElementById('status-config-current')?.addEventListener('input', () => {
            // ⭐ IMPORTANTE: Atualizar tempValues com o novo valor de ATUAL
            const currentInput = document.getElementById('status-config-current');
            if (this.state.activeStatus && currentInput) {
                const currentValue = parseInt(currentInput.value) || 0;
                this.state.tempValues[this.state.activeStatus].current = currentValue;
                console.log(`💾 ATUAL atualizado em tempo real para ${this.state.activeStatus}: ${currentValue}`);
            }
            
            this.updateMaxValue();
            this.updatePreview();  // Atualizar prévia em tempo real
            // Salvar em tempo real (sem fechar modal)
            if (this.state.activeStatus && this.state.tempValues[this.state.activeStatus]) {
                if (window.localStorageManager && window.appState) {
                    try {
                        window.localStorageManager.saveStatus({
                            [this.state.activeStatus]: this.state.tempValues[this.state.activeStatus]
                        });
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar status em tempo real:', e.message);
                    }
                }
            }
            
            // 💾 ⭐ FIX: Também salvar em localStorage no formato "redungeon_status_fields_extra_bonus"
            // para garantir persistência através de reloads
            this.syncStatusFieldsToLocalStorage();
        });

        document.getElementById('status-config-extra')?.addEventListener('input', () => {
            // ⭐ IMPORTANTE: Atualizar tempValues com o novo valor de EXTRA
            const extraInput = document.getElementById('status-config-extra');
            if (this.state.activeStatus && extraInput) {
                const extraValue = parseInt(extraInput.value) || 0;
                this.state.tempValues[this.state.activeStatus].extra = extraValue;
                console.log(`💾 EXTRA atualizado em tempo real para ${this.state.activeStatus}: ${extraValue}`);
            }
            
            this.updateMaxValue();
            this.updatePreview();  // Atualizar prévia em tempo real
            // Salvar em tempo real (sem fechar modal)
            if (this.state.activeStatus && this.state.tempValues[this.state.activeStatus]) {
                if (window.localStorageManager && window.appState) {
                    try {
                        window.localStorageManager.saveStatus({
                            [this.state.activeStatus]: this.state.tempValues[this.state.activeStatus]
                        });
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar status em tempo real:', e.message);
                    }
                }
            }
            
            // 💾 ⭐ FIX: Também salvar em localStorage no formato "redungeon_status_fields_extra_bonus"
            // para garantir persistência através de reloads
            this.syncStatusFieldsToLocalStorage();
        });

        // ⭐ BLUR listener - Garante que valores sejam salvos quando sai do input
        document.getElementById('status-config-current')?.addEventListener('blur', () => {
            const currentInput = document.getElementById('status-config-current');
            if (this.state.activeStatus && currentInput) {
                const currentValue = parseInt(currentInput.value) || 0;
                // Garantir que está em tempValues
                if (this.state.tempValues[this.state.activeStatus]) {
                    this.state.tempValues[this.state.activeStatus].current = currentValue;
                    console.log(`💾 BLUR: ATUAL salvo em tempValues para ${this.state.activeStatus}: ${currentValue}`);
                }
            }
        });

        document.getElementById('status-config-extra')?.addEventListener('blur', () => {
            const extraInput = document.getElementById('status-config-extra');
            if (this.state.activeStatus && extraInput) {
                const extraValue = parseInt(extraInput.value) || 0;
                // Garantir que está em tempValues
                if (this.state.tempValues[this.state.activeStatus]) {
                    this.state.tempValues[this.state.activeStatus].extra = extraValue;
                    console.log(`💾 BLUR: EXTRA salvo em tempValues para ${this.state.activeStatus}: ${extraValue}`);
                }
            }
        });

        // ⭐ NOVO: Listeners para o campo de Bônus
        document.getElementById('status-config-bonus')?.addEventListener('input', () => {
            const bonusInput = document.getElementById('status-config-bonus');
            if (this.state.activeStatus && bonusInput) {
                const bonusValue = parseInt(bonusInput.value) || 0;
                this.state.tempValues[this.state.activeStatus].bonus = bonusValue;
                console.log(`💾 BÔNUS atualizado em tempo real para ${this.state.activeStatus}: ${bonusValue}`);
            }
            
            this.updateMaxValue();
            this.updatePreview();  // Atualizar prévia em tempo real
            // Salvar em tempo real
            if (this.state.activeStatus && this.state.tempValues[this.state.activeStatus]) {
                if (window.localStorageManager && window.appState) {
                    try {
                        window.localStorageManager.saveStatus({
                            [this.state.activeStatus]: this.state.tempValues[this.state.activeStatus]
                        });
                    } catch (e) {
                        console.warn('⚠️ Erro ao salvar bônus em tempo real:', e.message);
                    }
                }
            }
            
            // 💾 Sincronizar para localStorage
            this.syncStatusFieldsToLocalStorage();
        });

        document.getElementById('status-config-bonus')?.addEventListener('blur', () => {
            const bonusInput = document.getElementById('status-config-bonus');
            if (this.state.activeStatus && bonusInput) {
                const bonusValue = parseInt(bonusInput.value) || 0;
                if (this.state.tempValues[this.state.activeStatus]) {
                    this.state.tempValues[this.state.activeStatus].bonus = bonusValue;
                    console.log(`💾 BLUR: BÔNUS salvo em tempValues para ${this.state.activeStatus}: ${bonusValue}`);
                }
            }
        });

        // ⭐ ENTER dispara SALVAR - usando event delegation global
        const self = this;
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                const overlay = document.getElementById('status-config-overlay');
                
                // Verifica se o modal está aberto E o foco está em um input do modal
                if (overlay && overlay.classList.contains('active')) {
                    const focusedElement = document.activeElement;
                    
                    // Se o elemento com foco é o input current ou extra
                    if (focusedElement && (
                        focusedElement.id === 'status-config-current' || 
                        focusedElement.id === 'status-config-extra'
                    )) {
                        e.preventDefault();
                        console.log('⚡ ENTER em input de status → Disparando SALVAR');
                        self.saveChanges();
                    }
                }
            }
        }, false);

        // Registrar botões de configuração em cada barra
        this.registerBarConfigButtons();

        console.log('✅ Event listeners registrados');
    },
    
    /**
     * 💾 Helper: Sincronizar tempValues.extra/bonus para localStorage
     * Garante que dados persistem após reload da página
     */
    syncStatusFieldsToLocalStorage() {
        try {
            const statusFieldsData = {
                hp: {
                    extra: this.state.tempValues.hp?.extra || 0,
                    bonus: this.state.tempValues.hp?.bonus || 0,
                    base: this.state.tempValues.hp?.base || 0
                },
                energia: {
                    extra: this.state.tempValues.energy?.extra || 0,
                    bonus: this.state.tempValues.energy?.bonus || 0,
                    base: this.state.tempValues.energy?.base || 0
                },
                fadiga: {
                    extra: this.state.tempValues.fatigue?.extra || 0,
                    bonus: this.state.tempValues.fatigue?.bonus || 0,
                    base: this.state.tempValues.fatigue?.base || 0
                }
            };
            localStorage.setItem('redungeon_status_fields_extra_bonus', JSON.stringify(statusFieldsData));
            console.log('💾 Status fields sincronizados em localStorage:', statusFieldsData);
        } catch (e) {
            console.warn('⚠️ Erro ao sincronizar status fields em localStorage:', e.message);
        }
    },    /**
     * Registra listeners para os botões de configuração em cada barra
     */
    registerBarConfigButtons() {
        const configButton = document.getElementById('status-config-button-hp');
        
        if (!configButton) {
            console.warn('⚠️  Botão de configuração não encontrado');
            return;
        }

        // Registrar listener direto no botão
        configButton.addEventListener('click', (e) => {
            e.stopPropagation();

            // Detectar qual status o usuário quer editar
            // Estratégia: verificar qual seção está "mais visível" ou o user clicou
            const lastClickedStatus = this.detectLastClickedStatus();
            
            console.log(`📍 Abrindo modal para: ${lastClickedStatus}`);
            this.open(lastClickedStatus);
        });

        // Também registrar handlers em cada seção para rastrear cliques
        this.registerStatusSectionTrackers();
    },

    /**
     * Registra rastreamento de seções para detectar qual foi clicada por último
     */
    registerStatusSectionTrackers() {
        const sections = {
            hp: document.getElementById('hp-section'),
            energy: document.getElementById('energy-section'),
            fatigue: document.getElementById('fatigue-section'),
        };

        Object.entries(sections).forEach(([statusType, section]) => {
            if (section) {
                section.addEventListener('mouseenter', () => {
                    this.state.lastHoveredStatus = statusType;
                });
            }
        });
    },

    /**
     * Detecta qual status o usuário estava usando por último
     * @returns {string} - 'hp', 'energy' ou 'fatigue'
     */
    detectLastClickedStatus() {
        // Se o usuário passou o mouse sobre uma seção, usar aquela
        if (this.state.lastHoveredStatus) {
            const status = this.state.lastHoveredStatus;
            this.state.lastHoveredStatus = null;
            return status;
        }

        // Fallback: usar o status anterior ou HP
        return this.state.activeStatus || 'hp';
    },

    // ============================================
    // ABRIR / FECHAR MODAL
    // ============================================

    /**
     * Abre o modal e carrega dados de um status
     * @param {string} statusType - 'hp', 'energy' ou 'fatigue'
     */
    open(statusType) {
        console.log(`\n📂 ╔══════════════════════════════════════`);
        console.log(`   ║ === ABRINDO MODAL ===`);
        console.log(`   ║ statusType: ${statusType}`);
        
        if (!['hp', 'energy', 'fatigue'].includes(statusType)) {
            console.error(`   ║ ❌ Status inválido: ${statusType}`);
            console.log(`   ╚══════════════════════════════════════\n`);
            return;
        }

        // ⭐ NOVO: Verificar se há bônus de aptidões que precisam ser sincronizados
        console.log(`   ║ → Verificando bônus de aptidões...`);
        this.verificarEAtualizarBonusAptidoes();
        console.log(`   ║ ✓ Bônus verificados`);

        // ⭐ FORÇA BRUTA: Recalcular máximos RESETANDO VALORES ANTIGOS PRIMEIRO
        // Isso garante que NÃO há cache em memória afetando o cálculo
        if (window.statusBarsManager && typeof window.statusBarsManager.recalcularMaximos === 'function') {
            console.log(`   ║ → Resetando cache...`);
            // Resetar valores para forçar recálculo limpo
            window.statusBarsManager.state.hp.max = 0;
            window.statusBarsManager.state.energy.max = 0;
            window.statusBarsManager.state.fatigue.max = 0;
            console.log(`   ║ ✓ Cache resetado`);
            
            // Agora recalcular LIMPO
            console.log(`   ║ → Recalculando máximos...`);
            window.statusBarsManager.recalcularMaximos();
            console.log(`   ║ ✓ Máximos recalculados`);
        } else {
            console.warn(`   ║ ⚠️  StatusBarsManager.recalcularMaximos não disponível`);
        }

        // Carregar dados de TODOS os status para detectar mudanças depois
        console.log(`   ║ → Carregando dados de todos os status...`);
        const statusTypes = ['hp', 'energy', 'fatigue'];
        statusTypes.forEach(status => {
            console.log(`   ║   • Carregando ${status}...`);
            this.loadStatusData(status);
        });
        console.log(`   ║ ✓ Dados de todos os status carregados`);

        // Definir como ativo
        console.log(`   ║ → Definindo status ativo: ${statusType}...`);
        this.setActiveStatus(statusType);
        console.log(`   ║ ✓ Status ativo definido`);

        // Mostrar modal
        console.log(`   ║ → Exibindo modal...`);
        const overlay = document.getElementById('status-config-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.state.isOpen = true;
            document.body.style.overflow = 'hidden';
            console.log(`   ║ ✓ Modal exibido`);
        } else {
            console.warn(`   ║ ⚠️  Elemento overlay não encontrado`);
        }

        console.log(`   ╚══════════════════════════════════════\n`);
    },

    /**
     * ⭐ NOVO: Verifica se há bônus de aptidões ativos
     * ⚠️ NEUTRALIZADO - Sem verificação ou atualização
     */
    /**
     * ✅ REATIVADO
     * Verifica e sincroniza bônus de aptidões
     * Garante que BonusCalculator está atualizado antes de abrir o modal
     */
    verificarEAtualizarBonusAptidoes() {
        console.log('🔍 [StatusConfigModal] Sincronizando bônus de aptidões...');
        
        // Chamar ciclo completo do BonusCalculator para sincronizar
        if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
            window.bonusCalculator.cicloCompletoAtualizacao();
            console.log('✅ Bônus sincronizados via BonusCalculator');
        } else {
            console.warn('⚠️ BonusCalculator não disponível para sincronização');
        }
    },

    /**
     * Fecha o modal
     * ✅ CORRIGIDO: Restaura tempValues aos valores originais se não foi salvo
     */
    close() {
        console.log('📂 Fechando modal');

        // ✅ RESTAURAR tempValues aos valores originais (backup)
        // Isso garante que se cancelou, os dados não ficam desincronizados
        console.log('  → Restaurando tempValues aos valores originais (cancelamento)');
        this.state.tempValues = JSON.parse(JSON.stringify(this.state.originalValues));
        console.log('  ✅ tempValues restaurados');

        const overlay = document.getElementById('status-config-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.state.isOpen = false;
            document.body.style.overflow = '';
        }
    },

    // ============================================
    // CARREGAR E GERENCIAR DADOS
    // ============================================

    /**
     * Carrega dados do StatusBarsManager e recalcula máximo
     * @param {string} statusType - Tipo de status
     */
    loadStatusData(statusType) {
        console.log(`\n📂 === loadStatusData(${statusType}) iniciado ===`);
        
        // ⭐ SEMPRE carregar do StatusBarsManager (fonte de verdade dos valores salvos)
        const sbmState = window.StatusBarsManager?.getState() || {};
        const statusData = sbmState[statusType] || { current: 0, base: 0, extra: 0, bonus: 0, max: 0 };
        
        console.log(`  ✓ Valores carregados do StatusBarsManager:`, statusData);

        // Carregar valores salvos
        let current = statusData.current || 0;
        let base = statusData.base || 0;
        let extra = statusData.extra || 0;
        
        // 💾 ⭐ FIX CRÍTICO: RECUPERAR extra/bonus de localStorage (bridge após reload)
        // Quando importa JSON, salvamos extra/bonus em localStorage
        // Ao abrir modal após reload, recuperamos daqui
        console.log(`📂 Tentando recuperar extra/bonus de localStorage...`);
        try {
            const savedFieldsJson = localStorage.getItem('redungeon_status_fields_extra_bonus');
            if (savedFieldsJson) {
                const savedFields = JSON.parse(savedFieldsJson);
                const typeKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energia' : 'fadiga';
                if (savedFields[typeKey]) {
                    extra = savedFields[typeKey].extra || 0;
                    base = savedFields[typeKey].base || 0;
                    // ⭐ NOVO: Recuperar bônus também do localStorage
                    const bonusFromStorage = savedFields[typeKey].bonus || 0;
                    console.log(`✅ Recuperado de localStorage: ${typeKey} → extra=${extra}, base=${base}, bonus=${bonusFromStorage}`);
                    
                    // Se há bônus no localStorage, usar ele
                    if (bonusFromStorage > 0) {
                        console.log(`  ⭐ Usando bônus salvo em localStorage: ${bonusFromStorage}`);
                    }
                }
            }
        } catch (e) {
            console.warn(`⚠️ Erro ao recuperar status fields de localStorage:`, e.message);
        }
        
        // ⭐ IMPORTANTE: Bonus PODE VIR DE DIFERENTES FONTES:
        // 1. Primeiro, tenta recuperar do localStorage (bônus editado manualmente)
        // 2. Se não há no localStorage, tenta do BonusCalculator (bônus de aptidões)
        // 3. Se nenhum disponível, usa valor antigo do StatusBarsManager
        let bonus = 0;
        
        // Tentar obter bonus do localStorage PRIMEIRO (prioridade para bônus editado manualmente)
        try {
            const savedFieldsJson = localStorage.getItem('redungeon_status_fields_extra_bonus');
            if (savedFieldsJson) {
                const savedFields = JSON.parse(savedFieldsJson);
                const typeKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energia' : 'fadiga';
                if (savedFields[typeKey] && typeof savedFields[typeKey].bonus !== 'undefined') {
                    bonus = parseInt(savedFields[typeKey].bonus) || 0;
                    console.log(`  ✓ Bonus carregado do localStorage (${typeKey}): ${bonus}`);
                }
            }
        } catch (e) {
            console.warn(`⚠️ Erro ao recuperar bonus de localStorage:`, e.message);
        }
        
        // Se não há bônus no localStorage, tentar do BonusCalculator
        if (bonus === 0) {
            const bonusKey = statusType === 'hp' ? 'saude' : statusType === 'energy' ? 'energia' : 'fadiga';
            if (window.bonusCalculator && typeof window.bonusCalculator.getBonus === 'function') {
                bonus = window.bonusCalculator.getBonus(bonusKey) || 0;
                console.log(`  ✓ Bonus carregado do BonusCalculator (${bonusKey}): ${bonus}`);
            } else {
                // Fallback: usar valor antigo se BonusCalculator não disponível
                bonus = statusData.bonus || 0;
                console.log(`  ⚠️  BonusCalculator não disponível, usando bonus antigo: ${bonus}`);
            }
        }

        console.log(`  ✓ Valores carregados:`, { current, base, extra, bonus });

        // ✅ RECALCULAR MÁXIMO com os atributos primários atuais
        const stateManager = window.appState;
        if (!stateManager) {
            console.error('  ❌ StateManager não disponível!');
            return;
        }
        
        const state = stateManager.getState();
        if (!state) {
            console.error('  ❌ State não carregado!');
            return;
        }
        
        const primarios = state.atributos?.primarios || {};
        console.log(`  ✓ Primários carregados:`, Object.keys(primarios));

        const FOR = primarios.forca?.total || 0;
        const VIT = primarios.vitalidade?.total || 0;
        const INT = primarios.inteligencia?.total || 0;
        const PER = primarios.percepcao?.total || 0;
        const SOR = primarios.sorte?.total || 0;

        console.log(`  ✓ Valores primários: FOR=${FOR}, VIT=${VIT}, INT=${INT}, PER=${PER}, SOR=${SOR}`);

        let maximoCalculado = 0;

        if (statusType === 'hp') {
            // 🔹 MÁXIMO SAÚDE = ceil(((FOR × 0.3) + (VIT × 0.6) + (SOR × 0.1)) × 2) + (base + extra + bonus)
            const soma = (FOR * 0.3) + (VIT * 0.6) + (SOR * 0.1);
            const comMultiplicador = soma * 2;
            maximoCalculado = Math.ceil(comMultiplicador);
            console.log(`  ✓ HP: soma=(${FOR}×0.3)+(${VIT}×0.6)+(${SOR}×0.1)=${soma.toFixed(2)} → ×2=${comMultiplicador.toFixed(2)} → ceil=${maximoCalculado}`);
        } else if (statusType === 'energy') {
            // 🔹 MÁXIMO ENERGIA = ceil(((INT × 0.6) + (PER × 0.3) + (SOR × 0.1)) × 1.333333) + (base + extra + bonus)
            const soma = (INT * 0.6) + (PER * 0.3) + (SOR * 0.1);
            const comMultiplicador = soma * (200 / 150); // 1.333333...
            maximoCalculado = Math.ceil(comMultiplicador);
            console.log(`  ✓ Energy: soma=(${INT}×0.6)+(${PER}×0.3)+(${SOR}×0.1)=${soma.toFixed(2)} → ×${(200/150).toFixed(6)}=${comMultiplicador.toFixed(2)} → ceil=${maximoCalculado}`);
        } else if (statusType === 'fatigue') {
            // 🔹 MÁXIMO FADIGA = ceil((FOR × 0.3) + (VIT × 0.5) + (SOR × 0.2)) + (base + extra + bonus)
            const soma = (FOR * 0.3) + (VIT * 0.5) + (SOR * 0.2);
            maximoCalculado = Math.ceil(soma);
            console.log(`  ✓ Fatigue: soma=(${FOR}×0.3)+(${VIT}×0.5)+(${SOR}×0.2)=${soma.toFixed(2)} → ceil=${maximoCalculado}`);
        }

        const maximoFinal = maximoCalculado + (base + extra + bonus);
        console.log(`  ✓ Máximo final: ${maximoCalculado} + (${base} + ${extra} + ${bonus}) = ${maximoFinal}`);

        // ⭐ Quando o modal de configuração abrir, iniciar o campo Atual com o valor Máximo
        current = maximoFinal;
        console.log(`  ✓ Campo atual definido para o máximo: ${current}`);

        // Armazenar valores temporários
        this.state.tempValues[statusType] = {
            current: current,
            base: base,
            extra: extra,
            bonus: bonus,
            maximum: maximoFinal
        };

        // Armazenar valores originais para detectar mudanças
        this.state.originalValues[statusType] = {
            current: current,
            base: base,
            extra: extra,
            bonus: bonus,
            maximum: maximoFinal
        };

        console.log(`  ✓ tempValues[${statusType}] atualizado:`, this.state.tempValues[statusType]);
        console.log(`✅ === loadStatusData(${statusType}) concluído ===\n`);
    },

    /**
     * ⭐ NOVO: Salva os valores do status anterior quando troca para outro
     * Isso garante que edições não se percam ao navegar entre status
     * 🎯 Preserva TANTO "Atual" quanto "Extra"
     */
    saveCurrentStatusValues() {
        const currentStatus = this.state.activeStatus;
        
        if (!currentStatus) {
            console.log(`  ℹ️  Nenhum status anterior para salvar`);
            return;
        }

        console.log(`\n  💾 ╔════════════════════════════════════════════`);
        console.log(`  💾 ║ SALVANDO VALORES DO STATUS: ${currentStatus.toUpperCase()}`);
        console.log(`  💾 ║════════════════════════════════════════════`);

        // ⭐ IMPORTANTE: SEMPRE pegar do input, não do tempValues
        // Isso garante que valores digitados mas não salvos sejam capturados
        const currentInput = document.getElementById('status-config-current');
        const extraInput = document.getElementById('status-config-extra');
        const bonusInput = document.getElementById('status-config-bonus');
        
        // Coletar valores dos inputs ATUAIS (com fallback para tempValues se não existirem inputs)
        const current = currentInput ? parseInt(currentInput.value) || 0 : this.state.tempValues[currentStatus].current || 0;
        const base = 0; // Base não é mais editável no novo sistema
        const extra = extraInput ? parseInt(extraInput.value) || 0 : this.state.tempValues[currentStatus].extra || 0;
        const bonus = bonusInput ? parseInt(bonusInput.value) || 0 : this.state.tempValues[currentStatus].bonus || 0;

        console.log(`  💾 ║ VALORES CAPTURADOS DOS INPUTS:`);
        console.log(`  💾 ║   current: ${current}`);
        console.log(`  💾 ║   base:    ${base}`);
        console.log(`  💾 ║   extra:   ${extra}`);
        console.log(`  💾 ║   bonus:   ${bonus}`);

        // ⭐ CRUCIAL: Atualizar tempValues com os valores DOS INPUTS
        // Isso garante que qualquer edição feita no input seja salva antes de trocar de aba
        if (this.state.tempValues[currentStatus]) {
            this.state.tempValues[currentStatus].current = current;
            this.state.tempValues[currentStatus].base = base;
            this.state.tempValues[currentStatus].extra = extra;
            this.state.tempValues[currentStatus].bonus = bonus;
            
            // ✅ Recalcular máximo se algum valor mudou
            this.updateMaxValue();
            
            console.log(`  💾 ║ VALORES ATUALIZADOS EM tempValues:`);
            console.log(`  💾 ║   ✅ current: ${this.state.tempValues[currentStatus].current}`);
            console.log(`  💾 ║   ✅ base:    ${this.state.tempValues[currentStatus].base}`);
            console.log(`  💾 ║   ✅ extra:   ${this.state.tempValues[currentStatus].extra}`);
            console.log(`  💾 ║   ✅ bonus:   ${this.state.tempValues[currentStatus].bonus}`);
            console.log(`  💾 ╚════════════════════════════════════════════\n`);
            console.log(`  💾 ║   ✅ maximum: ${this.state.tempValues[currentStatus].maximum}`);
        }

        console.log(`  💾 ╚════════════════════════════════════════════`);
        
        // 💾 ⭐ FIX: Sincronizar para localStorage para persistência
        this.syncStatusFieldsToLocalStorage();
    },

    /**
     * Define qual status está ativo no modal
     * ⭐ NOVO: Salva valores do status anterior antes de trocar
     * @param {string} statusType - 'hp', 'energy' ou 'fatigue'
     */
    setActiveStatus(statusType) {
        console.log(`\n🎯 ╔════════════════════════════════════════════`);
        console.log(`🎯 ║ ALTERANDO STATUS ATIVO`);
        console.log(`🎯 ║════════════════════════════════════════════`);
        
        // ⭐ NOVO: Salvar valores do status anterior ANTES de trocar
        if (this.state.activeStatus && this.state.activeStatus !== statusType) {
            console.log(`🎯 ║ STATUS ANTERIOR: ${this.state.activeStatus.toUpperCase()}`);
            console.log(`🎯 ║ → Salvando valores...`);
            this.saveCurrentStatusValues();
        }
        
        this.state.activeStatus = statusType;
        console.log(`🎯 ║ NOVO STATUS: ${statusType.toUpperCase()}`);

        // ✨ ESTRATÉGIA MELHORADA: NÃO recarregar do StatusBarsManager ao trocar status
        // Isso garante que edições feitas não sejam perdidas
        // Apenas atualizar a UI com os valores já em tempValues
        console.log(`🎯 ║ → Sincronizando UI com dados em memória...`);
        this.updateUI();
        
        console.log(`🎯 ║ → Atualizando destaque da prévia...`);
        this.updatePreviewHighlight();
        console.log(`🎯 ╚════════════════════════════════════════════\n`);
    },

    /**
     * ⭐ NOVO: Método para atualizar rápido quando modal está aberta
     * Chamado pelo ciclo de recálculo se modal aberta
     */
    refreshModalData() {
        if (!this.state.isOpen) return;
        
        console.log(`\n🔍 ====== DIAGNÓSTICO refreshModalData() INÍCIO ======`);
        console.log(`   Modal está aberta: ${this.state.isOpen}`);
        console.log(`   Status ativo: ${this.state.activeStatus}`);
        
        // ⭐ GARANTIA AGRESSIVA: SEMPRE recalcular máximos ZERO de qualquer cache
        console.log(`   🔥 LIMPANDO CACHE E FORÇANDO RECÁLCULO...`);
        
        // Limpar completamente qualquer cache em memória
        if (window.statusBarsManager) {
            // Reset os valores máximos para forçar recálculo
            window.statusBarsManager.state.hp.max = 0;
            window.statusBarsManager.state.energy.max = 0;
            window.statusBarsManager.state.fatigue.max = 0;
            console.log(`   ✓ Estado resetado`);
            
            // Agora recalcular LIMPO
            if (typeof window.statusBarsManager.recalcularMaximos === 'function') {
                console.log(`   ✓ Recalculando máximos do zero...`);
                window.statusBarsManager.recalcularMaximos();
            }
        }
        
        // Recarregar dados do status ativo
        const statusType = this.state.activeStatus;
        console.log(`   Carregando dados para: ${statusType}`);
        this.loadStatusData(statusType);
        
        // Atualizar UI (que inclui updateMaxValue)
        console.log(`   Atualizando UI...`);
        this.updateUI();
        this.updateMaxValue();
        
        // Garantir que preview também está atualizado
        this.updatePreview();
        
        console.log(`   Modal refrescada completamente para: ${statusType}`);
        console.log(`🔍 ====== DIAGNÓSTICO refreshModalData() FIM ======\n`);
    },

    /**
     * Atualiza toda a interface do modal
     */
    updateUI() {
        const statusType = this.state.activeStatus;
        const label = this.config.labels[statusType];
        const values = this.state.tempValues[statusType];

        console.log(`\n📊 === updateUI() iniciado ===`);
        console.log(`  Status: ${statusType} (${label})`);
        console.log(`  Valores a exibir:`, values);

        // Atualizar título
        const titleEl = document.getElementById('status-config-title');
        const detailTitleEl = document.getElementById('status-config-detail-title');
        
        if (titleEl) titleEl.textContent = `Configurar ${label}`;
        if (detailTitleEl) detailTitleEl.textContent = label;
        console.log(`  ✓ Títulos atualizados`);

        // Atualizar grid (cores e classes)
        const quads = document.querySelectorAll('.status-config-quad');
        quads.forEach(quad => {
            quad.classList.remove('hp', 'energy', 'fatigue');
            quad.classList.add(statusType);
        });
        console.log(`  ✓ Cores atualizadas (${quads.length} quadrados)`);

        // Atualizar valores nos inputs
        const currentEl = document.getElementById('status-config-current');
        const extraEl = document.getElementById('status-config-extra');
        const bonusEl = document.getElementById('status-config-bonus');
        const maxEl = document.getElementById('status-config-max-value');
        
        console.log(`\n  📝 CARREGANDO VALORES NOS INPUTS:`);
        
        if (currentEl) {
            currentEl.value = values.current || 0;
            console.log(`  ✓ Campo ATUAL (Atual): ${currentEl.value}`);
        }
        if (extraEl) {
            extraEl.value = values.extra || 0;
            console.log(`  ✓ Campo EXTRA (Extra): ${extraEl.value}`);
        }
        if (bonusEl) {
            bonusEl.value = values.bonus || 0;
            console.log(`  ✓ Campo BÔNUS (Bonus): ${bonusEl.value}`);
        }
        if (maxEl) {
            maxEl.textContent = values.maximum || 0;
            console.log(`  ✓ Campo MÁXIMO (Max): ${maxEl.textContent}`);
        }

        console.log(`✅ === updateUI() concluído ===\n`);

        // Atualizar prévia
        this.updatePreview();
    },

    /**
     * Destaca o status ativo na prévia
     */
    updatePreviewHighlight() {
        const items = document.querySelectorAll('.status-config-preview-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.status === this.state.activeStatus) {
                item.classList.add('active');
            }
        });
    },

    /**
     * ⭐ Atualiza a seção de prévia com valores EDITADOS (tempo real)
     * Mostra os valores que estão sendo editados, não os salvos
     */
    updatePreview() {
        console.log(`\n👁️  === updatePreview() - Mostrando valores em tempo real ===`);

        // HP - Usar valores temporários (editados)
        const hpPreview = document.getElementById('preview-hp-value');
        if (hpPreview) {
            const hpValues = this.state.tempValues.hp;
            const hpCurrentValue = hpValues.current;
            const hpMaxValue = hpValues.maximum;
            hpPreview.textContent = `${hpCurrentValue} / ${hpMaxValue}`;
            console.log(`  📊 HP Prévia: ${hpCurrentValue} / ${hpMaxValue}`);
        }

        // Energia - Usar valores temporários (editados)
        const energyPreview = document.getElementById('preview-energy-value');
        if (energyPreview) {
            const energyValues = this.state.tempValues.energy;
            const energyCurrentValue = energyValues.current;
            const energyMaxValue = energyValues.maximum;
            energyPreview.textContent = `${energyCurrentValue} / ${energyMaxValue}`;
            console.log(`  📊 Energia Prévia: ${energyCurrentValue} / ${energyMaxValue}`);
        }

        // Fadiga - Usar valores temporários (editados)
        const fatiguePreview = document.getElementById('preview-fatigue-value');
        if (fatiguePreview) {
            const fatigueValues = this.state.tempValues.fatigue;
            const fatigueCurrentValue = fatigueValues.current;
            const fatigueMaxValue = fatigueValues.maximum;
            fatiguePreview.textContent = `${fatigueCurrentValue} / ${fatigueMaxValue}`;
            console.log(`  📊 Fadiga Prévia: ${fatigueCurrentValue} / ${fatigueMaxValue}`);
        }

        console.log(`✅ === updatePreview() concluído ===\n`);
    },

    /**
     * Calcula e atualiza o valor máximo (fórmula automática)
     * HP: (2*Vitalidade + 1*Força + extra + bonus)
     * Energia: (1.3*Inteligência + 0.7*Vitalidade + extra + bonus)
     * Fadiga: (0.5*Sorte + 1.5*Vitalidade + extra + bonus)
     */
    updateMaxValue() {
        const statusType = this.state.activeStatus;
        console.log(`\n🧮 === updateMaxValue(${statusType}) iniciado ===`);
        
        if (!statusType) {
            console.warn('  ❌ Nenhum status ativo');
            return;
        }

        const values = this.state.tempValues[statusType];
        console.log(`  ✓ tempValues[${statusType}]:`, values);
        
        // ⭐ Recarregar estado atual do StateManager
        const stateManager = window.appState;
        if (!stateManager) {
            console.warn('  ❌ StateManager não disponível');
            return;
        }

        const state = stateManager.getState();
        if (!state) {
            console.warn('  ❌ State não carregado');
            return;
        }
        
        const primarios = state.atributos?.primarios || {};
        console.log(`  ✓ Primários disponíveis:`, Object.keys(primarios));

        // Obter valores dos atributos primários
        const FOR = primarios.forca?.total || 0;
        const VIT = primarios.vitalidade?.total || 0;
        const INT = primarios.inteligencia?.total || 0;
        const PER = primarios.percepcao?.total || 0;
        const SOR = primarios.sorte?.total || 0;

        console.log(`  ✓ Valores primários: FOR=${FOR}, VIT=${VIT}, INT=${INT}, PER=${PER}, SOR=${SOR}`);

        // Ler valores dos inputs
        const currentInput = document.getElementById('status-config-current');
        const extraInput = document.getElementById('status-config-extra');
        const bonusInput = document.getElementById('status-config-bonus');
        
        if (!currentInput || !extraInput) {
            console.warn(`  ⚠️  Inputs não encontrados - current: ${!!currentInput}, extra: ${!!extraInput}`);
        }
        
        const current = currentInput ? (parseInt(currentInput.value) || 0) : 0;
        const extra = extraInput ? (parseInt(extraInput.value) || 0) : 0;
        // Determinar base/extra/bonus com múltiplos fallbacks
        let base = values.base || 0;
        let extraVal = values.extra || 0;

        // Tentar obter do StatusBarsManager se disponível (fonte de verdade das barras)
        try {
            if (window.statusBarsManager && window.statusBarsManager.state) {
                const sbKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energy' : 'fatigue';
                const sbm = window.statusBarsManager.state[sbKey] || {};
                base = (typeof values.base !== 'number' || values.base === 0) ? (sbm.base || base) : base;
                extraVal = (typeof values.extra !== 'number' || values.extra === 0) ? (sbm.extra || extraVal) : extraVal;
                console.log(`  ✓ Valores lidos do StatusBarsManager (${sbKey}): base=${sbm.base||0}, extra=${sbm.extra||0}, bonus=${sbm.bonus||0}`);
            }
        } catch (e) {
            console.warn('  ⚠️ Erro ao ler StatusBarsManager:', e.message);
        }

        // Preparar fallback de localStorage para base/extra/bonus se tempValues estiver vazio
        let persistedStatusFields = {};
        try {
            const savedFieldsJson = localStorage.getItem('redungeon_status_fields_extra_bonus');
            if (savedFieldsJson) {
                persistedStatusFields = JSON.parse(savedFieldsJson);
                console.log('  ✓ Fallback de localStorage carregado para status fields');
            }
        } catch (e) {
            console.warn('  ⚠️ Erro ao ler redungeon_status_fields_extra_bonus:', e.message);
        }

        // Também tentar ler do AppState.status como fallback final
        try {
            const state = window.appState?.getState();
            const stateKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energia' : 'fadiga';
            if (state && state.status && state.status[stateKey]) {
                const st = state.status[stateKey];
                base = base || st.base || 0;
                extraVal = extraVal || st.extra || 0;
                console.log(`  ✓ Valores lidos do AppState.status (${stateKey}): base=${st.base||0}, extra=${st.extra||0}, atual=${st.atual||0}`);
            }
            if (!base || !extraVal) {
                const storageKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energia' : 'fadiga';
                if (persistedStatusFields[storageKey]) {
                    base = base || parseInt(persistedStatusFields[storageKey].base) || 0;
                    extraVal = extraVal || parseInt(persistedStatusFields[storageKey].extra) || 0;
                    console.log(`  ✓ Valores lidos do localStorage (${storageKey}): base=${base}, extra=${extraVal}`);
                }
            }
        } catch (e) {
            console.warn('  ⚠️ Erro ao ler AppState:', e.message);
        }

        // ⭐ IMPORTANTE: Bonus SEMPRE vem do INPUT do usuário em tempo real!
        // Primeiro tenta ler do input que o usuário está editando
        // Se não houver input, tenta tempValues -> StatusBarsManager -> BonusCalculator -> 0
        let bonus = 0;
        if (bonusInput && bonusInput.value !== undefined && bonusInput.value !== null && bonusInput.value !== '') {
            bonus = parseInt(bonusInput.value) || 0;
            console.log(`  ✓ Bonus lido do INPUT: ${bonus}`);
        } else if (typeof values.bonus === 'number' && values.bonus) {
            bonus = values.bonus;
            console.log(`  ✓ Bonus lido de tempValues: ${bonus}`);
        } else {
            // fallback: StatusBarsManager
            try {
                if (window.statusBarsManager && window.statusBarsManager.state) {
                    const sbKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energy' : 'fatigue';
                    bonus = window.statusBarsManager.state[sbKey]?.bonus || bonus;
                    if (bonus) console.log(`  ✓ Bonus lido do StatusBarsManager: ${bonus}`);
                }
            } catch (e) {
                console.warn('  ⚠️ Erro ao ler bonus do StatusBarsManager:', e.message);
            }

            // fallback: localStorage se chance de bônus persistido existir
            if (!bonus && persistedStatusFields) {
                const storageKey = statusType === 'hp' ? 'hp' : statusType === 'energy' ? 'energia' : 'fadiga';
                if (persistedStatusFields[storageKey]) {
                    bonus = parseInt(persistedStatusFields[storageKey].bonus) || bonus;
                    if (bonus) console.log(`  ✓ Bonus lido do localStorage: ${bonus}`);
                }
            }

            // fallback: BonusCalculator
            if (!bonus && window.bonusCalculator && typeof window.bonusCalculator.getBonus === 'function') {
                const bonusKey = statusType === 'hp' ? 'saude' : statusType === 'energy' ? 'energia' : 'fadiga';
                bonus = window.bonusCalculator.getBonus(bonusKey) || bonus;
                if (bonus) console.log(`  ✓ Bonus lido do BonusCalculator: ${bonus}`);
            }
        }

        console.log(`  ✓ Valores dos inputs: current=${current}, base=${base}, extra=${extra}, bonus=${bonus}`);

        // ✅ CALCULAR MÁXIMO CONFORME FÓRMULAS ESPECIFICADAS
        let maximoCalculado = 0;
        let formulaDebug = '';

        if (statusType === 'hp') {
            // 🔹 MÁXIMO SAÚDE = ceil(((FOR × 0.3) + (VIT × 0.6) + (SOR × 0.1)) × 2) + (base + extra + bonus)
            const soma = (FOR * 0.3) + (VIT * 0.6) + (SOR * 0.1);
            const comMultiplicador = soma * 2;
            maximoCalculado = Math.ceil(comMultiplicador);
            formulaDebug = `HP: ceil(((${FOR}×0.3)+(${VIT}×0.6)+(${SOR}×0.1))×2) = ceil(${comMultiplicador.toFixed(2)}) = ${maximoCalculado}`;
        } else if (statusType === 'energy') {
            // 🔹 MÁXIMO ENERGIA = ceil(((INT × 0.6) + (PER × 0.3) + (SOR × 0.1)) × 1.333333) + (base + extra + bonus)
            const soma = (INT * 0.6) + (PER * 0.3) + (SOR * 0.1);
            const comMultiplicador = soma * (200 / 150);
            maximoCalculado = Math.ceil(comMultiplicador);
            formulaDebug = `Energy: ceil(((${INT}×0.6)+(${PER}×0.3)+(${SOR}×0.1))×${(200/150).toFixed(6)}) = ceil(${comMultiplicador.toFixed(2)}) = ${maximoCalculado}`;
        } else if (statusType === 'fatigue') {
            // 🔹 MÁXIMO FADIGA = ceil((FOR × 0.3) + (VIT × 0.5) + (SOR × 0.2)) + (base + extra + bonus)
            const soma = (FOR * 0.3) + (VIT * 0.5) + (SOR * 0.2);
            maximoCalculado = Math.ceil(soma);
            formulaDebug = `Fatigue: ceil((${FOR}×0.3)+(${VIT}×0.5)+(${SOR}×0.2)) = ceil(${soma.toFixed(2)}) = ${maximoCalculado}`;
        }

        console.log(`  ✓ ${formulaDebug}`);

        // Adicionar ajustes do usuário
        const maximoFinal = maximoCalculado + (base + extra + bonus);
        console.log(`  ✓ Máximo final: ${maximoCalculado} + (${base} + ${extra} + ${bonus}) = ${maximoFinal}`);

        // Atualizar tempValues
        this.state.tempValues[statusType].current = current;
        this.state.tempValues[statusType].base = base;
        this.state.tempValues[statusType].extra = extra;
        this.state.tempValues[statusType].bonus = bonus;
        this.state.tempValues[statusType].maximum = maximoFinal;
        console.log(`  ✓ tempValues atualizado:`, this.state.tempValues[statusType]);

        // ⭐ Exibir valores nos campos
        const maxElement = document.getElementById('status-config-max-value');
        const bonusElement = document.getElementById('status-config-bonus');
        
        if (maxElement) {
            maxElement.textContent = maximoFinal;
            console.log(`  ✓ Campo MÁXIMO atualizado: ${maxElement.textContent}`);
        } else {
            console.warn('  ⚠️  Elemento status-config-max-value não encontrado');
        }
        
        if (bonusElement) {
            bonusElement.value = bonus;
            console.log(`  ✓ Campo BONUS atualizado: ${bonusElement.value}`);
        } else {
            console.warn('  ⚠️  Elemento status-config-bonus não encontrado');
        }

        // ⭐ NOVO: Atualizar prévia em tempo real ao editar
        console.log(`  → Atualizando prévia em tempo real...`);
        this.updatePreview();
        console.log(`  ✓ Prévia atualizada`);

        console.log(`✅ === updateMaxValue(${statusType}) concluído ===\n`);
    },

    // ============================================
    // SALVAR ALTERAÇÕES
    // ============================================

    /**
     * Detecta quais status foram modificados
     * @returns {array} - Array com tipos de status que foram alterados
     */
    detectModifiedStatuses() {
        const statusTypes = ['hp', 'energy', 'fatigue'];
        const modified = [];

        statusTypes.forEach(statusType => {
            const current = this.state.tempValues[statusType];
            const original = this.state.originalValues[statusType];

            // Verificar se algum valor foi alterado
            if (
                current.current !== original.current ||
                current.extra !== original.extra ||
                current.bonus !== original.bonus
            ) {
                modified.push(statusType);
            }
        });

        console.log(`🔍 Status modificados: ${modified.length > 0 ? modified.join(', ') : 'nenhum'}`);
        return modified;
    },

    /**
     * Salva as alterações no StatusBarsManager
     * ✨ NOVO: Salva TODOS os 3 status ao mesmo tempo (não apenas o correlado)
     */
    saveChanges() {
        console.log(`\n💾 === saveChanges() SALVANDO TODOS OS 3 STATUS ===`);

        const statusTypes = ['hp', 'energy', 'fatigue'];
        const statusTypesLabels = { hp: 'Saúde', energy: 'Energia', fatigue: 'Fadiga' };

        // ✨ NOVO: Se modal está aberta, salvar o status ativo PRIMEIRO (antes de varrer todos)
        // Isso garante que o último status que você editou também seja salvo
        if (this.state.isOpen && this.state.activeStatus) {
            console.log(`\n  🎯 Salvando status ativo (${this.state.activeStatus}) antes de varrer todos...`);
            this.saveCurrentStatusValues();
        }

        // ✅ SALVAR TODOS OS 3 STATUS (que já têm valores em tempValues)
        statusTypes.forEach(statusType => {
            const values = this.state.tempValues[statusType];
            const label = statusTypesLabels[statusType];

            console.log(`\n  📌 Salvando ${label} (${statusType})...`);
            console.log(`     Valores: current=${values.current}, base=${values.base}, extra=${values.extra}, bonus=${values.bonus}, max=${values.maximum}`);

            // ✅ Persistir DIRETO no StatusBarsManager.state
            if (window.StatusBarsManager && window.StatusBarsManager.state) {
                if (window.StatusBarsManager.state[statusType]) {
                    window.StatusBarsManager.state[statusType].current = values.current || 0;
                    window.StatusBarsManager.state[statusType].base = values.base || 0;
                    window.StatusBarsManager.state[statusType].extra = values.extra || 0;
                    window.StatusBarsManager.state[statusType].bonus = values.bonus || 0;
                    window.StatusBarsManager.state[statusType].max = values.maximum || 0;
                    console.log(`     ✅ StatusBarsManager.state[${statusType}] atualizado`);
                } else {
                    console.warn(`     ⚠️  Status ${statusType} não encontrado em StatusBarsManager.state`);
                }
            } else {
                console.warn(`     ⚠️  StatusBarsManager não disponível`);
            }

            // ✅ Persistir no StateManager (appState)
            const stateManager = window.appState;
            if (stateManager) {
                const state = stateManager.getState();
                if (!state.status) {
                    state.status = {};
                }
                if (!state.status[statusType]) {
                    state.status[statusType] = {};
                }
                state.status[statusType].current = values.current || 0;
                state.status[statusType].base = values.base || 0;
                state.status[statusType].extra = values.extra || 0;
                state.status[statusType].bonus = values.bonus || 0;
                state.status[statusType].max = values.maximum || 0;
                stateManager.setState(state);
                console.log(`     ✅ StateManager.state.status[${statusType}] atualizado`);
            } else {
                console.warn(`     ⚠️  StateManager não disponível`);
            }
        });

        console.log(`\n  ✅ TODOS OS 3 STATUS SALVOS COM SUCESSO!\n`);

        // ✅ PERSISTIR EM LOCALSTORAGE
        const stateManager = window.appState;
        if (stateManager && window.localStorageManager) {
            const state = stateManager.getState();
            if (state.status) {
                window.localStorageManager.saveStatus(state.status);
                console.log('💾 Status salvos em localStorage');
            }
        }

        // ✅ ⭐ Atualizar visual com animação suave
        console.log(`  → Atualizando visual com animação...`);
        if (window.StatusBarsManager && typeof window.StatusBarsManager.render === 'function') {
            window.StatusBarsManager.render();
            console.log(`  ✅ Todas as barras renderizadas com animação`);
        } else {
            console.warn(`  ⚠️  StatusBarsManager.render não disponível`);
        }

        // ✅ ⭐ Atualizar box de status na aba de atributos
        console.log(`  → Atualizando box de status na aba de atributos...`);
        if (window.atributosManager && typeof window.atributosManager.atualizarTodosOsStatus === 'function') {
            window.atributosManager.atualizarTodosOsStatus();
            console.log(`  ✅ Box de status atualizada na aba de atributos`);
        } else if (window.atributosManager && typeof window.atributosManager.renderizarPersonagem === 'function') {
            window.atributosManager.renderizarPersonagem();
            console.log(`  ✅ Aba de atributos re-renderizada`);
        } else {
            console.warn(`  ⚠️  Método de atualização de atributos não disponível`);
        }

        console.log(`✅ === saveChanges() CONCLUÍDO - TODOS OS 3 STATUS SALVOS ===\n`);

        // ✅ Fechar modal
        this.close();
    },

    /**
     * Salva as alterações de um status específico
     * ⚠️ NEUTRALIZADO - Sem salvar dados ou recalcular
     */
    saveStatusChanges(statusType) {
        console.log(`⚠️ saveStatusChanges NEUTRALIZADO para ${statusType}`);
        return;
    },

    // ============================================
    // UTILITÁRIOS
    // ============================================

    /**
     * Retorna o estado atual do modal
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    },

    /**
     * Define um código interno de máximo (para futuras expansões)
     * @param {string} statusType - Tipo de status
     * @param {number} value - Valor do código
     */
    setInternalMaxCode(statusType, value) {
        if (this.config.internalMaxCode.hasOwnProperty(statusType)) {
            this.config.internalMaxCode[statusType] = value;
            console.log(`🔧 Código interno de máximo definido: ${statusType} = ${value}`);
        }
    },
};

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// ⭐ NOVO: Exportar para window para que outros scripts acessem
window.statusConfigModal = StatusConfigModal;
window.StatusConfigModal = StatusConfigModal;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar StatusBarsManager estar inicializado
        setTimeout(() => {
            StatusConfigModal.init();
        }, 100);
    });
} else {
    StatusConfigModal.init();
}

