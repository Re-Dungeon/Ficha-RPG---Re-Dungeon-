/* ============================================ */
/* SORTE-HISTORICO.JS - Sistema de Histórico */
/* Gerenciador do histórico de ações de Sorte */
/* ============================================ */

/**
 * SorteHistorico
 * Responsável por:
 * - Registrar ações no histórico (rolagens, compras, etc)
 * - Renderizar o histórico na UI
 * - Gerenciar limitações (últimas 10 ações)
 * - Persistir no localStorage
 */
class SorteHistorico {
    constructor() {
        console.log('📜 [SorteHistorico] Inicializando...');
        
        this.historico = [];
        this.maxItens = 10;
        this.chaveStorage = 'redungeon_sorte_historico';
        
        this.init();
    }

    /**
     * Inicializa o sistema
     */
    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        // Expor globalmente
        window.sorteHistorico = this;
        console.log('✅ [SorteHistorico] Disponível em window.sorteHistorico');
    }

    /**
     * Configura o sistema após DOM estar pronto
     */
    setup() {
        try {
            // Carregar histórico do localStorage
            this.carregarHistorico();
            
            // Buscar elemento da lista
            this.listaEl = document.getElementById('sorte-historico-list');
            if (!this.listaEl) {
                console.warn('⚠️ [SorteHistorico] Elemento da lista não encontrado');
                return;
            }

            // Configurar listeners para eventos
            this.setupListeners();
            
            // Renderizar histórico inicial
            this.renderHistorico();
            
            console.log('✅ [SorteHistorico] Sistema configurado');
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao configurar:', error);
        }
    }

    /**
     * Configura listeners para eventos de ações
     */
    setupListeners() {
        // Evento de rolagem de fortuna
        window.addEventListener('fortunaRolada', (e) => {
            console.log('📜 [SorteHistorico] Evento fortunaRolada recebido');
            this.registrarRolagem(e.detail);
        });

        // Evento de compra na loja (evento da Loja da Trapaça)
        window.addEventListener('lojaCompra', (e) => {
            console.log('📜 [SorteHistorico] Evento lojaCompra recebido');
            if (e.detail && e.detail.item) {
                this.registrarCompra({
                    itemNome: e.detail.item.nome,
                    custoItem: e.detail.item.custo,
                    saldoNovo: e.detail.saldoRestante,
                    saldoAnterior: e.detail.saldoRestante + e.detail.item.custo
                });
            }
        });

        // Evento de benefício aplicado (para integração futura)
        window.addEventListener('beneficioAplicado', (e) => {
            console.log('📜 [SorteHistorico] Evento beneficioAplicado recebido');
            this.registrarBeneficio(e.detail);
        });

        console.log('✅ [SorteHistorico] Listeners configurados');
    }

    /**
     * Registra uma rolagem de fortuna
     */
    registrarRolagem(detalhes) {
        try {
            // Garantir que todos os valores estão definidos
            const totalDados = detalhes.totalDados || 0;
            const somaDados = detalhes.somaDados || 0;
            const bonus = detalhes.bonus || 0;
            const resultadoFinal = detalhes.resultadoFinal !== undefined ? detalhes.resultadoFinal : (somaDados + bonus);
            
            const acao = {
                id: this.gerarId(),
                tipo: 'rolagem',
                timestamp: new Date(),
                descricao: `Rolou ${totalDados} ${totalDados === 1 ? 'dado' : 'dados'}`,
                iconEmoji: '🎲',
                dados: {
                    totalDados: totalDados,
                    somaDados: somaDados,
                    bonus: bonus,
                    resultadoFinal: resultadoFinal,
                    fortunaObtida: detalhes.fortunaAtual || resultadoFinal
                }
            };

            // Adicionar ao histórico
            this.adicionarAcao(acao);
            
            console.log('✅ [SorteHistorico] Rolagem registrada:', acao);
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao registrar rolagem:', error);
        }
    }

    /**
     * Registra uma compra na loja
     */
    registrarCompra(detalhes) {
        try {
            const acao = {
                id: this.gerarId(),
                tipo: 'compra',
                timestamp: new Date(),
                descricao: `Comprou: ${detalhes.itemNome}`,
                iconEmoji: '🏪',
                dados: {
                    itemNome: detalhes.itemNome,
                    custoBefore: detalhes.custoBefore || 0,
                    custoAfter: detalhes.custoAfter || 0,
                    custoItem: detalhes.custoItem || 0,
                    saldoAnterior: detalhes.saldoAnterior || 0,
                    saldoNovo: detalhes.saldoNovo || 0
                }
            };

            // Adicionar ao histórico
            this.adicionarAcao(acao);
            
            console.log('✅ [SorteHistorico] Compra registrada:', acao);
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao registrar compra:', error);
        }
    }

    /**
     * Registra um benefício aplicado
     */
    registrarBeneficio(detalhes) {
        try {
            const acao = {
                id: this.gerarId(),
                tipo: 'beneficio',
                timestamp: new Date(),
                descricao: `Benefício: ${detalhes.beneficioNome}`,
                iconEmoji: '✨',
                dados: {
                    beneficioNome: detalhes.beneficioNome,
                    duracao: detalhes.duracao || 'permanente',
                    efeito: detalhes.efeito || ''
                }
            };

            // Adicionar ao histórico
            this.adicionarAcao(acao);
            
            console.log('✅ [SorteHistorico] Benefício registrado:', acao);
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao registrar benefício:', error);
        }
    }

    /**
     * Adiciona uma ação ao histórico
     * Mantém apenas as últimas 'maxItens' ações
     */
    adicionarAcao(acao) {
        try {
            // Adicionar no topo (mais recentes primeiro)
            this.historico.unshift(acao);
            
            // Limitar ao máximo de itens
            if (this.historico.length > this.maxItens) {
                this.historico = this.historico.slice(0, this.maxItens);
            }

            // Salvar no localStorage
            this.salvarHistorico();
            
            // Renderizar histórico
            this.renderHistorico();
            
            console.log(`✅ [SorteHistorico] Ação adicionada. Total: ${this.historico.length}`);
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao adicionar ação:', error);
        }
    }

    /**
     * Carrega histórico do localStorage
     */
    carregarHistorico() {
        try {
            const stored = localStorage.getItem(this.chaveStorage);
            
            if (stored) {
                const dados = JSON.parse(stored);
                
                // Converter timestamps de volta para Date
                this.historico = dados.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                
                console.log(`✅ [SorteHistorico] Histórico carregado: ${this.historico.length} itens`);
            } else {
                this.historico = [];
                console.log('✅ [SorteHistorico] Histórico vazio (primeira vez)');
            }
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao carregar histórico:', error);
            this.historico = [];
        }
    }

    /**
     * Salva histórico no localStorage
     */
    salvarHistorico() {
        try {
            localStorage.setItem(this.chaveStorage, JSON.stringify(this.historico));
            console.log('✅ [SorteHistorico] Histórico salvo');
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao salvar histórico:', error);
        }
    }

    /**
     * Renderiza o histórico na UI
     */
    renderHistorico() {
        try {
            if (!this.listaEl) return;

            // Se vazio, mostrar mensagem
            if (this.historico.length === 0) {
                this.listaEl.innerHTML = `
                    <div class="sorte-historico-empty">
                        Nenhuma ação registrada ainda...
                    </div>
                `;
                return;
            }

            // Renderizar itens
            this.listaEl.innerHTML = this.historico
                .map(item => this.renderItemHistorico(item))
                .join('');

            console.log('✅ [SorteHistorico] Histórico renderizado');
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao renderizar histórico:', error);
        }
    }

    /**
     * Renderiza um item individual do histórico
     */
    renderItemHistorico(item) {
        try {
            const classe = `sorte-historico-item tipo-${item.tipo}`;
            const timestamp = this.formatarTimestamp(item.timestamp);
            const conteudo = this.gerarConteudoItem(item);

            return `
                <div class="${classe}" title="${item.descricao}">
                    <div class="sorte-historico-icon">${item.iconEmoji}</div>
                    <div class="sorte-historico-content">
                        <div class="sorte-historico-descricao">${conteudo}</div>
                        <div class="sorte-historico-valor">${this.gerarValor(item)}</div>
                    </div>
                    <div class="sorte-historico-timestamp">${timestamp}</div>
                </div>
            `;
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao renderizar item:', error);
            return '';
        }
    }

    /**
     * Gera o conteúdo (descrição) do item
     */
    gerarConteudoItem(item) {
        try {
            let conteudo = '';

            switch (item.tipo) {
                case 'rolagem':
                    conteudo = `
                        <span class="sorte-historico-badge">Rolagem</span>
                        Rolou <strong>${item.dados.totalDados}</strong> ${item.dados.totalDados === 1 ? 'dado' : 'dados'}
                    `;
                    break;

                case 'compra':
                    conteudo = `
                        <span class="sorte-historico-badge">Compra</span>
                        Adquiriu: <strong>${item.dados.itemNome}</strong>
                    `;
                    break;

                case 'beneficio':
                    conteudo = `
                        <span class="sorte-historico-badge">Benefício</span>
                        Aplicou: <strong>${item.dados.beneficioNome}</strong>
                    `;
                    break;

                default:
                    conteudo = item.descricao;
            }

            return conteudo;
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao gerar conteúdo:', error);
            return item.descricao;
        }
    }

    /**
     * Gera o valor/resultado do item
     */
    gerarValor(item) {
        try {
            let valor = '';

            switch (item.tipo) {
                case 'rolagem':
                    const resultadoFinal = item.dados.resultadoFinal !== undefined ? item.dados.resultadoFinal : 0;
                    const somaDados = item.dados.somaDados !== undefined ? item.dados.somaDados : 0;
                    const bonus = item.dados.bonus !== undefined ? item.dados.bonus : 0;
                    valor = `
                        💰 <strong>${resultadoFinal}</strong> 
                        (${somaDados} + ${bonus})
                    `;
                    break;

                case 'compra':
                    const custoItem = item.dados.custoItem !== undefined ? item.dados.custoItem : 0;
                    const saldoNovo = item.dados.saldoNovo !== undefined ? item.dados.saldoNovo : 0;
                    valor = `
                        -${custoItem} 
                        (Saldo: <strong>${saldoNovo}</strong>)
                    `;
                    break;

                case 'beneficio':
                    valor = `
                        <span class="sorte-historico-duracao">${item.dados.duracao}</span>
                    `;
                    break;

                default:
                    valor = '';
            }

            return valor;
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao gerar valor:', error);
            return '';
        }
    }

    /**
     * Formata timestamp para exibição
     */
    formatarTimestamp(date) {
        try {
            const agora = new Date();
            const diff = Math.floor((agora - date) / 1000); // diferença em segundos

            // Se menos de 1 minuto
            if (diff < 60) {
                return 'agora';
            }

            // Se menos de 1 hora
            if (diff < 3600) {
                const minutos = Math.floor(diff / 60);
                return `${minutos}m`;
            }

            // Se menos de 24 horas
            if (diff < 86400) {
                const horas = Math.floor(diff / 3600);
                return `${horas}h`;
            }

            // Se mesmo dia
            if (date.toDateString() === agora.toDateString()) {
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }

            // Caso contrário, mostrar data
            return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
        } catch (error) {
            console.warn('⚠️ [SorteHistorico] Erro ao formatar timestamp:', error);
            return 'data';
        }
    }

    /**
     * Gera um ID único
     */
    gerarId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Limpa todo o histórico
     */
    limparHistorico() {
        try {
            this.historico = [];
            this.salvarHistorico();
            this.renderHistorico();
            console.log('✅ [SorteHistorico] Histórico limpo');
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao limpar histórico:', error);
        }
    }

    /**
     * Retorna o histórico completo
     */
    obterHistorico() {
        return [...this.historico];
    }

    /**
     * Exporta o histórico como JSON
     */
    exportarHistorico() {
        try {
            const dados = JSON.stringify(this.historico, null, 2);
            console.log('📊 [SorteHistorico] Histórico exportado:', dados);
            return dados;
        } catch (error) {
            console.error('❌ [SorteHistorico] Erro ao exportar histórico:', error);
            return null;
        }
    }
}

// Inicializar quando o script carregar
console.log('🎯 [SorteHistorico] Script carregado, aguardando DOMContentLoaded...');
const sorteHistorico = new SorteHistorico();
