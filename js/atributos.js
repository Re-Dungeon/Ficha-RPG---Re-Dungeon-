/* ============================================ */
/* ATRIBUTOS.JS - Lógica da Aba de Atributos   */
/* Gerenciamento de dados, cálculos, dinâmica  */
/* ============================================ */

/**
 * AtributosManager
 * Responsável por:
 * - Gerenciar dados de atributos
 * - Calcular atributos derivados
 * - Atualizar visual conforme a raça
 * - Sincronizar com estado global
 */

class AtributosManager {
    constructor() {
        // Dados padrão do personagem
        this.personagemData = {
            nome: 'Aventureiro Desconhecido',
            titulo: 'Sem Título',
            classe: 'Guerreiro',
            raca: 'humano',
            nivel: 1,
            experiencia: 0,
            
            // Atributos Primários
            atributos: {
                forca: 0,
                vitalidade: 0,
                agilidade: 0,
                inteligencia: 0,
                percepcao: 0,
                sorte: 0
            },

            // Atributos Secundários (derivados - futuro cálculo)
            secundarios: {
                prontidao: 0,
                ataque: 0,
                defesa: 0,
                reacao: 0,
                precisao: 0,
                evasao: 0
            },

            // Extra para todos os 12 atributos
            atributosExtra: {
                forca: 0,
                vitalidade: 0,
                agilidade: 0,
                inteligencia: 0,
                percepcao: 0,
                sorte: 0,
                prontidao: 0,
                ataque: 0,
                defesa: 0,
                reacao: 0,
                precisao: 0,
                evasao: 0
            },

            // Bônus para todos os 12 atributos
            atributosBonus: {
                forca: 0,
                vitalidade: 0,
                agilidade: 0,
                inteligencia: 0,
                percepcao: 0,
                sorte: 0,
                prontidao: 0,
                ataque: 0,
                defesa: 0,
                reacao: 0,
                precisao: 0,
                evasao: 0
            },

            // Bônus MANUAIS (inseridos pelo usuário no modal)
            atributosBonusManual: {
                forca: 0,
                vitalidade: 0,
                agilidade: 0,
                inteligencia: 0,
                percepcao: 0,
                sorte: 0,
                prontidao: 0,
                ataque: 0,
                defesa: 0,
                reacao: 0,
                precisao: 0,
                evasao: 0
            },

            // Bônus DE APTIDÕES (adicionados automaticamente pelo sistema de aptidões)
            atributosBonusAptidoes: {
                forca: 0,
                vitalidade: 0,
                agilidade: 0,
                inteligencia: 0,
                percepcao: 0,
                sorte: 0,
                prontidao: 0,
                ataque: 0,
                defesa: 0,
                reacao: 0,
                precisao: 0,
                evasao: 0
            }
        };

        // Raças disponíveis com estilos
        this.racas = {
            humano: {
                nome: 'Humano',
                borderClass: 'personagem-display__border--humano',
                cor: '#d8b4fe'
            },
            elfo: {
                nome: 'Elfo',
                borderClass: 'personagem-display__border--elfo',
                cor: '#5a9d6f'
            },
            anao: {
                nome: 'Anão',
                borderClass: 'personagem-display__border--anao',
                cor: '#a8a8a8'
            }
        };

        this.init();
    }

    /**
     * Inicializa o gerenciador
     * 
     * ✅ ETAPA 2: Fluxo de Persistência F5-Safe
     * Sequência ao carregar:
     * 1. StateManager já carregou dados do localStorage via loadFromLocalStorage()
     * 2. AtributosManager.init() é chamado
     * 3. loadFromLocalStorage() restaura informações do jogador
     * 4. Renderizar com dados carregados
     */
    init() {
        // 🔒 BLOQUEIO ISOLADO: Não carregar dados se o botão "Limpar Ficha" foi clicado
        // ⚠️ MAS: Permitir se for uma importação em andamento
        const limpezaAtiva = sessionStorage.getItem('LIMPEZA_FICHA_ATIVA');
        const importacaoAtiva = sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA');
        
        if (limpezaAtiva && !importacaoAtiva) {
            console.log('🔒 [AtributosManager] Carregamento bloqueado - Limpeza em progresso');
            return;
        }

        // ✅ CARREGAR DADOS DO LOCALSTORAGE SE DISPONÍVEL
        this.loadFromLocalStorage();

        // ✅ SINCRONIZAR COM O ESTADO GLOBAL (F5 SAFE)
        // Isso garante que os atributos carregados pelo StateManager
        // sejam refletidos corretamente após recarregar a página.
        this.syncWithState();

        // Renderizar com dados carregados
        this.renderizarAtributos();
        this.renderizarPersonagem();
        this.setupListeners();
        
        console.log('✅ AtributosManager inicializado');
    }

    /**
     * Carrega dados do localStorage se disponível
     */
    loadFromLocalStorage() {
        if (!window.localStorageManager) {
            console.log('ℹ️ LocalStorageManager não disponível');
            return;
        }

        try {
            // Tentar carregar informações do jogador do localStorage
            const jogadorInfo = window.localStorageManager.loadJogadorInfo();
            
            console.log('📂 loadFromLocalStorage() - jogadorInfo recebido:', jogadorInfo);
            
            if (jogadorInfo) {
                console.log('✅ Informações do jogador carregadas do localStorage');
                
                // Atualizar personagemData com dados persistidos
                if (jogadorInfo.nomePersonagem) {
                    console.log(`  📝 Nome: "${this.personagemData.nome}" → "${jogadorInfo.nomePersonagem}"`);
                    this.personagemData.nome = jogadorInfo.nomePersonagem;
                }
                if (jogadorInfo.tituloPersonagem) {
                    console.log(`  📝 Título: "${this.personagemData.titulo}" → "${jogadorInfo.tituloPersonagem}"`);
                    this.personagemData.titulo = jogadorInfo.tituloPersonagem;
                }
                if (jogadorInfo.classePersonagem) {
                    console.log(`  📝 Classe: "${this.personagemData.classe}" → "${jogadorInfo.classePersonagem}"`);
                    this.personagemData.classe = jogadorInfo.classePersonagem;
                }
                if (jogadorInfo.racaPersonagem) {
                    // Converter nome da raça para código
                    const racaCodigo = this.racaNomeParaCodigo(jogadorInfo.racaPersonagem);
                    console.log(`  📝 Raça: "${jogadorInfo.racaPersonagem}" → código "${racaCodigo}"`);
                    if (racaCodigo) {
                        this.personagemData.raca = racaCodigo;
                    } else {
                        console.warn(`  ⚠️ Não conseguiu converter raça "${jogadorInfo.racaPersonagem}"`);
                    }
                }
                
                console.log('✅ PersonagemData atualizado com dados do localStorage:', this.personagemData);
            } else {
                console.log('ℹ️ localStorage vazio - usando valores padrão');
            }

            // ✅ NOVO: Buscar classe e raça diretamente do modal (redungeon_classe_selecionada, redungeon_raca_selecionada)
            // Isso garante que a escolha no modal seja refletida na ficha
            try {
                const classeSelecionadaId = localStorage.getItem('redungeon_classe_selecionada');
                const racaSelecionadaId = localStorage.getItem('redungeon_raca_selecionada');

                if (classeSelecionadaId) {
                    console.log(`  🎭 Classe do modal encontrada: "${classeSelecionadaId}"`);
                    // Aqui poderia buscar o nome, mas mantemos o ID por enquanto
                    // this.personagemData.classe será atualizado quando renderizar
                }

                if (racaSelecionadaId) {
                    console.log(`  🎭 Raça do modal encontrada: "${racaSelecionadaId}"`);
                    this.personagemData.raca = racaSelecionadaId;
                }
            } catch (e) {
                console.warn('⚠️ Erro ao buscar classe/raça do modal:', e);
            }

        } catch (error) {
            console.warn('⚠️ Erro ao carregar do localStorage:', error);
        }
    }

    /**
     * Converte nome da raça para código
     */
    racaNomeParaCodigo(nomeDaRaca) {
        if (!nomeDaRaca) return 'humano'; // Fallback para raça padrão
        
        const mapa = {
            'Humano': 'humano',
            'Elfo': 'elfo',
            'Anão': 'anao',
            'Méstico': 'humano', // Fallback para méstico
            'mestico': 'humano',
            'Mestico': 'humano'
        };
        return mapa[nomeDaRaca] || 'humano'; // Retornar 'humano' como fallback ao invés de null
    }

    /**
     * ✅ NOVO: Sincroniza AtributosManager com StateManager
     * Usado quando atributos são modificados para garantir dados atualizados
     * para o cálculo de aptidões
     */
    syncWithState() {
        console.log('🔄 [AtributosManager] Iniciando sincronização com StateManager...');
        
        if (!window.appState) {
            console.error('❌ [AtributosManager] StateManager (window.appState) não disponível!');
            return;
        }

        try {
            const state = window.appState.getState();

            // ✅ Sincronizar atributos primários
            // State tem: {forca: {base, extra, bonus, total}, ...}
            // personagemData.atributos precisa ter: {forca: numero, ...}
            // IMPORTANTE: Usar o TOTAL para cálculos (base + extra + bonus)
            if (state.atributos?.primarios) {
                console.log('📊 [AtributosManager] Sincronizando atributos primários do StateManager');
                
                Object.keys(state.atributos.primarios).forEach(atributo => {
                    const attr = state.atributos.primarios[atributo];
                    // ✅ CRÍTICO: Usar .total que já inclui base + extra + bonus
                    const total = attr.total || (attr.base || 0) + (attr.extra || 0) + (attr.bonus || 0);
                    
                    // Atualizar personagemData com o valor TOTAL
                    this.personagemData.atributos[atributo] = total;
                    
                    // Atualizar os campos individuais também
                    if (!this.personagemData.atributosExtra) this.personagemData.atributosExtra = {};
                    if (!this.personagemData.atributosBonus) this.personagemData.atributosBonus = {};
                    
                    this.personagemData.atributosExtra[atributo] = attr.extra || 0;
                    this.personagemData.atributosBonus[atributo] = attr.bonus || 0;
                    
                    console.log(`  ✅ ${atributo}: ${total} (base:${attr.base} extra:${attr.extra} bonus:${attr.bonus})`);
                });

                console.log('✅ [AtributosManager] Atributos primários sincronizados:', this.personagemData.atributos);
                
                // Disparar evento personalizado para notificar mudanças de atributos
                window.dispatchEvent(new CustomEvent('atributosChanged', { 
                  detail: { atributos: this.personagemData.atributos } 
                }));
            }

            // ✅ Sincronizar bônus manual se disponível
            if (state.atributosBonusManual) {
                this.personagemData.atributosBonusManual = { ...state.atributosBonusManual };
                console.log('✅ [AtributosManager] Bônus manual sincronizado');
            }

            // ✅ Sincronizar bônus de aptidões se disponível
            if (state.atributosBonusAptidoes) {
                this.personagemData.atributosBonusAptidoes = { ...state.atributosBonusAptidoes };
                console.log('✅ [AtributosManager] Bônus de aptidões sincronizado');
            }

            // ✅ NOVO: Sincronizar atributos secundários
            // CRÍTICO: Necessário para cálculo de bônus percentuais de aptidões
            // (ex: +20% Prontidão em Camuflagem, +10% Defesa em Resistência Espiritual)
            if (state.atributos?.secundarios) {
                console.log('📊 [AtributosManager] Sincronizando atributos secundários do StateManager');
                
                if (!this.personagemData.secundarios) {
                    this.personagemData.secundarios = {};
                }
                
                Object.keys(state.atributos.secundarios).forEach(atributo => {
                    const sec = state.atributos.secundarios[atributo];
                    // Usar .total se disponível, senão calcular
                    const total = sec?.total || (sec?.base || 0) + (sec?.extra || 0) + (sec?.bonus || 0);
                    
                    this.personagemData.secundarios[atributo] = total;
                    
                    console.log(`  ✅ ${atributo}: ${total}`);
                });

                console.log('✅ [AtributosManager] Atributos secundários sincronizados:', this.personagemData.secundarios);
            } else {
                console.warn('⚠️ [AtributosManager] Estado de secundários não encontrado no StateManager');
            }

            console.log('✅ [AtributosManager] Sincronização com StateManager CONCLUÍDA');
            console.log('   personagemData.atributos agora:', this.personagemData.atributos);
            console.log('   personagemData.secundarios agora:', this.personagemData.secundarios);

        } catch (error) {
            console.error('❌ [AtributosManager] Erro durante sincronização:', error);
        }
    }

    /**
     * Renderiza os atributos primários na tela
     */
    renderizarAtributos() {
        // 🔒 BLOQUEIO ISOLADO: Não renderizar se a limpeza está em progresso
        // ⚠️ MAS: Permitir se for uma importação em andamento
        const limpezaAtiva = sessionStorage.getItem('LIMPEZA_FICHA_ATIVA');
        const importacaoAtiva = sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA');
        
        if (limpezaAtiva && !importacaoAtiva) {
            console.log('🔒 [AtributosManager.renderizarAtributos()] Renderização bloqueada - Limpeza em progresso');
            return;
        }

        const stateManager = window.appState;
        if (!stateManager) {
            console.warn('⚠️ StateManager não disponível para renderização');
            return;
        }

        const state = stateManager.getState();
        const primarios = state.atributos?.primarios || {};
        const secundarios = state.atributos?.secundarios || {};

        // Atualizar valores dos atributos primários
        Object.keys(primarios).forEach(chave => {
            const elemento = document.querySelector(
                `.atributo[data-atributo="${chave}"]`
            );
            if (elemento) {
                const total = primarios[chave]?.total || 0;
                elemento.textContent = '';
                elemento.innerHTML = `${total}<br><span>${this.getNomeSigla(chave)}</span>`;
            }
        });

        // Atualizar valores dos atributos secundários
        Object.keys(secundarios).forEach(chave => {
            const elemento = document.querySelector(
                `.atributo[data-atributo="${chave}"]`
            );
            if (elemento) {
                const total = secundarios[chave]?.total || 0;
                elemento.textContent = '';
                elemento.innerHTML = `${total}<br><span>${this.getNomeSigla(chave)}</span>`;
            }
        });
    }

    /**
     * Retorna a sigla do atributo
     */
    getNomeSigla(chave) {
        const siglas = {
            forca: 'FOR',
            vitalidade: 'VIT',
            agilidade: 'AGI',
            inteligencia: 'INT',
            percepcao: 'PER',
            sorte: 'SOR',
            prontidao: 'PRONT',
            ataque: 'ATK',
            defesa: 'DEF',
            reacao: 'REA',
            precisao: 'PREC',
            evasao: 'EVA'
        };
        return siglas[chave] || chave.toUpperCase();
    }

    /**
     * Renderiza as informações do personagem
     */
    renderizarPersonagem() {
        // 🔒 BLOQUEIO ISOLADO: Não renderizar se a limpeza está em progresso
        // ⚠️ MAS: Permitir se for uma importação em andamento
        const limpezaAtiva = sessionStorage.getItem('LIMPEZA_FICHA_ATIVA');
        const importacaoAtiva = sessionStorage.getItem('IMPORTACAO_FICHA_ATIVA');
        
        if (limpezaAtiva && !importacaoAtiva) {
            console.log('🔒 [AtributosManager.renderizarPersonagem()] Renderização bloqueada - Limpeza em progresso');
            return;
        }

        const { nome, titulo, classe, raca } = this.personagemData;

        console.log('🎨 renderizarPersonagem() - Atualizando visual com:', { nome, titulo, classe, raca });

        // Atualizar nome
        const nomeEl = document.getElementById('personagem-nome');
        if (nomeEl) {
            nomeEl.textContent = nome;
            console.log(`  ✅ Nome atualizado: "${nome}"`);
        } else {
            console.warn('⚠️ Elemento #personagem-nome não encontrado');
        }

        // Atualizar título
        const tituloEl = document.getElementById('personagem-titulo');
        if (tituloEl) {
            tituloEl.textContent = titulo;
            console.log(`  ✅ Título atualizado: "${titulo}"`);
        } else {
            console.warn('⚠️ Elemento #personagem-titulo não encontrado');
        }

        // Atualizar classe
        const classeEl = document.getElementById('personagem-classe');
        if (classeEl) {
            // Verificar se há seleção de classe no modal
            const classesSelecionadas = localStorage.getItem('redungeon_classes_selecionadas');
            if (!classesSelecionadas || classesSelecionadas === '[]') {
                classeEl.textContent = classe || 'Classe';
                console.log(`  ✅ Classe atualizada: "${classe || 'Classe'}"`);
            } else {
                // Se há classes salvas, deixar que classes-ui.js mantenha a sincronização
                console.log(`  ℹ️ Classes foram selecionadas, mantendo valor sincronizado`);
            }
        } else {
            console.warn('⚠️ Elemento #personagem-classe não encontrado');
        }

        // Atualizar raça
        const racaEl = document.getElementById('personagem-raca');
        if (racaEl) {
            // Verificar se há seleção de raça no modal
            const racaSelecionada = localStorage.getItem('redungeon_raca_selecionada');
            if (!racaSelecionada) {
                racaEl.textContent = raca || 'Raça';
                console.log(`  ✅ Raça atualizada: "${raca || 'Raça'}"`);
            }
        } else {
            console.warn('⚠️ Elemento #personagem-raca não encontrado');
        }

        // Atualizar borda conforme raça
        this.atualizarRaca(raca);

        // ✅ NOVO: Sincronizar a imagem do personagem
        this.sincronizarImagemPersonagem();
    }

    /**
     * ✅ NOVO: Sincroniza a imagem do personagem quando renderizando
     */
    sincronizarImagemPersonagem() {
        try {
            if (window.personagemImageController && typeof window.personagemImageController.loadSavedImage === 'function') {
                console.log('🖼️ Sincronizando imagem do personagem...');
                window.personagemImageController.loadSavedImage();
            }
        } catch (error) {
            console.warn('⚠️ Erro ao sincronizar imagem:', error);
        }
    }

    /**
     * Atualiza o visual conforme a raça
     * @param {string} novaRaca - ID da raça
     */
    atualizarRaca(novaRaca) {
        const racaConfig = this.racas[novaRaca];
        if (!racaConfig) {
            console.warn(`Raça inválida: ${novaRaca}`);
            return;
        }

        const display = document.getElementById('personagem-display');
        const border = document.querySelector('.personagem-display__border');
        const frame = document.getElementById('personagem-frame');

        if (display) {
            display.setAttribute('data-raca', novaRaca);
        }

        // ✅ NOVO: Atualizar frame também
        if (frame) {
            frame.setAttribute('data-raca', novaRaca);
            console.log(`✅ Frame da raça atualizado: ${novaRaca}`);
        }

        if (border) {
            // Remover classes anteriores
            Object.values(this.racas).forEach(raca => {
                border.classList.remove(raca.borderClass);
            });

            // Adicionar nova classe
            border.classList.add(racaConfig.borderClass);
        }

        // Atualizar dados
        this.personagemData.raca = novaRaca;

        console.log(`🎭 Raça alterada para: ${racaConfig.nome}`);
    }

    /**
     * Atualiza um atributo primário (APENAS RENDERIZAÇÃO, SEM CÁLCULOS)
     * @param {string} atributo - Nome do atributo
     * @param {number} valor - Novo valor
     */
    atualizarAtributo(atributo, valor) {
        if (this.personagemData.atributos.hasOwnProperty(atributo)) {
            this.personagemData.atributos[atributo] = valor;
            
            // Atualizar visual apenas
            const elemento = document.querySelector(
                `.atributos-item[data-atributo="${atributo}"] .atributos-item__value`
            );
            if (elemento) {
                elemento.textContent = valor;
                this.animarMudanca(elemento);
            }

            // Sincronizar com estado global (futuro)
            if (window.appState || window.stateManager) {
                const state = window.appState || window.stateManager;
                state.setState({ character: this.personagemData });
            }

            console.log(`📊 ${atributo}: ${valor}`);

            // 🔥 NOVO: Disparar evento para que a aba de Arts atualize em tempo real
            window.dispatchEvent(new CustomEvent('atributosAtualizados', { 
                detail: { 
                    atributo: atributo, 
                    valor: valor,
                    atributos: this.personagemData.atributos
                } 
            }));

            // ⚠️ NEUTRALIZADO: Removidos todos os cálculos automáticos
            // Sem atualizarSaudeMaxima, atualizarEnergiaMaxima, atualizarFadigaMaxima
            // Sem atualizarTodosSecundarios
        }
    }

    /**
     * Atualiza um atributo secundário
     * @param {string} atributo - Nome do atributo
     * @param {number} valor - Novo valor
     */
    atualizarSecundario(atributo, valor) {
        if (this.personagemData.secundarios.hasOwnProperty(atributo)) {
            this.personagemData.secundarios[atributo] = valor;

            // Atualizar visual
            const elemento = document.querySelector(
                `.atributos-secondary[data-atributo="${atributo}"] .atributos-secondary__value`
            );
            if (elemento) {
                elemento.textContent = valor;
                this.animarMudanca(elemento);
            }

            console.log(`📈 ${atributo}: ${valor}`);
        }
    }

    /**
     * REATIVADO: atualizarSaudeMaxima()
     * Cálculos de saúde máxima usando fórmula:
     * SAUDE = ceil(((FOR × 0.3) + (VIT × 0.6) + (SOR × 0.1)) × 2)
     */
    atualizarSaudeMaxima() {
        if (!window.statusBarsManager) {
            console.warn('⚠️ statusBarsManager não disponível');
            return;
        }

        try {
            const state = window.appState?.getState();
            if (!state?.atributos?.primarios) {
                console.warn('⚠️ Estado de atributos não disponível');
                return;
            }

            const FOR = state.atributos.primarios.forca?.total || 0;
            const VIT = state.atributos.primarios.vitalidade?.total || 0;
            const SOR = state.atributos.primarios.sorte?.total || 0;

            const soma = (FOR * 0.3) + (VIT * 0.6) + (SOR * 0.1);
            const maximo = Math.ceil(soma * 2);

            // Obter base/extra/bonus para cálculo completo
            const base = window.statusBarsManager?.state?.hp?.base || 0;
            const extra = window.statusBarsManager?.state?.hp?.extra || 0;
            const bonus = window.bonusCalculator?.getBonus('saude') || 0;
            const maximoFinal = maximo + base + extra + bonus;
            
            // 🔍 DEBUG: Verificar valores intermediários
            console.log(`[DEBUG atualizarSaudeMaxima] Atributos: FOR=${FOR}, VIT=${VIT}, SOR=${SOR}`);
            console.log(`[DEBUG atualizarSaudeMaxima] Soma: ${soma.toFixed(2)}, Maximo base: ${maximo}`);
            console.log(`[DEBUG atualizarSaudeMaxima] Base: ${base}, Extra: ${extra}, Bonus: ${bonus}`);
            console.log(`[DEBUG atualizarSaudeMaxima] StatusBarsManager disponível: ${!!window.statusBarsManager}`);
            console.log(`[DEBUG atualizarSaudeMaxima] BonusCalculator disponível: ${!!window.bonusCalculator}`);

            // Atualizar StatusBarsManager
            if (window.statusBarsManager.state?.hp) {
                window.statusBarsManager.state.hp.max = maximoFinal;
                console.log(`✅ Saúde Máxima DETALHADO:`);
                console.log(`   - Fórmula base: ceil(((${FOR}×0.3)+(${VIT}×0.6)+(${SOR}×0.1))×2) = ${maximo}`);
                console.log(`   - Base: +${base}`);
                console.log(`   - Extra: +${extra}`);
                console.log(`   - Bônus: +${bonus}`);
                console.log(`   - TOTAL: ${maximo} + ${base} + ${extra} + ${bonus} = ${maximoFinal}`);
                console.log(`   - Valor salvo em hp.max: ${window.statusBarsManager.state.hp.max}`);
            }
        } catch (error) {
            console.error('❌ Erro ao calcular saúde máxima:', error);
        }
    }

    /**
     * REATIVADO: atualizarEnergiaMaxima()
     * Cálculos de energia máxima usando fórmula:
     * ENERGIA = ceil(((INT × 0.6) + (PER × 0.3) + (SOR × 0.1)) × 1.333333)
     */
    atualizarEnergiaMaxima() {
        if (!window.statusBarsManager) {
            console.warn('⚠️ statusBarsManager não disponível');
            return;
        }

        try {
            const state = window.appState?.getState();
            if (!state?.atributos?.primarios) {
                console.warn('⚠️ Estado de atributos não disponível');
                return;
            }

            const INT = state.atributos.primarios.inteligencia?.total || 0;
            const PER = state.atributos.primarios.percepcao?.total || 0;
            const SOR = state.atributos.primarios.sorte?.total || 0;

            const soma = (INT * 0.6) + (PER * 0.3) + (SOR * 0.1);
            const maximo = Math.ceil(soma * (200 / 150));

            // Obter base/extra/bonus para cálculo completo
            const base = window.statusBarsManager?.state?.energy?.base || 0;
            const extra = window.statusBarsManager?.state?.energy?.extra || 0;
            const bonus = window.bonusCalculator?.getBonus('energia') || 0;
            const maximoFinal = maximo + base + extra + bonus;

            // Atualizar StatusBarsManager
            if (window.statusBarsManager.state?.energy) {
                window.statusBarsManager.state.energy.max = maximoFinal;
                console.log(`✅ Energia Máxima DETALHADO:`);
                console.log(`   - Fórmula base: ceil(((${INT}×0.6)+(${PER}×0.3)+(${SOR}×0.1))×1.333333) = ${maximo}`);
                console.log(`   - Base: +${base}`);
                console.log(`   - Extra: +${extra}`);
                console.log(`   - Bônus: +${bonus}`);
                console.log(`   - TOTAL: ${maximo} + ${base} + ${extra} + ${bonus} = ${maximoFinal}`);
                console.log(`   - Valor salvo em energy.max: ${window.statusBarsManager.state.energy.max}`);
            }
        } catch (error) {
            console.error('❌ Erro ao calcular energia máxima:', error);
        }
    }

    /**
     * REATIVADO: atualizarFadigaMaxima()
     * Cálculos de fadiga máxima usando fórmula:
     * FADIGA = ceil((FOR × 0.3) + (VIT × 0.5) + (SOR × 0.2))
     */
    atualizarFadigaMaxima() {
        if (!window.statusBarsManager) {
            console.warn('⚠️ statusBarsManager não disponível');
            return;
        }

        try {
            const state = window.appState?.getState();
            if (!state?.atributos?.primarios) {
                console.warn('⚠️ Estado de atributos não disponível');
                return;
            }

            const FOR = state.atributos.primarios.forca?.total || 0;
            const VIT = state.atributos.primarios.vitalidade?.total || 0;
            const SOR = state.atributos.primarios.sorte?.total || 0;

            const soma = (FOR * 0.3) + (VIT * 0.5) + (SOR * 0.2);
            const maximo = Math.ceil(soma);

            // Obter base/extra/bonus para cálculo completo
            const base = window.statusBarsManager?.state?.fatigue?.base || 0;
            const extra = window.statusBarsManager?.state?.fatigue?.extra || 0;
            const bonus = window.bonusCalculator?.getBonus('fadiga') || 0;
            const maximoFinal = maximo + base + extra + bonus;

            // Atualizar StatusBarsManager
            if (window.statusBarsManager.state?.fatigue) {
                window.statusBarsManager.state.fatigue.max = maximoFinal;
                console.log(`✅ Fadiga Máxima DETALHADO:`);
                console.log(`   - Fórmula base: ceil((${FOR}×0.3)+(${VIT}×0.5)+(${SOR}×0.2)) = ${maximo}`);
                console.log(`   - Base: +${base}`);
                console.log(`   - Extra: +${extra}`);
                console.log(`   - Bônus: +${bonus}`);
                console.log(`   - TOTAL: ${maximo} + ${base} + ${extra} + ${bonus} = ${maximoFinal}`);
                console.log(`   - Valor salvo em fatigue.max: ${window.statusBarsManager.state.fatigue.max}`);
            }
        } catch (error) {
            console.error('❌ Erro ao calcular fadiga máxima:', error);
        }
    }

    /**
     * REATIVADO: atualizarTodosOsStatus()
     * Atualiza todos os máximos de status
     */
    atualizarTodosOsStatus() {
        console.log('📄 Atualizando todos os status...');
        this.atualizarSaudeMaxima();
        this.atualizarEnergiaMaxima();
        this.atualizarFadigaMaxima();
    }

    /**
     * Anima uma mudança de valor (feedback visual)
     * @param {HTMLElement} elemento - Elemento a animar
     */
    animarMudanca(elemento) {
        elemento.style.transition = 'none';
        elemento.style.color = '#ffff00';

        setTimeout(() => {
            elemento.style.transition = 'color 0.5s ease-out';
            elemento.style.color = 'var(--color-gold)';
        }, 10);
    }

    /**
     * NEUTRALIZADO: atualizarProntidao()
     * Cálculos de prontidão foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarProntidao() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarAtaque()
     * Cálculos de ataque foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarAtaque() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarDefesa()
     * Cálculos de defesa foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarDefesa() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarReacao()
     * Cálculos de reação foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarReacao() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarPrecisao()
     * Cálculos de precisão foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarPrecisao() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarEvasao()
     * Cálculos de evasão foram desabilitados
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarEvasao() {
        return;
    }

    /**
     * NEUTRALIZADO: atualizarTodosSecundarios()
     * Atualização de secundários foi desabilitada
     * @deprecated Função desativada - sem efeitos colaterais
     */
    atualizarTodosSecundarios() {
        return;
    }

    /**
     * Calcula atributos derivados (futuro)
     * Esta função será expandida com fórmulas de cálculo
     */
    calcularSecundarios() {
        const { forca, vitalidade, agilidade, inteligencia, percepcao, sorte } = this.personagemData.atributos;

        // Placeholder para fórmulas de cálculo
        // Exemplo: Ataque = Força * 1.2 + Agilidade * 0.5
        // Defesa = Vitalidade * 0.8 + Força * 0.3

        console.log('🔢 Cálculo de secundários preparado');
    }

    /**
     * Configura listeners para interatividade futura
     */
    setupListeners() {
        // Listener para atributos primários (botões clicáveis)
        document.querySelectorAll('button.atributo').forEach(button => {
            button.addEventListener('click', (e) => {
                const atributo = button.getAttribute('data-atributo');
                console.log(`🖱️ Clicado em atributo: ${atributo}`);
                
                // Abrir modal de configuração
                if (window.atributosConfigModal && typeof window.atributosConfigModal.openModal === 'function') {
                    window.atributosConfigModal.openModal(atributo);
                    console.log(`📝 Modal de configuração aberto para: ${atributo}`);
                } else {
                    console.warn('⚠️ atributosConfigModal não encontrado!');
                }
            });
        });

        // 🆕 Observer para monitorar mudanças nos dados dos atributos primários
        // Permite auto-atualizar secundários mesmo fora do modal
        this.setupDataObserver();
    }

    /**
     * NEUTRALIZADO: setupDataObserver()
     * Observador de mudanças foi desabilitado
     * @deprecated Função desativada - sem recálculos automáticos
     */
    setupDataObserver() {
        return;
    }

    /**
     * Obtém dados do personagem
     * @returns {object} Dados atuais
     */
    getPersonagemData() {
        return this.personagemData;
    }

    /**
     * Atualiza dados do personagem
     * @param {object} novosDados - Objeto com dados a atualizar
     */
    atualizarPersonagem(novosDados) {
        this.personagemData = { ...this.personagemData, ...novosDados };
        this.renderizarPersonagem();
        this.renderizarAtributos();
        
        console.log('👤 Personagem atualizado');
    }

    /**
     * Exporta dados como JSON (para salvar/compartilhar)
     * @returns {string} JSON stringificado
     */
    exportarJSON() {
        // 🔥 IMPORTANTE: Incluir companheiros no JSON exportado
        const jsonCompleto = {
            personagem: this.personagemData,
            companheiros: window.companheirosManager ? window.companheirosManager.companheiros : []
        };
        return JSON.stringify(jsonCompleto, null, 2);
    }

    /**
     * Importa dados de um JSON
     * @param {string} jsonString - String JSON com dados
     */
    importarJSON(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            
            // 🔥 IMPORTANTE: Suportar novo formato (com chaves personagem/companheiros)
            let dadosPersonagem = dados;
            let dadosCompanheiros = [];
            
            if (dados.personagem && dados.companheiros) {
                // Novo formato com objetos separados
                dadosPersonagem = dados.personagem;
                dadosCompanheiros = dados.companheiros;
            } else if (Array.isArray(dados)) {
                // Formato antigo (apenas array de companheiros)
                dadosCompanheiros = dados;
            }
            // Caso contrário, assume que é só dados do personagem (compatibilidade)
            
            // Atualizar personagem
            this.atualizarPersonagem(dadosPersonagem);
            
            // Importar companheiros se houver
            if (window.companheirosManager && dadosCompanheiros.length > 0) {
                window.companheirosManager.importarJSON(JSON.stringify(dadosCompanheiros));
                console.log(`✅ ${dadosCompanheiros.length} companheiros importados`);
            }
            
            console.log('✅ Dados importados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao importar JSON:', error);
        }
    }

    /**
     * Loga informações de debug
     */
    debug() {
        console.group('🎮 AtributosManager Debug');
        console.table(this.personagemData.atributos);
        console.table(this.personagemData.secundarios);
        console.log('Raça atual:', this.personagemData.raca);
        console.groupEnd();
    }

}

/**
 * Inicializar quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    window.atributosManager = new AtributosManager();
    
    // 🆕 Integrar com o modal de imagem do personagem
    const personagemImagemElement = document.getElementById('personagem-imagem');
    if (personagemImagemElement) {
        personagemImagemElement.style.cursor = 'pointer';
        personagemImagemElement.addEventListener('click', () => {
            if (personagemImageController) {
                personagemImageController.openModal();
            }
        });
    }
});

