/**
 * 🏆 SISTEMA DE REPUTAÇÃO V2 - DUAL AXIS
 * 
 * Expande o sistema simples para um modelo complexo com 2 eixos:
 * ⭐ FAMA (boa reputação) 
 * ☠️ TEMOR (reputação negativa)
 * 
 * Mantém compatibilidade total com o sistema anterior.
 */

class ReputacaoV2 {
    constructor() {
        // Estrutura dual-axis (0-100 cada)
        this.dados = {
            mundo: { fama: 0, temor: 0 },
            regiao: { fama: 0, temor: 0 }
        };

        // Backup para cancelamento
        this.dadosOrigem = JSON.parse(JSON.stringify(this.dados));

        // Níveis descritivos (nova estrutura)
        this.niveisDescritivos = {
            fama: [
                { range: [0, 5], titulo: 'Desconhecido', desc: 'Ninguém sabe quem você é' },
                { range: [6, 10], titulo: 'Notado', desc: 'Algumas pessoas já ouviram falar' },
                { range: [11, 20], titulo: 'Reconhecido', desc: 'Muitos conhecem seu nome' },
                { range: [21, 30], titulo: 'Respeitado', desc: 'Você é bem conhecido' },
                { range: [31, 45], titulo: 'Famoso', desc: 'Sua reputação abre portas' },
                { range: [46, 60], titulo: 'Influente', desc: 'Sua presença é notada' },
                { range: [61, 75], titulo: 'Lendário', desc: 'Histórias sobre você se espalham' },
                { range: [76, 90], titulo: 'Mítico', desc: 'Você é quase uma lenda' },
                { range: [91, 100], titulo: 'Ícone Divino', desc: 'Você transcendeu a mortalidade' }
            ],
            temor: [
                { range: [0, 5], titulo: 'Desconhecido', desc: 'Você não inspira medo' },
                { range: [6, 10], titulo: 'Suspeito', desc: 'Alguns o veem com desconfiança' },
                { range: [11, 20], titulo: 'Perigoso', desc: 'As pessoas sabem ser cuidadosas' },
                { range: [21, 30], titulo: 'Temido', desc: 'As pessoas evitam conflito' },
                { range: [31, 45], titulo: 'Ameaça', desc: 'Seu nome causa preocupação' },
                { range: [46, 60], titulo: 'Terror', desc: 'Seu nome causa arrepios' },
                { range: [61, 75], titulo: 'Flagelo', desc: 'Você é uma ameaça conhecida' },
                { range: [76, 90], titulo: 'Cataclismo', desc: 'Você é o próprio caos' },
                { range: [91, 100], titulo: 'Entidade do Caos', desc: 'Você transcende o entendimento' }
            ]
        };

        // Limiares de efeitos
        this.efeitosPassivos = this.definirEfeitosPassivos();

        this.init();
    }

    init() {
        console.log('🏆 Inicializando ReputacaoV2...');
        this.carregarDados();
        this.criarModal();
        this.setupEventListeners();
        console.log('✅ ReputacaoV2 pronto!');
    }

    /**
     * Define os efeitos passivos baseados nos limiares
     */
    definirEfeitosPassivos() {
        return {
            fama: {
                6: [
                    '👁️ Sua presença começa a chamar atenção em ambientes sociais',
                    '🤝 NPCs tendem a tratá-lo com cordialidade básica'
                ],
                11: [
                    '👁️ Algumas pessoas já sabem quem você é',
                    '💬 Negociações fluem com mais abertura e interesse'
                ],
                21: [
                    '⭐ Comerciantes demonstram respeito em suas ofertas',
                    '🤝 NPCs se mostram mais receptivos e cooperativos',
                    '💬 Suas palavras passam a ter mais peso'
                ],
                31: [
                    '⭐ Lojas valorizam sua presença',
                    '🎁 Certos estabelecimentos liberam acesso diferenciado',
                    '⚔️ Aliados ocasionais podem surgir espontaneamente'
                ],
                46: [
                    '💎 Sua presença abre portas antes fechadas',
                    '🏰 Ambientes nobres permitem sua entrada',
                    '👥 Interações sociais geram maior impacto'
                ],
                61: [
                    '👑 Seu nome ecoa como uma lenda viva',
                    '🎭 Eventos e encontros podem surgir ao seu redor',
                    '🌟 Você é reconhecido instantaneamente',
                    '📜 Informações raras podem chegar até você'
                ],
                76: [
                    '⭐ Artefatos e itens raros reagem à sua presença',
                    '🏛️ Conhecimento antigo se torna acessível',
                    '💫 Suas ações deixam marcas duradouras',
                    '🎖️ Honrarias e títulos começam a surgir'
                ],
                91: [
                    '👑 Sua existência transcende o comum',
                    '🌟 Você é tratado como uma figura lendária viva',
                    '💎 O mundo reage à sua presença',
                    '🏰 Locais sagrados e proibidos se abrem para você'
                ]
            },
            temor: {
                6: [
                    '⚠️ Sua presença causa desconforto sutil',
                    '😐 NPCs agem com cautela ao lidar com você'
                ],
                11: [
                    '⚠️ Você é visto como alguém arriscado',
                    '😰 Pessoas evitam proximidade desnecessária',
                    '🚫 Alguns locais impõem restrições à sua presença'
                ],
                21: [
                    '😨 Sua reputação começa a intimidar naturalmente',
                    '🚫 Indivíduos mais fracos evitam confrontos',
                    '⚔️ Sua postura influencia o combate'
                ],
                31: [
                    '🔥 Sua presença impõe medo direto',
                    '🏃 Inimigos fracos evitam permanecer perto',
                    '😱 NPCs demonstram nervosismo evidente'
                ],
                46: [
                    '💀 Você inspira verdadeiro pavor',
                    '🏃 Oponentes hesitam ou recuam',
                    '🌑 Uma aura pesada acompanha seus passos'
                ],
                61: [
                    '👿 Seu nome é evitado',
                    '🌑 Sua presença carrega sensação de morte',
                    '💀 Interações sociais tornam-se hostis ou inexistentes'
                ],
                76: [
                    '💀 Sua existência é vista como desastre',
                    '🌑 Ambientes se tornam tensos ao seu redor',
                    '⚡ Inimigos entram em pânico facilmente'
                ],
                91: [
                    '⚡ Você deixou de ser visto como humano',
                    '🌑 Sua presença distorce o ambiente',
                    '😱 O medo precede sua chegada'
                ]
            }
        };
    }

    /**
     * Carrega dados do appState ou localStorage
     */
    carregarDados() {
        console.log('📂 CARREGAR DADOS chamado');
        
        const state = window.appState || window.stateManager;
        
        console.log('1️⃣ StateManager disponível?', !!state);
        
        if (state) {
            console.log('   - Tipo:', typeof state);
            console.log('   - getReputation existe?', typeof state.getReputation === 'function');
        }
        
        if (state && typeof state.getReputation === 'function') {
            try {
                const repObtida = state.getReputation();
                console.log('2️⃣ Dados obtidos do StateManager:', repObtida);
                
                if (repObtida) {
                    // Converter dados do StateManager (formato antigo: mundo/regiao como números)
                    // para o novo formato V2 (mundo/regiao como objetos com fama e temor)
                    
                    if (repObtida.mundo && typeof repObtida.mundo === 'number') {
                        // Sistema antigo: mundo e regiao são números simples
                        console.log('🔄 Convertendo do formato antigo (números)');
                        this.dados.mundo = { 
                            fama: repObtida.mundo || 0, 
                            temor: 0 
                        };
                        this.dados.regiao = { 
                            fama: repObtida.regiao || 0, 
                            temor: 0 
                        };
                    } else if (repObtida.mundo && typeof repObtida.mundo === 'object' && repObtida.mundo.fama !== undefined) {
                        // Sistema novo V2: já está no formato correto
                        console.log('✅ Formato V2 já presente');
                        this.dados.mundo = { ...repObtida.mundo };
                        this.dados.regiao = { ...repObtida.regiao };
                    } else {
                        console.warn('⚠️ Formato desconhecido:', repObtida);
                    }
                } else {
                    console.warn('⚠️ getReputation retornou null/undefined');
                }
            } catch (erro) {
                console.error('❌ Erro ao carregar dados do StateManager:', erro);
            }
        } else {
            console.warn('⚠️ StateManager ou getReputation não disponível');
        }

        this.dadosOrigem = JSON.parse(JSON.stringify(this.dados));
        console.log('✅ CARREGAMENTO COMPLETO:');
        console.log('   - Dados atuais:', this.dados);
        console.log('   - Dados origem:', this.dadosOrigem);
    }

    /**
     * Cria o HTML do modal V2
     */
    criarModal() {
        const existente = document.getElementById('rep-modal-v2');
        if (existente) existente.remove();

        const modalHTML = `
            <div id="rep-modal-v2-overlay" class="rep-overlay-v2">
                <div class="rep-modal-v2">
                    <!-- HEADER -->
                    <header class="rep-header-v2">
                        <h1 class="rep-titulo-v2">⚔️ REPUTAÇÃO</h1>
                        <button class="rep-close-v2" id="rep-close-v2">✕</button>
                    </header>

                    <div class="rep-divider-v2"></div>

                    <!-- SEÇÃO 1: VISÃO GERAL -->
                    <section class="rep-section-visao-v2">
                        <h2 class="rep-section-title-v2">Sua Identidade</h2>
                        
                        <div class="rep-status-atual-v2">
                            <div class="rep-status-box-v2" id="rep-status-mundo-v2">
                                <h3 class="rep-status-tipo-v2">🌍 MUNDO</h3>
                                <p class="rep-status-nome-v2" id="rep-status-nome-mundo-v2">Desconhecido</p>
                                
                                <!-- Barras duplas -->
                                <div class="rep-bars-container-v2">
                                    <!-- Barra de Fama -->
                                    <div class="rep-bar-wrapper-v2">
                                        <label class="rep-bar-label-v2">⭐ Fama</label>
                                        <div class="rep-bar-v2 rep-bar-fama-v2">
                                            <div class="rep-bar-fill-v2" id="rep-bar-fama-mundo-v2" style="width: 0%"></div>
                                            <span class="rep-bar-value-v2" id="rep-fama-mundo-text-v2">0</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Barra de Temor -->
                                    <div class="rep-bar-wrapper-v2">
                                        <label class="rep-bar-label-v2">☠️ Temor</label>
                                        <div class="rep-bar-v2 rep-bar-temor-v2">
                                            <div class="rep-bar-fill-v2" id="rep-bar-temor-mundo-v2" style="width: 0%"></div>
                                            <span class="rep-bar-value-v2" id="rep-temor-mundo-text-v2">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="rep-status-box-v2" id="rep-status-regiao-v2">
                                <h3 class="rep-status-tipo-v2">📍 REGIÃO</h3>
                                <p class="rep-status-nome-v2" id="rep-status-nome-regiao-v2">Desconhecido</p>
                                
                                <!-- Barras duplas -->
                                <div class="rep-bars-container-v2">
                                    <!-- Barra de Fama -->
                                    <div class="rep-bar-wrapper-v2">
                                        <label class="rep-bar-label-v2">⭐ Fama</label>
                                        <div class="rep-bar-v2 rep-bar-fama-v2">
                                            <div class="rep-bar-fill-v2" id="rep-bar-fama-regiao-v2" style="width: 0%"></div>
                                            <span class="rep-bar-value-v2" id="rep-fama-regiao-text-v2">0</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Barra de Temor -->
                                    <div class="rep-bar-wrapper-v2">
                                        <label class="rep-bar-label-v2">☠️ Temor</label>
                                        <div class="rep-bar-v2 rep-bar-temor-v2">
                                            <div class="rep-bar-fill-v2" id="rep-bar-temor-regiao-v2" style="width: 0%"></div>
                                            <span class="rep-bar-value-v2" id="rep-temor-regiao-text-v2">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div class="rep-divider-v2"></div>

                    <!-- SEÇÃO 2: CONTROLE -->
                    <section class="rep-section-controle-v2">
                        <h2 class="rep-section-title-v2">Ajustes</h2>
                        
                        <div class="rep-inputs-grid-v2">
                            <!-- MUNDO -->
                            <div class="rep-input-group-v2">
                                <h4 class="rep-input-label-v2">🌍 MUNDO</h4>
                                <div class="rep-input-pair-v2">
                                    <div class="rep-input-field-v2">
                                        <label>⭐ Fama</label>
                                        <input type="number" id="rep-input-fama-mundo" class="rep-input-v2" min="0" max="100" value="0">
                                    </div>
                                    <div class="rep-input-field-v2">
                                        <label>☠️ Temor</label>
                                        <input type="number" id="rep-input-temor-mundo" class="rep-input-v2" min="0" max="100" value="0">
                                    </div>
                                </div>
                            </div>

                            <!-- REGIÃO -->
                            <div class="rep-input-group-v2">
                                <h4 class="rep-input-label-v2">📍 REGIÃO</h4>
                                <div class="rep-input-pair-v2">
                                    <div class="rep-input-field-v2">
                                        <label>⭐ Fama</label>
                                        <input type="number" id="rep-input-fama-regiao" class="rep-input-v2" min="0" max="100" value="0">
                                    </div>
                                    <div class="rep-input-field-v2">
                                        <label>☠️ Temor</label>
                                        <input type="number" id="rep-input-temor-regiao" class="rep-input-v2" min="0" max="100" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div class="rep-divider-v2"></div>

                    <!-- SEÇÃO 3: IMPACTO -->
                    <section class="rep-section-impacto-v2">
                        <h2 class="rep-section-title-v2">Efeitos Passivos</h2>
                        
                        <div class="rep-efeitos-container-v2">
                            <div class="rep-efeitos-box-v2" id="rep-efeitos-fama-v2">
                                <h4 class="rep-efeitos-title-v2">⭐ Por Fama</h4>
                                <ul class="rep-efeitos-list-v2" id="rep-efeitos-fama-list-v2">
                                    <li class="rep-efeito-vazio-v2">Sem bônus ainda</li>
                                </ul>
                            </div>
                            
                            <div class="rep-efeitos-box-v2" id="rep-efeitos-temor-v2">
                                <h4 class="rep-efeitos-title-v2">☠️ Por Temor</h4>
                                <ul class="rep-efeitos-list-v2" id="rep-efeitos-temor-list-v2">
                                    <li class="rep-efeito-vazio-v2">Sem bônus ainda</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div class="rep-divider-v2"></div>

                    <!-- FOOTER -->
                    <footer class="rep-footer-v2">
                        <button class="rep-btn-cancel-v2" id="rep-cancel-v2">CANCELAR</button>
                        <button class="rep-btn-save-v2" id="rep-save-v2">SALVAR</button>
                    </footer>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar listeners do modal após criá-lo
        this.setupModalListeners();
    }

    /**
     * Setup dos event listeners
     */
    setupEventListeners() {
        // Botão de abrir (mantém compatibilidade com ID antigo)
        document.querySelector('#reputacao-btn')?.addEventListener('click', () => this.abrir());

        // Setup dos listeners do modal após criação
        this.setupModalListeners();
    }

    /**
     * Setup dos listeners do modal (chamado após criarModal)
     */
    setupModalListeners() {
        // Fechar
        document.querySelector('#rep-close-v2')?.addEventListener('click', () => this.fechar());
        document.querySelector('#rep-cancel-v2')?.addEventListener('click', () => this.fechar());
        document.querySelector('#rep-modal-v2-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'rep-modal-v2-overlay') this.fechar();
        });

        // Inputs - Mundo
        const inputFamaMundo = document.querySelector('#rep-input-fama-mundo');
        if (inputFamaMundo) {
            inputFamaMundo.addEventListener('input', (e) => {
                const valor = Math.max(0, Math.min(parseInt(e.target.value) || 0, 100));
                this.dados.mundo.fama = valor;
                console.log('📝 Fama Mundo alterada para:', valor, 'Dados completos:', this.dados);
                this.atualizarVisao();
            });
        }

        const inputTemorMundo = document.querySelector('#rep-input-temor-mundo');
        if (inputTemorMundo) {
            inputTemorMundo.addEventListener('input', (e) => {
                const valor = Math.max(0, Math.min(parseInt(e.target.value) || 0, 100));
                this.dados.mundo.temor = valor;
                console.log('📝 Temor Mundo alterado para:', valor, 'Dados completos:', this.dados);
                this.atualizarVisao();
            });
        }

        // Inputs - Região
        const inputFamaRegiao = document.querySelector('#rep-input-fama-regiao');
        if (inputFamaRegiao) {
            inputFamaRegiao.addEventListener('input', (e) => {
                const valor = Math.max(0, Math.min(parseInt(e.target.value) || 0, 100));
                this.dados.regiao.fama = valor;
                console.log('📝 Fama Região alterada para:', valor, 'Dados completos:', this.dados);
                this.atualizarVisao();
            });
        }

        const inputTemorRegiao = document.querySelector('#rep-input-temor-regiao');
        if (inputTemorRegiao) {
            inputTemorRegiao.addEventListener('input', (e) => {
                const valor = Math.max(0, Math.min(parseInt(e.target.value) || 0, 100));
                this.dados.regiao.temor = valor;
                console.log('📝 Temor Região alterado para:', valor, 'Dados completos:', this.dados);
                this.atualizarVisao();
            });
        }

        // Salvar - COM BIND PARA MANTER CONTEXT
        const btnSalvar = document.querySelector('#rep-save-v2');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔵 Botão SALVAR clicado - evento disparado');
                console.log('📊 Estado atual dos dados ANTES de salvar:', this.dados);
                this.salvar();
            });
            console.log('✅ Event listener de salvar adicionado ao botão');
        } else {
            console.error('❌ Botão de salvar (#rep-save-v2) não encontrado!');
        }
    }

    /**
     * Abre o modal
     */
    abrir() {
        console.log('🟦 ABRIR() chamado');
        this.carregarDados();
        console.log('📊 Dados após carregar:', this.dados);
        
        this.atualizarInputs();
        console.log('✅ Inputs atualizados');
        
        this.atualizarVisao();
        console.log('✅ Visão atualizada');
        
        const overlay = document.querySelector('#rep-modal-v2-overlay');
        if (overlay) {
            overlay.classList.add('rep-active-v2');
            console.log('✅ Modal aberto');
        } else {
            console.error('❌ Overlay não encontrado!');
        }
    }

    /**
     * Fecha o modal
     */
    fechar() {
        const overlay = document.querySelector('#rep-modal-v2-overlay');
        if (overlay) {
            overlay.classList.remove('rep-active-v2');
        }
    }

    /**
     * Atualiza os inputs com os dados
     */
    atualizarInputs() {
        const mundo_fama = document.querySelector('#rep-input-fama-mundo');
        const mundo_temor = document.querySelector('#rep-input-temor-mundo');
        const regiao_fama = document.querySelector('#rep-input-fama-regiao');
        const regiao_temor = document.querySelector('#rep-input-temor-regiao');
        
        console.log('🔍 Inputs encontrados:', {
            mundo_fama: !!mundo_fama,
            mundo_temor: !!mundo_temor,
            regiao_fama: !!regiao_fama,
            regiao_temor: !!regiao_temor
        });

        if (mundo_fama) mundo_fama.value = this.dados.mundo.fama;
        if (mundo_temor) mundo_temor.value = this.dados.mundo.temor;
        if (regiao_fama) regiao_fama.value = this.dados.regiao.fama;
        if (regiao_temor) regiao_temor.value = this.dados.regiao.temor;
        
        console.log('✅ Valores de input atualizados:', {
            mundo: { fama: mundo_fama?.value, temor: mundo_temor?.value },
            regiao: { fama: regiao_fama?.value, temor: regiao_temor?.value }
        });
    }

    /**
     * Atualiza a visão geral (barras, status, efeitos)
     */
    atualizarVisao() {
        // Mundo
        this.atualizarBoxStatus('mundo');
        // Região
        this.atualizarBoxStatus('regiao');
        // Efeitos
        this.atualizarEfeitos();
    }

    /**
     * Atualiza um box de status (mundo ou região)
     */
    atualizarBoxStatus(tipo) {
        const dados = this.dados[tipo];
        const nivelFama = this.obterNivel(dados.fama, 'fama');
        const nivelTemor = this.obterNivel(dados.temor, 'temor');
        const statusHibrido = this.calcularStatusAtual(dados.fama, dados.temor);
        
        // Determinar qual status mostrar (híbrido tem prioridade)
        let statusPrincipal = statusHibrido;
        
        // Se não for híbrido, mostrar o que tiver mais valor
        if (!statusHibrido.classe.includes('entidade') && 
            !statusHibrido.classe.includes('paradoxo') && 
            !statusHibrido.classe.includes('ambiguo')) {
            if (dados.fama > dados.temor) {
                statusPrincipal = {
                    nome: nivelFama.titulo,
                    classe: `fama-${nivelFama.range[0]}`,
                    descricao: nivelFama.desc
                };
            } else if (dados.temor > dados.fama) {
                statusPrincipal = {
                    nome: nivelTemor.titulo,
                    classe: `temor-${nivelTemor.range[0]}`,
                    descricao: nivelTemor.desc
                };
            }
        }
        
        // Atualizar nome do status
        document.querySelector(`#rep-status-nome-${tipo}-v2`).textContent = statusPrincipal.nome;
        
        // Atualizar barras
        document.querySelector(`#rep-bar-fama-${tipo}-v2`).style.width = `${dados.fama}%`;
        document.querySelector(`#rep-fama-${tipo}-text-v2`).textContent = dados.fama;
        
        document.querySelector(`#rep-bar-temor-${tipo}-v2`).style.width = `${dados.temor}%`;
        document.querySelector(`#rep-temor-${tipo}-text-v2`).textContent = dados.temor;

        // Aplicar cor baseada no status
        const statusBox = document.querySelector(`#rep-status-${tipo}-v2`);
        statusBox.className = `rep-status-box-v2 rep-status-${statusPrincipal.classe}-v2`;
    }

    /**
     * Calcula o status atual baseado em fama e temor
     * Retorna: { nome, classe, descricao }
     */
    calcularStatusAtual(fama, temor) {
        const diferenca = Math.abs(fama - temor);
        
        // Estados Híbridos (diferença ≤ 10 entre fama e temor)
        if (diferenca <= 10) {
            if (fama >= 75 && temor >= 75) {
                return {
                    nome: '🌌 Lenda Fragmentada',
                    classe: 'lenda-fragmentada',
                    descricao: 'Sua existência é um paradoxo vivo'
                };
            } else if (fama >= 65 && temor >= 65) {
                return {
                    nome: '🕊️ Arauto do Caos',
                    classe: 'arauto-caos',
                    descricao: 'Você traz ordem e destruição simultaneamente'
                };
            } else if (fama >= 55 && temor >= 55) {
                return {
                    nome: '🔥 Juiz Implacável',
                    classe: 'juiz-implacavel',
                    descricao: 'Você julga com poder e compaixão'
                };
            } else if (fama >= 45 && temor >= 45) {
                return {
                    nome: '🩸 Salvador Temido',
                    classe: 'salvador-temido',
                    descricao: 'Você salva ao preço do medo'
                };
            } else if (fama >= 40 && temor >= 40) {
                return {
                    nome: '👁️ Figura Controversa',
                    classe: 'figura-controversa',
                    descricao: 'Você desperta sentimentos contraditórios'
                };
            } else if (fama >= 35 && temor >= 35) {
                return {
                    nome: '⚔️ Glória Sombria',
                    classe: 'gloria-sombria',
                    descricao: 'Sua fama é construída sobre sangue'
                };
            } else if (fama >= 30 && temor >= 30) {
                return {
                    nome: '🌓 Eco Contraditório',
                    classe: 'eco-contraditorio',
                    descricao: 'Sua reputação fala em vozes conflitantes'
                };
            } else if (fama >= 20 && temor >= 20) {
                return {
                    nome: '🌗 Nome Dividido',
                    classe: 'nome-dividido',
                    descricao: 'Você é conhecido por nomes diferentes'
                };
            } else if (fama >= 10 && temor >= 10) {
                return {
                    nome: '⚖️ Equilíbrio Instável',
                    classe: 'equilibrio-instavel',
                    descricao: 'Sua reputação oscila entre extremos'
                };
            }
        }
        
        // Estados Primários (quando não é híbrido)
        const famaMaiorTemor = fama > temor;
        
        if (famaMaiorTemor && fama >= 50) {
            return {
                nome: '✨ Herói Supremo',
                classe: 'heroi-supremo',
                descricao: 'Ídolo máximo do povo'
            };
        } else if (famaMaiorTemor && fama >= 30) {
            return {
                nome: '⭐ Herói',
                classe: 'heroi',
                descricao: 'Ídolo do povo'
            };
        } else if (!famaMaiorTemor && temor >= 50) {
            return {
                nome: '💀 Tirano Supremo',
                classe: 'tirano-supremo',
                descricao: 'Encarnação suprema do poder'
            };
        } else if (!famaMaiorTemor && temor >= 30) {
            return {
                nome: '👿 Tirano',
                classe: 'tirano',
                descricao: 'Encarnação do poder brutal'
            };
        } else if (fama < 15 && temor < 15) {
            return {
                nome: '👤 Desconhecido',
                classe: 'desconhecido',
                descricao: 'Ninguém sabe quem você é'
            };
        } else {
            return {
                nome: '⚖️ Neutro',
                classe: 'neutro',
                descricao: 'Sua reputação é mista'
            };
        }
    }

    /**
     * Retorna o nível e descrição para um valor
     */
    obterNivel(valor, tipo) {
        const niveis = this.niveisDescritivos[tipo];
        return niveis.find(n => valor >= n.range[0] && valor <= n.range[1]) || niveis[0];
    }

    /**
     * Atualiza a seção de efeitos passivos
     */
    atualizarEfeitos() {
        // Calcular fama máxima (mundo + região)
        const famaMax = Math.max(this.dados.mundo.fama, this.dados.regiao.fama);
        const temorMax = Math.max(this.dados.mundo.temor, this.dados.regiao.temor);

        const efeitosFama = this.calcularEfeitos(famaMax, 'fama');
        const efeitosTemor = this.calcularEfeitos(temorMax, 'temor');

        // Renderizar
        const listaFama = document.querySelector('#rep-efeitos-fama-list-v2');
        const listaTemor = document.querySelector('#rep-efeitos-temor-list-v2');

        if (efeitosFama.length === 0) {
            listaFama.innerHTML = '<li class="rep-efeito-vazio-v2">Sem bônus ainda</li>';
        } else {
            listaFama.innerHTML = efeitosFama.map(e => `<li class="rep-efeito-item-v2">${e}</li>`).join('');
        }

        if (efeitosTemor.length === 0) {
            listaTemor.innerHTML = '<li class="rep-efeito-vazio-v2">Sem bônus ainda</li>';
        } else {
            listaTemor.innerHTML = efeitosTemor.map(e => `<li class="rep-efeito-item-v2">${e}</li>`).join('');
        }
    }

    /**
     * Calcula quais efeitos estão ativos
     */
    calcularEfeitos(valor, tipo) {
        const efeitos = this.efeitosPassivos[tipo];
        const ativos = [];

        for (const [limiar, efeitosList] of Object.entries(efeitos)) {
            if (valor >= parseInt(limiar)) {
                ativos.push(...efeitosList);
            }
        }

        return ativos;
    }

    /**
     * Salva os dados
     */
    salvar() {
        console.log('═══════════════════════════════════════════════════');
        console.log('💾 SALVAR() INICIADO');
        console.log('═══════════════════════════════════════════════════');
        
        // VERIFICAR O ESTADO ATUAL DOS DADOS
        console.log('1️⃣ ESTADO ATUAL DOS DADOS NA MEMÓRIA:');
        console.log('   Mundo - Fama:', this.dados.mundo.fama);
        console.log('   Mundo - Temor:', this.dados.mundo.temor);
        console.log('   Região - Fama:', this.dados.regiao.fama);
        console.log('   Região - Temor:', this.dados.regiao.temor);

        // VERIFICAR SE HOUVE ALTERAÇÕES
        const houveMudancas = 
            this.dados.mundo.fama !== this.dadosOrigem.mundo.fama ||
            this.dados.mundo.temor !== this.dadosOrigem.mundo.temor ||
            this.dados.regiao.fama !== this.dadosOrigem.regiao.fama ||
            this.dados.regiao.temor !== this.dadosOrigem.regiao.temor;
        
        console.log('2️⃣ HOUVE MUDANÇAS?', houveMudancas);
        if (!houveMudancas) {
            console.warn('⚠️ Nenhuma alteração detectada nos dados');
        }
        
        const state = window.appState || window.stateManager;
        
        console.log('3️⃣ VERIFICANDO STATEMANAGER:');
        if (!state) {
            console.error('❌ StateManager não encontrado');
            this.mostrarFeedback('❌ Erro: StateManager não encontrado', true);
            return;
        }
        console.log('✅ StateManager encontrado:', typeof state);

        // Construir estrutura de dados
        const dadosCompatibilidade = {
            mundo: {
                fama: this.dados.mundo.fama,
                temor: this.dados.mundo.temor,
                valor: Math.max(this.dados.mundo.fama, this.dados.mundo.temor)
            },
            regiao: {
                fama: this.dados.regiao.fama,
                temor: this.dados.regiao.temor,
                valor: Math.max(this.dados.regiao.fama, this.dados.regiao.temor)
            }
        };

        console.log('4️⃣ ESTRUTURA DE DADOS A SALVAR:');
        console.log(JSON.stringify(dadosCompatibilidade, null, 2));

        let salvoComSucesso = false;

        // Salvar no state
        console.log('5️⃣ TENTANDO SALVAR NO STATEMANAGER...');
        if (typeof state.setReputation === 'function') {
            try {
                state.setReputation(dadosCompatibilidade);
                console.log('✅✅✅ Salvo no StateManager com SUCESSO');
                salvoComSucesso = true;
            } catch (erro) {
                console.error('❌ Erro ao salvar no StateManager:', erro);
            }
        } else {
            console.warn('⚠️ setReputation não disponível no StateManager');
        }

        // Salvar em localStorage como backup
        console.log('6️⃣ SALVANDO EM LOCALSTORAGE COMO BACKUP...');
        try {
            const reputacaoArmazenada = {
                timestamp: new Date().toISOString(),
                ...dadosCompatibilidade
            };
            localStorage.setItem('reputacao_v2', JSON.stringify(reputacaoArmazenada));
            console.log('✅ Salvo em localStorage com sucesso');
            console.log('📦 localStorage value:', localStorage.getItem('reputacao_v2'));
        } catch (erro) {
            console.error('❌ Erro ao salvar em localStorage:', erro);
        }

        // Atualizar dados de origem
        console.log('7️⃣ ATUALIZANDO DADOS DE ORIGEM...');
        this.dadosOrigem = JSON.parse(JSON.stringify(this.dados));
        console.log('✅ Dados de origem atualizados');

        console.log('═══════════════════════════════════════════════════');
        if (salvoComSucesso) {
            console.log('✅✅✅ REPUTAÇÃO SALVA COM SUCESSO!');
            this.mostrarFeedback('✅ Reputação salva!');
        } else {
            console.warn('⚠️ Reputação pode não ter sido salva corretamente');
            this.mostrarFeedback('⚠️ Salvo localmente (sem StateManager)', false);
        }
        console.log('═══════════════════════════════════════════════════');
        
        this.fechar();
    }

    /**
     * Mostra feedback visual
     */
    mostrarFeedback(mensagem, isErro = false) {
        const feedback = document.createElement('div');
        const bgColor = isErro ? 'rgba(244, 67, 54, 0.9)' : 'rgba(76, 175, 80, 0.9)';
        
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);
        
        // Adicionar keyframes se não existirem
        if (!document.getElementById('rep-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'rep-feedback-style';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => feedback.remove(), 3000);
    }

    /**
     * Debug e diagnóstico completo
     */
    debug() {
        console.group('🏆 ReputacaoV2 - DIAGNÓSTICO COMPLETO');
        
        // 1. Estado dos dados
        console.group('1️⃣ DADOS ATUAIS');
        console.log('Mundo:', this.dados.mundo);
        console.log('Região:', this.dados.regiao);
        console.groupEnd();
        
        // 2. Dados de origem
        console.group('2️⃣ DADOS DE ORIGEM (para comparação)');
        console.log('Mundo:', this.dadosOrigem.mundo);
        console.log('Região:', this.dadosOrigem.regiao);
        console.groupEnd();
        
        // 3. StateManager
        console.group('3️⃣ STATEMANAGER');
        const state = window.appState || window.stateManager;
        console.log('Existe?', !!state);
        if (state) {
            console.log('Tipo:', typeof state);
            if (typeof state.getReputation === 'function') {
                const rep = state.getReputation();
                console.log('getReputation() retorna:', rep);
            }
        }
        console.groupEnd();
        
        // 4. localStorage
        console.group('4️⃣ LOCALSTORAGE');
        const repLocal = localStorage.getItem('reputacao_v2');
        console.log('reputacao_v2 salvo?', !!repLocal);
        if (repLocal) {
            try {
                console.log('Valor:', JSON.parse(repLocal));
            } catch (e) {
                console.log('Valor (raw):', repLocal);
            }
        }
        console.groupEnd();
        
        // 5. Status calculado
        console.group('5️⃣ STATUS CALCULADO');
        console.log('Mundo:', this.calcularStatusAtual(this.dados.mundo.fama, this.dados.mundo.temor));
        console.log('Região:', this.calcularStatusAtual(this.dados.regiao.fama, this.dados.regiao.temor));
        console.groupEnd();
        
        console.groupEnd();
    }

    /**
     * Função para forçar um salvamento de teste
     */
    forcarSalvar() {
        console.log('🔴 FORÇANDO SALVAMENTO DE TESTE');
        this.dados.mundo.fama = 50;
        this.dados.mundo.temor = 30;
        this.dados.regiao.fama = 20;
        this.dados.regiao.temor = 10;
        console.log('Dados alterados para teste:', this.dados);
        this.salvar();
    }

    /**
     * Obter estado atual para outros sistemas
     */
    getStatus() {
        return {
            mundo: {
                ...this.dados.mundo,
                status: this.calcularStatusAtual(this.dados.mundo.fama, this.dados.mundo.temor)
            },
            regiao: {
                ...this.dados.regiao,
                status: this.calcularStatusAtual(this.dados.regiao.fama, this.dados.regiao.temor)
            }
        };
    }
}

// Inicialização
let reputacaoV2 = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 Inicializando ReputacaoV2...');
    reputacaoV2 = new ReputacaoV2();
    window.reputacaoV2 = reputacaoV2;
    console.log('✅ ReputacaoV2 disponível globalmente');
});
