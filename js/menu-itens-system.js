/**
 * SISTEMA DE ITENS COM ROKMAS
 * 
 * Responsabilidades:
 * - Gerenciar saldo de Rokmas
 * - Gerenciar inventário de itens
 * - Validar compras e vendas
 * - Sincronizar com localStorage
 * - Disparar eventos do sistema
 */

class MenuItensSystem {
    constructor() {
        console.log('🛒 [MenuItensSystem] Inicializando...');

        // Estado do jogador
        this.rokmas = 0;
        this.inventario = {}; // { itemId: quantidade }

        // Dados
        this.catalogo = MENU_ITENS_CATALOGO;

        // Histórico
        this.historico = [];

        // Inicializar
        this.carregar();
        this.setupEventos();

        console.log('✅ [MenuItensSystem] Pronto para uso');
    }

    // ═══════════════════════════════════════════════════════════
    // 💾 PERSISTÊNCIA - CARREGAMENTO E SALVAMENTO
    // ═══════════════════════════════════════════════════════════

    /**
     * Carregar dados do localStorage
     */
    carregar() {
        try {
            // Carregar Rokmas
            const rokmasSalvo = localStorage.getItem(MENU_ITENS_CONFIG.armazenamento.rokmas);
            this.rokmas = rokmasSalvo ? parseInt(rokmasSalvo) : 150;

            // Carregar inventário
            const inventarioSalvo = localStorage.getItem(MENU_ITENS_CONFIG.armazenamento.inventario);
            this.inventario = inventarioSalvo ? JSON.parse(inventarioSalvo) : {};

            // Carregar histórico
            const historicoSalvo = localStorage.getItem(MENU_ITENS_CONFIG.armazenamento.historico);
            this.historico = historicoSalvo ? JSON.parse(historicoSalvo) : [];

            console.log(`💾 [MenuItensSystem] Dados carregados:`);
            console.log(`   - Rokmas: ${this.rokmas}`);
            console.log(`   - Itens no inventário: ${Object.keys(this.inventario).length}`);
            console.log(`   - Histórico: ${this.historico.length} transações`);

        } catch (error) {
            console.error('❌ [MenuItensSystem] Erro ao carregar:', error);
            this.inicializarPadrao();
        }
    }

    /**
     * Salvar dados no localStorage
     */
    salvar() {
        try {
            localStorage.setItem(MENU_ITENS_CONFIG.armazenamento.rokmas, String(this.rokmas));
            localStorage.setItem(MENU_ITENS_CONFIG.armazenamento.inventario, JSON.stringify(this.inventario));
            localStorage.setItem(MENU_ITENS_CONFIG.armazenamento.historico, JSON.stringify(this.historico));

            console.log(`💾 [MenuItensSystem] Dados salvos`);
        } catch (error) {
            console.error('❌ [MenuItensSystem] Erro ao salvar:', error);
        }
    }

    /**
     * Inicializar com valores padrão
     */
    inicializarPadrao() {
        this.rokmas = 150;
        this.inventario = {};
        this.historico = [];
        this.salvar();
        console.log('🔄 [MenuItensSystem] Inicializado com valores padrão');
    }

    /**
     * Resetar dados (para testes)
     */
    resetar() {
        if (confirm('⚠️ Isso vai apagar TODOS os seus dados. Tem certeza?')) {
            localStorage.removeItem(MENU_ITENS_CONFIG.armazenamento.rokmas);
            localStorage.removeItem(MENU_ITENS_CONFIG.armazenamento.inventario);
            localStorage.removeItem(MENU_ITENS_CONFIG.armazenamento.historico);
            this.inicializarPadrao();
            console.log('🔄 [MenuItensSystem] Dados resetados');
            window.dispatchEvent(new CustomEvent('menuItensAtualizado'));
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 💰 GERENCIADOR DE ROKMAS
    // ═══════════════════════════════════════════════════════════

    /**
     * Obter saldo atual
     */
    obterSaldo() {
        return this.rokmas;
    }

    /**
     * Definir novo saldo
     */
    definirSaldo(novoValor) {
        const valor = parseInt(novoValor);

        if (isNaN(valor) || valor < 0) {
            console.warn('⚠️ [MenuItensSystem] Valor inválido para Rokmas');
            return false;
        }

        const saldoAnterior = this.rokmas;
        this.rokmas = valor;
        this.salvar();

        console.log(`💰 [MenuItensSystem] Rokmas alterado: ${saldoAnterior} → ${valor}`);

        // Notificar atualização
        window.dispatchEvent(new CustomEvent('menuItensRokmasAlterado', {
            detail: {
                saldoAnterior,
                saldoNovo: valor,
                timestamp: Date.now()
            }
        }));

        return true;
    }

    /**
     * Adicionar Rokmas
     */
    adicionarRokmas(quantidade) {
        if (quantidade <= 0) return false;
        return this.definirSaldo(this.rokmas + quantidade);
    }

    /**
     * Remover Rokmas
     */
    removerRokmas(quantidade) {
        if (quantidade <= 0 || this.rokmas < quantidade) return false;
        return this.definirSaldo(this.rokmas - quantidade);
    }

    // ═══════════════════════════════════════════════════════════
    // 🛍️ SISTEMA DE COMPRA
    // ═══════════════════════════════════════════════════════════

    /**
     * Obter máximo de itens que pode ser comprado baseado no espaço disponível
     */
    obterMaxItensParaEspacoDisponivel(espacoPorItem = 1) {
        if (!window.menuItensInventarioIntegration || !window.inventarioManager) {
            return 999; // Se integração não existe, retorna um número alto
        }
        
        const espacoLivre = window.inventarioManager.calcularEspacoLivre();
        return Math.floor(espacoLivre / espacoPorItem);
    }

    /**
     * Validar se pode comprar
     */
    validarCompra(itemId, quantidade = 1) {
        const item = buscarItemPorId(itemId);

        if (!item) {
            return { valido: false, motivo: 'Item não existe' };
        }

        if (!item.ativo) {
            return { valido: false, motivo: 'Item indisponível' };
        }

        const custoTotal = item.custo * quantidade;
        if (this.rokmas < custoTotal) {
            return {
                valido: false,
                motivo: 'Saldo insuficiente',
                faltam: custoTotal - this.rokmas,
                item: item
            };
        }

        return { valido: true };
    }

    /**
     * Executar compra
     */
    comprar(itemId, quantidade = 1) {
        console.log(`🛍️ [MenuItensSystem] Tentando comprar: ${itemId} (Qtd: ${quantidade})`);

        // Validar
        const validacao = this.validarCompra(itemId, quantidade);
        if (!validacao.valido) {
            console.warn(`❌ Compra rejeitada: ${validacao.motivo}`);
            window.dispatchEvent(new CustomEvent('menuItensCompraCancelada', {
                detail: validacao
            }));
            return false;
        }

        // Encontrar item
        const item = buscarItemPorId(itemId);

        // ═══════════════════════════════════════════════════════════
        // INTEGRAÇÃO COM INVENTÁRIO PRINCIPAL
        // ═══════════════════════════════════════════════════════════
        
        // Verificar se integração está disponível
        const temIntegracao = window.menuItensInventarioIntegration && 
                             window.inventarioManager;
        
        if (temIntegracao) {
            // Verificar espaço no inventário principal (para cada item)
            const espacoNecessario = (item.espaco || 1) * quantidade;
            if (!window.menuItensInventarioIntegration.temEspacoDisponivel(espacoNecessario)) {
                console.warn('❌ Espaço insuficiente no inventário principal');
                window.dispatchEvent(new CustomEvent('menuItensCompraCancelada', {
                    detail: {
                        valido: false,
                        motivo: 'Espaço insuficiente no inventário'
                    }
                }));
                return false;
            }

            // Adicionar ao inventário principal (com quantidade)
            const itemAdicionado = window.menuItensInventarioIntegration.adicionarItemComprado(item, quantidade);
            if (!itemAdicionado) {
                console.warn('❌ Falha ao adicionar item ao inventário principal');
                window.dispatchEvent(new CustomEvent('menuItensCompraCancelada', {
                    detail: {
                        valido: false,
                        motivo: 'Falha ao adicionar ao inventário'
                    }
                }));
                return false;
            }
        }

        // Debitar Rokmas (multiplicado pela quantidade)
        this.removerRokmas(item.custo * quantidade);

        // Adicionar ao inventário da loja
        if (!this.inventario[itemId]) {
            this.inventario[itemId] = 0;
        }
        this.inventario[itemId] += (item.unidade * quantidade);

        // Registrar no histórico
        this.historico.push({
            tipo: 'compra',
            itemId: itemId,
            itemNome: item.nome,
            quantidade: (item.unidade * quantidade),
            valor: item.custo * quantidade,
            timestamp: Date.now()
        });

        // Salvar
        this.salvar();

        console.log(`✅ [MenuItensSystem] Compra realizada!`);
        console.log(`   - Item: ${item.nome}`);
        console.log(`   - Quantidade: ${item.unidade * quantidade}`);
        console.log(`   - Custo: ${item.custo * quantidade} Rokmas`);
        console.log(`   - Novo saldo: ${this.rokmas} Rokmas`);
        if (temIntegracao) {
            console.log(`   - ✅ Adicionado ao inventário principal`);
        }

        // Notificar
        window.dispatchEvent(new CustomEvent('menuItensCompraRealizada', {
            detail: {
                item: item,
                quantidade: item.unidade * quantidade,
                saldoRestante: this.rokmas
            }
        }));

        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // 💸 SISTEMA DE VENDA
    // ═══════════════════════════════════════════════════════════

    /**
     * Obter quantidade no inventário
     */
    obterQuantidade(itemId) {
        return this.inventario[itemId] || 0;
    }

    /**
     * Validar se pode vender
     */
    validarVenda(itemId) {
        const item = buscarItemPorId(itemId);

        if (!item) {
            return { valido: false, motivo: 'Item não existe' };
        }

        const quantidade = this.obterQuantidade(itemId);
        if (quantidade <= 0) {
            return { valido: false, motivo: 'Não possui este item' };
        }

        return { valido: true };
    }

    /**
     * Executar venda (vender 1 unidade)
     */
    vender(itemId) {
        console.log(`💸 [MenuItensSystem] Tentando vender: ${itemId}`);

        // Validar
        const validacao = this.validarVenda(itemId);
        if (!validacao.valido) {
            console.warn(`❌ Venda rejeitada: ${validacao.motivo}`);
            window.dispatchEvent(new CustomEvent('menuItensVendaCancelada', {
                detail: validacao
            }));
            return false;
        }

        // Encontrar item
        const item = buscarItemPorId(itemId);

        // ═══════════════════════════════════════════════════════════
        // INTEGRAÇÃO COM INVENTÁRIO PRINCIPAL
        // ═══════════════════════════════════════════════════════════
        
        // Verificar se integração está disponível
        const temIntegracao = window.menuItensInventarioIntegration && 
                             window.inventarioManager;
        
        if (temIntegracao) {
            // Remover do inventário principal
            const removido = window.menuItensInventarioIntegration.removerItemVendido(itemId);
            if (!removido) {
                console.warn('⚠️  Item não encontrado no inventário principal, prosseguindo com venda na loja');
            }
        }

        // Remover do inventário da loja
        this.inventario[itemId]--;
        if (this.inventario[itemId] <= 0) {
            delete this.inventario[itemId];
        }

        // Adicionar Rokmas
        this.adicionarRokmas(item.valorVenda);

        // Registrar no histórico
        this.historico.push({
            tipo: 'venda',
            itemId: itemId,
            itemNome: item.nome,
            quantidade: 1,
            valor: item.valorVenda,
            timestamp: Date.now()
        });

        // Salvar
        this.salvar();

        console.log(`✅ [MenuItensSystem] Venda realizada!`);
        console.log(`   - Item: ${item.nome} (ID: ${itemId})`);
        console.log(`   - Valor: ${item.valorVenda} Rokmas`);
        console.log(`   - Novo saldo: ${this.rokmas} Rokmas`);
        if (temIntegracao) {
            console.log(`   - 🔗 Integração ativa - Removendo do inventário principal`);
            console.log(`      └─ menuItensInventarioIntegration:`, window.menuItensInventarioIntegration);
            console.log(`      └─ inventarioManager:`, window.inventarioManager);
        } else {
            console.warn(`   - ⚠️  Integração não disponível`);
        }

        // Notificar
        window.dispatchEvent(new CustomEvent('menuItensVendaRealizada', {
            detail: {
                item: item,
                valor: item.valorVenda,
                saldoAtual: this.rokmas
            }
        }));

        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // 📊 CONSULTAS E ESTATÍSTICAS
    // ═══════════════════════════════════════════════════════════

    /**
     * Obter lista de itens no inventário
     */
    obterInventario() {
        const itens = [];
        for (const itemId in this.inventario) {
            const item = buscarItemPorId(itemId);
            if (item) {
                itens.push({
                    ...item,
                    quantidadeNoInventario: this.inventario[itemId]
                });
            }
        }
        return itens;
    }

    /**
     * Contar itens únicos no inventário
     */
    contarItensUnicos() {
        return Object.keys(this.inventario).length;
    }

    /**
     * Contar quantidade total de itens
     */
    contarTotalItens() {
        return Object.values(this.inventario).reduce((sum, qty) => sum + qty, 0);
    }

    /**
     * Calcular valor total do inventário (preço de venda)
     */
    calcularValorInventario() {
        let total = 0;
        for (const itemId in this.inventario) {
            const item = buscarItemPorId(itemId);
            if (item) {
                total += item.valorVenda * this.inventario[itemId];
            }
        }
        return total;
    }

    // ═══════════════════════════════════════════════════════════
    // 🎮 EVENTOS
    // ═══════════════════════════════════════════════════════════

    /**
     * Setup de event listeners
     */
    setupEventos() {
        // Sincronizar quando página muda foco
        window.addEventListener('focus', () => {
            console.log('👁️ [MenuItensSystem] Página ganhou foco - sincronizando');
            this.carregar();
            window.dispatchEvent(new CustomEvent('menuItensAtualizado'));
        });

        // Sincronizar com outras abas
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('menu-itens-')) {
                console.log('🔄 [MenuItensSystem] localStorage alterado em outra aba');
                this.carregar();
                window.dispatchEvent(new CustomEvent('menuItensAtualizado'));
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 🔍 DEBUG
    // ═══════════════════════════════════════════════════════════

    /**
     * Exibir status completo no console
     */
    debug() {
        console.clear();
        console.log('═══════════════════════════════════════');
        console.log('🛒 SISTEMA DE ITENS - DEBUG');
        console.log('═══════════════════════════════════════\n');

        console.log('💰 ROKMAS:');
        console.log(`   Saldo: ${this.rokmas}`);

        console.log('\n📦 INVENTÁRIO:');
        if (Object.keys(this.inventario).length === 0) {
            console.log('   (vazio)');
        } else {
            for (const itemId in this.inventario) {
                const item = buscarItemPorId(itemId);
                const qty = this.inventario[itemId];
                console.log(`   ${item.nome}: ${qty}x`);
            }
        }

        console.log('\n📊 ESTATÍSTICAS:');
        console.log(`   Itens únicos: ${this.contarItensUnicos()}`);
        console.log(`   Total de itens: ${this.contarTotalItens()}`);
        console.log(`   Valor total: ${this.calcularValorInventario()} Rokmas`);

        console.log('\n📜 HISTÓRICO (últimas 5 transações):');
        const historicos = this.historico.slice(-5).reverse();
        if (historicos.length === 0) {
            console.log('   (nenhuma)');
        } else {
            historicos.forEach(h => {
                const tipo = h.tipo === 'compra' ? '🛍️' : '💸';
                console.log(`   ${tipo} ${h.itemNome} - ${h.valor} Rokmas`);
            });
        }

        console.log('\n═══════════════════════════════════════\n');
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.menuItensSystem = new MenuItensSystem();
        console.log('✅ Sistema de Itens disponível em: window.menuItensSystem');
    });
}
