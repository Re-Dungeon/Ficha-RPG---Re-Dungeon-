/* ============================================ */
/* APTIDÕES-MANAGER.JS - Sistema de Aptidões   */
/* Lógica principal, cálculos e sincronização   */
/* ============================================ */

class AptidoesManager {
    constructor() {
        this.db = null;
        this.catalogo = [];
        this.aptidoesPersonagem = [];
        this.configAptidoes = {
            ganhas: 0
        };

        // Listeners para notificações
        this.listeners = [];

        // Atualizar o painel quando os atributos mudarem
        if (typeof window !== 'undefined') {
            window.addEventListener('atributosChanged', () => {
                console.log('🔁 [AptidoesManager] Atributos mudaram, recalculando máximo...');
                this.recalcularEAtualizar();
            });

            window.addEventListener('atributosAtualizados', () => {
                console.log('🔁 [AptidoesManager] Evento atributosAtualizados recebido, recalculando máximo...');
                this.recalcularEAtualizar();
            });
        }
        
        // ✅ NOVO: Handler para event delegation dos botões de ação
        this._aptidoesActionClickHandler = null;
    }

    /**
     * Inicializa o manager
     */
    async init() {
        console.log('🎮 Inicializando AptidoesManager...');
        console.log('🎮 ⏰ Verificando se AtributosManager está pronto...');
        console.log('🎮    window.atributosManager:', window.atributosManager ? '✅ EXISTS' : '❌ NOT FOUND');

        try {
            // Inicializar DB COM FALLBACK
            console.log('🎮 Tentando inicializar BD de aptidões...');
            let dbInitialized = false;
            try {
                await aptidoesDB.init();
                console.log('🎮 ✅ BD inicializado com sucesso');
                dbInitialized = true;
            } catch (dbError) {
                console.warn('🎮 ⚠️ Erro ao inicializar DB, continuando sem IndexedDB:', dbError.message);
                // NÃO LANÇAR ERRO - Continuar sem IndexedDB
                dbInitialized = false;
            }

            // Carregar catálogo COM FALLBACK
            let catalogo = [];
            try {
                if (dbInitialized) {
                    catalogo = await aptidoesDB.getCatalogo();
                    console.log(`🎮 Catálogo carregado: ${catalogo.length} aptidões`);
                } else {
                    console.log('🎮 ⚠️ DB não inicializado, usando catálogo em memória');
                    catalogo = aptidoesDB.getCatalogoCompleto();
                    console.log(`🎮 Catálogo em memória: ${catalogo.length} aptidões`);
                }
            } catch (catalogError) {
                console.warn('🎮 ⚠️ Erro ao carregar catálogo, usando fallback em memória:', catalogError.message);
                catalogo = aptidoesDB.getCatalogoCompleto();
                console.log(`🎮 Fallback: ${catalogo.length} aptidões carregadas em memória`);
            }
            
            // Se ainda vazio, tentar inserir completo
            if (catalogo.length === 0 && dbInitialized) {
                console.log('🎮 Catálogo vazio, inserindo dados padrão...');
                try {
                    await aptidoesDB.insertCatalogo();
                    catalogo = await aptidoesDB.getCatalogo();
                    console.log('🎮 ✅ Catálogo inserido');
                } catch (insertError) {
                    console.warn('🎮 ⚠️ Erro ao inserir catálogo, usando fallback:', insertError.message);
                    catalogo = aptidoesDB.getCatalogoCompleto();
                    console.log(`🎮 Fallback: ${catalogo.length} aptidões carregadas em memória`);
                }
            }

            this.catalogo = catalogo;

            // Carregar dados do personagem
            try {
                await this.loadPersonagemData();
            } catch (loadError) {
                console.error('🎮 ❌ Erro ao carregar dados:', loadError);
                throw loadError;
            }

            // ✅ Garantir que o render inicial tenha informações corretas
            console.log('📊 Renderizando com dados sincronizados...');
            console.log('📊 ANTES DE RENDERIZAR:');
            console.log('📊   AtributosManager.personagemData:', window.atributosManager?.personagemData?.atributos);
            
            try {
                this.render();
            } catch (renderError) {
                console.error('🎮 ❌ Erro ao renderizar:', renderError);
                throw renderError;
            }

            // ✅ SINCRONIZAR BÔNUS DE APTIDÕES APÓS INICIALIZAÇÃO
            console.log('🔄 Sincronizando bônus de aptidões...');
            if (window.aptidoesModal && typeof window.aptidoesModal.syncBonus === 'function') {
                try {
                    window.aptidoesModal.syncBonus();
                    console.log('✅ Bônus sincronizados após inicialização');
                } catch (syncError) {
                    console.warn('⚠️ Erro ao sincronizar bônus:', syncError);
                }
            }

            console.log('✅ AptidoesManager inicializado com sucesso!');
            this.notifyListeners('init', { catalogo: this.catalogo, aptidoes: this.aptidoesPersonagem });
            
            return true;
        } catch (error) {
            console.error('❌ ERRO CRÍTICO ao inicializar AptidoesManager:', error);
            console.error('❌ Nome do erro:', error.name);
            console.error('❌ Mensagem:', error.message);
            console.error('❌ Stack:', error.stack);
            return false;
        }
    }

    /**
     * Carrega dados do personagem do DB
     */
    async loadPersonagemData() {
        try {
            console.log('📦 [loadPersonagemData] Iniciando carregamento de aptidões...');
            
            // ✅ PRIORIDADE 1: Tentar carregar do localStorage PRIMEIRO (mais confiável para persistência)
            let aptidoesCarregadas = [];
            let ganhasCarregadas = 0;
            
            if (window.localStorageManager) {
                try {
                    const storageData = window.localStorageManager.loadAptidoes();
                    if (storageData && storageData.personagemList && storageData.personagemList.length > 0) {
                        console.log('✅ Aptidões carregadas do localStorage:', storageData.personagemList.length);
                        aptidoesCarregadas = storageData.personagemList;
                        ganhasCarregadas = storageData.ganhas || 0;
                        
                        // Sincronizar com DB também
                        console.log('🔄 Sincronizando localStorage com IndexedDB...');
                        for (const apt of aptidoesCarregadas) {
                            try {
                                await aptidoesDB.addAptidaoPersonagem(apt.id, apt.nome, apt.nivel || 0);
                            } catch (e) {
                                console.warn('⚠️ Erro ao sincronizar aptidão no DB:', apt.nome);
                            }
                        }
                        
                        // Sincronizar ganhas
                        try {
                            await aptidoesDB.setConfig('ganhas', ganhasCarregadas);
                        } catch (e) {
                            console.warn('⚠️ Erro ao sincronizar ganhas no DB');
                        }
                    }
                } catch (storageError) {
                    console.warn('⚠️ Erro ao carregar do localStorage:', storageError);
                }
            }
            
            // ✅ PRIORIDADE 2: Se não achou no localStorage, carregar do DB
            if ((!aptidoesCarregadas || aptidoesCarregadas.length === 0) && window.aptidoesDB) {
                try {
                    const dbAptidoes = await aptidoesDB.getAptidoesPersonagem();
                    if (dbAptidoes && dbAptidoes.length > 0) {
                        aptidoesCarregadas = dbAptidoes;
                        console.log('✅ Aptidões carregadas do IndexedDB:', aptidoesCarregadas.length);
                    }
                } catch (dbError) {
                    console.warn('⚠️ Erro ao carregar do DB:', dbError);
                }
            }
            
            // Carregar ganhas do DB se ainda não foram carregadas
            if (ganhasCarregadas === 0) {
                try {
                    ganhasCarregadas = await aptidoesDB.getConfig('ganhas') || 0;
                } catch (e) {
                    console.warn('⚠️ Erro ao carregar ganhas:', e);
                    ganhasCarregadas = 0;
                }
            }
            
            // Atribuir ao estado do manager
            this.aptidoesPersonagem = aptidoesCarregadas || [];
            this.configAptidoes.ganhas = ganhasCarregadas;
            
            // ✅ CRÍTICO: Persistir em localStorage após carregar do DB
            // Isso garante que os dados do DB sempre sejam refletidos em localStorage
            try {
                if (window.localStorageManager && window.appState) {
                    // ✅ NOVO: Obter informações calculadas
                    const info = this.obterInfoAptidoesCalculada();
                    
                    const aptidoesData = {
                        personagemList: this.aptidoesPersonagem,
                        ganhas: this.configAptidoes.ganhas,
                        configAptidoes: this.configAptidoes,
                        // ✅ NOVO: Campos calculados
                        maximo: info.maximo,
                        atributoProxima: info.atributoProxima,
                        somaAtributos: info.somaAtributos,
                        maxBase: info.maxBase
                    };
                    
                    window.localStorageManager.saveAptidoes(aptidoesData);
                    console.log('💾 Aptidões sincronizadas em localStorage após carregar');
                }
            } catch (persistError) {
                console.warn('⚠️ Erro ao persistir em localStorage:', persistError);
            }
            
            // ✅ Sincronizar com StateManager
            try {
                if (window.appState && typeof window.appState.setAptidoes === 'function') {
                    window.appState.setAptidoes({
                        ganhas: this.configAptidoes.ganhas
                    });
                    console.log('📦 Sincronizado com AppState');
                }
            } catch (syncError) {
                console.warn('⚠️ Erro ao sincronizar com AppState:', syncError);
            }
            
            console.log('📦 Dados finais carregados:', {
                aptidoes: this.aptidoesPersonagem.length,
                ganhas: this.configAptidoes.ganhas
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.aptidoesPersonagem = [];
        }
    }

    /**
     * Abre modal de criar aptidão
     */
    openCriarModal() {
        const modal = document.getElementById('aptidoes-criar-modal');
        if (modal) {
            modal.classList.add('active');
            this.renderCriarCards();
            this.setupCriarModal();
        }
    }

    /**
     * Renderiza cards de aptidões para criar
     */
    renderCriarCards() {
        const container = document.getElementById('aptidoes-criar-cards');
        if (!container) return;

        container.innerHTML = '';

        this.catalogo.forEach(aptidao => {
            const card = document.createElement('div');
            card.className = 'aptidoes-card';
            card.dataset.id = aptidao.id;
            card.dataset.nome = aptidao.nome;

            card.innerHTML = `
                <img src="${aptidao.imagem}" alt="${aptidao.nome}" class="aptidoes-card-imagem">
                <span class="aptidoes-card-nome">${aptidao.nome}</span>
            `;

            card.addEventListener('click', () => this.toggleCard(card));
            container.appendChild(card);
        });
    }

    /**
     * Toggle de seleção de card
     */
    toggleCard(card) {
        card.classList.toggle('selected');
    }

    /**
     * Setup do modal de criar
     */
    setupCriarModal() {
        const modal = document.getElementById('aptidoes-criar-modal');
        const filtro = document.getElementById('aptidoes-criar-filtro');
        const btnConfirmar = document.getElementById('aptidoes-criar-confirmar-btn');
        const btnCancelar = document.getElementById('aptidoes-criar-cancelar-btn');
        const btnClose = modal?.querySelector('.modal-close-btn');

        if (filtro) {
            filtro.addEventListener('input', (e) => this.filtrarCards(e.target.value));
        }

        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => this.confirmarCriarAptidoes(modal));
        }

        if (btnCancelar || btnClose) {
            const fechar = () => this.closeModal(modal);
            if (btnCancelar) btnCancelar.addEventListener('click', fechar);
            if (btnClose) btnClose.addEventListener('click', fechar);
        }

        modal?.querySelector('.modal-overlay__backdrop')?.addEventListener('click', () => {
            this.closeModal(modal);
        });
    }

    /**
     * Filtra cards por texto
     */
    filtrarCards(texto) {
        const cards = document.querySelectorAll('.aptidoes-card');
        cards.forEach(card => {
            const nome = card.dataset.nome.toLowerCase();
            const visivel = nome.includes(texto.toLowerCase());
            card.style.display = visivel ? '' : 'none';
        });
    }

    /**
     * Confirma criar aptidões selecionadas
     */
    async confirmarCriarAptidoes(modal) {
        const selecionadas = document.querySelectorAll('.aptidoes-card.selected');
        
        if (selecionadas.length === 0) {
            alert('Selecione pelo menos uma aptidão!');
            return;
        }

        try {
            for (const card of selecionadas) {
                const id = card.dataset.id;
                const nome = card.dataset.nome;
                
                // Verificar se já existe
                const existe = this.aptidoesPersonagem.find(a => a.id === id);
                if (!existe) {
                    await aptidoesDB.addAptidaoPersonagem(id, nome, 0);
                }
            }

            // Recarregar e renderizar
            await this.loadPersonagemData();
            this.render();

            // ✅ PERSISTIR EM LOCALSTORAGE
            this.persistAptidoesData();

            this.closeModal(modal);
            this.notifyListeners('aptidoescriadas', { count: selecionadas.length });
        } catch (error) {
            console.error('❌ Erro ao criar aptidões:', error);
            alert('Erro ao criar aptidões');
        }
    }

    /**
     * Persiste dados das aptidões em localStorage E atualiza o estado
     */
    persistAptidoesData() {
        if (window.localStorageManager && window.appState) {
            try {
                // Obter estado atual
                const state = window.appState.getState();
                
                // ✅ NOVO: Obter informações calculadas (maximo, atributoProxima)
                const info = this.obterInfoAptidoesCalculada();
                
                // Preparar dados das aptidões personagem com níveis e infos
                // ✅ AGORA INCLUINDO maximo E atributoProxima
                const aptidoesData = {
                    personagemList: this.aptidoesPersonagem,
                    ganhas: this.configAptidoes.ganhas,
                    configAptidoes: this.configAptidoes,
                    // ✅ NOVO: Campos calculados
                    maximo: info.maximo,
                    atributoProxima: info.atributoProxima,
                    somaAtributos: info.somaAtributos,
                    maxBase: info.maxBase
                };

                // Salvar em localStorage
                window.localStorageManager.saveAptidoes(aptidoesData);
                console.log('💾 Aptidões salvas em localStorage:', aptidoesData);
                
                // IMPORTANTE: Atualizar o estado com setState para ativar auto-save
                window.appState.setState({
                    aptidoes: aptidoesData
                });
                console.log('📦 Estado das aptidões atualizado');

            } catch (error) {
                console.error('❌ Erro ao persistir aptidões:', error);
            }
        } else {
            console.warn('⚠️ LocalStorageManager ou AppState não disponível');
        }
    }

    /**
     * Abre modal de ganhar aptidão
     */
    openGanharModal() {
        const modal = document.getElementById('aptidoes-ganhar-modal');
        if (modal) {
            const atual = this.configAptidoes.ganhas;
            const nova = atual + 1;

            document.getElementById('aptidoes-ganhar-maximo-atual').textContent = atual;
            document.getElementById('aptidoes-ganhar-maximo-novo').textContent = nova;

            modal.classList.add('active');
            this.setupGanharModal(modal);
        }
    }

    /**
     * Setup do modal de ganhar
     */
    setupGanharModal(modal) {
        const btnConfirmar = document.getElementById('aptidoes-ganhar-confirmar-btn');
        const btnCancelar = document.getElementById('aptidoes-ganhar-cancelar-btn');
        const btnClose = modal?.querySelector('.modal-close-btn');

        const confirmar = async () => {
            try {
                this.configAptidoes.ganhas += 1;
                await aptidoesDB.setConfig('ganhas', this.configAptidoes.ganhas);
                this.render();

                // ✅ PERSISTIR EM LOCALSTORAGE
                this.persistAptidoesData();

                this.closeModal(modal);
                this.notifyListeners('ganhaup', { ganhas: this.configAptidoes.ganhas });
            } catch (error) {
                console.error('❌ Erro:', error);
            }
        };

        const fechar = () => this.closeModal(modal);

        if (btnConfirmar) btnConfirmar.onclick = confirmar;
        if (btnCancelar) btnCancelar.onclick = fechar;
        if (btnClose) btnClose.onclick = fechar;

        modal?.querySelector('.modal-overlay__backdrop')?.addEventListener('click', fechar);
    }

    /**
     * Abre modal de remover ganhas
     */
    openRemoverModal() {
        const modal = document.getElementById('aptidoes-remover-modal');
        if (modal) {
            if (this.configAptidoes.ganhas === 0) {
                alert('Nenhuma aptidão ganha para remover!');
                return;
            }

            const atual = this.configAptidoes.ganhas;
            const nova = Math.max(0, atual - 1);

            document.getElementById('aptidoes-remover-ganhas-atual').textContent = atual;
            document.getElementById('aptidoes-remover-ganhas-nova').textContent = nova;

            modal.classList.add('active');
            this.setupRemoverModal(modal);
        }
    }

    /**
     * Setup do modal de remover
     */
    setupRemoverModal(modal) {
        const btnConfirmar = document.getElementById('aptidoes-remover-confirmar-btn');
        const btnCancelar = document.getElementById('aptidoes-remover-cancelar-btn');
        const btnClose = modal?.querySelector('.modal-close-btn');

        const confirmar = async () => {
            try {
                this.configAptidoes.ganhas = Math.max(0, this.configAptidoes.ganhas - 1);
                await aptidoesDB.setConfig('ganhas', this.configAptidoes.ganhas);
                this.render();

                // ✅ PERSISTIR EM LOCALSTORAGE
                this.persistAptidoesData();

                this.closeModal(modal);
                this.notifyListeners('ganhadown', { ganhas: this.configAptidoes.ganhas });
            } catch (error) {
                console.error('❌ Erro:', error);
            }
        };

        const fechar = () => this.closeModal(modal);

        if (btnConfirmar) btnConfirmar.onclick = confirmar;
        if (btnCancelar) btnCancelar.onclick = fechar;
        if (btnClose) btnClose.onclick = fechar;

        modal?.querySelector('.modal-overlay__backdrop')?.addEventListener('click', fechar);
    }

    /**
     * Força sincronização completa com localStorage e re-renderização
     * Usar para DEBUG
     */
    forceSync() {
        console.log('\n🔄 FORCE SYNC CHAMADO');
        
        // Carregar do localStorage
        if (window.localStorageManager) {
            const storageData = window.localStorageManager.loadAptidoes();
            console.log('📦 Dados do localStorage:', storageData);
            
            if (storageData && storageData.personagemList) {
                this.aptidoesPersonagem = storageData.personagemList;
                this.configAptidoes.ganhas = storageData.ganhas || 0;
                console.log(`✅ Sincronizado: ${this.aptidoesPersonagem.length} aptidões carregadas`);
            }
        }
        
        // Re-renderizar
        console.log('🎨 Re-renderizando...');
        this.render();
        console.log('✅ Force sync completo!\n');
    }

    /**
     * Renderiza a interface completa
     */
    render() {
        console.log('🔄 [AptidoesManager.render()] Iniciando sincronização completa');
        
        // ✅ CRÍTICO: SEMPRE sincronizar com localStorage antes de renderizar
        // Isso garante que se houve mudanças externas, temos os dados mais recentes
        if (window.localStorageManager) {
            try {
                const storageData = window.localStorageManager.loadAptidoes();
                if (storageData && storageData.personagemList) {
                    // Se há dados diferentes no localStorage, usar eles
                    if (storageData.personagemList.length > 0 && 
                        JSON.stringify(storageData.personagemList) !== JSON.stringify(this.aptidoesPersonagem)) {
                        console.log('🔄 Sincronizando com dados do localStorage antes de renderizar');
                        this.aptidoesPersonagem = storageData.personagemList;
                        this.configAptidoes.ganhas = storageData.ganhas || 0;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Erro ao sincronizar com localStorage:', e);
            }
        }
        
        console.log('   - Aptidões adquiridas:', this.aptidoesPersonagem.length);
        console.log('   - Ganhas:', this.configAptidoes.ganhas);
        
        this.renderControlPanel();
        this.renderAptidoesPersonagem();
        this.renderVantagens();
        
        console.log('✅ [AptidoesManager.render()] Sincronização concluída');
    }

    /**
     * Renderiza painel de controle
     */
    renderControlPanel() {
        const atual = this.getAtualTotal();
        const info = this.obterInfoAptidoesCalculada();
        const ganhas = this.configAptidoes.ganhas;

        // DEBUG COMPLETO
        console.log('🎯 [renderControlPanel] INICIANDO ATUALIZAÇÃO DO PAINEL');
        console.log('🎯 Info calculada:', {
            atual,
            maximo: info.maximo,
            atributoProxima: info.atributoProxima,
            ganhas,
            somaAtributos: info.somaAtributos,
            maxBase: info.maxBase
        });

        // Atualizar campo Atual
        const elemAtual = document.getElementById('aptidoes-atual');
        if (elemAtual) {
            elemAtual.textContent = atual;
            console.log('✅ Campo "Atual" atualizado:', atual);
        } else {
            console.error('❌ Elemento "aptidoes-atual" não encontrado!');
        }

        // Atualizar campo Ganhas
        const elemGanhas = document.getElementById('aptidoes-ganhas');
        if (elemGanhas) {
            elemGanhas.textContent = ganhas;
            console.log('✅ Campo "Ganhas" atualizado:', ganhas);
        } else {
            console.error('❌ Elemento "aptidoes-ganhas" não encontrado!');
        }

        // Atualizar campo Máximo
        const elemMaximo = document.getElementById('aptidoes-maximo');
        if (elemMaximo) {
            elemMaximo.textContent = info.maximo;
            console.log('✅ Campo "Máximo" atualizado:', info.maximo, '← CRÍTICO');
        } else {
            console.error('❌ Elemento "aptidoes-maximo" não encontrado!');
        }
        
        // Atualizar campo Atributo p/ +1
        const proximaElement = document.getElementById('aptidoes-atributo-proxima');
        if (proximaElement) {
            const textProxima = info.atributoProxima === 0 ? 'Já aumenta!' : info.atributoProxima;
            proximaElement.textContent = textProxima;
            console.log('✅ Campo "Atributo p/ +1" atualizado:', textProxima, '← CRÍTICO');
        } else {
            console.error('❌ Elemento "aptidoes-atributo-proxima" não encontrado!');
        }

        console.log('🎯 [renderControlPanel] ═══ PAINEL ATUALIZADO ═══');
    }

    /**
     * Renderiza tabela de aptidões do personagem
     */
    renderAptidoesPersonagem() {
        const container = document.getElementById('aptidoes-personagem-list');
        if (!container) {
            console.error('❌ Container "aptidoes-personagem-list" não encontrado!');
            return;
        }

        console.log('🎨 [renderAptidoesPersonagem] Renderizando', this.aptidoesPersonagem.length, 'aptidões');

        if (this.aptidoesPersonagem.length === 0) {
            container.innerHTML = '<div class="aptidoes-empty-message">Nenhuma aptidão adquirida ainda</div>';
            console.log('✅ Container de aptidões vazio renderizado');
            return;
        }

        container.innerHTML = '';

        // Adicionar header de colunas
        const header = document.createElement('div');
        header.className = 'aptidoes-personagem-header';
        header.innerHTML = `
            <div class="aptidoes-personagem-header-nome">Aptidão</div>
            <div class="aptidoes-personagem-header-nivel">Nível</div>
            <div class="aptidoes-personagem-header-bonus">Bônus</div>
            <div class="aptidoes-personagem-header-actions">Ações</div>
        `;
        container.appendChild(header);

        this.aptidoesPersonagem.forEach(apt => {
            // Buscar nome da aptidão no catálogo
            let nomeAptidao = apt.nome || apt.id;
            const catalogoItem = this.catalogo.find(c => c.id === apt.id);
            if (catalogoItem) {
                nomeAptidao = catalogoItem.nome;
            }

            const bonusText = this.calcularBonus(apt.nivel);
            const row = document.createElement('div');
            row.className = 'aptidoes-personagem-row';

            row.innerHTML = `
                <div class="aptidoes-personagem-nome">${nomeAptidao}</div>
                <div class="aptidoes-personagem-nivel">${apt.nivel}</div>
                <div class="aptidoes-personagem-bonus">${bonusText}</div>
                <div class="aptidoes-personagem-actions">
                    <button class="aptidoes-action-btn" title="Subir nível" data-action="upgrade" data-id="${apt.id}">⬆️</button>
                    <button class="aptidoes-action-btn" title="Resetar" data-action="reset" data-id="${apt.id}">🔄</button>
                    <button class="aptidoes-action-btn" title="Remover" data-action="remove" data-id="${apt.id}">❌</button>
                </div>
            `;

            container.appendChild(row);
        });

        // ✅ NOVO: Usar event delegation para os botões de ação
        // Remove o handler anterior se existir
        if (this._aptidoesActionClickHandler) {
            container.removeEventListener('click', this._aptidoesActionClickHandler);
        }

        // Criar novo handler com binding correto
        this._aptidoesActionClickHandler = (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');

            console.log(`🎯 Action detectada: ${action}, ID: ${id}`);

            if (action === 'upgrade') {
                this.upgradeAptidao(id);
            } else if (action === 'reset') {
                this.resetAptidao(id);
            } else if (action === 'remove') {
                this.removeAptidao(id);
            }
        };

        // Adicionar novo handler
        container.addEventListener('click', this._aptidoesActionClickHandler);

        console.log('✅ [renderAptidoesPersonagem] Renderizado com sucesso');
    }

    /**
     * Renderiza vantagens desbloqueadas
     */
    renderVantagens() {
        console.log('🎨 [renderVantagens] Delegando para RenderVantagensAptidoes...');
        
        // ✨ NOVO: Usar o novo sistema de renderização de vantagens
        if (window.renderVantagensAptidoes && typeof window.renderVantagensAptidoes.renderizar === 'function') {
            console.log('✅ Usando novo sistema RenderVantagensAptidoes');
            window.renderVantagensAptidoes.renderizar();
            return;
        }

        // Fallback para sistema antigo (se novo não estiver disponível)
        console.warn('⚠️ RenderVantagensAptidoes não disponível, usando fallback');
        
        const container = document.getElementById('aptidoes-vantagens-list');
        if (!container) return;

        const vantagens = this.getVantagens();

        if (vantagens.length === 0) {
            container.innerHTML = '<div class="aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
            return;
        }

        container.innerHTML = '';

        // Adicionar header de colunas
        const header = document.createElement('div');
        header.className = 'aptidoes-vantagem-header';
        header.innerHTML = `
            <div class="aptidoes-vantagem-header-nome">Vantagem</div>
            <div class="aptidoes-vantagem-header-nivel">Nível</div>
            <div class="aptidoes-vantagem-header-tipo">Tipo</div>
            <div class="aptidoes-vantagem-header-efeito">Efeito</div>
        `;
        container.appendChild(header);

        vantagens.forEach(van => {
            // Validação de segurança
            if (!van || !van.nome || !van.efeito) {
                console.warn('⚠️ Vantagem inválida:', van);
                return;
            }

            const row = document.createElement('div');
            row.className = 'aptidoes-vantagem-row';

            const tipo = van.tipo || 'Bônus';
            const tipoClass = `aptidoes-vantagem-tipo--${tipo.toLowerCase()}`;
            row.innerHTML = `
                <div class="aptidoes-vantagem-nome">${van.nome}</div>
                <div class="aptidoes-vantagem-nivel">Nv ${van.nivel}</div>
                <div class="aptidoes-vantagem-tipo ${tipoClass}">${tipo}</div>
                <div class="aptidoes-vantagem-efeito">${van.efeito}</div>
            `;

            container.appendChild(row);
        });

        console.log('✅ [renderVantagens] Renderizado', vantagens.length, 'vantagens');
    }

    /**
     * Upgrade de aptidão
     */
    /**
     * Subir nível de uma aptidão
     */
    async upgradeAptidao(id) {
        if (!id) {
            console.error('❌ ID inválido');
            return;
        }

        const apt = this.aptidoesPersonagem.find(a => a && a.id === id);
        if (!apt) {
            console.error('❌ Aptidão não encontrada:', id);
            return;
        }

        // Verificar nível máximo (6)
        if (apt.nivel >= 6) {
            alert('⚠️ Nível máximo (6) atingido!');
            return;
        }

        // Verificar limite de aptidões (Atual vs Máximo)
        const info = this.obterInfoAptidoesCalculada();
        const atual = this.getAtualTotal();
        
        if (atual >= info.maximo) {
            alert(`⚠️ Limite de aptidões atingido!\n\nVocê tem ${atual}/${info.maximo} aptidões.\nPrecisa de mais pontos para aumentar o limite.`);
            return;
        }

        try {
            apt.nivel += 1;
            console.log(`✅ ${apt.nome} subiu para nível ${apt.nivel}`);
            
            // Tentar salvar no IndexedDB
            if (window.aptidoesDB && window.aptidoesDB.db) {
                await window.aptidoesDB.updateAptidaoPersonagem(id, { nivel: apt.nivel });
                console.log(`💾 Nível salvo no IndexedDB: ${apt.nome} nv ${apt.nivel}`);
            }
            
            // ✅ Persistir dados
            this.persistAptidoesData();
            
            // ✅ Render uma vez
            this.render();

            // 🧮 NOVO: Recalcular bônus automaticamente (UMA VEZ)
            if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
                console.log('🧮 Acionando ciclo completo de recálculo de bônus...');
                window.bonusCalculator.cicloCompletoAtualizacao();
            }
        } catch (error) {
            console.error('❌ Erro:', error);
            apt.nivel -= 1; // Reverter se falhar
        }
    }

    /**
     * Resetar nível de uma aptidão para 0
     */
    async resetAptidao(id) {
        if (!id) {
            console.error('❌ ID inválido');
            return;
        }

        if (!confirm('Resetar nível desta aptidão para 0?')) return;

        const apt = this.aptidoesPersonagem.find(a => a && a.id === id);
        if (!apt) {
            console.error('❌ Aptidão não encontrada:', id);
            return;
        }

        try {
            // 🗑️ NOVO: Limpar bônus opcionais dessa aptidão
            if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.limparBonusOpcionalDaAptidao === 'function') {
                console.log(`🗑️ Limpando dados de bônus opcional de: ${id}`);
                window.vantagensAptidoesSystem.limparBonusOpcionalDaAptidao(id);
            }

            apt.nivel = 0;
            console.log(`✅ ${apt.nome} resetada para nível 0`);
            
            // Tentar salvar no IndexedDB
            if (window.aptidoesDB && window.aptidoesDB.db) {
                await window.aptidoesDB.updateAptidaoPersonagem(id, { nivel: 0 });
                console.log(`💾 Nível resetado no IndexedDB: ${apt.nome}`);
            }
            
            // ✅ Persistir dados
            this.persistAptidoesData();
            
            // ✅ Render uma vez
            this.render();

            // 🧮 NOVO: Recalcular bônus automaticamente (UMA VEZ)
            if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
                console.log('🧮 Acionando ciclo completo de recálculo de bônus...');
                window.bonusCalculator.cicloCompletoAtualizacao();
            }
        } catch (error) {
            console.error('❌ Erro:', error);
        }
    }

    /**
     * Remove uma aptidão completamente
     */
    async removeAptidao(id) {
        if (!id) {
            console.error('❌ ID inválido');
            return;
        }

        if (!confirm('Remover esta aptidão?')) return;

        try {
            // 🗑️ NOVO: Limpar bônus opcionais dessa aptidão
            if (window.vantagensAptidoesSystem && typeof window.vantagensAptidoesSystem.limparBonusOpcionalDaAptidao === 'function') {
                console.log(`🗑️ Limpando dados de bônus opcional de: ${id}`);
                window.vantagensAptidoesSystem.limparBonusOpcionalDaAptidao(id);
            }

            // Tentar remover do IndexedDB
            if (window.aptidoesDB && window.aptidoesDB.db) {
                await window.aptidoesDB.removeAptidaoPersonagem(id);
                console.log(`💾 Aptidão removida do IndexedDB: ${id}`);
            }
            
            // Remover da lista em memória
            this.aptidoesPersonagem = this.aptidoesPersonagem.filter(a => a.id !== id);
            console.log(`✅ Aptidão removida: ${id}`);
            
            // ✅ PERSISTIR EM LOCALSTORAGE
            this.persistAptidoesData();
            
            // ✅ Render uma vez
            this.render();

            // 🧮 NOVO: Recalcular bônus automaticamente (UMA VEZ)
            if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
                console.log('🧮 Acionando ciclo completo de recálculo de bônus...');
                window.bonusCalculator.cicloCompletoAtualizacao();
            }
        } catch (error) {
            console.error('❌ Erro ao remover:', error);
        }
    }

    /**
     * Calcula bônus de um nível
     */
    calcularBonus(nivel) {
        if (nivel === 0) return '—';
        const bonus = Math.floor(nivel / 2);
        return `+${bonus}`;
    }

    /**
     * Obtém total atual de níveis
     */
    getAtualTotal() {
        return this.aptidoesPersonagem.reduce((sum, apt) => sum + apt.nivel, 0);
    }

    /**
     * Calcula máximo baseado nos atributos primários
     */
    getMaximo() {
        if (typeof AptidoesCalculator !== 'undefined') {
            return AptidoesCalculator.calcularMaximoFinal();
        }
        // Fallback se calculator não estiver carregado
        return this.configAptidoes.ganhas + 6;
    }

    /**
     * Recalcula e renderiza o painel de aptidões
     * Deve ser chamado quando atributos são alterados
     */
    recalcularEAtualizar() {
        console.log('🔄 [AptidoesManager] Recalculando e atualizando UI...');
        console.log('🔄 Atributos ATUAIS:', window.atributosManager?.personagemData?.atributos);
        
        // ✅ NOVO: Forçar limpeza de cache no AptidoesCalculator
        if (typeof AptidoesCalculator !== 'undefined' && typeof AptidoesCalculator.invalidateCache === 'function') {
            console.log('🔄 [AptidoesManager] Invalidando cache do calculador...');
            AptidoesCalculator.invalidateCache();
        }
        
        console.log('🔄 Chamando render()...');
        this.render();
        console.log('✅ [AptidoesManager] Render completado!');
        
        // ✅ NOVO: Log de debug para confirmar sincronização
        try {
            const info = this.obterInfoAptidoesCalculada();
            console.log('🎯 [AptidoesManager] Valores Finais Sincronizados:', {
                maximo: info.maximo,
                atributoProxima: info.atributoProxima,
                somaAtributos: info.somaAtributos,
                podeAdicionar: info.podeAdicionar,
            });
        } catch (e) {
            console.error('❌ [AptidoesManager] Erro ao obter informações:', e);
        }
    }

    /**
     * Obtém informações completas de aptidões calculadas
     */
    obterInfoAptidoesCalculada() {
        if (typeof AptidoesCalculator !== 'undefined') {
            try {
                const result = AptidoesCalculator.obterInfoAptidoes();
                console.log('✅ [AptidoesManager] Dados de AptidoesCalculator:', result);
                return result;
            } catch (e) {
                console.error('❌ [AptidoesManager] Erro ao chamar AptidoesCalculator.obterInfoAptidoes():', e);
            }
        }
        // Fallback quando AptidoesCalculator não está disponível
        console.warn('⚠️ [AptidoesManager] Usando fallback - AptidoesCalculator não disponível');
        const ganhas = this.configAptidoes.ganhas || 0;
        return {
            maximo: ganhas + 6,  // Fallback: 6 é o máximo base
            atributoProxima: 0,  // 0 significa "vai aumentar"
            podeAdicionar: true,
            podeUpgrade: true,
            somaAtributos: 0,
            maxBase: 6,
            ganhas: ganhas
        };
    }

    /**
     * Informação de próximo nível (método legado mantido por compatibilidade)
     */
    getProximoNivel() {
        if (typeof AptidoesCalculator !== 'undefined') {
            const valor = AptidoesCalculator.calcularAtributoPraProximoMaximo();
            return valor === 0 ? 'Já aumenta!' : `${valor} pts`;
        }
        return '—';
    }

    /**
     * Obtém vantagens desbloqueadas
     */
    getVantagens() {
        const vantagens = [];

        this.aptidoesPersonagem.forEach(apt => {
            const catalogoItem = this.catalogo.find(c => c.id === apt.id);
            if (!catalogoItem || !catalogoItem.vantagens) return;

            // Adicionar vantagens para cada nível - com validação
            catalogoItem.vantagens
                .filter(v => v && v.nivel && v.nivel <= apt.nivel && v.efeito)
                .forEach(v => {
                    vantagens.push({
                        nome: catalogoItem.nome,
                        nivel: v.nivel,
                        tipo: v.tipo || 'Bônus', // Se não tiver tipo, usar 'Bônus' como padrão
                        efeito: v.efeito,
                        aptidaoId: apt.id,
                        narrativa: v.narrativa
                    });
                });
        });

        return vantagens;
    }

    /**
     * Registra listener
     */
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notifica listeners
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    /**
     * Fecha modal
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            // Limpar listeners de input
            const filtro = modal.querySelector('[type="text"]');
            if (filtro) filtro.value = '';
        }
    }
}

// Instância global - Inicializar quando o DOM estiver pronto
let aptidoesManager = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Criando instância global de aptidoesManager...');
    
    // ESPERAR UM POUCO PARA O INDEXEDDB ESTAR PRONTO
    await new Promise(resolve => setTimeout(resolve, 500));
    
    aptidoesManager = new AptidoesManager();
    window.aptidoesManager = aptidoesManager; // ✅ EXPOR IMEDIATAMENTE
    
    // Inicializar o manager com retry
    let tentativas = 0;
    const maxTentativas = 5;
    
    const inicializar = async () => {
        try {
            console.log(`🎮 Tentativa ${tentativas + 1}/${maxTentativas} de inicializar...`);
            const sucesso = await aptidoesManager.init();
            
            if (sucesso) {
                console.log('✅ AptidoesManager pronto!');
                window.aptidoesManagerReady = true;
                return true;
            } else {
                throw new Error('init() retornou false');
            }
        } catch (error) {
            tentativas++;
            console.error(`❌ Erro na tentativa ${tentativas}:`, error.message);
            
            if (tentativas < maxTentativas) {
                const delayMs = 1000 * tentativas;
                console.log(`⏳ Aguardando ${delayMs}ms antes de nova tentativa...`);
                return new Promise(resolve => {
                    setTimeout(() => {
                        inicializar().then(resolve);
                    }, delayMs);
                });
            } else {
                console.error('❌ Falha após todas as tentativas - criando fallback');
                window.aptidoesManagerReady = false;
                return false;
            }
        }
    };
    
    await inicializar();
});
