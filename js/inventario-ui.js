/* ========================================== */
/* INVENTARIO-UI.JS                           */
/* Camada de Apresentação do Inventário       */
/* Sistema Moderno com Modal Dark Fantasy      */
/* ========================================== */

/**
 * InventarioUI
 * Responsável por:
 * - Renderização de interface visual
 * - Gerenciamento de modais
 * - Eventos de usuário
 * - Validação de espaço
 * - Renderização de cards
 * - Alternância de abas
 */

class InventarioUI {
    constructor() {
        this.inventarioManager = null;
        this.elementosDOM = {};
        this.itemEmEdicao = null;
        this.armazenamentoEmEdicao = null;
        this.abaAtivaAtual = 'habilidade';
        this.filtroQualidadeAtual = ''; // 🎨 Filtro de qualidade
        
        console.log('✅ InventarioUI inicializado');
    }

    /**
     * Inicializa a UI com referências
     */
    init(inventarioManager) {
        this.inventarioManager = inventarioManager;
        this.cacheElementos();
        this.setupListeners();
        this.render();
        
        // Escutar mudanças de atributos
        document.addEventListener('atributosAtualizados', async () => {
            console.log('📡 Atributos atualizados, re-renderizando inventário...');
            await this.render();
        });
        
        // Escutar mudanças de espaço no inventário
        document.addEventListener('inventarioEspacoAlterado', async () => {
            console.log('📡 Espaço do inventário alterado, re-renderizando...');
            await this.render();
        });
        
        console.log('✅ InventarioUI configurado');
    }

    /**
     * Cacheia referências aos elementos do DOM
     */
    cacheElementos() {
        this.elementosDOM = {
            // Container principal
            container: document.getElementById('rpg-content-inventario'),
            
            // Botões
            btnAdicionarItem: document.getElementById('btn-adicionar-item'),
            btnAdicionarArmazenamento: document.getElementById('btn-adicionar-armazenamento'),
            
            // Listas
            listaItens: document.getElementById('inventario-itens-list'),
            listaArmazenamentos: document.getElementById('inventario-armazenamentos-list'),
            
            // Filtros
            filtroItens: document.getElementById('inventario-filtro-itens'),
            filtroArmazenamentos: document.getElementById('inventario-filtro-armazenamentos'),
            filtroQualidade: document.getElementById('inventario-filtro-qualidade'),

            // NOVO: Modal de Item
            modalItem: document.getElementById('modal-inventario-item'),
            modalItemBackdrop: document.getElementById('modal-inventario-item')?.querySelector('.modal-overlay__backdrop'),
            
            // NOVO: Modal de Detalhes
            modalDetalhes: document.getElementById('modal-item-detalhes'),
            modalDetalhesBackdrop: document.getElementById('modal-item-detalhes')?.querySelector('.modal-overlay__backdrop'),
            
            // NOVO: Modal de Armazenamento
            modalArmazenamento: document.getElementById('modal-armazenamento'),
            modalArmazenamentoBackdrop: document.getElementById('modal-armazenamento')?.querySelector('.modal-overlay__backdrop'),
            
            // NOVO: Modal de Detalhes Armazenamento
            modalArmazenamentoDetalhes: document.getElementById('modal-armazenamento-detalhes'),
            modalArmazenamentoDetalhesBackdrop: document.getElementById('modal-armazenamento-detalhes')?.querySelector('.modal-overlay__backdrop'),
            
            // Campos do formulário - Item
            itemImagemURL: document.getElementById('item-imagem-url'),
            itemImagemUpload: document.getElementById('item-imagem-upload'),
            itemImagemPreview: document.getElementById('item-imagem-preview'),
            itemImagemTab: document.querySelectorAll('input[name="imagem-tipo"]'),
            itemNome: document.getElementById('item-nome'),
            itemQualidade: document.getElementById('item-qualidade'),
            itemTipo: document.getElementById('item-tipo'),
            itemNivel: document.getElementById('item-nivel'),
            itemRoll: document.getElementById('item-roll'),
            itemExtra: document.getElementById('item-extra'),
            itemQuantidade: document.getElementById('item-quantidade'),
            itemEspaco: document.getElementById('item-espaco'),
            itemHabilidade: document.getElementById('item-habilidade'),
            itemHistoria: document.getElementById('item-historia'),
            
            // Campos do formulário - Armazenamento
            armazenamentoImagemURL: document.getElementById('armazenamento-imagem-url'),
            armazenamentoImagemUpload: document.getElementById('armazenamento-imagem-upload'),
            armazenamentoImagemPreview: document.getElementById('armazenamento-imagem-preview'),
            armazenamentoImagemTab: document.querySelectorAll('input[name="armazenamento-imagem-tipo"]'),
            armazenamentoNome: document.getElementById('armazenamento-nome'),
            armazenamentoBonus: document.getElementById('armazenamento-bonus'),
            armazenamentoDescricao: document.getElementById('armazenamento-descricao'),
            
            // Displays
            itemEspacoTotal: document.getElementById('item-espaco-total-valor'),
            inventarioEspacoLivreModal: document.getElementById('inventario-espaco-livre-modal'),
            itemAvisoEspaco: document.getElementById('item-aviso-espaco'),
            
            // Botões do modal item
            btnItemSalvar: document.getElementById('btn-item-salvar'),
            btnItemCancelar: document.getElementById('btn-item-cancelar'),
            btnItemFechar: document.querySelector('#modal-inventario-item .modal-close-btn'),
            
            // Botões do modal detalhes item
            btnDetalhesFechar: document.getElementById('btn-detalhes-fechar'),
            btnDetalhesFecharRodape: document.getElementById('btn-detalhes-fechar-rodape'),
            
            // Botões do modal armazenamento
            btnArmazenamentoSalvar: document.getElementById('btn-armazenamento-salvar'),
            btnArmazenamentoCancelar: document.getElementById('btn-armazenamento-cancelar'),
            btnArmazenamentoFechar: document.querySelector('#modal-armazenamento .modal-close-btn'),
            
            // Botões do modal detalhes armazenamento
            btnArmazenamentoDetalhesFechar: document.getElementById('btn-armazenamento-detalhes-fechar'),
            btnArmazenamentoDetalhesFecharRodape: document.getElementById('btn-armazenamento-detalhes-fechar-rodape'),
            
            // Abas internas
            abaBotoes: document.querySelectorAll('.item-aba-btn'),
            abaConteudos: document.querySelectorAll('.item-aba-conteudo')
        };

        console.log('📍 Elementos DOM cacheados:', this.elementosDOM);
    }

    /**
     * Configura listeners de eventos
     */
    setupListeners() {
        // Botão adicionar item
        if (this.elementosDOM.btnAdicionarItem) {
            this.elementosDOM.btnAdicionarItem.addEventListener('click', () => {
                this.abrirModalItem();
            });
        }

        // Botão adicionar armazenamento
        if (this.elementosDOM.btnAdicionarArmazenamento) {
            this.elementosDOM.btnAdicionarArmazenamento.addEventListener('click', () => {
                this.abrirModalArmazenamento();
            });
        }

        // Filtros
        if (this.elementosDOM.filtroItens) {
            this.elementosDOM.filtroItens.addEventListener('input', (e) => this.filtrarItens(e.target.value));
        }

        if (this.elementosDOM.filtroArmazenamentos) {
            this.elementosDOM.filtroArmazenamentos.addEventListener('input', (e) => this.filtrarArmazenamentos(e.target.value));
        }

        if (this.elementosDOM.filtroQualidade) {
            this.elementosDOM.filtroQualidade.addEventListener('change', (e) => this.aplicarFiltrosItens());
        }

        // NOVO: Listeners do Modal de Item
        if (this.elementosDOM.btnItemSalvar) {
            this.elementosDOM.btnItemSalvar.addEventListener('click', () => this.salvarItem());
        }

        if (this.elementosDOM.btnItemCancelar) {
            this.elementosDOM.btnItemCancelar.addEventListener('click', () => this.fecharModalItem());
        }

        if (this.elementosDOM.btnItemFechar) {
            this.elementosDOM.btnItemFechar.addEventListener('click', () => this.fecharModalItem());
        }

        if (this.elementosDOM.modalItemBackdrop) {
            this.elementosDOM.modalItemBackdrop.addEventListener('click', () => this.fecharModalItem());
        }

        // NOVO: Listeners de Abas
        this.elementosDOM.abaBotoes.forEach(btn => {
            btn.addEventListener('click', () => this.alternarAbaInterna(btn.dataset.aba));
        });

        // NOVO: Listeners para upload de imagem
        this.elementosDOM.itemImagemTab.forEach(radio => {
            radio.addEventListener('change', (e) => this.alternarTipoImagem(e.target.value));
        });

        if (this.elementosDOM.itemImagemURL) {
            this.elementosDOM.itemImagemURL.addEventListener('change', () => this.atualizarPreviewImagem());
            this.elementosDOM.itemImagemURL.addEventListener('input', () => this.atualizarPreviewImagem());
        }

        if (this.elementosDOM.itemImagemUpload) {
            this.elementosDOM.itemImagemUpload.addEventListener('change', (e) => this.processarUploadImagem(e));
        }

        // NOVO: Listeners do modal detalhes
        if (this.elementosDOM.btnDetalhesFechar) {
            this.elementosDOM.btnDetalhesFechar.addEventListener('click', () => this.fecharModalDetalhes());
        }

        if (this.elementosDOM.btnDetalhesFecharRodape) {
            this.elementosDOM.btnDetalhesFecharRodape.addEventListener('click', () => this.fecharModalDetalhes());
        }

        if (this.elementosDOM.modalDetalhesBackdrop) {
            this.elementosDOM.modalDetalhesBackdrop.addEventListener('click', () => this.fecharModalDetalhes());
        }

        // NOVO: Listeners para recalcular espaço
        if (this.elementosDOM.itemQuantidade) {
            this.elementosDOM.itemQuantidade.addEventListener('change', () => this.recalcularEspacoTotal());
            this.elementosDOM.itemQuantidade.addEventListener('input', () => this.recalcularEspacoTotal());
        }

        if (this.elementosDOM.itemEspaco) {
            this.elementosDOM.itemEspaco.addEventListener('change', () => this.recalcularEspacoTotal());
            this.elementosDOM.itemEspaco.addEventListener('input', () => this.recalcularEspacoTotal());
        }

        // NOVO: Listeners do Modal de Armazenamento
        if (this.elementosDOM.btnArmazenamentoSalvar) {
            this.elementosDOM.btnArmazenamentoSalvar.addEventListener('click', () => this.salvarArmazenamento());
        }

        if (this.elementosDOM.btnArmazenamentoCancelar) {
            this.elementosDOM.btnArmazenamentoCancelar.addEventListener('click', () => this.fecharModalArmazenamento());
        }

        if (this.elementosDOM.btnArmazenamentoFechar) {
            this.elementosDOM.btnArmazenamentoFechar.addEventListener('click', () => this.fecharModalArmazenamento());
        }

        if (this.elementosDOM.modalArmazenamentoBackdrop) {
            this.elementosDOM.modalArmazenamentoBackdrop.addEventListener('click', () => this.fecharModalArmazenamento());
        }

        // NOVO: Listeners de upload de imagem do armazenamento
        this.elementosDOM.armazenamentoImagemTab.forEach(radio => {
            radio.addEventListener('change', (e) => this.alternarTipoImagemArmazenamento(e.target.value));
        });

        if (this.elementosDOM.armazenamentoImagemURL) {
            this.elementosDOM.armazenamentoImagemURL.addEventListener('change', () => this.atualizarPreviewImagemArmazenamento());
            this.elementosDOM.armazenamentoImagemURL.addEventListener('input', () => this.atualizarPreviewImagemArmazenamento());
        }

        if (this.elementosDOM.armazenamentoImagemUpload) {
            this.elementosDOM.armazenamentoImagemUpload.addEventListener('change', (e) => this.processarUploadImagemArmazenamento(e));
        }

        // NOVO: Listeners do modal detalhes armazenamento
        if (this.elementosDOM.btnArmazenamentoDetalhesFechar) {
            this.elementosDOM.btnArmazenamentoDetalhesFechar.addEventListener('click', () => this.fecharModalArmazenamentoDetalhes());
        }

        if (this.elementosDOM.btnArmazenamentoDetalhesFecharRodape) {
            this.elementosDOM.btnArmazenamentoDetalhesFecharRodape.addEventListener('click', () => this.fecharModalArmazenamentoDetalhes());
        }

        if (this.elementosDOM.modalArmazenamentoDetalhesBackdrop) {
            this.elementosDOM.modalArmazenamentoDetalhesBackdrop.addEventListener('click', () => this.fecharModalArmazenamentoDetalhes());
        }

        // ═══════════════════════════════════════════════════════════
        // 🔗 LISTENERS DA LOJA DE ITENS (Integração)
        // ═══════════════════════════════════════════════════════════
        
        // Quando um item é comprado na loja
        window.addEventListener('menuItensItemAdicionadoAoInventario', async (e) => {
            console.log('📦 [Inventário] Item adicionado pela loja:', e.detail.itemInventario.nome);
            console.log('   └─ Detalhes:', e.detail.itemInventario);
            // Re-renderizar a seção de itens após pequeno delay
            setTimeout(async () => this.renderizarItens(), 100);
        });

        // Quando um armazenamento é comprado na loja
        window.addEventListener('menuItensArmazenamentoAdicionado', (e) => {
            console.log('🗃️  [Inventário] Armazenamento adicionado pela loja:', e.detail.armazenamento.nome);
            console.log(`   └─ Bônus de espaço: +${e.detail.bonusEspaco}`);
            // Re-renderizar armazenamentos e atualizar espaço
            this.renderizarArmazenamentos();
            this.renderizarEspaco();
        });

        // Quando um item é vendido na loja
        window.addEventListener('menuItensItemRemovidoDoInventario', async (e) => {
            console.log('🗑️  [Inventário] ⏳ Evento de remoção recebido');
            console.log(`   Item: ${e.detail.itemInventario.nome}`);
            console.log(`   ID Loja: ${e.detail.itemLojaId}`);
            console.log(`   📊 Iniciando render em 100ms...`);
            // Re-renderizar a seção de itens após pequeno delay
            setTimeout(async () => {
                console.log('   🎨 Renderizando...');
                await this.render();
                console.log('   ✅ Render completo');
            }, 100);
        });

        console.log('🔗 Listeners configurados');
    }

    /**
     * Renderiza toda a interface
     */
    async render() {
        console.log('🎨 Renderizando inventário...');
        
        // 🎨 PRÉ-CARREGAR IMAGENS DO INDEXEDDB ANTES DE RENDERIZAR
        console.log('📸 Pré-carregando imagens do IndexedDB...');
        await this.preloadImagesFromIndexedDB();
        
        // Limpar filtros
        if (this.elementosDOM.filtroItens) {
            this.elementosDOM.filtroItens.value = '';
        }
        if (this.elementosDOM.filtroQualidade) {
            this.elementosDOM.filtroQualidade.value = '';
        }
        
        this.renderizarEspaco();
        this.renderizarItens();
        this.renderizarArmazenamentos();
        this.atualizarBotoes();
        
        console.log('✅ Inventário renderizado');
    }

    /**
     * Pré-carregar todas as imagens do IndexedDB antes de renderizar
     * Isso garante que as imagens apareçam nos cards
     */
    async preloadImagesFromIndexedDB() {
        if (typeof ImagemStorageManager === 'undefined') {
            console.warn('⚠️ ImagemStorageManager não disponível');
            return;
        }

        try {
            // Carregar imagens de itens
            const itens = this.inventarioManager.obterItens();
            for (const item of itens) {
                if (item._imagemId && !item.imagemURL) {
                    try {
                        const imagemBase64 = await ImagemStorageManager.carregarImagem(item._imagemId);
                        if (imagemBase64) {
                            item.imagemURL = imagemBase64;
                            console.log('✅ Imagem do item carregada:', item._imagemId);
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao carregar imagem do item:', item._imagemId, e.message);
                    }
                }
            }

            // Carregar imagens de armazenamentos
            const armazenamentos = this.inventarioManager.obterArmazenamentos();
            for (const arm of armazenamentos) {
                if (arm._imagemId && !arm.imagemURL) {
                    try {
                        const imagemBase64 = await ImagemStorageManager.carregarImagem(arm._imagemId);
                        if (imagemBase64) {
                            arm.imagemURL = imagemBase64;
                            console.log('✅ Imagem do armazenamento carregada:', arm._imagemId);
                        }
                    } catch (e) {
                        console.warn('⚠️ Erro ao carregar imagem do armazenamento:', arm._imagemId, e.message);
                    }
                }
            }

            console.log('✅ Pré-carregamento de imagens completo');
        } catch (error) {
            console.error('❌ Erro geral ao pré-carregar imagens:', error);
        }
    }

    /**
     * Renderiza informações de espaço
     */
    renderizarEspaco() {
        if (!this.inventarioManager) return;

        const resumo = this.inventarioManager.obterResumoEspaco();

        // Atualizar valores de espaço
        const espacoTotalEl = document.querySelector('#inventario-espaco-total');
        const espacoUsadoEl = document.querySelector('#inventario-espaco-usado');
        const espacoLivreEl = document.querySelector('#inventario-espaco-livre');
        const statusEl = document.querySelector('#inventario-status-espaco');

        if (espacoTotalEl) {
            espacoTotalEl.textContent = resumo.total.toFixed(2);
        }
        if (espacoUsadoEl) {
            espacoUsadoEl.textContent = resumo.usado.toFixed(2);
        }
        if (espacoLivreEl) {
            espacoLivreEl.textContent = resumo.livre.toFixed(2);
            espacoLivreEl.className = resumo.sobrecarga ? 'espaco-sobrecarga' : 'espaco-ok';
        }
        if (statusEl) {
            statusEl.textContent = resumo.sobrecarga ? '⚠️ SOBRECARGA' : '✅ OK';
            statusEl.className = resumo.sobrecarga ? 'status-sobrecarga' : 'status-ok';
        }

        // Atualizar barra visual
        this.atualizarBarraEspaco(resumo);
    }

    /**
     * Atualiza barra visual de espaço
     */
    atualizarBarraEspaco(resumo) {
        const barraEl = document.querySelector('#inventario-barra-espaco');
        if (!barraEl) return;

        const percentual = resumo.total > 0 
            ? (resumo.usado / resumo.total) * 100 
            : 0;

        barraEl.style.width = Math.min(100, percentual) + '%';
        barraEl.className = resumo.sobrecarga ? 'barra-sobrecarga' : 'barra-ok';
    }

    /**
     * Renderiza lista de itens como CARDS visuais
     */
    renderizarItens() {
        const listaEl = document.querySelector('#inventario-itens-list');
        if (!listaEl) return;

        const itens = this.inventarioManager.obterItens();

        // Limpar lista
        listaEl.innerHTML = '';

        if (itens.length === 0) {
            listaEl.innerHTML = '<div class="inventario-empty">📭 Nenhum item no inventário</div>';
            return;
        }

        // Renderizar cada item como CARD
        itens.forEach(item => {
            const cardEl = this.criarCardItem(item);
            listaEl.appendChild(cardEl);
        });

        console.log(`📋 ${itens.length} itens renderizados como cards`);
    }

    /**
     * Filtra itens por nome
     */
    filtrarItens(termoBusca) {
        const termo = termoBusca.toLowerCase().trim();
        const itens = this.inventarioManager.obterItens();
        const listaEl = this.elementosDOM.listaItens;

        // Se não há termo, renderiza tudo
        if (!termo) {
            this.renderizarItens();
            return;
        }

        // Filtra itens que contenham o termo no nome
        const itensFiltrados = itens.filter(item => 
            item.nome.toLowerCase().includes(termo)
        );

        // Renderiza filtrados ou mensagem
        listaEl.innerHTML = '';
        
        if (itensFiltrados.length === 0) {
            listaEl.innerHTML = '<div class="inventario-empty">🔍 Nenhum item encontrado</div>';
            return;
        }

        // Renderizar itens filtrados como CARDS
        itensFiltrados.forEach(item => {
            const cardEl = this.criarCardItem(item);
            listaEl.appendChild(cardEl);
        });
    }

    /**
     * Aplica filtros combinados (busca + qualidade)
     */
    aplicarFiltrosItens() {
        const termo = (this.elementosDOM.filtroItens?.value || '').toLowerCase().trim();
        const qualidade = this.elementosDOM.filtroQualidade?.value || '';
        const itens = this.inventarioManager.obterItens();
        const listaEl = this.elementosDOM.listaItens;

        // Filtra por ambos os critérios
        let itensFiltrados = itens;

        // Filtro por busca
        if (termo) {
            itensFiltrados = itensFiltrados.filter(item => 
                item.nome.toLowerCase().includes(termo)
            );
        }

        // Filtro por qualidade
        if (qualidade) {
            itensFiltrados = itensFiltrados.filter(item => 
                (item.qualidade || 'comum').toLowerCase() === qualidade.toLowerCase()
            );
        }

        // Renderiza filtrados ou mensagem
        listaEl.innerHTML = '';
        
        if (itensFiltrados.length === 0) {
            const mensagem = termo && qualidade 
                ? '🔍 Nenhum item encontrado com esses filtros'
                : termo 
                ? '🔍 Nenhum item encontrado'
                : `🔍 Nenhum item com qualidade ${this.formatarQualidade(qualidade)}`;
            
            listaEl.innerHTML = `<div class="inventario-empty">${mensagem}</div>`;
            return;
        }

        // Renderizar itens filtrados como CARDS
        itensFiltrados.forEach(item => {
            const cardEl = this.criarCardItem(item);
            listaEl.appendChild(cardEl);
        });

        console.log(`🎨 ${itensFiltrados.length} itens filtrados`);
    }

    /**
     * Filtra armazenamentos por nome
     */
    filtrarArmazenamentos(termoBusca) {
        const termo = termoBusca.toLowerCase().trim();
        const armazenamentos = this.inventarioManager.obterArmazenamentos();
        const listaEl = this.elementosDOM.listaArmazenamentos;

        // Se não há termo, renderiza tudo
        if (!termo) {
            this.renderizarArmazenamentos();
            return;
        }

        // Filtra armazenamentos que contenham o termo no nome
        const armazenagensFiltrados = armazenamentos.filter(arm => 
            arm.nome.toLowerCase().includes(termo)
        );

        // Renderiza filtrados ou mensagem
        listaEl.innerHTML = '';
        
        if (armazenagensFiltrados.length === 0) {
            listaEl.innerHTML = '<div class="inventario-empty">🔍 Nenhum armazenamento encontrado</div>';
            return;
        }

        // Renderizar armazenamentos filtrados como CARDS
        armazenagensFiltrados.forEach(arm => {
            const cardEl = this.criarElementoArmazenamento(arm);
            listaEl.appendChild(cardEl);
        });
    }

    /**
     * Cria CARD visual para um item
     */
    criarCardItem(item) {
        const card = document.createElement('div');
        card.className = `inventario-item-card qualidade-${item.qualidade || 'comum'} ${item.equipado ? 'equipado' : ''}`;
        card.dataset.itemId = item.id;

        const espacoTotal = (item.espaco * item.quantidade).toFixed(2);

        // Determinar emoji de tipo
        const emojiTipo = this.obterEmojiTipo(item.tipo);

        card.innerHTML = `
            <!-- Badge Equipado -->
            ${item.equipado ? '<div class="inventario-item-equipado-badge">⚔️ EQUIPADO</div>' : ''}

            <!-- Imagem -->
            <div class="inventario-item-imagem">
                ${item.imagemURL ? 
                    `<img src="${item.imagemURL}" alt="${item.nome}">` : 
                    `<div class="inventario-item-imagem-placeholder">${emojiTipo}</div>`}
            </div>

            <!-- Conteúdo -->
            <div class="inventario-item-conteudo">
                
                <!-- Nome e Qualidade -->
                <div class="inventario-item-header">
                    <h3 class="inventario-item-nome">${item.nome}</h3>
                    <span class="inventario-item-qualidade-badge badge-${item.qualidade || 'comum'}">
                        ${this.formatarQualidade(item.qualidade)}
                    </span>
                </div>

                <!-- Blocos de Informação -->
                <div class="inventario-item-blocos">
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Tipo</div>
                        <div class="inventario-item-bloco-valor">${item.tipo || '—'}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Nível</div>
                        <div class="inventario-item-bloco-valor">${item.nivel || 1}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Roll</div>
                        <div class="inventario-item-bloco-valor">${item.roll || '—'}</div>
                    </div>
                    <div class="inventario-item-bloco">
                        <div class="inventario-item-bloco-label">Extra</div>
                        <div class="inventario-item-bloco-valor">${item.extra || '—'}</div>
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
                        <button class="inventario-item-btn" title="Editar">✏️ Editar</button>
                        <button class="inventario-item-btn" title="Ver detalhes">👁️ Ver</button>
                        <button class="inventario-item-btn inventario-item-btn-equipar" title="Equipar/Desequipar">
                            ${item.equipado ? '🗝️ Desequipar' : '⚔️ Equipar'}
                        </button>
                        <button class="inventario-item-btn inventario-item-btn-deletar" title="Remover">🗑️ Deletar</button>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners dos botões
        const btns = card.querySelectorAll('.inventario-item-btn');
        btns[0].addEventListener('click', () => this.abrirModalItem(item.id));
        btns[1].addEventListener('click', () => this.verDetalhesItem(item.id));
        btns[2].addEventListener('click', () => this.alternarEquipado(item.id));
        btns[3].addEventListener('click', () => this.confirmarRemoverItem(item.id));

        return card;
    }

    /**
     * Renderiza lista de armazenamentos
     */
    renderizarArmazenamentos() {
        const listaEl = document.querySelector('#inventario-armazenamentos-list');
        if (!listaEl) return;

        const armazenamentos = this.inventarioManager.obterArmazenamentos();

        // Limpar lista
        listaEl.innerHTML = '';

        if (armazenamentos.length === 0) {
            listaEl.innerHTML = '<div class="inventario-empty">📭 Nenhum armazenamento</div>';
            return;
        }

        // Renderizar cada armazenamento
        armazenamentos.forEach(arm => {
            const armEl = this.criarElementoArmazenamento(arm);
            listaEl.appendChild(armEl);
        });

        console.log(`📦 ${armazenamentos.length} armazenamentos renderizados`);
    }

    /**
     * Cria elemento DOM para um armazenamento
     */
    criarElementoArmazenamento(armazenamento) {
        const div = document.createElement('div');
        div.className = 'inventario-armazenamento-row';
        div.dataset.armazenamentoId = armazenamento.id;

        // Construir HTML do card
        div.innerHTML = `
            <!-- Imagem -->
            <div class="armazenamento-imagem-container">
                ${armazenamento.imagemURL 
                    ? `<img src="${armazenamento.imagemURL}" alt="${armazenamento.nome}" onerror="this.style.display='none'">` 
                    : ''}
                <div class="armazenamento-imagem-placeholder" ${armazenamento.imagemURL ? 'style="display:none"' : ''}>🗃️</div>
            </div>
            
            <!-- Header com Nome e Bônus -->
            <div class="armazenamento-header">
                <div class="armazenamento-name">
                    ${armazenamento.nome}
                </div>
                <div class="armazenamento-bonus">
                    +${armazenamento.bonusEspaco} espaço
                </div>
            </div>
            
            <!-- Botões -->
            <div class="armazenamento-actions">
                <button class="btn-ver" title="Ver detalhes">👁️ Ver</button>
                <button class="btn-editar" title="Editar armazenamento">✏️ Editar</button>
                <button class="btn-remover" title="Remover armazenamento">🗑️ Remover</button>
            </div>
        `;

        const btnVer = div.querySelector('.btn-ver');
        const btnEditar = div.querySelector('.btn-editar');
        const btnRemover = div.querySelector('.btn-remover');

        btnVer.addEventListener('click', () => {
            this.verDetalhesArmazenamento(armazenamento.id);
        });

        btnEditar.addEventListener('click', () => {
            this.abrirModalArmazenamento(armazenamento.id);
        });

        btnRemover.addEventListener('click', () => {
            this.confirmarRemoverArmazenamento(armazenamento.id);
        });

        return div;
    }

    /**
     * Atualiza botão adicionar item conforme espaço
     */
    atualizarBotoes() {
        const btnAdicionarItem = document.getElementById('btn-adicionar-item');
        if (!btnAdicionarItem) return;

        const resumo = this.inventarioManager.obterResumoEspaco();
        
        if (resumo.sobrecarga) {
            btnAdicionarItem.disabled = true;
            btnAdicionarItem.title = '❌ Inventário cheio';
            btnAdicionarItem.classList.add('btn-disabled');
        } else {
            btnAdicionarItem.disabled = false;
            btnAdicionarItem.title = '✅ Adicionar novo item';
            btnAdicionarItem.classList.remove('btn-disabled');
        }
    }

    /**
     * Abre modal para adicionar/editar item (NOVO - Moderno)
     */
    abrirModalItem(itemId = null) {
        this.itemEmEdicao = itemId ? this.inventarioManager.obterItem(itemId) : null;

        // Determinar se é novo ou edição
        const ehNovoItem = !this.itemEmEdicao;
        const titulo = ehNovoItem ? 'Criar Item' : 'Editar Item';
        
        // Preencher campos
        this.elementosDOM.itemNome.value = this.itemEmEdicao?.nome || '';
        this.elementosDOM.itemImagemURL.value = this.itemEmEdicao?.imagemURL || '';
        this.elementosDOM.itemQualidade.value = this.itemEmEdicao?.qualidade || '';
        this.elementosDOM.itemTipo.value = this.itemEmEdicao?.tipo || '';
        this.elementosDOM.itemNivel.value = this.itemEmEdicao?.nivel || 1;
        this.elementosDOM.itemRoll.value = this.itemEmEdicao?.roll || '';
        this.elementosDOM.itemExtra.value = this.itemEmEdicao?.extra || '';
        this.elementosDOM.itemQuantidade.value = this.itemEmEdicao?.quantidade || 1;
        this.elementosDOM.itemEspaco.value = this.itemEmEdicao?.espaco || 1.0;
        this.elementosDOM.itemHabilidade.value = this.itemEmEdicao?.habilidade || '';
        this.elementosDOM.itemHistoria.value = this.itemEmEdicao?.historia || '';

        // Atualizar título modal
        const modalTitle = this.elementosDOM.modalItem.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = titulo;
        }

        // Resetar aba ativa
        this.alternarAbaInterna('habilidade');

        // Recalcular espaço
        this.recalcularEspacoTotal();

        // Mostrar modal
        this.abrirModal();

        console.log(ehNovoItem ? '🆕 Abrindo modal para novo item' : '✏️ Abrindo modal para editar item');
    }

    /**
     * Abre modal para adicionar/editar armazenamento (NOVO - Moderno)
     */
    abrirModalArmazenamento(armazenamentoId = null) {
        this.armazenamentoEmEdicao = armazenamentoId 
            ? this.inventarioManager.obterArmazenamento(armazenamentoId) 
            : null;

        // Determinar se é novo ou edição
        const ehNovoArmazenamento = !this.armazenamentoEmEdicao;
        const titulo = ehNovoArmazenamento ? 'Criar Armazenamento' : 'Editar Armazenamento';
        
        // Preencher campos
        this.elementosDOM.armazenamentoNome.value = this.armazenamentoEmEdicao?.nome || '';
        this.elementosDOM.armazenamentoImagemURL.value = this.armazenamentoEmEdicao?.imagemURL || '';
        this.elementosDOM.armazenamentoBonus.value = this.armazenamentoEmEdicao?.bonusEspaco || 0;
        this.elementosDOM.armazenamentoDescricao.value = this.armazenamentoEmEdicao?.descricao || '';

        // Atualizar título modal
        const modalTitle = this.elementosDOM.modalArmazenamento.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = titulo;
        }

        // Atualizar preview de imagem
        this.atualizarPreviewImagemArmazenamento();

        // Mostrar modal
        this.abrirModalArmazenamentoModerno();

        console.log(ehNovoArmazenamento ? '🆕 Abrindo modal para novo armazenamento' : '✏️ Abrindo modal para editar armazenamento');
    }

    /**
     * Abre o modal de armazenamento com animação
     */
    abrirModalArmazenamentoModerno() {
        if (this.elementosDOM.modalArmazenamento) {
            this.elementosDOM.modalArmazenamento.classList.add('active');
            console.log('🗃️ Modal de armazenamento aberto');
        }
    }

    /**
     * Fecha o modal de armazenamento com animação
     */
    fecharModalArmazenamento() {
        if (this.elementosDOM.modalArmazenamento) {
            this.elementosDOM.modalArmazenamento.classList.remove('active');
            this.armazenamentoEmEdicao = null;
            console.log('🗃️ Modal de armazenamento fechado');
        }
    }

    /**
     * Alterna tipo de imagem do armazenamento (URL vs Upload)
     */
    alternarTipoImagemArmazenamento(tipo) {
        const inputURL = this.elementosDOM.armazenamentoImagemURL;
        const inputUpload = this.elementosDOM.armazenamentoImagemUpload;

        if (tipo === 'url') {
            inputURL.style.display = 'block';
            inputUpload.style.display = 'none';
            console.log('🔗 Alternar para URL');
        } else {
            inputURL.style.display = 'none';
            inputUpload.style.display = 'block';
            console.log('📤 Alternar para Upload');
        }
    }

    /**
     * Processa upload de imagem do armazenamento
     */
    processarUploadImagemArmazenamento(evento) {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

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
            this.elementosDOM.armazenamentoImagemURL.value = e.target.result;
            this.atualizarPreviewImagemArmazenamento();
        };
        reader.readAsDataURL(arquivo);

        console.log('✅ Imagem do armazenamento carregada');
    }

    /**
     * Atualiza preview de imagem do armazenamento
     */
    atualizarPreviewImagemArmazenamento() {
        const url = this.elementosDOM.armazenamentoImagemURL.value;
        this.mostrarPreviewImagemArmazenamento(url);
    }

    /**
     * Mostra preview da imagem do armazenamento
     */
    mostrarPreviewImagemArmazenamento(url) {
        const preview = this.elementosDOM.armazenamentoImagemPreview;
        const placeholder = preview.querySelector('.form-imagem-placeholder');

        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.onerror = () => {
                placeholder.style.display = 'flex';
                console.warn('⚠️ Erro ao carregar imagem');
            };
            img.onload = () => {
                placeholder.style.display = 'none';
            };
            preview.innerHTML = '';
            preview.appendChild(img);
        } else {
            preview.innerHTML = '<div class="form-imagem-placeholder">🗃️</div>';
        }
    }

    /**
     * Salva armazenamento (novo ou edição)
     */
    async salvarArmazenamento() {
        const nome = this.elementosDOM.armazenamentoNome.value.trim();
        const bonus = Math.max(0, parseFloat(this.elementosDOM.armazenamentoBonus.value) || 0);
        const descricao = this.elementosDOM.armazenamentoDescricao.value.trim();
        let imagemURL = this.elementosDOM.armazenamentoImagemURL.value.trim();

        // Validar
        if (!nome) {
            alert('❌ Nome do armazenamento é obrigatório');
            return;
        }

        // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
        if (imagemURL && imagemURL.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('📦 Comprimindo imagem do armazenamento...');
            imagemURL = await ImageCompressor.compressImage(imagemURL, 'art');
        }

        const dados = {
            nome,
            bonusEspaco: bonus,
            descricao,
            imagemURL
        };

        if (this.armazenamentoEmEdicao) {
            // Editar existente
            this.inventarioManager.atualizarArmazenamento(this.armazenamentoEmEdicao.id, dados);
            console.log('✏️ Armazenamento atualizado');
        } else {
            // Criar novo
            this.inventarioManager.adicionarArmazenamento(dados);
            console.log('🆕 Novo armazenamento criado');
        }

        this.renderizarEspaco();
        this.renderizarArmazenamentos();
        this.fecharModalArmazenamento();
    }

    /**
     * Abre modal de detalhes do armazenamento
     */
    abrirModalDetalhesArmazenamento() {
        if (this.elementosDOM.modalArmazenamentoDetalhes) {
            this.elementosDOM.modalArmazenamentoDetalhes.classList.add('active');
            console.log('🗃️ Modal de detalhes do armazenamento aberto');
        }
    }

    /**
     * Fecha modal de detalhes do armazenamento
     */
    fecharModalArmazenamentoDetalhes() {
        if (this.elementosDOM.modalArmazenamentoDetalhes) {
            this.elementosDOM.modalArmazenamentoDetalhes.classList.remove('active');
            console.log('🗃️ Modal de detalhes do armazenamento fechado');
        }
    }

    /**
     * Ver detalhes do armazenamento (Popup)
     */
    verDetalhesArmazenamento(armazenamentoId) {
        const armazenamento = this.inventarioManager.obterArmazenamento(armazenamentoId);
        if (!armazenamento) {
            console.error('❌ Armazenamento não encontrado');
            return;
        }

        // Preencher dados
        document.getElementById('armazenamento-detalhes-titulo').textContent = `🗃️ ${armazenamento.nome}`;
        document.getElementById('armazenamento-detalhes-nome').textContent = armazenamento.nome;
        document.getElementById('armazenamento-detalhes-bonus').textContent = `+${armazenamento.bonusEspaco}`;

        // Imagem
        const imagemContainer = document.getElementById('armazenamento-detalhes-imagem-container');
        const imagemEl = document.getElementById('armazenamento-detalhes-imagem');
        const placeholderEl = document.getElementById('armazenamento-detalhes-imagem-placeholder');

        if (armazenamento.imagemURL) {
            imagemEl.src = armazenamento.imagemURL;
            imagemEl.style.display = 'block';
            placeholderEl.style.display = 'none';
        } else {
            imagemEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
        }

        // Descrição
        const descricaoSecao = document.getElementById('armazenamento-detalhes-descricao-secao');
        const descricaoEl = document.getElementById('armazenamento-detalhes-descricao');

        if (armazenamento.descricao) {
            descricaoEl.textContent = armazenamento.descricao;
            descricaoSecao.style.display = 'block';
        } else {
            descricaoSecao.style.display = 'none';
        }

        // Abrir modal
        this.abrirModalDetalhesArmazenamento();

        console.log('👁️ Visualizando detalhes do armazenamento:', armazenamento.nome);
    }

    /**
     * Abre o modal com animação
     */
    abrirModal() {
        if (this.elementosDOM.modalItem) {
            this.elementosDOM.modalItem.classList.add('active');
            console.log('📂 Modal aberto');
        }
    }

    /**
     * Fecha o modal com animação
     */
    fecharModalItem() {
        if (this.elementosDOM.modalItem) {
            this.elementosDOM.modalItem.classList.remove('active');
            this.itemEmEdicao = null;
            console.log('📂 Modal fechado');
        }
    }

    /**
     * Alterna entre abas internas (Habilidade / História)
     */
    alternarAbaInterna(abaName) {
        // Remover classe ativa de todos os botões
        this.elementosDOM.abaBotoes.forEach(btn => {
            btn.classList.remove('item-aba-btn--ativo');
        });

        // Remover visibilidade de todos os conteúdos
        this.elementosDOM.abaConteudos.forEach(conteudo => {
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

        this.abaAtivaAtual = abaName;
        console.log(`📑 Aba alterada para: ${abaName}`);
    }

    /**
     * Alterna tipo de imagem (URL vs Upload)
     */
    alternarTipoImagem(tipo) {
        const urlInput = document.getElementById('item-imagem-url');
        const uploadInput = document.getElementById('item-imagem-upload');

        if (tipo === 'url') {
            urlInput.style.display = 'block';
            uploadInput.style.display = 'none';
            console.log('🖼️ Modo URL ativado');
        } else if (tipo === 'upload') {
            urlInput.style.display = 'none';
            uploadInput.style.display = 'block';
            console.log('📁 Modo Upload ativado');
        }

        this.atualizarPreviewImagem();
    }

    /**
     * Processa upload de imagem
     */
    processarUploadImagem(evento) {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        // Validar tipo
        if (!arquivo.type.startsWith('image/')) {
            alert('❌ Por favor, selecione uma imagem válida');
            return;
        }

        // Validar tamanho (máx 5MB)
        if (arquivo.size > 5 * 1024 * 1024) {
            alert('❌ Arquivo muito grande (máx 5MB)');
            return;
        }

        // Ler arquivo como data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.elementosDOM.itemImagemURL.value = dataUrl;
            this.atualizarPreviewImagem();
            console.log('✅ Imagem carregada do upload');
        };
        reader.readAsDataURL(arquivo);
    }

    /**
     * Atualiza preview da imagem
     */
    atualizarPreviewImagem() {
        const urlInput = document.getElementById('item-imagem-url');
        const uploadInput = document.getElementById('item-imagem-upload');
        const tipoSelecionado = document.querySelector('input[name="imagem-tipo"]:checked')?.value;

        let imagemURL = '';

        if (tipoSelecionado === 'url') {
            imagemURL = urlInput.value;
        } else if (tipoSelecionado === 'upload' && uploadInput.files.length > 0) {
            const file = uploadInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                imagemURL = e.target.result;
                this.mostrarPreviewImagem(imagemURL);
            };
            reader.readAsDataURL(file);
            return;
        }

        this.mostrarPreviewImagem(imagemURL);
    }

    /**
     * Mostra preview da imagem
     */
    mostrarPreviewImagem(url) {
        const preview = this.elementosDOM.itemImagemPreview;
        const placeholder = preview.querySelector('.form-imagem-placeholder');

        if (url && url.trim()) {
            placeholder.style.display = 'none';
            let img = preview.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                preview.appendChild(img);
            }
            img.src = url;
            img.style.display = 'block';
        } else {
            placeholder.style.display = 'block';
            const img = preview.querySelector('img');
            if (img) {
                img.style.display = 'none';
            }
        }
    }

    /**
     * Abre modal de detalhes do item
     */
    abrirModalDetalhes() {
        if (this.elementosDOM.modalDetalhes) {
            this.elementosDOM.modalDetalhes.classList.add('active');
            console.log('👁️ Modal de detalhes aberto');
        }
    }

    /**
     * Fecha modal de detalhes
     */
    fecharModalDetalhes() {
        if (this.elementosDOM.modalDetalhes) {
            this.elementosDOM.modalDetalhes.classList.remove('active');
            console.log('👁️ Modal de detalhes fechado');
        }
    }

    /**
     * Exibe detalhes do item em popup moderno
     */
    verDetalhesItem(itemId) {
        const item = this.inventarioManager.obterItem(itemId);
        if (!item) return;

        // Preencher campos
        document.getElementById('detalhes-titulo').textContent = item.nome;
        document.getElementById('detalhes-nome').textContent = item.nome;
        
        // Qualidade com classe de cor
        const qualidadeEl = document.getElementById('detalhes-qualidade');
        qualidadeEl.textContent = this.formatarQualidade(item.qualidade);
        qualidadeEl.className = 'detalhes-qualidade quality-' + (item.qualidade || 'comum').toLowerCase();
        
        document.getElementById('detalhes-tipo').textContent = item.tipo || '—';
        document.getElementById('detalhes-nivel').textContent = item.nivel || 1;
        document.getElementById('detalhes-roll').textContent = item.roll || '—';
        document.getElementById('detalhes-extra').textContent = item.extra || '—';
        document.getElementById('detalhes-quantidade').textContent = item.quantidade;
        document.getElementById('detalhes-espaco-unitario').textContent = item.espaco.toFixed(2);
        document.getElementById('detalhes-espaco-total').textContent = (item.espaco * item.quantidade).toFixed(2);
        document.getElementById('detalhes-status').textContent = item.equipado ? '⚔️ EQUIPADO' : '📦 No Inventário';

        // Imagem
        const imagemEl = document.getElementById('detalhes-imagem');
        const placeholderEl = document.getElementById('detalhes-imagem-placeholder');

        console.log(`🖼️ Item: ${item.nome}`);
        console.log(`   imagemURL: '${item.imagemURL}'`);
        console.log(`   Tipo: ${item.tipo}`);
        console.log(`   imagemEl: ${imagemEl?.id}`);
        console.log(`   placeholderEl: ${placeholderEl?.id}`);

        if (item.imagemURL && item.imagemURL.trim() && item.imagemURL.length > 0) {
            console.log(`✅ Exibindo imagem: ${item.imagemURL}`);
            placeholderEl.style.display = 'none';
            imagemEl.src = item.imagemURL;
            imagemEl.style.display = 'block';
            imagemEl.onload = () => console.log('✅ Imagem carregada com sucesso');
            imagemEl.onerror = (e) => {
                console.error('❌ Erro ao carregar imagem:', e);
                console.log('🔄 Revertendo para placeholder...');
                placeholderEl.style.display = 'flex';
                imagemEl.style.display = 'none';
            };
        } else {
            console.log(`❌ Sem imagem, exibindo placeholder`);
            imagemEl.style.display = 'none';
            const emojiTipo = this.obterEmojiTipo(item.tipo);
            console.log(`   Emoji do tipo '${item.tipo}': ${emojiTipo}`);
            placeholderEl.textContent = emojiTipo;
            placeholderEl.style.display = 'flex';
        }

        // Habilidade
        const secaoHabilidade = document.getElementById('detalhes-habilidade-secao');
        if (item.habilidade && item.habilidade.trim()) {
            secaoHabilidade.style.display = 'block';
            document.getElementById('detalhes-habilidade').textContent = item.habilidade;
        } else {
            secaoHabilidade.style.display = 'none';
        }

        // História
        const secaoHistoria = document.getElementById('detalhes-historia-secao');
        if (item.historia && item.historia.trim()) {
            secaoHistoria.style.display = 'block';
            document.getElementById('detalhes-historia').textContent = item.historia;
        } else {
            secaoHistoria.style.display = 'none';
        }

        // Abrir modal
        this.abrirModalDetalhes();
        console.log(`👁️ Detalhes visualizados: ${item.nome}`);
    }

    /**
     * Recalcula espaço total do item
     */
    recalcularEspacoTotal() {
        const qtd = parseFloat(this.elementosDOM.itemQuantidade.value) || 1;
        const espaco = parseFloat(this.elementosDOM.itemEspaco.value) || 1;
        const espacoTotal = (qtd * espaco).toFixed(2);

        if (this.elementosDOM.itemEspacoTotal) {
            this.elementosDOM.itemEspacoTotal.textContent = espacoTotal;
        }

        // Atualizar espaço livre disponível
        this.atualizarEspacoLivreNoModal();

        // Validar espaço disponível
        this.validarEspacoItem(parseFloat(espacoTotal));

        console.log(`📏 Espaço recalculado: ${espacoTotal}`);
    }

    /**
     * Atualiza exibição de espaço livre no modal
     */
    atualizarEspacoLivreNoModal() {
        const resumo = this.inventarioManager.obterResumoEspaco();
        let espacoLivre = resumo.livre;

        // Se estamos editando, adicionar de volta o espaço do item original
        if (this.itemEmEdicao) {
            const espacoAnterior = this.itemEmEdicao.espaco * this.itemEmEdicao.quantidade;
            espacoLivre += espacoAnterior;
        }

        if (this.elementosDOM.inventarioEspacoLivreModal) {
            this.elementosDOM.inventarioEspacoLivreModal.textContent = espacoLivre.toFixed(2);
        }
    }

    /**
     * Valida se há espaço disponível para o item
     */
    validarEspacoItem(espacoTotal) {
        const resumo = this.inventarioManager.obterResumoEspaco();
        let espacoLivre = resumo.livre;

        // Se estamos editando, considerar o espaço anterior
        if (this.itemEmEdicao) {
            const espacoAnterior = this.itemEmEdicao.espaco * this.itemEmEdicao.quantidade;
            espacoLivre += espacoAnterior;
        }

        const temEspaco = espacoTotal <= espacoLivre;

        // Mostrar/Ocultar aviso
        if (this.elementosDOM.itemAvisoEspaco) {
            this.elementosDOM.itemAvisoEspaco.style.display = temEspaco ? 'none' : 'flex';
        }

        // Desabilitar botão salvar se não tiver espaço
        if (this.elementosDOM.btnItemSalvar) {
            this.elementosDOM.btnItemSalvar.disabled = !temEspaco;
            this.elementosDOM.btnItemSalvar.classList.toggle('btn-disabled', !temEspaco);
        }

        console.log(`📦 Validação de espaço: ${temEspaco ? '✅ OK' : '❌ INSUFICIENTE'}`);
        return temEspaco;
    }

    /**
     * Retorna emoji baseado no tipo de item
     */
    obterEmojiTipo(tipo) {
        const mapa = {
            'arma': '⚔️',
            'armadura': '🛡️',
            'escudo': '🛡️',
            'poção': '🧪',
            'consumível': '🧪',
            'livro': '📖',
            'grimório': '📖',
            'ouro': '🪙',
            'joia': '💎',
            'mapa': '🗺️',
            'chave': '🔑',
            'amuleto': '✨'
        };

        const tipoLower = tipo?.toLowerCase() || '';
        return mapa[tipoLower] || '📦';
    }

    /**
     * Formata nome da qualidade
     */
    formatarQualidade(qualidade) {
        const mapa = {
            'comum': 'Comum',
            'raro': 'Raro',
            'epico': 'Épico',
            'mitico': 'Mítico',
            'lendario': 'Lendário',
            'celestial': 'Celestial'
        };

        return mapa[qualidade?.toLowerCase()] || 'Comum';
    }


    /**
     * Alterna equipado/desequipado
     */
    alternarEquipado(itemId) {
        const item = this.inventarioManager.obterItem(itemId);
        if (!item) return;

        const novoEstado = !item.equipado;
        const sucesso = this.inventarioManager.atualizarItem(itemId, { equipado: novoEstado });

        if (sucesso) {
            console.log(`⚔️ Item ${novoEstado ? 'equipado' : 'desequipado'}`);
            this.render();
        }
    }

    /**
     * Salva um item (novo ou atualizado)
     */
    async salvarItem() {
        // Validar campos obrigatórios
        const nome = this.elementosDOM.itemNome.value.trim();
        const qualidade = this.elementosDOM.itemQualidade.value;
        const tipo = this.elementosDOM.itemTipo.value.trim();
        const quantidade = parseInt(this.elementosDOM.itemQuantidade.value) || 0;
        const espaco = parseFloat(this.elementosDOM.itemEspaco.value) || 0;

        // Validações
        if (!nome) {
            alert('❌ Nome do item é obrigatório!');
            return;
        }

        if (!qualidade) {
            alert('❌ Qualidade é obrigatória!');
            return;
        }

        if (!tipo) {
            alert('❌ Tipo é obrigatório!');
            return;
        }

        if (quantidade < 1) {
            alert('❌ Quantidade deve ser no mínimo 1!');
            return;
        }

        if (espaco < 0.1) {
            alert('❌ Espaço deve ser no mínimo 0.1!');
            return;
        }

        // Validar espaço disponível (se não for equipado)
        const temEspaco = this.validarEspacoItem(quantidade * espaco);
        if (!temEspaco) {
            alert('❌ Espaço insuficiente no inventário!');
            return;
        }

        // Coletar imagem
        let imagemURL = this.elementosDOM.itemImagemURL.value.trim() || '';

        // 🔥 COMPRIMIR IMAGEM ANTES DE SALVAR
        if (imagemURL && imagemURL.startsWith('data:') && typeof ImageCompressor !== 'undefined') {
            console.log('📦 Comprimindo imagem do item...');
            imagemURL = await ImageCompressor.compressImage(imagemURL, 'art');
        }

        // Coletar dados do formulário
        const dados = {
            imagemURL: imagemURL,
            nome: nome,
            qualidade: qualidade.toLowerCase(),
            tipo: tipo,
            nivel: parseInt(this.elementosDOM.itemNivel.value) || 1,
            roll: this.elementosDOM.itemRoll.value.trim() || '',
            extra: this.elementosDOM.itemExtra.value.trim() || '',
            quantidade: quantidade,
            espaco: espaco,
            habilidade: this.elementosDOM.itemHabilidade.value.trim() || '',
            historia: this.elementosDOM.itemHistoria.value.trim() || '',
            equipado: this.itemEmEdicao?.equipado || false // Manter status se editar
        };

        // Salvar
        if (this.itemEmEdicao) {
            // Editar existente
            const sucesso = this.inventarioManager.atualizarItem(this.itemEmEdicao.id, dados);
            if (sucesso) {
                console.log('✅ Item atualizado com sucesso!');
            } else {
                alert('❌ Erro ao atualizar item');
                return;
            }
        } else {
            // Adicionar novo
            const sucesso = this.inventarioManager.adicionarItem(dados);
            if (sucesso) {
                console.log('✅ Item criado com sucesso!');
            } else {
                alert('❌ Erro ao criar item');
                return;
            }
        }

        // Fechar modal e re-renderizar
        this.fecharModalItem();
        await this.render();
    }

    /**
     * Confirma e remove um item
     */
    async confirmarRemoverItem(itemId) {
        const item = this.inventarioManager.obterItem(itemId);
        
        // Validar se item existe
        if (!item) {
            console.warn('⚠️ Item não encontrado');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover "${item.nome}"?`)) {
            const sucesso = this.inventarioManager.removerItem(itemId);
            if (sucesso) {
                console.log('✅ Item removido');
                await this.render();
            }
        }
    }

    /**
     * Confirma e remove um armazenamento
     */
    async confirmarRemoverArmazenamento(armazenamentoId) {
        const arm = this.inventarioManager.obterArmazenamento(armazenamentoId);
        
        // Validar se armazenamento existe
        if (!arm) {
            console.warn('⚠️ Armazenamento não encontrado');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover "${arm.nome}"?`)) {
            const sucesso = this.inventarioManager.removerArmazenamento(armazenamentoId);
            if (sucesso) {
                console.log('✅ Armazenamento removido');
                await this.render();
            }
        }
    }
}

// Criar instância global
window.inventarioUI = new InventarioUI();

console.log('✅ inventario-ui.js carregado');
