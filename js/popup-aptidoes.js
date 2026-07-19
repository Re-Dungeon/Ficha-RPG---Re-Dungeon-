/* ============================================ */
/* POPUP-APTIDOES.JS - Popups de Ganhar/Remover */
/* Sistema de popup com números 1-9            */
/* ============================================ */

class PopupAptidoes {
    constructor() {
        this.modalGanharId = 'modal-ganhar-popup';
        this.modalRemoverId = 'modal-remover-popup';
        this.btnGanharId = 'btn-ganhar-aptidao';
        this.btnRemoverId = 'btn-remover-aptidao';
        this.listeners = [];
        this.aptidaoSelecionada = null; // ✅ INICIALIZAR
        
        // Contexto de companheiro
        this.contextoCompanheiro = false;
        this.modalCompanheiro = null;
        this.controllerCompanheiro = null;
    }

    /**
     * Inicializa o popup
     */
    async init() {
        console.log('🎯 [PopupAptidoes] Inicializando...');

        // Aguardar dependências
        await this.waitForDependencies();

        // Recuperar elementos
        const btnGanhar = document.getElementById(this.btnGanharId);
        const btnRemover = document.getElementById(this.btnRemoverId);

        if (!btnGanhar || !btnRemover) {
            console.error('❌ [PopupAptidoes] Botões não encontrados');
            return false;
        }

        // Criar grid de números
        this.criarGridNumeros();

        // Setup listeners
        this.setupEventListeners();

        console.log('✅ [PopupAptidoes] Inicializado com sucesso');
        return true;
    }

    /**
     * Aguarda dependências
     */
    async waitForDependencies() {
        let tentativas = 0;
        const maxTentativas = 50;

        while (!window.aptidoesManager && tentativas < maxTentativas) {
            console.log(`⏳ [PopupAptidoes] Aguardando window.aptidoesManager`);
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!window.aptidoesManager) {
            console.error('❌ [PopupAptidoes] window.aptidoesManager não disponível');
            return false;
        }

        console.log('✅ [PopupAptidoes] Dependências prontas');
        return true;
    }

    /**
     * Cria grid de números (1-9)
     */
    criarGridNumeros() {
        // Grid Ganhar
        const containerGanhar = document.getElementById('popup-ganhar-numbers');
        if (containerGanhar) {
            containerGanhar.innerHTML = this.gerarBotoesNumeros(1, 9, 'ganhar');
        }

        // Grid Remover
        const containerRemover = document.getElementById('popup-remover-numbers');
        if (containerRemover) {
            containerRemover.innerHTML = this.gerarBotoesNumeros(1, 9, 'remover');
        }

        // 🐾 Grid Ganhar Companheiro
        const containerCompGanhar = document.getElementById('popup-comp-ganhar-numbers');
        if (containerCompGanhar) {
            containerCompGanhar.innerHTML = this.gerarBotoesNumeros(1, 9, 'comp-ganhar');
        }

        // 🐾 Grid Remover Companheiro
        const containerCompRemover = document.getElementById('popup-comp-remover-numbers');
        if (containerCompRemover) {
            containerCompRemover.innerHTML = this.gerarBotoesNumeros(1, 9, 'comp-remover');
        }
    }

    /**
     * Gera HTML dos botões de números
     */
    gerarBotoesNumeros(inicio, fim, tipo) {
        let html = '';
        for (let i = inicio; i <= fim; i++) {
            html += `
                <button class="popup-number-btn" data-numero="${i}" data-tipo="${tipo}">
                    ${i}
                </button>
            `;
        }
        return html;
    }

    /**
     * Setup de event listeners
     */
    setupEventListeners() {
        const btnGanhar = document.getElementById(this.btnGanharId);
        const btnRemover = document.getElementById(this.btnRemoverId);
        const modalGanhar = document.getElementById(this.modalGanharId);
        const modalRemover = document.getElementById(this.modalRemoverId);

        // 🐾 Botões de Companheiro
        const btnCompGanhar = document.getElementById('btn-comp-ganhar-aptidao');
        const btnCompRemover = document.getElementById('btn-comp-remover-aptidao');
        const modalCompGanhar = document.getElementById('modal-comp-ganhar-popup');
        const modalCompRemover = document.getElementById('modal-comp-remover-popup');

        // Botão Ganhar
        if (btnGanhar) {
            btnGanhar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.abrirPopup('ganhar');
            });
        }

        // Botão Remover
        if (btnRemover) {
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.abrirPopup('remover');
            });
        }

        // 🐾 Botão Ganhar Companheiro
        if (btnCompGanhar) {
            btnCompGanhar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.abrirPopup('comp-ganhar');
            });
        }

        // 🐾 Botão Remover Companheiro
        if (btnCompRemover) {
            btnCompRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.abrirPopup('comp-remover');
            });
        }

        // 🐾 Botão Gerenciar Aptidões Companheiro
        const btnCompAbrirAptidoes = document.getElementById('btn-comp-abrir-aptidoes');
        if (btnCompAbrirAptidoes) {
            btnCompAbrirAptidoes.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.abrirGerenciadorCompanheiro();
            });
        }

        // Botões de fechar
        document.querySelectorAll('.modal-popup .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fecharPopup();
            });
        });

        // Backdrop
        document.querySelectorAll('.modal-popup .modal-overlay__backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.fecharPopup();
                }
            });
        });

        // Botões de números
        document.querySelectorAll('.popup-number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const numero = parseInt(btn.getAttribute('data-numero'));
                const tipo = btn.getAttribute('data-tipo');
                this.selecionarNumero(numero, tipo);
            });
        });

        // ESC para fechar
        this.listeners.push((e) => {
            if (e.key === 'Escape') {
                this.fecharPopup();
            }
        });
        document.addEventListener('keydown', this.listeners[this.listeners.length - 1]);

        console.log('✅ [PopupAptidoes] Event listeners configurados');
    }

    /**
     * Abre o popup
     */
    abrirPopup(tipo) {
        console.log(`📂 [PopupAptidoes] Abrindo popup: ${tipo}`);

        let modalId;
        if (tipo === 'ganhar') {
            modalId = this.modalGanharId;
        } else if (tipo === 'remover') {
            modalId = this.modalRemoverId;
        } else if (tipo === 'comp-ganhar') {
            modalId = 'modal-comp-ganhar-popup';
        } else if (tipo === 'comp-remover') {
            modalId = 'modal-comp-remover-popup';
        }

        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Abre popup para ganhar em uma aptidão específica (para modal de gerenciar)
     */
    abrirPopupGanharAptidao(aptidaoId) {
        console.log(`📂 [PopupAptidoes] Abrindo popup para aptidão: ${aptidaoId}`);
        
        // Guardar ID temporário
        this.aptidaoSelecionada = aptidaoId;
        
        // Abrir popup normal
        this.abrirPopup('ganhar');
    }

    /**
     * Fecha o popup
     */
    fecharPopup() {
        console.log('🔒 [PopupAptidoes] Fechando popup');

        const modalGanhar = document.getElementById(this.modalGanharId);
        const modalRemover = document.getElementById(this.modalRemoverId);
        const modalCompGanhar = document.getElementById('modal-comp-ganhar-popup');
        const modalCompRemover = document.getElementById('modal-comp-remover-popup');

        if (modalGanhar) modalGanhar.classList.remove('active');
        if (modalRemover) modalRemover.classList.remove('active');
        if (modalCompGanhar) modalCompGanhar.classList.remove('active');
        if (modalCompRemover) modalCompRemover.classList.remove('active');
        
        // Limpar estado
        this.aptidaoSelecionada = null;
    }

    /**
     * Seleciona um número
     */
    selecionarNumero(numero, tipo) {
        console.log(`🔢 [PopupAptidoes] Selecionado: ${numero} (${tipo})`);

        // 🐾 Suporte a Companheiro via tipo 'comp-ganhar' ou 'comp-remover'
        if (tipo === 'comp-ganhar' || tipo === 'comp-remover') {
            this.selecionarNumeroCompanheiroDireto(numero, tipo);
            return;
        }

        // ✅ ANTIGO: Suporte a Companheiro via contexto
        if (this.contextoCompanheiro && this.modalCompanheiro && this.controllerCompanheiro) {
            console.log(`🐾 [PopupAptidoes] Atualizando companheiro no contexto`);
            this.selecionarNumeroCompanheiro(numero, tipo);
            return;
        }

        const manager = window.aptidoesManager;
        if (!manager) {
            console.error('❌ AptidoesManager não disponível');
            return;
        }

        // Se há uma aptidão específica selecionada (do modal de gerenciar)
        if (this.aptidaoSelecionada) {
            console.log(`🎯 Atualizando aptidão específica: ${this.aptidaoSelecionada}`);
            this.ganharAptidaoEspecifica(this.aptidaoSelecionada, numero);
            return; // A função ganharAptidaoEspecifica faz o resto
        }

        // Caso contrário, atualizar o campo "Ganhas" normal
        const campoGanhas = document.getElementById('aptidoes-ganhas');
        let ganhasAtual = parseInt(campoGanhas?.textContent || '0');

        if (tipo === 'ganhar') {
            ganhasAtual += numero;
        } else if (tipo === 'remover') {
            ganhasAtual = Math.max(0, ganhasAtual - numero);
        }

        // Atualizar valor
        if (campoGanhas) {
            campoGanhas.textContent = ganhasAtual;
        }

        // Atualizar no manager também
        if (manager.configAptidoes) {
            manager.configAptidoes.ganhas = ganhasAtual;
        }

        console.log(`✅ Ganhas atualizado para: ${ganhasAtual}`);

        // Fechar popup
        this.fecharPopup();

        // Atualizar UI do manager se existir
        if (manager.render) {
            try {
                manager.render();
            } catch (e) {
                console.warn('⚠️ Render do manager não disponível');
            }
        }
    }

    /**
     * Ganhar nível em uma aptidão específica
     */
    async ganharAptidaoEspecifica(aptidaoId, quantidade) {
        const manager = window.aptidoesManager;
        if (!manager || !manager.catalogo) {
            console.error('❌ Manager ou catálogo não disponível');
            return;
        }

        // ✅ NOVO: Aguardar manager estar pronto
        let tentativas = 0;
        while (!manager.aptidoesPersonagem && tentativas < 50) {
            console.log('⏳ Aguardando manager estar pronto...');
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!manager.aptidoesPersonagem) {
            console.error('❌ Manager não inicializou a tempo');
            return;
        }

        const aptidao = manager.catalogo.find(a => a.id === aptidaoId);
        if (!aptidao) {
            console.error('❌ Aptidão não encontrada:', aptidaoId);
            return;
        }

        // Verificar se já tem a aptidão
        let apt = manager.aptidoesPersonagem.find(a => a.id === aptidaoId);
        
        if (!apt) {
            // Criar nova aptidão
            apt = {
                id: aptidaoId,
                nome: aptidao.nome,
                nivel: Math.min(quantidade, 5)
            };
            manager.aptidoesPersonagem.push(apt);
            console.log('✨ Nova aptidão adquirida:', apt.nome, 'Nível', apt.nivel);
            
            // Salvar no banco de dados
            try {
                if (window.aptidoesDB && window.aptidoesDB.db) {
                    await aptidoesDB.addAptidaoPersonagem(aptidaoId, aptidao.nome, apt.nivel);
                    console.log('💾 Aptidão salva no DB');
                } else {
                    console.warn('⚠️ aptidoesDB não está pronto ainda');
                }
            } catch (error) {
                console.error('❌ Erro ao salvar no DB:', error);
            }

            // ✅ NOVO: Recalcular bônus de aptidões
            if (window.bonusCalculator) {
                try {
                    console.log('🧮 Recalculando bônus após nova aptidão...');
                    window.bonusCalculator.cicloCompletoAtualizacao();
                    console.log('✅ Ciclo de bônus concluído');
                } catch (e) {
                    console.error('❌ Erro ao atualizar bônus:', e.message);
                }
            }
        } else {
            // Aumentar nível existente
            apt.nivel = Math.min(apt.nivel + quantidade, 5);
            console.log('⬆️ Nível aumentado em', apt.nome, 'para', apt.nivel);
            
            // Atualizar no banco de dados
            try {
                if (window.aptidoesDB && window.aptidoesDB.db) {
                    await aptidoesDB.updateAptidaoNivel(aptidaoId, apt.nivel);
                    console.log('💾 Nível atualizado no DB');
                } else {
                    console.warn('⚠️ aptidoesDB não está pronto ainda');
                }
            } catch (error) {
                console.error('❌ Erro ao atualizar no DB:', error);
            }
        }

        // ✅ NOVO: Recalcular bônus de aptidões
        if (window.bonusCalculator) {
            try {
                console.log('🧮 Recalculando bônus após alteração de nível...');
                window.bonusCalculator.cicloCompletoAtualizacao();
                console.log('✅ Ciclo de bônus concluído');
            } catch (e) {
                console.error('❌ Erro ao atualizar bônus:', e.message);
            }
        }

        // ✅ PERSISTIR EM LOCALSTORAGE após qualquer alteração
        if (window.aptidoesManager && typeof window.aptidoesManager.persistAptidoesData === 'function') {
            try {
                window.aptidoesManager.persistAptidoesData();
                console.log('💾 Aptidões persistidas em localStorage');
            } catch (e) {
                console.warn('⚠️ Erro ao persistir aptidões:', e.message);
            }
        }

        // Fechar popup
        this.fecharPopup();

        // Atualizar UI do AptidoesManager (aba de aptidões)
        console.log('🔄 Renderizando boxes...');
        if (window.gerenciarAptidoesModal) {
            try {
                window.gerenciarAptidoesModal.renderizarAptidoesNasBoxes(manager.aptidoesPersonagem);
                console.log('✅ Boxes atualizadas via GerenciarAptidoesModal');
            } catch (e) {
                console.warn('⚠️ Erro ao atualizar boxes:', e.message);
                // ✅ FALLBACK
                this.renderizarBoxesDiretamente(manager.aptidoesPersonagem);
            }
        } else {
            // ✅ FALLBACK
            console.warn('⚠️ GerenciarAptidoesModal não disponível');
            this.renderizarBoxesDiretamente(manager.aptidoesPersonagem);
        }
    }

    /**
     * Renderizar boxes diretamente (fallback quando modal não disponível)
     */
    renderizarBoxesDiretamente(aptidoes) {
        console.log('📦 [PopupAptidoes] Renderizando boxes direto com', aptidoes?.length || 0, 'aptidões');

        const manager = window.aptidoesManager;

        // BOX 1: Aptidões Adquiridas
        const boxAptidoes = document.querySelector('#aptidoes-personagem-list');
        if (!boxAptidoes) {
            console.error('❌ BOX 1 (#aptidoes-personagem-list) não encontrada!');
            return;
        }

        if (!aptidoes || aptidoes.length === 0) {
            boxAptidoes.innerHTML = '<div class="aptidoes-empty-message">Nenhuma aptidão adquirida ainda</div>';
            console.log('📭 Nenhuma aptidão para exibir na BOX 1');
        } else {
            console.log('📝 Renderizando', aptidoes.length, 'aptidões na BOX 1');
            boxAptidoes.innerHTML = aptidoes.map(apt => {
                let catalogoApt = null;
                if (manager && manager.catalogo) {
                    catalogoApt = manager.catalogo.find(a => a.id === apt.id);
                }
                if (!catalogoApt) {
                    catalogoApt = APTIDOES_CATALOGO.find(a => a.id === apt.id);
                }
                const nome = catalogoApt?.nome || apt.nome || apt.id;
                return `
                    <div class="aptidao-item">
                        <div class="aptidao-nome">${nome}</div>
                        <div class="aptidao-nivel">Nível ${apt.nivel || 0}</div>
                    </div>
                `;
            }).join('');
        }

        // BOX 2: Vantagens Desbloqueadas
        const boxVantagens = document.querySelector('#aptidoes-vantagens-list');
        if (!boxVantagens) {
            console.error('❌ BOX 2 (#aptidoes-vantagens-list) não encontrada!');
            return;
        }

        const vantagens = [];
        aptidoes.forEach(apt => {
            let catalogoApt = null;
            if (manager && manager.catalogo) {
                catalogoApt = manager.catalogo.find(a => a.id === apt.id);
            }
            if (!catalogoApt) {
                catalogoApt = APTIDOES_CATALOGO.find(a => a.id === apt.id);
            }
            if (catalogoApt) {
                const niveisArray = catalogoApt.niveis || [];
                const niveisAptidao = niveisArray.filter(n => n.nivel <= apt.nivel);
                niveisAptidao.forEach(nivel => {
                    vantagens.push(`
                        <div class="vantagem-item">
                            <div class="vantagem-nome">${catalogoApt.nome} (Nível ${nivel.nivel})</div>
                            <div class="vantagem-efeito">${nivel.efeito || 'Sem descrição'}</div>
                        </div>
                    `);
                });
            }
        });

        if (vantagens.length === 0) {
            boxVantagens.innerHTML = '<div class="aptidoes-empty-message">Nenhuma vantagem desbloqueada ainda</div>';
            console.log('📭 Nenhuma vantagem para exibir na BOX 2');
        } else {
            console.log('📝 Renderizando', vantagens.length, 'vantagens na BOX 2');
            boxVantagens.innerHTML = vantagens.join('');
        }
        console.log('✅ Boxes renderizadas com sucesso');
    }

    /**
     * 🐾 NOVO: Selecionar número para companheiro (direto via IDs específicos)
     * Atualiza o campo de ganhas do companheiro no modal
     */
    selecionarNumeroCompanheiroDireto(numero, tipo) {
        console.log(`🐾 [PopupAptidoes] Companheiro Direto: selecionado ${numero} (${tipo})`);

        // Encontrar o modal de companheiro (que deve estar aberto)
        const modalCompanheiro = document.getElementById('modalNovoCompanheiro');
        if (!modalCompanheiro) {
            console.error('❌ Modal de companheiro não encontrado');
            this.fecharPopup();
            return;
        }

        // Encontrar campo ganhas do companheiro
        const campoGanhas = modalCompanheiro.querySelector('#comp-aptidoes-ganhas');
        if (!campoGanhas) {
            console.error('❌ Campo #comp-aptidoes-ganhas não encontrado');
            this.fecharPopup();
            return;
        }

        // Obter valor atual
        let ganhasAtual = parseInt(campoGanhas.textContent || '0');

        // Atualizar baseado no tipo
        if (tipo === 'comp-ganhar') {
            ganhasAtual += numero;
        } else if (tipo === 'comp-remover') {
            ganhasAtual = Math.max(0, ganhasAtual - numero);
        }

        // Atualizar campo
        campoGanhas.textContent = ganhasAtual;
        console.log(`✅ Ganhas de companheiro atualizado para: ${ganhasAtual}`);

        // 🐾 SINCRONIZAR window.companheiro_temp COM WINDOW.COMPANHEIROSMANAGER
        try {
            if (window.companheirosManager && window.companheirosManager.companheiroEmEdicao) {
                const comp = window.companheirosManager.getCompanheiroById?.(window.companheirosManager.companheiroEmEdicao);
                if (comp) {
                    window.companheiro_temp = {
                        id: comp.id,
                        nome: comp.nome,
                        aptidoes: comp.aptidoes || [],
                        vantagens: comp.vantagens || []
                    };
                    console.log('🔄 window.companheiro_temp sincronizado:', window.companheiro_temp.aptidoes.length, 'aptidões');
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao sincronizar companheiro_temp:', e.message);
        }

        // Fechar popup
        this.fecharPopup();

        // Atualizar informações de aptidões
        try {
            if (window.companheirosModalController && typeof window.companheirosModalController.atualizarInfoAptidoesCompanheiro === 'function') {
                window.companheirosModalController.atualizarInfoAptidoesCompanheiro();
                console.log('🐾 Informações de aptidões do companheiro atualizadas');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao atualizar informações de aptidões:', e.message);
        }

        // 🐾 RENDERIZAR VANTAGENS DESBLOQUEADAS
        try {
            // Forçar renderização pegando os dados atualizados
            const controller = window.companheirosModalController;
            if (controller && typeof controller.renderizarVantagensDesbloqueadas === 'function') {
                // Se temos window.companheiro_temp, usar ele
                if (window.companheiro_temp && window.companheiro_temp.aptidoes && window.companheiro_temp.aptidoes.length > 0) {
                    controller.renderizarVantagensDesbloqueadas(window.companheiro_temp);
                    console.log('🐾 Vantagens desbloqueadas renderizadas (window.companheiro_temp)');
                } else {
                    // Caso contrário, coletar dados do modal
                    const dados = controller.coletarDadosCompanheiro ? controller.coletarDadosCompanheiro() : null;
                    if (dados && dados.aptidoes && dados.aptidoes.length > 0) {
                        controller.renderizarVantagensDesbloqueadas(dados);
                        console.log('🐾 Vantagens desbloqueadas renderizadas (coletarDadosCompanheiro)');
                    } else {
                        console.log('ℹ️ Nenhuma aptidão para renderizar vantagens ainda');
                    }
                }
            }
        } catch (e) {
            console.error('❌ Erro ao renderizar vantagens desbloqueadas:', e.message, e);
        }
    }

    /**
     * Selecionar número para companheiro (novo contexto)
     */
    selecionarNumeroCompanheiro(numero, tipo) {
        console.log(`🐾 [PopupAptidoes] Companheiro: selecionado ${numero} (${tipo})`);

        const controller = this.controllerCompanheiro;
        const modal = this.modalCompanheiro;

        if (!controller || !modal) {
            console.error('❌ Controller ou modal de companheiro não disponível');
            return;
        }

        // Coletar dados do companheiro
        const companheiro = controller.coletarDadosCompanheiro();
        if (!companheiro.aptidoes) {
            companheiro.aptidoes = [];
        }

        // Encontrar campo ganhas
        const campoGanhas = modal.querySelector('#comp-aptidoes-ganhas');
        let ganhasAtual = parseInt(campoGanhas?.textContent || '0');

        if (tipo === 'ganhar') {
            ganhasAtual += numero;
        } else if (tipo === 'remover') {
            ganhasAtual = Math.max(0, ganhasAtual - numero);
        }

        // Atualizar valor no campo
        if (campoGanhas) {
            campoGanhas.textContent = ganhasAtual;
        }

        console.log(`✅ Ganhas de companheiro atualizado para: ${ganhasAtual}`);

        // 🐾 SINCRONIZAR window.companheiro_temp COM DADOS COLETADOS
        try {
            if (window.companheirosManager && window.companheirosManager.companheiroEmEdicao) {
                const comp = window.companheirosManager.getCompanheiroById?.(window.companheirosManager.companheiroEmEdicao);
                if (comp) {
                    companheiro = {
                        id: comp.id,
                        nome: comp.nome,
                        aptidoes: comp.aptidoes || [],
                        vantagens: comp.vantagens || []
                    };
                    window.companheiro_temp = companheiro;
                    console.log('🔄 window.companheiro_temp sincronizado com manager:', companheiro.aptidoes.length, 'aptidões');
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao sincronizar companheiro_temp:', e.message);
        }

        // 🐾 Atualizar informações de aptidões (máximo e atributo p/+1)
        try {
            if (window.companheirosModalController && typeof window.companheirosModalController.atualizarInfoAptidoesCompanheiro === 'function') {
                window.companheirosModalController.atualizarInfoAptidoesCompanheiro();
                console.log('🐾 Informações de aptidões do companheiro atualizadas');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao atualizar informações de aptidões:', e.message);
        }

        // 🐾 RENDERIZAR VANTAGENS DESBLOQUEADAS
        try {
            if (companheiro && window.companheirosModalController && typeof window.companheirosModalController.renderizarVantagensDesbloqueadas === 'function') {
                // Forçar atualização de window.companheiro_temp também
                if (window.companheiro_temp) {
                    window.companheiro_temp = companheiro;
                }
                window.companheirosModalController.renderizarVantagensDesbloqueadas(companheiro);
                console.log('🐾 Vantagens desbloqueadas renderizadas com companheiro atualizado');
            } else {
                console.warn('⚠️ [selecionarNumeroCompanheiro] Não foi possível renderizar vantagens:', {
                    temCompanheiro: !!companheiro,
                    temController: !!window.companheirosModalController,
                    temFuncao: typeof window.companheirosModalController?.renderizarVantagensDesbloqueadas
                });
            }
        } catch (e) {
            console.error('❌ Erro ao renderizar vantagens desbloqueadas:', e.message, e);
        }

        // Fechar popup
        this.fecharPopup();

        // Limpar contexto
        this.contextoCompanheiro = false;
        this.modalCompanheiro = null;
        this.controllerCompanheiro = null;

        // Atualizar display do companheiro
        try {
            controller.atualizarAptidoesDisplay();
            console.log('🔄 Display de companheiro atualizado');
        } catch (e) {
            console.warn('⚠️ Erro ao atualizar display:', e.message);
        }
    }

    /**
     * Abre o popup de aptidões para o companheiro
     * Mostra todas as aptidões disponíveis no catálogo
     */
    async abrirGerenciadorCompanheiro() {
        console.log('🐾 [PopupAptidoes] Abrindo popup de aptidões do companheiro...');

        // Chamar função global do gerenciador
        if (!window.abrirPopupAptidoesCompanheiro) {
            console.error('❌ Função abrirPopupAptidoesCompanheiro não disponível');
            alert('❌ Erro: Sistema não carregado');
            return;
        }

        await window.abrirPopupAptidoesCompanheiro();
    }

    /**
     * Destruir popup (remover listeners)
     */
    destroy() {
        console.log('🗑 [PopupAptidoes] Destruindo...');

        this.listeners.forEach(listener => {
            document.removeEventListener('keydown', listener);
        });
        this.listeners = [];

        console.log('✅ [PopupAptidoes] Destruído com sucesso');
    }
}

// Instanciar e inicializar na página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 [popup-aptidoes.js] DOMContentLoaded');

    const popup = new PopupAptidoes();
    await popup.init();

    // Salvar referência global
    window.popupAptidoes = popup;

    console.log('🌐 [popup-aptidoes.js] Popup disponível em window.popupAptidoes');
});
