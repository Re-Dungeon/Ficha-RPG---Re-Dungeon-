/* ============================================ */
/* STATUS-BARS-MANAGER.JS                      */
/* Gerenciamento de Barras de Status (HUD)     */
/* ============================================ */

/**
 * StatusBarsManager - Controla as três barras de status
 * Responsável por:
 * - Atualizar valores de saúde, energia e fadiga
 * - Calcular percentuais e aplicar estilos
 * - Gerenciar cores baseadas no percentual
 * - Garantir transições suaves
 */

const StatusBarsManager = {
    // ============================================
    // ESTADO INTERNO
    // ============================================
    
    state: {
        hp: {
            current: 0,
            max: 0,
            extra: 0,
            bonus: 0,
        },
        energy: {
            current: 0,
            max: 0,
            extra: 0,
            bonus: 0,
        },
        fatigue: {
            current: 0,
            max: 0,
            extra: 0,
            bonus: 0,
        },
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================

    /**
     * Inicializa o sistema de barras
     * ✅ ETAPA 5: Carrega dados do localStorage para F5-safety
     */
    init() {
        console.log('🎮 Inicializando StatusBarsManager...');

        // Validar que os elementos existem
        if (!this.validateElements()) {
            console.error('❌ Erro: Elementos das barras não encontrados no DOM');
            return false;
        }

        // ✅ ETAPA 5: Restaurar dados persistidos
        console.log('  → Carregando status do localStorage...');
        this.loadFromLocalStorage();

        // ✅ NOVO: Recalcular máximos de Energia e Fadiga baseado nos atributos
        // Isso garante que após F5, as barras fiquem com os mesmos máximos da Saúde
        console.log('  → Recalculando máximos de status...');
        setTimeout(() => {
            this.recalcularMaximos();
        }, 100);

        // Renderizar as barras com os valores restaurados
        console.log('  → Renderizando barras com valores restaurados...');
        this.render();

        console.log('✅ StatusBarsManager inicializado com sucesso');
        return true;
    },

    /**
     * ✅ ETAPA 5: Carrega dados do localStorage
     * Restaura valores salvos de HP, Energia e Fadiga
     */
    loadFromLocalStorage() {
        // 🔒 BLOQUEIO ISOLADO: Não carregar dados APENAS se o botão "Limpar Ficha" foi clicado
        // Usa sessionStorage em vez de window para garantir isolamento ao recarregar a página
        if (sessionStorage.getItem('LIMPEZA_FICHA_ATIVA')) {
            console.log('🔒 [StatusBarsManager] Carregamento bloqueado - Limpeza em progresso');
            return;
        }

        try {
            if (!window.localStorageManager) {
                console.warn('⚠️ localStorageManager não disponível');
                return;
            }

            const savedStatus = window.localStorageManager.loadStatus();
            if (!savedStatus) {
                console.log('ℹ️ Nenhum status salvo anteriormente, usando valores padrão');
                return;
            }

            // Restaurar dados para cada tipo de barra
            ['hp', 'energy', 'fatigue'].forEach(barType => {
                if (savedStatus[barType]) {
                    this.state[barType] = {
                        current: savedStatus[barType].current || 0,
                        max: savedStatus[barType].max || 100,
                        extra: savedStatus[barType].extra || 0,
                        bonus: savedStatus[barType].bonus || 0
                    };
                    console.log(`  ✓ ${barType} restaurado: ${this.state[barType].current}/${this.state[barType].max}`);
                }
            });

            console.log('✅ Status carregados do localStorage');
            
            // 🎨 Renderizar imediatamente após carregar
            this.render();
        } catch (error) {
            console.warn('⚠️ Erro ao carregar status do localStorage:', error);
        }
    },

    /**
     * Valida se todos os elementos necessários existem no DOM
     */
    validateElements() {
        const requiredElements = [
            'hp-bar', 'hp-fill', 'hp-text',
            'energy-bar', 'energy-fill', 'energy-text',
            'fatigue-bar', 'fatigue-fill', 'fatigue-text',
        ];

        for (const id of requiredElements) {
            if (!document.getElementById(id)) {
                console.warn(`⚠️  Elemento não encontrado: #${id}`);
                return false;
            }
        }

        return true;
    },

    // ============================================
    // ATUALIZAÇÃO DE BARRAS
    // ============================================

    /**
     * Renderiza todas as barras de status (HP, Energy, Fatiga)
     * Método principal para atualizar toda a interface visual
     */
    render() {
        console.log('\n🎨 === StatusBarsManager.render() iniciado ===');
        this.updateBar('hp');
        this.updateBar('energy');
        this.updateBar('fatigue');
        console.log('✅ === StatusBarsManager.render() concluído ===\n');
    },

    /**
     * Atualiza uma barra específica
     * @param {string} barType - Tipo da barra: 'hp', 'energy' ou 'fatigue'
     */
    updateBar(barType) {
        const data = this.state[barType];
        const percentage = data.max > 0 ? (data.current / data.max) * 100 : 0;

        // Obter elementos
        const fillElement = document.getElementById(`${barType}-fill`);
        const textElement = document.getElementById(`${barType}-text`);
        const percentageElement = document.getElementById(`${barType}-percentage`);

        if (!fillElement || !textElement) {
            console.error(`❌ Erro ao atualizar barra: ${barType}`);
            return;
        }

        // Adicionar classe de transição para animação suave
        fillElement.classList.add('animating');

        // Atualizar largura da barra (mínimo de 2% para visibilidade quando vazia)
        const displayWidth = percentage < 2 ? 2 : percentage;
        fillElement.style.width = displayWidth + '%';
        
        // Se estiver vazia, marcar com classe especial
        if (percentage === 0) {
            fillElement.classList.add('is-empty');
        } else {
            fillElement.classList.remove('is-empty');
        }

        // Atualizar texto
        textElement.textContent = `${data.current} / ${data.max}`;

        // Atualizar porcentagem
        if (percentageElement) {
            percentageElement.textContent = `${Math.round(percentage)}%`;
        }

        // Aplicar classe de cor baseada no percentual
        this.applyColorClass(fillElement, barType, percentage);

        // Remover classe de animação após completar
        setTimeout(() => {
            fillElement.classList.remove('animating');
        }, 300);

        console.log(`  ✓ ${barType}: ${data.current}/${data.max} (${Math.round(percentage)}%)`);
    },

    /**
     * Aplica a classe de cor baseada no percentual
     * @param {HTMLElement} element - Elemento a receber a classe
     * @param {string} barType - Tipo da barra: 'hp', 'energy' ou 'fatigue'
     * @param {number} percentage - Percentual (0-100)
     */
    applyColorClass(element, barType, percentage) {
        // Remover todas as classes de cor
        element.classList.remove(`${barType}-high`, `${barType}-medium`, `${barType}-low`);

        // Aplicar classe apropriada
        let colorClass;

        if (barType === 'fatigue') {
            // FADIGA é invertida: roxo (baixa) -> vermelho (alta)
            if (percentage <= 33) {
                colorClass = `${barType}-low`;      // Roxo claro
            } else if (percentage <= 66) {
                colorClass = `${barType}-medium`;   // Laranja
            } else {
                colorClass = `${barType}-high`;     // Vermelho
            }
        } else {
            // HP e Energia: verde/azul (alta) -> amarelo -> vermelho (baixa)
            if (percentage <= 33) {
                colorClass = `${barType}-low`;      // Vermelho
            } else if (percentage <= 66) {
                colorClass = `${barType}-medium`;   // Amarelo
            } else {
                colorClass = `${barType}-high`;     // Verde/Azul
            }
        }

        element.classList.add(colorClass);
    },

    // ============================================
    // MÉTODOS PÚBLICOS - HP (SAÚDE)
    // ============================================

    /**
     * Define a saúde atual
     * @param {number} value - Novo valor de saúde
     */
    setHP(value) {
        const clamped = Math.max(0, Math.min(value, this.state.hp.max));
        this.state.hp.current = clamped;
        this.updateBar('hp');
        this.logBarUpdate('Saúde', clamped, this.state.hp.max);
    },

    /**
     * Aumenta a saúde
     * @param {number} amount - Quantidade a aumentar
     */
    addHP(amount) {
        this.setHP(this.state.hp.current + amount);
    },

    /**
     * Reduz a saúde
     * @param {number} amount - Quantidade a reduzir
     */
    damageHP(amount) {
        this.setHP(this.state.hp.current - amount);
    },

    /**
     * Define a saúde máxima
     * @param {number} value - Novo valor máximo
     */
    setMaxHP(value) {
        // 🔥 FORÇA BRUTA: Permitir 0 para fazer reset do cache
        console.log(`📝 setMaxHP: Alterando HP max de ${this.state.hp.max} para ${value}`);
        this.state.hp.max = value;
        // Não permitir que saúde atual exceda o máximo
        if (this.state.hp.current > value) {
            this.state.hp.current = value;
        }
        console.log(`✅ setMaxHP: state.hp.max agora é ${this.state.hp.max}`);
        this.updateBar('hp');
    },

    // ============================================
    // MÉTODOS PÚBLICOS - ENERGIA
    // ============================================

    /**
     * Define a energia atual
     * @param {number} value - Novo valor de energia
     */
    setEnergy(value) {
        const clamped = Math.max(0, Math.min(value, this.state.energy.max));
        this.state.energy.current = clamped;
        this.updateBar('energy');
        this.logBarUpdate('Energia', clamped, this.state.energy.max);
    },

    /**
     * Aumenta a energia
     * @param {number} amount - Quantidade a aumentar
     */
    addEnergy(amount) {
        this.setEnergy(this.state.energy.current + amount);
    },

    /**
     * Reduz a energia
     * @param {number} amount - Quantidade a reduzir
     */
    consumeEnergy(amount) {
        this.setEnergy(this.state.energy.current - amount);
    },

    /**
     * Define a energia máxima
     * @param {number} value - Novo valor máximo
     */
    setMaxEnergy(value) {
        // 🔥 FORÇA BRUTA: Permitir 0 para fazer reset do cache
        console.log(`📝 setMaxEnergy: Alterando Energy max de ${this.state.energy.max} para ${value}`);
        this.state.energy.max = value;
        if (this.state.energy.current > value) {
            this.state.energy.current = value;
        }
        console.log(`✅ setMaxEnergy: state.energy.max agora é ${this.state.energy.max}`);
        this.updateBar('energy');
    },

    // ============================================
    // MÉTODOS PÚBLICOS - FADIGA
    // ============================================

    /**
     * Define a fadiga atual
     * Nota: Fadiga é o oposto - quanto maior, mais cansado
     * @param {number} value - Novo valor de fadiga (0-100)
     */
    setFatigue(value) {
        const clamped = Math.max(0, Math.min(value, this.state.fatigue.max));
        this.state.fatigue.current = clamped;
        this.updateBar('fatigue');
        this.logBarUpdate('Fadiga', clamped, this.state.fatigue.max);
    },

    /**
     * Aumenta a fadiga
     * @param {number} amount - Quantidade a aumentar
     */
    addFatigue(amount) {
        this.setFatigue(this.state.fatigue.current + amount);
    },

    /**
     * Reduz a fadiga (repouso)
     * @param {number} amount - Quantidade a reduzir
     */
    rest(amount) {
        this.setFatigue(this.state.fatigue.current - amount);
    },

    /**
     * Define a fadiga máxima
     * @param {number} value - Novo valor máximo
     */
    setMaxFatigue(value) {
        // 🔥 FORÇA BRUTA: Permitir 0 para fazer reset do cache
        console.log(`📝 setMaxFatigue: Alterando Fatigue max de ${this.state.fatigue.max} para ${value}`);
        this.state.fatigue.max = value;
        if (this.state.fatigue.current > value) {
            this.state.fatigue.current = value;
        }
        console.log(`✅ setMaxFatigue: state.fatigue.max agora é ${this.state.fatigue.max}`);
        this.updateBar('fatigue');
    },

    // ============================================
    // MÉTODOS DE CONSULTA
    // ============================================

    /**
     * Retorna o estado completo
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    },

    /**
     * Define o estado completo
     * @param {object} newState - Novo estado a atribuir
     */
    setState(newState) {
        if (typeof newState === 'object' && newState !== null) {
            // Mesclar novo estado com estado existente
            Object.keys(newState).forEach(key => {
                if (this.state.hasOwnProperty(key)) {
                    if (typeof newState[key] === 'object') {
                        Object.assign(this.state[key], newState[key]);
                    } else {
                        this.state[key] = newState[key];
                    }
                }
            });
            console.log('✅ StatusBarsManager.setState() - Estado atualizado');
            
            // 🎨 Renderizar automaticamente após mudança de estado
            this.render();
        }
    },

    /**
     * Retorna o percentual de uma barra
     * @param {string} barType - Tipo da barra: 'hp', 'energy' ou 'fatigue'
     */
    getPercentage(barType) {
        const data = this.state[barType];
        return (data.current / data.max) * 100;
    },

    /**
     * Define o valor extra de um status
     * @param {string} statusType - 'hp', 'energy' ou 'fatigue'
     * @param {number} value - Valor extra
     */
    setExtra(statusType, value) {
        if (this.state.hasOwnProperty(statusType)) {
            this.state[statusType].extra = Math.max(0, value);
            console.log(`✏️  Extra de ${statusType} definido para: ${this.state[statusType].extra}`);
            this.render(); // 🎨 Renderizar automaticamente
        }
    },

    /**
     * Define o valor bonus de um status
     * @param {string} statusType - 'hp', 'energy' ou 'fatiga'
     * @param {number} value - Valor bonus
     */
    setBonus(statusType, value) {
        if (this.state.hasOwnProperty(statusType)) {
            this.state[statusType].bonus = Math.max(0, value);
            console.log(`✏️  Bonus de ${statusType} definido para: ${this.state[statusType].bonus}`);
            this.render(); // 🎨 Renderizar automaticamente
        }
    },

    // ============================================
    // UTILITÁRIOS
    // ============================================

    /**
     * Recalcula todos os máximos de status baseado nos atributos
     * Chamado quando aptidões mudam ou atributos são alterados
     */
    recalcularMaximos() {
        console.log(`\n🔍 ====== DIAGNÓSTICO recalcularMaximos() INÍCIO ======`);
        console.log(`   [ANTES] state.hp: current=${this.state.hp.current}, max=${this.state.hp.max}, extra=${this.state.hp.extra}, bonus=${this.state.hp.bonus}`);
        console.log(`   [ANTES] state.energy: current=${this.state.energy.current}, max=${this.state.energy.max}, extra=${this.state.energy.extra}, bonus=${this.state.energy.bonus}`);
        console.log(`   [ANTES] state.fatigue: current=${this.state.fatigue.current}, max=${this.state.fatigue.max}, extra=${this.state.fatigue.extra}, bonus=${this.state.fatigue.bonus}`);
        
        // ⭐ NOVO: Sincronizar bônus do BonusCalculator PRIMEIRO
        if (window.bonusCalculator && typeof window.bonusCalculator.getBonus === 'function') {
            const bonusSaude = window.bonusCalculator.getBonus('saude') || 0;
            const bonusEnergia = window.bonusCalculator.getBonus('energia') || 0;
            const bonusFadiga = window.bonusCalculator.getBonus('fadiga') || 0;
            
            console.log(`   Sincronizando bônus: HP ${this.state.hp.bonus}→${bonusSaude}, Energy ${this.state.energy.bonus}→${bonusEnergia}, Fadiga ${this.state.fatigue.bonus}→${bonusFadiga}`);
            
            this.state.hp.bonus = bonusSaude;
            this.state.energy.bonus = bonusEnergia;
            this.state.fatigue.bonus = bonusFadiga;
        }

        // Verificar se o atributosManager está disponível
        if (window.atributosManager) {
            console.log(`   Chamando atualizarSaudeMaxima()...`);
            // Atualizar todos os status máximos
            if (window.atributosManager.atualizarSaudeMaxima) {
                window.atributosManager.atualizarSaudeMaxima();
            }
            if (window.atributosManager.atualizarEnergiaMaxima) {
                console.log(`   Chamando atualizarEnergiaMaxima()...`);
                window.atributosManager.atualizarEnergiaMaxima();
            }
            if (window.atributosManager.atualizarFadigaMaxima) {
                console.log(`   Chamando atualizarFadigaMaxima()...`);
                window.atributosManager.atualizarFadigaMaxima();
            }
            
            console.log(`   [DEPOIS] state.hp: current=${this.state.hp.current}, max=${this.state.hp.max}, extra=${this.state.hp.extra}, bonus=${this.state.hp.bonus}`);
            console.log(`   [DEPOIS] state.energy: current=${this.state.energy.current}, max=${this.state.energy.max}, extra=${this.state.energy.extra}, bonus=${this.state.energy.bonus}`);
            console.log(`   [DEPOIS] state.fatigue: current=${this.state.fatigue.current}, max=${this.state.fatigue.max}, extra=${this.state.fatigue.extra}, bonus=${this.state.fatigue.bonus}`);
            console.log(`🔍 ====== DIAGNÓSTICO recalcularMaximos() FIM ======\n`);
            console.log('✅ Status máximos recalculados com sucesso');
        } else {
            console.warn('⚠️  AtributosManager não está disponível para recalcular status máximos');
        }
    },

    /**
     * Log formatado de atualizações
     */
    logBarUpdate(name, current, max) {
        const percentage = ((current / max) * 100).toFixed(1);
        console.log(`📊 ${name}: ${current}/${max} (${percentage}%)`);
    },
};

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// ⭐ NOVO: Exportar para window para que outros scripts acessem
window.statusBarsManager = StatusBarsManager;
window.StatusBarsManager = StatusBarsManager;

// Aguardar que o DOM esteja pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        StatusBarsManager.init();
    });
} else {
    // DOM já está pronto
    StatusBarsManager.init();
}
