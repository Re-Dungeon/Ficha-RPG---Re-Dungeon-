/* ============================================ */
/* GERENCIAR-APTIDOES.JS - Modal Novo (v3)     */
/* Sistema de gerenciamento de aptidões com cards visuais */
/* ============================================ */

/**
 * GerenciarAptidoesModal
 * Classe responsável por todo o ciclo de vida do modal
 * - Abrir/fechar
 * - Renderização de cards
 * - Sincronização com dados
 * - Listeners
 */

class GerenciarAptidoesModal {
    constructor() {
        this.modalId = 'modal-aptidoes';
        this.btnId = 'btn-abrir-aptidoes';
        this.isOpen = false;
        this.listeners = [];
        this.selectedAptidao = null;
        this.aptidoesGanhadas = {};
        this.filtroAtivo = '';
        this.aptidoesSelecionadas = []; // Array para rastrear seleções
        
        // Contexto de companheiro
        this.contextoCompanheiro = false;
        this.modalCompanheiro = null;
        this.controllerCompanheiro = null;
    }

    /**
     * Inicializa o modal
     */
    async init() {
        console.log('🎭 [GerenciarAptidoesModal] Inicializando...');

        // Aguardar que AptidoesManager esteja disponível
        await this.waitForDependencies();

        // Recuperar elementos do DOM
        const modal = this.getModal();
        const btn = this.getBtn();

        if (!modal || !btn) {
            console.error('❌ [GerenciarAptidoesModal] Elementos do DOM não encontrados');
            return false;
        }

        // Setup dos event listeners
        this.setupEventListeners();

        // Carregar dados iniciais
        this.carregarDadosAptidoes();

        // Renderizar conteúdo inicial
        this.render();

        console.log('✅ [GerenciarAptidoesModal] Inicializado com sucesso');
        return true;
    }

    /**
     * Aguarda dependências (AptidoesManager, AtributosManager)
     */
    async waitForDependencies() {
        let tentativas = 0;
        const maxTentativas = 50;

        while (!window.aptidoesManager && tentativas < maxTentativas) {
            console.log(`⏳ [GerenciarAptidoesModal] Aguardando window.aptidoesManager (${tentativas + 1}/${maxTentativas})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }

        if (!window.aptidoesManager) {
            console.error('❌ [GerenciarAptidoesModal] window.aptidoesManager não disponível após timeout');
            return false;
        }

        console.log('✅ [GerenciarAptidoesModal] window.aptidoesManager disponível');
        return true;
    }

    /**
     * Obtém referência ao modal do DOM
     */
    getModal() {
        return document.getElementById(this.modalId);
    }

    /**
     * Obtém referência ao botão do DOM
     */
    getBtn() {
        return document.getElementById(this.btnId);
    }

    /**
     * Carrega dados das aptidões do personagem
     */
    carregarDadosAptidoes() {
        // ✅ NOVO: Suporte a companheiro
        if (this.contextoCompanheiro && this.controllerCompanheiro) {
            return this.carregarDadosAptidoesCompanheiro();
        }

        const manager = window.aptidoesManager;
        if (!manager || !manager.aptidoesPersonagem) return;

        // Criar mapa de aptidões ganhas
        this.aptidoesGanhadas = {};
        manager.aptidoesPersonagem.forEach(apt => {
            this.aptidoesGanhadas[apt.id] = {
                nivel: apt.nivel || 0,
                ganhos: apt.ganhos || 0
            };
        });

        console.log('📦 [GerenciarAptidoesModal] Dados carregados:', this.aptidoesGanhadas);
    }

    /**
     * Carrega dados de aptidões do companheiro
     */
    carregarDadosAptidoesCompanheiro() {
        const controller = this.controllerCompanheiro;
        if (!controller) return;

        const companheiro = controller.coletarDadosCompanheiro();
        if (!companheiro.aptidoes) {
            companheiro.aptidoes = [];
        }

        // Criar mapa de aptidões ganhas do companheiro
        this.aptidoesGanhadas = {};
        companheiro.aptidoes.forEach(apt => {
            this.aptidoesGanhadas[apt.id] = {
                nivel: apt.nivel || 1,
                ganhos: apt.ganhos || 0
            };
        });

        console.log('🐾 [GerenciarAptidoesModal] Dados do companheiro carregados:', this.aptidoesGanhadas);
    }

    /**
     * Setup de todos os event listeners
     */
    setupEventListeners() {
        const btn = this.getBtn();
        const modal = this.getModal();

        if (!btn || !modal) return;

        // Listener: Clique no botão de abrir
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open();
        });

        // Listener: Clique no X de fechar
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }

        // Listener: Clique no backdrop (fora do modal)
        const backdrop = modal.querySelector('.modal-overlay__backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.close();
                }
            });
        }

        // Listener: Filtro de busca
        const filtro = modal.querySelector('#modal-filtro-aptidoes');
        if (filtro) {
            filtro.addEventListener('input', (e) => {
                this.filtroAtivo = e.target.value.toLowerCase().trim();
                this.aplicarFiltro();
            });
        }

        // Listener: ESC para fechar
        this.listeners.push(
            (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            }
        );
        document.addEventListener('keydown', this.listeners[this.listeners.length - 1]);

        // Listener: Botões de salvar/cancelar
        const btnSalvar = modal.querySelector('#modal-btn-salvar');
        const btnCancelar = modal.querySelector('#modal-btn-cancelar');

        if (btnSalvar) {
            btnSalvar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.save();
            });
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }

        console.log('✅ [GerenciarAptidoesModal] Event listeners configurados');
    }

    /**
     * Abre o modal
     */
    open() {
        const modal = this.getModal();
        if (!modal) return;

        console.log('🔓 [GerenciarAptidoesModal] Abrindo modal...');

        // Limpar filtro ao abrir
        this.filtroAtivo = '';
        const filtroInput = modal.querySelector('#modal-filtro-aptidoes');
        if (filtroInput) {
            filtroInput.value = '';
        }

        // Limpar seleções anteriores
        this.aptidoesSelecionadas = [];

        // Recarregar dados
        this.carregarDadosAptidoes();

        modal.classList.add('active');
        this.isOpen = true;

        // Renderizar dados atualizados ao abrir
        this.render();

        // ⚠️ CRÍTICO: Re-configurar listeners dos cards APÓS renderização
        // Isso garante que toda abertura do modal tenha os listeners funcionando
        const container = modal.querySelector('[data-modal-list="aptidoes"]');
        if (container) {
            this.setupCardsListeners(container);
        }

        console.log('✅ [GerenciarAptidoesModal] Modal aberto');
    }

    /**
     * Fecha o modal
     */
    close() {
        const modal = this.getModal();
        if (!modal) return;

        console.log('🔒 [GerenciarAptidoesModal] Fechando modal...');

        // ⚠️ CRÍTICO: Limpar seleções quando fecha sem salvar
        this.aptidoesSelecionadas = [];
        console.log('🗑️ Seleções limpas ao fechar modal');

        modal.classList.remove('active');
        this.isOpen = false;

        console.log('✅ [GerenciarAptidoesModal] Modal fechado');
    }

    /**
     * Renderiza o conteúdo do modal
     */
    render() {
        if (!this.isOpen) return;

        const modal = this.getModal();
        if (!modal) return;

        console.log('🎨 [GerenciarAptidoesModal] Renderizando...');

        // Obter dados atualizados
        const data = this.getModalData();

        // Atualizar valores na UI
        this.updateModalUI(data);

        // Renderizar lista de aptidões do personagem
        this.renderAptidoesPersonagem();

        console.log('✅ [GerenciarAptidoesModal] Renderização concluída', data);
    }

    /**
     * Coleta os dados necessários para renderizar o modal
     */
    getModalData() {
        const manager = window.aptidoesManager;

        // Dados de aptidões
        const actual = manager?.aptidoesPersonagem?.length || 0;
        const ganhas = manager?.configAptidoes?.ganhas || 0;

        // Calcular máximo e atributo para próximo usando AptidoesCalculator
        let maximo = 0;
        let atributoPraProximo = '—';

        if (typeof AptidoesCalculator !== 'undefined') {
            try {
                maximo = AptidoesCalculator.calcularMaximoFinal() || 0;
                const atributoPraProximoNum = AptidoesCalculator.calcularAtributoPraProximoMaximo() || 0;
                atributoPraProximo = atributoPraProximoNum === 0 ? 'Já aumenta!' : atributoPraProximoNum;
                console.log('✅ [GerenciarAptidoesModal] Dados calculados por AptidoesCalculator:', { maximo, atributoPraProximo });
            } catch (e) {
                console.error('❌ [GerenciarAptidoesModal] Erro ao calcular dados:', e);
                maximo = ganhas + 6;
                atributoPraProximo = '—';
            }
        } else {
            console.warn('⚠️ [GerenciarAptidoesModal] AptidoesCalculator não disponível, usando fallback');
            maximo = ganhas + 6;
            atributoPraProximo = '—';
        }

        return {
            actual,
            ganhas,
            maximo,
            atributoPraProximo
        };
    }

    /**
     * Atualiza a UI com os dados do modal
     */
    updateModalUI(data) {
        const modal = this.getModal();
        if (!modal) return;

        // Atualizar valores de informação
        const elemAtual = modal.querySelector('[data-modal-info="atual"]');
        const elemGanhas = modal.querySelector('[data-modal-info="ganhas"]');
        const elemMaximo = modal.querySelector('[data-modal-info="maximo"]');
        const elemAtributo = modal.querySelector('[data-modal-info="atributo"]');

        if (elemAtual) {
            elemAtual.textContent = data.actual || 0;
            console.log('✅ Modal: Atual atualizado para:', data.actual);
        }
        if (elemGanhas) {
            elemGanhas.textContent = data.ganhas || 0;
            console.log('✅ Modal: Ganhas atualizado para:', data.ganhas);
        }
        if (elemMaximo) {
            elemMaximo.textContent = data.maximo || 0;
            console.log('✅ Modal: Máximo atualizado para:', data.maximo, '← CRÍTICO');
        }
        if (elemAtributo) {
            elemAtributo.textContent = data.atributoPraProximo || '—';
            console.log('✅ Modal: Atributo P/+1 atualizado para:', data.atributoPraProximo, '← CRÍTICO');
        }

        console.log('📝 [GerenciarAptidoesModal] UI atualizada com:', data);
    }

    /**
     * Renderiza a lista de aptidões do catálogo para seleção
     * Cards simples, clicáveis para selecionar múltiplos
     * Bloqueia seleção se atingir limite máximo
     */
    renderAptidoesPersonagem() {
        const modal = this.getModal();
        if (!modal) return;

        const container = modal.querySelector('[data-modal-list="aptidoes"]');
        if (!container) {
            console.error('❌ Container modal-aptidoes-list não encontrado!');
            return;
        }

        const manager = window.aptidoesManager;
        
        // Obter catálogo do manager
        let catalogo = [];
        if (manager && manager.catalogo && Array.isArray(manager.catalogo) && manager.catalogo.length > 0) {
            catalogo = manager.catalogo;
        } else if (window.aptidoesDB && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
            // Fallback: se manager não tiver catálogo, usar o do BD diretamente
            console.warn('⚠️ Manager não tem catálogo, carregando do BD diretamente...');
            catalogo = window.aptidoesDB.getCatalogoCompleto();
            if (manager) {
                manager.catalogo = catalogo;
            }
        } else {
            console.error('❌ Catálogo não disponível em nenhuma fonte');
            container.innerHTML = '<p class="modal-empty-message">Erro: aptidões não carregadas</p>';
            return;
        }
        
        if (!catalogo || catalogo.length === 0) {
            container.innerHTML = '<p class="modal-empty-message">Nenhuma aptidão disponível</p>';
            console.warn('⚠️ Nenhum catálogo disponível');
            return;
        }

        // Verificar limite máximo
        const atual = manager?.aptidoesPersonagem?.length || 0;
        const maximo = manager?.getMaximo?.() || 27;
        const spotsDisponiveis = maximo - atual;
        const atingiuLimite = atual >= maximo;

        console.log(`📝 Renderizando catálogo com ${catalogo.length} aptidões | Atual: ${atual}/${maximo} | Spots: ${spotsDisponiveis}`);

        // Mapa de aptidões já adquiridas
        const aptidoesAdquiridas = {};
        if (manager && manager.aptidoesPersonagem && Array.isArray(manager.aptidoesPersonagem)) {
            manager.aptidoesPersonagem.forEach(apt => {
                aptidoesAdquiridas[apt.id] = apt;
            });
        }

        // Renderizar grid de aptidões do catálogo - SIMPLES E SELECIONÁVEL
        container.innerHTML = `
            ${atingiuLimite ? '<div class="modal-aviso-limite">⚠️ Limite máximo atingido! (${atual}/${maximo})</div>' : ''}
            <div class="modal-aptidoes-grid">
                ${catalogo.filter(apt => apt && apt.id && apt.nome).map(apt => {
                    const jaTemAptidao = !!aptidoesAdquiridas[apt.id];
                    const isSelected = this.aptidoesSelecionadas.includes(apt.id);
                    // Pode selecionar se: NÃO tem a aptidão E (NÃO atingiu limite OU já está selecionada)
                    const podeSelecionar = !jaTemAptidao && (atual + this.aptidoesSelecionadas.length < maximo || isSelected);
                    const imagemUrl = apt.imagem && apt.imagem.trim() !== '' ? apt.imagem : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23333344%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3E' + encodeURIComponent(apt.nome).substring(0, 15) + '%3C/text%3E%3C/svg%3E';
                    
                    return `
                        <div class="modal-aptidoes-card ${isSelected ? 'selecionada' : ''} ${jaTemAptidao ? 'adquirida' : ''} ${!podeSelecionar ? 'bloqueada' : ''}" data-aptidao-id="${apt.id}" data-pode-selecionar="${podeSelecionar}">
                            <div class="modal-aptidoes-card-imagem">
                                <img src="${imagemUrl}" alt="${apt.nome}">
                                ${isSelected ? '<div class="modal-aptidoes-card-check">✓</div>' : ''}
                                ${jaTemAptidao && !isSelected ? '<div class="modal-aptidoes-card-adquirida">✓</div>' : ''}
                            </div>
                            <div class="modal-aptidoes-card-nome">${apt.nome}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Setup listeners para seleção
        this.setupAptidoesCardListeners(container);

        console.log('✅ Catálogo renderizado com sucesso');
    }

    /**
     * Setup listeners para os cards de aptidões - APENAS SELEÇÃO
     * Clique = Seleciona/Desseleciona o card
     * Verifica limite DINAMICAMENTE (considerando seleções)
     */
    setupAptidoesCardListeners(container) {
        const manager = window.aptidoesManager;
        const maximo = manager?.getMaximo?.() || 27;

        container.querySelectorAll('.modal-aptidoes-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const aptidaoId = card.getAttribute('data-aptidao-id');
                
                // Toggle seleção
                const idx = this.aptidoesSelecionadas.indexOf(aptidaoId);
                
                if (idx >= 0) {
                    // Desselecionar
                    this.aptidoesSelecionadas.splice(idx, 1);
                    card.classList.remove('selecionada');
                    console.log('❌ Desseleciona:', aptidaoId);
                } else {
                    // Tentar selecionar - verificar limite DINÂMICO
                    // Total final = já tem + vai selecionar
                    const atual = manager?.aptidoesPersonagem?.length || 0;
                    const totalAposSelecao = atual + this.aptidoesSelecionadas.length + 1;
                    
                    if (totalAposSelecao > maximo) {
                        console.warn(`⚠️ Limite atingido! ${totalAposSelecao} > ${maximo}`);
                        alert(`⚠️ Limite máximo atingido!\nVocê tem ${atual} aptidões.\nPode adicionar apenas ${maximo - atual} mais.`);
                        return;
                    }
                    
                    this.aptidoesSelecionadas.push(aptidaoId);
                    card.classList.add('selecionada');
                    console.log('✅ Seleciona:', aptidaoId);
                }
                
                // Atualizar visual do checkmark
                const checkmark = card.querySelector('.modal-aptidoes-card-check');
                if (idx >= 0) {
                    if (checkmark) checkmark.remove();
                } else {
                    if (!checkmark) {
                        const imagem = card.querySelector('.modal-aptidoes-card-imagem');
                        const check = document.createElement('div');
                        check.className = 'modal-aptidoes-card-check';
                        check.textContent = '✓';
                        imagem.appendChild(check);
                    }
                }
            });
        });
    }

    /**
     * Abre popup para ganhar nível em uma aptidão
     */
    /**
     * Aplicar filtro dinâmico às aptidões
     */
    aplicarFiltro() {
        const modal = this.getModal();
        if (!modal) return;

        const cards = modal.querySelectorAll('.modal-aptidoes-card');
        const filtro = this.filtroAtivo || '';

        let visiveisCount = 0;

        cards.forEach(card => {
            const nome = card.querySelector('.modal-aptidoes-card-nome')?.textContent || '';
            const descricao = card.querySelector('.modal-aptidoes-card-desc')?.textContent || '';
            
            // Verificar se o filtro corresponde ao nome ou descrição
            const correspondeBuscaFiltro = nome.toLowerCase().includes(filtro) || 
                                           descricao.toLowerCase().includes(filtro);

            if (correspondeBuscaFiltro) {
                card.classList.remove('filtrado-oculto');
                visiveisCount++;
            } else {
                card.classList.add('filtrado-oculto');
            }
        });

        console.log(`🔍 Filtro aplicado: "${filtro}" - ${visiveisCount} aptidões visíveis`);
    }

    /**
     * Renderiza os cards de aptidões
     */
    renderCards() {
        const modal = this.getModal();
        if (!modal) return;

        // Tentar diferentes seletores para encontrar o container
        let container = modal.querySelector('[data-modal-list="aptidoes"]');
        if (!container) {
            container = modal.querySelector('.modal-aptidoes-list');
        }
        if (!container) {
            console.error('❌ Container de aptidões não encontrado!');
            return;
        }

        console.log('🎴 [GerenciarAptidoesModal] Renderizando cards...');

        // Obter catálogo de aptidões
        const catalogo = this.obterCatalogo();
        
        if (!catalogo || catalogo.length === 0) {
            container.innerHTML = '<p class="modal-empty-message">Nenhuma aptidão disponível</p>';
            return;
        }

        // Filtrar aptidões - validar se nome existe
        const aptidoesFiltradas = catalogo.filter(apt => 
            apt && apt.nome && apt.nome.toLowerCase().includes(this.filtroAtivo)
        );

        if (aptidoesFiltradas.length === 0) {
            container.innerHTML = '<p class="modal-empty-message">Nenhuma aptidão encontrada</p>';
            return;
        }

        // Renderizar cards
        container.innerHTML = aptidoesFiltradas
            .map(apt => this.criarCardHTML(apt))
            .join('');

        // Adicionar listeners aos botões dos cards
        this.setupCardsListeners(container);

        console.log('✅ [GerenciarAptidoesModal] Cards renderizados');
    }

    /**
     * Obtém o catálogo de aptidões
     */
    obterCatalogo() {
        const manager = window.aptidoesManager;
        
        // Tentar obter do manager primeiro
        if (manager && manager.catalogo && Array.isArray(manager.catalogo) && manager.catalogo.length > 0) {
            console.log('✅ Catálogo obtido do manager:', manager.catalogo.length, 'aptidões');
            return manager.catalogo;
        }
        
        // Fallback: obter do BD diretamente se manager não tiver
        if (window.aptidoesDB && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
            console.warn('⚠️ Manager sem catálogo, carregando do BD...');
            const catalogo = window.aptidoesDB.getCatalogoCompleto();
            if (manager && catalogo.length > 0) {
                manager.catalogo = catalogo; // Sincronizar com manager
            }
            console.log('✅ Catálogo obtido do BD:', catalogo.length, 'aptidões');
            return catalogo;
        }
        
        console.error('❌ Catálogo não disponível em nenhuma fonte');
        return [];
    }

    /**
     * Cria o HTML do card de uma aptidão
     */
    criarCardHTML(aptidao) {
        // Validações de segurança
        if (!aptidao || !aptidao.id || !aptidao.nome) {
            console.error('❌ Aptidão inválida:', aptidao);
            return '';
        }

        const ganhos = this.aptidoesGanhadas[aptidao.id];
        const nivelAtual = ganhos ? ganhos.nivel : 0;
        const temAptidao = nivelAtual > 0;

        return `
            <div class="aptidoes-card" data-aptidao-id="${aptidao.id}" data-aptidao-nome="${aptidao.nome}">
                <div class="aptidoes-card-header">
                    <h3 class="aptidoes-card-nome">${aptidao.nome}</h3>
                </div>
                
                <div class="aptidoes-card-body">
                    <div class="aptidoes-card-image">
                        ${aptidao.imagem ? `<img src="${aptidao.imagem}" alt="${aptidao.nome}">` : '🎯'}
                    </div>
                    
                    <div class="aptidoes-card-info">
                        <div class="aptidoes-card-nivel">
                            <span class="aptidoes-card-nivel-label">Nível Atual</span>
                            <span class="aptidoes-card-nivel-value">${nivelAtual}</span>
                        </div>
                    </div>
                </div>
                
                <div class="aptidoes-card-footer">
                    <div class="aptidoes-card-actions-top">
                        <button class="aptidoes-card-btn aptidoes-card-btn-ganhar" data-action="ganhar" data-id="${aptidao.id}" title="Aumentar nível">
                            ➕ Ganhar
                        </button>
                        <button class="aptidoes-card-btn aptidoes-card-btn-remover" data-action="remover" data-id="${aptidao.id}" ${!temAptidao ? 'disabled' : ''} title="Remover nível">
                            ➖ Remover
                        </button>
                        <button class="aptidoes-card-btn aptidoes-card-btn-select" data-action="select" data-id="${aptidao.id}" title="Selecionar aptidão">
                            ✔️ Select
                        </button>
                    </div>
                    
                    <button class="aptidoes-card-btn aptidoes-card-btn-ver" data-action="ver" data-id="${aptidao.id}" style="grid-column: 1 / -1;" title="Ver detalhes dos níveis">
                        👁️ Ver Níveis
                    </button>

                    <div class="aptidoes-card-contador">
                        <span class="aptidoes-card-contador-label">Ganhos:</span>
                        <span class="aptidoes-card-contador-value">${ganhos ? ganhos.ganhos : 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup dos listeners dos botões dos cards
     */
    setupCardsListeners(container) {
        // Botões Ganhar
        container.querySelectorAll('[data-action="ganhar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aptidaoId = btn.getAttribute('data-id');
                this.ganharAptidao(aptidaoId);
            });
        });

        // Botões Remover
        container.querySelectorAll('[data-action="remover"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aptidaoId = btn.getAttribute('data-id');
                this.removerAptidao(aptidaoId);
            });
        });

        // Botões Select
        container.querySelectorAll('[data-action="select"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aptidaoId = btn.getAttribute('data-id');
                const card = btn.closest('.aptidoes-card');
                const nomAptidao = card.getAttribute('data-aptidao-nome');
                this.selecionarAptidao(aptidaoId, nomAptidao);
            });
        });

        // Botões Ver
        container.querySelectorAll('[data-action="ver"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aptidaoId = btn.getAttribute('data-id');
                const card = btn.closest('.aptidoes-card');
                const nomAptidao = card.getAttribute('data-aptidao-nome');
                this.verDetalhesAptidao(aptidaoId, nomAptidao);
            });
        });

        console.log('✅ [GerenciarAptidoesModal] Listeners dos cards configurados');
    }

    /**
     * Ganhar nível em uma aptidão
     */
    /**
     * Obter catálogo com fallback seguro
     */
    obterCatalogo() {
        const manager = window.aptidoesManager;
        
        // Tentar obter do manager primeiro
        if (manager && manager.catalogo && Array.isArray(manager.catalogo) && manager.catalogo.length > 0) {
            console.log('✅ Catálogo obtido do manager:', manager.catalogo.length, 'aptidões');
            return manager.catalogo;
        }
        
        // Fallback: obter do BD diretamente se manager não tiver
        if (window.aptidoesDB && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
            console.warn('⚠️ Manager sem catálogo, carregando do BD...');
            const catalogo = window.aptidoesDB.getCatalogoCompleto();
            if (manager && catalogo.length > 0) {
                manager.catalogo = catalogo; // Sincronizar com manager
            }
            console.log('✅ Catálogo obtido do BD:', catalogo.length, 'aptidões');
            return catalogo;
        }
        
        console.error('❌ Catálogo não disponível em nenhuma fonte');
        return [];
    }

    /**
     * Salvar mudanças
     */
    async save() {
        console.log('💾 [GerenciarAptidoesModal] Salvando aptidões selecionadas...');

        // ✅ NOVO: Suporte a companheiro
        if (this.contextoCompanheiro && this.controllerCompanheiro) {
            return this.salvarAptidoesCompanheiro();
        }

        const manager = window.aptidoesManager;
        if (!manager) {
            console.error('❌ AptidoesManager não disponível');
            return;
        }

        // Obter catálogo
        let catalogo = manager.catalogo;
        if (!catalogo || catalogo.length === 0) {
            if (window.aptidoesDB && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
                catalogo = window.aptidoesDB.getCatalogoCompleto();
                if (manager) manager.catalogo = catalogo;
            }
        }

        // Verificar limite FINAL antes de salvar
        const atual = manager?.aptidoesPersonagem?.length || 0;
        const maximo = manager?.getMaximo?.() || 27;
        const totalFinal = atual + this.aptidoesSelecionadas.length;
        
        if (totalFinal > maximo) {
            console.error(`❌ LIMITE EXCEDIDO! ${totalFinal} > ${maximo}`);
            alert(`❌ Limite excedido!\nVocê tem ${atual}/${maximo} aptidões.\nNão pode adicionar ${this.aptidoesSelecionadas.length} a mais.`);
            return;
        }

        // ============================================
        // PASSO 1: Adicionar à memória (OBRIGATÓRIO)
        // ============================================
        if (this.aptidoesSelecionadas.length > 0) {
            console.log(`📦 Adicionando ${this.aptidoesSelecionadas.length} aptidões selecionadas`);
            
            this.aptidoesSelecionadas.forEach(aptidaoId => {
                // Verificar se já tem
                const jaTemAptidao = manager.aptidoesPersonagem.some(a => a.id === aptidaoId);
                if (!jaTemAptidao && catalogo) {
                    // Encontrar a aptidão no catálogo
                    const aptidao = catalogo.find(a => a.id === aptidaoId);
                    if (aptidao) {
                        // Adicionar com nível 1
                        manager.aptidoesPersonagem.push({
                            id: aptidaoId,
                            nome: aptidao.nome,
                            nivel: 1
                        });
                        console.log(`✅ Aptidão adicionada à memória: ${aptidao.nome}`);
                    }
                } else if (jaTemAptidao) {
                    console.log(`⚠️ Aptidão já existe: ${aptidaoId}`);
                }
            });
        }

        // ============================================
        // PASSO 2: Salvar em IndexedDB (COM FORÇA)
        // ============================================
        let dbSalvo = false;
        try {
            if (window.aptidoesDB && window.aptidoesDB.db) {
                for (const aptidaoId of this.aptidoesSelecionadas) {
                    const apt = manager.aptidoesPersonagem.find(a => a.id === aptidaoId);
                    if (apt) {
                        try {
                            // Chamar com os parâmetros corretos: (id, nome, nivel, bonus)
                            await aptidoesDB.addAptidaoPersonagem(apt.id, apt.nome, apt.nivel, 0);
                            console.log(`💾 [DB] ${apt.nome} salvo no IndexedDB`);
                        } catch (dbError) {
                            console.warn(`⚠️ Erro ao salvar ${apt.nome} no DB, tentando novamente...`, dbError);
                            // Tentar salvar novamente
                            try {
                                await aptidoesDB.addAptidaoPersonagem(apt.id, apt.nome, apt.nivel, 0);
                                console.log(`💾 [DB RETRY] ${apt.nome} salvo no IndexedDB na tentativa 2`);
                            } catch (retryError) {
                                console.error(`❌ Falha ao salvar ${apt.nome} mesmo na tentativa 2:`, retryError);
                            }
                        }
                    }
                }
                dbSalvo = true;
                console.log('✅ Aptidões salvas no IndexedDB com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro crítico ao salvar no IndexedDB:', error);
        }

        // ============================================
        // PASSO 3: Salvar em localStorage (FALLBACK)
        // ============================================
        try {
            if (manager && typeof manager.persistAptidoesData === 'function') {
                manager.persistAptidoesData();
                console.log('💾 [localStorage] Aptidões persistidas em localStorage');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao persistir em localStorage:', e.message);
        }

        // ============================================
        // PASSO 4: Renderizar imediatamente (VISUAL)
        // ============================================
        try {
            if (manager.render && typeof manager.render === 'function') {
                manager.render();
                console.log('🎨 [RENDER] AptidoesManager.render() executado');
            }
        } catch (e) {
            console.error('❌ Erro ao renderizar:', e.message);
        }

        // ============================================
        // PASSO 5: Atualizar bônus
        // ============================================
        try {
            if (window.bonusCalculator && typeof window.bonusCalculator.cicloCompletoAtualizacao === 'function') {
                console.log('🧮 Acionando ciclo completo de atualização de bônus...');
                window.bonusCalculator.cicloCompletoAtualizacao();
                console.log('✅ Ciclo de bônus concluído');
            }
        } catch (e) {
            console.error('⚠️ Erro ao atualizar bônus:', e.message);
        }

        // ============================================
        // PASSO 6: Fechar e confirmar
        // ============================================
        this.close();

        // Mensagem final
        const totalAdicionado = this.aptidoesSelecionadas.length;
        console.log(`✅ SALVAMENTO COMPLETO - ${totalAdicionado} aptidão(ões) adicionada(s) ao personagem`);
        console.log(`📊 Total de aptidões agora: ${manager.aptidoesPersonagem.length}`);
        
        if (dbSalvo) {
            console.log('✅ Dados persistidos em banco de dados');
        } else {
            console.warn('⚠️ IndexedDB não disponível, mas dados estão em memória e localStorage');
        }
    }

    /**
     * Salva aptidões selecionadas para um companheiro
     */
    salvarAptidoesCompanheiro() {
        console.log('🐾 [GerenciarAptidoesModal] Salvando aptidões do companheiro...');

        const controller = this.controllerCompanheiro;
        if (!controller) {
            console.error('❌ Controller de companheiro não disponível');
            return;
        }

        // Obter dados do companheiro
        const companheiro = controller.coletarDadosCompanheiro();
        if (!companheiro.aptidoes) {
            companheiro.aptidoes = [];
        }

        // Obter catálogo
        let catalogo = [];
        if (window.aptidoesDB && typeof window.aptidoesDB.getCatalogoCompleto === 'function') {
            catalogo = window.aptidoesDB.getCatalogoCompleto();
        }

        // Adicionar aptidões selecionadas
        if (this.aptidoesSelecionadas.length > 0) {
            console.log(`📦 Adicionando ${this.aptidoesSelecionadas.length} aptidões ao companheiro`);
            
            this.aptidoesSelecionadas.forEach(aptidaoId => {
                // Verificar se já tem
                const jaTemAptidao = companheiro.aptidoes.some(a => a.id === aptidaoId);
                if (!jaTemAptidao && catalogo.length > 0) {
                    // Encontrar a aptidão no catálogo
                    const aptidao = catalogo.find(a => a.id === aptidaoId);
                    if (aptidao) {
                        // Adicionar com nível 1
                        companheiro.aptidoes.push({
                            id: aptidaoId,
                            nome: aptidao.nome,
                            nivel: 1
                        });
                        console.log(`✅ Aptidão adicionada ao companheiro: ${aptidao.nome}`);
                    }
                } else if (jaTemAptidao) {
                    console.log(`⚠️ Aptidão já existe no companheiro: ${aptidaoId}`);
                }
            });
        }

        // Fechar modal
        this.close();

        // Atualizar display do companheiro
        try {
            controller.atualizarAptidoesDisplay();
            console.log('🔄 Display de aptidões do companheiro atualizado');
        } catch (e) {
            console.warn('⚠️ Erro ao atualizar display:', e.message);
        }

        // Limpar contexto
        this.contextoCompanheiro = false;
        this.modalCompanheiro = null;
        this.controllerCompanheiro = null;

        console.log(`✅ SALVAMENTO COMPLETO - ${this.aptidoesSelecionadas.length} aptidão(ões) adicionada(s) ao companheiro`);
        console.log(`📊 Total de aptidões do companheiro agora: ${companheiro.aptidoes.length}`);
    }

    /**
     * Destruir o modal (remover listeners)
     */
    destroy() {
        console.log('🗑 [GerenciarAptidoesModal] Destruindo...');

        // Remover listeners do teclado
        this.listeners.forEach(listener => {
            document.removeEventListener('keydown', listener);
        });
        this.listeners = [];

        console.log('✅ [GerenciarAptidoesModal] Destruído com sucesso');
    }
}

// Instanciar e inicializar na página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 [gerenciar-aptidoes.js] DOMContentLoaded');

    const modal = new GerenciarAptidoesModal();
    await modal.init();

    // Salvar referência global para acesso
    window.gerenciarAptidoesModal = modal;

    console.log('🌐 [gerenciar-aptidoes.js] Modal disponível em window.gerenciarAptidoesModal');
});
