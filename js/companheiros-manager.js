/* ============================================================= */
/* COMPANHEIROS-MANAGER.JS - Gerenciador de Companheiros         */
/* Sistema completo de CRUD para companheiros                    */
/* ============================================================= */

/**
 * CompanheirosManager
 * Responsável por gerenciar todos os companheiros do personagem
 * Utiliza localStorage com namespace específico para evitar conflitos
 */

class CompanheirosManager {
    constructor() {
        this.storageKey = 'redungeon_companheiros';
        this.companheiros = [];
        this.companheiroEmEdicao = null;
        
        // Inicializar sistema
        this.inicializar();
    }

    /**
     * Inicializar o manager
     */
    async inicializar() {
        console.log('🐾 Inicializando CompanheirosManager...');
        await ImagemStorageManager.init().catch(e => console.warn('⚠️ IndexedDB indisponível:', e));
        await this.carregarDoStorage();
        this.configurarEventos();
        console.log(`✅ CompanheirosManager inicializado com ${this.companheiros.length} companheiros`);
    }

    /**
     * Carregar companheiros do localStorage
     */
    async carregarDoStorage() {
        try {
            const dados = localStorage.getItem(this.storageKey);
            let companheiros = dados ? JSON.parse(dados) : [];
            
            // 🔥 FILTRAR COMPANHEIROS TEMPLATES/VAZIOS
            const companheirosFiltrados = companheiros.filter(comp => {
                // Criterios para REMOVER um companheiro template:
                // 1. Nome vazio ou "Novo Companheiro"
                // 2. Todos os atributos base estão em 0
                // 3. Nível 1 e experiência 0 (nunca foi usado)
                // 4. Sem raça (vazio)
                
                const nomeVazio = !comp.nome || comp.nome.trim() === '' || comp.nome === 'Novo Companheiro';
                const atributosZero = comp.atributos && 
                    Object.values(comp.atributos).every(attr => attr.base === 0 && attr.extra === 0);
                const statsDefault = comp.nivel === 1 && comp.experiencia === 0;
                const tempoEmpty = !comp.raca || comp.raca.trim() === '';
                
                const ehTemplate = nomeVazio && atributosZero && statsDefault && tempoEmpty;
                
                if (ehTemplate) {
                    console.log(`⚠️ Removendo companheiro template/vazio (id: ${comp.id}) no carregamento`);
                    return false;
                }
                
                return true;
            });
            
            if (companheirosFiltrados.length < companheiros.length) {
                console.log(`🗑️ ${companheiros.length - companheirosFiltrados.length} companheiros templates removidos`);
            }
            
            this.companheiros = companheirosFiltrados;
            
            // 🔥 RESTAURAR IMAGENS DO INDEXEDDB
            console.log(`📥 Carregados ${this.companheiros.length} companheiros do storage`);
            
            for (let comp of this.companheiros) {
                if (comp._imagemId) {
                    try {
                        const imagemData = await ImagemStorageManager.carregarImagem(comp._imagemId);
                        if (imagemData) {
                            comp.imagem = imagemData;
                            console.log(`🖼️ Imagem restaurada para ${comp.nome}`);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Erro ao restaurar imagem de ${comp.nome}:`, e);
                    }
                }
            }
            
            console.log(`✅ Companheiros carregados com sucesso`);
        } catch (error) {
            console.error('❌ Erro ao carregar companheiros do storage:', error);
            this.companheiros = [];
        }
    }

    /**
     * Salvar companheiros no localStorage
     * ⚠️ IMPORTANTE: Imagens são salvas em IndexedDB, não em localStorage
     * 🔥 OTIMIZADO: Imagens já vêm comprimidas
     */
    async salvarNoStorage() {
        try {
            // 🔥 EXTRAIR IMAGENS E SALVAR EM INDEXEDDB
            const companheirosSemImagens = this.companheiros.map(comp => {
                const compCopia = { ...comp };
                
                // Se há imagem base64, salvar em IndexedDB e remover do objeto
                if (compCopia.imagem && compCopia.imagem.startsWith('data:image')) {
                    const imagemId = `comp_${compCopia.id}_imagem`;
                    
                    // Salvar em IndexedDB de forma assíncrona
                    ImagemStorageManager.salvarImagem(imagemId, compCopia.imagem, 'companheiro')
                        .then(() => {
                            console.log(`✅ Imagem de ${compCopia.nome} salva em IndexedDB (${(compCopia.imagem.length/1024).toFixed(2)}KB)`);
                        })
                        .catch(e => console.warn(`⚠️ Erro ao salvar imagem em IndexedDB:`, e));
                    
                    // Remover imagem do objeto para economizar localStorage
                    delete compCopia.imagem;
                    compCopia._imagemId = imagemId; // Guardar apenas referência
                }
                
                return compCopia;
            });
            
            const jsonString = JSON.stringify(companheirosSemImagens);
            const tamanhoKB = (jsonString.length / 1024).toFixed(2);
            
            try {
                localStorage.setItem(this.storageKey, jsonString);
                console.log(`💾 ${this.companheiros.length} companheiros salvos no storage (${tamanhoKB}KB, imagens em IndexedDB)`);
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError' || quotaError.code === 22) {
                    console.warn('⚠️ localStorage cheio! Limpando dados antigos...');
                    // Tentar limpar dados menos importantes
                    this.limparDadosAntigos();
                    // Tentar salvar novamente
                    localStorage.setItem(this.storageKey, jsonString);
                    console.log(`💾 Companheiros salvos após limpeza (${tamanhoKB}KB)`);
                } else {
                    throw quotaError;
                }
            }
        } catch (error) {
            console.error('❌ Erro ao salvar companheiros no storage:', error);
            // Não bloquear operações por erro de storage
        }
    }

    /**
     * Limpar dados antigos para liberar espaço
     */
    limparDadosAntigos() {
        // Remover dados de teste
        const chavesTeste = Object.keys(localStorage).filter(k => k.includes('teste') || k.includes('debug'));
        chavesTeste.forEach(k => {
            try {
                localStorage.removeItem(k);
                console.log(`🗑️ Removido: ${k}`);
            } catch (e) {
                console.warn(`Não foi possível remover ${k}`);
            }
        });
    }

    /**
     * Gerar ID único para companheiro
     */
    gerarIdUnico() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `comp_${timestamp}_${random}`;
    }

    /**
     * Criar estrutura base de um companheiro
     */
    criarCompanheiroBase() {
        return {
            id: this.gerarIdUnico(),
            nome: '',
            tipo: 'PET', // PET ou INVOCACAO
            nivel: 1,
            descricao: '',
            notas: '',
            raca: 'humano',
            
            atributos: {
                forca: { base: 0, extra: 0, total: 0 },
                vitalidade: { base: 0, extra: 0, total: 0 },
                agilidade: { base: 0, extra: 0, total: 0 },
                inteligencia: { base: 0, extra: 0, total: 0 },
                percepcao: { base: 0, extra: 0, total: 0 },
                sorte: { base: 0, extra: 0, total: 0 }
            },
            
            secundarios: {
                prontidao: { base: 0, extra: 0, total: 0 },
                ataque: { base: 0, extra: 0, total: 0 },
                defesa: { base: 0, extra: 0, total: 0 },
                reacao: { base: 0, extra: 0, total: 0 },
                precisao: { base: 0, extra: 0, total: 0 },
                evasao: { base: 0, extra: 0, total: 0 }
            },
            
            saude: { valor: 0, extra: 0, bonus: 0, maxima: 0 },
            energia: { valor: 0, extra: 0, bonus: 0, maxima: 0 },
            fadiga: { valor: 0, extra: 0, bonus: 0, maxima: 0 },
            
            habilidades: [],
            aptidoes: [],
            inventario: [],
            
            // ✅ NOVO: Campos para Arts/Habilidades
            cores: [],      // Array de núcleos
            arts: [],       // Array de arts/habilidades
            variantes: [],  // Array de variantes
            
            morto: false,
            imagem: null
        };
    }

    /**
     * Salvar novo companheiro (com suporte a IndexedDB para imagens)
     */
    async salvarNovoCompanheiro(dados) {
        // Validar nome obrigatório
        if (!dados.nome || dados.nome.trim() === '') {
            console.warn('⚠️ Nome do companheiro é obrigatório');
            return null;
        }

        // ✅ FIX #4: Garantir que dados.id é sempre string ou null, nunca undefined
        // Se undefined, converter para null
        if (dados.id === undefined) {
            console.warn('⚠️ dados.id era undefined, convertendo para null');
            dados.id = null;
        }

        // Se estamos editando (verificar se dados.id existe e é válido)
        if (dados.id && dados.id !== null && dados.id !== 'null') {
            console.log('🔄 Detectado edição, ID:', dados.id);
            return this.editarCompanheiro(dados);
        }

        // Se companheiroEmEdicao está setado (fallback seguro)
        if (this.companheiroEmEdicao !== null && this.companheiroEmEdicao !== undefined) {
            console.log('🔄 Detectado edição por companheiroEmEdicao:', this.companheiroEmEdicao);
            dados.id = this.companheiroEmEdicao;
            return this.editarCompanheiro(dados);
        }

        // Criar novo companheiro
        console.log('📝 Criando NOVO companheiro:', dados.nome);
        const novo = this.criarCompanheiroBase();
        
        // ✅ CRITICAL FIX: Não deixar dados.id sobrescrever o ID gerado!
        // Remover ID de dados antes de fazer assign
        const { id: _ignoredId, ...dadosSemId } = dados;
        Object.assign(novo, dadosSemId);
        
        console.log('✅ Novo companheiro criado com ID:', novo.id);
        
        // 🔥 FIX: Salvar imagem em IndexedDB - suportar BOTH base64 AND URLs
        if (novo.imagem) {
            try {
                if (window.companheirosImagemDB) {
                    let tipoImagem = 'url'; // Default é URL
                    
                    if (novo.imagem.startsWith('data:')) {
                        tipoImagem = 'upload'; // É base64
                    }
                    
                    const imagemId = await window.companheirosImagemDB.salvarImagem(novo.id, novo.imagem, tipoImagem);
                    novo.imagemDbId = imagemId;
                    
                    // 🔥 IMPORTANTE: Manter URLs no objeto como fallback (são pequenas)
                    // Apenas remover base64 que é pesado
                    if (tipoImagem === 'upload') {
                        novo.imagem = null; // Remover base64 para economizar localStorage
                    }
                    // URLs são mantidas automaticamente no objeto novo.imagem
                    
                    console.log(`📷 Imagem salva em IndexedDB com ID: ${imagemId} (tipo: ${tipoImagem})`);
                }
            } catch (error) {
                console.error('❌ Erro ao salvar imagem em IndexedDB:', error);
                // Fallback: manter imagem no objeto se IndexedDB falhar
                console.warn('⚠️ Mantendo imagem no objeto como fallback');
            }
        }
        
        this.companheiros.push(novo);
        this.salvarNoStorage();
        
        console.log(`✅ Novo companheiro criado: ${novo.nome} (${novo.id})`);
        return novo;
    }

    /**
     * Editar companheiro existente (com suporte a IndexedDB para imagens)
     */
    async editarCompanheiro(dados) {
        console.log('✏️ EDITANDO companheiro com ID:', dados.id);
        const index = this.companheiros.findIndex(c => c.id === dados.id);
        
        if (index === -1) {
            console.error('❌ Companheiro não encontrado:', dados.id);
            console.warn('📋 IDs disponíveis:', this.companheiros.map(c => c.id));
            return null;
        }

        // Preservar campo morto
        const mortoAnterior = this.companheiros[index].morto;
        const imagemDbIdAnterior = this.companheiros[index].imagemDbId;
        
        // Atualizar dados
        this.companheiros[index] = {
            ...this.companheiros[index],
            ...dados,
            morto: mortoAnterior // Preservar estado morto
        };

        // 🔥 FIX: Salvar imagem em IndexedDB - suportar BOTH base64 AND URLs
        if (dados.imagem) {
            try {
                if (window.companheirosImagemDB) {
                    // Deletar imagem anterior se existir
                    if (imagemDbIdAnterior) {
                        await window.companheirosImagemDB.deletarImagem(dados.id);
                    }
                    
                    let tipoImagem = 'url'; // Default é URL
                    
                    if (dados.imagem.startsWith('data:')) {
                        tipoImagem = 'upload'; // É base64
                    }
                    
                    const imagemId = await window.companheirosImagemDB.salvarImagem(dados.id, dados.imagem, tipoImagem);
                    this.companheiros[index].imagemDbId = imagemId;
                    
                    // 🔥 IMPORTANTE: Manter URLs no objeto como fallback (são pequenas)
                    // Apenas remover base64 que é pesado
                    if (tipoImagem === 'upload') {
                        this.companheiros[index].imagem = null; // Remover base64 para economizar localStorage
                    }
                    // URLs são mantidas automaticamente no objeto this.companheiros[index].imagem
                    
                    console.log(`📷 Imagem atualizada em IndexedDB com ID: ${imagemId} (tipo: ${tipoImagem})`);
                }
            } catch (error) {
                console.error('❌ Erro ao salvar imagem em IndexedDB:', error);
                // Fallback: manter imagem no objeto se IndexedDB falhar
                console.warn('⚠️ Mantendo imagem no objeto como fallback');
            }
        }
        
        this.salvarNoStorage();
        console.log(`✅ Companheiro atualizado: ${this.companheiros[index].nome}`);
        return this.companheiros[index];
    }

    /**
     * Ver detalhes de um companheiro (com recuperação de imagem IndexedDB)
     */
    async verCompanheiro(id) {
        const companheiro = this.companheiros.find(c => c.id === id);
        
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado:', id);
            return null;
        }

        // 🔥 FIX: Tentar recuperar imagem do IndexedDB se estiver disponível
        // (SEMPRE, mesmo que imagemDbId não esteja setado, para caso de dados legados)
        if (window.companheirosImagemDB) {
            try {
                const imagemData = await window.companheirosImagemDB.recuperarImagem(id);
                if (imagemData && imagemData.dados) {
                    companheiro.imagem = imagemData.dados;
                    companheiro.imagemDbId = id; // Garantir que imagemDbId está setado
                    console.log(`📷 Imagem recuperada do IndexedDB para: ${companheiro.nome}`);
                }
            } catch (error) {
                console.error('❌ Erro ao recuperar imagem do IndexedDB:', error);
                // Continuar com companheiro.imagem existente (fallback)
            }
        }
        
        console.log(`👁️ Visualizando companheiro: ${companheiro.nome}`);
        console.log(`📷 Imagem status: ${companheiro.imagem ? '✅ Tem imagem' : '❌ Sem imagem'}`);
        return companheiro;
    }

    /**
     * Deletar companheiro (com limpeza de imagem em IndexedDB)
     */
    async deletarCompanheiro(id) {
        const index = this.companheiros.findIndex(c => c.id === id);
        
        if (index === -1) {
            console.error('❌ Companheiro não encontrado:', id);
            return false;
        }

        const nome = this.companheiros[index].nome;
        const imagemDbId = this.companheiros[index].imagemDbId;

        // Deletar imagem do IndexedDB se existir
        if (imagemDbId && window.companheirosImagemDB) {
            try {
                await window.companheirosImagemDB.deletarImagem(id);
                console.log(`📷 Imagem removida do IndexedDB`);
            } catch (error) {
                console.error('❌ Erro ao remover imagem do IndexedDB:', error);
            }
        }

        this.companheiros.splice(index, 1);
        this.salvarNoStorage();
        
        console.log(`🗑️ Companheiro deletado: ${nome}`);
        return true;
    }

    /**
     * Alternar estado morto/vivo (AGORA ASSÍNCRONO)
     */
    async alternarMorteCompanheiro(id) {
        console.log(`🔀 Alternando morte do companheiro: ${id}`);
        const companheiro = this.obterPorId(id);
        
        if (!companheiro) {
            console.error('❌ Companheiro não encontrado:', id);
            return false;
        }

        console.log(`antes: morto = ${companheiro.morto}`);
        companheiro.morto = !companheiro.morto;
        console.log(`depois: morto = ${companheiro.morto}`);
        
        this.salvarNoStorage();
        
        const status = companheiro.morto ? '💀 MORTO' : '✅ VIVO';
        console.log(`${status}: ${companheiro.nome}`);
        
        return companheiro.morto;
    }

    /**
     * Listar todos os companheiros
     */
    listarCompanheiros() {
        console.log(`📋 Listando ${this.companheiros.length} companheiros`);
        return this.companheiros;
    }

    /**
     * Obter companheiro por índice
     */
    obterPorIndice(index) {
        return this.companheiros[index] || null;
    }

    /**
     * Obter companheiro por ID
     */
    obterPorId(id) {
        return this.companheiros.find(c => c.id === id) || null;
    }

    /**
     * Obter índice de companheiro por ID
     */
    obterIndiceById(id) {
        return this.companheiros.findIndex(c => c.id === id);
    }

    /**
     * Configurar eventos globais
     */
    configurarEventos() {
        // Será usado pela UI
    }

    /**
     * Validar companheiro
     */
    validarCompanheiro(companheiro) {
        const erros = [];

        if (!companheiro.nome || companheiro.nome.trim() === '') {
            erros.push('Nome é obrigatório');
        }

        if (!['PET', 'INVOCACAO'].includes(companheiro.tipo)) {
            erros.push('Tipo deve ser PET ou INVOCACAO');
        }

        if (companheiro.nivel < 1) {
            erros.push('Nível deve ser >= 1');
        }

        return erros;
    }

    /**
     * Exportar companheiros em JSON
     */
    exportarJSON() {
        return JSON.stringify(this.companheiros, null, 2);
    }

    /**
     * Importar companheiros de JSON
     */
    importarJSON(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            
            if (!Array.isArray(dados)) {
                throw new Error('JSON deve ser um array');
            }

            this.companheiros = dados;
            this.salvarNoStorage();
            
            console.log(`✅ ${this.companheiros.length} companheiros importados`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar companheiros:', error);
            return false;
        }
    }

    /**
     * Limpar todos os companheiros
     */
    limparTodos() {
        const confirmacao = confirm('⚠️ Isto irá DELETAR TODOS os companheiros. Tem certeza?');
        
        if (confirmacao) {
            this.companheiros = [];
            this.salvarNoStorage();
            console.log('🗑️ Todos os companheiros foram deletados');
            return true;
        }
        
        return false;
    }

    /**
     * Limpar dados antigos do localStorage para liberar espaço
     * Remove chaves de debug, teste e backup
     */
    limparDadosAntigos() {
        console.log('🧹 [CompanheirosManager] Limpando dados antigos...');
        
        const chavesToRemove = [];
        const padroes = [
            'debug', 'temp', 'teste', 'backup', 
            'estadoBonusOpcionais_', // Estados antigos de bonus (sem companheiro)
            'test_'
        ];
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            if (chave && padroes.some(padrao => chave.includes(padrao))) {
                chavesToRemove.push(chave);
            }
        }
        
        let bytesLiberados = 0;
        chavesToRemove.forEach(chave => {
            try {
                const tamanho = (localStorage.getItem(chave) || '').length;
                bytesLiberados += tamanho;
                localStorage.removeItem(chave);
                console.log(`   ✅ Removida: ${chave}`);
            } catch (e) {
                console.warn(`   ⚠️ Erro ao remover ${chave}:`, e);
            }
        });
        
        console.log(`✅ Limpeza concluída. ${chavesToRemove.length} chaves removidas, ~${bytesLiberados} bytes liberados.`);
        return bytesLiberados;
    }
}

// Instância global
window.companheirosManager = new CompanheirosManager();
window.companheirosManager.inicializar().catch(e => console.error('⚠️ Erro ao inicializar:', e));

console.log('✅ CompanheirosManager carregado');
