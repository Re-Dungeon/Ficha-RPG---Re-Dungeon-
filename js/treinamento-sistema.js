/* ============================================ */
/* TREINAMENTO-SISTEMA.JS - Sistema Novo       */
/* Treinamento de Atributos com XP e Rolagem   */
/* ============================================ */

/**
 * Tabela de XP necessária por faixa de nível
 */
const TABELA_XP_NIVEIS = {
    '0-9': 10,
    '10-19': 20,
    '20-29': 25,
    '30-39': 30,
    '40-49': 35,
    '50-59': 40,
    '60-69': 45,
    '70-79': 50,
    '80-89': 55,
    '90-99': 60,
    '100-119': 70,
    '120-139': 80,
    '140-150': 90,
    'superior': 100
};

/**
 * NOVA Tabela de dados de experiência por resultado d6
 * O sistema agora usa 1d6 + bônus ao invés de 1d20
 */
const TABELA_DADO_XP_NOVO = {
    'critica-falha': '1d4',  // resultado <= 2
    'baixo': '1d6',          // resultado 3-4
    'medio': '1d8',          // resultado 5-6
    'critica-sucesso': '1d10' // resultado >= 7
};

/**
 * Conversão de dado para penalidade
 */
const DADO_CONVERSAO = {
    '1d20': '1d12',
    '1d12': '1d10',
    '1d10': '1d8',
    '1d8': '1d6',
    '1d6': '1d4',
    '1d4': 'falha' // 0 XP
};

/**
 * Atributos treináveis
 */
const ATRIBUTOS_TREINAVEIS = ['forca', 'vitalidade', 'agilidade', 'percepcao', 'inteligencia', 'sorte'];

/**
 * Mapeamento de atributos para aptidões relacionadas
 * Sistema detecta a aptidão com MAIOR BÔNUS entre as listadas
 * Fórmula de bônus: floor(nivelAptidao / 2)
 * 
 * Exemplo: Se jogador tem Atletismo nível 8 e Fôlego nível 6
 *          Para Força: pega Atletismo (+4) pois 8/2 > 6/2
 */
const MAPEAMENTO_ATRIBUTOS_APTIDOES = {
    forca: ['atletismo', 'ferraria', 'folego', 'unic skill', 'hakuda'],
    vitalidade: ['tolerancia', 'unic skill', 'reiatusu', 'resistencia espiritual', 'vontade'],
    agilidade: ['acrobacia', 'danca', 'prestidigitacao', 'unic skill', 'hoho'],
    percepcao: ['unic skill', 'reiraku', 'olho critico', 'percepcao', 'presentimento', 'intuicao'],
    inteligencia: ['arcanismo', 'compreensao', 'conhecimento', 'sobrevivencia', 'unic skill', 'conhecimento soul society'],
    sorte: ['unic skill']
};

/**
 * TreinamentoManager - Gerencia todo o sistema de treinamento
 */
class TreinamentoManager {
    constructor() {
        this.aptidoesDB = null;
        this.stateListener = null;
        this.stateWatcherInterval = null;
        this.init();
    }

    init() {
        console.log('✅ TreinamentoManager inicializado');
        this.inicializarAptidoesDB();
        this.setupStateStructure();
        this.setupDOM();
        this.setupListeners();
        this.setupStateWatcher();
    }

    /**
     * Inicializa o banco de dados de aptidões
     */
    async inicializarAptidoesDB() {
        try {
            if (window.aptidoesDB) {
                this.aptidoesDB = window.aptidoesDB;
                console.log('✅ AptidoesDB conectado');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao conectar AptidoesDB:', e);
        }
    }

    /**
     * Obtém o bônus de aptidão para um atributo específico
     * Fórmula: floor(nivelAptidao / 2)
     */
    async obterBonusAptidao(atributo) {
        try {
            if (!this.aptidoesDB) {
                return 0;
            }

            const aptidoesRelacionadas = MAPEAMENTO_ATRIBUTOS_APTIDOES[atributo] || [];
            
            if (aptidoesRelacionadas.length === 0) {
                return 0;
            }

            // Obter todas as aptidões do personagem
            const aptidoesPersonagem = await this.aptidoesDB.getAptidoesPersonagem();
            
            // Procurar a aptidão mais relevante com maior nível
            let maiorBonus = 0;
            
            for (const aptidao of aptidoesPersonagem) {
                if (aptidoesRelacionadas.includes(aptidao.id)) {
                    const bonus = Math.floor((aptidao.nivel || 0) / 2);
                    if (bonus > maiorBonus) {
                        maiorBonus = bonus;
                    }
                }
            }

            console.log(`📊 Bônus de aptidão para ${atributo}: +${maiorBonus}`);
            return maiorBonus;
        } catch (e) {
            console.warn(`⚠️ Erro ao obter bônus de aptidão para ${atributo}:`, e);
            return 0;
        }
    }

    /**
     * Configura a estrutura de dados no StateManager
     */
    setupStateStructure() {
        if (!window.appState) {
            console.error('❌ StateManager não disponível');
            return;
        }

        // Adicionar dados de treinamento ao state
        const state = window.appState.getState();
        
        if (!state.treinamento) {
            // Carregar dados do localStorage se existirem
            const treinamentoSalvo = localStorage.getItem('treinamento');
            let dadosIniciais = {
                atributos: {
                    forca: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    vitalidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    agilidade: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    percepcao: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    inteligencia: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 },
                    sorte: { nivel: 0, xpAtual: 0, xpNecessaria: 10, obstaculoAtual: 5 }
                },
                historico: []
            };

            // Se houver dados salvos, usar eles
            if (treinamentoSalvo) {
                try {
                    dadosIniciais = JSON.parse(treinamentoSalvo);
                    console.log('✅ Dados de treinamento restaurados do localStorage');
                } catch (e) {
                    console.warn('⚠️ Erro ao restaurar dados de treinamento:', e);
                }
            }

            window.appState.setState({ treinamento: dadosIniciais });
            console.log('✅ Estrutura de treinamento criada');
        }
    }

    /**
     * Configura o DOM da aba de treinamento
     */
    setupDOM() {
        const container = document.getElementById('rpg-content-treinamento');
        if (!container) {
            console.error('❌ Container de treinamento não encontrado');
            return;
        }

        // Limpar placeholder
        container.innerHTML = '';

        // Criar estrutura HTML
        const html = `
            <div class="treinamento-container">
                <!-- Botão Principal -->
                <div class="treinamento-hero">
                    <h2>Sistema de Treinamento</h2>
                    <button id="btn-treinar-atributo" class="btn-treinar-principal">
                        🏋️ Treinar Atributo
                    </button>
                </div>

                <!-- Grid de Atributos -->
                <div class="treinamento-atributos-grid" id="treinamento-grid">
                    <!-- Preenchido dinamicamente -->
                </div>

                <!-- Modal de Treinamento - NOVO VISUAL PREMIUM -->
                <div id="modal-treino" class="modal-treino hidden">
                    <div class="modal-treino__overlay"></div>
                    <div class="modal-treino__content">
                        <div class="modal-treino__header">
                            <div class="modal-treino__header-content">
                                <h3>⚔️ Treinar Atributo</h3>
                                <p>Melhore suas habilidades através do treinamento</p>
                            </div>
                            <button class="modal-treino__close" id="btn-fechar-modal">&times;</button>
                        </div>

                        <!-- CARD 1: Seleção de Atributo -->
                        <div class="treino-card treino-card--selecao">
                            <div class="treino-card__label">Escolha um Atributo</div>
                            <select id="select-atributo" class="treino-select">
                                <option value="">-- Selecione um atributo --</option>
                                ${ATRIBUTOS_TREINAVEIS.map(attr => 
                                    `<option value="${attr}">${this.nomeAtributo(attr)}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <!-- CARD 2: Status do Atributo -->
                        <div id="info-atributo" class="treino-card treino-card--status hidden">
                            <div class="treino-card__label">Status do Atributo</div>
                            <div class="status-grid">
                                <div class="status-item">
                                    <span class="status-label">Nível</span>
                                    <span class="status-valor" id="info-nivel">0</span>
                                </div>
                                <div class="status-item">
                                    <span class="status-label">Dificuldade</span>
                                    <span class="status-valor status-obstaculo" id="info-obstaculo">5</span>
                                </div>
                            </div>

                            <!-- Barra de Progresso de XP -->
                            <div class="xp-progress-section">
                                <div class="xp-header">
                                    <span class="xp-label">Progresso de Experiência</span>
                                    <span class="xp-valores"><span id="info-xp-atual">0</span> / <span id="info-xp-necessaria">10</span></span>
                                </div>
                                <div class="xp-progress-bar">
                                    <div class="xp-progress-fill" id="progress-fill" style="width: 0%"></div>
                                    <div class="xp-progress-glow"></div>
                                </div>
                            </div>
                        </div>

                        <!-- CARD 3: Tempo de Treinamento -->
                        <div class="treino-card treino-card--tempo">
                            <div class="treino-card__label">⏱️ Tempo de Treinamento</div>
                            <p class="treino-card__hint">Quanto tempo você deseja treinar?</p>
                            <div class="treino-horas-container">
                                <button id="btn-menos-horas" class="treino-btn-horas treino-btn-horas--menos">−</button>
                                <div class="treino-horas-display">
                                    <input type="number" id="input-horas" min="1" max="12" value="1" class="treino-input-horas">
                                    <span class="treino-horas-label">horas</span>
                                </div>
                                <button id="btn-mais-horas" class="treino-btn-horas treino-btn-horas--mais">+</button>
                            </div>
                            <div class="treino-horas-info">
                                <small>Mínimo: 1h | Máximo: 12h</small>
                            </div>
                        </div>

                        <!-- CARD 4: Bônus do Mestre -->
                        <div class="treino-card treino-card--bonus">
                            <div class="treino-card__label">🎯 Bônus do Mestre</div>
                            <p class="treino-card__hint">Modificador adicional aplicado manualmente</p>
                            <div class="treino-bonus-container">
                                <input type="number" id="input-bonus-extra" min="0" max="20" value="0" class="treino-input-bonus">
                                <span class="treino-bonus-range">(0–20)</span>
                            </div>
                        </div>

                        <!-- CARD 5: Botão de Ação -->
                        <button id="btn-iniciar-treino-modal" class="treino-btn-iniciar">
                            <span class="treino-btn-icon">▶</span>
                            <span class="treino-btn-text">Iniciar Treinamento</span>
                        </button>

                        <!-- Seção 3: Resultado (oculto inicialmente) -->
                        <div id="resultado-treino" class="modal-treino__resultado hidden">
                            <h4>Resultado do Treinamento</h4>
                            
                            <div class="resultado-item">
                                <span>Rolagem 1d6 + Bônus:</span>
                                <span class="resultado-valor" id="res-d20">-</span>
                            </div>

                            <div class="resultado-item">
                                <span>Obstáculo:</span>
                                <span class="resultado-valor" id="res-obstaculo">-</span>
                            </div>

                            <div class="resultado-item">
                                <span>Dado Definido:</span>
                                <span class="resultado-valor" id="res-dado">-</span>
                            </div>

                            <div class="resultado-item">
                                <span>Rolagem Final:</span>
                                <span class="resultado-valor" id="res-rolagem">-</span>
                            </div>

                            <div class="resultado-item">
                                <span>Bônus/Penalidade:</span>
                                <span class="resultado-valor" id="res-bonus">-</span>
                            </div>

                            <div class="resultado-item resultado-item--destaque">
                                <span>XP Ganho:</span>
                                <span class="resultado-valor" id="res-xp-ganho">-</span>
                            </div>

                            <button id="btn-fechar-resultado" class="btn-treino-acao">
                                ✓ Concluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.renderizarAtributos();
    }

    /**
     * Renderiza o grid de atributos
     * ✨ SINCRONIZADO COM ATTRIBUTES TAB (campo base)
     */
    renderizarAtributos() {
        const grid = document.getElementById('treinamento-grid');
        if (!grid) return;

        const state = window.appState.getState();
        const treino = state.treinamento?.atributos || {};

        let html = '';

        ATRIBUTOS_TREINAVEIS.forEach(atributo => {
            const dados = treino[atributo] || {};
            
            // ✨ SINCRONIZAR: Usar base da aba de Atributos como nivel
            const atributoData = state.atributos?.primarios?.[atributo];
            const nivelFromAttributes = atributoData?.base || 0;
            
            // ✨ RECALCULAR xpNecessaria de acordo com o nível atual
            const xpNecessariaCorreto = this.obterXPNecessario(nivelFromAttributes);
            
            // XP local (do treinamento)
            const xpAtual = dados.xpAtual || 0;
            const percentual = Math.min((xpAtual / xpNecessariaCorreto) * 100, 100);

            html += `
                <div class="atributo-card" data-atributo="${atributo}">
                    <div class="atributo-card__header">
                        <h3>${this.nomeAtributo(atributo)}</h3>
                        <span class="atributo-card__nivel">Nv. ${nivelFromAttributes}</span>
                    </div>

                    <div class="atributo-card__xp">
                        <div class="progress-bar">
                            <div class="progress-bar__fill" style="width: ${percentual}%"></div>
                        </div>
                        <small>${xpAtual} / ${xpNecessariaCorreto} XP</small>
                    </div>

                    <button class="btn-treinar-atributo" data-atributo="${atributo}">
                        Treinar
                    </button>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    /**
     * Configura listeners
     */
    setupListeners() {
        // DELEGAÇÃO - Usar container de treinamento como root
        const container = document.getElementById('rpg-content-treinamento');
        if (!container) {
            console.error('❌ Container de treinamento não encontrado para listeners');
            return;
        }

        // Botão principal de treino
        container.addEventListener('click', (e) => {
            // Botão principal
            if (e.target.id === 'btn-treinar-atributo') {
                console.log('🎯 Clique em btn-treinar-atributo');
                this.abrirModalTreino();
            }

            // Botões de treinar por atributo (do grid)
            if (e.target.classList.contains('btn-treinar-atributo')) {
                const atributo = e.target.dataset.atributo;
                console.log('🎯 Clique em btn-treinar-atributo com atributo:', atributo);
                this.abrirModalTreino(atributo);
            }

            // Fechar modal (X ou overlay)
            if (e.target.id === 'btn-fechar-modal' || e.target.classList.contains('modal-treino__overlay')) {
                console.log('🎯 Clique em fechar modal');
                this.fecharModal();
            }

            // Iniciar treino
            if (e.target.id === 'btn-iniciar-treino-modal') {
                console.log('🎯 Clique em btn-iniciar-treino-modal');
                this.executarTreino();
            }

            // Fechar resultado
            if (e.target.id === 'btn-fechar-resultado') {
                console.log('🎯 Clique em btn-fechar-resultado');
                this.fecharModal();
                this.renderizarAtributos();
            }

            // Mais horas
            if (e.target.id === 'btn-mais-horas') {
                console.log('🎯 Clique em btn-mais-horas');
                this.ajustarHoras(1);
            }

            // Menos horas
            if (e.target.id === 'btn-menos-horas') {
                console.log('🎯 Clique em btn-menos-horas');
                this.ajustarHoras(-1);
            }
        });

        // Mudanças em inputs/selects
        container.addEventListener('change', (e) => {
            // Select de atributo
            if (e.target.id === 'select-atributo') {
                console.log('🎯 Mudança em select-atributo:', e.target.value);
                this.atualizarInfoAtributo(e.target.value);
            }

            // Input de horas
            if (e.target.id === 'input-horas') {
                const value = parseInt(e.target.value) || 1;
                if (value < 1) e.target.value = 1;
                if (value > 12) e.target.value = 12;
            }
        });

        console.log('✅ Listeners configurados para container');
    }

    /**
     * ✨ MONITORA MUDANÇAS NO STATE
     * Atualiza o grid de treinamento automaticamente quando atributos mudam
     * Usa polling simples para garantir sincronização
     */
    setupStateWatcher() {
        if (!window.appState) return;

        // 🐛 FIX: Limpar watcher anterior se existir
        if (this.stateWatcherInterval) {
            clearInterval(this.stateWatcherInterval);
        }

        let ultimosValores = this.obterValoresAtuaisAtributos();

        // Polling a cada 500ms para detectar mudanças
        this.stateWatcherInterval = setInterval(() => {
            const novosValores = this.obterValoresAtuaisAtributos();

            // Verificar se houve mudança em algum atributo
            let houveMudanca = false;
            for (const attr of ATRIBUTOS_TREINAVEIS) {
                if (ultimosValores[attr] !== novosValores[attr]) {
                    houveMudanca = true;
                    console.log(`🔄 ${attr}: ${ultimosValores[attr]} → ${novosValores[attr]}`);
                    break;
                }
            }

            // Se houver mudança, sincronizar e renderizar
            if (houveMudanca) {
                ultimosValores = novosValores;
                
                // ✨ SINCRONIZAR dados de treinamento com tabela de XP
                this.sincronizarDadosTreinamento();
                
                // ✨ IMPORTANTE: Renderizar APÓS sincronizar
                const grid = document.getElementById('treinamento-grid');
                if (grid) {
                    this.renderizarAtributos();
                    console.log('✨ Grid de treinamento atualizado com XP correto');
                }
            }
        }, 500);

        console.log('👁️ State watcher ativado (polling 500ms)');
    }

    /**
     * Obtém valores atuais dos atributos primários (campo base)
     */
    obterValoresAtuaisAtributos() {
        if (!window.appState || typeof window.appState.getState !== 'function') {
            console.warn('⚠️ StateManager não disponível ao obter valores de atributos de treinamento');
            return {};
        }
        const state = window.appState.getState();
        const valores = {};
        
        ATRIBUTOS_TREINAVEIS.forEach(attr => {
            valores[attr] = state.atributos?.primarios?.[attr]?.base || 0;
        });

        return valores;
    }

    /**
     * ✨ SINCRONIZA os dados de treinamento com o nível atual (base do atributo)
     * Garante que xpNecessaria está correto de acordo com a tabela
     */
    sincronizarDadosTreinamento() {
        if (!window.appState || typeof window.appState.getState !== 'function') {
            console.warn('⚠️ StateManager não disponível ao sincronizar dados de treinamento');
            return;
        }
        const state = window.appState.getState();
        
        ATRIBUTOS_TREINAVEIS.forEach(atributo => {
            const atributoData = state.atributos?.primarios?.[atributo];
            const treinoData = state.treinamento?.atributos?.[atributo];
            
            if (atributoData && treinoData) {
                const nivelAtual = atributoData.base || 0;
                
                // Se o nível mudou, atualizar dados de treinamento
                if (treinoData.nivel !== nivelAtual) {
                    treinoData.nivel = nivelAtual;
                    treinoData.xpNecessaria = this.obterXPNecessario(nivelAtual);
                    treinoData.obstaculoAtual = 5 + (Math.floor(nivelAtual / 25) * 2);
                    console.log(`🔄 ${atributo}: Sincronizado com base (Nv. ${nivelAtual}, ${treinoData.xpNecessaria} XP próximo)`);
                }
            }
        });
        
        if (state.treinamento) {
            window.appState.setState({ treinamento: state.treinamento });
        }
    }

    /**
     * Abre modal de treinamento
     */
    abrirModalTreino(atributo = null) {
        const modal = document.getElementById('modal-treino');
        if (!modal) return;

        // ✨ SINCRONIZAR dados de treinamento ANTES de abrir o modal
        this.sincronizarDadosTreinamento();

        modal.classList.remove('hidden');
        const select = document.getElementById('select-atributo');
        const info = document.getElementById('info-atributo');

        // Se nenhum atributo foi passado, selecionar o primeiro por padrão
        let atributoParaSelecionar = atributo;
        
        if (!atributoParaSelecionar || !ATRIBUTOS_TREINAVEIS.includes(atributoParaSelecionar)) {
            // Auto-selecionar primeiro atributo
            atributoParaSelecionar = ATRIBUTOS_TREINAVEIS[0];
        }

        if (atributoParaSelecionar && ATRIBUTOS_TREINAVEIS.includes(atributoParaSelecionar)) {
            select.value = atributoParaSelecionar;
            this.atualizarInfoAtributo(atributoParaSelecionar);
        } else {
            info.classList.add('hidden');
        }

        // 🐛 FIX: Resetar resultado e todos os inputs
        document.getElementById('resultado-treino').classList.add('hidden');
        document.getElementById('input-horas').value = 1;
        document.getElementById('input-bonus-extra').value = 0;

        // 🔧 FALLBACK: Garantir que o botão de iniciar treino funcione mesmo na primeira tentativa
        // Adiciona um listener DIRETO no botão como fallback para garantir responsividade
        const btnIniciar = document.getElementById('btn-iniciar-treino-modal');
        if (btnIniciar && !btnIniciar.dataset.hasDirectListener) {
            btnIniciar.dataset.hasDirectListener = 'true';
            btnIniciar.addEventListener('click', (e) => {
                console.log('🎯 [FALLBACK DIRETO] Clique em btn-iniciar-treino-modal');
                this.executarTreino();
            });
        }

        // 🔧 FALLBACK: Fechar modal também com listener direto
        const btnFechar = document.getElementById('btn-fechar-modal');
        if (btnFechar && !btnFechar.dataset.hasDirectListener) {
            btnFechar.dataset.hasDirectListener = 'true';
            btnFechar.addEventListener('click', (e) => {
                console.log('🎯 [FALLBACK DIRETO] Clique em fechar modal');
                this.fecharModal();
            });
        }

        // 🔧 FALLBACK: Ajuste de horas
        const btnMaisHoras = document.getElementById('btn-mais-horas');
        if (btnMaisHoras && !btnMaisHoras.dataset.hasDirectListener) {
            btnMaisHoras.dataset.hasDirectListener = 'true';
            btnMaisHoras.addEventListener('click', (e) => {
                console.log('🎯 [FALLBACK DIRETO] Clique em btn-mais-horas');
                this.ajustarHoras(1);
            });
        }

        const btnMenosHoras = document.getElementById('btn-menos-horas');
        if (btnMenosHoras && !btnMenosHoras.dataset.hasDirectListener) {
            btnMenosHoras.dataset.hasDirectListener = 'true';
            btnMenosHoras.addEventListener('click', (e) => {
                console.log('🎯 [FALLBACK DIRETO] Clique em btn-menos-horas');
                this.ajustarHoras(-1);
            });
        }

        // 🔧 FALLBACK: Select de atributo
        const selectAtributo = document.getElementById('select-atributo');
        if (selectAtributo && !selectAtributo.dataset.hasDirectListener) {
            selectAtributo.dataset.hasDirectListener = 'true';
            selectAtributo.addEventListener('change', (e) => {
                console.log('🎯 [FALLBACK DIRETO] Mudança em select-atributo:', e.target.value);
                this.atualizarInfoAtributo(e.target.value);
            });
        }

        // 🔧 FALLBACK: Input de horas
        const inputHoras = document.getElementById('input-horas');
        if (inputHoras && !inputHoras.dataset.hasDirectListener) {
            inputHoras.dataset.hasDirectListener = 'true';
            inputHoras.addEventListener('change', (e) => {
                const value = parseInt(e.target.value) || 1;
                if (value < 1) e.target.value = 1;
                if (value > 12) e.target.value = 12;
                console.log('🎯 [FALLBACK DIRETO] Input horas ajustado para:', e.target.value);
            });
        }
    }

    /**
     * Fecha modal
     */
    fecharModal() {
        const modal = document.getElementById('modal-treino');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Atualiza informações do atributo selecionado
     * ✨ SINCRONIZA com base da aba de Atributos E TABELA DE XP
     */
    atualizarInfoAtributo(atributo) {
        const info = document.getElementById('info-atributo');
        if (!atributo) {
            info.classList.add('hidden');
            return;
        }

        const state = window.appState.getState();
        const dados = state.treinamento?.atributos?.[atributo];
        
        // ✨ Usar base da aba de Atributos como nível
        const atributoData = state.atributos?.primarios?.[atributo];
        const nivelFromAttributes = atributoData?.base || 0;
        
        // ✨ RECALCULAR xpNecessaria de acordo com a TABELA
        const xpNecessariaCorreto = this.obterXPNecessario(nivelFromAttributes);
        
        // ✨ RECALCULAR obstáculo de acordo com a fórmula: 5 + (nível / 25 * 2)
        const obstaculoCorreto = 5 + (Math.floor(nivelFromAttributes / 25) * 2);

        if (dados) {
            document.getElementById('info-nivel').textContent = nivelFromAttributes;
            document.getElementById('info-xp-atual').textContent = dados.xpAtual;
            document.getElementById('info-xp-necessaria').textContent = xpNecessariaCorreto;
            document.getElementById('info-obstaculo').textContent = obstaculoCorreto;

            const percentual = Math.min((dados.xpAtual / xpNecessariaCorreto) * 100, 100);
            const progressFill = document.getElementById('xp-progress-fill') || document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = percentual + '%';
            }

            info.classList.remove('hidden');
        }
    }

    /**
     * Ajusta horas de treinamento
     */
    ajustarHoras(delta) {
        const input = document.getElementById('input-horas');
        let valor = parseInt(input.value) || 1;
        valor += delta;
        if (valor < 1) valor = 1;
        if (valor > 12) valor = 12;
        input.value = valor;
    }

    /**
     * Executa o treinamento com novo sistema: 1d6 + bônus
     */
    async executarTreino() {
        const atributo = document.getElementById('select-atributo').value;
        const horas = parseInt(document.getElementById('input-horas').value) || 1;
        const bonusExtraManual = parseInt(document.getElementById('input-bonus-extra').value) || 0;

        if (!atributo) {
            alert('Por favor, selecione um atributo');
            return;
        }

        console.log(`🏋️ Iniciando treinamento de ${atributo}...`);

        // 1. Rolar 1d6 (nova mecânica)
        const d6Base = this.rolarDado(6);
        console.log(`1d6: ${d6Base}`);

        // 2. Obter bônus de aptidão (com try-catch para evitar travamentos)
        let bonusAptidao = 0;
        try {
            bonusAptidao = await this.obterBonusAptidao(atributo);
        } catch (e) {
            console.warn(`⚠️ Erro ao obter bônus de aptidão:`, e);
            bonusAptidao = 0;
        }

        // 3. Calcular bônus de Sorte: Total Sorte / 25 (arredondado para baixo)
        const state = window.appState?.getState?.() || {};
        const sorteTotalValor = state.atributos?.primarios?.sorte?.total || 0;
        const bonusSorte = Math.floor(sorteTotalValor / 25);

        // 4. Calcular resultado final (incluindo bônus de sorte)
        const resultadoFinal = d6Base + bonusAptidao + bonusExtraManual + bonusSorte;

        // Debug
        console.log(`📊 TREINAMENTO: 1d6(${d6Base}) + Aptidão(${bonusAptidao}) + Extra(${bonusExtraManual}) + Sorte(${bonusSorte}) = ${resultadoFinal}`);

        // 5. Obter obstáculo
        const dados = state.treinamento?.atributos?.[atributo];
        const atributoData = state.atributos?.primarios?.[atributo];
        const nivelAtual = atributoData?.base || 0;
        const obstaculo = 5 + (Math.floor(nivelAtual / 25) * 2);

        // 5. Definir dado de XP baseado no resultado
        let dadoXP = this.definirDadoXPPorResultado(resultadoFinal, obstaculo);

        // 6. Aplicar penalidade se necessário
        let temPenalidade = false;
        if (resultadoFinal < obstaculo) {
            dadoXP = this.aplicarPenalidade(dadoXP);
            temPenalidade = true;
        }

        // 7. Rolar dados de XP
        let xpRolado = 0;
        let rolagens = [];
        let descricaoDado = '';

        if (dadoXP !== 'falha') {
            const [numDados, tipoD] = this.parseDecimal(dadoXP);
            descricaoDado = `${horas}x ${dadoXP}`;
            for (let i = 0; i < horas; i++) {
                const resultado = this.rolarDado(tipoD);
                rolagens.push(resultado);
                xpRolado += resultado;
            }
        } else {
            descricaoDado = 'Falha Crítica';
        }

        // 8. Aplicar bônus se sucesso superior
        let temBonus = false;
        let xpFinal = xpRolado;

        if (resultadoFinal > obstaculo && xpRolado > 0) {
            const bonus = Math.ceil(xpRolado * 0.2);
            xpFinal = xpRolado + bonus;
            temBonus = true;
        }

        // 9. Adicionar XP ao atributo
        this.adicionarXPAtributo(atributo, xpFinal);

        // 10. Exibir resultado
        this.exibirResultado(d6Base, bonusAptidao, bonusExtraManual, bonusSorte, obstaculo, descricaoDado, rolagens, temPenalidade, temBonus, xpFinal);
    }

    /**
     * Rola um dado
     */
    rolarDado(lados) {
        return Math.floor(Math.random() * lados) + 1;
    }

    /**
     * Parsa um decimal como 1d6
     */
    parseDecimal(decimal) {
        const partes = decimal.split('d');
        return [parseInt(partes[0]), parseInt(partes[1])];
    }

    /**
     * NOVO: Define o dado de XP baseado no resultado final (1d6 + bônus)
     * ao invés de d20
     */
    definirDadoXPPorResultado(resultadoFinal, obstaculo) {
        // Se resultado é muito baixo, crítica falha
        if (resultadoFinal <= obstaculo - 3) return TABELA_DADO_XP_NOVO['critica-falha'];
        // Se resultado é abaixo do obstáculo
        if (resultadoFinal < obstaculo) return TABELA_DADO_XP_NOVO['baixo'];
        // Se resultado iguala obstáculo
        if (resultadoFinal === obstaculo) return TABELA_DADO_XP_NOVO['medio'];
        // Se resultado supera obstáculo
        return TABELA_DADO_XP_NOVO['critica-sucesso'];
    }

    /**
     * Aplica penalidade ao dado
     */
    aplicarPenalidade(dado) {
        return DADO_CONVERSAO[dado] || 'falha';
    }

    /**
     * Adiciona XP ao atributo e verifica subida de nível
     */
    adicionarXPAtributo(atributo, xp) {
        const state = window.appState.getState();
        const dados = state.treinamento?.atributos?.[atributo];
        const atributoData = state.atributos?.primarios?.[atributo];

        if (!dados) return;

        let xpAtual = dados.xpAtual + xp;
        let nivel = atributoData?.base || 0;  // ✨ SINCRONIZAR: usar base atual
        let xpNecessaria = this.obterXPNecessario(nivel);
        let houveLevelUp = false;

        // Verificar múltiplas subidas de nível
        while (xpAtual >= xpNecessaria) {
            xpAtual -= xpNecessaria;
            nivel += 1;
            houveLevelUp = true;

            // Calcular novo XP necessário BASEADO NO NOVO NÍVEL
            xpNecessaria = this.obterXPNecessario(nivel);

            // Atualizar campo base do atributo no state
            if (atributoData) {
                atributoData.base = nivel;
                atributoData.total = (atributoData.base || 0) + (atributoData.extra || 0) + (atributoData.bonus || 0);
            }

            // Recalcular obstáculo
            const novoObstaculo = 5 + (Math.floor(nivel / 25) * 2);
            dados.obstaculoAtual = novoObstaculo;
        }

        // Atualizar estado
        dados.xpAtual = xpAtual;
        dados.nivel = nivel;  // ✨ Sincronizar nivel local com base
        dados.xpNecessaria = xpNecessaria;  // ✨ Atualizar XP necessário para próximo nível

        console.log(`📊 ${atributo}: Nv. ${nivel} | XP: ${xpAtual}/${xpNecessaria}${houveLevelUp ? ' 🎉 LEVEL UP!' : ''}`);

        // 🐛 FIX: Atualizar ambos state de uma vez
        window.appState.setState({ 
            atributos: state.atributos,
            treinamento: state.treinamento 
        });
        this.salvarTrainamentoLocalStorage();
    }

    /**
     * Obtém XP necessário para um nível
     */
    obterXPNecessario(nivel) {
        if (nivel <= 9) return TABELA_XP_NIVEIS['0-9'];
        if (nivel <= 19) return TABELA_XP_NIVEIS['10-19'];
        if (nivel <= 29) return TABELA_XP_NIVEIS['20-29'];
        if (nivel <= 39) return TABELA_XP_NIVEIS['30-39'];
        if (nivel <= 49) return TABELA_XP_NIVEIS['40-49'];
        if (nivel <= 59) return TABELA_XP_NIVEIS['50-59'];
        if (nivel <= 69) return TABELA_XP_NIVEIS['60-69'];
        if (nivel <= 79) return TABELA_XP_NIVEIS['70-79'];
        if (nivel <= 89) return TABELA_XP_NIVEIS['80-89'];
        if (nivel <= 99) return TABELA_XP_NIVEIS['90-99'];
        if (nivel <= 119) return TABELA_XP_NIVEIS['100-119'];
        if (nivel <= 139) return TABELA_XP_NIVEIS['120-139'];
        if (nivel <= 150) return TABELA_XP_NIVEIS['140-150'];
        return TABELA_XP_NIVEIS['superior'];
    }

    /**
     * Exibe o resultado do treinamento com novo sistema (1d6 + bônus)
     */
    exibirResultado(d6Base, bonusAptidao, bonusExtraManual, bonusSorte, obstaculo, descDado, rolagens, temPenalidade, temBonus, xpFinal) {
        try {
            const resultado = document.getElementById('resultado-treino');
            if (!resultado) {
                console.error('❌ Elemento resultado-treino não encontrado');
                return;
            }

            const resultadoFinal = d6Base + bonusAptidao + bonusExtraManual + bonusSorte;
            const rolagemStr = rolagens.length > 0 ? rolagens.join(' + ') : '0';

            // 🐛 FIX: Melhor visualização de bônus/penalidade
            let descBonus = '-';
            if (temPenalidade) {
                descBonus = `❌ Penalidade aplicada`;
            } else if (temBonus) {
                descBonus = `✅ +20% de bônus`;
            } else if (resultadoFinal >= obstaculo) {
                descBonus = `✅ Sucesso!`;
            }

            // 🐛 FIX: Mostrar cálculo completo de forma clara
            let calculoCompleto = `1d6: ${d6Base}`;
            if (bonusAptidao > 0) calculoCompleto += ` + Apt: +${bonusAptidao}`;
            if (bonusExtraManual > 0) calculoCompleto += ` + Extra: +${bonusExtraManual}`;
            if (bonusSorte > 0) calculoCompleto += ` + Sorte: +${bonusSorte}`;
            calculoCompleto += ` = ${resultadoFinal}`;

            // Determinar cor e ícone de sucesso/falha
            const sucesso = resultadoFinal >= obstaculo;
            const iconStatus = sucesso ? '✅' : '❌';

            // Atualizar elementos com segurança
            const resD20 = document.getElementById('res-d20');
            if (resD20) resD20.textContent = calculoCompleto;
            
            // 🐛 FIX: Aplicar classe de sucesso/falha no item de obstáculo
            const resObstaculo = document.getElementById('res-obstaculo');
            if (resObstaculo) {
                const resObstaculoItem = resObstaculo.parentElement;
                resObstaculoItem.className = 'resultado-item';
                if (sucesso) {
                    resObstaculoItem.classList.add('resultado-item--sucesso');
                } else {
                    resObstaculoItem.classList.add('resultado-item--falha');
                }
                resObstaculo.textContent = `${obstaculo} (${iconStatus} ${sucesso ? 'Sucesso' : 'Falha'})`;
            }
            
            const resDado = document.getElementById('res-dado');
            if (resDado) resDado.textContent = descDado;
            
            const resRolagem = document.getElementById('res-rolagem');
            if (resRolagem) resRolagem.textContent = rolagemStr || 'Nenhum';
            
            const resBonus = document.getElementById('res-bonus');
            if (resBonus) resBonus.textContent = descBonus;
            
            const resXP = document.getElementById('res-xp-ganho');
            if (resXP) resXP.textContent = xpFinal > 0 ? `+${xpFinal} XP` : '0 XP (Falha)';

            resultado.classList.remove('hidden');
            console.log('✅ Resultado exibido com sucesso');
        } catch (e) {
            console.error('❌ Erro ao exibir resultado:', e);
            alert('Erro ao exibir resultado do treinamento. Veja o console para detalhes.');
        }
    }

    /**
     * Salva dados de treinamento no localStorage
     */
    salvarTrainamentoLocalStorage() {
        if (!window.localStorageManager) return;

        const state = window.appState.getState();
        if (state.treinamento) {
            localStorage.setItem('treinamento', JSON.stringify(state.treinamento));
        }
    }

    /**
     * Converte nome de atributo para formato legível
     */
    nomeAtributo(atributo) {
        const nomes = {
            forca: '💪 Força',
            vitalidade: '❤️ Vitalidade',
            agilidade: '⚡ Agilidade',
            percepcao: '👁️ Percepção',
            inteligencia: '🧠 Inteligência',
            sorte: '🍀 Sorte'
        };
        return nomes[atributo] || atributo;
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.treinamentoManager = new TreinamentoManager();

    // 🔄 SINCRONIZAÇÃO AUTOMÁTICA: Quando a aba de treinamento fica visível
    const treinamentoSection = document.getElementById('rpg-content-treinamento');
    if (treinamentoSection) {
        const observer = new MutationObserver(() => {
            if (treinamentoSection.classList.contains('content-section--active')) {
                console.log('📍 Aba de Treinamento ficou visível - atualizando dados...');
                if (window.treinamentoManager) {
                    window.treinamentoManager.renderizarAtributos();
                }
            }
        });

        observer.observe(treinamentoSection, { attributes: true, attributeFilter: ['class'] });
        console.log('👁️ Observer de aba ativado');
    }
});

