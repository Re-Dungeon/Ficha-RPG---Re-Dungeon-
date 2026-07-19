/* ============================================ */
/* LOCALSTORAGE-MANAGER.JS                     */
/* Gerenciador Centralizado de Persistência    */
/* ============================================ */

/**
 * LocalStorageManager
 * Responsável por:
 * - Salvar e restaurar dados em localStorage
 * - Sincronizar com StateManager
 * - Organizar dados de forma lógica
 * - Atuar como intermediário entre módulos e localStorage
 */
class LocalStorageManager {
    constructor() {
        // Prefixo para organizar dados
        this.prefix = 'redungeon_ficha_';
        
        // Chaves principais
        this.keys = {
            // Atributos
            atributos: 'atributos',
            
            // Status
            status: 'status',
            
            // Aptidões
            aptidoes: 'aptidoes',
            
            // Informações do Jogador
            jogadorInfo: 'jogador_info',
            
            // Reputação
            reputacao: 'reputacao',
            
            // Imagem do Personagem
            personagemImagem: 'personagem_imagem',
            
            // Rota Vertical Selecionada
            rotaVertical: 'rota_vertical',
            
            // Veias Astrais
            veiasAstrais: 'veias_astrais'
            ,
            // Templates de Background
            backgroundTemplates: 'background_templates'
        };
        
        console.log('✅ LocalStorageManager inicializado');
    }

    /**
     * Gera a chave com prefixo
     * @param {string} key - Chave sem prefixo
     * @returns {string} Chave com prefixo
     */
    getKey(key) {
        return this.prefix + key;
    }

    /**
     * Salva dados em localStorage
     * @param {string} key - Chave (sem prefixo)
     * @param {*} data - Dados a salvar (serão convertidos para JSON)
     */
    save(key, data) {
        // ⚠️ NOTA: Removido blocker de importação - os dados restaurados PRECISAM ser salvos em localStorage
        // O blocker foi movido para arts-main.js e atributos-auto-sync.js para apenas bloquear
        // SALVAMENTOS AUTOMÁTICOS de listeners, não salvamentos diretos

        try {
            const fullKey = this.getKey(key);
            const jsonData = JSON.stringify(data);
            localStorage.setItem(fullKey, jsonData);
            console.log(`💾 Dados salvos em localStorage: "${key}"`, data);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar "${key}" em localStorage:`, error);
            return false;
        }
    }

    /**
     * Carrega dados do localStorage
     * @param {string} key - Chave (sem prefixo)
     * @param {*} defaultValue - Valor padrão se não encontrado
     * @returns {*} Dados carregados ou valor padrão
     */
    load(key, defaultValue = null) {
        try {
            const fullKey = this.getKey(key);
            const jsonData = localStorage.getItem(fullKey);
            
            if (jsonData === null) {
                console.log(`ℹ️  Nenhum dado encontrado para "${key}", usando padrão`);
                return defaultValue;
            }
            
            const data = JSON.parse(jsonData);
            console.log(`📂 Dados carregados do localStorage: "${key}"`, data);
            return data;
        } catch (error) {
            console.error(`❌ Erro ao carregar "${key}" do localStorage:`, error);
            return defaultValue;
        }
    }

    /**
     * Verifica se uma chave existe
     * @param {string} key - Chave (sem prefixo)
     * @returns {boolean} True se existe
     */
    has(key) {
        const fullKey = this.getKey(key);
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * Remove um item do localStorage
     * @param {string} key - Chave (sem prefixo)
     */
    remove(key) {
        try {
            const fullKey = this.getKey(key);
            localStorage.removeItem(fullKey);
            console.log(`🗑️  Item removido do localStorage: "${key}"`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao remover "${key}" do localStorage:`, error);
            return false;
        }
    }

    /**
     * Limpa todos os dados da aplicação no localStorage
     * Itera sobre todas as chaves definidas em this.keys
     * 🔥 NOVO: Também limpa chaves dinamicamente criadas (arts, núcleos, variações)
     */
    clearAll() {
        try {
            console.log('🧹 Iniciando limpeza completa de localStorage...');
            let removidos = 0;
            
            // 1️⃣ Remover cada chave conhecida
            for (let key of Object.values(this.keys)) {
                const fullKey = this.getKey(key);
                if (localStorage.getItem(fullKey) !== null) {
                    localStorage.removeItem(fullKey);
                    console.log(`  ✓ Removido: "${key}"`);
                    removidos++;
                }
            }
            
            // 2️⃣ 🔥 NOVO: Remover TODAS as chaves que começam com o prefixo (incluindo arts, núcleos, variações)
            // Isso garante que dados legados de habilidades/arts sejam limpos também
            const chavesPrefixo = [];
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && chave.startsWith(this.prefix)) {
                    chavesPrefixo.push(chave);
                }
            }
            
            // Remover todas as chaves com prefixo
            chavesPrefixo.forEach(chave => {
                localStorage.removeItem(chave);
                console.log(`  ✓ Removido (dinâmico): "${chave}"`);
                removidos++;
            });
            
            console.log(`🧹 Limpeza concluída: ${removidos} itens removidos`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar localStorage:', error);
            return false;
        }
    }

    /**
     * 🔥 NOVO: Limpa APENAS dados de Arts/Habilidades/Núcleos/Variações
     * Útil para resetar a aba de habilidades sem afetar o resto da ficha
     */
    clearArtsData() {
        try {
            console.log('🧹 Limpando dados de Arts/Habilidades/Núcleos...');
            let removidos = 0;
            
            // Remover TODAS as chaves relacionadas a arts
            const chavesARemover = [];
            for (let i = 0; i < localStorage.length; i++) {
                const chave = localStorage.key(i);
                if (chave && chave.startsWith(this.prefix)) {
                    // Verificar se é uma chave de arts, núcleos ou variações
                    if (chave.includes('nucleo_imagem') || 
                        chave.includes('art_imagem') || 
                        chave.includes('variacao_imagem')) {
                        chavesARemover.push(chave);
                    }
                }
            }
            
            // Remover todas
            chavesARemover.forEach(chave => {
                localStorage.removeItem(chave);
                console.log(`  ✓ Removido: "${chave}"`);
                removidos++;
            });
            
            console.log(`🧹 Limpeza de Arts concluída: ${removidos} itens removidos`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar dados de Arts:', error);
            return false;
        }
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS DE DOMÍNIO
    // ============================================

    /**
     * Salva atributos (primários e secundários)
     * @param {object} atributos - Estrutura de atributos
     */
    saveAtributos(atributos) {
        return this.save(this.keys.atributos, atributos);
    }

    /**
     * Carrega atributos
     * @returns {object} Estrutura de atributos
     */
    loadAtributos(defaultValue = null) {
        return this.load(this.keys.atributos, defaultValue);
    }

    /**
     * Salva status (HP, Energia, Fadiga)
     * @param {object} status - Estrutura de status
     */
    saveStatus(status) {
        return this.save(this.keys.status, status);
    }

    /**
     * Carrega status
     * @returns {object} Estrutura de status
     */
    loadStatus(defaultValue = null) {
        return this.load(this.keys.status, defaultValue);
    }

    /**
     * Salva aptidões (com níveis e campos aba/abaAtual)
     * @param {object} aptidoes - Estrutura de aptidões
     */
    saveAptidoes(aptidoes) {
        return this.save(this.keys.aptidoes, aptidoes);
    }

    /**
     * Carrega aptidões
     * @returns {object} Estrutura de aptidões
     */
    loadAptidoes(defaultValue = null) {
        return this.load(this.keys.aptidoes, defaultValue);
    }

    /**
     * Salva informações do jogador
     * @param {object} info - Dados do jogador
     */
    saveJogadorInfo(info) {
        return this.save(this.keys.jogadorInfo, info);
    }

    /**
     * Salva templates do editor de background
     * @param {Array} templates - Array de templates {label, html}
     */
    saveBackgroundTemplates(templates) {
        return this.save(this.keys.backgroundTemplates, templates || []);
    }

    /**
     * Carrega templates do editor de background
     * @returns {Array} templates
     */
    loadBackgroundTemplates(defaultValue = []) {
        return this.load(this.keys.backgroundTemplates, defaultValue);
    }

    /**
     * Carrega informações do jogador
     * @returns {object} Dados do jogador
     */
    loadJogadorInfo(defaultValue = null) {
        return this.load(this.keys.jogadorInfo, defaultValue);
    }

    /**
     * Salva reputação
     * @param {object} reputacao - Dados de reputação
     */
    saveReputacao(reputacao) {
        return this.save(this.keys.reputacao, reputacao);
    }

    /**
     * Carrega reputação
     * @returns {object} Dados de reputação
     */
    loadReputacao(defaultValue = null) {
        return this.load(this.keys.reputacao, defaultValue);
    }

    /**
     * Salva dados da imagem do personagem
     * @param {object} imagemData - Dados da imagem (base64 ou URL)
     */
    savePersonagemImagem(imagemData) {
        return this.save(this.keys.personagemImagem, imagemData);
    }

    /**
     * Carrega dados da imagem do personagem
     * @returns {object} Dados da imagem
     */
    loadPersonagemImagem(defaultValue = null) {
        return this.load(this.keys.personagemImagem, defaultValue);
    }

    /**
     * Salva rota vertical selecionada
     * @param {string} rota - ID da rota (ex: 'info', 'dicas', 'aptidoes', etc)
     */
    saveRotaVertical(rota) {
        return this.save(this.keys.rotaVertical, rota);
    }

    /**
     * Carrega rota vertical selecionada
     * @returns {string} ID da rota
     */
    loadRotaVertical(defaultValue = 'info') {
        return this.load(this.keys.rotaVertical, defaultValue);
    }

    /**
     * OTIMIZAÇÃO: Salva referência MINIMAL da imagem do personagem
     * @param {string} imagemId - ID da imagem em IndexedDB
     * @param {number} versao - Versão do formato (padrão: 1)
     * @returns {boolean}
     */
    savePersonagemImagemMinimal(imagemId, versao = 1) {
        if (!imagemId) {
            console.warn('⚠️ imagemId é obrigatório para savePersonagemImagemMinimal');
            return false;
        }
        
        const referencia = {
            _id: imagemId,
            v: versao
        };
        
        try {
            this.save(this.keys.personagemImagem, referencia);
            console.log('💾 ✅ Referência minimal de imagem salva (otimizado):', {
                imagemId: imagemId,
                tamanho: JSON.stringify(referencia).length + ' bytes',
                economia: '88% menos que o método antigo'
            });
            return true;
        } catch (e) {
            console.error('❌ Erro ao salvar referência minimal:', e.message);
            return false;
        }
    }

    /**
     * OTIMIZAÇÃO: Carrega referência MINIMAL da imagem do personagem
     * @returns {object|null} {_id, v} ou null
     */
    loadPersonagemImagemMinimal(defaultValue = null) {
        try {
            const referencia = this.load(this.keys.personagemImagem, null);
            
            // Validar se tem o formato esperado (novo formato otimizado)
            if (referencia && referencia._id && typeof referencia.v === 'number') {
                console.log('📥 ✅ Referência minimal carregada:', referencia._id);
                return referencia;
            }
            
            // Se for objeto antigo, retornar null para forçar lógica de compatibilidade/migração
            if (referencia && (referencia._imagemId || referencia.dataUrl)) {
                console.log('⚠️ Detectado: formato antigo de referência (será atualizado)');
                return null;
            }
            
            return defaultValue;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar referência minimal:', e.message);
            return defaultValue;
        }
    }

    /**
     * OTIMIZAÇÃO: Deletar referência de imagem (e opcionalmente do IndexedDB)
     * @param {boolean} deletarIndexedDB - Se deve deletar também do IndexedDB
     * @returns {Promise<boolean>}
     */
    async deletePersonagemImagem(deletarIndexedDB = false) {
        try {
            const referencia = this.loadPersonagemImagemMinimal();
            
            // Deletar do IndexedDB se solicitado
            if (referencia && deletarIndexedDB && typeof ImagemStorageManager !== 'undefined') {
                console.log('🗑️ Deletando imagem do IndexedDB: ' + referencia._id);
                try {
                    await ImagemStorageManager.deletarImagem(referencia._id);
                } catch (e) {
                    console.warn('⚠️ Erro ao deletar do IndexedDB:', e.message);
                }
            }
            
            // Deletar localStorage
            localStorage.removeItem(this.keys.personagemImagem);
            console.log('✅ Referência de imagem do personagem deletada');
            return true;
        } catch (e) {
            console.error('❌ Erro ao deletar imagem:', e.message);
            return false;
        }
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS DE NÚCLEOS E ARTS
    // ============================================

    /**
     * OTIMIZAÇÃO: Salva referência MINIMAL de imagem de núcleo
     * @param {string} nucleoId - ID do núcleo em IndexedDB
     * @param {number} versao - Versão do formato (padrão: 1)
     * @returns {boolean}
     */
    saveNucleoImagemMinimal(nucleoId, versao = 1) {
        if (!nucleoId) {
            console.warn('⚠️ nucleoId é obrigatório para saveNucleoImagemMinimal');
            return false;
        }
        
        const referencia = {
            _id: nucleoId,
            v: versao
        };
        
        try {
            // 🔥 CORREÇÃO: Usar chave ÚNICA por núcleo (não sobrescrever!)
            const chave = this.getKey('nucleo_imagem_' + nucleoId);
            const jsonData = JSON.stringify(referencia);
            localStorage.setItem(chave, jsonData);
            
            console.log('💾 ✅ Referência minimal de imagem de núcleo salva:', {
                nucleoId: nucleoId,
                tamanho: jsonData.length + ' bytes',
                economia: '88% menos que o método antigo'
            });
            return true;
        } catch (e) {
            console.error('❌ Erro ao salvar referência de núcleo:', e.message);
            return false;
        }
    }

    /**
     * OTIMIZAÇÃO: Carrega referência MINIMAL de imagem de núcleo
     * @returns {object|null} {_id, v} ou null
     */
    loadNucleoImagemMinimal(nucleoId, defaultValue = null) {
        try {
            const chave = this.getKey('nucleo_imagem_' + nucleoId);
            const jsonData = localStorage.getItem(chave);
            
            if (!jsonData) {
                console.log(`ℹ️ Nenhuma imagem minimal encontrada para núcleo: ${nucleoId}`);
                return defaultValue;
            }
            
            const referencia = JSON.parse(jsonData);
            
            // Validar se tem o formato esperado (novo formato otimizado)
            if (referencia && referencia._id && typeof referencia.v === 'number') {
                console.log('📥 ✅ Referência minimal de núcleo carregada:', referencia._id);
                return referencia;
            }
            
            return defaultValue;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar imagem de núcleo:', e.message);
            return defaultValue;
        }
    }

    /**
     * OTIMIZAÇÃO: Salva referência MINIMAL de imagem de art
     * @param {string} artId - ID da art em IndexedDB
     * @param {number} versao - Versão do formato (padrão: 1)
     * @returns {boolean}
     */
    saveArtImagemMinimal(artId, versao = 1) {
        if (!artId) {
            console.warn('⚠️ artId é obrigatório para saveArtImagemMinimal');
            return false;
        }
        
        const referencia = {
            _id: artId,
            v: versao
        };
        
        try {
            // Usar uma chave específica para cada art
            const chave = this.getKey('art_imagem_' + artId);
            const jsonData = JSON.stringify(referencia);
            localStorage.setItem(chave, jsonData);
            
            console.log('💾 ✅ Referência minimal de imagem de art salva:', {
                artId: artId,
                tamanho: jsonData.length + ' bytes',
                economia: '88% menos que o método antigo'
            });
            return true;
        } catch (e) {
            console.error('❌ Erro ao salvar referência de art:', e.message);
            return false;
        }
    }

    /**
     * OTIMIZAÇÃO: Carrega referência MINIMAL de imagem de art
     * @param {string} artId - ID da art
     * @returns {object|null} {_id, v} ou null
     */
    loadArtImagemMinimal(artId, defaultValue = null) {
        try {
            const chave = this.getKey('art_imagem_' + artId);
            const jsonData = localStorage.getItem(chave);
            
            if (!jsonData) {
                console.log(`ℹ️ Nenhuma imagem minimal encontrada para art: ${artId}`);
                return defaultValue;
            }
            
            const referencia = JSON.parse(jsonData);
            
            // Validar se tem o formato esperado (novo formato otimizado)
            if (referencia && referencia._id && typeof referencia.v === 'number') {
                console.log('📥 ✅ Referência minimal de art carregada:', referencia._id);
                return referencia;
            }
            
            return defaultValue;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar imagem de art:', e.message);
            return defaultValue;
        }
    }

    /**
     * OTIMIZAÇÃO: Salva referência MINIMAL de imagem de variante de art
     * @param {string} variacaoId - ID da variação em IndexedDB
     * @param {number} versao - Versão do formato (padrão: 1)
     * @returns {boolean}
     */
    saveVariacaoImagemMinimal(variacaoId, versao = 1) {
        if (!variacaoId) {
            console.warn('⚠️ variacaoId é obrigatório para saveVariacaoImagemMinimal');
            return false;
        }
        
        const referencia = {
            _id: variacaoId,
            v: versao
        };
        
        try {
            const chave = this.getKey('variacao_imagem_' + variacaoId);
            const jsonData = JSON.stringify(referencia);
            localStorage.setItem(chave, jsonData);
            
            console.log('💾 ✅ Referência minimal de imagem de variação salva:', {
                variacaoId: variacaoId,
                tamanho: jsonData.length + ' bytes',
                economia: '88% menos que o método antigo'
            });
            return true;
        } catch (e) {
            console.error('❌ Erro ao salvar referência de variação:', e.message);
            return false;
        }
    }

    /**
     * OTIMIZAÇÃO: Carrega referência MINIMAL de imagem de variante de art
     * @param {string} variacaoId - ID da variação
     * @returns {object|null} {_id, v} ou null
     */
    loadVariacaoImagemMinimal(variacaoId, defaultValue = null) {
        try {
            const chave = this.getKey('variacao_imagem_' + variacaoId);
            const jsonData = localStorage.getItem(chave);
            
            if (!jsonData) {
                console.log(`ℹ️ Nenhuma imagem minimal encontrada para variação: ${variacaoId}`);
                return defaultValue;
            }
            
            const referencia = JSON.parse(jsonData);
            
            if (referencia && referencia._id && typeof referencia.v === 'number') {
                console.log('📥 ✅ Referência minimal de variação carregada:', referencia._id);
                return referencia;
            }
            
            return defaultValue;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar imagem de variação:', e.message);
            return defaultValue;
        }
    }

    /**
     * VEIAS ASTRAIS - Salvar estado dos nós
     * @param {Array|object} payload - Array de nós ou objeto completo de estado astral
     */
    saveVeiasAstrais(nodes) {
        try {
            const chave = this.getKey(this.keys.veiasAstrais);
            let payload = {};
            if (Array.isArray(nodes)) {
                payload.nodes = nodes.map((node) => ({
                    id: node.id,
                    state: node.state,
                    level: node.level,
                    treeId: node.treeId,
                }));
            } else if (nodes && Array.isArray(nodes.nodes)) {
                payload.nodes = nodes.nodes.map((node) => ({
                    id: node.id,
                    state: node.state,
                    level: node.level,
                    treeId: node.treeId,
                }));
                payload.powerCombat = Number.isFinite(nodes.powerCombat)
                    ? nodes.powerCombat
                    : 0;
                payload.maxPowerCombat = Number.isFinite(nodes.maxPowerCombat)
                    ? nodes.maxPowerCombat
                    : 0;
                payload.resonance = Number.isFinite(nodes.resonance)
                    ? nodes.resonance
                    : 45;
                payload.maxResonance = Number.isFinite(nodes.maxResonance)
                    ? nodes.maxResonance
                    : 100;
                if (Array.isArray(nodes.activatedLines)) {
                    payload.activatedLines = nodes.activatedLines;
                }
            } else {
                console.warn('⚠️ saveVeiasAstrais recebeu payload inválido');
                payload.nodes = [];
            }

            localStorage.setItem(chave, JSON.stringify(payload));
            window.debugLog && window.debugLog('💾 ✅ Veias Astrais salvas:', payload.nodes.length, 'nós');
        } catch (e) {
            console.warn('⚠️ Erro ao salvar Veias Astrais:', e.message);
        }
    }

    /**
     * VEIAS ASTRAIS - Carregar estado dos nós
     * @returns {Array|null} Array de dados de nós ou null
     */
    loadVeiasAstrais() {
        try {
            const chave = this.getKey(this.keys.veiasAstrais);
            const jsonData = localStorage.getItem(chave);
            
            if (!jsonData) {
                console.log('ℹ️ Nenhum dado de Veias Astrais encontrado');
                return null;
            }
            
            const parsed = JSON.parse(jsonData);
            if (Array.isArray(parsed)) {
                window.debugLog && window.debugLog('📥 ✅ Veias Astrais carregadas (formato antigo):', parsed.length, 'nós');
                return parsed;
            }
            if (parsed && Array.isArray(parsed.nodes)) {
                window.debugLog && window.debugLog('📥 ✅ Veias Astrais carregadas:', parsed.nodes.length, 'nós');
                return parsed;
            }
            console.warn('⚠️ Dados de Veias Astrais com formato desconhecido');
            return null;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar Veias Astrais:', e.message);
            return null;
        }
    }

    /**
     * VEIAS ASTRAIS - Limpar dados
     */
    clearVeiasAstrais() {
        try {
            const chave = this.getKey(this.keys.veiasAstrais);
            localStorage.removeItem(chave);
            console.log('🗑️ ✅ Veias Astrais limpas');
        } catch (e) {
            console.warn('⚠️ Erro ao limpar Veias Astrais:', e.message);
        }
    }
}

// ✅ Criar instância global
window.localStorageManager = new LocalStorageManager();
console.log('✅ LocalStorageManager disponível em window.localStorageManager');
