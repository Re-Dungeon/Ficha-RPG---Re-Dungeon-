/**
 * INTEGRAÇÃO LOJA <-> INVENTÁRIO
 * 
 * Responsável por sincronizar itens comprados na loja
 * com o inventário principal do jogador
 * 
 * IDs próprios para evitar conflitos:
 * - menu-itens-* (itens da loja)
 * - inventario-* (itens do inventário)
 */

class MenuItensInventarioIntegration {
    constructor() {
        this.inventarioManager = null;
        this.menuItensSystem = null;
    }

    /**
     * Inicializa a integração com ambos os sistemas
     */
    init(inventarioManager, menuItensSystem) {
        this.inventarioManager = inventarioManager;
        this.menuItensSystem = menuItensSystem;
        
        console.log('✅ MenuItensInventarioIntegration inicializado');
    }

    /**
     * Converter item da loja para item do inventário
     */
    converterLojaParaInventario(itemLoja, quantidade = 1) {
        try {
            if (!itemLoja) return null;

            // Mapear raridade da loja para qualidade do inventário
            const mapearRaridade = {
                'comum': 'comum',
                'incomum': 'comum',
                'raro': 'raro',
                'epico': 'epico',
                'lendario': 'lendario',
                'mitico': 'mitico',
                'celestial': 'celestial'
            };

            const itemInventario = {
                nome: itemLoja.nome,
                quantidade: quantidade,
                espaco: itemLoja.espaco || 1,
                qualidade: mapearRaridade[itemLoja.raridade] || 'comum',
                tipo: itemLoja.categoria || 'Diversos',
                nivel: 1,  // Items da loja começam no nível 1
                roll: itemLoja.dado || '',  // Dado da loja vira roll
                extra: itemLoja.extra || '',  // Extra da loja vira extra
                imagemURL: itemLoja.imagemURL || itemLoja.imagem || '',  // Usar URL da imagem, fallback para emoji
                habilidade: itemLoja.descricao || '',  // Descrição da loja vira habilidade
                historia: '',  // Historia fica vazia (pode ser preenchida depois)
                equipado: false,
                
                // Dados de origem (para rastrear se veio da loja)
                idOriginalLoja: itemLoja.id,
                fonte: 'loja-rokmas',
                dataCopia: Date.now()
            };

            return itemInventario;
        } catch (error) {
            console.error('❌ Erro ao converter item da loja:', error);
            return null;
        }
    }

    /**
     * Verificar se um item é de armazenamento (contém propriedades de carga/espaço)
     */
    isItemArmazenamento(itemLoja) {
        if (!itemLoja) return false;
        
        // Verificar se o campo "dado" ou "extra" contém palavras-chave de armazenamento
        const dado = (itemLoja.dado || '').toLowerCase();
        const extra = (itemLoja.extra || '').toLowerCase();
        const descricao = (itemLoja.descricao || '').toLowerCase();
        
        // Padrões mais específicos para detecção de armazenamento
        // Procura por "+número" no dado ou extra (ex: "+20 Carga", "+10 itens")
        const temBonusEspaco = /\+\d+\s*(carga|espaço|espaco|capacidade|itens|espaços)/.test(dado + ' ' + extra);
        
        // Palavras-chave muito específicas para armazenamento
        const palavrasChaveEspecificas = [
            'mochila',
            'bolsa',
            'baú',
            'cofre',
            'cristaleira',
            'armário',
            'caixa de armazenamento',
            'armazenamento'
        ];
        
        const temPalavraEspecifica = palavrasChaveEspecificas.some(palavra => 
            dado.includes(palavra) || extra.includes(palavra) || descricao.includes(palavra)
        );
        
        // É armazenamento se tem bônus de espaço ou palavra-chave específica
        const ehArmazenamento = temBonusEspaco || temPalavraEspecifica;
        
        if (ehArmazenamento) {
            console.log(`🗃️  [isItemArmazenamento] "${itemLoja.nome}" detectado como armazenamento`);
            console.log(`   Motivo: ${temBonusEspaco ? 'Bônus de espaço detectado' : 'Palavra-chave específica'}`);
        }
        
        return ehArmazenamento;
    }

    /**
     * Adicionar item comprado da loja ao inventário
     * Se o item tem propriedades de armazenamento, vai para Armazenamentos
     * Se o item já existe, incrementa a quantidade
     */
    adicionarItemComprado(itemLoja, quantidade = 1) {
        try {
            if (!this.inventarioManager || !itemLoja) {
                console.error('❌ InventarioManager ou itemLoja não disponível');
                return false;
            }

            // ═══════════════════════════════════════════════════════════
            // VERIFICAR SE É ITEM DE ARMAZENAMENTO
            // ═══════════════════════════════════════════════════════════
            if (this.isItemArmazenamento(itemLoja)) {
                console.log(`🗃️  [Armazenamento] Item ${itemLoja.nome} detectado como armazenamento`);
                return this.adicionarItemComoArmazenamento(itemLoja, quantidade);
            }

            // ═══════════════════════════════════════════════════════════
            // ADICIONAR COMO ITEM NORMAL DO INVENTÁRIO
            // ═══════════════════════════════════════════════════════════

            // Verificar se o item já existe no inventário (por idOriginalLoja)
            const itemExistente = this.inventarioManager.inventario.itens.find(
                i => i.idOriginalLoja === itemLoja.id && i.fonte === 'loja-rokmas'
            );

            if (itemExistente) {
                // Item já existe - incrementar quantidade
                console.log(`📦 Item "${itemLoja.nome}" já existe no inventário`);
                console.log(`   Quantidade anterior: ${itemExistente.quantidade}`);
                
                // Verificar espaço para nova quantidade
                const espacoAdicional = (itemLoja.espaco || 1) * quantidade;
                const espacoLivre = this.inventarioManager.calcularEspacoLivre();
                
                if (espacoAdicional > espacoLivre) {
                    console.warn('❌ Espaço insuficiente para adicionar mais itens');
                    return false;
                }
                
                const novaQuantidade = itemExistente.quantidade + quantidade;
                const atualizado = this.inventarioManager.atualizarItem(itemExistente.id, {
                    quantidade: novaQuantidade
                });
                
                if (atualizado) {
                    console.log(`✅ Quantidade aumentada para: ${novaQuantidade}`);
                    this.dispararEventoItemAdicionado(itemExistente, itemLoja);
                    return true;
                }
                return false;
            }

            // Item não existe - criar novo
            console.log(`✨ Criando novo item: ${itemLoja.nome}`);
            const itemInventario = this.converterLojaParaInventario(itemLoja, quantidade);
            
            if (!itemInventario) {
                console.error('❌ Falha ao converter item da loja');
                return false;
            }

            // Tentar adicionar ao inventário
            const itemAdicionado = this.inventarioManager.adicionarItem(itemInventario);
            
            if (itemAdicionado) {
                console.log('✅ Item adicionado ao inventário:', itemAdicionado);
                
                // Disparar evento de sincronização
                this.dispararEventoItemAdicionado(itemAdicionado, itemLoja);
                
                return true;
            } else {
                console.warn('⚠️  Não foi possível adicionar item (espaço insuficiente?)');
                return false;
            }

        } catch (error) {
            console.error('❌ Erro ao adicionar item comprado:', error);
            return false;
        }
    }

    /**
     * Adicionar item como armazenamento ao inventário
     * Extrai apenas as informações necessárias para o armazenamento
     */
    adicionarItemComoArmazenamento(itemLoja, quantidade = 1) {
        try {
            // ═══════════════════════════════════════════════════════════
            // EXTRAIR BÔNUS DE ESPAÇO
            // ═══════════════════════════════════════════════════════════
            
            let bonusEspaco = 0;
            const textoVerificacao = `${itemLoja.dado || ''} ${itemLoja.extra || ''}`.toLowerCase();
            
            // Procurar padrões como "+20", "+10", etc.
            const match = textoVerificacao.match(/\+(\d+)/);
            if (match) {
                bonusEspaco = parseInt(match[1]);
            }
            
            // Se não encontrou valor numérico, usar valores padrão baseados na raridade
            if (bonusEspaco === 0) {
                const bonusPorRaridade = {
                    'comum': 15,
                    'incomum': 20,
                    'raro': 25,
                    'epico': 35,
                    'lendario': 50,
                    'mitico': 75,
                    'celestial': 100
                };
                bonusEspaco = bonusPorRaridade[itemLoja.raridade] || 20;
            }

            // ═══════════════════════════════════════════════════════════
            // CRIAR DADOS DO ARMAZENAMENTO (SOMENTE CAMPOS NECESSÁRIOS)
            // ═══════════════════════════════════════════════════════════
            
            const dadosArmazenamento = {
                nome: itemLoja.nome,                          // Nome do item
                bonusEspaco: bonusEspaco,                     // Valor de bônus extraído
                descricao: itemLoja.descricao || '',          // Descrição do item
                imagemURL: itemLoja.imagemURL || ''           // URL da imagem
            };

            console.log(`🗃️  [Armazenamento] Criando com dados:`, {
                nome: dadosArmazenamento.nome,
                bonusEspaco: dadosArmazenamento.bonusEspaco,
                temImagem: !!dadosArmazenamento.imagemURL,
                descricao: dadosArmazenamento.descricao.substring(0, 50) + '...'
            });

            // ═══════════════════════════════════════════════════════════
            // ADICIONAR AO INVENTÁRIO
            // ═══════════════════════════════════════════════════════════

            const armazenamentoAdicionado = this.inventarioManager.adicionarArmazenamento(dadosArmazenamento);
            
            if (armazenamentoAdicionado) {
                console.log(`✅ Armazenamento "${itemLoja.nome}" adicionado com +${bonusEspaco} de espaço`);
                
                // Disparar evento customizado para UI atualizar
                window.dispatchEvent(new CustomEvent('menuItensArmazenamentoAdicionado', {
                    detail: {
                        armazenamento: armazenamentoAdicionado,
                        itemOriginal: itemLoja,
                        bonusEspaco: bonusEspaco
                    }
                }));
                
                return true;
            } else {
                console.error('❌ Falha ao adicionar armazenamento');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro ao adicionar item como armazenamento:', error);
            return false;
        }
    }

    /**
     * Remover item vendido do inventário
     */
    removerItemVendido(itemLojaId) {
        try {
            console.log(`\n🗑️  [RemoverItemVendido] Procurando remover: ${itemLojaId}`);
            
            if (!this.inventarioManager) {
                console.error('❌ InventarioManager não disponível');
                return false;
            }

            // Encontrar o item da loja para pegar o nome
            const itemLoja = window.menuItensSystem ? 
                buscarItemPorId(itemLojaId) : 
                null;
            
            if (itemLoja) {
                console.log(`   📦 Item da loja encontrado: ${itemLoja.nome}`);
            } else {
                console.warn(`   ⚠️  Item ${itemLojaId} não encontrado no catálogo`);
            }

            // Procurar item no inventário que veio da loja
            // Prioridade: 1) idOriginalLoja, 2) nome do item
            console.log(`   🔍 Buscando no inventário por idOriginalLoja: ${itemLojaId}`);
            let item = this.inventarioManager.inventario.itens.find(
                i => i.idOriginalLoja === itemLojaId
            );
            
            if (item) {
                console.log(`   ✅ Encontrado por idOriginalLoja: ${item.nome}`);
            } else {
                console.log(`   ❌ Não encontrado por idOriginalLoja`);
            }

            // Se não encontrou por ID, tenta por nome
            if (!item && itemLoja) {
                console.log(`   🔍 Buscando por nome: ${itemLoja.nome} + fonte: 'loja-rokmas'`);
                item = this.inventarioManager.inventario.itens.find(
                    i => i.nome === itemLoja.nome && i.fonte === 'loja-rokmas'
                );
                if (item) {
                    console.log(`   ✅ Encontrado por nome + fonte`);
                } else {
                    console.log(`   ❌ Não encontrado por nome + fonte`);
                }
            }

            if (!item) {
                console.warn(`⚠️  ❌ Item ${itemLojaId} não encontrado no inventário`);
                console.warn('   Itens disponíveis:');
                this.inventarioManager.inventario.itens.forEach(i => {
                    console.warn(`     - ${i.nome} (ID: ${i.id}, idOriginalLoja: ${i.idOriginalLoja}, fonte: ${i.fonte})`);
                });
                return false;
            }

            // Remover do inventário
            console.log(`   🔴 Removendo item "${item.nome}" com ID interno: ${item.id}`);
            const removido = this.inventarioManager.removerItem(item.id);
            
            if (removido) {
                console.log('✅ Item removido do inventário:', item.nome);
                console.log('   📢 Disparando evento de remoção...');
                this.dispararEventoItemRemovido(item, itemLojaId);
                console.log('   ✨ Evento disparado com sucesso');
                return true;
            } else {
                console.error('❌ Falha ao remover item do inventário');
            }

            return false;

        } catch (error) {
            console.error('❌ Erro ao remover item vendido:', error);
            return false;
        }
    }

    /**
     * Sincronizar quantidade vendida (se o item foi parcialmente vendido)
     */
    sincronizarQuantidadeVendida(itemLojaId, quantidadeVendida) {
        try {
            if (!this.inventarioManager) {
                console.error('❌ InventarioManager não disponível');
                return false;
            }

            // Procurar item no inventário
            const item = this.inventarioManager.inventario.itens.find(
                i => i.idOriginalLoja === itemLojaId
            );

            if (!item) {
                console.warn(`⚠️  Item ${itemLojaId} não encontrado`);
                return false;
            }

            // Reduzir quantidade ou remover se quantidade <= 0
            const novaQuantidade = item.quantidade - quantidadeVendida;
            
            if (novaQuantidade <= 0) {
                return this.removerItemVendido(itemLojaId);
            } else {
                return this.inventarioManager.atualizarItem(item.id, {
                    quantidade: novaQuantidade
                });
            }

        } catch (error) {
            console.error('❌ Erro ao sincronizar quantidade:', error);
            return false;
        }
    }

    /**
     * Disparar evento customizado quando item é adicionado
     */
    dispararEventoItemAdicionado(itemInventario, itemLoja) {
        const evento = new CustomEvent('menuItensItemAdicionadoAoInventario', {
            detail: {
                itemInventario: itemInventario,
                itemLoja: itemLoja,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(evento);
    }

    /**
     * Disparar evento customizado quando item é removido
     */
    dispararEventoItemRemovido(itemInventario, itemLojaId) {
        const evento = new CustomEvent('menuItensItemRemovidoDoInventario', {
            detail: {
                itemInventario: itemInventario,
                itemLojaId: itemLojaId,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(evento);
    }

    /**
     * Verificar se há espaço no inventário
     */
    temEspacoDisponivel(espacoNecessario = 1) {
        if (!this.inventarioManager) {
            console.warn('⚠️  InventarioManager não disponível');
            return true; // Por segurança, permitir se não conseguir verificar
        }

        const espacoLivre = this.inventarioManager.calcularEspacoLivre();
        return espacoLivre >= espacoNecessario;
    }

    /**
     * Obter espaço disponível
     */
    obterEspacoDisponivel() {
        if (!this.inventarioManager) return 0;
        return this.inventarioManager.calcularEspacoLivre();
    }

    /**
     * DEBUG: Verificar status da integração
     */
    debug() {
        console.log('═════════════════════════════════════════════');
        console.log('🔍 DEBUG - MenuItensInventarioIntegration');
        console.log('═════════════════════════════════════════════');
        
        console.log('\n📦 INVENTÁRIO MANAGER:');
        if (!this.inventarioManager) {
            console.warn('❌ Não inicializado');
        } else {
            console.log('✅ Disponível');
            console.log('   Itens:', this.inventarioManager.inventario.itens.length);
            console.log('   Itens da loja:');
            this.inventarioManager.inventario.itens.forEach(item => {
                console.log(`     - ${item.nome} (ID: ${item.id}, origem: ${item.idOriginalLoja || 'manual'}, fonte: ${item.fonte})`);
            });
        }

        console.log('\n🛒 MENU ITENS SYSTEM:');
        if (!this.menuItensSystem) {
            console.warn('❌ Não inicializado');
        } else {
            console.log('✅ Disponível');
            console.log('   Rokmas:', this.menuItensSystem.obterSaldo());
            console.log('   Inventário da loja:');
            for (const [itemId, qty] of Object.entries(this.menuItensSystem.inventario)) {
                console.log(`     - ${itemId}: ${qty} unidade(s)`);
            }
        }

        console.log('\n═════════════════════════════════════════════');
    }
}

// Criar instância global
window.menuItensInventarioIntegration = new MenuItensInventarioIntegration();
