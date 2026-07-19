/**
 * Gerenciador SVG de Atributos
 * Sincroniza valores com elementos SVG
 */

class SVGAtributosManager {
    constructor() {
        this.svgPrimarios = document.getElementById('svg-atributos-primarios');
        this.svgSecundarios = document.getElementById('svg-atributos-secundarios');
        
        this.atributosPrimarios = {
            forca: 18,
            vitalidade: 16,
            agilidade: 15,
            inteligencia: 14,
            percepcao: 17,
            sorte: 12
        };
        
        this.atributosSecundarios = {
            prontidao: 8,
            ataque: 20,
            defesa: 12,
            reacao: 14,
            precisao: 16,
            evasao: 10
        };
        
        this.init();
    }

    /**
     * Inicializa o gerenciador
     */
    init() {
        this.renderizarPrimarios();
        this.renderizarSecundarios();
        this.vincularEventos();
    }

    /**
     * Renderiza valores nos SVG primários
     */
    renderizarPrimarios() {
        if (!this.svgPrimarios) return;
        
        Object.entries(this.atributosPrimarios).forEach(([atributo, valor]) => {
            const grupo = this.svgPrimarios.querySelector(`#atributo-${atributo}`);
            if (grupo) {
                const textValor = grupo.querySelector('.atributo-texto-valor');
                if (textValor) {
                    textValor.textContent = valor;
                }
            }
        });
    }

    /**
     * Renderiza valores nos SVG secundários
     */
    renderizarSecundarios() {
        if (!this.svgSecundarios) return;
        
        Object.entries(this.atributosSecundarios).forEach(([atributo, valor]) => {
            const grupo = this.svgSecundarios.querySelector(`#atributo-${atributo}`);
            if (grupo) {
                const textValor = grupo.querySelector('.atributo-texto-valor');
                if (textValor) {
                    textValor.textContent = valor;
                }
            }
        });
    }

    /**
     * Atualiza um atributo primário
     * @param {string} atributo - Chave do atributo
     * @param {number} valor - Novo valor
     */
    atualizarPrimario(atributo, valor) {
        if (this.atributosPrimarios.hasOwnProperty(atributo)) {
            valor = Math.max(1, Math.min(20, valor));
            this.atributosPrimarios[atributo] = valor;
            
            const grupo = this.svgPrimarios.querySelector(`#atributo-${atributo}`);
            if (grupo) {
                const textValor = grupo.querySelector('.atributo-texto-valor');
                if (textValor) {
                    textValor.textContent = valor;
                    this.animarMudanca(grupo);
                }
            }
            
            this.sincronizarEstado();
        }
    }

    /**
     * Atualiza um atributo secundário
     * @param {string} atributo - Chave do atributo
     * @param {number} valor - Novo valor
     */
    atualizarSecundario(atributo, valor) {
        if (this.atributosSecundarios.hasOwnProperty(atributo)) {
            valor = Math.max(1, Math.min(20, valor));
            this.atributosSecundarios[atributo] = valor;
            
            const grupo = this.svgSecundarios.querySelector(`#atributo-${atributo}`);
            if (grupo) {
                const textValor = grupo.querySelector('.atributo-texto-valor');
                if (textValor) {
                    textValor.textContent = valor;
                    this.animarMudanca(grupo);
                }
            }
            
            this.sincronizarEstado();
        }
    }

    /**
     * Anima mudança de valor
     * @param {SVGElement} grupo - Grupo SVG do atributo
     */
    animarMudanca(grupo) {
        const circulo = grupo.querySelector('.atributo-circulo');
        if (circulo) {
            circulo.style.filter = 'drop-shadow(0 0 15px rgba(255, 200, 50, 0.9))';
            setTimeout(() => {
                circulo.style.filter = '';
            }, 600);
        }
    }

    /**
     * Sincroniza com estado global
     */
    sincronizarEstado() {
        if (window.appState) {
            window.appState.atributos = {
                primarios: { ...this.atributosPrimarios },
                secundarios: { ...this.atributosSecundarios }
            };
        }
    }

    /**
     * Obtém todos os atributos
     */
    obterTodos() {
        return {
            primarios: { ...this.atributosPrimarios },
            secundarios: { ...this.atributosSecundarios }
        };
    }

    /**
     * Exporta dados em JSON
     */
    exportarJSON() {
        return JSON.stringify(this.obterTodos(), null, 2);
    }

    /**
     * Importa dados de JSON
     */
    importarJSON(json) {
        try {
            const dados = JSON.parse(json);
            if (dados.primarios && dados.secundarios) {
                this.atributosPrimarios = dados.primarios;
                this.atributosSecundarios = dados.secundarios;
                this.renderizarPrimarios();
                this.renderizarSecundarios();
                this.sincronizarEstado();
                return true;
            }
        } catch (e) {
            console.error('Erro ao importar JSON:', e);
            return false;
        }
    }

    /**
     * Vincula eventos dos atributos
     */
    vincularEventos() {
        // Eventos para primários
        if (this.svgPrimarios) {
            this.svgPrimarios.querySelectorAll('.atributo-grupo').forEach(grupo => {
                grupo.addEventListener('click', (e) => {
                    const atributo = grupo.id.replace('atributo-', '');
                    this.mostrarEditor(atributo, 'primario');
                });
            });
            
            // Botão central primários
            const botaoPrimarios = this.svgPrimarios.querySelector('#botao-central-primarios');
            if (botaoPrimarios) {
                botaoPrimarios.addEventListener('click', () => {
                    console.log('Botão central primários clicado');
                });
            }
        }
        
        // Eventos para secundários
        if (this.svgSecundarios) {
            this.svgSecundarios.querySelectorAll('.atributo-grupo').forEach(grupo => {
                grupo.addEventListener('click', (e) => {
                    const atributo = grupo.id.replace('atributo-', '');
                    this.mostrarEditor(atributo, 'secundario');
                });
            });
            
            // Botão central secundários
            const botaoSecundarios = this.svgSecundarios.querySelector('#botao-central-secundarios');
            if (botaoSecundarios) {
                botaoSecundarios.addEventListener('click', () => {
                    console.log('Botão central secundários clicado');
                });
            }
        }
    }

    /**
     * Mostra editor de atributo
     * TODO: Implementar modal ou input inline
     */
    mostrarEditor(atributo, tipo) {
        console.log(`Editar ${tipo}: ${atributo}`);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.svgAtributosManager = new SVGAtributosManager();
});
