/* ============================================ */
/* STATE-MANAGER.JS - Gerenciador de Estado    */
/* Centralizado para a Aplicação               */
/* ============================================ */

/**
 * StateManager
 * Responsável por gerenciar o estado global da aplicação
 * Evita variáveis globais descontroladas
 * Preparado para expansão futura
 */

class StateManager {
    constructor() {
        // Estado inicial da aplicação
        this.state = {
            // Navegação Horizontal
            activeHorizontalRoute: 'atributos',
            horizontalRoutes: [
                'atributos',
                'aptidoes',
                'habilidades',
                'inventario',
                'treinamento',
                'companheiros'
            ],

            // Navegação Vertical
            activeVerticalRoute: 'info',
            verticalRoutes: [
                'info',
                'aptidoes',
                'itens',
                'classes',
                'racas'
            ],

            // Dados do Personagem (Estrutura para Futuro)
            character: {
                nome: '',
                classe: '',
                raca: '',
                nivel: 1,
                experiencia: 0
            },

            // Sistema de Informações do Jogador
            jogadorInfo: {
                nomePersonagem: 'Aventureiro Desconhecido',
                tituloPersonagem: 'Sem Título',
                classePersonagem: 'Guerreiro',
                racaPersonagem: 'Humano',
                origem: 'Desconhecida',
                afiliacao: 'Nenhuma',
                statusNarrativo: 'Ativo',
                notasAdicionais: '',
                background: ''
            },

            // Sistema de Reputação e Influência
            reputation: {
                // Reputação Global (Mundo) - formato novo V2
                mundo: {
                    fama: 0,
                    temor: 0,
                    valor: 0  // compatibilidade com sistema antigo
                },
                // Reputação Local (Região) - formato novo V2
                regiao: {
                    fama: 0,
                    temor: 0,
                    valor: 0  // compatibilidade com sistema antigo
                },
                // Histórico de mudanças (para futuro)
                history: [],
                // Timestamp da última mudança
                lastModified: null
            },

            // Sistema de Aptidões
            aptidoes: {
                atual: 0,
                ganhas: 0,
                maximo: 6,
                atributoProxima: 10,
                adicionalNiveis: 0,
                personagensList: [],
                vantagensList: []
            },

            // Sistema de Atributos
            atributos: {
                primarios: {
                    forca: { base: 0, extra: 0, bonus: 0, total: 0 },
                    vitalidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                    agilidade: { base: 0, extra: 0, bonus: 0, total: 0 },
                    inteligencia: { base: 0, extra: 0, bonus: 0, total: 0 },
                    percepcao: { base: 0, extra: 0, bonus: 0, total: 0 },
                    sorte: { base: 0, extra: 0, bonus: 0, total: 0 }
                },
                secundarios: {
                    prontidao: { base: 0, extra: 0, bonus: 0, total: 0 },
                    ataque: { base: 0, extra: 0, bonus: 0, total: 0 },
                    defesa: { base: 0, extra: 0, bonus: 0, total: 0 },
                    reacao: { base: 0, extra: 0, bonus: 0, total: 0 },
                    precisao: { base: 0, extra: 0, bonus: 0, total: 0 },
                    evasao: { base: 0, extra: 0, bonus: 0, total: 0 }
                }
            },

            // Status (Saúde, Energia, Fadiga)
            status: {
                hp: { atual: 101, maximo: 101 },
                energia: { atual: 101, maximo: 101 },
                fadiga: { atual: 0, maximo: 101 }
            },

            // Configurações (Estrutura para Futuro)
            settings: {
                tema: 'dark',
                idioma: 'pt-BR',
                som: true
            }
        };

        // Listeners para mudanças de estado
        this.listeners = [];
    }

    /**
     * Obtém o valor de uma chave no estado
     * @param {string} key - Chave do estado
     * @returns {*} Valor da chave
     */
    getState(key = null) {
        if (key === null) {
            return this.state;
        }
        return this.state[key] || null;
    }

    /**
     * Atualiza o estado E SALVA automaticamente em localStorage
     * @param {object} updates - Objeto com as atualizações
     */
    setState(updates) {
        // Validar entrada
        if (typeof updates !== 'object' || updates === null) {
            console.warn('setState recebeu um argumento inválido:', updates);
            return;
        }

        // Atualizar estado
        const stateAnterior = JSON.stringify(this.state);
        this.state = { ...this.state, ...updates };
        const stateNovo = JSON.stringify(this.state);

        // Se o estado mudou, salvar em localStorage
        if (stateAnterior !== stateNovo) {
            if (window.isLimpandoFicha) {
                console.log('💾 Salvamento em localStorage ignorado durante limpeza da ficha');
            } else {
                // Salvar automaticamente cada tipo de dado
                if (updates.atributos && window.localStorageManager) {
                    window.localStorageManager.saveAtributos(this.state.atributos);
                }
                if (updates.status && window.localStorageManager) {
                    window.localStorageManager.saveStatus(this.state.status);
                }
                if (updates.aptidoes && window.localStorageManager) {
                    window.localStorageManager.saveAptidoes(this.state.aptidoes);
                }
                if (updates.jogadorInfo && window.localStorageManager) {
                    window.localStorageManager.saveJogadorInfo(this.state.jogadorInfo);
                }
                if (updates.reputation && window.localStorageManager) {
                    window.localStorageManager.saveReputacao(this.state.reputation);
                }
                if (updates.activeVerticalRoute && window.localStorageManager) {
                    window.localStorageManager.saveRotaVertical(this.state.activeVerticalRoute);
                }
            }
        }

        // ⚠️ NEUTRALIZADO: Não notificar listeners
        // this.notifyListeners();
    }

    /**
     * Define a rota horizontal ativa
     * @param {string} routeId - ID da rota
     */
    setActiveHorizontalRoute(routeId) {
        if (this.state.horizontalRoutes.includes(routeId)) {
            this.setState({ activeHorizontalRoute: routeId });
        } else {
            console.warn(`Rota horizontal inválida: ${routeId}`);
        }
    }

    /**
     * Define a rota vertical ativa
     * @param {string} routeId - ID da rota
     */
    setActiveVerticalRoute(routeId) {
        if (this.state.verticalRoutes.includes(routeId)) {
            this.setState({ activeVerticalRoute: routeId });
        } else {
            console.warn(`Rota vertical inválida: ${routeId}`);
        }
    }

    /**
     * Obtém a rota horizontal ativa
     * @returns {string} ID da rota ativa
     */
    getActiveHorizontalRoute() {
        return this.state.activeHorizontalRoute;
    }

    /**
     * Obtém a rota vertical ativa
     * @returns {string} ID da rota ativa
     */
    getActiveVerticalRoute() {
        return this.state.activeVerticalRoute;
    }

    /**
     * Inscreve um listener para mudanças de estado
     * @param {function} callback - Função a ser chamada
     */
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    /**
     * Desinscreve um listener
     * @param {function} callback - Função a remover
     */
    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * Notifica todos os listeners sobre mudanças
     * ⚠️ NEUTRALIZADO - Não executa callbacks
     */
    notifyListeners() {
        // ⚠️ NEUTRALIZADO: Listeners desabilitados
        // Não dispara eventos ou cascata de atualizações
        return;
    }

    /**
     * Loga o estado atual (debug)
     */
    debugState() {
        console.group('🎮 Estado Atual');
        console.table(this.state);
        console.groupEnd();
    }

    /**
     * DESABILITADO - Aba de atributos antiga foi removida
     * Este método já não é necessário
     */
    atualizarModoAtributos() {
        // Método desabilitado - aba de atributos antiga removida
        return;
    }

    // ============================================
    // MÉTODOS DE REPUTAÇÃO
    // ============================================

    /**
     * Obtém a reputação total (soma de Mundo + Região)
     * @returns {number} Total de reputação
     */
    getTotalReputation() {
        const { mundo, regiao } = this.state.reputation;
        // Com o novo formato V2, usar o valor (máximo entre fama e temor)
        const mundoValor = mundo.valor || Math.max(mundo.fama || 0, mundo.temor || 0);
        const regiaoValor = regiao.valor || Math.max(regiao.fama || 0, regiao.temor || 0);
        return Math.min(mundoValor + regiaoValor, 100); // Máximo 100 agora
    }

    /**
     * Obtém o nível de reputação baseado na pontuação total
     * @returns {object} { nivel: 0-6, descricao: string }
     */
    getReputationLevel() {
        const total = this.getTotalReputation();
        const levels = [
            { range: [0, 9], nivel: 0, descricao: 'Desconhecido' },
            { range: [10, 19], nivel: 1, descricao: 'Reconhecido' },
            { range: [20, 29], nivel: 2, descricao: 'Promissor' },
            { range: [30, 39], nivel: 3, descricao: 'Respeitado' },
            { range: [40, 49], nivel: 4, descricao: 'Influente' },
            { range: [50, 50], nivel: 5, descricao: 'Lenda Viva' }
        ];

        const level = levels.find(l => total >= l.range[0] && total <= l.range[1]);
        return level || levels[0];
    }

    /**
     * Atualiza a reputação de Mundo
     * @param {number} value - Novo valor (0-50)
     * @returns {boolean} Sucesso
     */
    setMundoReputation(value) {
        const sanitized = Math.max(0, Math.min(parseInt(value) || 0, 50));
        
        const oldValue = this.state.reputation.mundo;
        if (oldValue === sanitized) return false;

        const updateObj = {
            reputation: {
                ...this.state.reputation,
                mundo: sanitized,
                lastModified: new Date().toISOString()
            }
        };

        // Registrar no histórico
        if (Array.isArray(updateObj.reputation.history)) {
            updateObj.reputation.history.push({
                tipo: 'mundo',
                antes: oldValue,
                depois: sanitized,
                timestamp: updateObj.reputation.lastModified
            });
        }

        this.setState(updateObj);
        console.log(`🌍 Reputação de Mundo atualizada: ${oldValue} → ${sanitized}`);
        return true;
    }

    /**
     * Atualiza a reputação de Região
     * @param {number} value - Novo valor (0-50)
     * @returns {boolean} Sucesso
     */
    setRegiaoReputation(value) {
        const sanitized = Math.max(0, Math.min(parseInt(value) || 0, 50));
        
        const oldValue = this.state.reputation.regiao;
        if (oldValue === sanitized) return false;

        const updateObj = {
            reputation: {
                ...this.state.reputation,
                regiao: sanitized,
                lastModified: new Date().toISOString()
            }
        };

        // Registrar no histórico
        if (Array.isArray(updateObj.reputation.history)) {
            updateObj.reputation.history.push({
                tipo: 'regiao',
                antes: oldValue,
                depois: sanitized,
                timestamp: updateObj.reputation.lastModified
            });
        }

        this.setState(updateObj);
        console.log(`🏰 Reputação de Região atualizada: ${oldValue} → ${sanitized}`);
        return true;
    }

    /**
     * Obtém a reputação atual
     * @returns {object} Reputação no novo formato V2
     */
    getReputation() {
        const level = this.getReputationLevel();
        return {
            mundo: {
                fama: this.state.reputation.mundo.fama || 0,
                temor: this.state.reputation.mundo.temor || 0,
                valor: this.state.reputation.mundo.valor || 0
            },
            regiao: {
                fama: this.state.reputation.regiao.fama || 0,
                temor: this.state.reputation.regiao.temor || 0,
                valor: this.state.reputation.regiao.valor || 0
            },
            total: this.getTotalReputation(),
            nivel: level.nivel,
            descricao: level.descricao
        };
    }

    /**
     * Define a reputação completamente
     * @param {object} data - Aceita dois formatos:
     *   - Antigo: { mundo: number, regiao: number }
     *   - Novo V2: { mundo: { fama, temor, valor }, regiao: { fama, temor, valor } }
     */
    setReputation(data) {
        if (typeof data !== 'object' || data === null) {
            console.warn('❌ setReputation: dados inválidos', data);
            return;
        }

        console.log('🔵 setReputation() chamado com dados:', data);

        let mundoFama = 0, mundoTemor = 0;
        let regiaoFama = 0, regiaoTemor = 0;

        // Detectar qual formato está sendo usado
        if (data.mundo && typeof data.mundo === 'object' && data.mundo.fama !== undefined) {
            // Formato novo V2: { mundo: { fama, temor, valor }, ... }
            console.log('📊 Detectado formato V2 (novo) - salvando fama E temor separadamente');
            mundoFama = Math.max(0, Math.min(parseInt(data.mundo.fama) || 0, 100));
            mundoTemor = Math.max(0, Math.min(parseInt(data.mundo.temor) || 0, 100));
            regiaoFama = Math.max(0, Math.min(parseInt(data.regiao.fama) || 0, 100));
            regiaoTemor = Math.max(0, Math.min(parseInt(data.regiao.temor) || 0, 100));
        } else {
            // Formato antigo: { mundo: number, regiao: number }
            console.log('📊 Detectado formato antigo - convertendo para novo');
            mundoFama = Math.max(0, Math.min(parseInt(data.mundo) || 0, 100));
            regiaoFama = Math.max(0, Math.min(parseInt(data.regiao) || 0, 100));
            mundoTemor = 0;
            regiaoTemor = 0;
        }

        console.log('✅ Valores após conversão:', { 
            mundoFama, mundoTemor, 
            regiaoFama, regiaoTemor 
        });

        this.setState({
            reputation: {
                mundo: {
                    fama: mundoFama,
                    temor: mundoTemor,
                    valor: Math.max(mundoFama, mundoTemor)
                },
                regiao: {
                    fama: regiaoFama,
                    temor: regiaoTemor,
                    valor: Math.max(regiaoFama, regiaoTemor)
                },
                history: this.state.reputation.history || [],
                lastModified: new Date().toISOString()
            }
        });

        console.log('✅ Estado atualizado. Nova reputação:', this.state.reputation);
    }

    /**
     * Limpa o histórico de reputação
     */
    clearReputationHistory() {
        this.setState({
            reputation: {
                ...this.state.reputation,
                history: []
            }
        });
    }

    // ============================================
    // MÉTODOS DE INFORMAÇÕES DO JOGADOR
    // ============================================

    /**
     * Obtém as informações do jogador
     * @returns {object} Objeto com informações do jogador
     */
    getJogadorInfo() {
        return this.state.jogadorInfo || {};
    }

    /**
     * Atualiza as informações do jogador
     * @param {object} updates - Objeto com atualizações
     */
    setJogadorInfo(updates) {
        if (typeof updates !== 'object' || updates === null) {
            console.warn('setJogadorInfo recebeu um argumento inválido:', updates);
            return;
        }

        this.setState({
            jogadorInfo: {
                ...this.state.jogadorInfo,
                ...updates
            }
        });
    }

    /**
     * Obtém um valor específico de jogadorInfo
     * @param {string} key - Chave a buscar
     * @returns {*} Valor da chave
     */
    getJogadorInfoValue(key) {
        return this.state.jogadorInfo?.[key] || null;
    }

    /**
     * Define um valor específico de jogadorInfo
     * @param {string} key - Chave a definir
     * @param {*} value - Valor a definir
     */
    setJogadorInfoValue(key, value) {
        this.setState({
            jogadorInfo: {
                ...this.state.jogadorInfo,
                [key]: value
            }
        });
    }

    // ============================================
    // MÉTODOS DE ATRIBUTOS
    // ============================================

    /**
     * Obtém todos os atributos
     * @returns {object} Objeto com primarios e secundarios
     */
    getAtributos() {
        return this.state.atributos || {};
    }

    /**
     * Obtém atributo primário específico
     * @param {string} atributo - Nome do atributo
     * @returns {object} Objeto com base, extra, bonus, total
     */
    getAtributoPrimario(atributo) {
        return this.state.atributos?.primarios?.[atributo] || null;
    }

    /**
     * Atualiza atributo primário
     * @param {string} atributo - Nome do atributo
     * @param {object} dados - { base, extra, bonus, total }
     */
    setAtributoPrimario(atributo, dados) {
        this.setState({
            atributos: {
                ...this.state.atributos,
                primarios: {
                    ...this.state.atributos.primarios,
                    [atributo]: {
                        ...this.state.atributos.primarios[atributo],
                        ...dados
                    }
                }
            }
        });
    }

    // ============================================
    // MÉTODOS DE APTIDÕES
    // ============================================

    /**
     * Obtém informações de aptidões
     * @returns {object} Objeto com aptidoes do personagem
     */
    getAptidoes() {
        return this.state.aptidoes || {};
    }

    /**
     * Atualiza informações de aptidões
     * @param {object} updates - Objeto com atualizações
     */
    setAptidoes(updates) {
        if (typeof updates !== 'object' || updates === null) {
            console.warn('setAptidoes recebeu um argumento inválido:', updates);
            return;
        }

        this.setState({
            aptidoes: {
                ...this.state.aptidoes,
                ...updates
            }
        });
    }

    /**
     * Recalcula os campos Máximo e Atributo p/ +1
     * ⚠️ NEUTRALIZADO - Não executa cálculos
     */
    recalcularAptidoes() {
        // ⚠️ NEUTRALIZADO: Sem recálculo
        return null;
    }

    // ============================================
    // PERSISTÊNCIA EM LOCALSTORAGE
    // ============================================

    /**
     * Carrega dados do localStorage e restaura no estado
     * Chamado ao inicializar a aplicação
     * 
     * ✅ ETAPA 2: Consolidação de Persistência F5-Safe
     * Todos os dados críticos são carregados aqui
     */
    loadFromLocalStorage() {
        // 🔒 BLOQUEIO ISOLADO: Não carregar dados APENAS se o botão "Limpar Ficha" foi clicado
        // ⚠️ MAS: Permitir se for uma importação em andamento
        const limpezaAtiva = sessionStorage.getItem('LIMPEZA_FICHA_ATIVA');
        const importacaoAtiva = sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA');
        
        if (limpezaAtiva && !importacaoAtiva) {
            console.log('🔒 [StateManager] Carregamento bloqueado - Limpeza em progresso');
            return false;
        }

        if (!window.localStorageManager) {
            console.warn('⚠️ LocalStorageManager não disponível');
            return false;
        }

        try {
            console.log('📂 [StateManager] Carregando dados do localStorage...');

            // ✅ 1. Carregar atributos
            const atributos = window.localStorageManager.loadAtributos();
            if (atributos) {
                this.setState({ atributos });
                console.log('✅ Atributos carregados');
            }

            // ✅ 2. Carregar status (HP, Energia, Fadiga)
            const status = window.localStorageManager.loadStatus();
            if (status) {
                this.setState({ status });
                console.log('✅ Status carregados');
            }

            // ✅ 3. Carregar aptidões
            const aptidoes = window.localStorageManager.loadAptidoes();
            if (aptidoes) {
                this.setState({ aptidoes });
                console.log('✅ Aptidões carregadas');
            }

            // ✅ 4. Carregar informações do jogador
            const jogadorInfo = window.localStorageManager.loadJogadorInfo();
            if (jogadorInfo) {
                this.setState({ jogadorInfo });
                console.log('✅ Info do jogador carregadas');
            }

            // ✅ 5. Carregar reputação
            const reputation = window.localStorageManager.loadReputacao();
            if (reputation) {
                this.setState({ reputation });
                console.log('✅ Reputação carregada');
            }

            // ✅ 6. Carregar rota vertical (sempre inicia com 'info' para evitar abrir modais ao recarregar)
            // Sempre reseta para 'info' ao carregar a página
            this.setState({ activeVerticalRoute: 'info' });
            console.log('✅ Rota vertical resetada para info ao recarregar');

            // ✅ 7. Registrar no window que imagem pode ser carregada
            // Será feito pelo PersonagemImageController
            console.log('✅ [StateManager] Pronto para carregar imagem do personagem');

            console.log('✅ [StateManager] Todos os dados foram carregados do localStorage com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar dados do localStorage:', error);
            return false;
        }
    }

    /**
     * Salva o estado atual em localStorage
     * Pode ser chamado em pontos-chave da aplicação
     */
    saveToLocalStorage() {
        if (!window.localStorageManager) {
            console.warn('⚠️ LocalStorageManager não disponível');
            return false;
        }

        try {
            const state = this.getState();

            // Salvar cada parte
            if (state.atributos) {
                window.localStorageManager.saveAtributos(state.atributos);
            }
            if (state.status) {
                window.localStorageManager.saveStatus(state.status);
            }
            if (state.aptidoes) {
                window.localStorageManager.saveAptidoes(state.aptidoes);
            }
            if (state.jogadorInfo) {
                window.localStorageManager.saveJogadorInfo(state.jogadorInfo);
            }
            if (state.reputation) {
                window.localStorageManager.saveReputacao(state.reputation);
            }
            if (state.activeVerticalRoute) {
                window.localStorageManager.saveRotaVertical(state.activeVerticalRoute);
            }

            console.log('💾 Estado salvo em localStorage com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar estado em localStorage:', error);
            return false;
        }
    }
}

// ======================================= //
// INSTÂNCIA GLOBAL                        //
// ======================================= //

// Instância global único do gerenciador de estado
// Acessível para outros scripts
const appState = new StateManager();

// Expor no window com ambos os nomes para compatibilidade
window.stateManager = appState;
window.appState = appState; // CRÍTICO: appState deve estar em window

// ======================================= //
// INICIALIZAÇÃO - Carregamento de Dados  //
// ======================================= //

/**
 * FLUXO DE INICIALIZAÇÃO (F5 SAFE)
 * 
 * Sequência ao recarregar página (F5):
 * 1. HTML carregado
 * 2. LocalStorageManager instanciado (primeiro script)
 * 3. StateManager instanciado (segundo script) → appState criado
 * 4. DOMContentLoaded disparado
 * 5. appState.loadFromLocalStorage() → restaura todos os dados
 * 6. Outros managers fazem seu init() → carregam dados do appState/localStorage
 * 7. UI renderizada com dados persistidos
 * 
 * ✅ RESULTADO: Zero perda de dados ao F5
 */

document.addEventListener('DOMContentLoaded', () => {
    // ======== ETAPA 1: CARREGAR DADOS ========
    console.log('\n🔄 [ETAPA 1] Iniciando carregamento de dados persistidos...');
    appState.loadFromLocalStorage();
    console.log('✅ [ETAPA 1] Dados persistidos carregados\n');

    // ======== ETAPA 2: INICIALIZAR MANAGERS ========
    // Outros scripts (atributos.js, nucleos-controller.js, etc)
    // fazem seu init() e carregam do localStorage/appState

    // Aplicar modo inicial (compatibilidade)
    appState.atualizarModoAtributos();

    // Observar mudanças de tamanho/visibilidade (para resize window)
    window.addEventListener('resize', () => {
        appState.atualizarModoAtributos();
    });

    // Observar mudanças na visibilidade da sidebar
    const sidebar = document.getElementById('rpg-vertical-bar-left');
    if (sidebar) {
        const observerConfig = { 
            attributes: true, 
            attributeFilter: ['style', 'class'],
            subtree: false
        };
        
        const observer = new MutationObserver(() => {
            appState.atualizarModoAtributos();
        });
        
        observer.observe(sidebar, observerConfig);
    }

    // Atualizar quando o estado vertical mudar (quando user clica em botões)
    appState.subscribe(() => {
        appState.atualizarModoAtributos();
    });

    console.log('✅ [INICIALIZAÇÃO] Sistema pronto para uso');
});

// Exportar para Node.js (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
