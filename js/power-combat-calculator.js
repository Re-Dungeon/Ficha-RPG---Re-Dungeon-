/**
 * POWER COMBAT CALCULATOR
 * Calcula o poder de combate baseado em atributos primários e secundários
 * Fórmula: PC = (Ataque + Defesa + Vida) × 1.5 + (Força + Vitalidade + Agilidade) × 0.8
 */

class PowerCombatCalculator {
    constructor() {
        this.pcElement = document.getElementById('power-combat-valor');
        this.ultimoPC = 0;
        this.valorPC = 0; // Armazenar o valor calculado para acesso externo
        this.onChangeCallback = null; // Callback para notificar mudanças
        this.init();
    }

    /**
     * Inicializa o calculador
     */
    init() {
        if (!this.pcElement) {
            console.warn('⚠️ Elemento power-combat-valor não encontrado');
            return;
        }

        console.log('✅ PowerCombatCalculator inicializado');

        // Atualizar imediatamente
        this.calcularPowerCombat();

        // Monitorar mudanças no state
        if (window.appState) {
            this.setupStateListener();
        } else {
            setTimeout(() => this.setupStateListener(), 500);
        }
    }

    /**
     * Configura listener para mudanças no state
     */
    setupStateListener() {
        if (!window.appState) {
            console.warn('⚠️ appState não disponível');
            return;
        }

        // Usar polling para detectar mudanças
        setInterval(() => {
            this.calcularPowerCombat();
        }, 300);

        console.log('👁️ Listener de Power Combat ativado (polling 300ms)');
    }

    /**
     * Calcula o Power Combat (Medida de Poder do Personagem)
     * Usa os valores TOTAIS dos atributos primários (com base + extra + bonus)
     * Também usa atributos secundários (ataque, defesa)
     */
    calcularPowerCombat() {
        if (!window.appState) return;

        const state = window.appState.getState();
        
        // Obter atributos secundários TOTAIS
        const secundarios = state.atributos?.secundarios || {};
        const ataque = secundarios.ataque?.total || 0;
        const defesa = secundarios.defesa?.total || 0;

        // Obter atributos primários TOTAIS (base + extra + bonus)
        // Estrutura: { base, extra, bonus, total }
        const primarios = state.atributos?.primarios || {};
        const forca = primarios.forca?.total || 0;
        const vitalidade = primarios.vitalidade?.total || 0;
        const agilidade = primarios.agilidade?.total || 0;

        // Fórmula de Power Combat (indicador de poder)
        const pc = Math.floor(
            (ataque + defesa) * 1.5 + 
            (forca + vitalidade + agilidade) * 0.8
        );

        // Atualizar apenas se houver mudança
        if (pc !== this.ultimoPC) {
            this.ultimoPC = pc;
            this.valorPC = pc; // Armazenar o valor para acesso externo
            this.pcElement.textContent = pc;
            
            console.log(`⚔️ Power Combat (Poder): ${pc}`);
            console.log(`   Ataque: ${ataque} | Defesa: ${defesa}`);
            console.log(`   Força: ${forca} | Vitalidade: ${vitalidade} | Agilidade: ${agilidade}`);
            
            // 🔔 Notificar listeners sobre a mudança
            this.notifyChange(pc);
        }
    }

    /**
     * Registrar callback para ser chamado quando Power Combat muda
     */
    onChange(callback) {
        this.onChangeCallback = callback;
        console.log('🔔 Callback de Power Combat registrado');
    }

    /**
     * Notificar listeners sobre mudança
     */
    notifyChange(novoValor) {
        if (typeof this.onChangeCallback === 'function') {
            this.onChangeCallback(novoValor);
        }
    }
}

/**
 * Inicializar quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    window.powerCombatCalculator = new PowerCombatCalculator();
});

// Se o documento já foi carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.powerCombatCalculator) {
            window.powerCombatCalculator = new PowerCombatCalculator();
        }
    });
} else {
    if (!window.powerCombatCalculator) {
        window.powerCombatCalculator = new PowerCombatCalculator();
    }
}
