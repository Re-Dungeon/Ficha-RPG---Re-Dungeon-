/* ============================================================= */
/* COMPANHEIROS-UI.JS - Interface de Usuário para Companheiros  */
/* Renderização, eventos e interações                           */
/* ============================================================= */

/**
 * CompanheirosUI
 * Responsável por toda a apresentação visual e interações da UI
 */

class CompanheirosUI {
    constructor() {
        this.gridId = 'listCompanheiros';
        this.modalId = 'modalNovoCompanheiro';
        
        this.inicializar();
    }

    /**
     * Inicializar a UI
     */
    inicializar() {
        console.log('🎨 Inicializando CompanheirosUI...');
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarUI());
        } else {
            this.configurarUI();
        }
    }

    /**
     * Configurar a UI
     */
    configurarUI() {
        console.log('⚙️ Configurando eventos da UI...');
        
        // Botão adicionar companheiro
        const btnAdicionar = document.getElementById('btn-adicionar-companheiro');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => this.abrirModalNovoCompanheiro());
        }

        // Render inicial - aguardar IndexedDB estar pronto
        if (window.companheirosImagemDB && !window.companheirosImagemDB.pronto) {
            console.log('⏳ Aguardando IndexedDB ficar pronto...');
            window.companheirosImagemDB.aguardarPronto().then(() => {
                console.log('✅ IndexedDB pronto, renderizando cards...');
                this.renderizar().catch(err => console.error('Erro ao renderizar:', err));
            });
        } else {
            this.renderizar().catch(err => console.error('Erro ao renderizar:', err));
        }
        
        console.log('✅ UI configurada com sucesso');
    }

    /**
     * Renderizar grid de companheiros (AGORA ASSÍNCRONO)
     */
    async renderizar() {
        const grid = document.getElementById(this.gridId);
        
        if (!grid) {
            console.warn('⚠️ Grid não encontrada');
            return;
        }

        const companheiros = window.companheirosManager.listarCompanheiros();

        // Limpar grid
        grid.innerHTML = '';

        // Se vazio, mostrar mensagem
        if (companheiros.length === 0) {
            grid.innerHTML = '<div class="companheiros-empty-message">Nenhum companheiro criado ainda</div>';
            return;
        }

        // Renderizar cada companheiro (await para carregar imagens)
        for (const companheiro of companheiros) {
            const card = await this.criarCardCompanheiro(companheiro);
            grid.appendChild(card);
        }

        console.log(`✅ Grid renderizada com ${companheiros.length} companheiros`);
    }

    /**
     * Criar elemento de card do companheiro (AGORA ASSÍNCRONO)
     */
    async criarCardCompanheiro(companheiro) {
        console.log('🎨 Criando card para companheiro:', {
            nome: companheiro.nome,
            saude: companheiro.saude,
            energia: companheiro.energia,
            fadiga: companheiro.fadiga
        });

        const card = document.createElement('div');
        card.className = 'npc-card-lux';
        
        // Adicionar classe se morto
        if (companheiro.morto) {
            card.classList.add('companheiro-morto');
        }

        // Adicionar classe de tipo ao card
        if (companheiro.tipo) {
            card.classList.add(`card--${companheiro.tipo.toLowerCase()}`);
        }

        // Calcular valores totais dos atributos
        const calcularTotal = (atributo) => {
            return (atributo.base || 0) + (atributo.extra || 0);
        };

        // Calcular barras de status - garantir que são números
        const saude = companheiro.saude || { atual: 0, maxima: 100, extra: 0, bonus: 0 };
        const energia = companheiro.energia || { atual: 0, maxima: 100, extra: 0, bonus: 0 };
        const fadiga = companheiro.fadiga || { atual: 0, maxima: 100, extra: 0, bonus: 0 };

        // Converter para números seguros (usando 'valor' que vem da ficha, ou 'atual' como fallback)
        const saudeAtual = Number(saude.valor || saude.atual) || 0;
        const saudeMaxima = Number(saude.maxima) || 100;
        const energiaAtual = Number(energia.valor || energia.atual) || 0;
        const energiaMaxima = Number(energia.maxima) || 100;
        const fadigaAtual = Number(fadiga.valor || fadiga.atual) || 0;
        const fadigaMaxima = Number(fadiga.maxima) || 100;

        console.log('📊 Valores das barras do card:', {
            saude: { atual: saudeAtual, maxima: saudeMaxima },
            energia: { atual: energiaAtual, maxima: energiaMaxima },
            fadiga: { atual: fadigaAtual, maxima: fadigaMaxima }
        });

        const saudePercent = saudeMaxima > 0 ? (saudeAtual / saudeMaxima) * 100 : 0;
        const energiaPercent = energiaMaxima > 0 ? (energiaAtual / energiaMaxima) * 100 : 0;
        const fadigaPercent = fadigaMaxima > 0 ? (fadigaAtual / fadigaMaxima) * 100 : 0;

        // Tipo badge
        const tipoBadge = `<span class="npc-card-tipo ${companheiro.tipo.toLowerCase()}">${companheiro.tipo}</span>`;

        // Status vivo/morto
        const statusClass = companheiro.morto ? 'morto' : 'vivo';
        const statusTexto = companheiro.morto ? '💀 MORTO' : '✅ VIVO';
        const statusBadge = `<span class="npc-card-status ${statusClass}">${statusTexto}</span>`;

        // Imagem ou placeholder - CARREGANDO DO INDEXEDDB
        let imagemHtml = '<div class="npc-card-image-placeholder">🐾</div>';
        
        // 🔥 PRIORIDADE 1: Tentar carregar do IndexedDB (SEMPRE, mesmo sem imagemDbId)
        if (window.companheirosImagemDB) {
            try {
                const imagemData = await window.companheirosImagemDB.recuperarImagem(companheiro.id);
                if (imagemData && imagemData.dados) {
                    // ✅ CORREÇÃO: Usar createElement para evitar problemas de escape
                    const imgElement = document.createElement('img');
                    imgElement.src = imagemData.dados;
                    imgElement.alt = companheiro.nome;
                    imgElement.className = 'npc-card-image-img';
                    imgElement.onerror = function() {
                        this.style.display = 'none';
                        this.parentElement.innerHTML = '<div class="npc-card-image-placeholder">🐾</div>';
                    };
                    imagemHtml = imgElement.outerHTML;
                    console.log(`📷 Imagem carregada do IndexedDB para card: ${companheiro.nome}`);
                } else {
                    // Se IndexedDB não tem, tentar URL como fallback
                    if (companheiro.imagem) {
                        const imgElement = document.createElement('img');
                        imgElement.src = companheiro.imagem;
                        imgElement.alt = companheiro.nome;
                        imgElement.className = 'npc-card-image-img';
                        imgElement.onerror = function() {
                            this.style.display = 'none';
                            this.parentElement.innerHTML = '<div class="npc-card-image-placeholder">🐾</div>';
                        };
                        imagemHtml = imgElement.outerHTML;
                        console.log(`📷 Imagem de URL usada para card: ${companheiro.nome}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Erro ao carregar imagem do IndexedDB para ${companheiro.nome}:`, error);
                // Fallback para URL se houver erro
                if (companheiro.imagem) {
                    const imgElement = document.createElement('img');
                    imgElement.src = companheiro.imagem;
                    imgElement.alt = companheiro.nome;
                    imgElement.className = 'npc-card-image-img';
                    imgElement.onerror = function() {
                        this.style.display = 'none';
                        this.parentElement.innerHTML = '<div class="npc-card-image-placeholder">🐾</div>';
                    };
                    imagemHtml = imgElement.outerHTML;
                }
            }
        } 
        // 🔥 PRIORIDADE 2: Se IndexedDB não está disponível, usar URL diretamente
        else if (companheiro.imagem) {
            const imgElement = document.createElement('img');
            imgElement.src = companheiro.imagem;
            imgElement.alt = companheiro.nome;
            imgElement.className = 'npc-card-image-img';
            imgElement.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML = '<div class="npc-card-image-placeholder">🐾</div>';
            };
            imagemHtml = imgElement.outerHTML;
            console.log(`📷 Imagem de URL usada (IndexedDB não disponível): ${companheiro.nome}`);
        }

        card.innerHTML = `
            <!-- Imagem -->
            <div class="npc-card-image">
                ${imagemHtml}
            </div>

            <!-- Header -->
            <div class="npc-card-header">
                ${tipoBadge}
                ${statusBadge}
            </div>

            <!-- Nome e Nível -->
            <div class="npc-card-nome">
                <div class="npc-card-nome-header">
                    <h3 class="npc-card-titulo">${this.escaparHtml(companheiro.nome)}</h3>
                    <span class="npc-card-nivel">Nv. ${companheiro.nivel}</span>
                </div>
                ${companheiro.descricao ? `<p class="npc-card-subtitulo">${this.escaparHtml(companheiro.descricao)}</p>` : ''}
            </div>

            <!-- Barras de Status -->
            <div class="npc-card-bars">
                <!-- Saúde -->
                <div class="npc-card-bar">
                    <div class="npc-card-bar-label">
                        <span>❤️ Saúde</span>
                        <strong>${Math.round(saudeAtual)} / ${Math.round(saudeMaxima)}</strong>
                    </div>
                    <div class="npc-card-bar-container">
                        <div class="npc-card-bar-fill hp" style="width: ${Math.min(100, Math.max(0, saudePercent))}%"></div>
                    </div>
                </div>

                <!-- Energia -->
                <div class="npc-card-bar">
                    <div class="npc-card-bar-label">
                        <span>⚡ Energia</span>
                        <strong>${Math.round(energiaAtual)} / ${Math.round(energiaMaxima)}</strong>
                    </div>
                    <div class="npc-card-bar-container">
                        <div class="npc-card-bar-fill energy" style="width: ${Math.min(100, Math.max(0, energiaPercent))}%"></div>
                    </div>
                </div>

                <!-- Fadiga -->
                <div class="npc-card-bar">
                    <div class="npc-card-bar-label">
                        <span>😴 Fadiga</span>
                        <strong>${Math.round(fadigaAtual)} / ${Math.round(fadigaMaxima)}</strong>
                    </div>
                    <div class="npc-card-bar-container">
                        <div class="npc-card-bar-fill fatigue" style="width: ${Math.min(100, Math.max(0, fadigaPercent))}%"></div>
                    </div>
                </div>
            </div>

            <!-- Botões -->
            <div class="npc-card-footer">
                <button class="npc-card-btn btn-ver" data-id="${companheiro.id}" data-acao="ver">👁️ Ver</button>
                <button class="npc-card-btn btn-editar" data-id="${companheiro.id}" data-acao="editar">✏️ Editar</button>
                <button class="npc-card-btn btn-deletar" data-id="${companheiro.id}" data-acao="deletar">🗑️ Deletar</button>
            </div>
        `;

        // Adicionar event listeners aos botões
        const btnVer = card.querySelector('[data-acao="ver"]');
        const btnEditar = card.querySelector('[data-acao="editar"]');
        const btnDeletar = card.querySelector('[data-acao="deletar"]');
        const statusBadgeElement = card.querySelector('.npc-card-status');

        if (btnVer) btnVer.addEventListener('click', async () => await this.visualizarCompanheiro(companheiro.id));
        if (btnEditar) btnEditar.addEventListener('click', async () => await this.editarCompanheiro(companheiro.id));
        if (btnDeletar) btnDeletar.addEventListener('click', async () => await this.deletarCompanheiro(companheiro.id));
        if (statusBadgeElement) statusBadgeElement.addEventListener('click', async () => await this.toggleStatusCompanheiro(companheiro.id));

        return card;
    }

    /**
     * Abrir modal para novo companheiro
     */
    abrirModalNovoCompanheiro() {
        console.log('📝 Abrindo modal para novo companheiro');
        
        window.companheirosManager.companheiroEmEdicao = null;
        
        // ✨ NOVO: Verificar se deve mostrar dica
        const naoMostrarDica = localStorage.getItem('nao-mostrar-dica-novo-companheiro') === 'true';
        
        if (!naoMostrarDica) {
            // Mostrar dica primeiro
            this.mostrarDicaNovoCompanheiro();
        } else {
            // Se não mostrar dica, abrir modal diretamente
            if (window.companheirosModalController) {
                window.companheirosModalController.abrirModal();
            } else {
                console.warn('⚠️ modalController não inicializado ainda');
            }
        }
    }

    /**
     * ✨ NOVO: Mostrar modal de dica para novo companheiro
     */
    mostrarDicaNovoCompanheiro() {
        const modalDica = document.getElementById('modalDicaCompanheiro');
        if (!modalDica) {
            console.warn('⚠️ Modal de dica não encontrado');
            return;
        }

        // Mostrar modal de dica
        modalDica.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Configurar listeners (uma só vez)
        if (!this._dicaListenersSetup) {
            const btnEntendi = document.getElementById('btn-entendi-dica-companheiro');
            const btnFechar = document.getElementById('btn-fechar-dica-companheiro');
            const chkNaoMostrar = document.getElementById('chk-nao-mostrar-dica-companheiro');

            if (btnEntendi) {
                btnEntendi.addEventListener('click', () => {
                    this.fecharDicaEAbrirModal(chkNaoMostrar);
                });
            }

            if (btnFechar) {
                btnFechar.addEventListener('click', () => {
                    this.fecharDicaEAbrirModal(chkNaoMostrar);
                });
            }

            this._dicaListenersSetup = true;
        }
    }

    /**
     * ✨ NOVO: Fechar dica e abrir modal principal
     */
    fecharDicaEAbrirModal(chkNaoMostrar) {
        const modalDica = document.getElementById('modalDicaCompanheiro');
        if (modalDica) {
            modalDica.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Salvar preferência de não mostrar novamente
        if (chkNaoMostrar && chkNaoMostrar.checked) {
            localStorage.setItem('nao-mostrar-dica-novo-companheiro', 'true');
            console.log('✅ Preferência salva: dica não será mostrada novamente');
        }

        // Abrir modal de novo companheiro
        if (window.companheirosModalController) {
            window.companheirosModalController.abrirModal();
        }
    }

    /**
     * Visualizar companheiro (modo somente leitura)
     */
    async visualizarCompanheiro(id) {
        const companheiro = await window.companheirosManager.verCompanheiro(id);
        
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado');
            return;
        }

        console.log(`👁️ Visualizando: ${companheiro.nome}`);
        
        // ⭐ Disparar evento para sincronizar inventário
        window.dispatchEvent(new CustomEvent('companheiroSelecionado', {
            detail: companheiro
        }));
        
        if (window.companheirosModalController) {
            await window.companheirosModalController.abrirModalVisualizacao(companheiro);
        }
    }

    /**
     * Editar companheiro
     */
    async editarCompanheiro(id) {
        console.log('🔍 Procurando companheiro para editar:', id);
        const companheiro = await window.companheirosManager.verCompanheiro(id);
        
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado');
            return;
        }

        console.log(`✏️ Editando: ${companheiro.nome} (ID: ${companheiro.id})`);
        console.log('🟠 ANTES de abrirModalEdicao, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
        
        // ⭐ Disparar evento para sincronizar inventário
        window.dispatchEvent(new CustomEvent('companheiroSelecionado', {
            detail: companheiro
        }));
        
        // ✅ FIX #1: NÃO setamos companheiroEmEdicao aqui
        // O Modal vai setar quando abrirModalEdicao() for chamado
        // Isso evita duplicação de lógica
        
        if (window.companheirosModalController) {
            console.log('🟠 Chamando abrirModalEdicao()...');
            await window.companheirosModalController.abrirModalEdicao(companheiro);
            console.log('🟠 DEPOIS de abrirModalEdicao, companheiroEmEdicao =', window.companheirosManager.companheiroEmEdicao);
        }
    }

    /**
     * Deletar companheiro (ASSINCRONIZADO - aguarda limpeza de imagem)
     */
    async deletarCompanheiro(id) {
        const companheiro = window.companheirosManager.verCompanheiro(id);
        
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado');
            return;
        }

        const confirmacao = confirm(`⚠️ Deletar "${companheiro.nome}"?\n\nEsta ação é irreversível.`);
        
        if (confirmacao) {
            await window.companheirosManager.deletarCompanheiro(id);
            await this.renderizar().catch(err => console.error('Erro ao renderizar:', err));
            console.log(`🗑️ Companheiro deletado`);
        }
    }

    /**
     * Toggle status morto/vivo clicando no badge (AGORA ASSINCRONO)
     */
    async toggleStatusCompanheiro(id) {
        console.log(`🔄 Toggle status do companheiro: ${id}`);
        const resultado = await window.companheirosManager.alternarMorteCompanheiro(id);
        console.log(`✅ Status alterado, novo status morto: ${resultado}`);
        await this.renderizar().catch(err => console.error('Erro ao renderizar:', err));
    }

    /**
     * Escapar caracteres HTML
     */
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    /**
     * ✨ NOVO: Resetar preferência de dica
     * Deixa a dica aparecer novamente na próxima vez
     */
    resetarDicaNovoCompanheiro() {
        localStorage.removeItem('nao-mostrar-dica-novo-companheiro');
        console.log('✅ Preferência resetada: dica será mostrada novamente');
    }
}

// Instância global
window.companheirosUI = new CompanheirosUI();

console.log('✅ CompanheirosUI carregado');
