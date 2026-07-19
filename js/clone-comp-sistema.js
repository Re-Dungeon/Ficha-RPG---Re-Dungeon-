/* ============================================================= */
/* CLONE-COMP-SISTEMA.JS - Sistema de Clonagem de Companheiros   */
/* ============================================================= */

/**
 * CloneCompSistema
 * Sistema completo de clonagem de companheiros com filtros e seleção
 */
class CloneCompSistema {
    constructor() {
        this.modal = null;
        this.btnAbrir = null;
        this.btnFechar = null;
        this.btnConfirmar = null;
        this.searchInput = null;
        this.filterType = null;
        this.listContainer = null;
        
        this.companheirosSelecionados = [];
        this.todasCompanheiros = [];
        this.companheirosFiltrados = [];
        this.idSelecionado = null;
        
        // ✅ NOVO: Debounce para evitar piscar durante digitação
        this.debounceTimeout = null;
        this.debounceDelay = 300; // 300ms de delay
        
        this.inicializar();
    }

    /**
     * Inicializar o sistema
     */
    inicializar() {
        console.log('🔄 Inicializando CloneCompSistema...');
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarElementos());
        } else {
            this.configurarElementos();
        }
    }

    /**
     * Configurar referências aos elementos do DOM
     */
    configurarElementos() {
        console.log('🎨 Configurando elementos do DOM...');
        
        // Modal
        this.modal = document.getElementById('clone-comp-modal');
        if (!this.modal) {
            console.error('❌ Modal clone-comp-modal não encontrada!');
            return;
        }
        
        // Botão abrir
        this.btnAbrir = document.getElementById('clone-comp-btn');
        if (!this.btnAbrir) {
            console.error('❌ Botão clone-comp-btn não encontrado!');
            return;
        }
        
        // Botão fechar (X no header)
        this.btnFechar = this.modal.querySelector('.clone-comp-btn-fechar');
        
        // Botão confirmar (Clonar)
        this.btnConfirmar = document.getElementById('clone-comp-confirm');
        
        // Inputs de filtro
        this.searchInput = document.getElementById('clone-comp-search');
        this.filterType = document.getElementById('clone-comp-filter-type');
        
        // Container da lista
        this.listContainer = document.getElementById('clone-comp-list');
        
        // Botão cancelar
        const btnCancelar = this.modal.querySelector('.clone-comp-btn-cancelar');
        
        // Configurar eventos
        this.btnAbrir.addEventListener('click', (e) => {
            console.log('🔄 Botão clonar clicado!');
            e.preventDefault();
            this.abrir();
        });
        this.btnFechar?.addEventListener('click', () => this.fechar());
        btnCancelar?.addEventListener('click', () => this.fechar());
        this.btnConfirmar.addEventListener('click', () => this.executarClonagem());
        
        // Eventos de filtro
        this.searchInput?.addEventListener('input', () => this.aplicarFiltrosDebounced());
        this.filterType?.addEventListener('change', () => this.aplicarFiltrosDebounced());
        
        // Fechar ao clicar fora (ESC)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.fechar();
            }
        });
        
        console.log('✅ CloneCompSistema configurado com sucesso');
    }

    /**
     * ✅ NOVO: Aplicar filtros com debounce
     * Evita re-renderizações excessivas durante digitação rápida
     */
    aplicarFiltrosDebounced() {
        // Cancelar timeout anterior
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // Agendar nova renderização
        this.debounceTimeout = setTimeout(() => {
            this.aplicarFiltros();
        }, this.debounceDelay);
    }

    /**
     * Abrir modal
     */
    abrir() {
        console.log('📖 Abrindo modal de clonagem...');
        
        // Garantir que o manager existe
        if (!window.companheirosManager) {
            console.error('❌ CompanheirosManager não inicializado!');
            alert('Sistema de companheiros não está inicializado!');
            return;
        }
        
        // Carregar companheiros
        this.todasCompanheiros = window.companheirosManager.listarCompanheiros();
        console.log(`📋 ${this.todasCompanheiros.length} companheiros carregados`);
        
        // Resetar filtros
        this.searchInput.value = '';
        this.filterType.value = '';
        this.idSelecionado = null;
        this.companheirosSelecionados = [];
        
        // Desativar botão confirmar
        this.btnConfirmar.disabled = true;
        
        // Aplicar filtros (renderiza lista completa)
        this.aplicarFiltros();
        
        // Mostrar modal
        this.modal.style.display = 'flex';
        console.log('✅ Modal aberto');
    }

    /**
     * Fechar modal
     */
    fechar() {
        console.log('📖 Fechando modal de clonagem...');
        this.modal.style.display = 'none';
        this.idSelecionado = null;
        this.companheirosSelecionados = [];
    }

    /**
     * Aplicar filtros em tempo real
     */
    async aplicarFiltros() {
        const searchTerm = (this.searchInput?.value || '').toLowerCase();
        const filterTerm = (this.filterType?.value || '').toLowerCase();
        
        console.log(`🔍 Aplicando filtros: busca="${searchTerm}", tipo="${filterTerm}"`);
        
        // Filtrar companheiros
        this.companheirosFiltrados = this.todasCompanheiros.filter(comp => {
            const nomeMatch = comp.nome.toLowerCase().includes(searchTerm);
            const tipoMatch = filterTerm === '' || comp.tipo.toLowerCase() === filterTerm;
            return nomeMatch && tipoMatch;
        });
        
        console.log(`📋 ${this.companheirosFiltrados.length} companheiros após filtros`);
        
        // Renderizar lista (aguardar para carregar imagens)
        await this.renderizarLista();
    }

    /**
     * Renderizar lista de companheiros
     */
    async renderizarLista() {
        console.log('🎨 Renderizando lista de companheiros...');
        
        // Limpar container
        this.listContainer.innerHTML = '';
        
        // Se vazio, mostrar mensagem
        if (this.companheirosFiltrados.length === 0) {
            this.listContainer.innerHTML = `
                <div class="clone-comp-vazio">
                    <div class="clone-comp-vazio-icone">🔍</div>
                    <div class="clone-comp-vazio-texto">Nenhum companheiro encontrado</div>
                </div>
            `;
            return;
        }
        
        // ✅ CORREÇÃO: Renderizar cards em LOTES ao invés de paralelo total
        // Isso evita sobrecarregar o navegador com muitos loads simultâneos
        const tamanhoLote = 5; // Máximo 5 cards por vez
        const lotes = [];
        
        for (let i = 0; i < this.companheirosFiltrados.length; i += tamanhoLote) {
            lotes.push(this.companheirosFiltrados.slice(i, i + tamanhoLote));
        }
        
        try {
            for (const lote of lotes) {
                const cardsPromises = lote.map(comp => this.criarCardCompanheiro(comp));
                const cards = await Promise.all(cardsPromises);
                
                cards.forEach(card => {
                    if (card) {
                        this.listContainer.appendChild(card);
                    }
                });
                
                // Pequeno delay entre lotes para evitar travamento
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (e) {
            console.error('❌ Erro ao renderizar lista:', e);
        }
        
        console.log(`✅ Lista renderizada com ${this.companheirosFiltrados.length} items`);
    }

    /**
     * Criar card de companheiro (selecionável)
     */
    async criarCardCompanheiro(comp) {
        const card = document.createElement('div');
        card.className = 'clone-comp-item';
        card.dataset.id = comp.id;
        
        // HTML inicial do card
        card.innerHTML = `
            <div class="clone-comp-item-image"><div class="clone-comp-vazio-icone">🐾</div></div>
            <div class="clone-comp-item-name">${this.escaparHTML(comp.nome)}</div>
            <div class="clone-comp-item-tipo">Lv.${comp.nivel} • ${comp.tipo}</div>
        `;
        
        // Flag para rastrear se a imagem foi carregada
        let imagemCarregada = false;
        
        // ✅ CORREÇÃO: Carregar imagem com timeout de 3 segundos para evitar travamento
        if (window.companheirosImagemDB) {
            try {
                // Promise com timeout
                const imagemPromise = new Promise((resolve) => {
                    let timeoutId = setTimeout(() => {
                        console.warn('⏱️ Timeout ao recuperar imagem para:', comp.nome);
                        resolve(null);
                    }, 3000);
                    
                    window.companheirosImagemDB.recuperarImagem(comp.id)
                        .then(data => {
                            clearTimeout(timeoutId);
                            resolve(data);
                        })
                        .catch(err => {
                            clearTimeout(timeoutId);
                            console.warn('❌ Erro ao recuperar imagem:', err);
                            resolve(null);
                        });
                });
                
                const imagemData = await imagemPromise;
                
                if (imagemData && imagemData.dados) {
                    const imgElement = document.createElement('img');
                    imgElement.src = imagemData.dados;
                    imgElement.alt = comp.nome;
                    imgElement.onerror = () => imgElement.style.display = 'none';
                    
                    const imageContainer = card.querySelector('.clone-comp-item-image');
                    imageContainer.innerHTML = '';
                    imageContainer.appendChild(imgElement);
                    imagemCarregada = true;
                    console.log('✅ Imagem carregada do IndexedDB para:', comp.nome);
                }
            } catch (e) {
                console.log('⚠️ Erro ao tentar carregar imagem do IndexedDB:', comp.id, e);
            }
        }
        
        // Fallback para imagem URL (apenas se não carregou do IndexedDB)
        if (!imagemCarregada && comp.imagem) {
            try {
                const imgElement = document.createElement('img');
                imgElement.src = comp.imagem;
                imgElement.alt = comp.nome;
                imgElement.onerror = () => imgElement.style.display = 'none';
                
                const imageContainer = card.querySelector('.clone-comp-item-image');
                imageContainer.innerHTML = '';
                imageContainer.appendChild(imgElement);
                console.log('✅ Imagem carregada da URL para:', comp.nome);
            } catch (e) {
                console.warn('⚠️ Erro ao carregar imagem da URL:', e);
            }
        }
        
        // ✅ CORREÇÃO CRÍTICA: Adicionar event listener DEPOIS de todas as operações de imagem
        // Antes isso estava retornando antes de adicionar o listener, bloqueando cliques em cards com imagem
        card.addEventListener('click', (e) => {
            console.log('🖱️ Clique detectado no card:', comp.nome, 'ID:', comp.id, 'Target:', e.target);
            this.selecionarCompanheiro(comp.id, card);
        });
        
        // Marcar como selecionado se já está na lista
        if (this.idSelecionado === comp.id) {
            card.classList.add('selected');
        }
        
        return card;
    }

    /**
     * Selecionar companheiro
     */
    selecionarCompanheiro(id, element) {
        console.log('✅ Card clicado - Selecionando companheiro:', id);
        console.log('Element:', element);
        
        // Remover classe selected de todos os cards
        document.querySelectorAll('.clone-comp-item').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Adicionar ao card clicado
        element.classList.add('selected');
        
        // Guardar ID selecionado
        this.idSelecionado = id;
        
        // Ativar botão confirmar
        this.btnConfirmar.disabled = false;
        console.log('🎯 Botão confirmar ativado - Selecionado:', id);
    }

    /**
     * Executar clonagem
     */
    async executarClonagem() {
        console.log('🔄 Iniciando clonagem...');
        
        // Guard: garantir que tem um companheiro selecionado
        if (!this.idSelecionado) {
            console.warn('⚠️ Nenhum companheiro selecionado');
            alert('Por favor, selecione um companheiro para clonar!');
            return;
        }
        
        // Buscar o companheiro original
        const original = window.companheirosManager.obterPorId(this.idSelecionado);
        if (!original) {
            console.error('❌ Companheiro original não encontrado!');
            alert('Companheiro não encontrado!');
            return;
        }
        
        console.log('📋 Companheiro original:', original.nome);
        
        // Solicitar novo nome usando popup customizado
        const novoNome = await this.mostrarPopupNome(`Novo nome para o clone de "${original.nome}"?`, `${original.nome} (Cópia)`);
        
        if (!novoNome || novoNome.trim() === '') {
            console.warn('⚠️ Clonagem cancelada - sem novo nome');
            return;
        }
        
        try {
            // 1. Criar cópia profunda
            const clone = this.clonarProfundamente(original);
            
            console.log('✅ Cópia profunda criada');
            
            // 2. Atualizar dados obrigatórios
            clone.nome = novoNome.trim();
            clone.id = null; // Deixar null para gerar novo ID
            clone.morto = false;
            
            console.log('✅ Dados atualizados:', {
                nome: clone.nome,
                id: clone.id
            });
            
            // 3. Salvar novo companheiro
            const resultado = await window.companheirosManager.salvarNovoCompanheiro(clone);
            
            if (!resultado || !resultado.id) {
                console.error('❌ Erro ao salvar companheiro!', resultado);
                alert('Erro ao salvar o clonado!');
                return;
            }
            
            console.log('💾 Companheiro salvo com sucesso:', resultado.id);
            
            // 4. ✅ NOVO: Clonar inventário do companheiro
            // O inventário fica em localStorage com chave separada: companheiroInventario_${id}
            try {
                const chaveInventarioOrigem = `companheiroInventario_${this.idSelecionado}`;
                const chaveInventarioDestino = `companheiroInventario_${resultado.id}`;
                
                const inventarioOrigem = localStorage.getItem(chaveInventarioOrigem);
                
                if (inventarioOrigem) {
                    // Fazer parse e clone do inventário
                    const inventarioClonado = JSON.parse(inventarioOrigem);
                    
                    // Gerar novos IDs para os itens e armazenamentos
                    if (inventarioClonado.itens && Array.isArray(inventarioClonado.itens)) {
                        inventarioClonado.itens.forEach(item => {
                            item.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        });
                        console.log(`✅ ${inventarioClonado.itens.length} itens clonados com novos IDs`);
                    }
                    
                    if (inventarioClonado.armazenamentos && Array.isArray(inventarioClonado.armazenamentos)) {
                        inventarioClonado.armazenamentos.forEach(arm => {
                            arm.id = `arm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        });
                        console.log(`✅ ${inventarioClonado.armazenamentos.length} armazenamentos clonados com novos IDs`);
                    }
                    
                    // Salvar inventário clonado
                    localStorage.setItem(chaveInventarioDestino, JSON.stringify(inventarioClonado));
                    console.log(`✅ Inventário clonado com sucesso (${inventarioClonado.itens?.length || 0} itens, ${inventarioClonado.armazenamentos?.length || 0} armazenamentos)`);
                } else {
                    console.log('ℹ️ Companheiro original não possui inventário');
                }
            } catch (e) {
                console.warn('⚠️ Erro ao clonar inventário:', e);
                // Não bloquear clonagem se inventário falhar
            }
            
            // 5. Clonar imagem do IndexedDB (se existir)
            if (window.companheirosImagemDB) {
                try {
                    const imagemOriginal = await window.companheirosImagemDB.recuperarImagem(this.idSelecionado);
                    if (imagemOriginal && imagemOriginal.dados) {
                        await window.companheirosImagemDB.salvarImagem(resultado.id, imagemOriginal.dados);
                        console.log('🖼️ Imagem clonada com sucesso');
                    }
                } catch (e) {
                    console.warn('⚠️ Não foi possível clonar a imagem:', e);
                }
            }
            
            // 6. Salvar no storage
            await window.companheirosManager.salvarNoStorage();
            console.log('✅ Dados salvos no storage');
            
            // 7. Atualizar UI
            if (window.companheirosUI) {
                await window.companheirosUI.renderizar();
                console.log('🎨 UI atualizada');
            }
            
            // 8. Fechar modal
            this.fechar();
            
            // 9. Mostrar sucesso
            alert(`✅ Companheiro "${clone.nome}" clonado com sucesso!\n\n📦 Inventário também foi clonado!`);
            
            console.log('🎉 Clonagem concluída com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro durante clonagem:', error);
            alert('Erro ao clonar companheiro! Veja o console.');
        }
    }

    /**
     * Clonar profundamente um objeto
     * Copia TUDO: atributos, habilidades, inventário, imagem, etc.
     */
    clonarProfundamente(original) {
        // Usar JSON.parse(JSON.stringify(...)) para clonagem profunda segura
        return JSON.parse(JSON.stringify(original));
    }

    /**
     * Escapar HTML para evitar XSS
     */
    escaparHTML(texto) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return texto.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Mostrar popup customizado para solicitar novo nome
     */
    mostrarPopupNome(titulo, nomeDefault = '') {
        return new Promise((resolve) => {
            // Criar overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease;
            `;

            // Criar popup
            const popup = document.createElement('div');
            popup.style.cssText = `
                background: linear-gradient(135deg, var(--color-bg-primary), var(--color-bg-tertiary));
                border: 2px solid var(--color-secondary);
                border-radius: 16px;
                padding: 30px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 0 50px rgba(14, 165, 233, 0.5), inset 0 0 30px rgba(14, 165, 233, 0.1);
                animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            `;

            // Título
            const titleEl = document.createElement('h3');
            titleEl.textContent = titulo;
            titleEl.style.cssText = `
                color: var(--color-secondary-lighter);
                margin: 0 0 20px 0;
                font-size: 1.25em;
                text-shadow: 0 0 15px rgba(14, 165, 233, 0.6);
                font-weight: 600;
                letter-spacing: 0.5px;
            `;

            // Input
            const input = document.createElement('input');
            input.type = 'text';
            input.value = nomeDefault;
            input.placeholder = 'Digite o novo nome...';
            input.style.cssText = `
                width: 100%;
                padding: 14px 16px;
                background: rgba(0, 0, 0, 0.6);
                border: 1.5px solid rgba(14, 165, 233, 0.4);
                border-radius: 8px;
                color: var(--color-text-primary);
                font-size: 0.95em;
                margin-bottom: 24px;
                box-sizing: border-box;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            `;

            input.addEventListener('focus', function() {
                this.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.6), inset 0 0 10px rgba(14, 165, 233, 0.1)';
                this.style.borderColor = 'var(--color-secondary)';
                this.style.background = 'rgba(0, 0, 0, 0.8)';
            });

            input.addEventListener('blur', function() {
                this.style.boxShadow = 'none';
                this.style.borderColor = 'rgba(14, 165, 233, 0.4)';
                this.style.background = 'rgba(0, 0, 0, 0.6)';
            });

            // Container de botões
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            `;

            // Botão Cancelar
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.style.cssText = `
                padding: 12px 28px;
                background: linear-gradient(135deg, rgba(220, 38, 38, 0.35) 0%, rgba(180, 30, 30, 0.25) 100%);
                border: 2px solid rgba(220, 38, 38, 0.7);
                color: var(--color-text-primary);
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.95em;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            `;

            btnCancelar.addEventListener('mouseover', function() {
                this.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.55) 0%, rgba(180, 30, 30, 0.45) 100%)';
                this.style.borderColor = 'rgba(220, 38, 38, 0.95)';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.3)';
            });

            btnCancelar.addEventListener('mouseout', function() {
                this.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.35) 0%, rgba(180, 30, 30, 0.25) 100%)';
                this.style.borderColor = 'rgba(220, 38, 38, 0.7)';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });

            btnCancelar.addEventListener('click', () => {
                overlay.remove();
                resolve(null);
            });

            // Botão OK
            const btnOk = document.createElement('button');
            btnOk.textContent = 'OK';
            btnOk.style.cssText = `
                padding: 12px 28px;
                background: linear-gradient(135deg, rgba(14, 165, 233, 0.35) 0%, rgba(6, 182, 212, 0.25) 100%);
                border: 2px solid rgba(14, 165, 233, 0.7);
                color: var(--color-text-primary);
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.95em;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            `;

            btnOk.addEventListener('mouseover', function() {
                this.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.55) 0%, rgba(6, 182, 212, 0.45) 100%)';
                this.style.borderColor = 'rgba(14, 165, 233, 0.95)';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.3)';
            });

            btnOk.addEventListener('mouseout', function() {
                this.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.35) 0%, rgba(6, 182, 212, 0.25) 100%)';
                this.style.borderColor = 'rgba(14, 165, 233, 0.7)';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });

            btnOk.addEventListener('click', () => {
                const valor = input.value.trim();
                overlay.remove();
                resolve(valor || null);
            });

            // Permitir OK ao pressionar Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    btnOk.click();
                }
            });

            // Permitir cancelar ao pressionar ESC
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEsc);
                    btnCancelar.click();
                }
            };

            document.addEventListener('keydown', handleEsc);

            // Montar popup
            buttonsContainer.appendChild(btnCancelar);
            buttonsContainer.appendChild(btnOk);

            popup.appendChild(titleEl);
            popup.appendChild(input);
            popup.appendChild(buttonsContainer);

            overlay.appendChild(popup);
            document.body.appendChild(overlay);

            // Focar no input
            input.focus();
            input.select();
        });
    }
}

// Instância global
window.cloneCompSistema = new CloneCompSistema();

console.log('✅ CloneCompSistema carregado');
