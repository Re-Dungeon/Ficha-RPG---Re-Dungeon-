/**
 * LOJA DA TRAPAÇA - RENDERIZAÇÃO E INTERFACE
 * 
 * Responsável por:
 * - Gerar HTML da loja
 * - Renderizar categorias e itens
 * - Atualizar estado visual
 * - Gerenciar interações
 */

class LojaTrapaçaUI {
    constructor(lojaTrapaça) {
        this.loja = lojaTrapaça;
        this.overlayEl = null;
        this.modalEl = null;
        
        console.log('🎨 [LojaTrapaçaUI] Inicializando interface...');
        this.criar();
    }

    /**
     * SEÇÃO 1: CRIAÇÃO DA ESTRUTURA
     */
    criar() {
        try {
            // Criar overlay
            this.overlayEl = this.criarOverlay();
            document.body.appendChild(this.overlayEl);

            // Configurar eventos de fechar
            this.setupFechar();

            console.log('✅ [LojaTrapaçaUI] Interface criada');
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao criar interface:', error);
        }
    }

    criarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loja-trapaça-overlay';
        overlay.innerHTML = this.gerarHTML();
        return overlay;
    }

    gerarHTML() {
        // Garantir que o saldo seja carregado do localStorage se necessário
        let saldoExibicao = this.loja.saldoAtual;
        if (saldoExibicao === 0) {
            const fortunaArmazenada = localStorage.getItem('redungeon_fortuna_atual');
            if (fortunaArmazenada) {
                saldoExibicao = parseInt(fortunaArmazenada);
                this.loja.saldoAtual = saldoExibicao;
            }
        }

        return `
            <div class="loja-trapaça-backdrop"></div>
            <div class="loja-trapaça-modal">
                <div class="loja-trapaça-header">
                    <div>
                        <h2 class="loja-trapaça-title">
                            🎲 LOJA DA SORTE
                        </h2>
                    </div>
                    <div class="loja-trapaça-header-info">
                        <div class="loja-trapaça-saldo">
                            💰 Saldo: <span class="loja-trapaça-saldo-valor">${saldoExibicao}</span> Ȼ
                        </div>
                        <button class="loja-trapaça-btn-voltar" title="Voltar">↩</button>
                        <button class="loja-trapaça-btn-fechar" title="Fechar">✘</button>
                    </div>
                </div>

                <div class="loja-trapaça-content" id="loja-conteudo">
                    ${this.gerarCategorias()}
                </div>

                <div class="loja-trapaça-footer">
                    🎲 <span class="destaque-categoria">Use Fortuna (Ȼ) para comprar itens mágicos e especiais | Limite de 1 Bênção por dia</span>
                </div>
            </div>
        `;
    }

    /**
     * SEÇÃO 2: GERAÇÃO DE CONTEÚDO
     */
    gerarCategorias() {
        const categorias = [
            {
                key: 'beneficios_menores',
                nome: 'Benefícios Menores',
                descricao: '<span class="destaque-categoria">Efeitos imediatos e rápidos (Pode utilizar à vontade!)</span>',
                emoji: '⭐'
            },
            {
                key: 'vantagens_taticas',
                nome: 'Vantagens Táticas',
                descricao: '<span class="destaque-categoria">Guardadas para usar estrategicamente (até 2)</span>',
                emoji: '🎯'
            },
            {
                key: 'efeitos_avancados',
                nome: 'Efeitos Avançados',
                descricao: '<span class="destaque-categoria">Poderosos, 1 por combate</span>',
                emoji: '✨'
            },
            {
                key: 'bencaos_unicas',
                nome: 'Bênçãos Únicas',
                descricao: '<span class="destaque-categoria">Raras e poderosas, 1 por sessão!</span>',
                emoji: '😇'
            }
        ];

        return categorias.map(cat => this.gerarCategoria(cat)).join('');
    }

    gerarCategoria(categoria) {
        const items = this.loja.items[categoria.key] || [];
        const htmlItens = items.map(item => this.gerarItem(item)).join('');

        return `
            <div class="loja-categoria">
                <div class="loja-categoria-header">
                    <span class="loja-categoria-emoji">${categoria.emoji}</span>
                    <h3 class="loja-categoria-titulo">${categoria.nome}</h3>
                </div>
                <p class="loja-categoria-descricao">${categoria.descricao}</p>
                <div class="loja-itens-grid">
                    ${htmlItens}
                </div>
            </div>
        `;
    }

    gerarItem(item) {
        const temSaldo = this.loja.saldoAtual >= item.custo;

        return `
            <div class="loja-item-card">
                <div class="loja-item-header">
                    <h4 class="loja-item-nome">
                        <span class="loja-item-emoji">${item.emoji}</span>
                        ${item.nome}
                    </h4>
                    <span class="loja-item-custo">${item.custo}Ȼ</span>
                </div>

                <p class="loja-item-descricao">${item.descricao}</p>

                <div class="loja-item-efeito">
                    ⚡ ${item.efeito}
                </div>

                <div class="loja-item-info">
                    <span class="loja-item-info-badge">
                        ${this.obterLabelTipo(item.tipo)}
                    </span>
                    <span class="loja-item-info-badge">
                        ${item.limite_uso}
                    </span>
                </div>

                <button 
                    class="loja-item-btn btn-comprar-loja"
                    data-item-id="${item.id}"
                    title="${this.obterTituloBtn(item, temSaldo)}"
                >
                    💳 Comprar
                </button>
            </div>
        `;
    }

    /**
     * SEÇÃO 3: UTILITÁRIOS
     */
    obterLabelTipo(tipo) {
        switch (tipo) {
            case 'instantaneo':
                return '⚡ Imediato';
            case 'armazenavel':
                return '📦 Armazenável';
            case 'sessao':
                return '🕐 Sessão';
            case 'unico':
                return '👑 Único';
            default:
                return tipo;
        }
    }

    obterTituloBtn(item, temSaldo) {
        if (!temSaldo) return 'Saldo insuficiente';
        return `Comprar ${item.nome} por ${item.custo}Ȼ`;
    }

    /**
     * SEÇÃO 4: EVENTOS
     */
    setupFechar() {
        if (!this.overlayEl) {
            console.warn('⚠️ [LojaTrapaçaUI] Overlay não inicializado, ignorando setup de eventos');
            return;
        }
        
        this.overlayEl.addEventListener('click', (e) => {
            // Fechar ao clicar no backdrop
            if (e.target.classList.contains('loja-trapaça-backdrop')) {
                this.fechar();
            }

            // Voltar ao menu ao clicar no botão de voltar
            if (e.target.classList.contains('loja-trapaça-btn-voltar')) {
                this.voltarMenu();
            }

            // Fechar ao clicar no botão X
            if (e.target.classList.contains('loja-trapaça-btn-fechar')) {
                this.fechar();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlayEl.classList.contains('ativo')) {
                this.fechar();
            }
        });
    }

    /**
     * SEÇÃO 5: CONTROLE DE VISIBILIDADE
     */
    sincronizarSaldoDoStorage() {
        /**
         * Função crítica: Lê o saldo diretamente do localStorage
         * Isso garante que o valor exibido SEMPRE seja o mais recente
         */
        try {
            const saldoArmazenado = localStorage.getItem('redungeon_fortuna_atual');
            
            console.log('🔍 [LojaTrapaçaUI] DEBUG - Sincronização ao abrir:');
            console.log('   - Valor no localStorage: ' + saldoArmazenado);
            console.log('   - Tipo: ' + typeof saldoArmazenado);
            
            if (saldoArmazenado !== null) {
                const novoSaldo = parseInt(saldoArmazenado, 10);
                console.log('   - Convertido para número: ' + novoSaldo);
                console.log('   - isNaN? ' + isNaN(novoSaldo));
                
                if (!isNaN(novoSaldo)) {
                    const saldoAnterior = this.loja.saldoAtual;
                    this.loja.saldoAtual = novoSaldo;
                    console.log(`✅ [LojaTrapaçaUI] Saldo atualizado: ${saldoAnterior} → ${this.loja.saldoAtual} Ȼ`);
                    return;
                }
            }
            
            // Se não conseguir ler do storage, mostrar aviso
            console.warn(`⚠️ [LojaTrapaçaUI] Não conseguiu sincronizar, mantendo: ${this.loja.saldoAtual} Ȼ`);
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao sincronizar saldo:', error);
        }
    }

    abrir() {
        try {
            if (!this.overlayEl) {
                console.error('❌ [LojaTrapaçaUI] Overlay não inicializado');
                return;
            }
            
            // ⭐ CRÍTICO: Sincronizar saldo DO STORAGE antes de qualquer coisa
            this.sincronizarSaldoDoStorage();
            
            // Depois atualizar a UI com o saldo sincronizado
            this.atualizar();
            
            // Exibir a loja
            this.overlayEl.classList.add('ativo');
            console.log('🏪 [LojaTrapaçaUI] Loja aberta - Saldo: ' + this.loja.saldoAtual);
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao abrir:', error);
        }
    }

    fechar() {
        try {
            if (!this.overlayEl) {
                console.error('❌ [LojaTrapaçaUI] Overlay não inicializado');
                return;
            }
            
            this.overlayEl.classList.remove('ativo');
            console.log('🏪 [LojaTrapaçaUI] Loja fechada');
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao fechar:', error);
        }
    }

    /**
     * Volta para o menu principal
     * Mantém todos os dados salvos
     */
    voltarMenu() {
        console.log('🔙 [LojaTrapaçaUI] Voltando para o menu principal...');
        this.fechar();
        
        // Aguardar a animação de fechamento
        setTimeout(() => {
            // Fechar o Sistema de Fortuna (sorteModal)
            if (window.sorteModal && typeof window.sorteModal.close === 'function') {
                window.sorteModal.close();
                console.log('✅ [LojaTrapaçaUI] Sistema de Fortuna fechado');
            }
            
            // Abrir o menu principal
            const btnMenu = document.getElementById('btn-menu-principal');
            if (btnMenu) {
                btnMenu.click();
                btnMenu.focus();
                console.log('✅ [LojaTrapaçaUI] Voltado com sucesso para o menu principal');
            } else {
                console.warn('⚠️ [LojaTrapaçaUI] Botão do menu principal não encontrado');
            }
        }, 300);
    }

    toggle() {
        if (!this.overlayEl) {
            console.error('❌ [LojaTrapaçaUI] Overlay não inicializado');
            return;
        }
        
        if (this.overlayEl.classList.contains('ativo')) {
            this.fechar();
        } else {
            this.abrir();
        }
    }

    /**
     * SEÇÃO 7: ATUALIZAÇÃO
     */
    atualizar() {
        try {
            if (!this.overlayEl) {
                console.error('❌ [LojaTrapaçaUI] Overlay não inicializado');
                return;
            }
            
            console.log('🔄 [LojaTrapaçaUI] Iniciando atualização da interface...');
            console.log('   - Saldo atual: ' + this.loja.saldoAtual);
            
            // Atualizar elemento visual do saldo (agora já sincronizado via abrir())
            const saldoEl = this.overlayEl.querySelector('.loja-trapaça-saldo-valor');
            if (saldoEl) {
                saldoEl.textContent = this.loja.saldoAtual;
                console.log(`✨ [LojaTrapaçaUI] Saldo exibido: ${this.loja.saldoAtual} Ȼ`);
            } else {
                console.warn('⚠️ [LojaTrapaçaUI] Elemento de saldo não encontrado!');
            }

            // ⭐ Todos os botões sempre habilitados - validação acontece ao clicar
            console.log(`   - Todos os botões de compra permanecem habilitados`);

            console.log('✅ [LojaTrapaçaUI] Interface atualizada com sucesso');
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao atualizar:', error);
        }
    }

    /**
     * SEÇÃO 7: MENSAGENS
     */
    mostrarMensagem(texto, tipo = 'info') {
        try {
            console.log(`📢 [LojaTrapaçaUI] Tentando exibir popup tipo="${tipo}"`);
            
            // Criar container da mensagem
            const msg = document.createElement('div');
            msg.className = `loja-mensagem ${tipo}`;
            
            // Estilos inline para garantir visibilidade
            msg.style.position = 'fixed';
            msg.style.top = '20px';
            msg.style.right = '20px';
            msg.style.zIndex = '10000';
            msg.style.minWidth = '300px';
            
            // Se for HTML, usar innerHTML, senão textContent
            if (texto.includes('<')) {
                msg.innerHTML = texto;
            } else {
                msg.textContent = texto;
            }
            
            // Adicionar ao body
            document.body.appendChild(msg);
            
            console.log(`✅ [LojaTrapaçaUI] Popup criado e adicionado ao DOM`);
            console.log(`   - Classe: ${msg.className}`);
            console.log(`   - Visível: ${msg.offsetHeight > 0}`);

            // Se for erro de saldo, mostrar por mais tempo
            const duracao = tipo === 'erro' ? 4000 : 3000;

            // Remover após o tempo
            setTimeout(() => {
                msg.style.opacity = '0';
                msg.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => {
                    msg.remove();
                }, 300);
            }, duracao);

            console.log(`${tipo === 'erro' ? '❌' : '✅'} [LojaTrapaçaUI] Popup ${tipo} será exibido por ${duracao}ms`);
        } catch (error) {
            console.error('❌ [LojaTrapaçaUI] Erro ao mostrar mensagem:', error);
            console.error(error.stack);
        }
    }

    /**
     * Mostrar popup de erro de saldo (versão melhorada)
     */
    mostrarPopupSaldoInsuficiente(itemNome, saldoAtual, custoPreciso) {
        const diferenca = custoPreciso - saldoAtual;
        const mensagem = `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 28px; margin-bottom: 8px;">⚠️</div>
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">Saldo Insuficiente!</div>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 8px 0;">
                <div style="font-size: 12px; margin-bottom: 8px;">
                    <strong>${itemNome}</strong> custa
                </div>
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">
                    ${custoPreciso}Ȼ
                </div>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 8px 0;">
                <div style="font-size: 12px; margin-bottom: 6px;">
                    Você tem: <strong>${saldoAtual}Ȼ</strong>
                </div>
                <div style="font-size: 13px; font-weight: bold; color: #ff6b6b; margin-top: 8px;">
                    Faltam: ${diferenca}Ȼ
                </div>
            </div>
        `;
        this.mostrarMensagem(mensagem, 'erro');
    }
}

// Integração com LojaTrapaça
if (typeof LojaTrapaça !== 'undefined') {
    const originalInit = LojaTrapaça.prototype.inicializar;
    
    LojaTrapaça.prototype.inicializar = function() {
        originalInit.call(this);
        this.ui = new LojaTrapaçaUI(this);
        this.setupBotaoLoja();
    };

    LojaTrapaça.prototype.mostrarMensagem = function(texto, tipo) {
        if (this.ui) {
            this.ui.mostrarMensagem(texto, tipo);
        }
    };

    LojaTrapaça.prototype.setupBotaoLoja = function() {
        const botao = document.getElementById('btn-sorte-loja');
        if (botao) {
            botao.addEventListener('click', () => {
                this.ui.abrir();
            });
        }
    };
}