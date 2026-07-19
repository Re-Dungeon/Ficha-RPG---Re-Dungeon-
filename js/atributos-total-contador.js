/**
 * ATRIBUTOS TOTAL CONTADOR
 * Monitora e atualiza o total de atributos primários no centro do pentagrama
 * Sincroniza automaticamente quando há mudanças
 */

class AtributosTotalContador {
    constructor() {
        this.totalElement = document.getElementById('atributos-total-valor');
        this.ultimoTotal = 0;
        this.stateListener = null;
        this.init();
    }

    /**
     * Inicializa o contador
     */
    init() {
        if (!this.totalElement) {
            console.warn('⚠️ Elemento atributos-total-valor não encontrado');
            return;
        }

        console.log('✅ AtributosTotalContador inicializado');

        // Atualizar imediatamente
        this.atualizarTotal();

        // Monitorar mudanças no state
        if (window.appState) {
            this.setupStateListener();
        } else {
            // Se appState não está pronto, tentar novamente em breve
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
            this.atualizarTotal();
        }, 300);

        console.log('👁️ Listener de atributos ativado (polling 300ms)');
    }

    /**
     * Calcula e atualiza o total de atributos
     */
    atualizarTotal() {
        if (!window.appState) return;

        const state = window.appState.getState();
        const atributos = state.atributos?.primarios || {};

        // Calcular soma dos valores totais (ou base se não houver total)
        let total = 0;
        const atributosChave = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'percepcao', 'sorte'];

        atributosChave.forEach(atributo => {
            if (atributos[atributo]) {
                // Usar 'total' se disponível, senão usar 'base'
                const valor = atributos[atributo].total || atributos[atributo].base || 0;
                total += valor;
            }
        });

        // Atualizar apenas se houver mudança
        if (total !== this.ultimoTotal) {
            this.ultimoTotal = total;
            this.totalElement.textContent = total;
            
            console.log(`📊 Total de Atributos: ${total}`);
            
            // Adicionar animação de atualização
            this.animarAtualizacao();
        }
    }

    /**
     * Animação quando o valor muda
     */
    animarAtualizacao() {
        // Remover animação anterior
        this.totalElement.style.animation = 'none';
        
        // Forçar reflow para reiniciar a animação
        void this.totalElement.offsetWidth;
        
        // Aplicar animação suave de opacity ao invés de scale
        this.totalElement.style.animation = 'atributos-total-fade 0.4s ease-out';
    }
}

/**
 * Inicializar quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    window.atributosTotalContador = new AtributosTotalContador();
});

// Se o documento já foi carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.atributosTotalContador) {
            window.atributosTotalContador = new AtributosTotalContador();
        }
    });
} else {
    if (!window.atributosTotalContador) {
        window.atributosTotalContador = new AtributosTotalContador();
    }
}
