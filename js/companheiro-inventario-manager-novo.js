/* ========================================== */
/* COMPANHEIRO-INVENTARIO-MANAGER.JS          */
/* Sistema de Inventário do Companheiro       */
/* ========================================== */

/**
 * CompanheiroInventarioManager
 * Gerenciador isolado de inventário para companheiro
 * 
 * Responsabilidades:
 * - Gerenciar estado de itens e armazenamentos do companheiro
 * - Calcular espaço baseado nos atributos do companheiro (NÃO do jogador)
 * - CRUD de itens do companheiro
 * - Persistência isolada em localStorage (chave: companheiroInventario)
 * - ZERO compartilhamento com o inventário principal
 * 
 * ⚠️ ISOLAMENTO TOTAL: companheiroData.atributos APENAS
 */

class CompanheiroInventarioManager {
    constructor() {
        // Referência aos dados do companheiro (com atributos)
        this.companheiroData = null;
        
        // Referência ao LocalStorageManager
        this.localStorageManager = null;
        
        // Estado interno ISOLADO
        this.companheiroInventario = {
            itens: [],
            armazenamentos: []
        };
        
        console.log('✅ CompanheiroInventarioManager inicializado');
    }

    /**
     * Inicializa o manager com as referências necessárias
     * @param {object} companheiroData - Dados do companheiro com atributos
     * @param {object} localStorageManager - Gerenciador de localStorage
     */
    init(companheiroData, localStorageManager) {
        this.companheiroData = companheiroData;
        this.localStorageManager = localStorageManager;
        
        // Carregar inventário persistido (COM ISOLAMENTO POR ID)
        this.loadInventario();
        
        console.log(`✅ CompanheiroInventarioManager configurado para "${companheiroData.nome}"`);
        console.log(`   📊 Resumo: ${this.companheiroInventario.itens.length} itens, ${this.companheiroInventario.armazenamentos.length} armazenamentos`);
        console.log(`   💰 Espaço: ${this.calcularEspacoTotal().toFixed(2)} total, ${this.calcularEspacoUsado().toFixed(2)} usado, ${this.calcularEspacoLivre().toFixed(2)} livre`);
    }

    // ===== CÁLCULOS DE ESPAÇO =====

    /**
     * Calcula espaço base do companheiro
     * Fórmula: (Força + Vitalidade) / 2 / 10
     * ⚠️ IMPORTANTE: 
     * - Tenta ler dos inputs do modal em tempo real (prioridade)
     * - Se não estiver no modal, usa companheiroData.atributos.forca.total
     * - Os atributos são salvos como {base, extra, total, bonus}
     */
    calcularEspacoBase() {
        if (!this.companheiroData || !this.companheiroData.atributos) {
            console.warn('⚠️ companheiroData não disponível');
            return 1.0;
        }

        // ✅ PRIORIDADE 1: Tentar ler dos inputs do modal em tempo real
        let forca = null;
        let vitalidade = null;

        const modalElement = document.getElementById('modalNovoCompanheiro');
        if (modalElement) {
            // Ler dos inputs de BASE e EXTRA
            const inputForcaBase = modalElement.querySelector('#comp-char-forca-base');
            const inputForcaExtra = modalElement.querySelector('#comp-char-forca-extra');
            const spanForcaTotal = modalElement.querySelector('#comp-char-forca-total');
            
            const inputVitalidadeBase = modalElement.querySelector('#comp-char-vitalidade-base');
            const inputVitalidadeExtra = modalElement.querySelector('#comp-char-vitalidade-extra');
            const spanVitalidadeTotal = modalElement.querySelector('#comp-char-vitalidade-total');

            // 🔍 DEBUG
            console.log(`🔍 [calcularEspacoBase] Força Base: ${inputForcaBase?.value}, Extra: ${inputForcaExtra?.value}, Total span: ${spanForcaTotal?.textContent}`);
            console.log(`🔍 [calcularEspacoBase] Vitalidade Base: ${inputVitalidadeBase?.value}, Extra: ${inputVitalidadeExtra?.value}, Total span: ${spanVitalidadeTotal?.textContent}`);

            if (spanForcaTotal && spanForcaTotal.textContent) {
                forca = parseInt(spanForcaTotal.textContent) || null;
            } else if (inputForcaBase && inputForcaExtra) {
                const base = parseInt(inputForcaBase.value) || 0;
                const extra = parseInt(inputForcaExtra.value) || 0;
                forca = base + extra;
            }

            if (spanVitalidadeTotal && spanVitalidadeTotal.textContent) {
                vitalidade = parseInt(spanVitalidadeTotal.textContent) || null;
            } else if (inputVitalidadeBase && inputVitalidadeExtra) {
                const base = parseInt(inputVitalidadeBase.value) || 0;
                const extra = parseInt(inputVitalidadeExtra.value) || 0;
                vitalidade = base + extra;
            }
        }

        // ✅ PRIORIDADE 2: Se não conseguiu do modal, usa companheiroData
        if (forca === null) {
            forca = this.companheiroData.atributos.forca?.total || 10;
            console.log(`🔍 [calcularEspacoBase] Força veio de companheiroData: ${forca}`);
        }
        if (vitalidade === null) {
            vitalidade = this.companheiroData.atributos.vitalidade?.total || 10;
            console.log(`🔍 [calcularEspacoBase] Vitalidade veio de companheiroData: ${vitalidade}`);
        }
        
        console.log(`📏 Espaço Base: Força(${forca}) + Vitalidade(${vitalidade}) = (${forca}+${vitalidade})/2/10 = ${((forca + vitalidade) / 2 / 10).toFixed(2)}`);
        
        const base = (forca + vitalidade) / 2 / 10;
        
        return parseFloat(base.toFixed(2));
    }

    /**
     * Calcula bônus total de armazenamentos
     */
    calcularBonusArmazenamentos() {
        return this.companheiroInventario.armazenamentos.reduce(
            (total, arm) => total + (arm.bonusEspaco || 0),
            0
        );
    }

    /**
     * Calcula espaço total disponível
     * Espaço Total = Base + Bônus Armazenamentos
     */
    calcularEspacoTotal() {
        const base = this.calcularEspacoBase();
        const bonus = this.calcularBonusArmazenamentos();
        return parseFloat((base + bonus).toFixed(2));
    }

    /**
     * Calcula espaço usado por itens não equipados
     */
    calcularEspacoUsado() {
        return this.companheiroInventario.itens.reduce((total, item) => {
            // Itens equipados NÃO contam para espaço
            if (item.equipado) return total;
            
            const espacoItem = item.quantidade * item.espaco;
            return total + espacoItem;
        }, 0);
    }

    /**
     * Calcula espaço livre
     */
    calcularEspacoLivre() {
        const total = this.calcularEspacoTotal();
        const usado = this.calcularEspacoUsado();
        return parseFloat((total - usado).toFixed(2));
    }

    /**
     * Verifica se está em sobrecarga
     */
    estaSobrecarga() {
        const usado = this.calcularEspacoUsado();
        const total = this.calcularEspacoTotal();
        return usado > total;
    }

    /**
     * Retorna resumo completo de espaço
     */
    obterResumoEspaco() {
        return {
            total: this.calcularEspacoTotal(),
            usado: this.calcularEspacoUsado(),
            livre: this.calcularEspacoLivre(),
            sobrecarga: this.estaSobrecarga()
        };
    }

    // ===== CRUD DE ITENS =====

    /**
     * Adiciona um novo item
     * @param {object} dadosItem - Dados do item (ver estrutura abaixo)
     * @returns {object|null} - Item criado ou null se falhar
     * 
     * Estrutura do item:
     * {
     *     nome: string,          // Obrigatório
     *     quantidade: number,    // Default: 1
     *     espaco: number,        // Default: 1.0
     *     qualidade: string,     // Default: 'comum'
     *     tipo: string,          // Default: ''
     *     nivel: number,         // Default: 1
     *     roll: string,          // Default: ''
     *     extra: string,         // Default: ''
     *     imagemURL: string,     // Default: ''
     *     habilidade: string,    // Default: ''
     *     historia: string,      // Default: ''
     *     equipado: boolean      // Default: false
     * }
     */
    adicionarItem(dadosItem) {
        // Validar dados
        if (!dadosItem || !dadosItem.nome) {
            console.warn('⚠️ Nome do item é obrigatório');
            return null;
        }

        // Verificar espaço
        const espacoNecessario = dadosItem.quantidade * dadosItem.espaco;
        const espacoLivre = this.calcularEspacoLivre();

        if (espacoNecessario > espacoLivre && !dadosItem.equipado) {
            console.warn('⚠️ Espaço insuficiente');
            return null;
        }

        // Criar item com UUID
        const item = {
            id: crypto.randomUUID(),
            nome: dadosItem.nome.trim(),
            quantidade: parseInt(dadosItem.quantidade) || 1,
            espaco: parseFloat(dadosItem.espaco) || 1.0,
            qualidade: dadosItem.qualidade || 'comum',
            tipo: dadosItem.tipo || '',
            nivel: parseInt(dadosItem.nivel) || 1,
            roll: dadosItem.roll || '',
            extra: dadosItem.extra || '',
            imagemURL: dadosItem.imagemURL || '',
            habilidade: dadosItem.habilidade || '',
            historia: dadosItem.historia || '',
            equipado: dadosItem.equipado || false,
            criadoEm: Date.now()
        };

        this.companheiroInventario.itens.push(item);
        this.saveInventario();
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Item adicionado:', item.nome);
        return item;
    }

    /**
     * Atualiza um item existente
     * @param {string} itemId - ID do item
     * @param {object} dadosAtualizacao - Dados a atualizar
     * @returns {boolean} - Sucesso ou falha
     */
    atualizarItem(itemId, dadosAtualizacao) {
        const item = this.companheiroInventario.itens.find(i => i.id === itemId);
        
        if (!item) {
            console.warn('⚠️ Item não encontrado:', itemId);
            return false;
        }

        // Verificar espaço se quantidade/espaco mudou
        if (dadosAtualizacao.quantidade || dadosAtualizacao.espaco) {
            const novaQtd = dadosAtualizacao.quantidade || item.quantidade;
            const novoEspaco = dadosAtualizacao.espaco || item.espaco;
            const espacoAntigo = item.quantidade * item.espaco;
            const espacoNovo = novaQtd * novoEspaco;
            const diferenca = espacoNovo - espacoAntigo;

            if (diferenca > 0 && !dadosAtualizacao.equipado && !item.equipado) {
                const espacoLivre = this.calcularEspacoLivre();
                if (diferenca > espacoLivre) {
                    console.warn('⚠️ Espaço insuficiente para atualização');
                    return false;
                }
            }
        }

        // Atualizar apenas campos fornecidos
        Object.assign(item, dadosAtualizacao);
        this.saveInventario();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Item atualizado:', itemId);
        return true;
    }

    /**
     * Deleta um item
     * @param {string} itemId - ID do item
     * @returns {boolean} - Sucesso ou falha
     */
    deletarItem(itemId) {
        const index = this.companheiroInventario.itens.findIndex(i => i.id === itemId);
        
        if (index === -1) {
            console.warn('⚠️ Item não encontrado:', itemId);
            return false;
        }

        const item = this.companheiroInventario.itens[index];
        this.companheiroInventario.itens.splice(index, 1);
        this.saveInventario();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Item deletado:', item.nome);
        return true;
    }

    /**
     * Obtém um item por ID
     */
    obterItem(itemId) {
        return this.companheiroInventario.itens.find(i => i.id === itemId) || null;
    }

    /**
     * Obtém todos os itens
     */
    obterItens() {
        return [...this.companheiroInventario.itens];
    }

    // ===== CRUD DE ARMAZENAMENTOS =====

    /**
     * Adiciona um armazenamento
     */
    adicionarArmazenamento(dados) {
        if (!dados || !dados.nome) {
            console.warn('⚠️ Nome do armazenamento é obrigatório');
            return null;
        }

        const armazenamento = {
            id: crypto.randomUUID(),
            nome: dados.nome.trim(),
            bonusEspaco: parseFloat(dados.bonusEspaco) || 0,
            descricao: dados.descricao || '',
            imagemURL: dados.imagemURL || '',
            criadoEm: Date.now()
        };

        this.companheiroInventario.armazenamentos.push(armazenamento);
        this.saveInventario();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Armazenamento adicionado:', armazenamento.nome);
        return armazenamento;
    }

    /**
     * Atualiza um armazenamento
     */
    atualizarArmazenamento(armId, dados) {
        const arm = this.companheiroInventario.armazenamentos.find(a => a.id === armId);
        
        if (!arm) {
            console.warn('⚠️ Armazenamento não encontrado:', armId);
            return false;
        }

        Object.assign(arm, dados);
        this.saveInventario();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Armazenamento atualizado:', armId);
        return true;
    }

    /**
     * Deleta um armazenamento
     */
    deletarArmazenamento(armId) {
        const index = this.companheiroInventario.armazenamentos.findIndex(a => a.id === armId);
        
        if (index === -1) {
            console.warn('⚠️ Armazenamento não encontrado:', armId);
            return false;
        }

        const arm = this.companheiroInventario.armazenamentos[index];
        this.companheiroInventario.armazenamentos.splice(index, 1);
        this.saveInventario();

        // Disparar evento
        window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        }));

        console.log('✅ Armazenamento deletado:', arm.nome);
        return true;
    }

    /**
     * Obtém todos os armazenamentos
     */
    obterArmazenamentos() {
        return [...this.companheiroInventario.armazenamentos];
    }

    /**
     * Obtém um armazenamento específico pelo ID
     */
    obterArmazenamento(armazenamentoId) {
        return this.companheiroInventario.armazenamentos.find(arm => arm.id === armazenamentoId);
    }

    /**
     * Alterna o estado equipado/desequipado de um item
     */
    alternarEquipado(itemId) {
        const item = this.companheiroInventario.itens.find(i => i.id === itemId);
        if (item) {
            item.equipado = !item.equipado;
            this.saveInventario();
            window.dispatchEvent(new CustomEvent('companheiroInventarioEspacoAlterado'));
        }
    }

    // ===== PERSISTÊNCIA =====

    /**
     * Salva inventário em localStorage
     * Chave ISOLADA por companheiro: companheiroInventario_${id}
     * Cada companheiro tem seu próprio storage
     */
    saveInventario() {
        try {
            if (!this.companheiroData || !this.companheiroData.id) {
                console.warn('⚠️ ID do companheiro não disponível para salvar');
                return;
            }

            const chave = `companheiroInventario_${this.companheiroData.id}`;
            const dados = JSON.stringify(this.companheiroInventario);
            
            try {
                localStorage.setItem(chave, dados);
                console.log(`💾 Inventário do companheiro ${this.companheiroData.nome} salvo (chave: ${chave})`);
            } catch (quotaError) {
                // Se falhar por quota, tentar limpar dados antigos
                if (quotaError.name === 'QuotaExceededError') {
                    console.warn('⚠️ localStorage lotado! Tentando limpeza de dados antigos...');
                    this.limparDadosAntigos();
                    
                    // Tentar salvar novamente
                    try {
                        localStorage.setItem(chave, dados);
                        console.log(`💾 Inventário salvo após limpeza`);
                    } catch (e) {
                        console.error('❌ Erro mesmo após limpeza:', e);
                        alert('⚠️ Espaço de armazenamento cheio. Por favor, limpe o cache do navegador.');
                        throw e;
                    }
                } else {
                    throw quotaError;
                }
            }
        } catch (erro) {
            console.error('❌ Erro ao salvar inventário:', erro);
        }
    }

    /**
     * Limpar dados antigos/desnecessários do localStorage
     */
    limparDadosAntigos() {
        console.log('🧹 [limparDadosAntigos] Iniciando limpeza...');
        
        // Lista de chaves que são conhecidas como debug/temp e podem ser removidas
        const chavesToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            // Remover chaves de debug/estado temporário
            if (chave && (
                chave.includes('debug') ||
                chave.includes('temp') ||
                chave.includes('teste') ||
                chave.includes('backup')
            )) {
                chavesToRemove.push(chave);
            }
        }
        
        // Remover as chaves identificadas
        chavesToRemove.forEach(chave => {
            try {
                const tamanho = (localStorage.getItem(chave) || '').length;
                localStorage.removeItem(chave);
                console.log(`   ✅ Removida: ${chave} (${tamanho} bytes)`);
            } catch (e) {
                console.warn(`   ⚠️ Erro ao remover ${chave}:`, e);
            }
        });
        
        console.log(`✅ Limpeza concluída. ${chavesToRemove.length} chaves removidas.`);
    }

    /**
     * Carrega inventário do localStorage
     * Busca com chave isolada: companheiroInventario_${id}
     */
    loadInventario() {
        try {
            if (!this.companheiroData || !this.companheiroData.id) {
                console.warn('⚠️ ID do companheiro não disponível para carregar');
                this.companheiroInventario = {
                    itens: [],
                    armazenamentos: []
                };
                return;
            }

            const chave = `companheiroInventario_${this.companheiroData.id}`;
            const dados = localStorage.getItem(chave);
            
            if (dados) {
                this.companheiroInventario = JSON.parse(dados);
                console.log(`📖 Inventário do companheiro ${this.companheiroData.nome} carregado (${this.companheiroInventario.itens.length} itens, ${this.companheiroInventario.armazenamentos.length} armazenamentos)`);
            } else {
                this.companheiroInventario = {
                    itens: [],
                    armazenamentos: []
                };
                console.log(`📦 Novo inventário criado para companheiro ${this.companheiroData.nome}`);
            }
        } catch (erro) {
            console.error('❌ Erro ao carregar inventário:', erro);
            this.companheiroInventario = {
                itens: [],
                armazenamentos: []
            };
        }
    }
}

// Instância global
window.companheiroInventarioManager = new CompanheiroInventarioManager();
