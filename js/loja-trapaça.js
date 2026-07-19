/**
 * LOJA DA TRAPAÇA - SISTEMA COMPLETO
 * 
 * Responsabilidades:
 * - Gerenciar compras com validação de saldo
 * - Rastrear efeitos ativos
 * - Controlar limites por categoria
 * - Sincronizar com Fortuna Atual
 * - Manter persistência em localStorage
 */

class LojaTrapaça {
    constructor() {
        console.log('🏪 [LojaTrapaça] Inicializando sistema...');

        // Dados da loja
        this.items = LOJA_ITEMS;
        this.config = LOJA_CONFIG;

        // Estado
        this.saldoAtual = 0;
        this.compras = this.carregarCompras();
        this.efeitosAtivos = this.carregarEfeitosAtivos();

        // Cache de elementos
        this.elementos = {};

        this.inicializar();
    }

    /**
     * Inicialização
     */
    inicializar() {
        this.sincronizarComFortuna();
        this.setupEventos();
        console.log('✅ [LojaTrapaça] Sistema iniciado');
    }

    /**
     * SEÇÃO 1: SINCRONIZAÇÃO COM FORTUNA
     */
    sincronizarComFortuna() {
        try {
            // Obter Fortuna Atual do localStorage
            const fortuna = localStorage.getItem('redungeon_fortuna_atual');
            this.saldoAtual = fortuna ? parseInt(fortuna) : 0;

            console.log(`💰 [LojaTrapaça] Saldo sincronizado: ${this.saldoAtual} Ȼ`);

            // Atualizar UI imediatamente após sincronização
            setTimeout(() => this.atualizarSaldoUI(), 100);

            // Listener para mudanças de Fortuna - MAIS IMPORTANTE
            // Este listener tem prioridade pois vem do evento de rolagem
            window.addEventListener('fortunaRolada', (e) => {
                if (e.detail && e.detail.fortunaAtual !== undefined) {
                    this.saldoAtual = e.detail.fortunaAtual;
                    console.log(`💰 [LojaTrapaça] Fortuna atualizada via evento: ${this.saldoAtual} Ȼ`);
                    // Atualizar localStorage também - GARANTIR QUE É STRING
                    localStorage.setItem('redungeon_fortuna_atual', String(this.saldoAtual));
                    this.atualizarSaldoUI();
                }
            });

            // Listener para mudanças externas de Fortuna (fallback)
            window.addEventListener('storage', (e) => {
                if (e.key === 'redungeon_fortuna_atual') {
                    this.saldoAtual = parseInt(e.newValue) || 0;
                    console.log(`💰 [LojaTrapaça] Saldo atualizado via storage: ${this.saldoAtual} Ȼ`);
                    this.atualizarSaldoUI();
                }
            });

        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao sincronizar com Fortuna:', error);
        }
    }

    /**
     * SEÇÃO 2: VALIDAÇÃO E COMPRA
     */
    validarCompra(itemId) {
        try {
            console.log(`🛍️ [LojaTrapaça] Validando compra de: ${itemId}`);
            console.log(`   - Saldo atual: ${this.saldoAtual} (tipo: ${typeof this.saldoAtual})`);
            
            // Encontrar item
            const item = this.encontrarItem(itemId);
            if (!item) {
                console.warn(`⚠️ [LojaTrapaça] Item ${itemId} não encontrado`);
                return { valido: false, motivo: 'Item não existe' };
            }

            console.log(`   - Item encontrado: ${item.nome}`);
            console.log(`   - Custo do item: ${item.custo} (tipo: ${typeof item.custo})`);

            // ⭐ ÚNICA VALIDAÇÃO: Saldo
            const temSaldo = this.saldoAtual >= item.custo;
            console.log(`   - Validação (Saldo): ${this.saldoAtual} >= ${item.custo} = ${temSaldo}`);
            
            if (!temSaldo) {
                console.warn(`⚠️ [LojaTrapaça] Saldo insuficiente: ${this.saldoAtual} < ${item.custo}`);
                return { valido: false, motivo: 'Saldo insuficiente' };
            }

            console.log(`✅ [LojaTrapaça] Validação OK - Compra permitida!`);
            return { valido: true, motivo: null };

        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao validar compra:', error);
            return { valido: false, motivo: 'Erro no sistema' };
        }
    }

    executarCompra(itemId) {
        try {
            console.log(`🛍️ [LojaTrapaça] Tentando comprar: ${itemId}`);

            // Validar
            const validacao = this.validarCompra(itemId);
            if (!validacao.valido) {
                console.warn(`❌ Compra rejeitada: ${validacao.motivo}`);
                
                // Se for saldo insuficiente, mostrar popup especial
                if (validacao.motivo === 'Saldo insuficiente') {
                    const item = this.encontrarItem(itemId);
                    if (item) {
                        this.mostrarSaldoInsuficiente(item.nome, item.custo);
                    }
                } else {
                    // Para outros erros, mensagem simples
                    this.mostrarMensagem(`❌ ${validacao.motivo}`, 'erro');
                }
                
                return false;
            }

            // Encontrar item
            const item = this.encontrarItem(itemId);

            // Subtrair do saldo
            this.saldoAtual -= item.custo;
            this.salvarSaldoNoStorage();

            // Registrar compra
            this.registrarCompra(item);

            // Aplicar efeito conforme tipo
            this.aplicarEfeito(item);

            // Atualizar UI
            this.atualizarSaldoUI();

            console.log(`✅ [LojaTrapaça] Compra realizada! Novo saldo: ${this.saldoAtual}`);
            this.mostrarMensagem(`✅ ${item.nome} comprado por ${item.custo}Ȼ!`, 'sucesso');

            // Disparar evento
            window.dispatchEvent(new CustomEvent('lojaCompra', {
                detail: {
                    item: item,
                    saldoRestante: this.saldoAtual
                }
            }));

            return true;

        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao executar compra:', error);
            return false;
        }
    }

    /**
     * SEÇÃO 3: APLICAÇÃO DE EFEITOS
     */
    aplicarEfeito(item) {
        try {
            console.log(`⚡ [LojaTrapaça] Aplicando efeito: ${item.nome}`);

            switch (item.ativacao) {
                case 'imediata':
                    this.ativarImediato(item);
                    break;
                case 'manual':
                    this.adicionarAoInventarioDeEfeitos(item);
                    break;
                default:
                    console.warn(`⚠️ [LojaTrapaça] Tipo de ativação desconhecido: ${item.ativacao}`);
            }

        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao aplicar efeito:', error);
        }
    }

    ativarImediato(item) {
        console.log(`✨ [LojaTrapaça] Ativando imediatamente: ${item.nome}`);

        // Criar registro de efeito
        const efeito = {
            id: item.id,
            nome: item.nome,
            tipo: 'instantaneo',
            dataAtivacao: new Date().toISOString(),
            categoria: item.categoria,
            descricao: item.efeito
        };

        // Adicionar ao histórico
        this.efeitosAtivos.push(efeito);
        this.salvarEfeitosNoStorage();

        // Mostrar confirmação
        this.mostrarEfeitoAplicado(item);
    }

    adicionarAoInventarioDeEfeitos(item) {
        console.log(`📦 [LojaTrapaça] Adicionando ao inventário: ${item.nome}`);

        // Criar registro de efeito
        const efeito = {
            id: item.id,
            nome: item.nome,
            tipo: 'armazenavel',
            dataCompra: new Date().toISOString(),
            categoria: item.categoria,
            descricao: item.efeito,
            ativo: false,
            dataUso: null
        };

        // Adicionar ao inventário de efeitos
        this.efeitosAtivos.push(efeito);
        this.salvarEfeitosNoStorage();

        // Mostrar confirmação
        this.mostrarEfeitoArmazenado(item);
    }

    /**
     * SEÇÃO 4: CARREGAMENTO E PERSISTÊNCIA
     */
    carregarCompras() {
        try {
            const compras = localStorage.getItem(this.config.armazenamento.compras);
            return compras ? JSON.parse(compras) : [];
        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao carregar compras:', error);
            return [];
        }
    }

    carregarEfeitosAtivos() {
        try {
            const chave = 'loja-trapaça-efeitos-ativos';
            const efeitos = localStorage.getItem(chave);
            return efeitos ? JSON.parse(efeitos) : [];
        } catch (error) {
            console.error('❌ [LojaTrapaça] Erro ao carregar efeitos:', error);
            return [];
        }
    }

    registrarCompra(item) {
        const registro = {
            itemId: item.id,
            nome: item.nome,
            custo: item.custo,
            categoria: item.categoria,
            dataPurchase: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.compras.push(registro);
        localStorage.setItem(this.config.armazenamento.compras, JSON.stringify(this.compras));
    }

    salvarSaldoNoStorage() {
        localStorage.setItem(this.config.armazenamento.saldo, this.saldoAtual);
    }

    salvarEfeitosNoStorage() {
        localStorage.setItem('loja-trapaça-efeitos-ativos', JSON.stringify(this.efeitosAtivos));
    }

    /**
     * SEÇÃO 5: VALIDAÇÕES E VERIFICAÇÕES
     */
    encontrarItem(itemId) {
        for (const categoria in this.items) {
            const items = this.items[categoria];
            const item = items.find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    obterLimiteDaCategoria(categoria) {
        switch (categoria) {
            case 'beneficios_menores':
                return 'ilimitado';
            case 'vantagens_taticas':
                return 2;
            case 'efeitos_avancados':
                return 1;
            case 'bencaos_unicas':
                return 1;
            default:
                return 'ilimitado';
        }
    }

    contarEfeitosAtivos(categoria) {
        return this.efeitosAtivos.filter(e => e.categoria === categoria && !e.ativo).length;
    }

    verificarLimiteDiario(itemId) {
        const hoje = new Date().toDateString();
        return this.compras.some(c => 
            c.itemId === itemId && 
            new Date(c.dataPurchase).toDateString() === hoje
        );
    }

    /**
     * SEÇÃO 6: INTERFACE E UI
     */
    atualizarSaldoUI() {
        // Atualizar saldo no Sistema de Fortuna
        const elementoFortuna = document.getElementById('fortuna-atual-value');
        if (elementoFortuna) {
            elementoFortuna.textContent = this.saldoAtual;
        }

        // Atualizar saldo DENTRO da Loja da Trapaça
        const elementoLojaTrapaça = document.querySelector('.loja-trapaça-saldo-valor');
        if (elementoLojaTrapaça) {
            elementoLojaTrapaça.textContent = this.saldoAtual;
        }
    }

    mostrarMensagem(texto, tipo) {
        if (this.ui) {
            this.ui.mostrarMensagem(texto, tipo);
        } else {
            console.log(`ℹ️ [LojaTrapaça] ${texto}`);
        }
    }

    /**
     * Mostrar popup específico para saldo insuficiente
     */
    mostrarSaldoInsuficiente(itemNome, custo) {
        console.log(`🚨 [LojaTrapaça] SALDO INSUFICIENTE DETECTADO!`);
        console.log(`   - Item: ${itemNome}`);
        console.log(`   - Custo: ${custo}`);
        console.log(`   - Saldo atual: ${this.saldoAtual}`);
        console.log(`   - UI disponível? ${!!this.ui}`);
        
        if (this.ui) {
            console.log(`   ✅ Chamando mostrarPopupSaldoInsuficiente...`);
            this.ui.mostrarPopupSaldoInsuficiente(itemNome, this.saldoAtual, custo);
        } else {
            console.error(`   ❌ UI não disponível!`);
            // Fallback: criar popup simples
            alert(`⚠️ Saldo Insuficiente!\n\n${itemNome} custa ${custo}Ȼ\nVocê tem: ${this.saldoAtual}Ȼ\nFaltam: ${custo - this.saldoAtual}Ȼ`);
        }
    }

    mostrarEfeitoAplicado(item) {
        console.log(`✨ [LojaTrapaça] Efeito aplicado: ${item.nome}`);
        console.log(`   Descrição: ${item.efeito}`);
    }

    mostrarEfeitoArmazenado(item) {
        console.log(`📦 [LojaTrapaça] Efeito armazenado: ${item.nome}`);
        console.log(`   Guardado para usar quando desejar`);
    }

    /**
     * SEÇÃO 7: SETUP DE EVENTOS
     */
    setupEventos() {
        // Listener para botão de compra
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-comprar-loja')) {
                const itemId = e.target.dataset.itemId;
                this.executarCompra(itemId);
            }
        });

        console.log('✅ [LojaTrapaça] Eventos configurados');
    }

    /**
     * FUNÇÃO DE DEBUG - Força sincronização
     */
    forcarSincronizacao() {
        console.clear();
        console.log('🔧 [LojaTrapaça] FORÇANDO SINCRONIZAÇÃO COMPLETA...\n');
        
        // Ler do localStorage
        const valor = localStorage.getItem('redungeon_fortuna_atual');
        console.log('📋 Dados no localStorage:');
        console.log('   - Chave: redungeon_fortuna_atual');
        console.log('   - Valor bruto: ' + valor);
        console.log('   - Tipo: ' + typeof valor);
        
        // Converter e sincronizar
        if (valor !== null) {
            const numerico = parseInt(valor, 10);
            console.log('\n✨ Conversão:');
            console.log('   - parseInt(valor, 10): ' + numerico);
            console.log('   - isNaN? ' + isNaN(numerico));
            
            this.saldoAtual = numerico;
            console.log('   - Saldo da Loja atualizado: ' + this.saldoAtual);
        }
        
        // Status
        console.log('\n📊 Status Final:');
        console.log('   - Saldo Atual: ' + this.saldoAtual + ' Ȼ');
        console.log('   - Tipo: ' + typeof this.saldoAtual);
        
        // Atualizar UI
        this.atualizarSaldoUI();
        if (this.ui) {
            this.ui.atualizar();
        }
        
        console.log('\n✅ Sincronização concluída!');
    }
}

// Criar instância global
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.lojaTrapaça = new LojaTrapaça();
        console.log('🏪 [LojaTrapaça] Pronto para compras!');
        console.log('💡 Dica: Use window.lojaTrapaça.forcarSincronizacao() para debug');
    });
}