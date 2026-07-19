/* ========================================== */
/* COMPANHEIRO-INVENTARIO-UI.JS                */
/* Interface de Inventário do Companheiro      */
/* ========================================== */

/**
 * CompanheiroInventarioUI
 * Gerencia apresentação e interação do inventário do companheiro
 * 
 * Responsabilidades:
 * - Renderizar cards de itens
 * - Gerenciar modais de criação/edição
 * - Filtrar itens em tempo real
 * - Atualizar displays de espaço
 * - Tratar eventos do usuário
 */

class CompanheiroInventarioUI {
    constructor() {
        this.manager = null;
        this.itemEmEdicao = null;
        this.elementosDOM = {};
        this._salvarItemCount = 0;  // Debug: contar execuções de salvarItem
        this._salvarArmazenamentoCount = 0;  // Debug: contar execuções de salvarArmazenamento
        this._globalListenersSetup = false;  // Flag para listeners globais
        
        // Armazenar referências de handlers para poder removê-los depois
        this._handlers = {
            btnAdicionarItem: null,
            btnAdicionarArmazenamento: null,
            filtroItens: null,
            filtroArmazenamentos: null,
            filtroQualidade: null
        };
        
        console.log('✅ CompanheiroInventarioUI inicializado');
    }

    /**
     * Helper para obter elemento com segurança
     */
    getElement(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`⚠️ Elemento com ID "${id}" não encontrado`);
        }
        return el;
    }

    /**
     * Inicializa a UI com referência ao manager
     */
    init(manager) {
        console.log('🔧 init() CHAMADO com manager:', !!manager, 'Manager object:', manager);
        this.manager = manager;
        
        if (!this.manager) {
            console.error('❌❌❌ ERRO CRÍTICO: Manager passado para init() é null ou undefined!');
            return;
        }
        
        console.log('✅ Manager atribuído com sucesso: this.manager =', this.manager);
        
        // ⭐ ALWAYS setup listeners on init to ensure they're attached to current DOM
        // setupListeners() vai chamar cacheElementos() internamente
        // This is necessary when switching between companions or reinitializing
        this.setupListeners();
        
        this.render();

        console.log('✅ CompanheiroInventarioUI pronto');
    }

    /**
     * Configura listeners globais (apenas uma vez)
     */
    setupListenersGlobais() {
        // Listener para atualização de atributos do companheiro
        if (this._globalListenersSetup) {
            return; // Já foi configurado
        }
        
        window.addEventListener('companheiroAtributosAtualizados', async () => {
            await this.render();
        });

        // Listener para mudanças de espaço
        window.addEventListener('companheiroInventarioEspacoAlterado', () => {
            this.renderPainelEspaco();
        });

        this._globalListenersSetup = true;
    }

    /**
     * Apenas recacheia os elementos do DOM SEM resetar listeners
     * Usado quando o modal abre/fecha
     */
    recachearElementos() {
        console.log('📌 recachearElementos() - apenas atualizando cache');
        
        // Atualizar APENAS os elementos que podem ter mudado
        this.elementosDOM.listaItens = document.getElementById('companheiro-itens-lista');
        this.elementosDOM.listaArmazenamentos = document.getElementById('companheiro-armazenamentos-lista');
        this.elementosDOM.modalItem = document.getElementById('companheiro-modal-item');
        this.elementosDOM.modalArmazenamento = document.getElementById('companheiro-modal-armazenamento');
        
        console.log('✅ Elementos recacheados');
    }

    /**
     * Cacheia referências aos elementos do DOM
     */
    cacheElementos() {
        console.log('📌 cacheElementos() iniciando...');
        
        this.elementosDOM = {
            // Container principal
            container: document.getElementById('aba-companheiro-inventario'),
            
            // Painel de espaço (IDs novos)
            espacoTotal: document.getElementById('companheiro-espaco-total'),
            espacoUsado: document.getElementById('companheiro-espaco-usado'),
            espacoLivre: document.getElementById('companheiro-espaco-livre'),
            espacoStatus: document.getElementById('companheiro-espaco-status'),
            espacoBarra: document.querySelector('.companheiro-espaco-barra-container'),
            espacoBarraFill: document.querySelector('.companheiro-espaco-barra-fill'),
            
            // Botões
            btnAdicionarItem: document.getElementById('companheiro-btn-adicionar-item'),
            btnAdicionarArmazenamento: document.getElementById('companheiro-btn-adicionar-armazenamento'),
            
            // Listas
            listaItens: document.getElementById('companheiro-itens-lista'),
            listaArmazenamentos: document.getElementById('companheiro-armazenamentos-lista'),
            
            // Filtros
            filtroItens: document.getElementById('companheiro-filtro-items'),
            filtroArmazenamentos: document.getElementById('companheiro-filtro-armazenamentos'),
            filtroQualidade: document.getElementById('companheiro-filtro-qualidade'),

            // Modal de Item
            modalItem: document.getElementById('companheiro-modal-item'),
            
            // Modal de Detalhes
            modalDetalhes: document.getElementById('companheiro-modal-item-detalhes'),
            
            // Modal de Armazenamento
            modalArmazenamento: document.getElementById('companheiro-modal-armazenamento'),
            
            // Modal de Detalhes de Armazenamento
            modalDetalhesArmazenamento: document.getElementById('companheiro-modal-armazenamento-detalhes'),
            
            // Campos de imagem - ITEM
            itemImagemURL: document.getElementById('companheiro-item-imagemURL'),
            itemImagemUpload: document.getElementById('companheiro-item-imagem-upload'),
            itemImagemPreview: document.getElementById('companheiro-item-imagem-preview'),
            itemImagemTab: document.querySelectorAll('input[name="companheiro-imagem-tipo"]'),
            
            // Campos de imagem - ARMAZENAMENTO
            armazenamentoImagemURL: document.getElementById('companheiro-armazenamento-imagemURL'),
            armazenamentoImagemUpload: document.getElementById('companheiro-armazenamento-imagem-upload'),
            armazenamentoImagemPreview: document.getElementById('companheiro-armazenamento-imagem-preview'),
            armazenamentoImagemTab: document.querySelectorAll('input[name="companheiro-armazenamento-imagem-tipo"]'),
        };
        
        // Logs detalhados do que foi encontrado
        console.log('✅ btnAdicionarItem encontrado:', !!this.elementosDOM.btnAdicionarItem);
        console.log('✅ btnAdicionarArmazenamento encontrado:', !!this.elementosDOM.btnAdicionarArmazenamento);
        console.log('✅ modalItem encontrado:', !!this.elementosDOM.modalItem);
        console.log('✅ modalArmazenamento encontrado:', !!this.elementosDOM.modalArmazenamento);
        console.log('✅ listaItens encontrado:', !!this.elementosDOM.listaItens);
        console.log('✅ listaArmazenamentos encontrado:', !!this.elementosDOM.listaArmazenamentos);
        
        if (!this.elementosDOM.modalItem) {
            console.warn('❌ CRÍTICO: Modal de item não encontrado no DOM!');
        }
        if (!this.elementosDOM.modalArmazenamento) {
            console.warn('❌ CRÍTICO: Modal de armazenamento não encontrado no DOM!');
        }
        
        console.log('✅ Elementos do DOM cacheados');
    }

    /**
     * Remove listeners antigos para evitar duplicação
     */
    removeListeners() {
        // Remover listeners clonando elementos para remover todos os listeners
        const btnAdicionarItem = this.elementosDOM.btnAdicionarItem;
        if (btnAdicionarItem && btnAdicionarItem.parentNode) {
            const newBtn = btnAdicionarItem.cloneNode(true);
            btnAdicionarItem.parentNode.replaceChild(newBtn, btnAdicionarItem);
            this.elementosDOM.btnAdicionarItem = newBtn;
            console.log('✅ Botão adicionar item clonado');
        }

        const btnAdicionarArmazenamento = this.elementosDOM.btnAdicionarArmazenamento;
        if (btnAdicionarArmazenamento && btnAdicionarArmazenamento.parentNode) {
            const newBtn = btnAdicionarArmazenamento.cloneNode(true);
            btnAdicionarArmazenamento.parentNode.replaceChild(newBtn, btnAdicionarArmazenamento);
            this.elementosDOM.btnAdicionarArmazenamento = newBtn;
            console.log('✅ Botão adicionar armazenamento clonado');
        }
    }

    /**
     * Setup de listeners de eventos
     */
    setupListeners() {
        console.log('🔧 setupListeners() chamado');
        console.log('🔧 this.manager ANTES de setupListeners:', this.manager);
        
        // ⭐ Sempre re-cachear os elementos antes de remover listeners
        // Isso garante que temos referências atualizadas
        this.cacheElementos();
        
        // Remover listeners antigos primeiro
        this.removeListeners();
        
        console.log('🔍 Após removeListeners:');
        console.log('   btnAdicionarItem:', !!this.elementosDOM.btnAdicionarItem, this.elementosDOM.btnAdicionarItem?.id);
        console.log('   btnAdicionarArmazenamento:', !!this.elementosDOM.btnAdicionarArmazenamento, this.elementosDOM.btnAdicionarArmazenamento?.id);
        console.log('🔧 this.manager DEPOIS do cacheElementos/removeListeners:', this.manager);
        
        // Botão adicionar item
        if (this.elementosDOM.btnAdicionarItem) {
            console.log('📌 Adicionando listener ao btnAdicionarItem');
            const handler = () => {
                console.log('✅ ➕ CLICOU EM ADICIONAR ITEM');
                this.abrirModalItem();
            };
            this.elementosDOM.btnAdicionarItem.addEventListener('click', handler);
        } else {
            console.warn('❌ btnAdicionarItem não encontrado em setupListeners()');
        }

        // Botão adicionar armazenamento
        if (this.elementosDOM.btnAdicionarArmazenamento) {
            console.log('📌 Adicionando listener ao btnAdicionarArmazenamento');
            const handler = () => {
                console.log('✅ 🎁 CLICOU EM ADICIONAR ARMAZENAMENTO');
                this.abrirModalArmazenamento();
            };
            this.elementosDOM.btnAdicionarArmazenamento.addEventListener('click', handler);
        } else {
            console.warn('❌ btnAdicionarArmazenamento não encontrado em setupListeners()');
        }

        // Filtros
        if (this.elementosDOM.filtroItens) {
            this.elementosDOM.filtroItens.addEventListener('input', (e) => {
                this.aplicarFiltrosItens();
            });
        }

        if (this.elementosDOM.filtroArmazenamentos) {
            this.elementosDOM.filtroArmazenamentos.addEventListener('input', (e) => {
                this.filtrarArmazenamentos(e.target.value);
            });
        }

        if (this.elementosDOM.filtroQualidade) {
            this.elementosDOM.filtroQualidade.addEventListener('change', (e) => {
                this.aplicarFiltrosItens();
            });
        }

        // Listeners do Modal de Item
        const btnItemFechar = this.elementosDOM.modalItem?.querySelector('#companheiro-btn-modal-item-fechar');
        if (btnItemFechar) {
            btnItemFechar.addEventListener('click', () => this.fecharModalItem());
        }

        const btnItemCancelar = this.elementosDOM.modalItem?.querySelector('#companheiro-btn-modal-item-cancelar');
        if (btnItemCancelar) {
            btnItemCancelar.addEventListener('click', () => this.fecharModalItem());
        }

        // ⭐ USAR EVENT DELEGATION para botão salvar (funciona mesmo se elemento for recriado)
        document.removeEventListener('click', this._handleSalvarItemClick);
        this._handleSalvarItemClick = (e) => {
            console.log('📍 Click detectado no document, alvo:', e.target?.id);
            if (e.target?.id === 'companheiro-btn-modal-item-salvar') {
                console.log('✅ CLIQUE EM SALVAR ITEM DETECTADO!');
                e.preventDefault();
                this.salvarItem();
            }
        };
        document.addEventListener('click', this._handleSalvarItemClick);
        console.log('✅ Event delegation para salvar item configurado');

        // Listeners do Modal de Armazenamento
        const btnArmFechar = this.elementosDOM.modalArmazenamento?.querySelector('#companheiro-btn-modal-armazenamento-fechar');
        if (btnArmFechar) {
            btnArmFechar.addEventListener('click', () => this.fecharModalArmazenamento());
        }

        const btnArmCancelar = this.elementosDOM.modalArmazenamento?.querySelector('#companheiro-btn-modal-armazenamento-cancelar');
        if (btnArmCancelar) {
            btnArmCancelar.addEventListener('click', () => this.fecharModalArmazenamento());
        }

        // ⭐ USAR EVENT DELEGATION para botão salvar armazenamento (funciona mesmo se elemento for recriado)
        document.removeEventListener('click', this._handleSalvarArmazenamentoClick);
        this._handleSalvarArmazenamentoClick = (e) => {
            console.log('📍 Click detectado no document, alvo:', e.target?.id);
            if (e.target?.id === 'companheiro-btn-modal-armazenamento-salvar') {
                console.log('✅ CLIQUE EM SALVAR ARMAZENAMENTO DETECTADO!');
                e.preventDefault();
                this.salvarArmazenamento();
            }
        };
        document.addEventListener('click', this._handleSalvarArmazenamentoClick);
        console.log('✅ Event delegation para salvar armazenamento configurado');

        const btnArmDeletar = this.elementosDOM.modalArmazenamento?.querySelector('#companheiro-btn-modal-armazenamento-deletar');
        if (btnArmDeletar) {
            btnArmDeletar.addEventListener('click', () => this.deletarArmazenamento());
        }

        // ===== LISTENERS DO MODAL DE DETALHES DO ITEM =====
        const btnDetalhesFechar = document.getElementById('companheiro-btn-detalhes-fechar');
        if (btnDetalhesFechar) {
            btnDetalhesFechar.addEventListener('click', () => this.fecharModalDetalhes());
        }

        const btnDetalhesFecharAlt = document.getElementById('companheiro-btn-detalhes-fechar-alt');
        if (btnDetalhesFecharAlt) {
            btnDetalhesFecharAlt.addEventListener('click', () => this.fecharModalDetalhes());
        }

        const btnDetalhesEditar = document.getElementById('companheiro-btn-detalhes-editar');
        if (btnDetalhesEditar) {
            btnDetalhesEditar.addEventListener('click', () => {
                const itemId = this.elementosDOM.modalDetalhes?.dataset.itemId;
                if (itemId) {
                    this.fecharModalDetalhes();
                    this.abrirModalItem(itemId);
                }
            });
        }

        const btnDetalhesDeletar = document.getElementById('companheiro-btn-detalhes-deletar');
        if (btnDetalhesDeletar) {
            btnDetalhesDeletar.addEventListener('click', () => {
                const itemId = this.elementosDOM.modalDetalhes?.dataset.itemId;
                if (itemId) {
                    const item = this.manager.obterItem(itemId);
                    if (item && confirm(`Tem certeza que deseja deletar "${item.nome}"?`)) {
                        this.manager.deletarItem(itemId);
                        this.fecharModalDetalhes();
                        this.render();
                    }
                }
            });
        }

        // ===== LISTENERS DO MODAL DE DETALHES DO ARMAZENAMENTO =====
        const btnArmDetalhesFechar = document.getElementById('companheiro-btn-armazenamento-detalhes-fechar');
        if (btnArmDetalhesFechar) {
            btnArmDetalhesFechar.addEventListener('click', () => this.fecharDetalhesArmazenamento());
        }

        const btnArmDetalhesFecharRodape = document.getElementById('companheiro-btn-armazenamento-detalhes-fechar-rodape');
        if (btnArmDetalhesFecharRodape) {
            btnArmDetalhesFecharRodape.addEventListener('click', () => this.fecharDetalhesArmazenamento());
        }

        const btnArmDetalhesEditar = document.getElementById('companheiro-btn-armazenamento-detalhes-editar');
        if (btnArmDetalhesEditar) {
            btnArmDetalhesEditar.addEventListener('click', () => {
                const armId = this.elementosDOM.modalDetalhesArmazenamento?.dataset.armId;
                if (armId) {
                    this.fecharDetalhesArmazenamento();
                    this.abrirModalArmazenamento(armId);
                }
            });
        }

        const btnArmDetalhesDeletar = document.getElementById('companheiro-btn-armazenamento-detalhes-deletar');
        if (btnArmDetalhesDeletar) {
            btnArmDetalhesDeletar.addEventListener('click', () => {
                const armId = this.elementosDOM.modalDetalhesArmazenamento?.dataset.armId;
                if (armId) {
                    const armazenamento = this.manager.obterArmazenamento(armId);
                    if (armazenamento && confirm(`Tem certeza que deseja deletar "${armazenamento.nome}"?`)) {
                        this.manager.deletarArmazenamento(armId);
                        this.fecharDetalhesArmazenamento();
                        this.render();
                    }
                }
            });
        }

        // ===== LISTENERS DE IMAGEM - ITEM =====
        // Tabs de tipo de imagem (URL vs Upload)
        this.elementosDOM.itemImagemTab.forEach(radio => {
            radio.addEventListener('change', (e) => this.alternarTipoImagem(e.target.value));
        });

        // Input URL de imagem
        if (this.elementosDOM.itemImagemURL) {
            this.elementosDOM.itemImagemURL.addEventListener('change', () => this.atualizarPreviewImagemItem());
            this.elementosDOM.itemImagemURL.addEventListener('input', () => this.atualizarPreviewImagemItem());
        }

        // Input upload de imagem
        if (this.elementosDOM.itemImagemUpload) {
            this.elementosDOM.itemImagemUpload.addEventListener('change', (e) => this.processarUploadImagemItem(e));
        }

        // ===== LISTENERS DE IMAGEM - ARMAZENAMENTO =====
        // Tabs de tipo de imagem (URL vs Upload)
        this.elementosDOM.armazenamentoImagemTab.forEach(radio => {
            radio.addEventListener('change', (e) => this.alternarTipoImagemArmazenamento(e.target.value));
        });

        // Input URL de imagem
        if (this.elementosDOM.armazenamentoImagemURL) {
            this.elementosDOM.armazenamentoImagemURL.addEventListener('change', () => this.atualizarPreviewArmazenamento());
            this.elementosDOM.armazenamentoImagemURL.addEventListener('input', () => this.atualizarPreviewArmazenamento());
        }

        // Input upload de imagem
        if (this.elementosDOM.armazenamentoImagemUpload) {
            this.elementosDOM.armazenamentoImagemUpload.addEventListener('change', (e) => this.processarUploadArmazenamento(e));
        }

        // Setup de abas do modal de item
        this.setupAbas();

        console.log('✅ setupListeners() concluído');
    }

    // ===== RENDERIZAÇÃO =====

    /**
     * Renderiza tudo
     */
    async render() {
        // Validação defensiva
        if (!this.manager) {
            console.warn('⚠️ render() chamado mas manager é null - pulando renderização');
            return;
        }

        // Limpar filtros
        if (this.elementosDOM.filtroItens) {
            this.elementosDOM.filtroItens.value = '';
        }
        if (this.elementosDOM.filtroQualidade) {
            this.elementosDOM.filtroQualidade.value = '';
        }

        this.renderPainelEspaco();
        this.renderItens();
        this.renderArmazenamentos();
        
        // ⚠️ NÃO chamar setupListeners() aqui!
        // Os listeners dos itens já foram adicionados em renderItens()
        // Os listeners dos modais já foram adicionados em init() → setupListeners()
        // Chamar setupListeners() aqui causa DUPLICAÇÃO de listeners
        
        // ✅ Event delegation no document já cobre todos os botões
        // Não há necessidade de validarListenersButtons() - causava re-adição de listeners
    }

    /**
     * Renderiza painel de espaço com cálculos completos
     * Implementa: ESPAÇO TOTAL, ESPAÇO USADO, ESPAÇO LIVRE, STATUS
     * Seguindo exatamente a lógica da ficha principal
     */
    renderPainelEspaco() {
        if (!this.manager) {
            console.warn('⚠️ renderPainelEspaco() chamado mas manager é null');
            return;
        }

        // Obter resumo completo de espaço do manager
        const resumo = this.manager.obterResumoEspaco();

        // 1️⃣ ATUALIZAR VALORES DOS CARDS
        const espacoTotalEl = this.elementosDOM.espacoTotal;
        const espacoUsadoEl = this.elementosDOM.espacoUsado;
        const espacoLivreEl = this.elementosDOM.espacoLivre;
        const statusEl = this.elementosDOM.espacoStatus;

        if (espacoTotalEl) {
            espacoTotalEl.textContent = resumo.total.toFixed(2);
        }

        if (espacoUsadoEl) {
            espacoUsadoEl.textContent = resumo.usado.toFixed(2);
        }

        if (espacoLivreEl) {
            espacoLivreEl.textContent = resumo.livre.toFixed(2);
            // Aplicar classe visual baseada em sobrecarga
            if (resumo.sobrecarga) {
                espacoLivreEl.className = 'companheiro-espaco-valor companheiro-espaco-livre companheiro-espaco-sobrecarga';
            } else {
                espacoLivreEl.className = 'companheiro-espaco-valor companheiro-espaco-livre companheiro-espaco-ok';
            }
        }

        if (statusEl) {
            if (resumo.sobrecarga) {
                statusEl.textContent = '⚠️ SOBRECARGA';
                statusEl.className = 'companheiro-espaco-valor companheiro-espaco-status companheiro-status-sobrecarga';
            } else {
                statusEl.textContent = '✅ OK';
                statusEl.className = 'companheiro-espaco-valor companheiro-espaco-status companheiro-status-ok';
            }
        }

        // 2️⃣ ATUALIZAR BARRA VISUAL DE PROGRESSO
        this.atualizarBarraEspaco(resumo);

        console.log(`📊 Painel de espaço renderizado: Total=${resumo.total.toFixed(2)}, Usado=${resumo.usado.toFixed(2)}, Livre=${resumo.livre.toFixed(2)}, Sobrecarga=${resumo.sobrecarga}`);
    }

    /**
     * Atualiza barra visual de progresso de espaço
     * Cores: Verde (0-74%) → Amarelo (75-99%) → Vermelho (100%+)
     */
    atualizarBarraEspaco(resumo) {
        if (!resumo) {
            console.warn('⚠️ atualizarBarraEspaco() chamado com resumo null/undefined');
            return;
        }

        const barraEl = this.elementosDOM.espacoBarraFill;
        if (!barraEl) return;

        // Calcular percentual
        const percentual = resumo.total > 0 
            ? (resumo.usado / resumo.total) * 100 
            : 0;

        // Atualizar largura (max 100% visual, mas permite >100% logicamente)
        barraEl.style.width = Math.min(percentual, 100) + '%';

        // Determinar cor baseado no percentual
        if (resumo.sobrecarga) {
            // Vermelho para sobrecarga
            barraEl.className = 'companheiro-espaco-barra-fill companheiro-barra-sobrecarga';
            barraEl.style.backgroundColor = 'rgba(255, 50, 50, 0.8)';
        } else if (percentual >= 75) {
            // Amarelo/Laranja para alerta
            barraEl.className = 'companheiro-espaco-barra-fill companheiro-barra-alerta';
            barraEl.style.backgroundColor = 'rgba(255, 150, 0, 0.8)';
        } else if (percentual >= 50) {
            // Azul para uso moderado
            barraEl.className = 'companheiro-espaco-barra-fill companheiro-barra-moderado';
            barraEl.style.backgroundColor = 'rgba(100, 200, 255, 0.8)';
        } else {
            // Verde para ok
            barraEl.className = 'companheiro-espaco-barra-fill companheiro-barra-ok';
            barraEl.style.backgroundColor = 'rgba(100, 255, 100, 0.8)';
        }

        console.log(`📈 Barra atualizada: ${percentual.toFixed(1)}% (Usado: ${resumo.usado.toFixed(2)} / Total: ${resumo.total.toFixed(2)})`);
    }

    /**
     * Renderiza lista de itens
     */
    renderItens() {
        if (!this.elementosDOM.listaItens) return;
        if (!this.manager) {
            console.warn('⚠️ renderItens() chamado mas manager é null');
            return;
        }

        const itens = this.manager.obterItens();

        if (itens.length === 0) {
            this.elementosDOM.listaItens.innerHTML = '<div class="companheiro-empty-state">📭 Nenhum item no inventário</div>';
            return;
        }

        // Limpar lista e anexar elementos DOM diretamente para manter listeners estáveis
        this.elementosDOM.listaItens.innerHTML = '';

        itens.forEach(item => {
            const card = this.criarCardItem(item);

            // Botões dentro do card
            const btnEditar = card.querySelector('[data-acao="editar"]');
            if (btnEditar) {
                btnEditar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.abrirModalItem(item.id);
                });
            }

            const btnVer = card.querySelector('[data-acao="ver"]');
            if (btnVer) {
                btnVer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.abrirModalDetalhes(item.id);
                });
            }

            const btnEquipar = card.querySelector('[data-acao="equipar"]');
            if (btnEquipar) {
                btnEquipar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.manager.alternarEquipado(item.id);
                    this.render();
                });
            }

            const btnDeletar = card.querySelector('[data-acao="deletar"]');
            if (btnDeletar) {
                btnDeletar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Deletar este item?')) {
                        this.manager.deletarItem(item.id);
                        this.render();
                    }
                });
            }

            this.elementosDOM.listaItens.appendChild(card);
        });
    }

    /**
     * Cria HTML do card de um item
     */
    criarCardItem(item) {
        const espacoTotal = (item.quantidade * item.espaco).toFixed(2);
        const emojiTipo = this.obterEmojiTipo(item.tipo);

        const html = `
            <!-- Badge Equipado -->
            ${item.equipado ? '<div class="inventario-item-equipado-badge">⚔️ EQUIPADO</div>' : ''}

            <!-- Imagem -->
            <div class="inventario-item-imagem">
                ${item.imagemURL ? 
                    `<img src="${this.escaparHtml(item.imagemURL)}" alt="${this.escaparHtml(item.nome)}">` : 
                    `<div class="inventario-item-imagem-placeholder">${emojiTipo}</div>`}
            </div>

            <!-- Conteúdo -->
            <div class="inventario-item-conteudo">
                
                <!-- Nome e Qualidade -->
                <div class="inventario-item-header">
                    <h3 class="inventario-item-nome">${this.escaparHtml(item.nome)}</h3>
                    <span class="inventario-item-qualidade-badge badge-${item.qualidade || 'comum'}">
                        ${this.formatarQualidade(item.qualidade)}
                    </span>
                </div>

                <!-- Blocos de Informação -->
                <div class="inventario-item-blocos">
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Tipo</div>
                        <div class="inventario-item-bloco-valor">${this.escaparHtml(item.tipo || '—')}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Nível</div>
                        <div class="inventario-item-bloco-valor">${item.nivel || 1}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Roll</div>
                        <div class="inventario-item-bloco-valor">${this.escaparHtml(item.roll || '—')}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Extra</div>
                        <div class="inventario-item-bloco-valor">${this.escaparHtml(item.extra || '—')}</div>
                    </div>
                </div>

                <!-- Rodapé -->
                <div class="inventario-item-rodape">
                    <div class="inventario-item-quantidade">
                        Quantidade: <strong>${item.quantidade}</strong>
                    </div>
                    <div class="inventario-item-espaco-info">
                        <span>
                            <small>Unitário</small>
                            <span class="valor">${item.espaco.toFixed(2)}</span>
                        </span>
                        <span>
                            <small>Total</small>
                            <span class="valor">${espacoTotal}</span>
                        </span>
                    </div>

                    <!-- Botões -->
                    <div class="inventario-item-botoes com-equipar">
                        <button class="inventario-item-btn" title="Editar" data-acao="editar">✏️ Editar</button>
                        <button class="inventario-item-btn" title="Ver detalhes" data-acao="ver">👁️ Ver</button>
                        <button class="inventario-item-btn inventario-item-btn-equipar" title="Equipar/Desequipar" data-acao="equipar">
                            ${item.equipado ? '🗝️ Desequipar' : '⚔️ Equipar'}
                        </button>
                        <button class="inventario-item-btn inventario-item-btn-deletar" title="Remover" data-acao="deletar">🗑️ Deletar</button>
                    </div>
                </div>
            </div>
        `;

        const card = document.createElement('div');
        card.className = `inventario-item-card qualidade-${item.qualidade || 'comum'} ${item.equipado ? 'equipado' : ''}`;
        card.dataset.itemId = item.id;
        card.dataset.itemQualidade = item.qualidade || 'comum';
        card.innerHTML = html;

        return card;
    }

    /**
     * Obtém emoji baseado no tipo de item
     */
    obterEmojiTipo(tipo) {
        const tiposEmoji = {
            'arma': '⚔️',
            'armadura': '🛡️',
            'pocao': '🧪',
            'pocão': '🧪',
            'tesouro': '💎',
            'consumivel': '🍗',
            'consumível': '🍗',
            'equipamento': '🎒',
            'artefato': '✨',
            'livro': '📖',
            'mapa': '🗺️',
        };

        if (!tipo) return '📦';
        
        const tipoLower = tipo.toLowerCase();
        for (const [key, emoji] of Object.entries(tiposEmoji)) {
            if (tipoLower.includes(key)) return emoji;
        }
        
        return '📦';
    }

    /**
     * Formata nome da qualidade
     */
    formatarQualidade(qualidade) {
        const qualidades = {
            'comum': 'COMUM',
            'raro': 'RARO',
            'epico': 'ÉPICO',
            'mitico': 'MÍTICO',
            'lendario': 'LENDÁRIO',
            'celestial': 'CELESTIAL'
        };
        return qualidades[qualidade] || 'COMUM';
    }

    /**
     * Renderiza lista de armazenamentos
     */
    renderArmazenamentos() {
        if (!this.elementosDOM.listaArmazenamentos) return;
        if (!this.manager) {
            console.warn('⚠️ renderArmazenamentos() chamado mas manager é null');
            return;
        }

        const armazenamentos = this.manager.obterArmazenamentos();

        if (armazenamentos.length === 0) {
            this.elementosDOM.listaArmazenamentos.innerHTML = '<div class="companheiro-empty-state">🎁 Nenhum armazenamento</div>';
            return;
        }

        this.elementosDOM.listaArmazenamentos.innerHTML = armazenamentos.map(arm => {
            return `
                <div class="companheiro-armazenamento-card-novo" data-arm-id="${arm.id}">
                    <!-- Imagem em Destaque (Topo) -->
                    <div class="companheiro-armazenamento-imagem-destaque">
                        ${arm.imagemURL 
                            ? `<img src="${this.escaparHtml(arm.imagemURL)}" alt="${this.escaparHtml(arm.nome)}" onerror="this.style.display='none'">` 
                            : `<div class="companheiro-armazenamento-emoji">🎁</div>`}
                    </div>
                    
                    <!-- Conteúdo Principal (Meio) -->
                    <div class="companheiro-armazenamento-conteudo-novo">
                        <h3 class="companheiro-armazenamento-nome">${this.escaparHtml(arm.nome)}</h3>
                        <div class="companheiro-armazenamento-bonus">
                            <span class="companheiro-armazenamento-bonus-label">+</span>
                            <span class="companheiro-armazenamento-bonus-valor">${arm.bonusEspaco.toFixed(2)}</span>
                            <span class="companheiro-armazenamento-bonus-label">espaço</span>
                        </div>
                    </div>

                    <!-- Ações (Rodapé) -->
                    <div class="companheiro-armazenamento-rodape">
                        <button class="companheiro-armazenamento-btn companheiro-armazenamento-btn-editar" title="Editar" onclick="window.companheiroInventarioUI.abrirModalArmazenamento('${arm.id}')">✏️ Editar</button>
                        <button class="companheiro-armazenamento-btn companheiro-armazenamento-btn-info" title="Ver detalhes" onclick="window.companheiroInventarioUI.abrirDetalhesArmazenamento('${arm.id}')">👁️ Ver</button>
                        <button class="companheiro-armazenamento-btn companheiro-armazenamento-btn-deletar" title="Remover" onclick="if (confirm('Tem certeza que deseja deletar este armazenamento?')) { window.companheiroInventarioManager.deletarArmazenamento('${arm.id}'); window.companheiroInventarioUI.render(); }">🗑️ Remover</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== MODAIS =====

    /**
     * Abre modal de criar/editar item
     */
    abrirModalItem(itemId = null) {
        console.log('🔍 abrirModalItem() chamado com ID:', itemId);
        console.log('🔍 this.manager atual:', this.manager);
        
        if (!this.manager) {
            console.error('❌ ERRO CRÍTICO em abrirModalItem: this.manager é NULL!');
            alert('❌ Erro: Sistema não inicializado. Tente recarregar a página.');
            return;
        }
        
        if (!this.elementosDOM.modalItem) {
            console.error('❌ ERRO CRÍTICO: Modal de item não encontrado em elementosDOM');
            console.error('elementosDOM.modalItem:', this.elementosDOM.modalItem);
            console.log('Tentando encontrar modal com ID direto...');
            
            const modalDirect = document.getElementById('companheiro-modal-item');
            console.log('Modal encontrado diretamente?', !!modalDirect);
            
            if (!modalDirect) {
                console.error('❌ Modal com ID "companheiro-modal-item" não existe no DOM!');
                return;
            }
            
            // Update cache se encontrou
            this.elementosDOM.modalItem = modalDirect;
        }
        
        this.itemEmEdicao = itemId;

        const modal = this.elementosDOM.modalItem;
        if (!modal) {
            console.error('❌ Modal de item não encontrado (segunda tentativa)');
            return;
        }
        
        console.log('✅ Modal de item encontrado, abrindo...');
        
        const titulo = modal.querySelector('.companheiro-modal-title');
        
        if (itemId) {
            const item = this.manager.obterItem(itemId);
            if (!item) {
                console.warn('⚠️ Item não encontrado com ID:', itemId);
                return;
            }

            if (titulo) titulo.textContent = 'Editar Item';

            // Carregar todos os campos com validação
            const campos = {
                'companheiro-item-nome': { value: item.nome || '', prop: 'value' },
                'companheiro-item-qualidade': { value: item.qualidade || 'comum', prop: 'value' },
                'companheiro-item-tipo': { value: item.tipo || '', prop: 'value' },
                'companheiro-item-nivel': { value: item.nivel || 1, prop: 'value' },
                'companheiro-item-equipado': { value: item.equipado || false, prop: 'checked' },
                'companheiro-item-quantidade': { value: item.quantidade || 1, prop: 'value' },
                'companheiro-item-espaco': { value: item.espaco || 1.0, prop: 'value' },
                'companheiro-item-imagemURL': { value: item.imagemURL || '', prop: 'value' },
                'companheiro-item-roll': { value: item.roll || '', prop: 'value' },
                'companheiro-item-extra': { value: item.extra || '', prop: 'value' },
                'companheiro-item-habilidade': { value: item.habilidade || '', prop: 'value' },
                'companheiro-item-historia': { value: item.historia || '', prop: 'value' },
            };

            Object.entries(campos).forEach(([id, config]) => {
                const el = this.getElement(id);
                if (el) {
                    el[config.prop] = config.value;
                }
            });

            // Carregar preview da imagem
            if (item.imagemURL) {
                const preview = document.getElementById('companheiro-item-imagem-preview');
                if (preview) {
                    preview.innerHTML = `<img src="${item.imagemURL}" alt="${item.nome}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            }
        } else {
            if (titulo) titulo.textContent = 'Criar Item';
            const form = modal.querySelector('.companheiro-modal-body');
            if (form) {
                form.querySelectorAll('input[type="text"], input[type="number"], input[type="checkbox"], select, textarea').forEach(el => {
                    if (el.type === 'checkbox') el.checked = false;
                    else el.value = '';
                });
                // Reset preview
                const preview = document.getElementById('companheiro-item-imagem-preview');
                if (preview) {
                    preview.innerHTML = '<div class="form-imagem-placeholder">📦</div>';
                }
            }
            
            // Reset input de file
            const fileInput = document.getElementById('companheiro-item-imagem-upload');
            if (fileInput) fileInput.value = '';
            
            // Reset tab de imagem para URL
            const urlTab = document.getElementById('companheiro-imagem-url-tab');
            if (urlTab) urlTab.checked = true;
            this.alternarTipoImagem('url');
            
            // Set default values
            const inputNivel = document.getElementById('companheiro-item-nivel');
            if (inputNivel) inputNivel.value = 1;
            
            const inputQtd = document.getElementById('companheiro-item-quantidade');
            if (inputQtd) inputQtd.value = 1;
            
            const inputEspaco = document.getElementById('companheiro-item-espaco');
            if (inputEspaco) inputEspaco.value = 1.0;
        }

        modal.classList.add('companheiro-modal--ativo');
        console.log('✅ Modal marcado como ativo (classe adicionada)');

        // Recalcular espaço imediatamente após abrir o modal
        setTimeout(() => this.recalcularEspacoTotal(), 100);
    }

    /**
     * Fecha modal de item
     */
    fecharModalItem() {
        if (!this.elementosDOM.modalItem) return;
        
        this.elementosDOM.modalItem.classList.remove('companheiro-modal--ativo');
        this.itemEmEdicao = null;
    }

    /**
     * Salva item (cria ou atualiza)
     */
    async salvarItem() {
        this._salvarItemCount = (this._salvarItemCount || 0) + 1;
        console.log(`\n🔴 ========== SALVAR ITEM (Execução #${this._salvarItemCount}) ==========`);
        console.log(`Call Stack:`, new Error().stack.split('\n').slice(0, 5).join('\n'));
        console.log('✅✅✅ FUNÇÃO salvarItem FOI CHAMADA! ✅✅✅');
        
        if (!this.manager) {
            console.error('❌ CRÍTICO: Manager é null, não posso salvar item');
            alert('❌ Erro: Sistema não inicializado');
            return;
        }

        if (!this.elementosDOM.modalItem) {
            console.log('❌ Modal não encontrado');
            return;
        }

        let dados = {
            nome: document.getElementById('companheiro-item-nome')?.value || '',
            qualidade: document.getElementById('companheiro-item-qualidade')?.value || 'comum',
            tipo: document.getElementById('companheiro-item-tipo')?.value || '',
            nivel: parseInt(document.getElementById('companheiro-item-nivel')?.value) || 1,
            quantidade: parseInt(document.getElementById('companheiro-item-quantidade')?.value) || 1,
            espaco: parseFloat(document.getElementById('companheiro-item-espaco')?.value) || 1.0,
            imagemURL: document.getElementById('companheiro-item-imagemURL')?.value || '',
            roll: document.getElementById('companheiro-item-roll')?.value || '',
            extra: document.getElementById('companheiro-item-extra')?.value || '',
            equipado: document.getElementById('companheiro-item-equipado')?.checked || false,
            habilidade: document.getElementById('companheiro-item-habilidade')?.value || '',
            historia: document.getElementById('companheiro-item-historia')?.value || '',
        };

        console.log('📝 Dados do item:', dados);

        // Validar
        if (!dados.nome.trim()) {
            alert('⚠️ Nome do item é obrigatório!');
            return;
        }

        if (!dados.tipo.trim()) {
            alert('⚠️ Tipo do item é obrigatório!');
            return;
        }

        // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
        if (dados.imagemURL && dados.imagemURL.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('💾 Comprimindo imagem do item do companheiro...');
            dados.imagemURL = await ImageCompressor.compressImage(dados.imagemURL, 'art');
        }

        if (this.itemEmEdicao) {
            // Atualizar
            console.log('✏️ Atualizando item existente ID:', this.itemEmEdicao);
            if (!this.manager.atualizarItem(this.itemEmEdicao, dados)) {
                alert('❌ Erro ao atualizar item');
                return;
            }
        } else {
            // Criar
            console.log('🆕 Criando novo item...');
            if (!this.manager.adicionarItem(dados)) {
                // Mostrar aviso de espaço insuficiente
                const avisoEspaco = document.getElementById('companheiro-item-aviso-espaco');
                if (avisoEspaco) {
                    avisoEspaco.style.display = 'flex';
                }
                alert('❌ Erro ao criar item (espaço insuficiente?)');
                return;
            }
            console.log('✅ Item criado com sucesso');
        }

        this.fecharModalItem();
        console.log('⏳ Chamando render()...');
        await this.render();
        console.log(`✅ salvarItem (Execução #${this._salvarItemCount}) CONCLUÍDO\n`);
    }

    /**
     * Abre modal de detalhes do item
     */
    abrirModalDetalhes(itemId) {
        if (!this.elementosDOM.modalDetalhes) return;

        const item = this.manager.obterItem(itemId);
        if (!item) return;

        console.log('📋 Abrindo detalhes do item:', item);

        this.elementosDOM.modalDetalhes.dataset.itemId = itemId;

        // Preencher dados básicos
        document.getElementById('companheiro-detalhes-titulo').textContent = item.nome;
        document.getElementById('companheiro-detalhes-nome').textContent = item.nome;
        document.getElementById('companheiro-detalhes-qualidade').textContent = (item.qualidade || 'comum').toUpperCase();
        document.getElementById('companheiro-detalhes-tipo').textContent = item.tipo || '—';
        document.getElementById('companheiro-detalhes-nivel').textContent = item.nivel || '—';
        document.getElementById('companheiro-detalhes-quantidade').textContent = item.quantidade;
        document.getElementById('companheiro-detalhes-espaco-unitario').textContent = item.espaco.toFixed(2);
        document.getElementById('companheiro-detalhes-espaco-total').textContent = (item.quantidade * item.espaco).toFixed(2);
        document.getElementById('companheiro-detalhes-status').textContent = item.equipado ? '✅ Equipado' : '📦 Inventário';

        // Imagem
        if (item.imagemURL) {
            const img = document.getElementById('companheiro-detalhes-imagem');
            img.src = item.imagemURL;
            img.style.display = 'block';
            document.getElementById('companheiro-detalhes-imagem-placeholder').style.display = 'none';
        } else {
            document.getElementById('companheiro-detalhes-imagem').style.display = 'none';
            document.getElementById('companheiro-detalhes-imagem-placeholder').style.display = 'flex';
        }

        // Habilidade
        if (item.habilidade && item.habilidade.trim()) {
            console.log('⚡ Mostrando habilidade:', item.habilidade);
            document.getElementById('companheiro-detalhes-habilidade-secao').style.display = 'block';
            document.getElementById('companheiro-detalhes-habilidade').textContent = item.habilidade;
        } else {
            console.log('❌ Sem habilidade');
            document.getElementById('companheiro-detalhes-habilidade-secao').style.display = 'none';
        }

        // História
        if (item.historia && item.historia.trim()) {
            console.log('📖 Mostrando história:', item.historia);
            document.getElementById('companheiro-detalhes-historia-secao').style.display = 'block';
            document.getElementById('companheiro-detalhes-historia').textContent = item.historia;
        } else {
            console.log('❌ Sem história');
            document.getElementById('companheiro-detalhes-historia-secao').style.display = 'none';
        }

        // Abrir modal
        this.elementosDOM.modalDetalhes.classList.add('companheiro-modal--ativo');
    }

    /**
     * Fecha modal de detalhes
     */
    fecharModalDetalhes() {
        if (!this.elementosDOM.modalDetalhes) return;
        
        this.elementosDOM.modalDetalhes.classList.remove('companheiro-modal--ativo');
    }

    /**
     * Abre modal de armazenamento
     */
    abrirModalArmazenamento(armazenamentoId = null) {
        console.log('🔍 abrirModalArmazenamento() chamado com ID:', armazenamentoId);
        console.log('🔍 this.manager atual:', this.manager);
        
        if (!this.manager) {
            console.error('❌ ERRO CRÍTICO em abrirModalArmazenamento: this.manager é NULL!');
            alert('❌ Erro: Sistema não inicializado. Tente recarregar a página.');
            return;
        }
        
        if (!this.elementosDOM.modalArmazenamento) {
            console.error('❌ ERRO CRÍTICO: Modal de armazenamento não encontrado em elementosDOM');
            console.log('Tentando encontrar modal com ID direto...');
            
            const modalDirect = document.getElementById('companheiro-modal-armazenamento');
            console.log('Modal encontrado diretamente?', !!modalDirect);
            
            if (!modalDirect) {
                console.error('❌ Modal com ID "companheiro-modal-armazenamento" não existe no DOM!');
                return;
            }
            
            // Update cache se encontrou
            this.elementosDOM.modalArmazenamento = modalDirect;
        }

        this.armazenamentoEmEdicao = armazenamentoId 
            ? this.manager.obterArmazenamento(armazenamentoId)
            : null;

        const ehNovoArmazenamento = !this.armazenamentoEmEdicao;
        const modal = this.elementosDOM.modalArmazenamento;
        const titulo = modal.querySelector('.companheiro-modal-title');
        
        if (titulo) {
            titulo.textContent = ehNovoArmazenamento ? 'Novo Armazenamento' : 'Editar Armazenamento';
        }

        // Preencher campos
        const campoNome = document.getElementById('companheiro-armazenamento-nome');
        const campoBonus = document.getElementById('companheiro-armazenamento-bonusEspaco');
        const campoImagem = document.getElementById('companheiro-armazenamento-imagemURL');
        const campoDescricao = document.getElementById('companheiro-armazenamento-descricao');

        if (campoNome) campoNome.value = this.armazenamentoEmEdicao?.nome || '';
        if (campoBonus) campoBonus.value = this.armazenamentoEmEdicao?.bonusEspaco || 0;
        if (campoImagem) campoImagem.value = this.armazenamentoEmEdicao?.imagemURL || '';
        if (campoDescricao) campoDescricao.value = this.armazenamentoEmEdicao?.descricao || '';

        // Reset input de file para novo armazenamento
        if (ehNovoArmazenamento) {
            const fileInput = document.getElementById('companheiro-armazenamento-imagem-upload');
            if (fileInput) fileInput.value = '';
            
            // Reset tab de imagem para URL
            const urlTab = document.getElementById('companheiro-armazenamento-imagem-url-tab');
            if (urlTab) urlTab.checked = true;
            this.alternarTipoImagemArmazenamento('url');
            
            // Reset preview
            const preview = document.getElementById('companheiro-armazenamento-imagem-preview');
            if (preview) {
                preview.innerHTML = '<div class="companheiro-form-imagem-placeholder">🎁</div>';
            }
        }

        // Mostrar/esconder botão de deletar
        const btnDeletar = document.getElementById('companheiro-btn-modal-armazenamento-deletar');
        if (btnDeletar) {
            btnDeletar.style.display = ehNovoArmazenamento ? 'none' : 'block';
        }

        // Abrir modal
        modal.classList.add('companheiro-modal--ativo');
        console.log(ehNovoArmazenamento ? '🆕 Novo armazenamento aberto' : '✏️ Editando armazenamento');
    }

    // ===== FILTROS =====

    /**
     * Filtra itens por termo
     */
    filtrarItens(termo) {
        if (!this.elementosDOM.listaItens) return;

        const cards = this.elementosDOM.listaItens.querySelectorAll('[data-item-id]');
        const termoNormalizado = this.normalizarTexto(termo);

        cards.forEach(card => {
            const nome = this.normalizarTexto(card.querySelector('h3')?.textContent || '');
            if (nome.includes(termoNormalizado)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Aplica filtros combinados (busca + qualidade)
     */
    aplicarFiltrosItens() {
        if (!this.elementosDOM.listaItens) return;

        const termo = (this.elementosDOM.filtroItens?.value || '').toLowerCase().trim();
        const qualidade = this.elementosDOM.filtroQualidade?.value || '';
        const termoNormalizado = this.normalizarTexto(termo);

        const cards = this.elementosDOM.listaItens.querySelectorAll('[data-item-id]');
        let todosOcultados = true;

        cards.forEach(card => {
            const nome = this.normalizarTexto(card.querySelector('h3')?.textContent || '');
            const itemQualidade = card.dataset.itemQualidade || 'comum';

            // Verificar filtro de busca
            const passaBusca = !termo || nome.includes(termoNormalizado);

            // Verificar filtro de qualidade
            const passaQualidade = !qualidade || itemQualidade.toLowerCase() === qualidade.toLowerCase();

            // Mostrar ou ocultar card
            if (passaBusca && passaQualidade) {
                card.style.display = '';
                todosOcultados = false;
            } else {
                card.style.display = 'none';
            }
        });

        // Se todos estão ocultados, mostrar mensagem vazia
        if (todosOcultados) {
            // Verificar se já existe uma mensagem vazia
            let mensagemExistente = this.elementosDOM.listaItens.querySelector('.companheiro-empty-state');
            
            if (!mensagemExistente) {
                const mensagem = document.createElement('div');
                mensagem.className = 'companheiro-empty-state';
                
                if (termo && qualidade) {
                    mensagem.innerHTML = '<span>🔍 Nenhum item encontrado com esses filtros</span>';
                } else if (termo) {
                    mensagem.innerHTML = '<span>🔍 Nenhum item encontrado com esse nome</span>';
                } else if (qualidade) {
                    mensagem.innerHTML = '<span>🔍 Nenhum item com qualidade encontrado</span>';
                } else {
                    mensagem.innerHTML = '<span>🎒 Nenhum item no inventário</span>';
                }
                
                this.elementosDOM.listaItens.appendChild(mensagem);
            }
        } else {
            // Se há itens, remover mensagem vazia se existir
            const mensagemExistente = this.elementosDOM.listaItens.querySelector('.companheiro-empty-state');
            if (mensagemExistente) {
                mensagemExistente.remove();
            }
        }

        console.log(`🎨 Filtros aplicados: busca="${termo}" qualidade="${qualidade}"`);
    }

    /**
     * Filtra armazenamentos por termo
     */
    filtrarArmazenamentos(termo) {
        if (!this.elementosDOM.listaArmazenamentos) return;

        const cards = this.elementosDOM.listaArmazenamentos.querySelectorAll('[data-arm-id]');
        const termoNormalizado = this.normalizarTexto(termo);

        cards.forEach(card => {
            const nome = this.normalizarTexto(card.querySelector('.companheiro-armazenamento-nome')?.textContent || '');
            if (nome.includes(termoNormalizado)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Alterna tipo de imagem do armazenamento (URL vs Upload)
     */
    alternarTipoImagemArmazenamento(tipo) {
        const inputUrl = document.getElementById('companheiro-armazenamento-imagemURL');
        const inputUpload = document.getElementById('companheiro-armazenamento-imagem-upload');

        if (tipo === 'url') {
            if (inputUrl) inputUrl.style.display = 'block';
            if (inputUpload) inputUpload.style.display = 'none';
        } else {
            if (inputUrl) inputUrl.style.display = 'none';
            if (inputUpload) inputUpload.style.display = 'block';
        }
    }

    /**
     * Processa upload de imagem para armazenamento
     */
    processarUploadArmazenamento(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imagemData = event.target.result;
            
            // Atualizar preview
            const preview = document.getElementById('companheiro-armazenamento-imagem-preview');
            if (preview) {
                preview.innerHTML = `<img src="${imagemData}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
            }

            // Salvar em campo oculto
            const urlField = document.getElementById('companheiro-armazenamento-imagemURL');
            if (urlField) {
                urlField.value = imagemData;
            }

            console.log('📸 Upload de imagem processado para armazenamento');
        };

        reader.readAsDataURL(arquivo);
    }

    /**
     * Atualiza preview da imagem do armazenamento a partir de URL
     */
    atualizarPreviewArmazenamento() {
        const urlField = document.getElementById('companheiro-armazenamento-imagemURL');
        const preview = document.getElementById('companheiro-armazenamento-imagem-preview');

        if (!urlField || !preview) return;

        const url = urlField.value.trim();

        if (!url) {
            preview.innerHTML = '<div class="companheiro-form-imagem-placeholder">🎁</div>';
            return;
        }

        // Tentar carregar a imagem
        const img = new Image();
        img.onload = () => {
            preview.innerHTML = `<img src="${url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`;
            console.log('✅ Preview de imagem atualizado para armazenamento');
        };

        img.onerror = () => {
            preview.innerHTML = '<div class="companheiro-form-imagem-placeholder">❌ Erro ao carregar imagem</div>';
            console.warn('⚠️ Erro ao carregar preview de imagem para armazenamento');
        };

        img.src = url;
    }

    // ===== UTILITÁRIOS =====

    /**
     * Configura listeners para as abas do modal de item
     */
    setupAbas() {
        const abaBotoes = this.elementosDOM.modalItem?.querySelectorAll('.item-aba-btn');
        if (!abaBotoes) return;

        abaBotoes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const abaName = e.target.dataset.aba;
                if (abaName) {
                    this.alternarAbaInterna(abaName);
                }
            });
        });

        // ✅ ADICIONAR LISTENERS PARA RECÁLCULO DE ESPAÇO
        const inputQuantidade = document.getElementById('companheiro-item-quantidade');
        const inputEspaco = document.getElementById('companheiro-item-espaco');

        if (inputQuantidade) {
            inputQuantidade.addEventListener('change', () => this.recalcularEspacoTotal());
            inputQuantidade.addEventListener('input', () => this.recalcularEspacoTotal());
        }

        if (inputEspaco) {
            inputEspaco.addEventListener('change', () => this.recalcularEspacoTotal());
            inputEspaco.addEventListener('input', () => this.recalcularEspacoTotal());
        }
    }

    /**
     * Alterna entre abas internas (Habilidade / História)
     */
    alternarAbaInterna(abaName) {
        if (!this.elementosDOM.modalItem) return;

        // Remover classe ativa de todos os botões
        const abaBotoes = this.elementosDOM.modalItem.querySelectorAll('.item-aba-btn');
        abaBotoes.forEach(btn => {
            btn.classList.remove('item-aba-btn--ativo');
        });

        // Remover visibilidade de todos os conteúdos
        const abaConteudos = this.elementosDOM.modalItem.querySelectorAll('.item-aba-conteudo');
        abaConteudos.forEach(conteudo => {
            conteudo.style.display = 'none';
        });

        // Ativar aba selecionada
        const btnSelecionado = this.elementosDOM.modalItem.querySelector(`[data-aba="${abaName}"]`);
        if (btnSelecionado) {
            btnSelecionado.classList.add('item-aba-btn--ativo');
        }

        const conteudoSelecionado = this.elementosDOM.modalItem.querySelector(`.item-aba-conteudo[data-aba="${abaName}"]`);
        if (conteudoSelecionado) {
            conteudoSelecionado.style.display = 'block';
        }
    }

    /**
     * Alterna tipo de imagem (URL vs Upload)
     */
    alternarTipoImagem(tipo) {
        console.log('🖼️ alternarTipoImagem() chamado com tipo:', tipo);
        const urlInput = document.getElementById('companheiro-item-imagemURL');
        const uploadInput = document.getElementById('companheiro-item-imagem-upload');

        console.log('   - URL input encontrado?', !!urlInput);
        console.log('   - Upload input encontrado?', !!uploadInput);

        if (!urlInput || !uploadInput) {
            console.error('❌ Inputs de imagem não encontrados!');
            return;
        }

        if (tipo === 'url') {
            urlInput.style.display = 'block';
            uploadInput.style.display = 'none';
            console.log('   ✅ Alterado para URL');
        } else if (tipo === 'upload') {
            urlInput.style.display = 'none';
            uploadInput.style.display = 'block';
            console.log('   ✅ Alterado para Upload');
        }
    }

    /**
     * Processa upload de imagem para item
     */
    processarUploadImagemItem(evento) {
        console.log('📤 processarUploadImagemItem() chamado');
        const arquivo = evento.target.files[0];
        
        if (!arquivo) {
            console.warn('⚠️ Nenhum arquivo selecionado');
            return;
        }

        console.log('   - Arquivo:', arquivo.name);
        console.log('   - Tipo:', arquivo.type);
        console.log('   - Tamanho:', (arquivo.size / 1024).toFixed(2) + 'KB');

        // Validar tipo
        if (!arquivo.type.startsWith('image/')) {
            alert('❌ Selecione um arquivo de imagem válido');
            evento.target.value = '';
            return;
        }

        // Validar tamanho (5MB max)
        const tamanhoMB = arquivo.size / 1024 / 1024;
        if (tamanhoMB > 5) {
            alert('❌ Arquivo muito grande (máx 5MB)');
            evento.target.value = '';
            return;
        }

        // Converter para Data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const urlField = document.getElementById('companheiro-item-imagemURL');
            if (urlField) {
                urlField.value = dataUrl;
                console.log('   ✅ Arquivo convertido para Data URL e salvo');
            }
            this.atualizarPreviewImagemItem();
        };
        reader.readAsDataURL(arquivo);
    }

    /**
     * Atualiza preview de imagem do item
     */
    atualizarPreviewImagemItem() {
        console.log('🎨 atualizarPreviewImagemItem() chamado');
        const url = document.getElementById('companheiro-item-imagemURL')?.value || '';
        console.log('   - URL para preview:', url.substring(0, 50) + '...');
        this.mostrarPreviewImagemItem(url);
    }

    /**
     * Mostra preview da imagem do item
     */
    mostrarPreviewImagemItem(url) {
        const preview = document.getElementById('companheiro-item-imagem-preview');
        if (!preview) return;

        const placeholder = preview.querySelector('.form-imagem-placeholder');

        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onerror = () => {
                if (placeholder) placeholder.style.display = 'flex';
            };
            img.onload = () => {
                if (placeholder) placeholder.style.display = 'none';
            };
            preview.innerHTML = '';
            preview.appendChild(img);
        } else {
            preview.innerHTML = '<div class="form-imagem-placeholder">📦</div>';
        }
    }

    /**
     * Recalcula o espaço total do item em tempo real
     * Atualiza displays e validações conforme o usuário digita
     */
    recalcularEspacoTotal() {
        const quantidade = parseInt(document.getElementById('companheiro-item-quantidade')?.value) || 1;
        const espaco = parseFloat(document.getElementById('companheiro-item-espaco')?.value) || 1.0;
        const espacoTotal = (quantidade * espaco).toFixed(2);

        // 1️⃣ ATUALIZAR DISPLAYS DE ESPAÇO
        const displayTotal = document.getElementById('companheiro-item-espaco-total-valor');
        if (displayTotal) {
            displayTotal.textContent = parseFloat(espacoTotal);
        }

        // 2️⃣ ATUALIZAR ESPAÇO LIVRE DISPONÍVEL (considerando edição)
        this.atualizarEspacoLivreNoModal();

        // 3️⃣ VALIDAR ESPAÇO E ATUALIZAR UI
        this.validarEspacoItem(parseFloat(espacoTotal));

        console.log(`📏 Espaço recalculado: ${espacoTotal} (Qtd: ${quantidade} × Espaço: ${espaco})`);
    }

    /**
     * Atualiza display de espaço livre no modal
     * Se estiver editando, adiciona de volta o espaço do item anterior
     */
    atualizarEspacoLivreNoModal() {
        if (!this.manager) {
            console.warn('⚠️ atualizarEspacoLivreNoModal() chamado mas manager é null');
            return;
        }

        const resumo = this.manager.obterResumoEspaco();
        let espacoLivre = resumo.livre;

        // Se estamos editando um item existente, adicionar de volta seu espaço anterior
        if (this.itemEmEdicao) {
            const item = this.manager.obterItem(this.itemEmEdicao);
            if (item) {
                const espacoAnterior = item.espaco * item.quantidade;
                espacoLivre += espacoAnterior;
                console.log(`   [Edição] Espaço anterior do item: ${espacoAnterior}, novo espaço livre: ${espacoLivre.toFixed(2)}`);
            }
        }

        const displayLivre = document.getElementById('companheiro-inventario-espaco-livre-modal');
        if (displayLivre) {
            displayLivre.textContent = espacoLivre.toFixed(2);
        }

        console.log(`📊 Espaço livre no modal: ${espacoLivre.toFixed(2)}`);
    }

    /**
     * Valida se o item cabe no inventário e atualiza UI
     * Mostra aviso se espaço insuficiente
     */
    validarEspacoItem(espacoTotal) {
        if (!this.manager) {
            console.warn('⚠️ validarEspacoItem() chamado mas manager é null');
            return;
        }

        const resumo = this.manager.obterResumoEspaco();
        let espacoDisponivel = resumo.livre;

        // Se estamos editando, adicionar espaço do item anterior
        if (this.itemEmEdicao) {
            const item = this.manager.obterItem(this.itemEmEdicao);
            if (item) {
                espacoDisponivel += (item.espaco * item.quantidade);
            }
        }

        const avisoEl = document.getElementById('companheiro-item-aviso-espaco');
        const btnSalvar = document.getElementById('companheiro-btn-modal-item-salvar');

        if (espacoTotal > espacoDisponivel) {
            // Espaço insuficiente
            if (avisoEl) avisoEl.style.display = 'block';
            if (btnSalvar) btnSalvar.disabled = true;
            console.warn(`⚠️ Espaço insuficiente: precisa ${espacoTotal}, disponível ${espacoDisponivel.toFixed(2)}`);
        } else {
            // Espaço ok
            if (avisoEl) avisoEl.style.display = 'none';
            if (btnSalvar) btnSalvar.disabled = false;
            console.log(`✅ Espaço ok: ${espacoTotal} <= ${espacoDisponivel.toFixed(2)}`);
        }
    }

    /**
     * Fecha modal de armazenamento
     */
    fecharModalArmazenamento() {
        const modal = document.getElementById('companheiro-modal-armazenamento');
        if (modal) {
            modal.classList.remove('companheiro-modal--ativo');
            this.armazenamentoEmEdicao = null;
        }
    }

    /**
     * Salva armazenamento (novo ou edição)
     */
    async salvarArmazenamento() {
        this._salvarArmazenamentoCount = (this._salvarArmazenamentoCount || 0) + 1;
        console.log(`\n🔴 ========== SALVAR ARMAZENAMENTO (Execução #${this._salvarArmazenamentoCount}) ==========`);
        console.log(`Call Stack:`, new Error().stack.split('\n').slice(0, 5).join('\n'));
        console.log('✅✅✅ FUNÇÃO salvarArmazenamento FOI CHAMADA! ✅✅✅');
        
        if (!this.manager) {
            console.error('❌ CRÍTICO: Manager é null, não posso salvar armazenamento');
            alert('❌ Erro: Sistema não inicializado');
            return;
        }

        const campoNome = document.getElementById('companheiro-armazenamento-nome');
        const campoBonus = document.getElementById('companheiro-armazenamento-bonusEspaco');
        const campoImagem = document.getElementById('companheiro-armazenamento-imagemURL');
        const campoDescricao = document.getElementById('companheiro-armazenamento-descricao');

        const nome = campoNome?.value.trim() || '';
        const bonus = parseFloat(campoBonus?.value) || 0;
        let imagem = campoImagem?.value.trim() || '';
        const descricao = campoDescricao?.value.trim() || '';

        console.log('📦 Dados do armazenamento:', { nome, bonus, descricao });

        if (!nome) {
            alert('❌ Nome do armazenamento é obrigatório');
            return;
        }

        // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
        if (imagem && imagem.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('📦 Comprimindo imagem do armazenamento do companheiro...');
            imagem = await ImageCompressor.compressImage(imagem, 'art');
        }

        const dados = {
            nome,
            bonusEspaco: bonus,
            imagemURL: imagem,
            descricao
        };

        if (this.armazenamentoEmEdicao) {
            // Atualizar
            console.log('✏️ Atualizando armazenamento existente ID:', this.armazenamentoEmEdicao.id);
            this.manager.atualizarArmazenamento(this.armazenamentoEmEdicao.id, dados);
            console.log('✅ Armazenamento atualizado');
        } else {
            // Criar novo
            console.log('🆕 Criando novo armazenamento...');
            this.manager.adicionarArmazenamento(dados);
            console.log('✅ Armazenamento criado com sucesso');
        }

        this.fecharModalArmazenamento();
        console.log('⏳ Chamando render()...');
        await this.render();
        console.log(`✅ salvarArmazenamento (Execução #${this._salvarArmazenamentoCount}) CONCLUÍDO\n`);
    }

    /**
     * Deleta um armazenamento
     */
    deletarArmazenamento() {
        if (!this.manager) {
            console.error('❌ CRÍTICO: Manager é null');
            return;
        }

        if (!this.armazenamentoEmEdicao) return;

        if (!confirm('Tem certeza que deseja deletar este armazenamento?')) {
            return;
        }

        this.manager.deletarArmazenamento(this.armazenamentoEmEdicao.id);
        console.log('🗑️ Armazenamento deletado');

        this.fecharModalArmazenamento();
        this.render();
    }

    /**
     * Abre modal de detalhes do armazenamento (apenas visualização)
     */
    abrirDetalhesArmazenamento(armazenamentoId) {
        const armazenamento = this.manager.obterArmazenamento(armazenamentoId);
        if (!armazenamento) {
            console.warn('⚠️ Armazenamento não encontrado:', armazenamentoId);
            return;
        }

        if (!this.elementosDOM.modalDetalhesArmazenamento) {
            console.error('❌ Modal de detalhes de armazenamento não encontrado');
            return;
        }

        // Guardar ID para referência
        this.elementosDOM.modalDetalhesArmazenamento.dataset.armId = armazenamentoId;

        // Atualizar título
        const titulo = this.elementosDOM.modalDetalhesArmazenamento.querySelector('.companheiro-modal-title');
        if (titulo) {
            titulo.textContent = armazenamento.nome;
        }

        // Atualizar nome
        document.getElementById('companheiro-armazenamento-detalhes-nome').textContent = armazenamento.nome;

        // Atualizar bônus
        document.getElementById('companheiro-armazenamento-detalhes-bonus').textContent = `+${armazenamento.bonusEspaco.toFixed(2)}`;

        // Atualizar imagem
        if (armazenamento.imagemURL) {
            const img = document.getElementById('companheiro-armazenamento-detalhes-imagem');
            img.src = armazenamento.imagemURL;
            img.style.display = 'block';
            document.getElementById('companheiro-armazenamento-detalhes-imagem-placeholder').style.display = 'none';
        } else {
            document.getElementById('companheiro-armazenamento-detalhes-imagem').style.display = 'none';
            document.getElementById('companheiro-armazenamento-detalhes-imagem-placeholder').style.display = 'flex';
        }

        // Atualizar descrição
        if (armazenamento.descricao && armazenamento.descricao.trim()) {
            document.getElementById('companheiro-armazenamento-detalhes-descricao-secao').style.display = 'block';
            document.getElementById('companheiro-armazenamento-detalhes-descricao').textContent = armazenamento.descricao;
        } else {
            document.getElementById('companheiro-armazenamento-detalhes-descricao-secao').style.display = 'none';
        }

        // Abrir modal
        this.elementosDOM.modalDetalhesArmazenamento.classList.add('companheiro-modal--ativo');
        console.log('👁️ Detalhes do armazenamento abertos:', armazenamento.nome);
    }

    /**
     * Fecha modal de detalhes do armazenamento
     */
    fecharDetalhesArmazenamento() {
        if (!this.elementosDOM.modalDetalhesArmazenamento) return;
        
        this.elementosDOM.modalDetalhesArmazenamento.classList.remove('companheiro-modal--ativo');
    }

    /**
     * Limpar itens do inventário (para novo companheiro)
     */
    limparItens() {
        if (this.elementosDOM.listaItens) {
            this.elementosDOM.listaItens.innerHTML = '<div class="companheiro-empty-state">📭 Nenhum item no inventário</div>';
            console.log('   ✅ Itens do inventário limpos');
        }
    }

    /**
     * Limpar armazenamentos (para novo companheiro)
     */
    limparArmazenamentos() {
        if (this.elementosDOM.listaArmazenamentos) {
            this.elementosDOM.listaArmazenamentos.innerHTML = '<div class="companheiro-empty-state">🎁 Nenhum armazenamento</div>';
            console.log('   ✅ Armazenamentos limpos');
        }
    }

    /**
     * Normaliza texto para busca (remove acentos, minúsculas)
     */
    normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    /**
     * Escapa caracteres HTML
     */
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

/**
 * FUNÇÕES DE DEBUG E DIAGNÓSTICO
 */

// Função para testar se botões funcionam via clique direto
window.testarBotaoComparheiroItem = function() {
    console.log('🧪 Teste: Clicando botão "Adicionar Item" via JavaScript');
    const btn = document.getElementById('companheiro-btn-adicionar-item');
    console.log('Botão encontrado?', !!btn);
    if (btn) {
        btn.click();
        console.log('Click executado');
    } else {
        console.error('Botão não encontrado!');
    }
};

window.testarBotaoCompanheiroArmazenamento = function() {
    console.log('🧪 Teste: Clicando botão "Adicionar Armazenamento" via JavaScript');
    const btn = document.getElementById('companheiro-btn-adicionar-armazenamento');
    console.log('Botão encontrado?', !!btn);
    if (btn) {
        btn.click();
        console.log('Click executado');
    } else {
        console.error('Botão não encontrado!');
    }
};

// Função para diagnosticar status completo
window.diagnosticoCompanheiroInventario = function() {
    console.log('═══ DIAGNÓSTICO COMPANHEIRO INVENTÁRIO ═══');
    console.log('');
    
    console.log('1️⃣ UI OBJECT:');
    const ui = window.companheiroInventarioUI;
    console.log('   companheiroInventarioUI existe?', !!ui);
    console.log('   manager existe?', !!ui?.manager);
    console.log('');
    
    console.log('2️⃣ BOTÕES:');
    const btnItem = document.getElementById('companheiro-btn-adicionar-item');
    const btnArm = document.getElementById('companheiro-btn-adicionar-armazenamento');
    console.log('   Botão Item existe?', !!btnItem);
    console.log('   Botão Item visível?', btnItem ? btnItem.offsetParent !== null : 'N/A');
    console.log('   Botão Armazenamento existe?', !!btnArm);
    console.log('   Botão Armazenamento visível?', btnArm ? btnArm.offsetParent !== null : 'N/A');
    console.log('');
    
    console.log('3️⃣ MODAIS:');
    const modalItem = document.getElementById('companheiro-modal-item');
    const modalArm = document.getElementById('companheiro-modal-armazenamento');
    console.log('   Modal Item existe?', !!modalItem);
    console.log('   Modal Item ativo?', modalItem?.classList.contains('companheiro-modal--ativo'));
    console.log('   Modal Armazenamento existe?', !!modalArm);
    console.log('   Modal Armazenamento ativo?', modalArm?.classList.contains('companheiro-modal--ativo'));
    console.log('');
    
    console.log('4️⃣ ELEMENTOS DO DOM EM CACHE:');
    const elementosDOM = ui?.elementosDOM;
    console.log('   btnAdicionarItem em cache?', !!elementosDOM?.btnAdicionarItem);
    console.log('   btnAdicionarArmazenamento em cache?', !!elementosDOM?.btnAdicionarArmazenamento);
    console.log('   modalItem em cache?', !!elementosDOM?.modalItem);
    console.log('   modalArmazenamento em cache?', !!elementosDOM?.modalArmazenamento);
    console.log('');
    
    console.log('5️⃣ TESTE DE CLIQUE DIRETO:');
    console.log('   Execute: testarBotaoComparheiroItem()');
    console.log('   Execute: testarBotaoCompanheiroArmazenamento()');
    console.log('');
    
    console.log('═════════════════════════════════════════');
};

// Instância global
window.companheiroInventarioUI = new CompanheiroInventarioUI();
