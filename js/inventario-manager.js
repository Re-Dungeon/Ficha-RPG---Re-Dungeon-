/* ========================================== */
/* INVENTARIO-MANAGER.JS                      */
/* Sistema Modular de Inventário              */
/* ========================================== */

/**
 * InventarioManager
 * Gerenciador centralizado de inventário
 * 
 * Responsabilidades:
 * - Gerenciar estado de itens e armazenamentos
 * - Calcular espaço (integrado com atributos)
 * - CRUD de itens
 * - Sincronização com atributos
 * - Persistência integrada
 */

class InventarioManager {
    constructor() {
        // Referência ao AtributosManager para ler Força/Vitalidade
        this.atributosManager = null;
        
        // Referência ao LocalStorageManager
        this.localStorageManager = null;
        
        // Estado interno - integrado ao character
        this.inventario = {
            itens: [],
            armazenamentos: []
        };
        
        console.log('✅ InventarioManager inicializado');
    }

    /**
     * Inicializa o manager com as referências necessárias
     */
    init(atributosManager, localStorageManager) {
        this.atributosManager = atributosManager;
        this.localStorageManager = localStorageManager;
        
        // Carregar inventário persistido
        this.loadInventario();
        
        console.log('✅ InventarioManager configurado com dependências');
    }

    // ===== PERSISTÊNCIA =====

    /**
     * Carrega inventário do localStorage
     * Se não existir, cria estrutura padrão
     */
    loadInventario() {
        try {
            if (!this.localStorageManager) {
                console.warn('⚠️  LocalStorageManager não disponível');
                return;
            }

            // Carregar inventário da chave 'inventario'
            const inventarioSalvo = this.localStorageManager.load('inventario', null);
            
            if (inventarioSalvo && inventarioSalvo.itens && inventarioSalvo.armazenamentos) {
                this.inventario = inventarioSalvo;
                console.log('📂 Inventário carregado do localStorage:', this.inventario);
            } else {
                console.log('ℹ️  Nenhum inventário persistido, usando estrutura padrão');
                this.inventario = {
                    itens: [],
                    armazenamentos: []
                };
                this.saveInventario();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar inventário:', error);
            this.inventario = {
                itens: [],
                armazenamentos: []
            };
        }
    }

    /**
     * Salva inventário no localStorage
     */
    saveInventario() {
        try {
            if (!this.localStorageManager) {
                console.warn('⚠️  LocalStorageManager não disponível');
                return false;
            }

            this.localStorageManager.save('inventario', this.inventario);
            console.log('💾 Inventário salvo no localStorage');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar inventário:', error);
            return false;
        }
    }

    // ===== CÁLCULOS DE ESPAÇO =====

    /**
     * Calcula espaço base do inventário
     * Fórmula: (Força + Vitalidade) / 2 / 10
     * @returns {number} Espaço base
     */
    calcularEspacoBase() {
        if (!this.atributosManager) {
            console.warn('⚠️  AtributosManager não disponível');
            return 0;
        }

        try {
            // Ler valores de Força e Vitalidade do AtributosManager
            const forca = this.atributosManager.personagemData.atributos.forca || 0;
            const vitalidade = this.atributosManager.personagemData.atributos.vitalidade || 0;
            
            const espacoBase = (forca + vitalidade) / 2 / 10;
            
            console.log(`📏 Espaço Base: (${forca} + ${vitalidade}) / 2 / 10 = ${espacoBase}`);
            
            return espacoBase;
        } catch (error) {
            console.error('❌ Erro ao calcular espaço base:', error);
            return 0;
        }
    }

    /**
     * Calcula bônus de espaço dos armazenamentos
     * @returns {number} Soma dos bônus de espaço
     */
    calcularBonusArmazenamentos() {
        const bonus = this.inventario.armazenamentos.reduce((total, arm) => {
            return total + (arm.bonusEspaco || 0);
        }, 0);
        
        console.log(`📦 Bônus Armazenamentos: ${bonus}`);
        
        return bonus;
    }

    /**
     * Calcula espaço total disponível
     * @returns {number} Espaço total = base + bônus
     */
    calcularEspacoTotal() {
        const espacoBase = this.calcularEspacoBase();
        const bonusArmazenamentos = this.calcularBonusArmazenamentos();
        const espacoTotal = espacoBase + bonusArmazenamentos;
        
        console.log(`🎯 Espaço Total: ${espacoBase} + ${bonusArmazenamentos} = ${espacoTotal}`);
        
        return espacoTotal;
    }

    /**
     * Calcula espaço usado por itens não equipados
     * @returns {number} Espaço usado
     */
    calcularEspacoUsado() {
        const espacoUsado = this.inventario.itens
            .filter(item => !item.equipado)
            .reduce((total, item) => {
                return total + (item.espaco * item.quantidade);
            }, 0);
        
        console.log(`📊 Espaço Usado: ${espacoUsado}`);
        
        return espacoUsado;
    }

    /**
     * Calcula espaço livre
     * @returns {number} Espaço livre disponível
     */
    calcularEspacoLivre() {
        const espacoTotal = this.calcularEspacoTotal();
        const espacoUsado = this.calcularEspacoUsado();
        const espacoLivre = Math.max(0, espacoTotal - espacoUsado);
        
        console.log(`✨ Espaço Livre: ${espacoTotal} - ${espacoUsado} = ${espacoLivre}`);
        
        return espacoLivre;
    }

    /**
     * Verifica se inventário está cheio
     * @returns {boolean} true se sobrecarga
     */
    estaSobrecarga() {
        return this.calcularEspacoUsado() > this.calcularEspacoTotal();
    }

    /**
     * Obtém resumo de espaço
     * @returns {object} { total, usado, livre, sobrecarga }
     */
    obterResumoEspaco() {
        return {
            total: this.calcularEspacoTotal(),
            usado: this.calcularEspacoUsado(),
            livre: this.calcularEspacoLivre(),
            sobrecarga: this.estaSobrecarga()
        };
    }

    // ===== OPERAÇÕES COM ITENS =====

    /**
     * Adiciona novo item ao inventário
     * @param {object} dadosItem - { nome, quantidade, espaco, dado, descricao, equipado }
     * @returns {object|null} Item criado ou null se erro
     */
    adicionarItem(dadosItem) {
        try {
            // Validar dados obrigatórios
            if (!dadosItem.nome || !dadosItem.nome.trim()) {
                console.error('❌ Nome do item é obrigatório');
                return null;
            }

            // Verificar espaço disponível (itens não equipados contam)
            const espacoNecessario = (dadosItem.espaco || 0) * (dadosItem.quantidade || 1);
            const espacoLivre = this.calcularEspacoLivre();
            
            if (espacoNecessario > espacoLivre && !dadosItem.equipado) {
                console.warn('⚠️  Espaço insuficiente para este item');
                return null;
            }

            // Criar novo item com UUID
            const novoItem = {
                id: crypto.randomUUID(),
                nome: dadosItem.nome.trim(),
                quantidade: Math.max(1, dadosItem.quantidade || 1),
                espaco: Math.max(0.1, dadosItem.espaco || 1.0),
                qualidade: dadosItem.qualidade || 'comum',
                tipo: dadosItem.tipo || '',
                nivel: dadosItem.nivel || 1,
                roll: dadosItem.roll || '',
                extra: dadosItem.extra || '',
                imagemURL: dadosItem.imagemURL || '',
                habilidade: dadosItem.habilidade || '',
                historia: dadosItem.historia || '',
                equipado: dadosItem.equipado || false,
                criadoEm: Date.now()
            };

            this.inventario.itens.push(novoItem);
            this.saveInventario();
            
            console.log('✅ Item adicionado:', novoItem);
            
            return novoItem;
        } catch (error) {
            console.error('❌ Erro ao adicionar item:', error);
            return null;
        }
    }

    /**
     * Atualiza um item existente
     * @param {string} itemId - ID do item
     * @param {object} dadosAtualizacao - Dados a atualizar
     * @returns {boolean} true se sucesso
     */
    atualizarItem(itemId, dadosAtualizacao) {
        try {
            const item = this.inventario.itens.find(i => i.id === itemId);
            
            if (!item) {
                console.error(`❌ Item com ID ${itemId} não encontrado`);
                return false;
            }

            // Atualizar apenas campos fornecidos
            if (dadosAtualizacao.nome !== undefined) {
                item.nome = dadosAtualizacao.nome.trim();
            }
            if (dadosAtualizacao.quantidade !== undefined) {
                item.quantidade = Math.max(1, dadosAtualizacao.quantidade);
            }
            if (dadosAtualizacao.espaco !== undefined) {
                item.espaco = Math.max(0.1, dadosAtualizacao.espaco);
            }
            if (dadosAtualizacao.qualidade !== undefined) {
                item.qualidade = dadosAtualizacao.qualidade;
            }
            if (dadosAtualizacao.tipo !== undefined) {
                item.tipo = dadosAtualizacao.tipo;
            }
            if (dadosAtualizacao.nivel !== undefined) {
                item.nivel = dadosAtualizacao.nivel;
            }
            if (dadosAtualizacao.roll !== undefined) {
                item.roll = dadosAtualizacao.roll;
            }
            if (dadosAtualizacao.extra !== undefined) {
                item.extra = dadosAtualizacao.extra;
            }
            if (dadosAtualizacao.imagemURL !== undefined) {
                item.imagemURL = dadosAtualizacao.imagemURL;
            }
            if (dadosAtualizacao.habilidade !== undefined) {
                item.habilidade = dadosAtualizacao.habilidade;
            }
            if (dadosAtualizacao.historia !== undefined) {
                item.historia = dadosAtualizacao.historia;
            }
            if (dadosAtualizacao.equipado !== undefined) {
                item.equipado = Boolean(dadosAtualizacao.equipado);
            }

            this.saveInventario();
            
            console.log('✅ Item atualizado:', item);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar item:', error);
            return false;
        }
    }

    /**
     * Remove um item do inventário
     * @param {string} itemId - ID do item
     * @returns {boolean} true se sucesso
     */
    removerItem(itemId) {
        try {
            console.log(`   🔍 [InventarioManager] Procurando item com ID: ${itemId}`);
            const indice = this.inventario.itens.findIndex(i => i.id === itemId);
            
            if (indice === -1) {
                console.error(`   ❌ [InventarioManager] Item com ID ${itemId} não encontrado`);
                console.error(`       Total de itens: ${this.inventario.itens.length}`);
                return false;
            }

            console.log(`   ✅ [InventarioManager] Item encontrado no índice ${indice}`);
            const itemRemovido = this.inventario.itens.splice(indice, 1);
            console.log(`   💾 [InventarioManager] Salvando inventário...`);
            this.saveInventario();
            console.log(`   ✅ [InventarioManager] Item removido: ${itemRemovido[0].nome}`);
            
            return true;
        } catch (error) {
            console.error(`   ❌ [InventarioManager] Erro ao remover item:`, error);
            return false;
        }
    }

    /**
     * Obtém todos os itens
     * @returns {array} Array de itens
     */
    obterItens() {
        return [...this.inventario.itens];
    }

    /**
     * Obtém item por ID
     * @param {string} itemId - ID do item
     * @returns {object|null} Item ou null
     */
    obterItem(itemId) {
        return this.inventario.itens.find(i => i.id === itemId) || null;
    }

    // ===== OPERAÇÕES COM ARMAZENAMENTOS =====

    /**
     * Adiciona novo armazenamento
     * @param {object} dadosArmazenamento - { nome, bonusEspaco, descricao }
     * @returns {object|null} Armazenamento criado ou null
     */
    adicionarArmazenamento(dadosArmazenamento) {
        try {
            // Validar nome
            const nome = (dadosArmazenamento.nome || '').toString().trim();
            if (!nome) {
                console.error('❌ Nome do armazenamento é obrigatório');
                return null;
            }

            const novoArmazenamento = {
                id: crypto.randomUUID(),
                nome: nome,
                bonusEspaco: Math.max(0, parseFloat(dadosArmazenamento.bonusEspaco) || 0),
                descricao: (dadosArmazenamento.descricao || '').toString().trim(),
                imagemURL: (dadosArmazenamento.imagemURL || '').toString().trim(),
                criadoEm: Date.now()
            };

            this.inventario.armazenamentos.push(novoArmazenamento);
            this.saveInventario();
            
            console.log('✅ Armazenamento adicionado:', novoArmazenamento);
            
            return novoArmazenamento;
        } catch (error) {
            console.error('❌ Erro ao adicionar armazenamento:', error);
            return null;
        }
    }

    /**
     * Atualiza um armazenamento existente
     * @param {string} armazenamentoId - ID do armazenamento
     * @param {object} dadosAtualizacao - Dados a atualizar
     * @returns {boolean} true se sucesso
     */
    atualizarArmazenamento(armazenamentoId, dadosAtualizacao) {
        try {
            const armazenamento = this.inventario.armazenamentos.find(a => a.id === armazenamentoId);
            
            if (!armazenamento) {
                console.error(`❌ Armazenamento com ID ${armazenamentoId} não encontrado`);
                return false;
            }

            // Atualizar nome com validação
            if (dadosAtualizacao.nome !== undefined && dadosAtualizacao.nome !== null) {
                const nome = dadosAtualizacao.nome.toString().trim();
                if (nome) {
                    armazenamento.nome = nome;
                }
            }

            // Atualizar bonus
            if (dadosAtualizacao.bonusEspaco !== undefined && dadosAtualizacao.bonusEspaco !== null) {
                armazenamento.bonusEspaco = Math.max(0, parseFloat(dadosAtualizacao.bonusEspaco) || 0);
            }

            // Atualizar descrição
            if (dadosAtualizacao.descricao !== undefined && dadosAtualizacao.descricao !== null) {
                armazenamento.descricao = dadosAtualizacao.descricao.toString().trim();
            }

            // Atualizar imagem
            if (dadosAtualizacao.imagemURL !== undefined && dadosAtualizacao.imagemURL !== null) {
                armazenamento.imagemURL = dadosAtualizacao.imagemURL.toString().trim();
            }

            this.saveInventario();
            
            console.log('✅ Armazenamento atualizado:', armazenamento);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar armazenamento:', error);
            return false;
        }
    }

    /**
     * Remove um armazenamento
     * @param {string} armazenamentoId - ID do armazenamento
     * @returns {boolean} true se sucesso
     */
    removerArmazenamento(armazenamentoId) {
        try {
            const indice = this.inventario.armazenamentos.findIndex(a => a.id === armazenamentoId);
            
            if (indice === -1) {
                console.error(`❌ Armazenamento com ID ${armazenamentoId} não encontrado`);
                return false;
            }

            const armazenamentoRemovido = this.inventario.armazenamentos.splice(indice, 1);
            this.saveInventario();
            
            console.log('✅ Armazenamento removido:', armazenamentoRemovido[0]);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover armazenamento:', error);
            return false;
        }
    }

    /**
     * Obtém todos os armazenamentos
     * @returns {array} Array de armazenamentos
     */
    obterArmazenamentos() {
        return [...this.inventario.armazenamentos];
    }

    /**
     * Obtém armazenamento por ID
     * @param {string} armazenamentoId - ID do armazenamento
     * @returns {object|null} Armazenamento ou null
     */
    obterArmazenamento(armazenamentoId) {
        return this.inventario.armazenamentos.find(a => a.id === armazenamentoId) || null;
    }

    // ===== SINCRONIZAÇÃO COM ATRIBUTOS =====

    /**
     * Callback chamado quando atributos mudam
     * Recalcula espaço e notifica UI
     */
    aoAtributosMudarem() {
        console.log('🔄 Atributos mudaram, recalculando espaço de inventário...');
        
        // Emitir evento para UI se necessário
        const evento = new CustomEvent('inventarioEspacoAlterado', {
            detail: this.obterResumoEspaco()
        });
        document.dispatchEvent(evento);
        
        console.log('📢 Evento inventarioEspacoAlterado disparado');
    }
}

// Criar instância global
window.inventarioManager = new InventarioManager();

console.log('✅ inventario-manager.js carregado');
