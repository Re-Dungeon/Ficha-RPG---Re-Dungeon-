/* ============================================ */
/* DIAGNOSTICO-UI-SYSTEMS.JS                    */
/* Monitora e recupera erros de inicialização   */
/* ============================================ */

class UISystemsDiagnostics {
    constructor() {
        this.checks = {};
        this.failedSystems = [];
        this.init();
    }

    init() {
        // Aguardar um pouco para deixar os sistemas carregarem
        setTimeout(() => {
            this.checkAllSystems();
            this.monitorSystems();
        }, 1000);
    }

    /**
     * Verifica todos os sistemas de UI
     */
    checkAllSystems() {
        const systems = [
            { name: 'racasUI', checker: () => window.racasUI && typeof window.racasUI.abrirModal === 'function' },
            { name: 'classesUI', checker: () => window.classesUI && typeof window.classesUI.abrirModal === 'function' },
            { name: 'sorteModal', checker: () => window.sorteModal && typeof window.sorteModal.open === 'function' },
            { name: 'sistemaCondicoes', checker: () => window.sistemaCondicoes && typeof window.sistemaCondicoes.abrirPopup === 'function' },
            { name: 'corpoImortalUI', checker: () => window.corpoImortalUI && typeof window.corpoImortalUI.abrir === 'function' },
            { name: 'cultivacao', checker: () => window.cultivacao && window.cultivacao.ui && typeof window.cultivacao.ui.abrir === 'function' },
            { name: 'aptidoesVisualPopup', checker: () => window.aptidoesVisualPopup && typeof window.aptidoesVisualPopup.open === 'function' }
        ];

        console.log('%c=== DIAGNÓSTICO DE SISTEMAS DE UI ===', 'color: #d4af55; font-size: 12px; font-weight: bold;');
        
        systems.forEach(({ name, checker }) => {
            const ok = checker();
            this.checks[name] = ok;
            const status = ok ? '✅' : '❌';
            console.log(`${status} ${name}`);
            if (!ok) this.failedSystems.push(name);
        });

        if (this.failedSystems.length === 0) {
            console.log('%c✨ Todos os sistemas operacionais ✨', 'color: #7ca3ed; font-size: 11px;');
        } else {
            console.warn(`⚠️ Sistemas com problemas: ${this.failedSystems.join(', ')}`);
        }
    }

    /**
     * Monitora sistemas continuamente
     */
    monitorSystems() {
        setInterval(() => {
            // Revalidar sistemas que falharam
            if (this.failedSystems.length > 0) {
                this.failedSystems = this.failedSystems.filter(name => {
                    const exists = this.checks[name];
                    if (!exists) {
                        // Tentar revalidar
                        const wasRecovered = this.revalidateSystem(name);
                        if (wasRecovered) {
                            console.log(`✅ ${name} foi recuperado!`);
                            return false; // Remove da lista de falhos
                        }
                    }
                    return true;
                });
            }
        }, 2000);
    }

    /**
     * Revalida um sistema específico
     */
    revalidateSystem(name) {
        const checkers = {
            'racasUI': () => window.racasUI && typeof window.racasUI.abrirModal === 'function',
            'classesUI': () => window.classesUI && typeof window.classesUI.abrirModal === 'function',
            'sorteModal': () => window.sorteModal && typeof window.sorteModal.open === 'function',
            'sistemaCondicoes': () => window.sistemaCondicoes && typeof window.sistemaCondicoes.abrirPopup === 'function',
            'corpoImortalUI': () => window.corpoImortalUI && typeof window.corpoImortalUI.abrir === 'function',
            'cultivacao': () => window.cultivacao && window.cultivacao.ui && typeof window.cultivacao.ui.abrir === 'function',
            'aptidoesVisualPopup': () => window.aptidoesVisualPopup && typeof window.aptidoesVisualPopup.open === 'function'
        };

        if (checkers[name]) {
            const ok = checkers[name]();
            this.checks[name] = ok;
            return ok;
        }
        return false;
    }

    /**
     * Gera relatório detalhado
     */
    getReport() {
        return {
            timestamp: new Date().toLocaleTimeString(),
            totalChecks: Object.keys(this.checks).length,
            passed: Object.values(this.checks).filter(v => v).length,
            failed: Object.values(this.checks).filter(v => !v).length,
            checks: this.checks
        };
    }
}

// Inicializar diagnóstico
window.uiDiagnostics = new UISystemsDiagnostics();

// Exportar para acesso em console
console.log('💡 Dica: execute window.uiDiagnostics.getReport() para ver diagnóstico completo');
