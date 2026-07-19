/* ════════════════════════════════════════════════════════════════════════════════ */
/* COMPANHEIRO-CARACTERISTICAS-SYNC.JS - Sincronização de Características Companheiro */
/* Integração entre Modal, Manager e GlobalState para características do companheiro   */
/* ════════════════════════════════════════════════════════════════════════════════ */

/**
 * 🐾 CompanheiroCaracteristicasSync
 * 
 * Responsável por:
 * 1. Extrair dados de características do modal → CompanheirosManager
 * 2. Sincronizar dados de CompanheirosManager → GlobalState
 * 3. Sincronizar dados de GlobalState → Modal (ao abrir)
 * 4. Gerar dados para salvar/importar JSON
 */
class CompanheiroCaracteristicasSync {
    constructor() {
        this.modalId = 'modalNovoCompanheiro';
        this.inicializar();
    }

    /**
     * Inicializar sistema de sincronização
     */
    inicializar() {
        console.log('🐾 CompanheiroCaracteristicasSync inicializado');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarEventos());
        } else {
            this.configurarEventos();
        }
    }

    /**
     * Configurar event listeners para sincronização automática
     */
    configurarEventos() {
        // Escutar eventos de salvar companheiro
        document.addEventListener('companheiroSalvo', (e) => {
            console.log('📢 Evento: Companheiro Salvo - Sincronizando com GlobalState');
            this.sincronizarCompanheiroParaGlobalState(e.detail.companheiro);
        });

        // Escutar eventos de fechar modal
        document.addEventListener('modalCompanheiroFechado', () => {
            console.log('📢 Evento: Modal Fechado');
        });

        console.log('✅ Event listeners configurados para sincronização');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📤 EXTRAIR DADOS DA MODAL → ESTRUTURA
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Extrair dados de características do modal
     * 
     * @returns {Object} Objeto com dados de características
     */
    extrairCaracteristicasDoModal() {
        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error('❌ Modal não encontrada');
            return null;
        }

        console.log('📥 Extraindo características do modal...');

        try {
            const caracteristicas = {
                // --- Informações Básicas ---
                nome: modal.querySelector('#comp-char-nome')?.value || '',
                tipo: modal.querySelector('#comp-char-tipo')?.value || 'Mascote',
                nivel: parseInt(modal.querySelector('#comp-char-nivel-input')?.value || 1),
                raca: modal.querySelector('#comp-char-raca')?.value || 'Desconhecida',
                pontosDistribuir: parseInt(modal.querySelector('#comp-char-pontos-display')?.textContent || 0),
                
                // --- Descrição e Notas ---
                descricao: modal.querySelector('#comp-char-descricao')?.value || '',
                notas: modal.querySelector('#comp-char-notas')?.value || '',
                
                // --- Imagem ---
                imagem: this.extrairImagemDoModal(modal),
                
                // --- Atributos Primários ---
                atributosPrimarios: this.extrairAtributosPrimarios(modal),
                
                // --- Atributos Secundários ---
                atributosSecundarios: this.extrairAtributosSecundarios(modal),
                
                // --- Status (Barras) ---
                status: this.extrairStatus(modal)
            };

            console.log('✅ Características extraídas com sucesso:', caracteristicas);
            return caracteristicas;
        } catch (erro) {
            console.error('❌ Erro ao extrair características:', erro);
            return null;
        }
    }

    /**
     * Extrair dados de imagem do modal
     * 
     * @param {Element} modal - Elemento da modal
     * @returns {Object} Dados de imagem
     */
    extrairImagemDoModal(modal) {
        const inputUrl = modal.querySelector('#comp-char-imagem-url')?.value;
        const imagemPreview = modal.querySelector('#comp-char-imagem-preview img');
        
        return {
            imagemId: null,  // Será preenchido pelo manager se for do IndexedDB
            versao: 1,
            url: inputUrl || null,
            preview: imagemPreview?.src || null
        };
    }

    /**
     * Extrair atributos primários do modal
     * 
     * @param {Element} modal - Elemento da modal
     * @returns {Object} Atributos primários
     */
    extrairAtributosPrimarios(modal) {
        const atributos = ['forca', 'vitalidade', 'agilidade', 'inteligencia', 'sabedoria', 'carisma'];
        const resultado = {};

        atributos.forEach(attr => {
            const base = parseInt(modal.querySelector(`#comp-char-${attr}-base`)?.value || 0);
            const extra = parseInt(modal.querySelector(`#comp-char-${attr}-extra`)?.value || 0);
            const total = parseInt(modal.querySelector(`#comp-char-${attr}-total`)?.textContent || 0);
            const bonus = parseInt(modal.querySelector(`#comp-char-${attr}-bonus`)?.textContent || 0);

            resultado[attr] = { base, extra, total, bonus };
        });

        return resultado;
    }

    /**
     * Extrair atributos secundários do modal
     * 
     * @param {Element} modal - Elemento da modal
     * @returns {Object} Atributos secundários
     */
    extrairAtributosSecundarios(modal) {
        const atributos = ['prontidao', 'ataque', 'defesa', 'reacao', 'precisao', 'evasao'];
        const resultado = {};

        atributos.forEach(attr => {
            const base = parseInt(modal.querySelector(`#comp-char-${attr}-base`)?.value || 0);
            const extra = parseInt(modal.querySelector(`#comp-char-${attr}-extra`)?.value || 0);
            const total = parseInt(modal.querySelector(`#comp-char-${attr}-total`)?.textContent || 0);
            const bonus = parseInt(modal.querySelector(`#comp-char-${attr}-bonus`)?.textContent || 0);

            resultado[attr] = { base, extra, total, bonus };
        });

        return resultado;
    }

    /**
     * Extrair dados de status (barras) do modal
     * 
     * @param {Element} modal - Elemento da modal
     * @returns {Object} Dados de status
     */
    extrairStatus(modal) {
        const barras = ['saude', 'energia', 'fadiga'];
        const resultado = {};

        barras.forEach(barra => {
            const atual = parseInt(modal.querySelector(`#comp-char-${barra}-valor`)?.value || 0);
            const maxima = parseInt(modal.querySelector(`#comp-char-${barra}-maxima`)?.value || 100);
            const extra = parseInt(modal.querySelector(`#comp-char-${barra}-extra`)?.value || 0);
            const bonus = parseInt(modal.querySelector(`#comp-char-${barra}-bonus`)?.value || 0);

            resultado[barra] = { atual, maxima, extra, bonus };
        });

        return resultado;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🔄 SINCRONIZAR PARA GLOBALSTATE
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Sincronizar dados de um companheiro para GlobalState
     * 
     * @param {Object} companheiro - Dados do companheiro
     * @returns {boolean} true se sucesso
     */
    sincronizarCompanheiroParaGlobalState(companheiro) {
        if (!companheiro || !companheiro.id) {
            console.warn('⚠️ Companheiro inválido para sincronização');
            return false;
        }

        console.log(`🔄 Sincronizando companheiro ${companheiro.id} para GlobalState...`);

        try {
            // Obter lista de companheiros atual
            const listaAtual = window.globalState.getPart('companheiros.lista') || [];
            
            // Encontrar ou criar índice
            const indice = listaAtual.findIndex(c => c.id === companheiro.id);
            
            if (indice >= 0) {
                // Edição: mesclar com dados existentes
                console.log(`  ✏️ Atualizando companheiro existente no índice ${indice}`);
                listaAtual[indice] = { ...listaAtual[indice], ...companheiro };
            } else {
                // Novo: adicionar à lista
                console.log(`  ➕ Adicionando novo companheiro à lista`);
                listaAtual.push(companheiro);
            }

            // Atualizar GlobalState
            window.globalState.updatePart('companheiros.lista', listaAtual);
            window.globalState.updatePart('companheiros.totalCompanheiros', listaAtual.length);
            
            console.log(`✅ Companheiro sincronizado com GlobalState`);
            return true;
        } catch (erro) {
            console.error('❌ Erro ao sincronizar companheiro:', erro);
            return false;
        }
    }

    /**
     * Sincronizar todas as características de um companheiro para GlobalState
     * 
     * @param {string} companheiroId - ID do companheiro
     * @returns {boolean} true se sucesso
     */
    sincronizarCaracteristicasParaGlobalState(companheiroId) {
        const caracteristicas = this.extrairCaracteristicasDoModal();
        
        if (!caracteristicas) {
            console.error('❌ Não foi possível extrair características da modal');
            return false;
        }

        console.log(`🔄 Sincronizando características do companheiro ${companheiroId}...`);

        try {
            const caminhoCaracteristicas = `companheiros.lista[${this.encontrarIndiceCompanheiro(companheiroId)}].caracteristicas`;
            window.globalState.updatePart(caminhoCaracteristicas, caracteristicas);
            
            console.log(`✅ Características sincronizadas com sucesso`);
            return true;
        } catch (erro) {
            console.error('❌ Erro ao sincronizar características:', erro);
            return false;
        }
    }

    /**
     * Encontrar índice de um companheiro na lista
     * 
     * @param {string} companheiroId - ID do companheiro
     * @returns {number} Índice ou -1 se não encontrado
     */
    encontrarIndiceCompanheiro(companheiroId) {
        const lista = window.globalState.getPart('companheiros.lista') || [];
        return lista.findIndex(c => c.id === companheiroId);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 📥 CARREGAR DO GLOBALSTATE → MODAL
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Carregar características do GlobalState para modal
     * 
     * @param {string} companheiroId - ID do companheiro
     * @returns {Object|null} Dados carregados ou null
     */
    carregarCaracteristicasDoGlobalState(companheiroId) {
        console.log(`📥 Carregando características do companheiro ${companheiroId} de GlobalState...`);

        try {
            const lista = window.globalState.getPart('companheiros.lista') || [];
            const companheiro = lista.find(c => c.id === companheiroId);

            if (!companheiro || !companheiro.caracteristicas) {
                console.warn('⚠️ Características não encontradas no GlobalState');
                return null;
            }

            console.log('✅ Características carregadas:', companheiro.caracteristicas);
            return companheiro.caracteristicas;
        } catch (erro) {
            console.error('❌ Erro ao carregar características:', erro);
            return null;
        }
    }

    /**
     * Preenchero modal com dados do GlobalState
     * 
     * @param {string} companheiroId - ID do companheiro
     * @returns {boolean} true se sucesso
     */
    preencherModalDoGlobalState(companheiroId) {
        const caracteristicas = this.carregarCaracteristicasDoGlobalState(companheiroId);
        
        if (!caracteristicas) {
            console.error('❌ Não foi possível carregar características');
            return false;
        }

        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error('❌ Modal não encontrada');
            return false;
        }

        console.log('📝 Preenchendo modal com dados do GlobalState...');

        try {
            // --- Informações Básicas ---
            const inputNome = modal.querySelector('#comp-char-nome');
            if (inputNome) inputNome.value = caracteristicas.nome || '';

            const inputTipo = modal.querySelector('#comp-char-tipo');
            if (inputTipo) inputTipo.value = caracteristicas.tipo || 'Mascote';

            const inputNivel = modal.querySelector('#comp-char-nivel-input');
            if (inputNivel) inputNivel.value = caracteristicas.nivel || 1;

            const inputRaca = modal.querySelector('#comp-char-raca');
            if (inputRaca) inputRaca.value = caracteristicas.raca || 'Desconhecida';

            // --- Descrição e Notas ---
            const inputDescricao = modal.querySelector('#comp-char-descricao');
            if (inputDescricao) inputDescricao.value = caracteristicas.descricao || '';

            const inputNotas = modal.querySelector('#comp-char-notas');
            if (inputNotas) inputNotas.value = caracteristicas.notas || '';

            // --- Atributos Primários ---
            this.preencherAtributosPrimarios(modal, caracteristicas.atributosPrimarios);

            // --- Atributos Secundários ---
            this.preencherAtributosSecundarios(modal, caracteristicas.atributosSecundarios);

            // --- Status ---
            this.preencherStatus(modal, caracteristicas.status);

            console.log('✅ Modal preenchida com sucesso');
            return true;
        } catch (erro) {
            console.error('❌ Erro ao preencher modal:', erro);
            return false;
        }
    }

    /**
     * Preencher atributos primários na modal
     * 
     * @param {Element} modal - Elemento da modal
     * @param {Object} atributos - Dados de atributos primários
     */
    preencherAtributosPrimarios(modal, atributos) {
        Object.keys(atributos || {}).forEach(attr => {
            const dados = atributos[attr];
            
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            if (inputBase) inputBase.value = dados.base || 0;

            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            if (inputExtra) inputExtra.value = dados.extra || 0;
        });

        console.log('✅ Atributos primários preenchidos');
    }

    /**
     * Preencher atributos secundários na modal
     * 
     * @param {Element} modal - Elemento da modal
     * @param {Object} atributos - Dados de atributos secundários
     */
    preencherAtributosSecundarios(modal, atributos) {
        Object.keys(atributos || {}).forEach(attr => {
            const dados = atributos[attr];
            
            const inputBase = modal.querySelector(`#comp-char-${attr}-base`);
            if (inputBase) inputBase.value = dados.base || 0;

            const inputExtra = modal.querySelector(`#comp-char-${attr}-extra`);
            if (inputExtra) inputExtra.value = dados.extra || 0;
        });

        console.log('✅ Atributos secundários preenchidos');
    }

    /**
     * Preencher status (barras) na modal
     * 
     * @param {Element} modal - Elemento da modal
     * @param {Object} status - Dados de status
     */
    preencherStatus(modal, status) {
        Object.keys(status || {}).forEach(barra => {
            const dados = status[barra];
            
            const inputValor = modal.querySelector(`#comp-char-${barra}-valor`);
            if (inputValor) inputValor.value = dados.atual || 0;

            const inputMaxima = modal.querySelector(`#comp-char-${barra}-maxima`);
            if (inputMaxima) inputMaxima.value = dados.maxima || 100;

            const inputExtra = modal.querySelector(`#comp-char-${barra}-extra`);
            if (inputExtra) inputExtra.value = dados.extra || 0;

            const inputBonus = modal.querySelector(`#comp-char-${barra}-bonus`);
            if (inputBonus) inputBonus.value = dados.bonus || 0;
        });

        console.log('✅ Status preenchido');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 💾 GERAR DADOS PARA SALVAR/IMPORTAR
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Obter dados de características para salvar em JSON
     * 
     * @param {string} companheiroId - ID do companheiro
     * @returns {Object} Dados para salvar
     */
    obterDadosParaSalvar(companheiroId) {
        const indice = this.encontrarIndiceCompanheiro(companheiroId);
        
        if (indice < 0) {
            console.error(`❌ Companheiro ${companheiroId} não encontrado`);
            return null;
        }

        try {
            const dados = window.globalState.getPart(`companheiros.lista[${indice}]`);
            console.log(`✅ Dados obtidos para salvar: ${companheiroId}`);
            return dados;
        } catch (erro) {
            console.error('❌ Erro ao obter dados para salvar:', erro);
            return null;
        }
    }

    /**
     * Obter todos os companheiros para salvar em JSON
     * 
     * @returns {Array} Lista de companheiros
     */
    obterTodosParaSalvar() {
        try {
            const lista = window.globalState.getPart('companheiros.lista') || [];
            console.log(`✅ ${lista.length} companheiros obtidos para salvar`);
            return lista;
        } catch (erro) {
            console.error('❌ Erro ao obter companheiros:', erro);
            return [];
        }
    }

    /**
     * Validar estrutura de características antes de salvar
     * 
     * @param {Object} caracteristicas - Dados de características
     * @returns {boolean} true se válido
     */
    validarCaracteristicas(caracteristicas) {
        const camprosObrigatorios = ['nome', 'tipo', 'nivel', 'atributosPrimarios', 'status'];
        
        for (const campo of camprosObrigatorios) {
            if (!(campo in caracteristicas)) {
                console.error(`❌ Campo obrigatório ausente: ${campo}`);
                return false;
            }
        }

        console.log('✅ Características válidas');
        return true;
    }
}

/**
 * INSTÂNCIA GLOBAL ÚNICA
 * Criada após GlobalState
 */
if (typeof window !== 'undefined') {
    window.companheiroCaracteristicasSync = new CompanheiroCaracteristicasSync();
    console.log('✅ CompanheiroCaracteristicasSync inicializado');
}
